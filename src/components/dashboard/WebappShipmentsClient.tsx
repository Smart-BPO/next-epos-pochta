"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { FcargoStatusChip } from "@/components/dashboard/FcargoStatusChip";
import { ShipmentStatusForm } from "@/components/dashboard/ShipmentStatusForm";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import { cn } from "@/lib/cn";

const STATUS_KEYS = [
  "draft",
  "pending_manager",
  "confirmed",
  "cancelled",
] as const;

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
  fcargo_status?: string | null;
  fcargo_updated_at?: string | null;
  sender_phone?: string | null;
  receiver_phone?: string | null;
  source_kind?: "webapp" | "catalog";
  direction?: "out" | "in";
};

function shipmentsHref(opts: {
  dir: "out" | "in";
  contact?: string | null;
  id?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("dir", opts.dir);
  if (opts.contact) params.set("contact", opts.contact);
  if (opts.id) params.set("id", opts.id);
  const q = params.toString();
  return q ? `/dashboard/webapp/shipments/?${q}` : "/dashboard/webapp/shipments/";
}

export function WebappShipmentsClient({
  rows,
  readOnly,
  direction,
  attachAction,
  refreshAction,
}: {
  rows: WebappShipmentRow[];
  readOnly: boolean;
  direction: "out" | "in";
  attachAction: (formData: FormData) => Promise<void>;
  refreshAction: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const contactFilter = searchParams.get("contact");
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const scopedRows = useMemo(() => {
    if (!contactFilter) return rows;
    return rows.filter(
      (r) =>
        r.contact_session_id === contactFilter ||
        !r.contact_session_id ||
        r.source_kind === "catalog",
    );
  }, [rows, contactFilter]);

  useEffect(() => {
    if (!highlightId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, scopedRows]);

  const tabClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-white"
        : "bg-black/[0.04] text-black/55 hover:bg-black/[0.07] hover:text-ink",
    );

  return (
    <DashCrudPage
      title={direction === "in" ? t.shipments.titleIn : t.shipments.title}
      lead={direction === "in" ? t.shipments.leadIn : t.shipments.lead}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          href={shipmentsHref({ dir: "out", contact: contactFilter })}
          className={tabClass(direction === "out")}
        >
          {t.shipments.tabOut}
        </Link>
        <Link
          href={shipmentsHref({ dir: "in", contact: contactFilter })}
          className={tabClass(direction === "in")}
        >
          {t.shipments.tabIn}
        </Link>
      </div>

      {contactFilter ? (
        <p className="mb-3 rounded-xl border border-primary/15 bg-primary-soft px-3 py-2 text-xs font-medium text-primary">
          {t.list.contact}:{" "}
          <span className="font-mono">{contactFilter}</span>
          {" · "}
          <a
            href={shipmentsHref({ dir: direction })}
            className="underline"
          >
            {t.common.resetFilters}
          </a>
        </p>
      ) : null}

      <DashListView
        storageKey={`webapp-shipments-${direction}`}
        rows={scopedRows}
        rowKey={(r) => r.id}
        emptyTitle={
          direction === "in"
            ? t.shipments.emptyTitleIn
            : t.shipments.emptyTitle
        }
        emptyLead={
          contactFilter
            ? direction === "in"
              ? t.contacts.noIncoming
              : t.contacts.noShipments
            : direction === "in"
              ? t.shipments.emptyLeadIn
              : t.shipments.emptyLead
        }
        defaultSortId="created"
        defaultSortDir="desc"
        filters={
          direction === "out"
            ? [
                {
                  id: "status",
                  label: t.list.status,
                  options: STATUS_KEYS.map((value) => ({
                    value,
                    label: t.badge.shipment[value],
                  })),
                  getValue: (r) => r.status,
                },
              ]
            : []
        }
        columns={[
          {
            id: "track",
            header: t.shipments.trackPlaceholder,
            searchText: (r) =>
              `${r.track_number ?? ""} ${r.id} ${r.sender_phone ?? ""} ${r.receiver_phone ?? ""}`,
            sortValue: (r) => r.track_number ?? r.id,
            cell: (row) => (
              <div
                ref={row.id === highlightId ? highlightRef : undefined}
                className={cn(
                  "font-mono text-xs",
                  (row.id === highlightId ||
                    row.contact_session_id === contactFilter) &&
                    "rounded-lg bg-primary-soft px-1.5 py-0.5 font-semibold text-primary",
                )}
              >
                {row.track_number || row.id}
              </div>
            ),
          },
          {
            id: "route",
            header: t.list.route,
            searchText: (r) => `${r.from_label} ${r.to_label}`,
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
            id: "sender",
            header: t.shipments.sender,
            searchText: (r) => r.sender_phone ?? r.phone,
            sortValue: (r) => r.sender_phone ?? r.phone,
            cell: (row) => (
              <span className="text-sm tabular-nums">
                {row.sender_phone || (direction === "out" ? row.phone : "—")}
              </span>
            ),
          },
          {
            id: "receiver",
            header: t.shipments.receiver,
            searchText: (r) => r.receiver_phone ?? "",
            sortValue: (r) => r.receiver_phone ?? "",
            cell: (row) => (
              <span className="text-sm tabular-nums">
                {row.receiver_phone ||
                  (direction === "in" ? row.phone : "—")}
              </span>
            ),
          },
          {
            id: "status",
            header: t.list.status,
            sortValue: (r) => r.fcargo_status ?? r.status,
            cell: (row) => (
              <FcargoStatusChip
                code={row.fcargo_status}
                updatedAt={row.fcargo_updated_at}
                trackingNumber={row.track_number}
              />
            ),
          },
          ...(direction === "out"
            ? [
                {
                  id: "actions",
                  header: t.common.actions,
                  cell: (row: WebappShipmentRow) =>
                    row.source_kind === "catalog" && row.track_number ? (
                      <ShipmentStatusForm
                        id={row.id}
                        trackNumber={row.track_number}
                        fcargoStatus={row.fcargo_status}
                        fcargoUpdatedAt={row.fcargo_updated_at}
                        attachAction={attachAction}
                        refreshAction={refreshAction}
                        disabled={readOnly}
                      />
                    ) : (
                      <ShipmentStatusForm
                        id={row.id}
                        trackNumber={row.track_number ?? ""}
                        fcargoStatus={row.fcargo_status}
                        fcargoUpdatedAt={row.fcargo_updated_at}
                        attachAction={attachAction}
                        refreshAction={refreshAction}
                        disabled={
                          readOnly || row.source_kind === "catalog"
                        }
                      />
                    ),
                },
              ]
            : [
                {
                  id: "actions",
                  header: t.common.actions,
                  cell: (row: WebappShipmentRow) =>
                    row.track_number ? (
                      <ShipmentStatusForm
                        id={row.id}
                        trackNumber={row.track_number}
                        fcargoStatus={row.fcargo_status}
                        fcargoUpdatedAt={row.fcargo_updated_at}
                        attachAction={attachAction}
                        refreshAction={refreshAction}
                        disabled={readOnly}
                      />
                    ) : (
                      <span className="text-xs text-black/40">—</span>
                    ),
                },
              ]),
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
