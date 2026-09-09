import type { NewsArticle, NewsCategory, NewsStatus } from "@/data/news/types";
import { newsArticles as siteNewsSeed } from "@/data/news/articles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { cache } from "react";

type ArticleRow = {
  id: string;
  slug: string;
  status: string;
  category: string;
  cover_image: string | null;
  published_at: string | null;
};

type TranslationRow = {
  article_id: string;
  locale: string;
  title: string;
  excerpt: string;
  body: string;
};

function parseBody(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        return parsed;
      }
    } catch {
      // fall through
    }
  }
  return trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

function serializeBody(body: string[]): string {
  return JSON.stringify(body);
}

function isCategory(value: string): value is NewsCategory {
  return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
}

function mapRows(
  articles: ArticleRow[],
  translations: TranslationRow[],
): NewsArticle[] {
  const mapped: NewsArticle[] = [];
  for (const row of articles) {
    const uz = translations.find(
      (t) => t.article_id === row.id && t.locale === "uz",
    );
    const ru = translations.find(
      (t) => t.article_id === row.id && t.locale === "ru",
    );
    if (!uz || !ru || !isCategory(row.category)) continue;
    mapped.push({
      id: row.id,
      slug: row.slug,
      status: (row.status === "draft" ? "draft" : "published") as NewsStatus,
      category: row.category,
      publishedAt: row.published_at ?? new Date().toISOString(),
      coverImage: row.cover_image ?? undefined,
      locales: {
        uz: {
          title: uz.title,
          excerpt: uz.excerpt,
          body: parseBody(uz.body),
        },
        ru: {
          title: ru.title,
          excerpt: ru.excerpt,
          body: parseBody(ru.body),
        },
      },
    });
  }
  return mapped;
}

/**
 * One-shot (per request via cache): copy public site seed articles into CMS
 * when their slug is missing. Existing CMS rows are never overwritten.
 */
export const ensureSiteNewsInCms = cache(async (): Promise<number> => {
  if (!hasSupabaseAdminConfig()) return 0;
  const admin = createSupabaseAdminClient();
  const { data: existing, error } = await admin
    .from("epos_news_articles")
    .select("slug");
  if (error) {
    console.error("[cms:news:ensure]", error.message);
    return 0;
  }
  const have = new Set((existing ?? []).map((row) => row.slug as string));
  let inserted = 0;
  for (const article of siteNewsSeed) {
    if (have.has(article.slug)) continue;
    await upsertNewsArticle({
      slug: article.slug,
      status: article.status,
      category: article.category,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      locales: article.locales,
    });
    inserted += 1;
  }
  return inserted;
});

/** CMS articles when Supabase is configured; null only if admin env missing. */
export async function fetchNewsArticlesFromDb(): Promise<NewsArticle[] | null> {
  if (!hasSupabaseAdminConfig()) return null;
  try {
    await ensureSiteNewsInCms();
    const admin = createSupabaseAdminClient();
    const { data: articles, error } = await admin
      .from("epos_news_articles")
      .select("id, slug, status, category, cover_image, published_at")
      .order("published_at", { ascending: false });
    if (error) {
      console.error("[cms:news:fetch]", error.message);
      return [];
    }
    if (!articles?.length) return [];

    const ids = articles.map((a) => a.id);
    const { data: translations } = await admin
      .from("epos_news_translations")
      .select("article_id, locale, title, excerpt, body")
      .in("article_id", ids);

    return mapRows(
      articles as ArticleRow[],
      (translations ?? []) as TranslationRow[],
    );
  } catch (err) {
    console.error("[cms:news:fetch]", err);
    return [];
  }
}

export type NewsUpsertInput = {
  id?: string;
  slug: string;
  status: NewsStatus;
  category: NewsCategory;
  coverImage?: string;
  publishedAt?: string;
  locales: {
    uz: { title: string; excerpt: string; body: string[] };
    ru: { title: string; excerpt: string; body: string[] };
  };
};

export async function upsertNewsArticle(input: NewsUpsertInput) {
  const admin = createSupabaseAdminClient();
  const id = input.id ?? crypto.randomUUID();
  const publishedAt =
    input.status === "published"
      ? (input.publishedAt ?? new Date().toISOString())
      : (input.publishedAt ?? null);

  const { error: articleError } = await admin.from("epos_news_articles").upsert({
    id,
    slug: input.slug,
    status: input.status,
    category: input.category,
    cover_image: input.coverImage || null,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  });
  if (articleError) throw new Error(articleError.message);

  for (const locale of ["uz", "ru"] as const) {
    const loc = input.locales[locale];
    const { error } = await admin.from("epos_news_translations").upsert(
      {
        article_id: id,
        locale,
        title: loc.title,
        excerpt: loc.excerpt,
        body: serializeBody(loc.body),
      },
      { onConflict: "article_id,locale" },
    );
    if (error) throw new Error(error.message);
  }

  return id;
}

export async function deleteNewsArticle(id: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("epos_news_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type NewsAdminRow = {
  id: string;
  slug: string;
  status: string;
  category: string;
  cover_image: string | null;
  published_at: string | null;
  updated_at: string | null;
  title: string;
};

export async function listNewsAdminRows(): Promise<NewsAdminRow[]> {
  if (!hasSupabaseAdminConfig()) return [];
  await ensureSiteNewsInCms();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_news_articles")
    .select("id, slug, status, category, cover_image, published_at, updated_at")
    .order("updated_at", { ascending: false });
  const rows = data ?? [];
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const { data: translations } = await admin
    .from("epos_news_translations")
    .select("article_id, locale, title")
    .in("article_id", ids)
    .eq("locale", "uz");

  const titleById = new Map(
    (translations ?? []).map((t) => [t.article_id as string, t.title as string]),
  );

  return rows.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    status: row.status as string,
    category: row.category as string,
    cover_image: (row.cover_image as string | null) ?? null,
    published_at: (row.published_at as string | null) ?? null,
    updated_at: (row.updated_at as string | null) ?? null,
    title: titleById.get(row.id as string) || (row.slug as string),
  }));
}

export async function getNewsAdminById(id: string): Promise<NewsArticle | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const admin = createSupabaseAdminClient();
  const { data: article } = await admin
    .from("epos_news_articles")
    .select("id, slug, status, category, cover_image, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!article) return null;
  const { data: translations } = await admin
    .from("epos_news_translations")
    .select("article_id, locale, title, excerpt, body")
    .eq("article_id", id);
  const mapped = mapRows(
    [article as ArticleRow],
    (translations ?? []) as TranslationRow[],
  );
  return mapped[0] ?? null;
}
