export const locales = ["uz", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export const localeLabels: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
};

export const htmlLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
};

export const ogLocale: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_UZ",
};

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
