export type NewsStatus = "published" | "draft";

/** Curated filters for the news index — keep tags free-form for CMS later. */
export const NEWS_CATEGORIES = [
  "company",
  "product",
  "business",
  "geography",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsSort = "newest" | "oldest" | "title-asc" | "title-desc";

export interface NewsLocaleContent {
  title: string;
  excerpt: string;
  body: string[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  status: NewsStatus;
  category: NewsCategory;
  publishedAt: string;
  coverImage?: string;
  tags?: string[];
  locales: {
    uz: NewsLocaleContent;
    ru: NewsLocaleContent;
  };
}

export interface LocalizedNewsArticle {
  id: string;
  slug: string;
  category: NewsCategory;
  publishedAt: string;
  coverImage?: string;
  tags?: string[];
  title: string;
  excerpt: string;
  body: string[];
}

export interface NewsListQuery {
  category?: NewsCategory | "all";
  sort?: NewsSort;
  page?: number;
  /** Numeric template or `"all"` (12+ / entire list). */
  pageSize?: number | "all";
  q?: string;
}

export interface NewsCategoryCount {
  id: NewsCategory;
  count: number;
}

export interface NewsListResult {
  items: LocalizedNewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: NewsCategoryCount[];
}
