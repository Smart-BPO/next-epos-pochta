"use client";

import { ShipmentStatusForm } from "@/components/dashboard/ShipmentStatusForm";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { formatDashDate } from "@/lib/cms/lead-display";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  pending_manager: "Ждёт менеджера",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
};

export type WebappShipmentRow = {
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

export function WebappShipmentsClient({
  rows,
  readOnly,
  updateAction,
}: {
  rows: WebappShipmentRow[];
  readOnly: boolean;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <DashCrudPage
      title="WebApp отправления"
      lead="Статус и трек вручную. Тариф не публикуется — только менеджер."
    >
      <DashListView
        storageKey="webapp-shipments"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle="Нет отправлений"
        emptyLead="Заявки из мини-приложения появятся здесь."
        defaultSortId="created"
        defaultSortDir="desc"
        filters={[
          {
            id: "status",
            label: "Статус",
            options: Object.entries(STATUS_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
            getValue: (r) => r.status,
          },
        ]}
        columns={[
          {
            id: "id",
            header: "ID",
            searchText: true,
            sortValue: (r) => r.id,
            hideInCard: true,
            cell: (row) => (
              <span className="font-mono text-xs text-black/60">{row.id}</span>
            ),
          },
          {
            id: "route",
            header: "Маршрут",
            searchText: (r) =>
              `${r.from_label} ${r.to_label} ${r.track_number ?? ""}`,
            sortValue: (r) => `${r.from_label}→${r.to_label}`,
            cell: (row) => (
              <div>
                <div className="font-medium text-ink">
                  {row.from_label} → {row.to_label}
                </div>
                {row.weight_kg != null ? (
                  <div className="mt-0.5 text-xs text-black/40">
                    {row.weight_kg} кг
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            id: "contact",
            header: "Контакт",
            searchText: (r) => `${r.phone} ${r.contact_session_id}`,
            sortValue: (r) => r.phone,
            cell: (row) => (
              <div className="text-sm">
                <div>{row.phone}</div>
                <div className="mt-0.5 font-mono text-[0.7rem] text-black/35">
                  {row.contact_session_id}
                </div>
              </div>
            ),
          },
          {
            id: "status",
            header: "Статус",
            sortValue: (r) => r.status,
            cell: (row) => (
              <DashStatusBadge kind="shipment" value={row.status} />
            ),
          },
          {
            id: "actions",
            header: "Действия",
            cell: (row) => (
              <ShipmentStatusForm
                id={row.id}
                status={row.status}
                trackNumber={row.track_number ?? ""}
                action={updateAction}
                disabled={readOnly}
              />
            ),
          },
          {
            id: "created",
            header: "Когда",
            sortValue: (r) => r.created_at,
            cell: (row) => (
              <span className="text-xs text-black/45">
                {formatDashDate(row.created_at)}
              </span>
            ),
          },
        ]}
      />
    </DashCrudPage>
  );
}
