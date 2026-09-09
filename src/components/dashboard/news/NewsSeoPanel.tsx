"use client";

import { useState } from "react";
import { dashInput } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

type NewsSeoPanelProps = {
  locale: "uz" | "ru";
  titleFallback: string;
  excerptFallback: string;
  defaults: {
    seoTitle: string;
    seoDescription: string;
    ogTitle: string;
    ogDescription: string;
  };
  slug: string;
};

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span className={cn("text-[0.7rem]", over ? "text-primary" : "text-black/35")}>
      {value}/{max}
    </span>
  );
}

export function NewsSeoPanel({
  locale,
  titleFallback,
  excerptFallback,
  defaults,
  slug,
}: NewsSeoPanelProps) {
  return (
    <NewsSeoPanelInner
      key={locale}
      locale={locale}
      titleFallback={titleFallback}
      excerptFallback={excerptFallback}
      defaults={defaults}
      slug={slug}
    />
  );
}

function NewsSeoPanelInner({
  locale,
  titleFallback,
  excerptFallback,
  defaults,
  slug,
}: NewsSeoPanelProps) {
  const [seoTitle, setSeoTitle] = useState(defaults.seoTitle);
  const [seoDesc, setSeoDesc] = useState(defaults.seoDescription);
  const [ogTitle, setOgTitle] = useState(defaults.ogTitle);
  const [ogDesc, setOgDesc] = useState(defaults.ogDescription);

  const previewTitle = (seoTitle || titleFallback || "Title").trim();
  const previewDesc = (seoDesc || excerptFallback || "").trim();
  const path =
    locale === "ru"
      ? `https://epos-pochta.uz/ru/news/${slug || "…"}/`
      : `https://epos-pochta.uz/news/${slug || "…"}/`;

  return (
    <div className="grid gap-3">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
        SEO · {locale.toUpperCase()}
      </p>

      <label className="grid gap-1 text-sm font-medium text-ink">
        <span className="flex items-center justify-between gap-2">
          SEO title
          <Counter value={seoTitle.length} max={60} />
        </span>
        <input
          name={`seo_title_${locale}`}
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder={titleFallback}
          className={dashInput}
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-ink">
        <span className="flex items-center justify-between gap-2">
          SEO description
          <Counter value={seoDesc.length} max={160} />
        </span>
        <textarea
          name={`seo_description_${locale}`}
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          rows={3}
          placeholder={excerptFallback}
          className={dashInput}
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-ink">
        OG title
        <input
          name={`og_title_${locale}`}
          value={ogTitle}
          onChange={(e) => setOgTitle(e.target.value)}
          placeholder={seoTitle || titleFallback}
          className={dashInput}
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-ink">
        OG description
        <textarea
          name={`og_description_${locale}`}
          value={ogDesc}
          onChange={(e) => setOgDesc(e.target.value)}
          rows={2}
          placeholder={seoDesc || excerptFallback}
          className={dashInput}
        />
      </label>

      <div className="rounded-xl border border-black/[0.06] bg-[#fafbfc] p-3">
        <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-wide text-black/35">
          SERP preview
        </p>
        <p className="m-0 mt-2 truncate text-sm text-[#1a0dab]">{previewTitle}</p>
        <p className="m-0 truncate text-xs text-[#006621]">{path}</p>
        <p className="m-0 mt-1 line-clamp-2 text-xs text-black/55">{previewDesc}</p>
      </div>
    </div>
  );
}
