"use client";

import Link from "next/link";
import { LeadStatusSelect } from "@/components/dashboard/LeadStatusSelect";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import {
  formatDashDate,
  leadClientLabel,
  leadRouteLabel,
  leadTypeLabel,
} from "@/lib/cms/lead-display";

export type LeadListRow = {
  id: string;
  type: string;
  locale: string;
  status: string;
  payload: { pageUrl?: string; data?: Record<string, unknown> };
  created_at: string;
};

const STATUS_OPTS = [
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Готово" },
  { value: "spam", label: "Спам" },
];

const TYPE_OPTS = [
  { value: "price", label: "Прайс" },
  { value: "business", label: "Бизнес" },
  { value: "contact", label: "Контакт" },
];

export function LeadsListClient({
  rows,
  readOnly,
  updateStatusAction,
}: {
  rows: LeadListRow[];
  readOnly: boolean;
  updateStatusAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <DashCrudPage
      title="Заявки"
      lead="Сайт → epos_leads. Финальная цена только после подтверждения менеджером."
    >
      <DashListView
        storageKey="leads"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle="Нет заявок"
        emptyLead="Новые лиды появятся здесь после отправки форм на сайте."
        defaultSortId="created"
        defaultSortDir="desc"
        defaultPageSize={50}
        filters={[
          {
            id: "status",
            label: "Статус",
            options: STATUS_OPTS,
            getValue: (r) => r.status,
          },
          {
            id: "type",
            label: "Тип",
            options: TYPE_OPTS,
            getValue: (r) => r.type,
          },
        ]}
        columns={[
          {
            id: "id",
            header: "ID",
            searchText: true,
            sortValue: (r) => r.id,
            cell: (row) => (
              <Link
                href={`/dashboard/leads/${row.id}/`}
                className="font-mono text-xs font-semibold text-primary hover:underline"
              >
                {row.id}
              </Link>
            ),
          },
          {
            id: "client",
            header: "Клиент",
            searchText: (r) => leadClientLabel(r.payload),
            sortValue: (r) => leadClientLabel(r.payload),
            cell: (row) => (
              <span className="font-medium text-ink">
                {leadClientLabel(row.payload)}
              </span>
            ),
          },
          {
            id: "route",
            header: "Направление",
            searchText: (r) => leadRouteLabel(r.type, r.payload),
            sortValue: (r) => leadRouteLabel(r.type, r.payload),
            cell: (row) => (
              <span className="text-black/60">
                {leadRouteLabel(row.type, row.payload)}
              </span>
            ),
          },
          {
            id: "type",
            header: "Тип",
            sortValue: (r) => r.type,
            cell: (row) => (
              <span className="text-xs font-medium text-black/55">
                {leadTypeLabel(row.type)}
                <span className="text-black/35"> /{row.locale}</span>
              </span>
            ),
          },
          {
            id: "status",
            header: "Статус",
            sortValue: (r) => r.status,
            cell: (row) => (
              <div className="flex flex-col gap-2">
                <DashStatusBadge kind="lead" value={row.status} />
                <LeadStatusSelect
                  id={row.id}
                  status={row.status}
                  action={updateStatusAction}
                  disabled={readOnly}
                />
              </div>
            ),
          },
          {
            id: "created",
            header: "Дата",
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
