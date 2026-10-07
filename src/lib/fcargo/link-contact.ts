import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { fcargoListPackages, hasFcargoConfig } from "@/lib/fcargo/client";
import {
  listPackagesByPhone,
  normalizeUzPhone,
  setPackageContactSession,
  upsertFcargoPackage,
  type FcargoPackageRow,
} from "@/lib/fcargo/packages-store";
import { findFcargoOrder } from "@/lib/fcargo/orders-store";
import { mapFcargoStatusToCrm } from "@/lib/fcargo/sync-status";
import type { FcargoOrderDetail } from "@/lib/fcargo/types";

/** Max unmatched (no trek) packages to auto-link per phone. */
export const FCARGO_PHONE_LINK_CAP = 20;

const PULL_TTL_MS = 3 * 60_000;
const PULL_MAX_PAGES = 4;
const lastPullByPhone = new Map<string, number>();

const FALLBACK_LABEL = "FCargo";

function shipmentStatusFromFcargo(
  status: string | null | undefined,
): "pending_manager" | "confirmed" | "cancelled" {
  const s = (status ?? "").toLowerCase();
  if (/cancel|отмен|returned|возврат|lost|утер|disposed/.test(s)) {
    return "cancelled";
  }
  if (mapFcargoStatusToCrm(status) === "done") return "confirmed";
  return "pending_manager";
}

function shipmentIdForTracking(tracking: string): string {
  const safe = tracking.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
  return `FC-${safe || Date.now().toString(36)}`;
}

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

function labelsFromPackage(row: FcargoPackageRow): {
  fromLabel: string;
  toLabel: string;
} {
  const raw = row.raw_last ?? {};
  const data = asRecord(raw.data) ?? raw;
  const pkg = asRecord(data.package) ?? data;
  const fromLabel =
    partyLabel(asRecord(pkg.sender) ?? asRecord(data.sender)) ||
    (typeof data.from_address === "string" && data.from_address) ||
    FALLBACK_LABEL;
  const toLabel =
    partyLabel(asRecord(pkg.receiver) ?? asRecord(data.receiver)) ||
    (typeof data.to_address === "string" && data.to_address) ||
    FALLBACK_LABEL;
  return { fromLabel, toLabel };
}

export async function syncShipmentMirrorFromPackage(
  row: FcargoPackageRow,
): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  if (!row.contact_session_id) return;

  const tracking = row.tracking_number?.trim();
  if (!tracking) return;

  const client = createSupabaseAdminClient();
  const { data: contact } = await client
    .from("epos_webapp_contacts")
    .select("session_id, phone, telegram_user_id, locale")
    .eq("session_id", row.contact_session_id)
    .maybeSingle();
  if (!contact) return;

  const status = shipmentStatusFromFcargo(row.status);
  const { fromLabel, toLabel } = labelsFromPackage(row);

  const { data: existing } = await client
    .from("epos_webapp_shipments")
    .select("id, contact_session_id")
    .eq("track_number", tracking)
    .maybeSingle();

  if (existing) {
    if (
      existing.contact_session_id &&
      existing.contact_session_id !== contact.session_id
    ) {
      console.warn(
        "[fcargo:mirror]",
        `trek ${tracking} already owned by ${existing.contact_session_id}`,
      );
      return;
    }
    // Webhook payloads often lack addresses — keep labels already stored.
    const update: Record<string, unknown> = {
      status,
      phone: contact.phone,
      telegram_user_id: contact.telegram_user_id,
      contact_session_id: contact.session_id,
      comment:
        row.event_type || row.status
          ? `FCargo ${row.event_type ?? ""} ${row.status ?? ""}`.trim()
          : FALLBACK_LABEL,
    };
    if (fromLabel !== FALLBACK_LABEL) update.from_label = fromLabel;
    if (toLabel !== FALLBACK_LABEL) update.to_label = toLabel;
    await client
      .from("epos_webapp_shipments")
      .update(update)
      .eq("id", existing.id);
    return;
  }

  const id = shipmentIdForTracking(tracking);
  const { error } = await client.from("epos_webapp_shipments").insert({
    id,
    contact_session_id: contact.session_id,
    locale: contact.locale === "ru" ? "ru" : "uz",
    phone: contact.phone,
    telegram_user_id: contact.telegram_user_id,
    from_settlement_id: "",
    to_settlement_id: "",
    from_label: fromLabel,
    to_label: toLabel,
    comment: `FCargo ${row.status ?? ""}`.trim(),
    status,
    track_number: tracking,
    price_status: "from_fcargo",
  });
  if (error) {
    // Race: another insert won — retry as update by trek
    const { data: raced } = await client
      .from("epos_webapp_shipments")
      .select("id, contact_session_id")
      .eq("track_number", tracking)
      .maybeSingle();
    if (raced && raced.contact_session_id === contact.session_id) {
      await client
        .from("epos_webapp_shipments")
        .update({ status, from_label: fromLabel, to_label: toLabel })
        .eq("id", raced.id);
      return;
    }
    console.warn("[fcargo:mirror:insert]", error.message);
  }
}

function itemStatusCode(item: FcargoOrderDetail): string | null {
  const s = item.status;
  if (!s) return null;
  if (typeof s === "string") return s;
  return s.code?.trim() || s.name?.trim() || null;
}

function itemPhones(item: FcargoOrderDetail, phone: string): string[] {
  const out = new Set<string>([phone]);
  const raw = item as unknown as Record<string, unknown>;
  for (const key of ["sender", "receiver"]) {
    const party = asRecord(raw[key]);
    const n =
      typeof party?.phone === "string" ? normalizeUzPhone(party.phone) : "";
    if (n) out.add(n);
  }
  return Array.from(out);
}

/**
 * Pull every FCargo package of a phone into the catalog
 * (`GET /packages?customer_phone=`). Throttled per phone.
 */
export async function pullFcargoPackagesForPhone(
  rawPhone: string,
  opts?: { force?: boolean },
): Promise<{ pulled: number; skipped?: string }> {
  const phone = normalizeUzPhone(rawPhone);
  if (!phone) return { pulled: 0, skipped: "invalid_phone" };
  const now = Date.now();
  const last = lastPullByPhone.get(phone) ?? 0;
  if (!opts?.force && now - last < PULL_TTL_MS) {
    return { pulled: 0, skipped: "throttled" };
  }
  if (!(await hasFcargoConfig())) return { pulled: 0, skipped: "not_configured" };
  lastPullByPhone.set(phone, now);

  let pulled = 0;
  for (let page = 1; page <= PULL_MAX_PAGES; page += 1) {
    const res = await fcargoListPackages({
      customerPhone: phone,
      page,
      perPage: 50,
    });
    if (!res.ok) {
      if (page === 1) lastPullByPhone.delete(phone);
      break;
    }
    const items = res.data?.items ?? [];
    for (const item of items) {
      if (!item?.tracking_number) continue;
      const status = itemStatusCode(item);
      const known = await findFcargoOrder({ orderId: String(item.id) });
      await upsertFcargoPackage({
        fcargoOrderId: String(item.id),
        trackingNumber: item.tracking_number,
        status,
        statusRaw: item.status ?? null,
        eventType: "client_api.pull",
        phones: itemPhones(item, phone),
        externalOrderId: item.external_order_id ?? null,
        leadId: known?.lead_id ?? null,
        rawLast: item,
      });
      pulled += 1;
    }
    const lastPage = res.data?.meta?.last_page ?? 1;
    if (page >= lastPage || items.length === 0) break;
  }
  return { pulled };
}

/** Telegram-verified Mini App contact for one of the phones, newest first. */
export async function findVerifiedContactByPhone(
  phones: string[],
): Promise<{ session_id: string; phone: string } | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const list = Array.from(
    new Set(phones.map((p) => normalizeUzPhone(p)).filter(Boolean)),
  );
  if (!list.length) return null;
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_webapp_contacts")
    .select("session_id, phone")
    .in("phone", list)
    .eq("source", "telegram_contact")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Attach one catalog package to a verified Mini App contact by phone. */
export async function linkPackageToVerifiedContact(
  row: FcargoPackageRow,
): Promise<boolean> {
  if (row.contact_session_id) {
    await syncShipmentMirrorFromPackage(row);
    return true;
  }
  const contact = await findVerifiedContactByPhone(row.phones ?? []);
  if (!contact) return false;
  await setPackageContactSession(row.id, contact.session_id);
  await syncShipmentMirrorFromPackage({
    ...row,
    contact_session_id: contact.session_id,
  });
  return true;
}

export type LinkFcargoResult = {
  linked: number;
  skippedCap: boolean;
  mirrored: number;
  pulled?: number;
  unverified?: boolean;
};

/**
 * Attach FCargo packages to a Mini App contact by phone.
 * Only for Telegram-verified phones — a typed number must not expose
 * someone else's shipments.
 */
export async function linkFcargoPackagesToContact(params: {
  sessionId: string;
  phone: string;
  telegramUserId?: number | null;
}): Promise<LinkFcargoResult> {
  const phone = normalizeUzPhone(params.phone);
  if (!phone || !params.sessionId || !hasSupabaseAdminConfig()) {
    return { linked: 0, skippedCap: false, mirrored: 0 };
  }

  const client = createSupabaseAdminClient();
  const { data: contact } = await client
    .from("epos_webapp_contacts")
    .select("session_id, phone, source")
    .eq("session_id", params.sessionId)
    .maybeSingle();
  if (
    !contact ||
    contact.source !== "telegram_contact" ||
    normalizeUzPhone(contact.phone ?? "") !== phone
  ) {
    return { linked: 0, skippedCap: false, mirrored: 0, unverified: true };
  }

  const pull = await pullFcargoPackagesForPhone(phone).catch((e) => {
    console.warn("[fcargo:link:pull]", e);
    return { pulled: 0 };
  });

  const packages = await listPackagesByPhone(phone);
  const own = packages.filter(
    (p) => p.contact_session_id === params.sessionId,
  );
  const unlinked = packages.filter((p) => !p.contact_session_id);

  let linked = 0;
  let mirrored = 0;

  // Refresh mirrors of already linked packages (status may have moved).
  if (pull.pulled > 0) {
    for (const row of own) {
      if (!row.tracking_number?.trim()) continue;
      await syncShipmentMirrorFromPackage(row);
      mirrored += 1;
    }
  }

  const withoutTrek = unlinked.filter((p) => !p.tracking_number?.trim());
  const skippedCap = withoutTrek.length > FCARGO_PHONE_LINK_CAP;
  if (skippedCap) {
    console.warn(
      "[fcargo:link]",
      `phone ${phone} has ${withoutTrek.length} packages without trek — skip those`,
    );
  }

  const toLink = [
    ...unlinked.filter((p) => p.tracking_number?.trim()),
    ...(skippedCap ? [] : withoutTrek),
  ];

  for (const row of toLink) {
    await setPackageContactSession(row.id, params.sessionId);
    linked += 1;
    if (row.tracking_number?.trim()) {
      await syncShipmentMirrorFromPackage({
        ...row,
        contact_session_id: params.sessionId,
      });
      mirrored += 1;
    }
  }

  return { linked, skippedCap, mirrored, pulled: pull.pulled };
}
