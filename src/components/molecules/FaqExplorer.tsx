"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { SiteCopy } from "@/data/types";
import { cn } from "@/lib/cn";
import {
  fieldControl,
  quizChip,
  quizChipActive,
  quizChipIdle,
  quizChips,
} from "@/styles/ui";

type FaqCopy = SiteCopy["faq"];

export function FaqExplorer({ faq }: { faq: FaqCopy }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(faq.items[0]?.id ?? null);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return faq.items.filter((item) => {
      if (categoryId !== "all" && item.categoryId !== categoryId) return false;
      if (!normalizedQuery) return true;
      return (
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [faq.items, categoryId, normalizedQuery]);

  const resultsLabel = faq.resultsLabel.replace(
    "{count}",
    String(filtered.length),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-10">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
        <div>
          <label className="sr-only" htmlFor="faq-search">
            {faq.searchPlaceholder}
          </label>
          <input
            id="faq-search"
            name="faq_search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={faq.searchPlaceholder}
            className={`${fieldControl} w-full !py-3`}
            autoComplete="off"
          />
        </div>

        <div>
          <p className="m-0 mb-3 font-display text-sm font-semibold uppercase tracking-wide text-black/50">
            {faq.topicsTitle}
          </p>
          <div className={`${quizChips} lg:flex-col lg:items-stretch`}>
            <button
              type="button"
              className={cn(
                quizChip,
                "lg:justify-start",
                categoryId === "all" ? quizChipActive : quizChipIdle,
              )}
              onClick={() => setCategoryId("all")}
            >
              {faq.allCategories}
            </button>
            {faq.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={cn(
                  quizChip,
                  "lg:justify-start",
                  categoryId === cat.id ? quizChipActive : quizChipIdle,
                )}
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        <p className="m-0 text-sm text-black/45">{resultsLabel}</p>
      </aside>

      <div className="flex flex-col gap-6">
        {categoryId === "all" && !normalizedQuery ? (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {faq.categories.map((cat) => {
              const count = faq.items.filter(
                (item) => item.categoryId === cat.id,
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className="rounded-2xl border border-black/10 bg-white p-3 text-left transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-[0_10px_28px_rgb(15_18_24/0.06)] sm:p-4"
                >
                  <span className="font-display text-sm font-semibold uppercase leading-snug text-black sm:text-base">
                    {cat.title}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-black/55 sm:text-sm">
                    {cat.description}
                  </span>
                  <span className="mt-2 block text-xs font-medium text-primary sm:mt-3">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <p className="m-0 rounded-2xl border border-dashed border-black/15 bg-white px-5 py-8 text-center text-black/55">
            {faq.emptySearch}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item, index) => {
              const isOpen = openId === item.id;
              const category = faq.categories.find(
                (c) => c.id === item.categoryId,
              );
              return (
                <article
                  key={item.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow]",
                    isOpen
                      ? "border-primary/40 shadow-[0_12px_32px_rgb(211_2_3/0.08)]"
                      : "border-black/10",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      {category ? (
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-primary/80">
                          {category.title}
                        </span>
                      ) : null}
                      <span className="block text-lg font-medium text-black sm:text-xl">
                        {item.question}
                      </span>
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-black/10 sm:size-12">
                      <Image
                        src={
                          isOpen
                            ? "/images/home/faq-close.svg"
                            : "/images/home/faq-open.svg"
                        }
                        alt=""
                        width={22}
                        height={22}
                        unoptimized
                      />
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-black/5 px-4 pb-5 pt-0 sm:px-5">
                      <p className="m-0 pl-11 text-base leading-relaxed text-black/65 sm:pl-12 sm:text-lg">
                        {item.answer}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
