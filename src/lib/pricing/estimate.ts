/**
 * Non-binding client-side delivery estimate.
 * Not a tariff — manager confirms final price after the lead.
 */

export const ESTIMATE_FORMULA_VERSION = "2026-09-v3";

export type EstimateZone = "same_city" | "same_region" | "inter_region";

export interface EstimateInput {
  fromRegionId: string;
  fromCityId: string;
  toRegionId: string;
  toCityId: string;
  weightKg: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  unknownDims: boolean;
  pickup: boolean;
  doorDelivery: boolean;
  places: number;
  urgent: boolean;
  category?: string;
}

export interface QuoteEstimate {
  /** Exact calculated amount for the entered params (still confirmed by manager). */
  amount: number;
  /** @deprecated use amount */
  min: number;
  /** @deprecated use amount */
  max: number;
  currency: "UZS";
  etaDays: number;
  /** @deprecated use etaDays */
  etaDaysMin: number;
  /** @deprecated use etaDays */
  etaDaysMax: number;
  zone: EstimateZone;
  billableKg: number;
  formulaVersion: string;
}

const VOLUMETRIC_DIVISOR = 5000;

const ZONE_BASE: Record<EstimateZone, number> = {
  same_city: 25_000,
  same_region: 35_000,
  inter_region: 55_000,
};

const ZONE_PER_KG: Record<EstimateZone, number> = {
  same_city: 3_000,
  same_region: 4_500,
  inter_region: 7_000,
};

const ZONE_ETA: Record<EstimateZone, { min: number; max: number }> = {
  same_city: { min: 1, max: 2 },
  same_region: { min: 1, max: 3 },
  inter_region: { min: 2, max: 5 },
};

const PICKUP_SURCHARGE = 12_000;
const DOOR_SURCHARGE = 15_000;
const URGENT_MULTIPLIER = 1.35;
const PLACE_SURCHARGE = 5_000;

const CATEGORY_FACTOR: Record<string, number> = {
  documents: 0.85,
  parcel: 1,
  goods: 1.05,
  other: 1,
};

export function resolveZone(input: {
  fromRegionId: string;
  fromCityId: string;
  toRegionId: string;
  toCityId: string;
}): EstimateZone {
  if (input.fromCityId && input.fromCityId === input.toCityId) {
    return "same_city";
  }
  if (input.fromRegionId && input.fromRegionId === input.toRegionId) {
    return "same_region";
  }
  return "inter_region";
}

export function volumetricKg(
  lengthCm: number | null,
  widthCm: number | null,
  heightCm: number | null,
): number | null {
  if (
    lengthCm == null ||
    widthCm == null ||
    heightCm == null ||
    lengthCm <= 0 ||
    widthCm <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  return (lengthCm * widthCm * heightCm) / VOLUMETRIC_DIVISOR;
}

export function billableWeightKg(input: EstimateInput): number {
  // Use the entered mass only — dimensions do not override weight.
  if (input.weightKg == null || input.weightKg <= 0) {
    return 1;
  }
  return input.weightKg;
}

function roundToHundred(n: number) {
  return Math.round(n / 100) * 100;
}

export function estimateQuote(input: EstimateInput): QuoteEstimate {
  const zone = resolveZone(input);
  const billable = billableWeightKg(input);
  const places = Math.max(1, Math.floor(input.places) || 1);
  const categoryFactor = CATEGORY_FACTOR[input.category ?? "parcel"] ?? 1;

  let mid =
    ZONE_BASE[zone] +
    ZONE_PER_KG[zone] * billable +
    (places - 1) * PLACE_SURCHARGE;

  if (input.pickup) mid += PICKUP_SURCHARGE;
  if (input.doorDelivery) mid += DOOR_SURCHARGE;
  if (input.urgent) mid *= URGENT_MULTIPLIER;
  mid *= categoryFactor;

  const amount = roundToHundred(mid);
  const eta = ZONE_ETA[zone];
  const etaDays = input.urgent
    ? Math.max(1, eta.min)
    : Math.max(eta.min, Math.round((eta.min + eta.max) / 2));

  return {
    amount,
    min: amount,
    max: amount,
    currency: "UZS",
    etaDays,
    etaDaysMin: etaDays,
    etaDaysMax: etaDays,
    zone,
    billableKg: Math.round(billable * 10) / 10,
    formulaVersion: ESTIMATE_FORMULA_VERSION,
  };
}

export function formatUzs(amount: number, locale: "uz" | "ru"): string {
  return new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : "ru-RU").format(
    amount,
  );
}
