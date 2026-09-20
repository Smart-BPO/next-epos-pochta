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
import { logFcargoRequest } from "@/lib/fcargo/log";

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

export async function POST(request: Request) {
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    return NextResponse.json(
      { received: false, error: "webhook_secret_not_configured" },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { received: false, error: "payload_too_large" },
      { status: 413 },
    );
  }

  // Signature must be checked against raw bytes (do not re-serialize).
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { received: false, error: "payload_too_large" },
      { status: 413 },
    );
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
    logFcargoRequest({
      direction: "in",
      method: "POST",
      path: "/api/fcargo/webhook",
      httpStatus: 401,
      ok: false,
      errorCode: "UNAUTHORIZED",
      errorMessage: signatureHeader
        ? "invalid_webhook_signature"
        : "missing_or_invalid_webhook_auth",
    });
    return NextResponse.json(
      { received: false, error: "unauthorized" },
      { status: 401 },
    );
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
    logFcargoRequest({
      direction: "in",
      method: "POST",
      path: "/api/fcargo/webhook",
      httpStatus: 200,
      ok: true,
      requestBody: body,
      responseBody: { received: true, eventType: "webhook.test" },
    });
    return NextResponse.json({ received: true });
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
    logFcargoRequest({
      direction: "in",
      method: "POST",
      path: "/api/fcargo/webhook",
      httpStatus: 503,
      ok: false,
      errorCode: "ENQUEUE_FAILED",
      errorMessage: "inbox_unavailable",
      requestBody: body,
    });
    // Non-2xx so FCargo retries (durable path failed).
    return NextResponse.json(
      { received: false, error: "enqueue_failed" },
      { status: 503 },
    );
  }

  after(() =>
    processFcargoWebhookInbox({ limit: 5 }).catch((e) => {
      console.warn(
        "[fcargo:webhook:after]",
        e instanceof Error ? e.message : "drain_failed",
      );
    }),
  );

  logFcargoRequest({
    direction: "in",
    method: "POST",
    path: "/api/fcargo/webhook",
    httpStatus: 200,
    ok: true,
    trackingNumber:
      body && typeof body === "object"
        ? (() => {
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
          })()
        : undefined,
    requestBody: body,
    responseBody: {
      received: true,
      queued: true,
      inserted: queued.inserted,
      eventId: queued.eventId,
      eventType: eventType ?? null,
    },
  });

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-webhook",
    hint: "POST events; verify → enqueue → 200; process via after()/POST /api/fcargo/drain/",
  });
}
