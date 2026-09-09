import {
  leadClientLabel,
  leadRouteLabel,
} from "@/lib/cms/lead-display";

export type InboxKind = "lead" | "webapp_shipment";
export type InboxSource = "website" | "webapp";

/** Unified CRM inbox row for site leads + pending Mini App shipments. */
export type InboxRow = {
  kind: InboxKind;
  id: string;
  /** Lead type or `shipment` for webapp rows */
  type: string;
  locale: string;
  /**
   * Kanban / lead-pipeline status.
   * Webapp pending rows are mapped to `new`.
   */
  status: string;
  /** Raw shipment status when kind === webapp_shipment */
  shipmentStatus?: string;
  sort_order: number;
  source: InboxSource;
  clientLabel: string;
  routeLabel: string;
  created_at: string;
  payload?: {
    pageUrl?: string;
    data?: Record<string, unknown>;
    meta?: { step?: number; complete?: boolean };
  };
};

export type LeadDbRow = {
  id: string;
  type: string;
  locale: string;
  status: string;
  source?: string | null;
  payload: InboxRow["payload"];
  created_at: string;
  sort_order?: number | null;
};

export type ShipmentDbRow = {
  id: string;
  locale: string;
  status: string;
  phone: string | null;
  from_label: string | null;
  to_label: string | null;
  contact_session_id: string | null;
  created_at: string;
  weight_kg?: number | null;
};

export type ContactNameRow = {
  session_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export function leadToInboxRow(row: LeadDbRow): InboxRow {
  const payload = row.payload ?? {};
  return {
    kind: "lead",
    id: row.id,
    type: row.type,
    locale: row.locale,
    status: row.status,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    source: "website",
    clientLabel: leadClientLabel(payload),
    routeLabel: leadRouteLabel(row.type, payload),
    created_at: row.created_at,
    payload,
  };
}

export function shipmentToInboxRow(
  row: ShipmentDbRow,
  contact?: ContactNameRow | null,
): InboxRow {
  const name = [contact?.first_name, contact?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const phone = row.phone || contact?.phone || "";
  const from = row.from_label ?? "";
  const to = row.to_label ?? "";
  return {
    kind: "webapp_shipment",
    id: row.id,
    type: "shipment",
    locale: row.locale,
    status: "new",
    shipmentStatus: row.status,
    sort_order: 0,
    source: "webapp",
    clientLabel: name || phone || "—",
    routeLabel: from && to ? `${from} → ${to}` : from || to || "—",
    created_at: row.created_at,
  };
}

export function mergeInboxRows(
  leads: InboxRow[],
  shipments: InboxRow[],
): InboxRow[] {
  return [...leads, ...shipments].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}
