export type NewsStatus = "published" | "draft";

export interface NewsLocaleContent {
  title: string;
  excerpt: string;
  body: string[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  status: NewsStatus;
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
  publishedAt: string;
  coverImage?: string;
  tags?: string[];
  title: string;
  excerpt: string;
  body: string[];
}
