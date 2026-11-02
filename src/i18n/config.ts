export const locales = ["uz", "ru", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export const localeLabels: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  zh: "中文",
};

export const htmlLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  zh: "zh-Hans",
};

export const ogLocale: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_UZ",
  zh: "zh_CN",
};

export function isLocale(value: unknown): value is Locale {
  return value === "uz" || value === "ru" || value === "zh";
}

/** BCP 47 tag for Intl sorting and dates. */
export function intlLocale(locale: Locale): string {
  if (locale === "ru") return "ru-RU";
  if (locale === "zh") return "zh-CN";
  return "uz-UZ";
}

export type PageKey =
  | "home"
  | "services"
  | "business"
  | "businessConnect"
  | "tracking"
  | "requestPrice"
  | "calculator"
  | "faq"
  | "about"
  | "news"
  | "contacts"
  | "privacy"
  | "terms"
  | "notFound";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  services: "/services/",
  business: "/business/",
  businessConnect: "/business/connect/",
  tracking: "/tracking/",
  requestPrice: "/request-price/",
  calculator: "/calculator/",
  faq: "/faq/",
  about: "/about/",
  news: "/news/",
  contacts: "/contacts/",
  privacy: "/privacy/",
  terms: "/terms/",
  notFound: "/404/",
};
