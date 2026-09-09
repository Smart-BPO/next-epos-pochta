import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { ShipmentStatusForm } from "@/components/dashboard/ShipmentStatusForm";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashEmptyState,
  DashFilterPills,
  DashPageHeader,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
} from "@/components/dashboard/ui";
import { formatDashDate } from "@/lib/cms/lead-display";
import { updateShipmentAction } from "./actions";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  pending_manager: "Ждёт менеджера",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
};

export default async function WebappShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAccess("webapp");
  if (!admin) {
    return (
      <DashAccessDenied title="WebApp отправления" lead="Нет доступа." />
    );
  }
  const readOnly = !canMutate(admin.role, "webapp");
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
    const client = createSupabaseAdminClient();
    let q = client
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

  const pills = [
    {
      href: "/dashboard/webapp/shipments/",
      label: "Все",
      active: !statusFilter,
    },
    ...STATUSES.map((s) => ({
      href: `/dashboard/webapp/shipments/?status=${s}`,
      label: STATUS_LABEL[s] ?? s,
      active: statusFilter === s,
    })),
  ];

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="WebApp отправления"
        lead="Статус и трек вручную. Тариф не публикуется — только менеджер."
      />
      <DashFilterPills items={pills} />
      <DashTableShell title="Список">
        {rows.length === 0 ? (
          <DashEmptyState
            title="Нет отправлений"
            lead="Заявки из мини-приложения появятся здесь."
          />
        ) : (
          <DashTable>
            <thead>
              <tr>
                <DashTh>ID</DashTh>
                <DashTh>Маршрут</DashTh>
                <DashTh>Контакт</DashTh>
                <DashTh>Статус</DashTh>
                <DashTh>Действия</DashTh>
                <DashTh>Когда</DashTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-black/[0.015]">
                  <DashTd className="font-mono text-xs text-black/60">
                    {row.id}
                  </DashTd>
                  <DashTd>
                    <div className="font-medium text-ink">
                      {row.from_label} → {row.to_label}
                    </div>
                    {row.weight_kg != null ? (
                      <div className="mt-0.5 text-xs text-black/40">
                        {row.weight_kg} кг
                      </div>
                    ) : null}
                  </DashTd>
                  <DashTd className="text-sm">
                    <div>{row.phone}</div>
                    <div className="mt-0.5 font-mono text-[0.7rem] text-black/35">
                      {row.contact_session_id}
                    </div>
                  </DashTd>
                  <DashTd>
                    <DashStatusBadge kind="shipment" value={row.status} />
                  </DashTd>
                  <DashTd>
                    <ShipmentStatusForm
                      id={row.id}
                      status={row.status}
                      trackNumber={row.track_number ?? ""}
                      action={updateShipmentAction}
                      disabled={readOnly}
                    />
                  </DashTd>
                  <DashTd className="text-xs text-black/45">
                    {formatDashDate(row.created_at)}
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
