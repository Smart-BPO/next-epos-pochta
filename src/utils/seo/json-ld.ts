import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { LocalizedNewsArticle } from "@/data/news/types";
import { DELIVERY_CITIES } from "@/data/delivery-cities";

function siteOrigin() {
  return getCanonicalSiteUrl().replace(/\/$/, "");
}

const AREA_SERVED_CITIES = [
  "Tashkent",
  "Samarkand",
  "Bukhara",
  "Namangan",
  "Andijan",
  "Fergana",
  "Nukus",
  "Karshi",
  "Termez",
  "Navoi",
  "Jizzakh",
  "Urgench",
] as const;

function postalAddress() {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: SITE_CONFIG.address.line,
    addressLocality: "Tashkent",
    addressRegion: "Tashkent",
    addressCountry: "UZ",
  };
}

function geoCoordinates() {
  return {
    "@type": "GeoCoordinates" as const,
    latitude: SITE_CONFIG.address.lat,
    longitude: SITE_CONFIG.address.lng,
  };
}

/** Local courier company entity for Google / Yandex. */
export function getCourierServiceSchema() {
  const siteUrl = siteOrigin();
  const mapUrl = `https://yandex.com/maps/?pt=${SITE_CONFIG.address.lng},${SITE_CONFIG.address.lat}&z=16&l=map`;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "CourierService"],
    "@id": `${siteUrl}/#organization`,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/images/brand/logo.svg`,
    image: `${siteUrl}/images/og/default.png`,
    telephone: SITE_CONFIG.phoneDisplay,
    ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    priceRange: "UZS",
    currenciesAccepted: "UZS",
    openingHours: SITE_CONFIG.hours || undefined,
    sameAs: [
      SITE_CONFIG.telegramUrl,
      SITE_CONFIG.instagramUrl,
      SITE_CONFIG.facebookUrl,
    ].filter(Boolean),
    address: postalAddress(),
    geo: geoCoordinates(),
    hasMap: mapUrl,
    taxID: SITE_CONFIG.address.inn,
    areaServed: [
      {
        "@type": "Country",
        name: "Uzbekistan",
      },
      ...AREA_SERVED_CITIES.map((name) => ({
        "@type": "City" as const,
        name,
      })),
    ],
  };
}

/** @deprecated Prefer getCourierServiceSchema — kept for callers expecting Organization. */
export function getOrganizationSchema() {
  return getCourierServiceSchema();
}

export function getWebSiteSchema() {
  const siteUrl = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_CONFIG.name,
    url: `${siteUrl}/`,
    inLanguage: ["uz", "ru"],
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  const siteUrl = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path.endsWith("/") || item.path === "" ? item.path || "/" : `${item.path}/`}`,
    })),
  };
}

export function getServiceCatalogSchema(
  locale: Locale,
  services: Array<{ id: string; title: string; audience: string }>,
) {
  const siteUrl = siteOrigin();
  const path = localePath(locale, "/services/");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "uz" ? "Yetkazib berish xizmatlari" : "Услуги доставки",
    url: `${siteUrl}${path}`,
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.audience,
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: {
          "@type": "Country",
          name: "Uzbekistan",
        },
        url: `${siteUrl}${path}#${service.id}`,
      },
    })),
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
  const siteUrl = siteOrigin();
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
  const siteUrl = siteOrigin();
  const path = localePath(locale, `/news/${article.slug}/`);
  const imageSrc =
    article.ogImage || article.coverImage || "/images/og/default.png";
  const image = imageSrc.startsWith("http")
    ? imageSrc
    : `${siteUrl}${imageSrc}`;
  const headline = (article.seoTitle || article.title).trim();
  const description = (article.seoDescription || article.excerpt).trim();

  const authorName =
    locale === "uz" ? "EPOS POCHTA tahririyati" : "Редакция EPOS POCHTA";

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: {
      "@type": "ImageObject",
      url: image,
      caption: article.coverAlt || headline,
    },
    url: `${siteUrl}${path}`,
    inLanguage: locale === "uz" ? "uz" : "ru",
    author: {
      "@type": "Organization",
      name: authorName,
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

export function getDeliveryRouteSchema(
  locale: Locale,
  route: {
    from: (typeof DELIVERY_CITIES)[number];
    to: (typeof DELIVERY_CITIES)[number];
    distanceKm: number;
  },
) {
  const siteUrl = siteOrigin();
  const path = localePath(
    locale,
    `/delivery/${route.from.code}/${route.to.code}/`,
  );
  const fromName = locale === "uz" ? route.from.nameUz : route.from.nameRu;
  const toName = locale === "uz" ? route.to.nameUz : route.to.nameRu;
  const name =
    locale === "uz"
      ? `${fromName}dan ${toName}ga yetkazib berish`
      : `Доставка из ${fromName} в ${toName}`;
  const description =
    locale === "uz"
      ? `${fromName} — ${toName} kuryerlik yetkazib berish (~${route.distanceKm} km). Orientir kalkulyatorda, yakuniy narx — menejer.`
      : `Курьерская доставка ${fromName} — ${toName} (~${route.distanceKm} км). Ориентир в калькуляторе, финальную цену подтверждает менеджер.`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl}${path}`,
    provider: { "@id": `${siteUrl}/#organization` },
    serviceType: "Courier delivery",
    areaServed: [
      {
        "@type": "City",
        name: route.from.nameEn,
        containedInPlace: { "@type": "Country", name: "Uzbekistan" },
      },
      {
        "@type": "City",
        name: route.to.nameEn,
        containedInPlace: { "@type": "Country", name: "Uzbekistan" },
      },
    ],
  };
}

export function getGlobalJsonLdGraph() {
  const org = getCourierServiceSchema();
  const site = getWebSiteSchema();
  const { "@context": _c1, ...orgRest } = org as Record<string, unknown> & {
    "@context": string;
  };
  const { "@context": _c2, ...siteRest } = site as Record<string, unknown> & {
    "@context": string;
  };
  return {
    "@context": "https://schema.org",
    "@graph": [orgRest, siteRest],
  };
}
