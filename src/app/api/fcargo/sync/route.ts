import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { syncOpenFcargoOrders } from "@/lib/fcargo/sync-status";
import { logFcargoRequest } from "@/lib/fcargo/log";

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
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "sync_secret_not_configured" },
      { status: 503 },
    );
  }

  const provided = extractSecret(request);
  if (!provided || !timingSafeEqualString(provided, expected)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let limit = 40;
  try {
    const json = (await request.json().catch(() => null)) as {
      limit?: number;
    } | null;
    if (json?.limit && Number.isFinite(json.limit)) {
      limit = Math.max(1, Math.min(100, Number(json.limit)));
    }
  } catch {
    // ignore
  }

  const started = Date.now();
  const result = await syncOpenFcargoOrders({ limit });
  logFcargoRequest({
    direction: "in",
    method: "POST",
    path: "/api/fcargo/sync",
    httpStatus: 200,
    durationMs: Date.now() - started,
    ok: true,
    responseBody: result,
  });

  return NextResponse.json({ ok: true, ...result });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-sync",
    hint: "POST with X-Fcargo-Webhook-Secret to pull open order statuses",
  });
}
