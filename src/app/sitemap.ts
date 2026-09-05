import type { MetadataRoute } from "next";
import { pagePaths } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { listPublishedSlugs } from "@/lib/news/repository";
import { getCanonicalSiteUrl, isIndexableDeployment } from "@/utils/seo/indexing";

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
  const entries: MetadataRoute.Sitemap = [];

  for (const key of indexablePages) {
    const path = pagePaths[key];
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        changeFrequency: key === "home" || key === "news" ? "weekly" : "monthly",
        priority: key === "home" ? 1 : key === "news" ? 0.6 : 0.7,
      });
    }
  }

  for (const slug of listPublishedSlugs()) {
    const path = `/news/${slug}/`;
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
  }

  return entries;
}
