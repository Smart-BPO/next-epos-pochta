import { after } from "next/server";
import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { verifyFcargoWebhookSignature } from "@/lib/fcargo/webhook-verify";
import {
  enqueueFcargoWebhook,
  processFcargoWebhookInbox,
  resolveFcargoEventId,
} from "@/lib/fcargo/webhook-inbox";
import { logFcargoHttpExchange } from "@/lib/fcargo/log-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

/** Legacy shared-secret header (our pull sync / older docs). */
function extractLegacySecret(request: Request): string {
  const header =
    request.headers.get("x-fcargo-webhook-secret") ||
    request.headers.get("X-Fcargo-Webhook-Secret") ||
    "";
  if (header.trim()) return header.trim();

  const auth = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return m?.[1]?.trim() || "";
}

function eventTypeFromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const data =
    o.data && typeof o.data === "object"
      ? (o.data as Record<string, unknown>)
      : null;
  for (const v of [o.type, o.event, o.event_type, data?.event, data?.type]) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function trackingFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const o = body as Record<string, unknown>;
  const data =
    o.data && typeof o.data === "object"
      ? (o.data as Record<string, unknown>)
      : null;
  const pkg =
    data?.package && typeof data.package === "object"
      ? (data.package as Record<string, unknown>)
      : null;
  const tn = pkg?.tracking_number ?? data?.tracking_number;
  return typeof tn === "string" ? tn : undefined;
}

export async function POST(request: Request) {
  const started = Date.now();
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    const resBody = { received: false, error: "webhook_secret_not_configured" };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      responseStatus: 503,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "webhook_secret_not_configured",
    });
    return NextResponse.json(resBody, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    const resBody = { received: false, error: "payload_too_large" };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      responseStatus: 413,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "payload_too_large",
    });
    return NextResponse.json(resBody, { status: 413 });
  }

  // Signature must be checked against raw bytes (do not re-serialize).
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > MAX_BODY_BYTES) {
    const resBody = { received: false, error: "payload_too_large" };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      rawBody,
      responseStatus: 413,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "payload_too_large",
    });
    return NextResponse.json(resBody, { status: 413 });
  }

  const signatureHeader =
    request.headers.get("x-fcargo-signature") ||
    request.headers.get("X-FCargo-Signature") ||
    "";

  const hmacOk = signatureHeader
    ? verifyFcargoWebhookSignature(rawBody, signatureHeader, expected, {
        previousSecret: process.env.FCARGO_WEBHOOK_SECRET_PREVIOUS ?? null,
      })
    : false;
  const legacyOk = !hmacOk
    ? (() => {
        const provided = extractLegacySecret(request);
        return Boolean(provided && timingSafeEqualString(provided, expected));
      })()
    : false;

  if (!hmacOk && !legacyOk) {
    const resBody = { received: false, error: "unauthorized" };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      rawBody,
      responseStatus: 401,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: signatureHeader
        ? "invalid_webhook_signature"
        : "missing_or_invalid_webhook_auth",
    });
    return NextResponse.json(resBody, { status: 401 });
  }

  let body: unknown = null;
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { raw: rawBody };
    }
  }

  const eventType =
    request.headers.get("x-fcargo-event") ||
    request.headers.get("X-FCargo-Event") ||
    eventTypeFromBody(body);

  // Connectivity probe from FCargo dashboard — ack only.
  if (eventType === "webhook.test") {
    const resBody = { received: true };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      rawBody,
      responseStatus: 200,
      responseBody: { ...resBody, eventType: "webhook.test" },
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: true,
    });
    return NextResponse.json(resBody);
  }

  const deliveryId =
    request.headers.get("x-fcargo-delivery-id") ||
    request.headers.get("X-FCargo-Delivery-Id") ||
    null;
  const headerEventId =
    request.headers.get("x-fcargo-event-id") ||
    request.headers.get("X-FCargo-Event-Id") ||
    null;

  const eventId = resolveFcargoEventId({
    headerEventId,
    deliveryId,
    payload: body,
    rawBody,
  });

  const queued = await enqueueFcargoWebhook({
    eventId,
    deliveryId,
    eventType,
    payload: body,
  });

  if (!queued) {
    const resBody = { received: false, error: "enqueue_failed" };
    logFcargoHttpExchange({
      source: "in_webhook",
      request,
      rawBody,
      responseStatus: 503,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "inbox_unavailable",
      correlationId: eventId,
      trackingNumber: trackingFromBody(body),
    });
    // Non-2xx so FCargo retries (durable path failed).
    return NextResponse.json(resBody, { status: 503 });
  }

  after(() =>
    processFcargoWebhookInbox({ limit: 5 }).catch((e) => {
      console.warn(
        "[fcargo:webhook:after]",
        e instanceof Error ? e.message : "drain_failed",
      );
    }),
  );

  const resBody = { received: true };
  logFcargoHttpExchange({
    source: "in_webhook",
    request,
    rawBody,
    responseStatus: 200,
    responseBody: {
      ...resBody,
      queued: true,
      inserted: queued.inserted,
      eventId: queued.eventId,
      eventType: eventType ?? null,
    },
    responseHeaders: { "content-type": "application/json" },
    durationMs: Date.now() - started,
    ok: true,
    correlationId: queued.eventId,
    trackingNumber: trackingFromBody(body),
  });

  return NextResponse.json(resBody);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-webhook",
    hint: "POST events; verify → enqueue → 200; process via after()/POST /api/fcargo/drain/",
  });
}
