import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { verifyFcargoWebhookSignature } from "@/lib/fcargo/webhook-verify";
import { logFcargoRequest } from "@/lib/fcargo/log";
import { ingestFcargoWebhook } from "@/lib/fcargo/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      { ok: false, error: "webhook_secret_not_configured" },
      { status: 503 },
    );
  }

  // Signature must be checked against raw bytes (do not re-serialize).
  const rawBody = await request.text().catch(() => "");
  const signatureHeader =
    request.headers.get("x-fcargo-signature") ||
    request.headers.get("X-FCargo-Signature") ||
    "";

  const hmacOk = signatureHeader
    ? verifyFcargoWebhookSignature(rawBody, signatureHeader, expected)
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
    return NextResponse.json({ received: false, error: "unauthorized" }, { status: 401 });
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

  const result = await ingestFcargoWebhook(body);

  logFcargoRequest({
    direction: "in",
    method: "POST",
    path: "/api/fcargo/webhook",
    httpStatus: 200,
    ok: true,
    leadId: result.leadId,
    orderId: result.package?.fcargo_order_id ?? undefined,
    trackingNumber: result.package?.tracking_number ?? undefined,
    requestBody: body,
    responseBody: {
      received: true,
      leadApplied: result.leadApplied,
      eventType: result.eventType ?? eventType,
      packageId: result.package?.id,
    },
  });

  return NextResponse.json({
    received: true,
    ok: true,
    applied: result.leadApplied,
    leadId: result.leadId ?? null,
    fcargoStatus: result.fcargoStatus ?? null,
    crmStatus: result.crmStatus ?? null,
    message: result.message ?? null,
    eventType: result.eventType ?? eventType ?? null,
    packageId: result.package?.id ?? null,
    cataloged: Boolean(result.package),
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-webhook",
    hint: "POST events; auth via X-FCargo-Signature (HMAC) or legacy X-Fcargo-Webhook-Secret",
  });
}
