"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fcargoTrackPackage } from "@/lib/fcargo/client";
import { ingestFcargoWebhook } from "@/lib/fcargo/ingest";
import {
  setPackageContactSession,
  upsertFcargoPackage,
} from "@/lib/fcargo/packages-store";
import { syncShipmentMirrorFromPackage } from "@/lib/fcargo/link-contact";

function revalidateShipments() {
  revalidatePath("/dashboard/webapp/shipments");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

/** Verify trek exists in FCargo, ingest catalog, attach to shipment contact. */
export async function attachFcargoTrackAction(formData: FormData) {
  await requireMutation("webapp");

  const id = String(formData.get("id") ?? "").trim();
  const trackNumber = String(formData.get("track_number") ?? "")
    .trim()
    .toUpperCase();
  if (!id || !trackNumber) throw new Error("Invalid");

  const client = createSupabaseAdminClient();
  const { data: shipment } = await client
    .from("epos_webapp_shipments")
    .select("id, contact_session_id, phone, telegram_user_id")
    .eq("id", id)
    .maybeSingle();
  if (!shipment?.contact_session_id) throw new Error("shipment_not_found");

  const track = await fcargoTrackPackage(trackNumber);
  if (!track.ok || !track.data) {
    throw new Error("fcargo_track_not_found");
  }

  const ingested = await ingestFcargoWebhook({
    event: "package.status_changed",
    data: track.data,
    tracking_number: trackNumber,
  });

  let catalog = ingested.package;
  if (!catalog) {
    catalog = await upsertFcargoPackage({
      trackingNumber: trackNumber,
      status:
        typeof (track.data as { status?: { code?: string } }).status === "object"
          ? (track.data as { status?: { code?: string } }).status?.code ?? null
          : null,
      phones: shipment.phone ? [shipment.phone] : [],
      contactSessionId: shipment.contact_session_id,
      rawLast: track.data as Record<string, unknown>,
      eventType: "dashboard.attach",
    });
  } else if (!catalog.contact_session_id) {
    await setPackageContactSession(catalog.id, shipment.contact_session_id);
    catalog = { ...catalog, contact_session_id: shipment.contact_session_id };
  }

  if (catalog) {
    await syncShipmentMirrorFromPackage(catalog);
  }

  await client
    .from("epos_webapp_shipments")
    .update({
      track_number: trackNumber,
      price_status: "from_fcargo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidateShipments();
}

/** Refresh FCargo status for a shipment trek. */
export async function refreshFcargoShipmentAction(formData: FormData) {
  await requireMutation("webapp");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const client = createSupabaseAdminClient();
  const { data: shipment } = await client
    .from("epos_webapp_shipments")
    .select("id, track_number")
    .eq("id", id)
    .maybeSingle();
  const trackNumber = shipment?.track_number?.trim();
  if (!trackNumber) return;

  const track = await fcargoTrackPackage(trackNumber);
  if (!track.ok || !track.data) {
    console.warn("[shipment:fcargo-refresh]", id, "unavailable");
    return;
  }

  await ingestFcargoWebhook({
    event: "package.status_changed",
    data: track.data,
    tracking_number: trackNumber,
  });

  revalidateShipments();
}
