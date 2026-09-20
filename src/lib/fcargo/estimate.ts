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
 * Falls back (caller) to CMS matrix when not configured or request fails.
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

  const weight =
    input.weightKg && input.weightKg > 0
      ? input.weightKg
      : input.lengthCm && input.widthCm && input.heightCm
        ? undefined
        : 1;

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
    weight: weight ?? 1,
  };

  if (input.lengthCm && input.lengthCm > 0) body.length = input.lengthCm;
  if (input.widthCm && input.widthCm > 0) body.width = input.widthCm;
  if (input.heightCm && input.heightCm > 0) body.height = input.heightCm;

  // Prefer volumetric-only when mass unknown but dims present.
  if ((!input.weightKg || input.weightKg <= 0) && body.length && body.width && body.height) {
    // OpenAPI requires weight; send computed volumetric hint (divisor 5000) as weight floor.
    const vol = (body.length * body.width * body.height) / 5000;
    body.weight = Math.max(0.1, Number(vol.toFixed(2)));
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
