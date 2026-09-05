import type { MetadataRoute } from "next";
import { pagePaths } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { listPublishedSlugs } from "@/lib/news/repository";
import { listDeliveryCitySlugs } from "@/data/delivery-cities";
import { getCanonicalSiteUrl, isIndexableDeployment } from "@/utils/seo/indexing";

const pagePriority: Record<string, number> = {
  home: 1,
  services: 0.9,
  calculator: 0.9,
  business: 0.85,
  contacts: 0.8,
  faq: 0.75,
  about: 0.7,
  news: 0.65,
  privacy: 0.3,
  terms: 0.3,
};

const indexablePages = [
  "home",
  "services",
  "business",
  "about",
  "news",
  "contacts",
  "privacy",
  "terms",
  "calculator",
  "faq",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment()) return [];

  const base = getCanonicalSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const key of indexablePages) {
    const path = pagePaths[key];
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: key === "home" || key === "news" ? "weekly" : "monthly",
        priority: pagePriority[key] ?? 0.5,
      });
    }
  }

  for (const locale of ["uz", "ru"] as const) {
    entries.push({
      url: `${base}${localePath(locale, "/delivery/")}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  for (const slug of listDeliveryCitySlugs()) {
    const path = `/delivery/${slug}/`;
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  for (const slug of listPublishedSlugs()) {
    const path = `/news/${slug}/`;
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
  }

  return entries;
}
