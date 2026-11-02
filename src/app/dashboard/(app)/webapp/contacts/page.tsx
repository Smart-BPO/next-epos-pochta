import { requireAccess } from "@/lib/cms/auth";
import { linkedTelegramSubjectIds } from "@/lib/fcargo/epos-account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { parseDashListQuery } from "@/lib/dashboard/list-query";
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

export default async function WebappContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAccess("webapp");
  if (!session) {
    return <DashDenied section="contacts" />;
  }

  const params = await searchParams;
  const query = parseDashListQuery(params, {
    defaultPageSize: 100,
    defaultSort: "created_at",
    defaultDir: "desc",
    filterKeys: ["source", "locale"],
  });

  let rows: WebappContactRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    let req = admin
      .from("epos_webapp_contacts")
      .select(
        "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, photo_url, init_data_ok, created_at",
      )
      .order("created_at", { ascending: query.dir === "asc" })
      .limit(500);

    if (query.filters.source) {
      req = req.eq("source", query.filters.source);
    }
    if (query.filters.locale) {
      req = req.eq("locale", query.filters.locale);
    }
    if (query.q) {
      // Phone / session exact-ish server filter; broader text search stays client-side.
      const digits = query.q.replace(/\D/g, "");
      if (digits.length >= 4) {
        req = req.ilike("phone", `%${digits}%`);
      }
    }

    const { data: contacts } = await req;

    const base = (contacts ?? []) as Omit<
      WebappContactRow,
      | "shipmentTotal"
      | "shipmentPending"
      | "lastShipmentAt"
      | "fcargoLinked"
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

    const linkedTg = await linkedTelegramSubjectIds(
      base
        .map((c) => c.telegram_user_id)
        .filter((id): id is number => id != null),
    );

    rows = base.map((c) => {
      const s = stats.get(c.session_id);
      return {
        ...c,
        shipmentTotal: s?.shipmentTotal ?? 0,
        shipmentPending: s?.shipmentPending ?? 0,
        lastShipmentAt: s?.lastShipmentAt ?? null,
        fcargoLinked:
          c.telegram_user_id != null &&
          linkedTg.has(String(c.telegram_user_id)),
      };
    });
  }

  return <WebappContactsClient rows={rows} />;
}
