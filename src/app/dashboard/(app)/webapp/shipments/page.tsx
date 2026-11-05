import { Suspense } from "react";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { normalizeUzPhone } from "@/lib/fcargo/packages-store";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  WebappShipmentsClient,
  type WebappShipmentRow,
} from "@/components/dashboard/WebappShipmentsClient";
import {
  attachFcargoTrackAction,
  refreshFcargoShipmentAction,
} from "./actions";

type CatalogPkg = {
  id: string;
  tracking_number: string | null;
  status: string | null;
  last_event_at: string | null;
  sender_phone: string | null;
  receiver_phone: string | null;
  contact_session_id: string | null;
  from_soato: string | null;
  to_soato: string | null;
  raw_last: Record<string, unknown> | null;
  created_at?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function partyLabel(party: Record<string, unknown> | null): string {
  if (!party) return "";
  const pick = (k: string) =>
    typeof party[k] === "string" ? (party[k] as string).trim() : "";
  const address = pick("address");
  const area = pick("district") || pick("region");
  if (address && area && !address.includes(area)) return `${area}, ${address}`;
  return address || area;
}

function labelsFromRaw(raw: Record<string, unknown> | null): {
  fromLabel: string;
  toLabel: string;
} {
  if (!raw) return { fromLabel: "—", toLabel: "—" };
  const data = asRecord(raw.data) ?? raw;
  const pkg = asRecord(data.package) ?? data;
  const fromLabel =
    partyLabel(asRecord(pkg.sender) ?? asRecord(data.sender)) ||
    (typeof data.from_address === "string" && data.from_address) ||
    "—";
  const toLabel =
    partyLabel(asRecord(pkg.receiver) ?? asRecord(data.receiver)) ||
    (typeof data.to_address === "string" && data.to_address) ||
    "—";
  return { fromLabel, toLabel };
}

function catalogToRow(
  pkg: CatalogPkg,
  extras?: Partial<WebappShipmentRow>,
): WebappShipmentRow {
  const { fromLabel, toLabel } = labelsFromRaw(pkg.raw_last);
  return {
    id: `pkg:${pkg.id}`,
    contact_session_id: pkg.contact_session_id ?? "",
    from_label: fromLabel,
    to_label: toLabel,
    weight_kg: null,
    status: "confirmed",
    track_number: pkg.tracking_number,
    phone: pkg.sender_phone ?? pkg.receiver_phone ?? "",
    created_at: pkg.last_event_at ?? pkg.created_at ?? new Date(0).toISOString(),
    fcargo_status: pkg.status,
    fcargo_updated_at: pkg.last_event_at,
    sender_phone: pkg.sender_phone,
    receiver_phone: pkg.receiver_phone,
    source_kind: "catalog",
    ...extras,
  };
}

export default async function WebappShipmentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAccess("webapp");
  if (!admin) {
    return <DashDenied section="shipments" />;
  }
  const readOnly = !canMutate(admin.role, "webapp");
  const sp = (await searchParams) ?? {};
  const statusFilter = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const contactFilter = Array.isArray(sp.contact) ? sp.contact[0] : sp.contact;
  const dirRaw = Array.isArray(sp.dir) ? sp.dir[0] : sp.dir;
  const dir: "out" | "in" = dirRaw === "in" ? "in" : "out";
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const qDigits = q.replace(/\D/g, "");
  const phoneFromQ =
    qDigits.length >= 9 ? normalizeUzPhone(qDigits) || null : null;

  let rows: WebappShipmentRow[] = [];
  let needsContactForIn = false;

  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();

    let contactPhone: string | null = null;
    let contactSession = contactFilter?.trim() || null;
    if (contactSession) {
      const { data: contact } = await client
        .from("epos_webapp_contacts")
        .select("session_id, phone")
        .eq("session_id", contactSession)
        .maybeSingle();
      contactPhone = contact?.phone
        ? normalizeUzPhone(contact.phone) || contact.phone
        : null;
    }
    if (!contactPhone && phoneFromQ) {
      contactPhone = phoneFromQ;
      if (!contactSession) {
        const { data: byPhone } = await client
          .from("epos_webapp_contacts")
          .select("session_id, phone")
          .eq("phone", phoneFromQ)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        contactSession = byPhone?.session_id ?? null;
      }
    }

    if (dir === "in") {
      if (!contactPhone) {
        needsContactForIn = true;
        rows = [];
      } else {
        const { data: pkgs } = await client
          .from("epos_fcargo_packages")
          .select(
            "id, tracking_number, status, last_event_at, sender_phone, receiver_phone, contact_session_id, from_soato, to_soato, raw_last, created_at",
          )
          .eq("receiver_phone", contactPhone)
          .order("last_event_at", { ascending: false })
          .limit(500);
        rows = ((pkgs ?? []) as CatalogPkg[]).map((pkg) =>
          catalogToRow(pkg, {
            phone: contactPhone!,
            contact_session_id: contactSession ?? pkg.contact_session_id ?? "",
            direction: "in",
          }),
        );
      }
    } else if (contactPhone) {
      // Outbound for a specific contact/phone: catalog by sender.
      const { data: pkgs } = await client
        .from("epos_fcargo_packages")
        .select(
          "id, tracking_number, status, last_event_at, sender_phone, receiver_phone, contact_session_id, from_soato, to_soato, raw_last, created_at",
        )
        .eq("sender_phone", contactPhone)
        .order("last_event_at", { ascending: false })
        .limit(500);
      const byTrack = new Map<string, WebappShipmentRow>();
      for (const pkg of (pkgs ?? []) as CatalogPkg[]) {
        const row = catalogToRow(pkg, {
          phone: contactPhone,
          contact_session_id: contactSession ?? pkg.contact_session_id ?? "",
          direction: "out",
        });
        const key = row.track_number?.trim() || row.id;
        byTrack.set(key, row);
      }

      // Prefer webapp shipment rows when present (attach/refresh by id).
      let shipReq = client
        .from("epos_webapp_shipments")
        .select(
          "id, contact_session_id, from_label, to_label, weight_kg, status, track_number, phone, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (contactSession) {
        shipReq = shipReq.eq("contact_session_id", contactSession);
      } else {
        shipReq = shipReq.eq("phone", contactPhone);
      }
      if (statusFilter) shipReq = shipReq.eq("status", statusFilter);
      const { data: ships } = await shipReq;
      for (const s of (ships ?? []) as WebappShipmentRow[]) {
        const track = s.track_number?.trim();
        const catalog = track ? byTrack.get(track) : null;
        const merged: WebappShipmentRow = {
          ...s,
          source_kind: "webapp",
          direction: "out",
          sender_phone: catalog?.sender_phone ?? contactPhone,
          receiver_phone: catalog?.receiver_phone ?? null,
          fcargo_status: catalog?.fcargo_status ?? null,
          fcargo_updated_at: catalog?.fcargo_updated_at ?? null,
        };
        if (track) byTrack.set(track, merged);
        else byTrack.set(s.id, merged);
      }
      rows = Array.from(byTrack.values()).sort((a, b) =>
        a.created_at < b.created_at ? 1 : -1,
      );
    } else {
      // Global out: webapp shipments ∪ catalog with known sender_phone.
      let shipReq = client
        .from("epos_webapp_shipments")
        .select(
          "id, contact_session_id, from_label, to_label, weight_kg, status, track_number, phone, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (statusFilter) shipReq = shipReq.eq("status", statusFilter);
      if (q) {
        if (qDigits.length >= 4) shipReq = shipReq.ilike("phone", `%${qDigits}%`);
        else if (/^PKG/i.test(q)) shipReq = shipReq.ilike("track_number", `%${q}%`);
      }
      const { data: ships } = await shipReq;
      rows = ((ships ?? []) as WebappShipmentRow[]).map((r) => ({
        ...r,
        source_kind: "webapp" as const,
        direction: "out" as const,
      }));

      const tracks = Array.from(
        new Set(
          rows.map((r) => r.track_number?.trim()).filter(Boolean) as string[],
        ),
      );
      const byTrack = new Map<
        string,
        {
          status: string | null;
          last_event_at: string | null;
          sender_phone: string | null;
          receiver_phone: string | null;
        }
      >();
      if (tracks.length) {
        const chunks: string[][] = [];
        for (let i = 0; i < tracks.length; i += 100) {
          chunks.push(tracks.slice(i, i + 100));
        }
        const results = await Promise.all(
          chunks.map((chunk) =>
            client
              .from("epos_fcargo_packages")
              .select(
                "tracking_number, status, last_event_at, sender_phone, receiver_phone",
              )
              .in("tracking_number", chunk),
          ),
        );
        for (const p of results.flatMap((r) => r.data ?? [])) {
          byTrack.set(p.tracking_number as string, {
            status: (p.status as string | null) ?? null,
            last_event_at: (p.last_event_at as string | null) ?? null,
            sender_phone: (p.sender_phone as string | null) ?? null,
            receiver_phone: (p.receiver_phone as string | null) ?? null,
          });
        }
        rows = rows.map((r) => {
          const pkg = r.track_number
            ? byTrack.get(r.track_number.trim())
            : null;
          return pkg
            ? {
                ...r,
                fcargo_status: pkg.status,
                fcargo_updated_at: pkg.last_event_at,
                sender_phone: pkg.sender_phone,
                receiver_phone: pkg.receiver_phone,
              }
            : r;
        });
      }

      // Add catalog-only outbound packages missing from webapp mirror.
      let catReq = client
        .from("epos_fcargo_packages")
        .select(
          "id, tracking_number, status, last_event_at, sender_phone, receiver_phone, contact_session_id, from_soato, to_soato, raw_last, created_at",
        )
        .not("sender_phone", "is", null)
        .order("last_event_at", { ascending: false })
        .limit(500);
      if (q && /^PKG/i.test(q)) {
        catReq = catReq.ilike("tracking_number", `%${q}%`);
      } else if (qDigits.length >= 4) {
        catReq = catReq.ilike("sender_phone", `%${qDigits}%`);
      }
      const { data: catalog } = await catReq;
      const knownTracks = new Set(
        rows.map((r) => r.track_number?.trim()).filter(Boolean) as string[],
      );
      for (const pkg of (catalog ?? []) as CatalogPkg[]) {
        const track = pkg.tracking_number?.trim();
        if (track && knownTracks.has(track)) continue;
        rows.push(catalogToRow(pkg, { direction: "out" }));
      }
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    }
  }

  return (
    <Suspense fallback={null}>
      <WebappShipmentsClient
        rows={rows}
        readOnly={readOnly}
        direction={dir}
        needsContactForIn={needsContactForIn}
        attachAction={attachFcargoTrackAction}
        refreshAction={refreshFcargoShipmentAction}
      />
    </Suspense>
  );
}
