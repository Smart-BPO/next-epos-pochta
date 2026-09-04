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

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
  options?: {
    image?: string;
    locale?: string;
    ogLocale?: string;
    robots?: Metadata["robots"];
    alternates?: Record<string, string>;
    noIndex?: boolean;
  },
): Metadata {
  const url = canonicalPageUrl(path);
  const robots =
    options?.robots ??
    (options?.noIndex
      ? { index: false, follow: false }
      : robotsForDeployment());

  return {
    title,
    description,
    metadataBase: new URL(getCanonicalSiteUrl()),
    alternates: {
      canonical: url,
      languages: options?.alternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: options?.ogLocale ?? "ru_UZ",
      type: "website",
      ...(options?.image
        ? { images: [{ url: options.image, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    locale: "ru_UZ",
  },
  other: {
    "theme-color": SITE_CONFIG.themeColor,
  },
};

export function isProdIndexable() {
  return isIndexableDeployment();
}
