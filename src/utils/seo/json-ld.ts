import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: getCanonicalSiteUrl(),
    telephone: SITE_CONFIG.phoneDisplay,
    ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
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
