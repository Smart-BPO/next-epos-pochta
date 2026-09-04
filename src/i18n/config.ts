export const locales = ["ru", "uz"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const localeLabels: Record<Locale, string> = {
  ru: "RU",
  uz: "UZ",
};

export const htmlLang: Record<Locale, string> = {
  ru: "ru",
  uz: "uz",
};

export const ogLocale: Record<Locale, string> = {
  ru: "ru_UZ",
  uz: "uz_UZ",
};

export type PageKey =
  | "home"
  | "services"
  | "business"
  | "tracking"
  | "requestPrice"
  | "about"
  | "contacts"
  | "privacy"
  | "terms"
  | "notFound";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  services: "/services/",
  business: "/business/",
  tracking: "/tracking/",
  requestPrice: "/request-price/",
  about: "/about/",
  contacts: "/contacts/",
  privacy: "/privacy/",
  terms: "/terms/",
  notFound: "/404/",
};
