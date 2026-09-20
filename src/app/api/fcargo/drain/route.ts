import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { processFcargoWebhookInbox } from "@/lib/fcargo/webhook-inbox";
import { logFcargoHttpExchange } from "@/lib/fcargo/log-http";
import { pruneFcargoRequestLog } from "@/lib/fcargo/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractSecret(request: Request): string {
  const header =
    request.headers.get("x-fcargo-sync-secret") ||
    request.headers.get("x-fcargo-webhook-secret") ||
    request.headers.get("X-Fcargo-Webhook-Secret") ||
    "";
  if (header.trim()) return header.trim();
  const auth = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return m?.[1]?.trim() || "";
}

/**
 * Safety-net worker for the webhook inbox (Hostinger cron every 1–5 min).
 * Also prunes epos_fcargo_request_log older than 30 days.
 * Auth: same shared secret as /api/fcargo/sync/.
 */
export async function POST(request: Request) {
  const started = Date.now();
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    const resBody = { ok: false, error: "drain_secret_not_configured" };
    logFcargoHttpExchange({
      source: "in_drain",
      request,
      responseStatus: 503,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "drain_secret_not_configured",
    });
    return NextResponse.json(resBody, { status: 503 });
  }

  const provided = extractSecret(request);
  if (!provided || !timingSafeEqualString(provided, expected)) {
    const resBody = { ok: false, error: "unauthorized" };
    logFcargoHttpExchange({
      source: "in_drain",
      request,
      responseStatus: 401,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "unauthorized",
    });
    return NextResponse.json(resBody, { status: 401 });
  }

  let limit = 20;
  let rawBody: string | null = null;
  try {
    rawBody = await request.text();
    const json = rawBody
      ? (JSON.parse(rawBody) as { limit?: number } | null)
      : null;
    if (json?.limit && Number.isFinite(json.limit)) {
      limit = Math.max(1, Math.min(50, Number(json.limit)));
    }
  } catch {
    // ignore
  }

  const result = await processFcargoWebhookInbox({ limit });
  const pruned = await pruneFcargoRequestLog(30, 5000);
  const resBody = { ok: true, ...result, pruned };
  logFcargoHttpExchange({
    source: "in_drain",
    request,
    rawBody,
    responseStatus: 200,
    responseBody: resBody,
    responseHeaders: { "content-type": "application/json" },
    durationMs: Date.now() - started,
    ok: true,
  });

  return NextResponse.json(resBody);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-drain",
    hint: "POST with X-Fcargo-Webhook-Secret to process pending webhook inbox jobs",
  });
}
