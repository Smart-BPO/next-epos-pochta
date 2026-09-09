"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { LeadStatusSelect } from "@/components/dashboard/LeadStatusSelect";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { LeadsKanbanBoard } from "@/components/dashboard/LeadsKanbanBoard";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate, leadDraftStep } from "@/lib/cms/lead-display";
import type { InboxRow } from "@/lib/cms/inbox";
import { dashBtnRowSecondary } from "@/styles/dashboard";

export type LeadListRow = InboxRow;

function inboxTypeLabel(
  type: string,
  labels: {
    price: string;
    business: string;
    contact: string;
    shipment: string;
  },
) {
  if (type === "shipment") return labels.shipment;
  if (type === "price") return labels.price;
  if (type === "business") return labels.business;
  if (type === "contact") return labels.contact;
  return type;
}

function InboxShipmentActions({
  id,
  disabled,
  action,
}: {
  id: string;
  disabled: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();

  async function run(status: "confirmed" | "cancelled") {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    try {
      await action(fd);
      toast.success(t.leads.moved);
    } catch {
      toast.error(t.errors.saveFailed);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <DashStatusBadge kind="shipment" value="pending_manager" />
      {!disabled ? (
        <>
          <button
            type="button"
            className={dashBtnRowSecondary}
            onClick={() => void run("confirmed")}
          >
            {t.leads.confirmShipment}
          </button>
          <button
            type="button"
            className={dashBtnRowSecondary}
            onClick={() => void run("cancelled")}
          >
            {t.leads.cancelShipment}
          </button>
        </>
      ) : null}
      <Link
        href={`/dashboard/webapp/shipments/?id=${encodeURIComponent(id)}`}
        className={dashBtnRowSecondary}
      >
        {t.leads.openShipment}
      </Link>
    </div>
  );
}

export function LeadsListClient({
  rows,
  readOnly,
  shipmentReadOnly = true,
  updateStatusAction,
  updateShipmentStatusAction,
}: {
  rows: InboxRow[];
  readOnly: boolean;
  shipmentReadOnly?: boolean;
  updateStatusAction: (formData: FormData) => Promise<void>;
  updateShipmentStatusAction: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const typeLabels = {
    price: t.leads.typePrice,
    business: t.leads.typeBusiness,
    contact: t.leads.typeContact,
    shipment: t.leads.typeShipment,
  };

  return (
    <DashCrudPage title={t.leads.title} lead={t.leads.lead}>
      <DashListView
        storageKey="leads"
        rows={rows}
        rowKey={(r) => `${r.kind}:${r.id}`}
        emptyTitle={t.leads.emptyTitle}
        emptyLead={t.leads.emptyLead}
        defaultSortId="created"
        defaultSortDir="desc"
        defaultPageSize={50}
        renderKanban={(filtered) => (
          <LeadsKanbanBoard
            rows={filtered}
            readOnly={readOnly}
            shipmentReadOnly={shipmentReadOnly}
            updateShipmentStatusAction={updateShipmentStatusAction}
          />
        )}
        filters={[
          {
            id: "source",
            label: t.leads.filterSource,
            options: [
              { value: "website", label: t.badge.source.website },
              { value: "webapp", label: t.badge.source.webapp },
            ],
            getValue: (r) => r.source,
          },
          {
            id: "status",
            label: t.leads.filterStatus,
            options: [
              { value: "draft", label: t.badge.lead.draft },
              { value: "new", label: t.badge.lead.new },
              { value: "in_progress", label: t.badge.lead.in_progress },
              { value: "done", label: t.badge.lead.done },
              { value: "spam", label: t.badge.lead.spam },
            ],
            getValue: (r) => r.status,
          },
          {
            id: "type",
            label: t.leads.filterType,
            options: [
              { value: "price", label: typeLabels.price },
              { value: "business", label: typeLabels.business },
              { value: "contact", label: typeLabels.contact },
              { value: "shipment", label: typeLabels.shipment },
            ],
            getValue: (r) => r.type,
          },
        ]}
        columns={[
          {
            id: "id",
            header: "ID",
            searchText: true,
            sortValue: (r) => r.id,
            cell: (row) =>
              row.kind === "lead" ? (
                <Link
                  href={`/dashboard/leads/${row.id}/`}
                  className="font-mono text-xs font-semibold text-primary hover:underline"
                >
                  {row.id}
                </Link>
              ) : (
                <Link
                  href={`/dashboard/webapp/shipments/?id=${encodeURIComponent(row.id)}`}
                  className="font-mono text-xs font-semibold text-primary hover:underline"
                >
                  {row.id}
                </Link>
              ),
          },
          {
            id: "client",
            header: t.list.client,
            searchText: (r) => r.clientLabel,
            sortValue: (r) => r.clientLabel,
            cell: (row) => (
              <span className="font-medium text-ink">{row.clientLabel}</span>
            ),
          },
          {
            id: "route",
            header: t.list.route,
            searchText: (r) => r.routeLabel,
            sortValue: (r) => r.routeLabel,
            cell: (row) => (
              <span className="text-black/60">{row.routeLabel}</span>
            ),
          },
          {
            id: "source",
            header: t.list.source,
            sortValue: (r) => r.source,
            cell: (row) => (
              <DashStatusBadge kind="source" value={row.source} />
            ),
          },
          {
            id: "type",
            header: t.list.type,
            sortValue: (r) => r.type,
            cell: (row) => (
              <span className="text-xs font-medium text-black/55">
                {inboxTypeLabel(row.type, typeLabels)}
                <span className="text-black/35"> /{row.locale}</span>
              </span>
            ),
          },
          {
            id: "status",
            header: t.list.status,
            sortValue: (r) => r.status,
            cell: (row) => {
              if (row.kind === "webapp_shipment") {
                return (
                  <InboxShipmentActions
                    id={row.id}
                    disabled={shipmentReadOnly}
                    action={updateShipmentStatusAction}
                  />
                );
              }
              const step =
                row.status === "draft"
                  ? leadDraftStep(row.payload)
                  : null;
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DashStatusBadge kind="lead" value={row.status} />
                    {step ? (
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-black/40">
                        {t.leads.draftStep.replace("{step}", String(step))}
                      </span>
                    ) : null}
                  </div>
                  <LeadStatusSelect
                    id={row.id}
                    status={row.status}
                    action={updateStatusAction}
                    disabled={readOnly}
                  />
                </div>
              );
            },
          },
          {
            id: "created",
            header: t.list.when,
            sortValue: (r) => r.created_at,
            cell: (row) => (
              <span className="text-xs text-black/45">
                {formatDashDate(row.created_at, intlLocale)}
              </span>
            ),
          },
        ]}
      />
    </DashCrudPage>
  );
}
