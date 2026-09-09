"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/dashboard/CopyButton";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import {
  DashCrudPage,
  DashListView,
  DashRowActions,
} from "@/components/dashboard/ds";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import { dashFormat, dashIntlLocale } from "@/i18n/dashboard";
import {
  MEDIA_FOLDERS,
  type MediaFileRow,
  type MediaFolder,
} from "@/lib/cms/media-folders";
import { formatDashDate } from "@/lib/cms/lead-display";
import { dashBtnSecondary } from "@/styles/dashboard";

export type MediaListItem = MediaFileRow;

function formatBytes(size: number | null, locale: string) {
  if (size == null || size <= 0) return "—";
  const kb = size / 1024;
  if (kb < 1024) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kb / 1024)} MB`;
}

export function MediaListClient({
  files,
  canWrite,
  deleteAction,
}: {
  files: MediaListItem[];
  canWrite: boolean;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();
  const router = useRouter();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);

  const folderLabel = (folder: MediaFolder) => t.media.folders[folder];

  return (
    <DashCrudPage
      title={t.media.title}
      lead={t.media.lead}
      secondaryActions={
        <Link href="/dashboard/news/new/" className={dashBtnSecondary}>
          {t.media.toEditor}
        </Link>
      }
    >
      {canWrite ? <MediaUploader /> : null}

      <DashListView
        storageKey="media"
        rows={files}
        rowKey={(f) => f.path}
        emptyTitle={t.media.emptyTitle}
        emptyLead={t.media.emptyLead}
        defaultView="cards"
        defaultSortId="created"
        defaultSortDir="desc"
        filters={[
          {
            id: "folder",
            label: t.list.folder,
            options: MEDIA_FOLDERS.map((id) => ({
              value: id,
              label: folderLabel(id),
            })),
            getValue: (f) => f.folder,
          },
        ]}
        columns={[
          {
            id: "preview",
            header: t.list.cover,
            hideInCard: true,
            cell: (f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.url}
                alt=""
                className="size-14 rounded-lg bg-black/[0.03] object-contain"
              />
            ),
          },
          {
            id: "name",
            header: t.list.file,
            searchText: (f) =>
              `${f.name} ${f.url} ${f.path} ${folderLabel(f.folder)}`,
            sortValue: (f) => f.name,
            cell: (f) => (
              <div className="min-w-0">
                <p className="m-0 truncate font-medium text-ink">{f.name}</p>
                <p className="m-0 mt-0.5 break-all font-mono text-[0.65rem] text-black/45">
                  {f.url}
                </p>
              </div>
            ),
          },
          {
            id: "folder",
            header: t.list.folder,
            sortValue: (f) => f.folder,
            cell: (f) => (
              <span className="text-xs font-medium text-black/55">
                {folderLabel(f.folder)}
              </span>
            ),
          },
          {
            id: "size",
            header: t.list.size,
            hideInCard: true,
            sortValue: (f) => f.size ?? -1,
            cell: (f) => (
              <span className="text-xs text-black/45">
                {formatBytes(f.size, intlLocale)}
              </span>
            ),
          },
          {
            id: "created",
            header: t.list.created,
            sortValue: (f) => f.created_at ?? "",
            cell: (f) => (
              <span className="text-xs text-black/45">
                {f.created_at ? formatDashDate(f.created_at, intlLocale) : "—"}
              </span>
            ),
          },
        ]}
        actions={(f) => (
          <DashRowActions
            extra={
              <div className="inline-flex flex-wrap items-center gap-2">
                <CopyButton value={f.url} />
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.7rem] font-semibold text-primary hover:underline"
                >
                  {t.common.open}
                </a>
              </div>
            }
            confirmTitle={t.media.deleteConfirm}
            confirmLead={dashFormat(t.media.deleteLead, { name: f.name })}
            onDelete={
              canWrite
                ? async () => {
                    const fd = new FormData();
                    fd.set("path", f.path);
                    await deleteAction(fd);
                    router.refresh();
                  }
                : undefined
            }
          />
        )}
        renderCard={(f, actionsNode) => (
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt=""
              className="aspect-[16/10] w-full bg-black/[0.03] object-contain"
            />
            <div className="space-y-2 p-3">
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-ink">
                  {f.name}
                </p>
                <p className="m-0 mt-0.5 text-xs text-black/45">
                  {folderLabel(f.folder)}
                  {f.created_at
                    ? ` · ${formatDashDate(f.created_at, intlLocale)}`
                    : ""}
                </p>
                <p className="m-0 mt-1 break-all font-mono text-[0.65rem] text-black/40">
                  {f.url}
                </p>
              </div>
              {actionsNode}
            </div>
          </div>
        )}
      />
    </DashCrudPage>
  );
}
