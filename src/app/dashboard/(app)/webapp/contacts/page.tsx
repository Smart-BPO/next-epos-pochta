import { requireAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  WebappContactsClient,
  type WebappContactRow,
} from "@/components/dashboard/WebappContactsClient";

type ShipmentAggRow = {
  contact_session_id: string | null;
  status: string;
  created_at: string;
};

function buildShipmentStats(rows: ShipmentAggRow[]) {
  const map = new Map<
    string,
    { shipmentTotal: number; shipmentPending: number; lastShipmentAt: string | null }
  >();

  for (const row of rows) {
    const sessionId = row.contact_session_id;
    if (!sessionId) continue;
    const current = map.get(sessionId) ?? {
      shipmentTotal: 0,
      shipmentPending: 0,
      lastShipmentAt: null as string | null,
    };
    current.shipmentTotal += 1;
    if (row.status === "pending_manager") current.shipmentPending += 1;
    if (
      !current.lastShipmentAt ||
      row.created_at > current.lastShipmentAt
    ) {
      current.lastShipmentAt = row.created_at;
    }
    map.set(sessionId, current);
  }

  return map;
}

export default async function WebappContactsPage() {
  const session = await requireAccess("webapp");
  if (!session) {
    return <DashDenied section="contacts" />;
  }

  let rows: WebappContactRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    const { data: contacts } = await admin
      .from("epos_webapp_contacts")
      .select(
        "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, photo_url, init_data_ok, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    const base = (contacts ?? []) as Omit<
      WebappContactRow,
      "shipmentTotal" | "shipmentPending" | "lastShipmentAt"
    >[];

    const sessionIds = base.map((c) => c.session_id);
    let stats = new Map<
      string,
      { shipmentTotal: number; shipmentPending: number; lastShipmentAt: string | null }
    >();

    if (sessionIds.length > 0) {
      const { data: shipments } = await admin
        .from("epos_webapp_shipments")
        .select("contact_session_id, status, created_at")
        .in("contact_session_id", sessionIds);
      stats = buildShipmentStats((shipments ?? []) as ShipmentAggRow[]);
    }

    rows = base.map((c) => {
      const s = stats.get(c.session_id);
      return {
        ...c,
        shipmentTotal: s?.shipmentTotal ?? 0,
        shipmentPending: s?.shipmentPending ?? 0,
        lastShipmentAt: s?.lastShipmentAt ?? null,
      };
    });
  }

  return <WebappContactsClient rows={rows} />;
}
