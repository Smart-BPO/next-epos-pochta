import { requireAccess } from "@/lib/cms/auth";
import { linkedTelegramSubjectIds } from "@/lib/fcargo/epos-account";
import { normalizeUzPhone } from "@/lib/fcargo/packages-store";
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
      | "incomingTotal"
      | "lastShipmentAt"
      | "fcargoLinked"
    >[];

    const sessionIds = base.map((c) => c.session_id);
    const phones = Array.from(
      new Set(
        base
          .map((c) => normalizeUzPhone(c.phone) || c.phone)
          .filter(Boolean),
      ),
    );

    const pendingBySession = new Map<string, number>();
    const lastBySession = new Map<string, string>();
    if (sessionIds.length > 0) {
      const { data: shipments } = await admin
        .from("epos_webapp_shipments")
        .select("contact_session_id, status, created_at")
        .in("contact_session_id", sessionIds);
      for (const row of (shipments ?? []) as ShipmentAggRow[]) {
        const sid = row.contact_session_id;
        if (!sid) continue;
        if (row.status === "pending_manager") {
          pendingBySession.set(sid, (pendingBySession.get(sid) ?? 0) + 1);
        }
        const prev = lastBySession.get(sid);
        if (!prev || row.created_at > prev) lastBySession.set(sid, row.created_at);
      }
    }

    const outByPhone = new Map<string, number>();
    const inByPhone = new Map<string, number>();
    const lastByPhone = new Map<string, string>();
    if (phones.length > 0) {
      const chunks: string[][] = [];
      for (let i = 0; i < phones.length; i += 80) {
        chunks.push(phones.slice(i, i + 80));
      }
      for (const chunk of chunks) {
        const [{ data: outs }, { data: inns }] = await Promise.all([
          admin
            .from("epos_fcargo_packages")
            .select("sender_phone, last_event_at")
            .in("sender_phone", chunk),
          admin
            .from("epos_fcargo_packages")
            .select("receiver_phone, last_event_at")
            .in("receiver_phone", chunk),
        ]);
        for (const p of outs ?? []) {
          const phone = p.sender_phone as string;
          if (!phone) continue;
          outByPhone.set(phone, (outByPhone.get(phone) ?? 0) + 1);
          const at = p.last_event_at as string | null;
          if (at) {
            const prev = lastByPhone.get(phone);
            if (!prev || at > prev) lastByPhone.set(phone, at);
          }
        }
        for (const p of inns ?? []) {
          const phone = p.receiver_phone as string;
          if (!phone) continue;
          inByPhone.set(phone, (inByPhone.get(phone) ?? 0) + 1);
          const at = p.last_event_at as string | null;
          if (at) {
            const prev = lastByPhone.get(phone);
            if (!prev || at > prev) lastByPhone.set(phone, at);
          }
        }
      }
    }

    const linkedTg = await linkedTelegramSubjectIds(
      base
        .map((c) => c.telegram_user_id)
        .filter((id): id is number => id != null),
    );

    rows = base.map((c) => {
      const phone = normalizeUzPhone(c.phone) || c.phone;
      const out = outByPhone.get(phone) ?? 0;
      const incoming = inByPhone.get(phone) ?? 0;
      const lastPkg = lastByPhone.get(phone) ?? null;
      const lastShip = lastBySession.get(c.session_id) ?? null;
      const lastShipmentAt =
        lastPkg && lastShip
          ? lastPkg > lastShip
            ? lastPkg
            : lastShip
          : (lastPkg ?? lastShip);
      return {
        ...c,
        shipmentTotal: out,
        shipmentPending: pendingBySession.get(c.session_id) ?? 0,
        incomingTotal: incoming,
        lastShipmentAt,
        fcargoLinked:
          c.telegram_user_id != null &&
          linkedTg.has(String(c.telegram_user_id)),
      };
    });
  }

  return <WebappContactsClient rows={rows} />;
}
