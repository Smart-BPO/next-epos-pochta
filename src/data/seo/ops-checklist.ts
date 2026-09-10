/**
 * Off-page / ops checklist for Google + Yandex (uz/ru) SEO program.
 * Track completion outside the repo (GSC, Webmaster, maps, PR).
 */
export const SEO_OPS_CHECKLIST = [
  {
    id: "gsc",
    title: "Google Search Console",
    items: [
      "Verify domain via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
      "Submit https://epos-pochta.uz/sitemap.xml",
      "Monitor coverage for /delivery/* , /services/* , /calculator/",
      "Check International targeting / hreflang pairs uz↔ru",
      "Monthly CTR review on head + city + service titles",
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
    title: "Metrika / GA4 goals (Yandex behavior proxy)",
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
    title: "Local NAP",
    items: [
      "Yandex Business / maps card = SITE_CONFIG / CMS NAP",
      "2GIS listing matches phone, address, hours",
      "Google Business Profile if available for UZ legal entity",
    ],
  },
  {
    id: "serp_matrix",
    title: "SERP matrix (SEO_SERP_MATRIX)",
    items: [
      "Snapshot Google.uz + Yandex positions for matrix queries (uz + ru)",
      "Compare against emu / bts / yandex delivery / pony / aramex",
      "Refresh monthly; escalate thin routes if LOW_QUALITY rises",
    ],
  },
  {
    id: "content_cadence",
    title: "Content rhythm",
    items: [
      "Weekly: ≥1 uz and ≥1 ru news URL (or full bilingual pair)",
      "Refresh city FAQ when coverage changes",
      "Monthly title CTR review uz vs ru on head hubs",
    ],
  },
] as const;
