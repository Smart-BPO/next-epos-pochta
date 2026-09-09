import Link from "next/link";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsAdminRows } from "@/lib/cms/news";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashEmptyState,
  DashPageHeader,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
  dashBtnPrimary,
  dashBtnSecondary,
} from "@/components/dashboard/ui";
import { formatDashDate } from "@/lib/cms/lead-display";

export default async function DashboardNewsPage() {
  const admin = await requireAccess("news");
  if (!admin) {
    return <DashAccessDenied title="Новости" lead="Нет доступа к разделу." />;
  }

  const rows = await listNewsAdminRows();
  const canWrite = canMutate(admin.role, "news");

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Новости"
        lead="Статьи из Supabase — публичный сайт читает тот же бэкенд"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/news/categories/" className={dashBtnSecondary}>
              Категории
            </Link>
            {canWrite ? (
              <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
                Новая статья
              </Link>
            ) : null}
          </div>
        }
      />
      <DashTableShell title={`Статьи · ${rows.length}`}>
        {rows.length === 0 ? (
          <DashEmptyState
            title="Пока нет статей"
            lead="Создайте первую новость — она сразу появится на сайте."
            action={
              canWrite ? (
                <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
                  Создать первую
                </Link>
              ) : null
            }
          />
        ) : (
          <DashTable>
            <thead>
              <tr>
                <DashTh>Обложка</DashTh>
                <DashTh>Заголовок</DashTh>
                <DashTh>Статус</DashTh>
                <DashTh className="hidden sm:table-cell">Категория</DashTh>
                <DashTh className="hidden md:table-cell">Обновлено</DashTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.015]">
                  <DashTd>
                    {row.cover_image ? (
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
                    )}
                  </DashTd>
                  <DashTd>
                    <Link
                      href={`/dashboard/news/${row.id}/`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="m-0 mt-0.5 text-xs text-black/40">{row.slug}</p>
                  </DashTd>
                  <DashTd>
                    <DashStatusBadge kind="news" value={row.status} />
                  </DashTd>
                  <DashTd className="hidden text-black/55 sm:table-cell">
                    {row.category}
                  </DashTd>
                  <DashTd className="hidden text-xs text-black/45 md:table-cell">
                    {row.updated_at ? formatDashDate(row.updated_at) : "—"}
                  </DashTd>
                </tr>
              ))}
            </tbody>
          </DashTable>
        )}
      </DashTableShell>
    </div>
  );
}
