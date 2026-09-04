import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

export function getOrganizationSchema() {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/images/brand/logo.svg`,
    image: `${siteUrl}/images/og/default.png`,
    telephone: SITE_CONFIG.phoneDisplay,
    ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    sameAs: [
      SITE_CONFIG.telegramUrl,
      SITE_CONFIG.instagramUrl,
      SITE_CONFIG.facebookUrl,
    ].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.line,
      addressLocality: "Tashkent",
      addressCountry: "UZ",
    },
    taxID: SITE_CONFIG.address.inn,
  };
}

export function getFaqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getGlobalJsonLdGraph() {
  return getOrganizationSchema();
}
