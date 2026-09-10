import type { Metadata } from "next";
import { SITE_CONFIG } from "@/utils/consts";
import {
  getCanonicalSiteUrl,
  isIndexableDeployment,
  robotsForDeployment,
} from "@/utils/seo/indexing";

export function canonicalPageUrl(path: string): string {
  const base = getCanonicalSiteUrl().replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized.endsWith("/") ? normalized : `${normalized}/`}`;
}

/** One brand suffix — avoids "… | EPOS POCHTA — EPOS POCHTA" from root title template. */
export function absolutePageTitle(title: string): string {
  const brand = SITE_CONFIG.name;
  const brandSegment = new RegExp(
    `(?:\\s*[|—–-]\\s*)?${escapeRegExp(brand)}(?:\\s+(?:kuryeri|курьер(?:а|ской)?))?`,
    "gi",
  );
  const stripped = title
    .replace(brandSegment, "")
    .replace(/[\s|—–-]+$/g, "")
    .replace(/^[\s|—–-]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!stripped || stripped.toLowerCase() === brand.toLowerCase()) {
    return brand;
  }
  return `${stripped} — ${brand}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
  options?: {
    image?: string;
    locale?: string;
    ogLocale?: string;
    ogType?: "website" | "article";
    robots?: Metadata["robots"];
    alternates?: Record<string, string>;
    noIndex?: boolean;
  },
): Metadata {
  const url = canonicalPageUrl(path);
  const pageTitle = absolutePageTitle(title);
  const robots =
    options?.robots ??
    (options?.noIndex
      ? { index: false, follow: false }
      : robotsForDeployment());

  return {
    title: { absolute: pageTitle },
    description,
    metadataBase: new URL(getCanonicalSiteUrl()),
    alternates: {
      canonical: url,
      languages: options?.alternates,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: options?.ogLocale ?? "uz_UZ",
      alternateLocale:
        options?.ogLocale === "ru_UZ" ? ["uz_UZ"] : ["ru_UZ"],
      type: options?.ogType ?? "website",
      images: [
        {
          url: options?.image ?? "/images/og/default.png",
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [options?.image ?? "/images/og/default.png"],
    },
    robots,
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteUrl()),
  title: {
    default: SITE_CONFIG.title,
    template: `%s — ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  robots: robotsForDeployment(),
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "uz_UZ",
    images: [
      {
        url: "/images/og/default.png",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/images/og/default.png"],
  },
  other: {
    "theme-color": SITE_CONFIG.themeColor,
  },
};

export function isProdIndexable() {
  return isIndexableDeployment();
}
