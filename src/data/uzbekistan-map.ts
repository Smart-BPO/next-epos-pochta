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
  nameZh: string;
  /** Optional hub code for /delivery/#{code} on the routes index */
  deliveryCode?: string;
};

export const MAP_REGIONS: MapRegion[] = [
  {
    iso: "UZAN",
    slug: "andijan",
    nameRu: "Андижанская область",
    nameUz: "Andijon viloyati",
    nameZh: "安集延州",
    deliveryCode: "azn",
  },
  {
    iso: "UZBU",
    slug: "bukhara",
    nameRu: "Бухарская область",
    nameUz: "Buxoro viloyati",
    nameZh: "布哈拉州",
    deliveryCode: "bhk",
  },
  {
    iso: "UZFA",
    slug: "fergana",
    nameRu: "Ферганская область",
    nameUz: "Fargʻona viloyati",
    nameZh: "费尔干纳州",
    deliveryCode: "feg",
  },
  {
    iso: "UZJI",
    slug: "jizzakh",
    nameRu: "Джизакская область",
    nameUz: "Jizzax viloyati",
    nameZh: "吉扎克州",
    deliveryCode: "jiz",
  },
  {
    iso: "UZNG",
    slug: "namangan",
    nameRu: "Наманганская область",
    nameUz: "Namangan viloyati",
    nameZh: "纳曼干州",
    deliveryCode: "nma",
  },
  {
    iso: "UZNW",
    slug: "navoi",
    nameRu: "Навоийская область",
    nameUz: "Navoiy viloyati",
    nameZh: "纳沃伊州",
    deliveryCode: "nvi",
  },
  {
    iso: "UZQA",
    slug: "kashkadarya",
    nameRu: "Кашкадарьинская область",
    nameUz: "Qashqadaryo viloyati",
    nameZh: "卡什卡达里亚州",
    deliveryCode: "ksq",
  },
  {
    iso: "UZQR",
    slug: "karakalpakstan",
    nameRu: "Республика Каракалпакстан",
    nameUz: "Qoraqalpogʻiston Respublikasi",
    nameZh: "卡拉卡尔帕克斯坦共和国",
    deliveryCode: "ncu",
  },
  {
    iso: "UZSA",
    slug: "samarkand",
    nameRu: "Самаркандская область",
    nameUz: "Samarqand viloyati",
    nameZh: "撒马尔罕州",
    deliveryCode: "skd",
  },
  {
    iso: "UZSI",
    slug: "syrdarya",
    nameRu: "Сырдарьинская область",
    nameUz: "Sirdaryo viloyati",
    nameZh: "锡尔河州",
  },
  {
    iso: "UZSU",
    slug: "surkhandarya",
    nameRu: "Сурхандарьинская область",
    nameUz: "Surxondaryo viloyati",
    nameZh: "苏尔汉河州",
    deliveryCode: "tmj",
  },
  {
    iso: "UZTK",
    slug: "tashkent_city",
    nameRu: "г. Ташкент",
    nameUz: "Toshkent shahri",
    nameZh: "塔什干市",
    deliveryCode: "tas",
  },
  {
    iso: "UZTO",
    slug: "tashkent",
    nameRu: "Ташкентская область",
    nameUz: "Toshkent viloyati",
    nameZh: "塔什干州",
    deliveryCode: "tas",
  },
  {
    iso: "UZXO",
    slug: "khorezm",
    nameRu: "Хорезмская область",
    nameUz: "Xorazm viloyati",
    nameZh: "花拉子模州",
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
  if (locale === "uz") return region.nameUz;
  if (locale === "zh") return region.nameZh;
  return region.nameRu;
}

export function isMapRegionIso(value: string): value is MapRegionIso {
  return value in UZBEKISTAN_MAP_PATHS;
}
