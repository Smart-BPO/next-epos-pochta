import { getPublicEnv } from "./env";
import { getCanonicalSiteUrl } from "./seo/indexing";

export const SITE_CONFIG = {
  name: "EPOS POCHTA",
  legalName: "ООО «EPOS POCHTA»",
  title: "EPOS POCHTA — доставка посылок по Узбекистану",
  description:
    "Курьерская доставка по территории Узбекистана: заберём отправление, доставим получателю и сообщим статус на каждом этапе.",
  url: getCanonicalSiteUrl(),
  phone: getPublicEnv("NEXT_PUBLIC_CONTACT_PHONE", "+998887092299"),
  phoneDisplay: "+998 88 709 22 99",
  email: getPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", ""),
  telegramUrl: getPublicEnv("NEXT_PUBLIC_TELEGRAM_URL", ""),
  // TODO(cms): hours and messenger links from CMS / client confirmation
  hours: "",
  address: {
    line:
      "г. Ташкент, Сергелийский район, МСГ Bunyodobod, ул. Ташкентская кольцевая автомобильная дорога, дом 7",
    inn: "312949361",
    oked: "53200",
  },
  locales: ["ru", "uz"] as const,
  defaultLocale: "ru" as const,
  themeColor: "#e11d2e",
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
