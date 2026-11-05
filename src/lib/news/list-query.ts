/**
 * Client-safe news list query helpers (no DB / admin imports).
 */
import type {
  NewsCategory,
  NewsListQuery,
  NewsSort,
} from "@/data/news/types";
import { intlLocale, type Locale } from "@/i18n/config";

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

export function isNewsCategory(value: string): value is NewsCategory {
  if (!value || value === "all") return false;
  // CMS-managed slugs; seed list is only a fallback for empty DB.
  return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
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

export function formatNewsDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
