import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  listPackagesByPhone,
  normalizeUzPhone,
  setPackageContactSession,
  type FcargoPackageRow,
} from "@/lib/fcargo/packages-store";
import { mapFcargoStatusToCrm } from "@/lib/fcargo/sync-status";

/** Max unmatched (no trek) packages to auto-link per phone. */
export const FCARGO_PHONE_LINK_CAP = 20;

function shipmentStatusFromFcargo(
  status: string | null | undefined,
): "pending_manager" | "confirmed" | "cancelled" {
  const s = (status ?? "").toLowerCase();
  if (/cancel|отмен|returned|возврат|lost|утер/.test(s)) return "cancelled";
  if (/deliver|доставл|completed|complete|done|выдач|получен/.test(s)) {
    return "confirmed";
  }
  // in transit etc.
  if (mapFcargoStatusToCrm(status) === "done") return "confirmed";
  return "pending_manager";
}

function shipmentIdForTracking(tracking: string): string {
  const safe = tracking.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
  return `FC-${safe || Date.now().toString(36)}`;
}

function labelsFromPackage(row: FcargoPackageRow): {
  fromLabel: string;
  toLabel: string;
} {
  const raw = row.raw_last ?? {};
  const data =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : raw;
  const sender =
    data.sender && typeof data.sender === "object"
      ? (data.sender as Record<string, unknown>)
      : null;
  const receiver =
    data.receiver && typeof data.receiver === "object"
      ? (data.receiver as Record<string, unknown>)
      : null;
  const fromLabel =
    (typeof sender?.address === "string" && sender.address) ||
    (typeof data.from_address === "string" && data.from_address) ||
    "FCargo";
  const toLabel =
    (typeof receiver?.address === "string" && receiver.address) ||
    (typeof data.to_address === "string" && data.to_address) ||
    "FCargo";
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
    await client
      .from("epos_webapp_shipments")
      .update({
        status,
        phone: contact.phone,
        telegram_user_id: contact.telegram_user_id,
        contact_session_id: contact.session_id,
        from_label: fromLabel,
        to_label: toLabel,
        comment:
          row.event_type || row.status
            ? `FCargo ${row.event_type ?? ""} ${row.status ?? ""}`.trim()
            : "FCargo",
      })
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

export type LinkFcargoResult = {
  linked: number;
  skippedCap: boolean;
  mirrored: number;
};

/**
 * Attach unmatched FCargo catalog packages to a Mini App contact by phone.
 */
export async function linkFcargoPackagesToContact(params: {
  sessionId: string;
  phone: string;
  telegramUserId?: number | null;
}): Promise<LinkFcargoResult> {
  const phone = normalizeUzPhone(params.phone);
  if (!phone || !params.sessionId) {
    return { linked: 0, skippedCap: false, mirrored: 0 };
  }

  const packages = await listPackagesByPhone(phone);
  const unlinked = packages.filter((p) => !p.contact_session_id);
  if (unlinked.length === 0) {
    return { linked: 0, skippedCap: false, mirrored: 0 };
  }

  const withoutTrek = unlinked.filter((p) => !p.tracking_number?.trim());
  if (withoutTrek.length > FCARGO_PHONE_LINK_CAP) {
    console.warn(
      "[fcargo:link]",
      `phone ${phone} has ${withoutTrek.length} packages without trek — skip bulk link`,
    );
    return { linked: 0, skippedCap: true, mirrored: 0 };
  }

  // Prefer packages with tracking; still link withoutTrek under cap
  const toLink = [
    ...unlinked.filter((p) => p.tracking_number?.trim()),
    ...withoutTrek,
  ];

  let linked = 0;
  let mirrored = 0;

  for (const row of toLink) {
    await setPackageContactSession(row.id, params.sessionId);
    linked += 1;
    const updated: FcargoPackageRow = {
      ...row,
      contact_session_id: params.sessionId,
    };
    if (updated.tracking_number?.trim()) {
      await syncShipmentMirrorFromPackage(updated);
      mirrored += 1;
    }
  }

  return { linked, skippedCap: false, mirrored };
}
