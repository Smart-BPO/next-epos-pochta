import fcargoLocations from "@/data/fcargo-locations.json";
import type { Locale } from "@/i18n/config";

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

/** Chinese names for regions and hub settlements. Other places keep the Uzbek Latin name. */
const ZH_PLACE: Record<string, string> = {
  "Andijon viloyati": "安集延州",
  "Buxoro viloyati": "布哈拉州",
  "Jizzax viloyati": "吉扎克州",
  "Qashqadaryo viloyati": "卡什卡达里亚州",
  "Navoiy viloyati": "纳沃伊州",
  "Namangan viloyati": "纳曼干州",
  "Samarqand viloyati": "撒马尔罕州",
  "Surxondaryo viloyati": "苏尔汉河州",
  "Sirdaryo viloyati": "锡尔河州",
  "Toshkent shahri": "塔什干市",
  "Toshkent viloyati": "塔什干州",
  "Farg'ona viloyati": "费尔干纳州",
  "Xorazm viloyati": "花拉子模州",
  "Qoraqalpog'iston Respublikasi": "卡拉卡尔帕克斯坦共和国",
  Andijon: "安集延",
  "Andijon tumani": "安集延区",
  Buxoro: "布哈拉",
  "Buxoro tumani": "布哈拉区",
  Jizzax: "吉扎克",
  Qarshi: "卡尔希",
  "Qarshi tumani": "卡尔希区",
  Navoiy: "纳沃伊",
  Namangan: "纳曼干",
  "Namangan tumani": "纳曼干区",
  Samarqand: "撒马尔罕",
  "Samarqand tumani": "撒马尔罕区",
  Termiz: "铁尔梅兹",
  "Termiz tumani": "铁尔梅兹区",
  Guliston: "古利斯坦",
  "Guliston tumani": "古利斯坦区",
  Toshkent: "塔什干",
  "Toshkent tumani": "塔什干区",
  "Farg'ona": "费尔干纳",
  "Farg'ona tumani": "费尔干纳区",
  Urganch: "乌尔根奇",
  "Urganch tumani": "乌尔根奇区",
  Nukus: "努库斯",
  "Nukus tumani": "努库斯区",
};

function zhPlace(uz: string): string {
  return ZH_PLACE[uz] ?? uz;
}

export function settlementLabel(settlement: Settlement, locale: Locale): string {
  if (locale === "uz") return settlement.uz;
  if (locale === "zh") return zhPlace(settlement.uz);
  return settlement.ru;
}

export function regionLabel(settlement: Settlement, locale: Locale): string {
  if (locale === "uz") return settlement.regionUz;
  if (locale === "zh") return zhPlace(settlement.regionUz);
  return settlement.regionRu;
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
