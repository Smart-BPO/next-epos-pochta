import Link from "next/link";
import { listNewsAdminRows } from "@/lib/cms/news";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashEmptyState,
  DashPageHeader,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
  dashBtnPrimary,
} from "@/components/dashboard/ui";
import { formatDashDate } from "@/lib/cms/lead-display";

export default async function DashboardNewsPage() {
  const rows = await listNewsAdminRows();

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Новости"
        lead="Пустые CMS → публичный сайт использует TS seed"
        actions={
          <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
            Новая статья
          </Link>
        }
      />
      <DashTableShell title="Статьи">
        {rows.length === 0 ? (
          <DashEmptyState
            title="В CMS пока пусто"
            lead="Сайт читает seed из кода, пока вы не создадите статьи здесь."
            action={
              <Link href="/dashboard/news/new/" className={dashBtnPrimary}>
                Создать первую
              </Link>
            }
          />
        ) : (
          <DashTable minWidth="640px">
            <thead>
              <tr>
                <DashTh>Обложка</DashTh>
                <DashTh>Slug</DashTh>
                <DashTh>Статус</DashTh>
                <DashTh>Категория</DashTh>
                <DashTh>Обновлено</DashTh>
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
                      {row.slug}
                    </Link>
                  </DashTd>
                  <DashTd>
                    <DashStatusBadge kind="news" value={row.status} />
                  </DashTd>
                  <DashTd className="text-black/55">{row.category}</DashTd>
                  <DashTd className="text-xs text-black/45">
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
