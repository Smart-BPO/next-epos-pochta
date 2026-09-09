"use client";

import Link from "next/link";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
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
  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean)));

  return (
    <DashCrudPage
      title="Новости"
      lead="Статьи из Supabase — публичный сайт читает тот же бэкенд"
      secondaryActions={
        <Link href="/dashboard/news/categories/" className={dashBtnSecondary}>
          Категории
        </Link>
      }
      primaryAction={
        canWrite ? (
          <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
            Новая статья
          </Link>
        ) : undefined
      }
    >
      <DashListView
        storageKey="news"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle="Пока нет статей"
        emptyLead="Создайте первую новость — она сразу появится на сайте."
        defaultSortId="updated"
        defaultSortDir="desc"
        defaultView="table"
        filters={[
          {
            id: "status",
            label: "Статус",
            options: [
              { value: "draft", label: "Черновик" },
              { value: "published", label: "Опубликовано" },
            ],
            getValue: (r) => r.status,
          },
          {
            id: "category",
            label: "Категория",
            options: categories.map((c) => ({ value: c, label: c })),
            getValue: (r) => r.category,
          },
        ]}
        columns={[
          {
            id: "cover",
            header: "Обложка",
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
            header: "Заголовок",
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
                <p className="m-0 mt-0.5 text-xs text-black/40">{row.slug}</p>
              </div>
            ),
          },
          {
            id: "status",
            header: "Статус",
            sortValue: (r) => r.status,
            cell: (row) => (
              <DashStatusBadge kind="news" value={row.status} />
            ),
          },
          {
            id: "category",
            header: "Категория",
            sortValue: (r) => r.category,
            cell: (row) => (
              <span className="text-black/55">{row.category}</span>
            ),
          },
          {
            id: "updated",
            header: "Обновлено",
            sortValue: (r) => r.updated_at ?? "",
            cell: (row) => (
              <span className="text-xs text-black/45">
                {row.updated_at ? formatDashDate(row.updated_at) : "—"}
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
                className="aspect-[16/9] w-full bg-black/[0.03] object-cover"
              />
            ) : (
              <div className="grid aspect-[16/9] place-items-center bg-black/[0.03] text-xs text-black/35">
                Нет обложки
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
              <p className="m-0 text-xs text-black/40">{row.slug}</p>
              <p className="m-0 text-xs text-black/45">
                {row.category}
                {row.updated_at
                  ? ` · ${formatDashDate(row.updated_at)}`
                  : ""}
              </p>
            </div>
          </div>
        )}
      />
    </DashCrudPage>
  );
}
