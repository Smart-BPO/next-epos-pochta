/**
 * Off-page / ops checklist for SEO phases 4–5.
 * Track completion outside the repo (GSC, Webmaster, maps, PR).
 */
export const SEO_OPS_CHECKLIST = [
  {
    id: "gsc",
    title: "Google Search Console",
    items: [
      "Verify domain via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
      "Submit https://epospochta.uz/sitemap.xml",
      "Monitor coverage for /delivery/* and /calculator/",
    ],
  },
  {
    id: "yandex_webmaster",
    title: "Yandex Webmaster",
    items: [
      "Verify via NEXT_PUBLIC_YANDEX_SITE_VERIFICATION",
      "Submit sitemap",
      "Validate LocalBusiness / CourierService microdata",
    ],
  },
  {
    id: "analytics_goals",
    title: "Metrika / GA4 goals",
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
      "Yandex Business / maps card = SITE_CONFIG NAP",
      "2GIS listing matches phone, address, hours",
      "Google Business Profile if available for UZ legal entity",
    ],
  },
  {
    id: "content_cadence",
    title: "Content rhythm",
    items: [
      "2–4 news articles per month",
      "Refresh city pages when coverage changes",
      "Monthly title CTR review uz vs ru",
    ],
  },
] as const;
