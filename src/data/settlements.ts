import fcargoLocations from "@/data/fcargo-locations.json";

export type SettlementLevel = "region" | "district" | "city";

export type Settlement = {
  /** FCargo SOATO (district 7 digits, or region 4 digits). */
  id: string;
  /** Region-level SOATO (4 digits). */
  regionId: string;
  /** uzbgeo region slug for map UI (e.g. tashkent_city). */
  regionSlug: string;
  level: SettlementLevel;
  ru: string;
  uz: string;
  regionRu: string;
  regionUz: string;
  /** Original uzbgeo slug when known (legacy / SEO hubs). */
  legacySlug?: string | null;
  fcargoName?: string;
};

type RawLocation = {
  soato: string;
  regionSoato: string;
  regionSlug?: string | null;
  level: SettlementLevel;
  fcargoName: string;
  uzbgeoSlug: string | null;
  ru: string;
  uz: string;
  regionRu: string;
  regionUz: string;
  citySlugs?: string[];
};

const raw = fcargoLocations.locations as RawLocation[];

/** Flat searchable list keyed by FCargo SOATO. */
export const uzbekistanSettlements: Settlement[] = raw.map((l) => ({
  id: l.soato,
  regionId: l.regionSoato,
  regionSlug: l.regionSlug ?? "",
  level: l.level,
  ru: l.ru,
  uz: l.uz,
  regionRu: l.regionRu,
  regionUz: l.regionUz,
  legacySlug: l.uzbgeoSlug,
  fcargoName: l.fcargoName,
}));

const bySoato = new Map(uzbekistanSettlements.map((s) => [s.id, s]));

/** Legacy uzbgeo slug → FCargo SOATO (district/city/region). */
const legacySlugMap = new Map<string, string>();
for (const l of raw) {
  if (l.uzbgeoSlug) legacySlugMap.set(l.uzbgeoSlug, l.soato);
  for (const citySlug of l.citySlugs ?? []) {
    if (!legacySlugMap.has(citySlug)) legacySlugMap.set(citySlug, l.soato);
  }
}

export function legacySlugToSoato(slug: string): string | null {
  const s = slug.trim();
  if (!s) return null;
  if (/^\d{4}(\d{3})?$/.test(s)) return s;
  return legacySlugMap.get(s) ?? null;
}

/** Resolve SOATO or legacy slug to a settlement. */
export function getSettlementById(id: string): Settlement | undefined {
  const soato = legacySlugToSoato(id) ?? id.trim();
  return bySoato.get(soato);
}

export function settlementLabel(
  settlement: Settlement,
  locale: "ru" | "uz",
): string {
  return locale === "uz" ? settlement.uz : settlement.ru;
}

/** @deprecated Prefer uzbekistanSettlements — kept for geo search / quick chips. */
export const uzbekistanCities = uzbekistanSettlements.filter(
  (s) => s.level === "city" || s.level === "district",
);

/** Hub order for calculator chips (legacy uzbgeo city slugs → SOATO). */
const HUB_LEGACY_SLUGS = [
  "tashkent_city",
  "samarkand_city",
  "bukhara_city",
  "namangan_city",
  "andijan_city",
  "fergana_city",
  "nukus_city",
  "karshi_city",
  "termiz_city",
  "navoi_city",
  "jizzakh_city",
  "urgench_city",
] as const;

/** Delivery-hub settlements in hub order (Tashkent first, …). */
export const uzbekistanHubSettlements: Settlement[] = HUB_LEGACY_SLUGS.flatMap(
  (slug) => {
    const soato = legacySlugToSoato(slug);
    const settlement = soato ? bySoato.get(soato) : undefined;
    return settlement ? [settlement] : [];
  },
);
