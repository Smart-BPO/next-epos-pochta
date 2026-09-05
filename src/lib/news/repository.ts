import { newsArticles } from "@/data/news/articles";
import type {
  LocalizedNewsArticle,
  NewsArticle,
  NewsCategory,
  NewsListQuery,
  NewsListResult,
  NewsSort,
} from "@/data/news/types";
import { NEWS_CATEGORIES } from "@/data/news/types";
import type { Locale } from "@/i18n/config";
import { fetchNewsArticlesFromDb } from "@/lib/cms/news";
import { cache } from "react";

/** Allowed page-size templates for the news index (`all` = 12+ / show everything). */
export const NEWS_PAGE_SIZE_OPTIONS = [3, 6, 9, 12, "all"] as const;
export type NewsPageSize = (typeof NEWS_PAGE_SIZE_OPTIONS)[number];
export const NEWS_PAGE_SIZE_DEFAULT: NewsPageSize = 6;
/** @deprecated Prefer NEWS_PAGE_SIZE_DEFAULT */
export const NEWS_PAGE_SIZE = NEWS_PAGE_SIZE_DEFAULT;

export function isNewsPageSize(value: unknown): value is NewsPageSize {
  return (NEWS_PAGE_SIZE_OPTIONS as readonly unknown[]).includes(value);
}

export function resolveNewsPageSize(
  pageSize: NewsPageSize | number | undefined,
  total = Number.MAX_SAFE_INTEGER,
): number {
  if (pageSize === "all") return Math.max(1, total);
  if (typeof pageSize === "number" && isNewsPageSize(pageSize)) return pageSize;
  return NEWS_PAGE_SIZE_DEFAULT === "all"
    ? Math.max(1, total)
    : NEWS_PAGE_SIZE_DEFAULT;
}

function localize(
  article: NewsArticle,
  locale: Locale,
): LocalizedNewsArticle {
  const content = article.locales[locale];
  return {
    id: article.id,
    slug: article.slug,
    category: article.category,
    publishedAt: article.publishedAt,
    coverImage: article.coverImage,
    tags: article.tags,
    title: content.title,
    excerpt: content.excerpt,
    body: content.body,
  };
}

const loadArticles = cache(async (): Promise<NewsArticle[]> => {
  const fromDb = await fetchNewsArticlesFromDb();
  if (fromDb && fromDb.length > 0) return fromDb;
  return newsArticles;
});

async function publishedArticles(): Promise<NewsArticle[]> {
  const all = await loadArticles();
  return all.filter((article) => article.status === "published");
}

function compareTitle(a: string, b: string, locale: Locale) {
  return a.localeCompare(b, locale === "uz" ? "uz" : "ru", {
    sensitivity: "base",
  });
}

function sortArticles(
  items: LocalizedNewsArticle[],
  sort: NewsSort,
  locale: Locale,
): LocalizedNewsArticle[] {
  const next = [...items];
  switch (sort) {
    case "oldest":
      return next.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    case "title-asc":
      return next.sort((a, b) => compareTitle(a.title, b.title, locale));
    case "title-desc":
      return next.sort((a, b) => compareTitle(b.title, a.title, locale));
    case "newest":
    default:
      return next.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }
}

function matchesQuery(article: LocalizedNewsArticle, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    article.title.toLowerCase().includes(needle) ||
    article.excerpt.toLowerCase().includes(needle) ||
    (article.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
  );
}

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
}

export function isNewsSort(value: string): value is NewsSort {
  return (
    value === "newest" ||
    value === "oldest" ||
    value === "title-asc" ||
    value === "title-desc"
  );
}

export function parseNewsListQuery(
  raw: Record<string, string | string[] | undefined> | URLSearchParams,
): Required<Pick<NewsListQuery, "category" | "sort" | "page">> & {
  pageSize: NewsPageSize;
  q: string;
} {
  const get = (key: string) => {
    if (raw instanceof URLSearchParams) return raw.get(key) ?? "";
    const value = raw[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  };

  const categoryRaw = get("category");
  const sortRaw = get("sort");
  const pageRaw = Number.parseInt(get("page"), 10);
  const perRaw = get("per") || get("pageSize");
  const pageSizeNum = Number.parseInt(perRaw, 10);
  const q = get("q").trim();

  let pageSize: NewsPageSize = NEWS_PAGE_SIZE_DEFAULT;
  if (perRaw === "all" || perRaw === "12+") {
    pageSize = "all";
  } else if (isNewsPageSize(pageSizeNum)) {
    pageSize = pageSizeNum;
  }

  return {
    category: isNewsCategory(categoryRaw) ? categoryRaw : "all",
    sort: isNewsSort(sortRaw) ? sortRaw : "newest",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    pageSize,
    q,
  };
}

export function buildNewsListSearchParams(query: {
  category?: string;
  sort?: string;
  page?: number;
  pageSize?: NewsPageSize | number;
  q?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (query.category && query.category !== "all") {
    params.set("category", query.category);
  }
  if (query.sort && query.sort !== "newest") {
    params.set("sort", query.sort);
  }
  if (query.pageSize === "all") {
    params.set("per", "all");
  } else if (
    typeof query.pageSize === "number" &&
    isNewsPageSize(query.pageSize) &&
    query.pageSize !== NEWS_PAGE_SIZE_DEFAULT
  ) {
    params.set("per", String(query.pageSize));
  }
  if (query.q?.trim()) {
    params.set("q", query.q.trim());
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  return params;
}

export async function queryNews(
  locale: Locale,
  rawQuery: NewsListQuery = {},
): Promise<NewsListResult> {
  const category = rawQuery.category ?? "all";
  const sort = rawQuery.sort ?? "newest";
  const q = rawQuery.q ?? "";

  const localized = (await publishedArticles()).map((article) =>
    localize(article, locale),
  );

  const categories = NEWS_CATEGORIES.map((id) => ({
    id,
    count: localized.filter((article) => article.category === id).length,
  })).filter((item) => item.count > 0);

  const filtered = localized.filter((article) => {
    if (category !== "all" && article.category !== category) return false;
    return matchesQuery(article, q);
  });

  const sorted = sortArticles(filtered, sort, locale);
  const total = sorted.length;
  const template = isNewsPageSize(rawQuery.pageSize)
    ? rawQuery.pageSize
    : NEWS_PAGE_SIZE_DEFAULT;
  const pageSize = resolveNewsPageSize(template, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(Math.max(1, rawQuery.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
    categories,
  };
}

export async function listNews(locale: Locale): Promise<LocalizedNewsArticle[]> {
  return (await queryNews(locale, { page: 1, pageSize: Number.MAX_SAFE_INTEGER }))
    .items;
}

export async function getNewsBySlug(
  locale: Locale,
  slug: string,
): Promise<LocalizedNewsArticle | null> {
  const article = (await publishedArticles()).find((item) => item.slug === slug);
  return article ? localize(article, locale) : null;
}

export async function getLatestNews(
  locale: Locale,
  limit = 3,
): Promise<LocalizedNewsArticle[]> {
  return (
    await queryNews(locale, {
      sort: "newest",
      page: 1,
      pageSize: limit,
    })
  ).items;
}

export async function listPublishedSlugs(): Promise<string[]> {
  return (await publishedArticles())
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .map((article) => article.slug);
}

export function formatNewsDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
