import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { LocalizedNewsArticle } from "@/data/news/types";

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

export function getNewsCollectionSchema(
  locale: Locale,
  articles: LocalizedNewsArticle[],
) {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  const listPath = localePath(locale, "/news/");

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "uz" ? "Yangiliklar" : "Новости",
    url: `${siteUrl}${listPath}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: `${siteUrl}/`,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}${localePath(locale, `/news/${article.slug}/`)}`,
        name: article.title,
      })),
    },
  };
}

export function getNewsArticleSchema(
  locale: Locale,
  article: LocalizedNewsArticle,
) {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  const path = localePath(locale, `/news/${article.slug}/`);
  const image = article.coverImage
    ? article.coverImage.startsWith("http")
      ? article.coverImage
      : `${siteUrl}${article.coverImage}`
    : `${siteUrl}/images/og/default.png`;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: [image],
    url: `${siteUrl}${path}`,
    inLanguage: locale === "uz" ? "uz" : "ru",
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/brand/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${path}`,
    },
  };
}

export function getGlobalJsonLdGraph() {
  return getOrganizationSchema();
}
