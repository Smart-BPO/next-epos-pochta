import type { MetadataRoute } from "next";
import { pagePaths } from "@/i18n/config";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { listPublishedSlugs } from "@/lib/news/repository";
import { loadDeliveryCities } from "@/lib/cms/delivery-hubs";
import { listDeliveryRouteParams, routePath } from "@/data/delivery-routes";
import { cityPath } from "@/data/delivery-cities";
import { SERVICE_SLUGS, servicePath } from "@/data/seo/service-landings";
import { SEO_PRIORITY_HUB_CODES } from "@/data/seo/goals";
import {
  getCanonicalSiteUrl,
  isIndexableDeployment,
} from "@/utils/seo/indexing";

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

const PRIORITY_HUBS = new Set<string>(SEO_PRIORITY_HUB_CODES);

function languageAlternates(path: string) {
  const base = getCanonicalSiteUrl();
  const alts = getLocalizedAlternates(path);
  return {
    languages: {
      uz: `${base}${alts.uz}`,
      ru: `${base}${alts.ru}`,
      "x-default": `${base}${alts["x-default"]}`,
    },
  };
}

function pushLocalized(
  entries: MetadataRoute.Sitemap,
  path: string,
  meta: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
) {
  const base = getCanonicalSiteUrl();
  for (const locale of ["uz", "ru"] as const) {
    entries.push({
      url: `${base}${localePath(locale, path)}`,
      ...meta,
      alternates: languageAlternates(path),
    });
  }
}

function routeSitemapPriority(from: string, to: string): number {
  const a = from.toLowerCase();
  const b = to.toLowerCase();
  const bothPriority = PRIORITY_HUBS.has(a) && PRIORITY_HUBS.has(b);
  const touchesTas = a === "tas" || b === "tas";
  if (touchesTas && bothPriority) return 0.82;
  if (bothPriority) return 0.72;
  if (touchesTas) return 0.65;
  return 0.5;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableDeployment()) return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const key of indexablePages) {
    const path = pagePaths[key];
    pushLocalized(entries, path, {
      lastModified: now,
      changeFrequency: key === "home" || key === "news" ? "weekly" : "monthly",
      priority: pagePriority[key] ?? 0.5,
    });
  }

  pushLocalized(entries, "/delivery/", {
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  });

  const cities = await loadDeliveryCities();
  for (const city of cities) {
    pushLocalized(entries, cityPath(city.slug), {
      lastModified: now,
      changeFrequency: "weekly",
      priority: city.code === "tas" ? 0.88 : 0.8,
    });
  }

  for (const slug of SERVICE_SLUGS) {
    pushLocalized(entries, servicePath(slug), {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.86,
    });
  }

  for (const { from, to } of listDeliveryRouteParams(cities)) {
    pushLocalized(entries, routePath(from, to), {
      lastModified: now,
      changeFrequency: "monthly",
      priority: routeSitemapPriority(from, to),
    });
  }

  for (const slug of await listPublishedSlugs()) {
    pushLocalized(entries, `/news/${slug}/`, {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.55,
    });
  }

  return entries;
}
