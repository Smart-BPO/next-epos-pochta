/**
 * Non-binding delivery estimate engine.
 * Not a tariff — manager confirms final price after the lead.
 */

import {
  DEFAULT_PRICING_CONFIG,
  ESTIMATE_FORMULA_VERSION,
  type EstimateZone,
  type PricingConfig,
  type PricingRateSource,
  type PricingRouteOverride,
  type PricingZoneRates,
} from "@/lib/pricing/types";

export type { EstimateZone, PricingRateSource } from "@/lib/pricing/types";
export { ESTIMATE_FORMULA_VERSION, DEFAULT_PRICING_CONFIG };

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
  rateSource: PricingRateSource;
}

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

export function findRouteOverride(
  routes: PricingRouteOverride[] | undefined,
  fromCityId: string,
  toCityId: string,
): PricingRouteOverride | null {
  if (!routes?.length || !fromCityId || !toCityId) return null;
  const hit = routes.find(
    (r) =>
      r.active !== false &&
      r.fromSettlementId === fromCityId &&
      r.toSettlementId === toCityId,
  );
  return hit ?? null;
}

export function volumetricKg(
  lengthCm: number | null,
  widthCm: number | null,
  heightCm: number | null,
  divisor = DEFAULT_PRICING_CONFIG.volumetric.divisor,
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
  const d = divisor > 0 ? divisor : DEFAULT_PRICING_CONFIG.volumetric.divisor;
  return (lengthCm * widthCm * heightCm) / d;
}

export function billableWeightKg(
  input: EstimateInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
): number {
  const mass =
    input.weightKg == null || input.weightKg <= 0 ? 1 : input.weightKg;

  if (!config.volumetric.enabled) {
    return mass;
  }

  const vol = volumetricKg(
    input.lengthCm,
    input.widthCm,
    input.heightCm,
    config.volumetric.divisor,
  );
  if (vol == null || vol <= 0) return mass;
  return Math.max(mass, vol);
}

function roundToHundred(n: number) {
  return Math.round(n / 100) * 100;
}

function resolveRates(
  input: EstimateInput,
  config: PricingConfig,
  routes?: PricingRouteOverride[],
): { rates: PricingZoneRates; rateSource: PricingRateSource; zone: EstimateZone } {
  const zone = resolveZone(input);
  const zoneRates = config.zones[zone];
  const route = findRouteOverride(routes, input.fromCityId, input.toCityId);
  if (!route) {
    return { rates: zoneRates, rateSource: "zone", zone };
  }
  return {
    zone,
    rateSource: "route",
    rates: {
      base: route.baseUzs,
      perKg: route.perKgUzs,
      etaMin: route.etaMin ?? zoneRates.etaMin,
      etaMax: route.etaMax ?? zoneRates.etaMax,
    },
  };
}

export function estimateQuote(
  input: EstimateInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
  formulaVersion: string = ESTIMATE_FORMULA_VERSION,
  routes?: PricingRouteOverride[],
): QuoteEstimate {
  const { rates, rateSource, zone } = resolveRates(input, config, routes);
  const billable = billableWeightKg(input, config);
  const places = Math.max(1, Math.floor(input.places) || 1);
  const categoryFactor =
    config.categories[input.category ?? "parcel"] ??
    config.categories.parcel ??
    1;

  let mid =
    rates.base +
    rates.perKg * billable +
    (places - 1) * config.surcharges.place;

  if (input.pickup) mid += config.surcharges.pickup;
  if (input.doorDelivery) mid += config.surcharges.door;
  if (input.urgent) mid *= config.surcharges.urgentMultiplier;
  mid *= categoryFactor;

  const amount = roundToHundred(mid);
  const etaMin = rates.etaMin;
  const etaMax = Math.max(rates.etaMin, rates.etaMax);
  const etaDays = input.urgent
    ? Math.max(1, etaMin)
    : Math.max(etaMin, Math.round((etaMin + etaMax) / 2));

  return {
    amount,
    min: amount,
    max: amount,
    currency: config.currency,
    etaDays,
    etaDaysMin: etaDays,
    etaDaysMax: etaDays,
    zone,
    billableKg: Math.round(billable * 10) / 10,
    formulaVersion,
    rateSource,
  };
}

export function formatUzs(amount: number, locale: "uz" | "ru"): string {
  return new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : "ru-RU").format(
    amount,
  );
}
