import type { Locale } from "@/i18n/config";
import {
  UZBEKISTAN_MAP_PATHS,
  type UzbekistanMapIso,
} from "@/data/uzbekistan-map-paths";

/** ISO code used in the hero SVG (without hyphen), e.g. UZAN. */
export type MapRegionIso = UzbekistanMapIso;

export type MapRegion = {
  iso: MapRegionIso;
  /** uzbgeo / settlements region slug */
  slug: string;
  nameRu: string;
  nameUz: string;
  /** Optional /delivery/[slug]/ landing */
  deliverySlug?: string;
};

export const MAP_REGIONS: MapRegion[] = [
  {
    iso: "UZAN",
    slug: "andijan",
    nameRu: "Андижанская область",
    nameUz: "Andijon viloyati",
    deliverySlug: "andijan",
  },
  {
    iso: "UZBU",
    slug: "bukhara",
    nameRu: "Бухарская область",
    nameUz: "Buxoro viloyati",
    deliverySlug: "bukhara",
  },
  {
    iso: "UZFA",
    slug: "fergana",
    nameRu: "Ферганская область",
    nameUz: "Fargʻona viloyati",
    deliverySlug: "fergana",
  },
  {
    iso: "UZJI",
    slug: "jizzakh",
    nameRu: "Джизакская область",
    nameUz: "Jizzax viloyati",
    deliverySlug: "jizzakh",
  },
  {
    iso: "UZNG",
    slug: "namangan",
    nameRu: "Наманганская область",
    nameUz: "Namangan viloyati",
    deliverySlug: "namangan",
  },
  {
    iso: "UZNW",
    slug: "navoi",
    nameRu: "Навоийская область",
    nameUz: "Navoiy viloyati",
    deliverySlug: "navoi",
  },
  {
    iso: "UZQA",
    slug: "kashkadarya",
    nameRu: "Кашкадарьинская область",
    nameUz: "Qashqadaryo viloyati",
    deliverySlug: "karshi",
  },
  {
    iso: "UZQR",
    slug: "karakalpakstan",
    nameRu: "Республика Каракалпакстан",
    nameUz: "Qoraqalpogʻiston Respublikasi",
    deliverySlug: "nukus",
  },
  {
    iso: "UZSA",
    slug: "samarkand",
    nameRu: "Самаркандская область",
    nameUz: "Samarqand viloyati",
    deliverySlug: "samarkand",
  },
  {
    iso: "UZSI",
    slug: "syrdarya",
    nameRu: "Сырдарьинская область",
    nameUz: "Sirdaryo viloyati",
  },
  {
    iso: "UZSU",
    slug: "surkhandarya",
    nameRu: "Сурхандарьинская область",
    nameUz: "Surxondaryo viloyati",
    deliverySlug: "termez",
  },
  {
    iso: "UZTK",
    slug: "tashkent_city",
    nameRu: "г. Ташкент",
    nameUz: "Toshkent shahri",
    deliverySlug: "tashkent",
  },
  {
    iso: "UZTO",
    slug: "tashkent",
    nameRu: "Ташкентская область",
    nameUz: "Toshkent viloyati",
    deliverySlug: "tashkent",
  },
  {
    iso: "UZXO",
    slug: "khorezm",
    nameRu: "Хорезмская область",
    nameUz: "Xorazm viloyati",
    deliverySlug: "urgench",
  },
];

export const MAP_REGION_BY_ISO = Object.fromEntries(
  MAP_REGIONS.map((r) => [r.iso, r]),
) as Record<MapRegionIso, MapRegion>;

export const MAP_REGION_BY_SLUG = Object.fromEntries(
  MAP_REGIONS.map((r) => [r.slug, r]),
) as Record<string, MapRegion>;

export function mapRegionLabel(region: MapRegion, locale: Locale) {
  return locale === "uz" ? region.nameUz : region.nameRu;
}

export function isMapRegionIso(value: string): value is MapRegionIso {
  return value in UZBEKISTAN_MAP_PATHS;
}
