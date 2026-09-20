import "server-only";

import {
  fcargoCalculatePrice,
  hasFcargoConfig,
} from "@/lib/fcargo/client";
import { soatoForSettlement } from "@/lib/fcargo/soato";
import type { EstimateInput, QuoteEstimate } from "@/lib/pricing/estimate";
import { resolveZone } from "@/lib/pricing/estimate";

/**
 * Non-binding quote via FCargo Client API (server-to-server).
 * Body shape matches OpenAPI POST /pricing/calculate:
 * { from_region_id, to_region_id, weight, length?, width?, height? }
 * where region ids are region SOATO integers (e.g. 1726).
 */
export async function estimateViaFcargo(
  input: EstimateInput,
): Promise<QuoteEstimate | null> {
  if (!(await hasFcargoConfig())) return null;

  const from = soatoForSettlement({
    settlementId: input.fromCityId,
    regionId: input.fromRegionId,
  });
  const to = soatoForSettlement({
    settlementId: input.toCityId,
    regionId: input.toRegionId,
  });
  if (!from || !to) return null;

  const hasDims =
    Boolean(input.lengthCm && input.lengthCm > 0) &&
    Boolean(input.widthCm && input.widthCm > 0) &&
    Boolean(input.heightCm && input.heightCm > 0);

  const hasWeight = Boolean(input.weightKg && input.weightKg > 0);

  // OpenAPI: either weight or all three dims; when both present server bills max.
  let weight: number;
  if (hasWeight) {
    weight = input.weightKg!;
  } else if (hasDims) {
    const vol =
      (input.lengthCm! * input.widthCm! * input.heightCm!) / 5000;
    weight = Math.max(0.1, Number(vol.toFixed(2)));
  } else {
    weight = 1;
  }

  const body: {
    from_region_id: number;
    to_region_id: number;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  } = {
    from_region_id: from.regionIdNum,
    to_region_id: to.regionIdNum,
    weight,
  };

  if (hasDims) {
    body.length = input.lengthCm!;
    body.width = input.widthCm!;
    body.height = input.heightCm!;
  }

  const result = await fcargoCalculatePrice(body);
  if (!result.ok || !result.data) {
    console.warn("[fcargo:estimate]", result.ok === false ? result.message : "empty");
    return null;
  }

  const q = result.data;
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

  const zone = resolveZone(input);
  const billableKg =
    typeof q.billable_weight === "number" && q.billable_weight > 0
      ? q.billable_weight
      : body.weight;

  return {
    amount,
    min: amount,
    max: amount,
    currency: "UZS",
    etaDays: eta,
    etaDaysMin: eta,
    etaDaysMax: eta,
    zone,
    billableKg,
    formulaVersion: "fcargo-client-v1",
    rateSource: "fcargo",
  };
}
