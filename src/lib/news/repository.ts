import { newsArticles } from "@/data/news/articles";
import type {
  LocalizedNewsArticle,
  NewsArticle,
} from "@/data/news/types";
import type { Locale } from "@/i18n/config";

/** TODO(cms): swap static import for Supabase query when connected. */

function localize(
  article: NewsArticle,
  locale: Locale,
): LocalizedNewsArticle {
  const content = article.locales[locale];
  return {
    id: article.id,
    slug: article.slug,
    publishedAt: article.publishedAt,
    coverImage: article.coverImage,
    tags: article.tags,
    title: content.title,
    excerpt: content.excerpt,
    body: content.body,
  };
}

function publishedArticles(): NewsArticle[] {
  return newsArticles
    .filter((article) => article.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function listNews(locale: Locale): LocalizedNewsArticle[] {
  return publishedArticles().map((article) => localize(article, locale));
}

export function getNewsBySlug(
  locale: Locale,
  slug: string,
): LocalizedNewsArticle | null {
  const article = publishedArticles().find((item) => item.slug === slug);
  return article ? localize(article, locale) : null;
}

export function getLatestNews(
  locale: Locale,
  limit = 3,
): LocalizedNewsArticle[] {
  return listNews(locale).slice(0, limit);
}

export function listPublishedSlugs(): string[] {
  return publishedArticles().map((article) => article.slug);
}

export function formatNewsDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
