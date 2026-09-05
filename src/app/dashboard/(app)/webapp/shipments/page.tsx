import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { ShipmentStatusForm } from "@/components/dashboard/ShipmentStatusForm";
import { updateShipmentAction } from "./actions";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

export default async function WebappShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter =
    params.status && (STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : "";

  type Row = {
    id: string;
    contact_session_id: string;
    from_label: string;
    to_label: string;
    weight_kg: number | null;
    status: string;
    track_number: string | null;
    phone: string;
    created_at: string;
  };

  let rows: Row[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    let q = admin
      .from("epos_webapp_shipments")
      .select(
        "id, contact_session_id, from_label, to_label, weight_kg, status, track_number, phone, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data } = await q;
    rows = (data ?? []) as Row[];
  }

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">WebApp отправления</h1>
      <p className="mt-1 text-sm text-black/50">
        Статус и трек вручную. Тариф не публикуется — только менеджер.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/dashboard/webapp/shipments/"
          className={`rounded-full border px-3 py-1 ${!statusFilter ? "border-primary text-primary" : "border-black/10"}`}
        >
          Все
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/webapp/shipments/?status=${s}`}
            className={`rounded-full border px-3 py-1 ${statusFilter === s ? "border-primary text-primary" : "border-black/10"}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-black/8 text-xs uppercase text-black/40">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Маршрут</th>
              <th className="px-3 py-2">Контакт</th>
              <th className="px-3 py-2">Статус / трек</th>
              <th className="px-3 py-2">Когда</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-black/40">
                  Нет отправлений
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5 align-top">
                  <td className="px-3 py-3 font-mono text-xs">{row.id}</td>
                  <td className="px-3 py-3">
                    {row.from_label} → {row.to_label}
                    {row.weight_kg != null ? (
                      <span className="ml-1 text-xs text-black/40">
                        {row.weight_kg} кг
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div>{row.phone}</div>
                    <div className="font-mono text-black/35">
                      {row.contact_session_id}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <ShipmentStatusForm
                      id={row.id}
                      status={row.status}
                      trackNumber={row.track_number ?? ""}
                      action={updateShipmentAction}
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
