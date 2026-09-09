/**
 * Pricing config for non-binding calculator estimates.
 * Not an official tariff — manager confirms final price.
 */

export type EstimateZone = "same_city" | "same_region" | "inter_region";

export type PricingZoneRates = {
  base: number;
  perKg: number;
  etaMin: number;
  etaMax: number;
};

export type PricingDimLimit = {
  min: number;
  max: number;
  step: number;
  default: number;
};

export type PricingConfig = {
  currency: "UZS";
  zones: Record<EstimateZone, PricingZoneRates>;
  surcharges: {
    pickup: number;
    door: number;
    place: number;
    urgentMultiplier: number;
  };
  categories: Record<string, number>;
  volumetric: {
    enabled: boolean;
    divisor: number;
  };
  limits: {
    weightKg: PricingDimLimit;
    lengthCm: PricingDimLimit;
    widthCm: PricingDimLimit;
    heightCm: PricingDimLimit;
  };
  quickCityIds: string[];
};

export type PricingSettingsRow = {
  id: number;
  enabled: boolean;
  formula_version: string;
  config: PricingConfig;
  updated_at: string | null;
  updated_by: string | null;
};

export const ESTIMATE_FORMULA_VERSION = "2026-09-v5-matrix";

export type PricingRateSource = "route" | "zone";

export type PricingRouteOverride = {
  id?: number;
  fromSettlementId: string;
  toSettlementId: string;
  baseUzs: number;
  perKgUzs: number;
  etaMin: number | null;
  etaMax: number | null;
  active: boolean;
};

export type PricingSnapshot = {
  enabled: boolean;
  formulaVersion: string;
  config: PricingConfig;
  routes: PricingRouteOverride[];
  experiment?: unknown;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  currency: "UZS",
  zones: {
    same_city: { base: 25_000, perKg: 3_000, etaMin: 1, etaMax: 2 },
    same_region: { base: 35_000, perKg: 4_500, etaMin: 1, etaMax: 3 },
    inter_region: { base: 55_000, perKg: 7_000, etaMin: 2, etaMax: 5 },
  },
  surcharges: {
    pickup: 12_000,
    door: 15_000,
    place: 5_000,
    urgentMultiplier: 1.35,
  },
  categories: {
    documents: 0.85,
    parcel: 1,
    goods: 1.05,
    other: 1,
  },
  volumetric: {
    enabled: false,
    divisor: 5000,
  },
  limits: {
    weightKg: { min: 0, max: 30, step: 0.5, default: 1 },
    lengthCm: { min: 0, max: 100, step: 1, default: 20 },
    widthCm: { min: 0, max: 100, step: 1, default: 15 },
    heightCm: { min: 0, max: 100, step: 1, default: 10 },
  },
  quickCityIds: [
    "tashkent_city",
    "samarkand_city",
    "fergana_city",
    "andijan_city",
  ],
};

export type PublicPricingUiConfig = {
  enabled: boolean;
  formulaVersion: string;
  limits: PricingConfig["limits"];
  quickCityIds: string[];
  currency: "UZS";
};

function finiteNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function dimLimit(
  raw: unknown,
  fallback: PricingDimLimit,
): PricingDimLimit {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  return {
    min: finiteNumber(o.min, fallback.min),
    max: finiteNumber(o.max, fallback.max),
    step: finiteNumber(o.step, fallback.step),
    default: finiteNumber(o.default, fallback.default),
  };
}

function zoneRates(
  raw: unknown,
  fallback: PricingZoneRates,
): PricingZoneRates {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  return {
    base: finiteNumber(o.base, fallback.base),
    perKg: finiteNumber(o.perKg, fallback.perKg),
    etaMin: Math.max(1, Math.floor(finiteNumber(o.etaMin, fallback.etaMin))),
    etaMax: Math.max(1, Math.floor(finiteNumber(o.etaMax, fallback.etaMax))),
  };
}

/** Merge partial/unknown JSON into a full PricingConfig. */
export function normalizePricingConfig(raw: unknown): PricingConfig {
  const d = DEFAULT_PRICING_CONFIG;
  if (!raw || typeof raw !== "object") {
    return structuredClone(d);
  }
  const o = raw as Record<string, unknown>;
  const zonesRaw =
    o.zones && typeof o.zones === "object"
      ? (o.zones as Record<string, unknown>)
      : {};
  const surchargesRaw =
    o.surcharges && typeof o.surcharges === "object"
      ? (o.surcharges as Record<string, unknown>)
      : {};
  const categoriesRaw =
    o.categories && typeof o.categories === "object"
      ? (o.categories as Record<string, unknown>)
      : {};
  const volumetricRaw =
    o.volumetric && typeof o.volumetric === "object"
      ? (o.volumetric as Record<string, unknown>)
      : {};
  const limitsRaw =
    o.limits && typeof o.limits === "object"
      ? (o.limits as Record<string, unknown>)
      : {};

  const categories: Record<string, number> = { ...d.categories };
  for (const [k, v] of Object.entries(categoriesRaw)) {
    const n = finiteNumber(v, categories[k] ?? 1);
    categories[k] = n;
  }

  const quickCityIds = Array.isArray(o.quickCityIds)
    ? o.quickCityIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [...d.quickCityIds];

  return {
    currency: "UZS",
    zones: {
      same_city: zoneRates(zonesRaw.same_city, d.zones.same_city),
      same_region: zoneRates(zonesRaw.same_region, d.zones.same_region),
      inter_region: zoneRates(zonesRaw.inter_region, d.zones.inter_region),
    },
    surcharges: {
      pickup: finiteNumber(surchargesRaw.pickup, d.surcharges.pickup),
      door: finiteNumber(surchargesRaw.door, d.surcharges.door),
      place: finiteNumber(surchargesRaw.place, d.surcharges.place),
      urgentMultiplier: Math.max(
        1,
        finiteNumber(
          surchargesRaw.urgentMultiplier,
          d.surcharges.urgentMultiplier,
        ),
      ),
    },
    categories,
    volumetric: {
      enabled: Boolean(volumetricRaw.enabled ?? d.volumetric.enabled),
      divisor: Math.max(
        1,
        finiteNumber(volumetricRaw.divisor, d.volumetric.divisor),
      ),
    },
    limits: {
      weightKg: dimLimit(limitsRaw.weightKg, d.limits.weightKg),
      lengthCm: dimLimit(limitsRaw.lengthCm, d.limits.lengthCm),
      widthCm: dimLimit(limitsRaw.widthCm, d.limits.widthCm),
      heightCm: dimLimit(limitsRaw.heightCm, d.limits.heightCm),
    },
    quickCityIds: quickCityIds.length ? quickCityIds : [...d.quickCityIds],
  };
}

export function toPublicPricingUi(
  enabled: boolean,
  formulaVersion: string,
  config: PricingConfig,
): PublicPricingUiConfig {
  return {
    enabled,
    formulaVersion,
    limits: config.limits,
    quickCityIds: config.quickCityIds,
    currency: "UZS",
  };
}
