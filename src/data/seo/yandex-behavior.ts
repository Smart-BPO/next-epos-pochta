/**
 * Money-page CX + Yandex behavior notes (ops, not runtime).
 * Metrika goals are fired from the app via `trackEvent` / `SEO_ANALYTICS_GOALS`.
 */
export const SEO_YANDEX_BEHAVIOR = {
  moneyPages: [
    "/",
    "/calculator/",
    "/delivery/",
    "/delivery/tashkent/",
    "/services/",
    "/services/documents/",
    "/business/",
    "/request-price/",
  ],
  afterPublishRecrawl: [
    "https://epos-pochta.uz/",
    "https://epos-pochta.uz/calculator/",
    "https://epos-pochta.uz/delivery/",
    "https://epos-pochta.uz/delivery/tashkent/",
    "https://epos-pochta.uz/services/",
    "https://epos-pochta.uz/ru/",
    "https://epos-pochta.uz/ru/calculator/",
    "https://epos-pochta.uz/ru/delivery/",
  ],
  napChecklist: [
    "Yandex Business card phone/address/hours = CMS site settings / SITE_CONFIG",
    "2GIS listing matches the same NAP",
    "Contacts page map embed uses the same lat/lng",
  ],
  cxNotes: [
    "Calculator always shows non-binding disclaimer before CTA to manager",
    "City and service landings deep-link to calculator or request-price",
    "Avoid dead-ends: every money page has primary + secondary CTA",
  ],
} as const;
