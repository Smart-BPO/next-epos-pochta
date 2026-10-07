import "server-only";

import {
  fcargoCalculatePrice,
  hasFcargoConfig,
} from "@/lib/fcargo/client";
import { resolveSettlementSoato } from "@/lib/fcargo/locations";
import type {
  FcargoPricingQuote,
  FcargoPricingRequest,
} from "@/lib/fcargo/types";
import type { EstimateInput, QuoteEstimate } from "@/lib/pricing/estimate";
import { resolveZone } from "@/lib/pricing/estimate";

/** FCargo rate-limits pricing (~10 req burst → 429); quotes are stable per tariff. */
const QUOTE_TTL_MS = 10 * 60 * 1000;
const QUOTE_CACHE_MAX = 500;
const quoteCache = new Map<string, { at: number; quote: FcargoPricingQuote }>();

function cachedQuote(key: string): FcargoPricingQuote | null {
  const hit = quoteCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > QUOTE_TTL_MS) {
    quoteCache.delete(key);
    return null;
  }
  return hit.quote;
}

function rememberQuote(key: string, quote: FcargoPricingQuote) {
  if (quoteCache.size >= QUOTE_CACHE_MAX) {
    const oldest = quoteCache.keys().next().value;
    if (oldest) quoteCache.delete(oldest);
  }
  quoteCache.set(key, { at: Date.now(), quote });
}

/**
 * Builds the pricing body exactly the way Create Order resolves addresses
 * (region + district SOATO strings), so the quote matches the order price.
 */
export async function buildFcargoPricingRequest(
  input: Pick<
    EstimateInput,
    | "fromCityId"
    | "fromRegionId"
    | "toCityId"
    | "toRegionId"
    | "weightKg"
    | "lengthCm"
    | "widthCm"
    | "heightCm"
  >,
): Promise<FcargoPricingRequest | null> {
  const [from, to] = await Promise.all([
    resolveSettlementSoato({
      settlementId: input.fromCityId,
      regionId: input.fromRegionId,
    }),
    resolveSettlementSoato({
      settlementId: input.toCityId,
      regionId: input.toRegionId,
    }),
  ]);
  if (!from || !to) return null;

  const hasDims =
    Boolean(input.lengthCm && input.lengthCm > 0) &&
    Boolean(input.widthCm && input.widthCm > 0) &&
    Boolean(input.heightCm && input.heightCm > 0);
  const hasWeight = Boolean(input.weightKg && input.weightKg > 0);

  const body: FcargoPricingRequest = {
    from_region_soato: from.regionSoato,
    to_region_soato: to.regionSoato,
  };
  if (from.districtSoato) body.from_district_soato = from.districtSoato;
  if (to.districtSoato) body.to_district_soato = to.districtSoato;

  // OpenAPI: weight or all three dims; with both the server bills the larger.
  if (hasWeight) body.weight = input.weightKg!;
  if (hasDims) {
    body.length = input.lengthCm!;
    body.width = input.widthCm!;
    body.height = input.heightCm!;
  }
  if (!hasWeight && !hasDims) body.weight = 1;

  return body;
}

/** Non-binding quote via FCargo Client API (server-to-server). */
export async function estimateViaFcargo(
  input: EstimateInput,
): Promise<QuoteEstimate | null> {
  if (!(await hasFcargoConfig())) return null;

  const body = await buildFcargoPricingRequest(input);
  if (!body) return null;

  const key = JSON.stringify(body);
  let q = cachedQuote(key);
  if (!q) {
    const result = await fcargoCalculatePrice(body);
    if (!result.ok || !result.data) {
      console.warn(
        "[fcargo:estimate]",
        result.ok === false ? `${result.code} ${result.message}` : "empty",
      );
      return null;
    }
    q = result.data;
    rememberQuote(key, q);
  }

  const amount = Math.round(Number(q.total) || 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const eta =
    typeof q.eta_days === "number" && q.eta_days > 0
      ? Math.round(q.eta_days)
      : typeof q.eta_max === "number" && q.eta_max > 0
        ? Math.round(q.eta_max)
        : typeof q.eta_min === "number" && q.eta_min > 0
          ? Math.round(q.eta_min)
          : 3;

  const billableKg =
    typeof q.billable_weight === "number" && q.billable_weight > 0
      ? q.billable_weight
      : (body.weight ?? 1);

  return {
    amount,
    min: amount,
    max: amount,
    currency: "UZS",
    etaDays: eta,
    etaDaysMin: eta,
    etaDaysMax: eta,
    zone: resolveZone(input),
    billableKg,
    formulaVersion: "fcargo-client-v2",
    rateSource: "fcargo",
  };
}
