import { NextResponse } from "next/server";
import { getSettlementById } from "@/data/settlements";
import type { EstimateInput } from "@/lib/pricing/estimate";
import { runEstimate } from "@/lib/pricing/settings";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit = 40) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

export async function POST(request: Request) {
  const ip = clientKey(request);
  if (!checkRateLimit(`estimate:${ip}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  let fromRegionId =
    typeof body.fromRegionId === "string" ? body.fromRegionId.trim() : "";
  let toRegionId =
    typeof body.toRegionId === "string" ? body.toRegionId.trim() : "";
  const fromCityId =
    typeof body.fromCityId === "string" ? body.fromCityId.trim() : "";
  const toCityId =
    typeof body.toCityId === "string" ? body.toCityId.trim() : "";

  if (!fromCityId || !toCityId) {
    return NextResponse.json({ error: "cities_required" }, { status: 400 });
  }

  if (!fromRegionId) {
    fromRegionId = getSettlementById(fromCityId)?.regionId ?? "";
  }
  if (!toRegionId) {
    toRegionId = getSettlementById(toCityId)?.regionId ?? "";
  }
  if (!fromRegionId || !toRegionId) {
    return NextResponse.json({ error: "invalid_cities" }, { status: 400 });
  }

  const input: EstimateInput = {
    fromRegionId,
    fromCityId,
    toRegionId,
    toCityId,
    weightKg: numOrNull(body.weightKg),
    lengthCm: numOrNull(body.lengthCm),
    widthCm: numOrNull(body.widthCm),
    heightCm: numOrNull(body.heightCm),
    unknownDims: bool(body.unknownDims),
    pickup: bool(body.pickup),
    doorDelivery: bool(body.doorDelivery),
    places: Math.max(1, Math.floor(numOrNull(body.places) ?? 1)),
    urgent: bool(body.urgent),
    category:
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "parcel",
  };

  const result = await runEstimate(input);
  if (!result.ok) {
    const status = result.error === "calculator_disabled" ? 503 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, estimate: result.estimate });
}
