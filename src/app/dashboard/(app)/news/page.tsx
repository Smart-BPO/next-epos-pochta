import Link from "next/link";
import { listNewsAdminRows } from "@/lib/cms/news";

export default async function DashboardNewsPage() {
  const rows = await listNewsAdminRows();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-display text-2xl font-bold">Новости</h1>
          <p className="mt-1 text-sm text-black/50">
            Пустые CMS → публичный сайт использует TS seed
          </p>
        </div>
        <Link href="/dashboard/news/new/" className="btn btn-primary">
          Новая статья
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-black/8 text-xs uppercase text-black/40">
            <tr>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Категория</th>
              <th className="px-3 py-2">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-black/40">
                  В CMS пока пусто — сайт читает seed из кода
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/news/${row.id}/`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.slug}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{row.status}</td>
                  <td className="px-3 py-3">{row.category}</td>
                  <td className="px-3 py-3 text-xs text-black/45">
                    {row.updated_at
                      ? new Date(row.updated_at).toLocaleString("ru-RU")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
