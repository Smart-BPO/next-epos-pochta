import { newsArticles } from "@/data/news/articles";
import type {
  LocalizedNewsArticle,
  NewsArticle,
  NewsCategory,
  NewsListQuery,
  NewsListResult,
  NewsSort,
} from "@/data/news/types";
import { intlLocale, type Locale } from "@/i18n/config";
import { fetchNewsArticlesFromDb } from "@/lib/cms/news";
import { listNewsCategories } from "@/lib/cms/news-categories";
import { cache } from "react";
import {
  NEWS_PAGE_SIZE_DEFAULT,
  isNewsPageSize,
  resolveNewsPageSize,
  type NewsPageSize,
} from "@/lib/news/list-query";

export {
  NEWS_PAGE_SIZE_OPTIONS,
  NEWS_PAGE_SIZE_DEFAULT,
  NEWS_PAGE_SIZE,
  isNewsPageSize,
  resolveNewsPageSize,
  isNewsCategory,
  isNewsSort,
  parseNewsListQuery,
  buildNewsListSearchParams,
  formatNewsDate,
  type NewsPageSize,
} from "@/lib/news/list-query";

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
    coverAlt: article.coverAlt,
    ogImage: article.ogImage,
    tags: article.tags,
    noindex: article.noindex,
    title: content.title,
    excerpt: content.excerpt,
    bodyHtml: content.bodyHtml,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    ogTitle: content.ogTitle,
    ogDescription: content.ogDescription,
  };
}

const loadArticles = cache(async (): Promise<NewsArticle[]> => {
  const fromDb = await fetchNewsArticlesFromDb();
  // Supabase configured → CMS is source of truth (seed auto-imported once).
  if (fromDb !== null) return fromDb;
  return newsArticles;
});

async function publishedArticles(): Promise<NewsArticle[]> {
  const all = await loadArticles();
  return all.filter((article) => article.status === "published");
}

function compareTitle(a: string, b: string, locale: Locale) {
  return a.localeCompare(b, intlLocale(locale), {
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

  const fromTaxonomy = await listNewsCategories();
  const categoryIds = new Set<string>([
    ...fromTaxonomy.map((c) => c.id),
    ...localized.map((a) => a.category),
  ]);
  const categories = [...categoryIds]
    .map((id) => ({
      id: id as NewsCategory,
      count: localized.filter((article) => article.category === id).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => a.id.localeCompare(b.id));

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

