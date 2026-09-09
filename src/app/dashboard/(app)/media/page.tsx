import { requireAccess, canMutate } from "@/lib/cms/auth";
import {
  hasSupabaseAdminConfig,
  publicMediaPath,
} from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import {
  DashEmptyState,
  DashPageHeader,
  dashBtnSecondary,
  dashCard,
} from "@/components/dashboard/ui";
import { deleteMediaAction } from "./actions";

export default async function DashboardMediaPage() {
  const admin = await requireAccess("media");
  if (!admin) {
    return (
      <DashAccessDenied
        title="Медиа"
        lead="Нет доступа к разделу медиа."
      />
    );
  }

  let files: { name: string; created_at?: string | null }[] = [];

  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client.storage.from("epos-media").list("covers", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
    files = (data ?? []).filter((f) => f.name && !f.name.startsWith("."));
  }

  const canWrite = canMutate(admin.role, "media");

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Медиа"
        lead="Загрузка через Next API → Storage (service-role на сервере). Публичный путь: /media/…"
      />

      {canWrite ? (
        <div className={`${dashCard} p-5`}>
          <MediaUploader />
        </div>
      ) : null}

      {files.length === 0 ? (
        <DashEmptyState
          title="Пока пусто"
          lead="Загрузите обложку для новостей или баннеров."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => {
            const path = `covers/${f.name}`;
            const url = publicMediaPath(path);
            return (
              <li key={f.name} className={`${dashCard} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="aspect-[16/10] w-full bg-black/[0.03] object-cover"
                />
                <div className="space-y-2 p-3">
                  <p className="m-0 break-all font-mono text-[0.7rem] text-black/55">
                    {url}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <CopyButton value={url} label="Copy URL" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.7rem] font-semibold text-primary hover:underline"
                    >
                      Открыть
                    </a>
                    {canWrite ? (
                      <form action={deleteMediaAction}>
                        <input type="hidden" name="path" value={path} />
                        <button
                          type="submit"
                          className="text-[0.7rem] font-semibold text-black/45 hover:text-primary"
                        >
                          Удалить
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="m-0 text-sm text-black/40">
        <a href="/dashboard/news/new/" className={dashBtnSecondary}>
          К редактору новостей
        </a>
      </p>
    </div>
  );
}
