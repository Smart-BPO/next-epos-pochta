/**
 * Money-page CX + Google Search / GA4 ops notes (not runtime).
 * GA4 events are fired from the app via `trackEvent` / `SEO_ANALYTICS_GOALS`.
 * GSC: property live — keep `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` + sitemap submitted.
 * Set `NEXT_PUBLIC_GA_ID` when GA4 is connected (gtag via SiteAnalytics; no GTM by default).
 */
export const SEO_GOOGLE_BEHAVIOR = {
  moneyPages: [
    "/",
    "/calculator/",
    "/delivery/",
    "/delivery/tashkent/",
    "/delivery/samarkand/",
    "/delivery/bukhara/",
    "/delivery/fergana/",
    "/delivery/andijan/",
    "/delivery/namangan/",
    "/services/",
    "/services/door/",
    "/services/ecommerce/",
    "/services/documents/",
    "/services/cod/",
    "/services/courier/",
    "/business/",
    "/contacts/",
  ],
  /** GSC → URL Inspection → Request indexing after major publishes. */
  afterPublishInspect: [
    "https://epos-pochta.uz/",
    "https://epos-pochta.uz/calculator/",
    "https://epos-pochta.uz/delivery/",
    "https://epos-pochta.uz/delivery/tashkent/",
    "https://epos-pochta.uz/services/",
    "https://epos-pochta.uz/business/",
    "https://epos-pochta.uz/ru/",
    "https://epos-pochta.uz/ru/calculator/",
    "https://epos-pochta.uz/ru/delivery/",
    "https://epos-pochta.uz/ru/business/",
  ],
  ga4Setup: [
    "Create/connect GA4 property for epos-pochta.uz → set NEXT_PUBLIC_GA_ID (G-…)",
    "Do not enable GTM unless replacing gtag — SiteAnalytics already loads gtag",
    "Mark as conversions: price_estimate_shown, request_price_start, price_form_submit_success, business_connect_submit_success, track_support_call_click",
    "Compare monthly with Metrika reachGoal of the same names (SEO_ANALYTICS_GOALS)",
  ],
  gscSetup: [
    "Property https://epos-pochta.uz verified — keep HTML-tag token in env",
    "Keep https://epos-pochta.uz/sitemap.xml submitted",
    "Watch Page indexing for /delivery/*, /services/*, /calculator/, /ru/*",
    "Confirm hreflang uz↔ru on money URLs (page → International targeting / HTML)",
    "Filter Performance by query list in google-watch-phrases.txt",
    "URL Inspection on afterPublishInspect after major publishes",
  ],
  napChecklist: [
    "Google Business Profile phone/address/hours = CMS site settings / SITE_CONFIG",
    "Yandex Business + 2GIS listings match the same NAP (no drift)",
    "Contacts page map embed uses the same lat/lng as GBP pin",
    "JSON-LD LocalBusiness hasMap points at Google Maps for the same pin",
  ],
  cxNotes: [
    "Calculator always shows non-binding disclaimer before CTA to manager",
    "City and service landings deep-link to calculator or request-price",
    "Avoid dead-ends: every money page has primary + secondary CTA",
    "Do not change cluster→URL map without GSC evidence (avoid Yandex cannibalization)",
  ],
  monthlyCadence: [
    "GSC: Coverage / Page indexing + soft-404 / excluded thin routes",
    "GSC Performance: CTR on money URLs; retitle when CTR low at ≥100 impressions",
    "GA4 conversions vs Metrika goals",
    "Refresh google-serp-baseline.tsv positions for SEO_SERP_MATRIX (Google.uz)",
    "Mobile PSI on / and /calculator/",
    "News: ≥1 uz and ≥1 ru URL per week",
    "URL Inspection on afterPublishInspect list after large content deploys",
  ],
} as const;
