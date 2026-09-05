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
  /** Optional hub code for /delivery/#{code} on the routes index */
  deliveryCode?: string;
};

export const MAP_REGIONS: MapRegion[] = [
  {
    iso: "UZAN",
    slug: "andijan",
    nameRu: "Андижанская область",
    nameUz: "Andijon viloyati",
    deliveryCode: "azn",
  },
  {
    iso: "UZBU",
    slug: "bukhara",
    nameRu: "Бухарская область",
    nameUz: "Buxoro viloyati",
    deliveryCode: "bhk",
  },
  {
    iso: "UZFA",
    slug: "fergana",
    nameRu: "Ферганская область",
    nameUz: "Fargʻona viloyati",
    deliveryCode: "feg",
  },
  {
    iso: "UZJI",
    slug: "jizzakh",
    nameRu: "Джизакская область",
    nameUz: "Jizzax viloyati",
    deliveryCode: "jiz",
  },
  {
    iso: "UZNG",
    slug: "namangan",
    nameRu: "Наманганская область",
    nameUz: "Namangan viloyati",
    deliveryCode: "nma",
  },
  {
    iso: "UZNW",
    slug: "navoi",
    nameRu: "Навоийская область",
    nameUz: "Navoiy viloyati",
    deliveryCode: "nvi",
  },
  {
    iso: "UZQA",
    slug: "kashkadarya",
    nameRu: "Кашкадарьинская область",
    nameUz: "Qashqadaryo viloyati",
    deliveryCode: "ksq",
  },
  {
    iso: "UZQR",
    slug: "karakalpakstan",
    nameRu: "Республика Каракалпакстан",
    nameUz: "Qoraqalpogʻiston Respublikasi",
    deliveryCode: "ncu",
  },
  {
    iso: "UZSA",
    slug: "samarkand",
    nameRu: "Самаркандская область",
    nameUz: "Samarqand viloyati",
    deliveryCode: "skd",
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
    deliveryCode: "tmj",
  },
  {
    iso: "UZTK",
    slug: "tashkent_city",
    nameRu: "г. Ташкент",
    nameUz: "Toshkent shahri",
    deliveryCode: "tas",
  },
  {
    iso: "UZTO",
    slug: "tashkent",
    nameRu: "Ташкентская область",
    nameUz: "Toshkent viloyati",
    deliveryCode: "tas",
  },
  {
    iso: "UZXO",
    slug: "khorezm",
    nameRu: "Хорезмская область",
    nameUz: "Xorazm viloyati",
    deliveryCode: "ugc",
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
