import { getPublicEnv } from "./env";
import { getCanonicalSiteUrl } from "./seo/indexing";

export const SITE_CONFIG = {
  name: "EPOS POCHTA",
  legalName: "ООО «EPOS POCHTA»",
  title: "EPOS POCHTA — Oʻzbekiston boʻylab yetkazib berish",
  description:
    "EPOS POCHTA — Oʻzbekiston boʻylab kuryerlik yetkazib berish. Joʻnatmani olib ketamiz, yetkazamiz va har bosqichda statusni xabar qilamiz.",
  url: getCanonicalSiteUrl(),
  phone: getPublicEnv("NEXT_PUBLIC_CONTACT_PHONE", "+998887092299"),
  phoneDisplay: "+998 88 709 22 99",
  email: getPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", ""),
  telegramUrl: getPublicEnv(
    "NEXT_PUBLIC_TELEGRAM_URL",
    "https://t.me/epos_operator",
  ),
  instagramUrl: getPublicEnv(
    "NEXT_PUBLIC_INSTAGRAM_URL",
    "https://www.instagram.com/epos_pochta/",
  ),
  facebookUrl: getPublicEnv(
    "NEXT_PUBLIC_FACEBOOK_URL",
    "https://www.facebook.com/profile.php?id=61590938820629",
  ),
  // TODO(cms): hours and messenger links from CMS / client confirmation
  hours: "",
  address: {
    line:
      "г. Ташкент, Сергелийский район, МСГ Bunyodobod, ул. Ташкентская кольцевая автомобильная дорога, дом 7",
    /** Approximate pin — refine via NEXT_PUBLIC_MAP_LAT / NEXT_PUBLIC_MAP_LNG. */
    lat: Number(getPublicEnv("NEXT_PUBLIC_MAP_LAT", "41.2085")) || 41.2085,
    lng: Number(getPublicEnv("NEXT_PUBLIC_MAP_LNG", "69.22")) || 69.22,
    inn: "312949361",
    oked: "53200",
  },
  locales: ["uz", "ru"] as const,
  defaultLocale: "uz" as const,
  themeColor: "#d30203",
  analytics: {
    yandexMetrikaId: getPublicEnv("NEXT_PUBLIC_YM_ID"),
    googleAnalyticsId: getPublicEnv("NEXT_PUBLIC_GA_ID"),
    googleTagManagerId: getPublicEnv("NEXT_PUBLIC_GTM_ID"),
  },
  seo: {
    googleSiteVerification: getPublicEnv(
      "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
    ),
    yandexSiteVerification: getPublicEnv(
      "NEXT_PUBLIC_YANDEX_SITE_VERIFICATION",
    ),
  },
} as const;

export type SiteLocale = (typeof SITE_CONFIG.locales)[number];
