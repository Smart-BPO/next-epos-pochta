import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { syncOpenFcargoOrders } from "@/lib/fcargo/sync-status";
import { logFcargoHttpExchange } from "@/lib/fcargo/log-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractSecret(request: Request): string {
  const header =
    request.headers.get("x-fcargo-sync-secret") ||
    request.headers.get("x-fcargo-webhook-secret") ||
    "";
  if (header.trim()) return header.trim();
  const auth = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return m?.[1]?.trim() || "";
}

export async function POST(request: Request) {
  const started = Date.now();
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    const resBody = { ok: false, error: "sync_secret_not_configured" };
    logFcargoHttpExchange({
      source: "in_sync",
      request,
      responseStatus: 503,
      responseBody: resBody,
      responseHeaders: { "content-type": "application/json" },
      durationMs: Date.now() - started,
      ok: false,
      error: "sync_secret_not_configured",
    });
    return NextResponse.json(resBody, { status: 503 });
  }

  const provided = extractSecret(request);
  if (!provided || !timingSafeEqualString(provided, expected)) {
    const resBody = { ok: false, error: "unauthorized" };
    logFcargoHttpExchange({
      source: "in_sync",
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

  let limit = 40;
  let rawBody: string | null = null;
  try {
    rawBody = await request.text();
    const json = rawBody
      ? (JSON.parse(rawBody) as { limit?: number } | null)
      : null;
    if (json?.limit && Number.isFinite(json.limit)) {
      limit = Math.max(1, Math.min(100, Number(json.limit)));
    }
  } catch {
    // ignore
  }

  const result = await syncOpenFcargoOrders({ limit });
  const resBody = { ok: true, ...result };
  logFcargoHttpExchange({
    source: "in_sync",
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
    service: "fcargo-sync",
    hint: "POST with X-Fcargo-Webhook-Secret to pull open order statuses",
  });
}
