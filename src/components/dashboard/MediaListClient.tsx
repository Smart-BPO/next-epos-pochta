"use client";

import Link from "next/link";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import { dashBtnSecondary, dashCard } from "@/styles/dashboard";

export type MediaListItem = {
  name: string;
  path: string;
  url: string;
  created_at?: string | null;
};

export function MediaListClient({
  files,
  canWrite,
  deleteAction,
}: {
  files: MediaListItem[];
  canWrite: boolean;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <DashCrudPage
      title="Медиа"
      lead="Загрузка через Next API → Storage (service-role на сервере). Публичный путь: /media/…"
      secondaryActions={
        <Link href="/dashboard/news/new/" className={dashBtnSecondary}>
          К редактору новостей
        </Link>
      }
    >
      {canWrite ? (
        <div className={`${dashCard} p-5`}>
          <MediaUploader />
        </div>
      ) : null}

      <DashListView
        storageKey="media"
        rows={files}
        rowKey={(f) => f.path}
        emptyTitle="Пока пусто"
        emptyLead="Загрузите обложку для новостей или баннеров."
        defaultView="cards"
        defaultSortId="name"
        defaultSortDir="asc"
        columns={[
          {
            id: "preview",
            header: "Превью",
            hideInCard: true,
            cell: (f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.url}
                alt=""
                className="size-14 rounded-lg object-cover"
              />
            ),
          },
          {
            id: "name",
            header: "Файл",
            searchText: (f) => `${f.name} ${f.url} ${f.path}`,
            sortValue: (f) => f.name,
            cell: (f) => (
              <div>
                <p className="m-0 font-medium text-ink">{f.name}</p>
                <p className="m-0 mt-0.5 break-all font-mono text-[0.65rem] text-black/45">
                  {f.url}
                </p>
              </div>
            ),
          },
          {
            id: "created",
            header: "Создан",
            sortValue: (f) => f.created_at ?? "",
            cell: (f) => (
              <span className="text-xs text-black/45">
                {f.created_at
                  ? new Date(f.created_at).toLocaleString("ru-RU")
                  : "—"}
              </span>
            ),
          },
        ]}
        actions={(f) => (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CopyButton value={f.url} label="Copy URL" />
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="text-[0.7rem] font-semibold text-primary hover:underline"
            >
              Открыть
            </a>
            {canWrite ? (
              <form action={deleteAction}>
                <input type="hidden" name="path" value={f.path} />
                <button
                  type="submit"
                  className="text-[0.7rem] font-semibold text-black/45 hover:text-primary"
                >
                  Удалить
                </button>
              </form>
            ) : null}
          </div>
        )}
        renderCard={(f, actionsNode) => (
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt=""
              className="aspect-[16/10] w-full bg-black/[0.03] object-cover"
            />
            <div className="space-y-2 p-3">
              <p className="m-0 break-all font-mono text-[0.7rem] text-black/55">
                {f.url}
              </p>
              {actionsNode}
            </div>
          </div>
        )}
      />
    </DashCrudPage>
  );
}
