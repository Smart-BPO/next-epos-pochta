import { NextResponse } from "next/server";
import { lookupShipment } from "@/lib/tracking/lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit = 20) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    if (rateMap.size > 5000) rateMap.clear();
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

const STATUS_BY_ERROR = {
  invalid_format: 400,
  not_found: 404,
  rate_limited: 429,
  unavailable: 503,
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const number = url.searchParams.get("number") ?? "";
  const locale = url.searchParams.get("locale") === "ru" ? "ru" : "uz";

  if (!checkRateLimit(`track:${clientKey(request)}`)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await lookupShipment(number, locale);
  return NextResponse.json(result, {
    status: result.ok ? 200 : STATUS_BY_ERROR[result.error ?? "unavailable"],
    headers: { "Cache-Control": "no-store" },
  });
}
