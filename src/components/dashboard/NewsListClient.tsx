"use client";

import Link from "next/link";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import type { NewsAdminRow } from "@/lib/cms/news";
import { dashBtnPrimary, dashBtnSecondary } from "@/styles/dashboard";

export function NewsListClient({
  rows,
  canWrite,
}: {
  rows: NewsAdminRow[];
  canWrite: boolean;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const categories = Array.from(
    new Set(rows.map((r) => r.category).filter(Boolean)),
  );

  return (
    <DashCrudPage
      title={t.news.title}
      lead={t.news.lead}
      secondaryActions={
        <Link href="/dashboard/news/categories/" className={dashBtnSecondary}>
          {t.news.categories}
        </Link>
      }
      primaryAction={
        canWrite ? (
          <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
            {t.news.newArticle}
          </Link>
        ) : undefined
      }
    >
      <DashListView
        storageKey="news"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle={t.news.emptyTitle}
        emptyLead={t.news.emptyLead}
        defaultSortId="updated"
        defaultSortDir="desc"
        defaultView="table"
        filters={[
          {
            id: "status",
            label: t.list.status,
            options: [
              { value: "draft", label: t.badge.news.draft },
              { value: "published", label: t.badge.news.published },
            ],
            getValue: (r) => r.status,
          },
          {
            id: "category",
            label: t.list.category,
            options: categories.map((c) => ({ value: c, label: c })),
            getValue: (r) => r.category,
          },
        ]}
        columns={[
          {
            id: "cover",
            header: t.list.cover,
            hideInCard: true,
            cell: (row) =>
              row.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.cover_image}
                  alt=""
                  className="size-12 rounded-lg object-cover"
                />
              ) : (
                <span className="grid size-12 place-items-center rounded-lg bg-black/[0.04] text-[0.65rem] text-black/35">
                  —
                </span>
              ),
          },
          {
            id: "title",
            header: t.list.title,
            searchText: (r) => `${r.title} ${r.slug} ${r.id}`,
            sortValue: (r) => r.title,
            cell: (row) => (
              <div>
                <Link
                  href={`/dashboard/news/${row.id}/`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.title}
                </Link>
                <p className="m-0 mt-0.5 text-xs text-black/40">
                  <span className="text-black/30">{t.list.pageAddress}: </span>
                  {row.slug}
                </p>
              </div>
            ),
          },
          {
            id: "status",
            header: t.list.status,
            sortValue: (r) => r.status,
            cell: (row) => (
              <DashStatusBadge kind="news" value={row.status} />
            ),
          },
          {
            id: "category",
            header: t.list.category,
            sortValue: (r) => r.category,
            cell: (row) => (
              <span className="text-black/55">{row.category}</span>
            ),
          },
          {
            id: "updated",
            header: t.list.updated,
            sortValue: (r) => r.updated_at ?? "",
            cell: (row) => (
              <span className="text-xs text-black/45">
                {row.updated_at ? formatDashDate(row.updated_at, intlLocale) : "—"}
              </span>
            ),
          },
        ]}
        renderCard={(row) => (
          <div className="overflow-hidden">
            {row.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.cover_image}
                alt=""
                className="aspect-[16/9] w-full bg-black/[0.03] object-contain"
              />
            ) : (
              <div className="grid aspect-[16/9] place-items-center bg-black/[0.03] text-xs text-black/35">
                {t.news.noCover}
              </div>
            )}
            <div className="space-y-2 p-4">
              <DashStatusBadge kind="news" value={row.status} />
              <Link
                href={`/dashboard/news/${row.id}/`}
                className="block font-semibold text-ink hover:text-primary"
              >
                {row.title}
              </Link>
              <p className="m-0 text-xs text-black/40">
                <span className="text-black/30">{t.list.pageAddress}: </span>
                {row.slug}
              </p>
              <p className="m-0 text-xs text-black/45">
                {row.category}
                {row.updated_at
                  ? ` · ${formatDashDate(row.updated_at, intlLocale)}`
                  : ""}
              </p>
            </div>
          </div>
        )}
      />
    </DashCrudPage>
  );
}
