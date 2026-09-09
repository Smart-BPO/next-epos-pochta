"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useMemo, useState, useSyncExternalStore } from "react";
import { NEWS_CATEGORIES } from "@/data/news/types";
import {
  deleteNewsAction,
  saveNewsAction,
} from "@/app/dashboard/(app)/news/actions";
import { DashImageField } from "@/components/dashboard/news/DashImageField";
import { NewsRichEditor } from "@/components/dashboard/news/NewsRichEditor";
import { NewsSeoPanel } from "@/components/dashboard/news/NewsSeoPanel";
import { NewsTagsInput } from "@/components/dashboard/news/NewsTagsInput";
import {
  DashFormField,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCard,
  dashInput,
} from "@/components/dashboard/ui";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { dashMobileActionBar } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export type NewsFormValues = {
  id?: string;
  slug: string;
  status: string;
  category: string;
  coverImage: string;
  coverAlt: string;
  ogImage: string;
  tags: string[];
  noindex: boolean;
  publishedAt: string;
  titleUz: string;
  excerptUz: string;
  bodyHtmlUz: string;
  seoTitleUz: string;
  seoDescriptionUz: string;
  ogTitleUz: string;
  ogDescriptionUz: string;
  titleRu: string;
  excerptRu: string;
  bodyHtmlRu: string;
  seoTitleRu: string;
  seoDescriptionRu: string;
  ogTitleRu: string;
  ogDescriptionRu: string;
};

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function toDatetimeLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  // Asia/Tashkent is UTC+5 fixed
  const tash = new Date(d.getTime() + 5 * 60 * 60 * 1000);
  return `${tash.getUTCFullYear()}-${pad(tash.getUTCMonth() + 1)}-${pad(tash.getUTCDate())}T${pad(tash.getUTCHours())}:${pad(tash.getUTCMinutes())}`;
}

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яёʻʼ''`]+/gi, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function NewsFormActions() {
  const isClient = useIsClient();

  const desktopBar = (
    <div className="sticky bottom-4 z-[1] hidden max-w-3xl flex-wrap gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3 shadow-[0_8px_24px_rgb(15_18_24/0.08)] backdrop-blur lg:flex">
      <button type="submit" className={dashBtnPrimary} form="news-editor-form">
        Сохранить
      </button>
      <Link href="/dashboard/news/" className={dashBtnSecondary}>
        К списку
      </Link>
    </div>
  );

  const mobileBar = (
    <div className={cn(dashMobileActionBar, "lg:hidden")}>
      <button type="submit" className={dashBtnPrimary} form="news-editor-form">
        Сохранить
      </button>
      <Link href="/dashboard/news/" className={dashBtnSecondary}>
        К списку
      </Link>
    </div>
  );

  return (
    <>
      {desktopBar}
      {isClient ? createPortal(mobileBar, document.body) : null}
    </>
  );
}

export function NewsEditorForm({
  values,
  categories = NEWS_CATEGORIES.map((id) => ({ id, label: id })),
}: {
  values: NewsFormValues;
  categories?: Array<{ id: string; label: string }>;
}) {
  const [localeTab, setLocaleTab] = useState<"uz" | "ru">("uz");
  const [slug, setSlug] = useState(values.slug);
  const [titleUz, setTitleUz] = useState(values.titleUz);
  const [titleRu, setTitleRu] = useState(values.titleRu);
  const [excerptUz, setExcerptUz] = useState(values.excerptUz);
  const [excerptRu, setExcerptRu] = useState(values.excerptRu);

  const previewHrefUz = useMemo(
    () => (slug ? `/news/${slug}/` : "/news/"),
    [slug],
  );
  const previewHrefRu = useMemo(
    () => (slug ? `/ru/news/${slug}/` : "/ru/news/"),
    [slug],
  );

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DashStatusBadge kind="news" value={values.status} />
          {values.id ? (
            <>
              <Link
                href={previewHrefUz}
                target="_blank"
                className={dashBtnSecondary}
              >
                Preview UZ
              </Link>
              <Link
                href={previewHrefRu}
                target="_blank"
                className={dashBtnSecondary}
              >
                Preview RU
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <form
        id="news-editor-form"
        action={saveNewsAction}
        className="relative grid w-full min-w-0 max-w-full gap-5 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start lg:pb-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]"
      >
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

        <div className="min-w-0 max-w-full space-y-4">
          <div className="flex gap-2">
            {(["uz", "ru"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocaleTab(loc)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold",
                  localeTab === loc
                    ? "bg-primary text-white"
                    : "bg-white text-black/55 border border-black/10",
                )}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={cn("grid gap-4", localeTab !== "uz" && "hidden")}>
            <DashFormField label="Title UZ">
              <input
                name="title_uz"
                required={localeTab === "uz"}
                value={titleUz}
                onChange={(e) => setTitleUz(e.target.value)}
                className={dashInput}
              />
            </DashFormField>
            <DashFormField label="Excerpt UZ">
              <textarea
                name="excerpt_uz"
                required={localeTab === "uz"}
                rows={2}
                value={excerptUz}
                onChange={(e) => setExcerptUz(e.target.value)}
                className={dashInput}
              />
            </DashFormField>
            <div>
              <p className="m-0 mb-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
                Body UZ
              </p>
              <NewsRichEditor name="body_uz" defaultHtml={values.bodyHtmlUz} />
            </div>
          </div>

          <div className={cn("grid gap-4", localeTab !== "ru" && "hidden")}>
            <DashFormField label="Title RU">
              <input
                name="title_ru"
                required={localeTab === "ru"}
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
                className={dashInput}
              />
            </DashFormField>
            <DashFormField label="Excerpt RU">
              <textarea
                name="excerpt_ru"
                required={localeTab === "ru"}
                rows={2}
                value={excerptRu}
                onChange={(e) => setExcerptRu(e.target.value)}
                className={dashInput}
              />
            </DashFormField>
            <div>
              <p className="m-0 mb-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
                Body RU
              </p>
              <NewsRichEditor name="body_ru" defaultHtml={values.bodyHtmlRu} />
            </div>
          </div>
        </div>

        <aside
          className={`${dashCard} min-w-0 max-w-full space-y-4 overflow-x-hidden p-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain`}
        >
          <DashFormField label="Статус">
            <select
              name="status"
              defaultValue={values.status}
              className={dashInput}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </DashFormField>

          <DashFormField label="Категория">
            <select
              name="category"
              defaultValue={values.category}
              className={dashInput}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </DashFormField>

          <DashFormField label="Published at">
            <input
              type="datetime-local"
              name="published_at_local"
              defaultValue={toDatetimeLocal(values.publishedAt)}
              className={`${dashInput} min-w-0 max-w-full`}
            />
          </DashFormField>

          <div className="grid gap-2">
            <DashFormField label="Slug">
              <input
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={dashInput}
              />
            </DashFormField>
            <button
              type="button"
              className={cn(dashBtnSecondary, "w-full")}
              onClick={() =>
                setSlug(slugify(localeTab === "uz" ? titleUz : titleRu) || slug)
              }
            >
              Из title
            </button>
          </div>

          <NewsTagsInput defaultTags={values.tags} />

          <DashImageField
            name="cover_image"
            label="Обложка"
            defaultUrl={values.coverImage}
            folder="news/covers"
          />
          <DashFormField label="Cover alt">
            <input
              name="cover_alt"
              defaultValue={values.coverAlt}
              className={dashInput}
            />
          </DashFormField>

          <DashImageField
            name="og_image"
            label="OG image"
            defaultUrl={values.ogImage}
            folder="news/og"
          />

          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="noindex"
              value="1"
              defaultChecked={values.noindex}
              className="size-4 rounded border-black/20"
            />
            noindex
          </label>

          <div className={cn(localeTab !== "uz" && "hidden")}>
            <NewsSeoPanel
              locale="uz"
              titleFallback={titleUz}
              excerptFallback={excerptUz}
              slug={slug}
              defaults={{
                seoTitle: values.seoTitleUz,
                seoDescription: values.seoDescriptionUz,
                ogTitle: values.ogTitleUz,
                ogDescription: values.ogDescriptionUz,
              }}
            />
          </div>
          <div className={cn(localeTab !== "ru" && "hidden")}>
            <NewsSeoPanel
              locale="ru"
              titleFallback={titleRu}
              excerptFallback={excerptRu}
              slug={slug}
              defaults={{
                seoTitle: values.seoTitleRu,
                seoDescription: values.seoDescriptionRu,
                ogTitle: values.ogTitleRu,
                ogDescription: values.ogDescriptionRu,
              }}
            />
          </div>
        </aside>

        <div className="lg:col-span-2">
          <NewsFormActions />
        </div>
      </form>

      {values.id ? (
        <form action={deleteNewsAction} className="mt-4">
          <input type="hidden" name="id" value={values.id} />
          <button
            type="submit"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Удалить статью
          </button>
        </form>
      ) : null}
    </div>
  );
}
