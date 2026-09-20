/**
 * Off-page / ops checklist for Google + Yandex (uz/ru) SEO program.
 * Track completion outside the repo (GSC, Webmaster, maps, PR).
 * Google money-page notes: `SEO_GOOGLE_BEHAVIOR` in google-behavior.ts.
 * Yandex money-page notes: `SEO_YANDEX_BEHAVIOR` in yandex-behavior.ts.
 *
 * GSC HTML-tag / sitemap already live on epos-pochta.uz — keep monitoring.
 * Set `NEXT_PUBLIC_GA_ID` when GA4 property is ready (gtag via SiteAnalytics).
 */
export const SEO_OPS_CHECKLIST = [
  {
    id: "gsc",
    title: "Google Search Console",
    items: [
      "Property https://epos-pochta.uz verified (keep NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)",
      "Keep https://epos-pochta.uz/sitemap.xml submitted",
      "Monitor Page indexing for /delivery/* , /services/* , /calculator/, /ru/*",
      "Check hreflang pairs uz↔ru on money URLs",
      "Filter Performance with google-watch-phrases.txt",
      "URL Inspection on SEO_GOOGLE_BEHAVIOR.afterPublishInspect after major publishes",
      "Monthly CTR review on head + city + service titles (≥100 impressions)",
    ],
  },
  {
    id: "ga4",
    title: "Google Analytics 4",
    items: [
      "Create/connect GA4 property → set NEXT_PUBLIC_GA_ID (G-…); do not enable GTM by default",
      "Confirm gtag loads via SiteAnalytics (lazyOnload)",
      "Mark conversions: price_estimate_shown",
      "Mark conversions: request_price_start",
      "Mark conversions: price_form_submit_success",
      "Mark conversions: business_connect_submit_success",
      "Mark conversions: track_support_call_click",
      "Monthly: compare GA4 conversions vs Metrika reachGoal (same event names)",
    ],
  },
  {
    id: "yandex_webmaster",
    title: "Yandex Webmaster",
    items: [
      "Prefer HTTPS host https://epos-pochta.uz (not only http mirror)",
      "Verify via NEXT_PUBLIC_YANDEX_SITE_VERIFICATION / META_TAG",
      "Set site region = Узбекистан",
      "Submit https://epos-pochta.uz/sitemap.xml",
      "Monitor SQI + excluded URLs (LOW_QUALITY on thin routes)",
      "Validate LocalBusiness / CourierService JSON-LD",
      "Recrawl money URLs after major publishes",
    ],
  },
  {
    id: "analytics_goals",
    title: "Metrika / GA4 goals (shared event names)",
    items: [
      "price_estimate_shown",
      "request_price_start",
      "price_form_submit_success",
      "business_connect_submit_success",
      "track_support_call_click",
    ],
  },
  {
    id: "local_citations",
    title: "Local NAP (Google + Yandex + 2GIS)",
    items: [
      "Google Business Profile phone/address/hours = SITE_CONFIG / CMS NAP",
      "Yandex Business / maps card = same NAP",
      "2GIS listing matches phone, address, hours",
      "Contacts map pin = GBP + Yandex pin (lat/lng)",
      "JSON-LD hasMap = Google Maps URL for the same coordinates",
    ],
  },
  {
    id: "serp_matrix",
    title: "SERP matrix (SEO_SERP_MATRIX)",
    items: [
      "Fill google-serp-baseline.tsv positions for Google.uz (uz + ru)",
      "Snapshot Yandex positions for the same matrix queries",
      "Compare against emu / bts / yandex delivery / pony / aramex",
      "Optional: set googleVolumeHint after Keyword Planner pass (see google-keyword-layer.md)",
      "Refresh monthly; escalate thin routes if GSC excluded / Yandex LOW_QUALITY rises",
    ],
  },
  {
    id: "content_cadence",
    title: "Content + Google monthly rhythm",
    items: [
      "Weekly: ≥1 uz and ≥1 ru news URL (or full bilingual pair)",
      "Refresh city FAQ when coverage changes",
      "Monthly title CTR review uz vs ru on head hubs (GSC)",
      "Monthly Mobile PSI on / and /calculator/",
      "Monthly GA4 vs Metrika conversion parity check",
      "After large deploys: GSC URL Inspection on money URLs (google-behavior.ts)",
    ],
  },
] as const;
