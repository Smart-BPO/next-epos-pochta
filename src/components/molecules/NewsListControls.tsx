"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { SiteCopy } from "@/data/types";
import type {
  NewsCategory,
  NewsCategoryCount,
  NewsSort,
} from "@/data/news/types";
import { buildNewsListSearchParams } from "@/lib/news/repository";
import { cn } from "@/lib/cn";
import {
  fieldControl,
  quizChip,
  quizChipActive,
  quizChipIdle,
  quizChips,
} from "@/styles/ui";

type NewsCopy = SiteCopy["news"];

function hrefFor(
  pathname: string,
  next: {
    category?: string;
    sort?: string;
    page?: number;
    q?: string;
  },
) {
  const params = buildNewsListSearchParams(next);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function NewsListControls({
  copy,
  categories,
  category,
  sort,
  q,
}: {
  copy: NewsCopy;
  categories: NewsCategoryCount[];
  category: NewsCategory | "all";
  sort: NewsSort;
  q: string;
  page: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (search.trim() === q.trim()) return;
      startTransition(() => {
        router.push(
          hrefFor(pathname, {
            category,
            sort,
            page: 1,
            q: search,
          }),
          { scroll: false },
        );
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search, q, category, sort, pathname, router]);

  const hasFilters =
    category !== "all" || sort !== "newest" || q.trim().length > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        isPending && "opacity-70 transition-opacity",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label className="sr-only" htmlFor="news-search">
            {copy.searchPlaceholder}
          </label>
          <input
            id="news-search"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className={`${fieldControl} w-full !py-3`}
            autoComplete="off"
          />
        </div>

        <div className="flex w-full flex-col gap-1.5 sm:max-w-xs lg:w-auto">
          <label
            htmlFor="news-sort"
            className="text-sm font-semibold uppercase tracking-wide text-black/40"
          >
            {copy.sortLabel}
          </label>
          <select
            id="news-sort"
            className={`${fieldControl} w-full !py-3`}
            value={sort}
            onChange={(e) => {
              startTransition(() => {
                router.push(
                  hrefFor(pathname, {
                    category,
                    sort: e.target.value,
                    page: 1,
                    q: search,
                  }),
                  { scroll: false },
                );
              });
            }}
          >
            <option value="newest">{copy.sortNewest}</option>
            <option value="oldest">{copy.sortOldest}</option>
            <option value="title-asc">{copy.sortTitleAsc}</option>
            <option value="title-desc">{copy.sortTitleDesc}</option>
          </select>
        </div>
      </div>

      <div>
        <p className="m-0 mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">
          {copy.categoriesTitle}
        </p>
        <div className={quizChips}>
          <Link
            href={hrefFor(pathname, {
              category: "all",
              sort,
              q: search,
              page: 1,
            })}
            className={cn(
              quizChip,
              category === "all" ? quizChipActive : quizChipIdle,
            )}
            scroll={false}
            aria-current={category === "all" ? "page" : undefined}
          >
            {copy.allCategories}
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={hrefFor(pathname, {
                category: item.id,
                sort,
                q: search,
                page: 1,
              })}
              className={cn(
                quizChip,
                category === item.id ? quizChipActive : quizChipIdle,
              )}
              scroll={false}
              aria-current={category === item.id ? "page" : undefined}
            >
              {copy.categories[item.id]}
              <span className="ml-1.5 opacity-60">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {hasFilters ? (
        <div>
          <Link
            href={pathname}
            className="text-sm font-medium text-primary hover:underline"
            scroll={false}
          >
            {copy.resetFilters}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function NewsPagination({
  copy,
  page,
  totalPages,
  category,
  sort,
  q,
}: {
  copy: NewsCopy;
  page: number;
  totalPages: number;
  category: NewsCategory | "all";
  sort: NewsSort;
  q: string;
}) {
  const pathname = usePathname();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label={copy.pageLabel
        .replace("{page}", String(page))
        .replace("{pages}", String(totalPages))}
    >
      <p className="m-0 text-sm text-black/50">
        {copy.pageLabel
          .replace("{page}", String(page))
          .replace("{pages}", String(totalPages))}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(pathname, {
              category,
              sort,
              q,
              page: page - 1,
            })}
            className={cn(quizChip, quizChipIdle)}
          >
            {copy.prevPage}
          </Link>
        ) : (
          <span
            className={cn(
              quizChip,
              quizChipIdle,
              "pointer-events-none opacity-40",
            )}
          >
            {copy.prevPage}
          </span>
        )}

        {pages.map((n) => (
          <Link
            key={n}
            href={hrefFor(pathname, { category, sort, q, page: n })}
            className={cn(
              quizChip,
              n === page ? quizChipActive : quizChipIdle,
              "min-w-11 justify-center",
            )}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={hrefFor(pathname, {
              category,
              sort,
              q,
              page: page + 1,
            })}
            className={cn(quizChip, quizChipIdle)}
          >
            {copy.nextPage}
          </Link>
        ) : (
          <span
            className={cn(
              quizChip,
              quizChipIdle,
              "pointer-events-none opacity-40",
            )}
          >
            {copy.nextPage}
          </span>
        )}
      </div>
    </nav>
  );
}
