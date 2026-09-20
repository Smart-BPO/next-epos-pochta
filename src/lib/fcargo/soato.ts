/**
 * uzbgeo region slug → Uzbekistan SOATO (region-level).
 *
 * FCargo Client API:
 * - Orders use `region_soato` strings (e.g. "1726").
 * - Pricing `from_region_id` / `to_region_id` take the same codes as **integers**
 *   (1726, not list index 1..N). OpenAPI example `1`/`2` is a placeholder —
 *   on real tenants those hit `tariff_source: "default"`; SOATO ints resolve to
 *   `branch_route` like Create Order.
 *
 * @see https://api.fcargo.uz/api/client/v1/openapi.json (Locations + Pricing)
 */
export const REGION_SOATO_BY_SLUG: Record<string, string> = {
  andijan: "1703",
  bukhara: "1706",
  jizzakh: "1708",
  kashkadarya: "1710",
  navoi: "1712",
  namangan: "1714",
  samarkand: "1718",
  surkhandarya: "1722",
  syrdarya: "1724",
  tashkent_city: "1726",
  tashkent: "1727",
  fergana: "1730",
  khorezm: "1733",
  karakalpakstan: "1735",
};

/** City/district settlement ids that should use Tashkent city SOATO (1726). */
const TASHKENT_CITY_IDS = new Set([
  "tashkent_city",
  "tashkent-city",
]);

export type SoatoRef = {
  regionSoato: string;
  /** SOATO as integer for POST /pricing/calculate from_region_id / to_region_id. */
  regionIdNum: number;
};

export function soatoForRegionSlug(regionId: string): SoatoRef | null {
  const code = REGION_SOATO_BY_SLUG[regionId];
  if (!code) return null;
  const regionIdNum = Number(code);
  if (!Number.isFinite(regionIdNum)) return null;
  return { regionSoato: code, regionIdNum };
}

/**
 * Resolve SOATO for a calculator settlement (city / district / region).
 * Prefers region of the settlement; Tashkent city hubs → 1726.
 */
export function soatoForSettlement(opts: {
  settlementId: string;
  regionId: string;
}): SoatoRef | null {
  if (TASHKENT_CITY_IDS.has(opts.settlementId)) {
    return soatoForRegionSlug("tashkent_city");
  }
  // Hub cities often share region slug (samarkand city under samarkand region).
  return soatoForRegionSlug(opts.regionId);
}
