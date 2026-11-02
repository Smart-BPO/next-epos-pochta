import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import type { Locale } from "@/i18n/config";
import { htmlLang } from "@/i18n/config";
import { loc } from "@/i18n/loc";
import { localePath } from "@/i18n/paths";
import type { LocalizedNewsArticle } from "@/data/news/types";
import {
  cityDisplayName,
  cityMetaDescription,
  DELIVERY_CITIES,
} from "@/data/delivery-cities";

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

function postalAddress(locale: Locale = "uz") {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: loc(
      locale,
      SITE_CONFIG.address.lineUz,
      SITE_CONFIG.address.line,
      SITE_CONFIG.address.lineZh,
    ),
    addressLocality: loc(locale, "Toshkent", "Ташкент", "塔什干"),
    addressRegion: loc(locale, "Toshkent", "Ташкент", "塔什干"),
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
export function getCourierServiceSchema(locale: Locale = "uz") {
  const siteUrl = siteOrigin();
  const { lat, lng } = SITE_CONFIG.address;
  // Google Maps for hasMap (LocalBusiness / GBP parity); Yandex Maps kept in sameAs.
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const yandexMapsUrl = `https://yandex.com/maps/?pt=${lng},${lat}&z=16&l=map`;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "CourierService"],
    "@id": `${siteUrl}/#organization`,
    name: SITE_CONFIG.name,
    legalName: loc(
      locale,
      "«EPOS POCHTA» MCHJ",
      SITE_CONFIG.legalName,
      "EPOS POCHTA 有限责任公司",
    ),
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
      googleMapsUrl,
      yandexMapsUrl,
    ].filter(Boolean),
    address: postalAddress(locale),
    geo: geoCoordinates(),
    hasMap: googleMapsUrl,
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
export function getOrganizationSchema(locale: Locale = "uz") {
  return getCourierServiceSchema(locale);
}

export function getWebSiteSchema() {
  const siteUrl = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_CONFIG.name,
    url: `${siteUrl}/`,
    inLanguage: ["uz", "ru", "zh-Hans"],
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
    name: loc(locale, "Yetkazib berish xizmatlari", "Услуги доставки", "配送服务"),
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
        url: `${siteUrl}${localePath(locale, `/services/${service.id}/`)}`,
      },
    })),
  };
}

export function getServiceDetailSchema(
  locale: Locale,
  service: { id: string; title: string; audience: string; howItWorks: string },
) {
  const siteUrl = siteOrigin();
  const path = localePath(locale, `/services/${service.id}/`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: `${service.audience}. ${service.howItWorks}`,
    url: `${siteUrl}${path}`,
    provider: { "@id": `${siteUrl}/#organization` },
    serviceType: "Courier delivery",
    areaServed: {
      "@type": "Country",
      name: "Uzbekistan",
    },
  };
}

export function getDeliveryCitySchema(
  locale: Locale,
  city: (typeof DELIVERY_CITIES)[number],
) {
  const siteUrl = siteOrigin();
  const path = localePath(locale, `/delivery/${city.slug}/`);
  const name = cityDisplayName(city, locale);
  const description = cityMetaDescription(city, locale);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: loc(
      locale,
      `${name}ga kuryerlik yetkazib berish`,
      `Курьерская доставка в ${name}`,
      `${name}快递配送`,
    ),
    description,
    url: `${siteUrl}${path}`,
    provider: { "@id": `${siteUrl}/#organization` },
    serviceType: "Courier delivery",
    areaServed: {
      "@type": "City",
      name: city.nameEn,
      containedInPlace: { "@type": "Country", name: "Uzbekistan" },
    },
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
    name: loc(locale, "Yangiliklar", "Новости", "新闻"),
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

  const authorName = loc(
    locale,
    "EPOS POCHTA tahririyati",
    "Редакция EPOS POCHTA",
    "EPOS POCHTA 编辑部",
  );

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
    inLanguage: htmlLang[locale],
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
  const fromName = cityDisplayName(route.from, locale);
  const toName = cityDisplayName(route.to, locale);
  const name = loc(
    locale,
    `${fromName}dan ${toName}ga yetkazib berish`,
    `Доставка из ${fromName} в ${toName}`,
    `从${fromName}到${toName}的配送`,
  );
  const description = loc(
    locale,
    `${fromName} — ${toName} kuryerlik yetkazib berish (~${route.distanceKm} km). Orientir kalkulyatorda, yakuniy narx — menejer.`,
    `Курьерская доставка ${fromName} — ${toName} (~${route.distanceKm} км). Ориентир в калькуляторе, финальную цену подтверждает менеджер.`,
    `${fromName} — ${toName}快递（约 ${route.distanceKm} 公里）。计算器为参考价，最终价格由经理确认。`,
  );

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

export function getGlobalJsonLdGraph(locale: Locale = "uz") {
  const org = getCourierServiceSchema(locale);
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
