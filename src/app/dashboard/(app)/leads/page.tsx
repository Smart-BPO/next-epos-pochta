import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { LeadStatusSelect } from "@/components/dashboard/LeadStatusSelect";
import { updateLeadStatusAction } from "./actions";

const STATUSES = ["new", "in_progress", "done", "spam"] as const;

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const statusFilter =
    params.status && (STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : "";
  const typeFilter =
    params.type === "price" ||
    params.type === "business" ||
    params.type === "contact"
      ? params.type
      : "";

  type LeadRow = {
    id: string;
    type: string;
    locale: string;
    status: string;
    payload: { pageUrl?: string; data?: Record<string, unknown> };
    created_at: string;
  };

  let rows: LeadRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    let q = admin
      .from("epos_leads")
      .select("id, type, locale, status, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (typeFilter) q = q.eq("type", typeFilter);
    const { data } = await q;
    rows = (data ?? []) as LeadRow[];
  }

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Заявки</h1>
      <p className="mt-1 text-sm text-black/50">Сайт → epos_leads</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/dashboard/leads/"
          className={`rounded-full border px-3 py-1 ${!statusFilter ? "border-primary text-primary" : "border-black/10"}`}
        >
          Все
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/leads/?status=${s}`}
            className={`rounded-full border px-3 py-1 ${statusFilter === s ? "border-primary text-primary" : "border-black/10"}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/8 text-xs uppercase text-black/40">
            <tr>
              <th className="px-3 py-2 font-semibold">ID</th>
              <th className="px-3 py-2 font-semibold">Тип</th>
              <th className="px-3 py-2 font-semibold">Данные</th>
              <th className="px-3 py-2 font-semibold">Статус</th>
              <th className="px-3 py-2 font-semibold">Когда</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-black/40">
                  Нет заявок
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5 align-top">
                  <td className="px-3 py-3 font-mono text-xs">{row.id}</td>
                  <td className="px-3 py-3">
                    {row.type}
                    <span className="ml-1 text-xs text-black/35">
                      /{row.locale}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-black/65">
                    <pre className="m-0 max-w-xs overflow-auto whitespace-pre-wrap font-sans">
                      {JSON.stringify(row.payload?.data ?? row.payload, null, 0)}
                    </pre>
                  </td>
                  <td className="px-3 py-3">
                    <LeadStatusSelect
                      id={row.id}
                      status={row.status}
                      action={updateLeadStatusAction}
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-black/45">
                    {new Date(row.created_at).toLocaleString("ru-RU")}
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
