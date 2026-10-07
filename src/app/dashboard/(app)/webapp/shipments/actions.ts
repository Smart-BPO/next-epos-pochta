"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { dispatchNotification } from "@/lib/messaging/dispatch";
import { fcargoTrackPackage } from "@/lib/fcargo/client";
import { ingestFcargoWebhook } from "@/lib/fcargo/ingest";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

function statusLabel(status: string, locale: "uz" | "ru") {
  if (locale === "ru") {
    if (status === "confirmed") return "Подтверждено";
    if (status === "cancelled") return "Отменено";
    if (status === "draft") return "Черновик";
    return "Ожидает менеджера";
  }
  if (status === "confirmed") return "Tasdiqlandi";
  if (status === "cancelled") return "Bekor qilindi";
  if (status === "draft") return "Qoralama";
  return "Menejer kutmoqda";
}

export async function updateShipmentAction(formData: FormData) {
  await requireMutation("webapp");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const trackNumber = String(formData.get("track_number") ?? "").trim();
  if (!id || !(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  const { data: before } = await client
    .from("epos_webapp_shipments")
    .select("id, status, track_number, phone, from_label, to_label, contact_session_id")
    .eq("id", id)
    .maybeSingle();

  await client
    .from("epos_webapp_shipments")
    .update({
      status,
      track_number: trackNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const changed =
    before &&
    (before.status !== status ||
      (before.track_number ?? "") !== trackNumber);

  if (changed && before?.phone) {
    let locale: "uz" | "ru" = "uz";
    if (before.contact_session_id) {
      const { data: contact } = await client
        .from("epos_webapp_contacts")
        .select("locale")
        .eq("session_id", before.contact_session_id)
        .maybeSingle();
      if (contact?.locale === "ru") locale = "ru";
    }

    const route = `${before.from_label ?? ""} → ${before.to_label ?? ""}`;
    try {
      await dispatchNotification({
        event: "shipment_status",
        locale,
        data: {
          id,
          status,
          status_label: statusLabel(status, locale),
          track: trackNumber || "—",
          phone: before.phone,
          route,
        },
        entityType: "shipment",
        entityId: id,
        idempotencyKey: `ship-${id}-${status}-${trackNumber}`,
      });
    } catch (err) {
      console.error("[shipment:notify]", err);
    }
  }

  // New track → FCargo catalog, so the Mini App shows live status and
  // /api/fcargo/sync keeps refreshing it.
  if (trackNumber && (before?.track_number ?? "") !== trackNumber) {
    try {
      const track = await fcargoTrackPackage(trackNumber);
      if (track.ok && track.data) {
        await ingestFcargoWebhook({
          event: "package.status_changed",
          data: track.data,
          tracking_number: trackNumber,
        });
      }
    } catch (err) {
      console.warn("[shipment:fcargo-track]", err);
    }
  }

  revalidatePath("/dashboard/webapp/shipments");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}
