import type { NewsArticle, NewsCategory, NewsStatus } from "@/data/news/types";
import { NEWS_CATEGORIES } from "@/data/news/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

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
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
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

/** Returns CMS articles or null if DB empty / unavailable (caller uses seed). */
export async function fetchNewsArticlesFromDb(): Promise<NewsArticle[] | null> {
  if (!hasSupabaseAdminConfig()) return null;
  try {
    const admin = createSupabaseAdminClient();
    const { data: articles, error } = await admin
      .from("epos_news_articles")
      .select("id, slug, status, category, cover_image, published_at")
      .order("published_at", { ascending: false });
    if (error || !articles?.length) return null;

    const ids = articles.map((a) => a.id);
    const { data: translations } = await admin
      .from("epos_news_translations")
      .select("article_id, locale, title, excerpt, body")
      .in("article_id", ids);

    const mapped = mapRows(
      articles as ArticleRow[],
      (translations ?? []) as TranslationRow[],
    );
    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
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

export async function listNewsAdminRows() {
  if (!hasSupabaseAdminConfig()) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_news_articles")
    .select("id, slug, status, category, published_at, updated_at")
    .order("updated_at", { ascending: false });
  return data ?? [];
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
