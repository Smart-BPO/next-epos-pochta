"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

export async function updateShipmentAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "webapp") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const trackNumber = String(formData.get("track_number") ?? "").trim();
  if (!id || !(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  await client
    .from("epos_webapp_shipments")
    .update({
      status,
      track_number: trackNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  // TODO(tracking-api): sync status / track_number with external tracking when connected
  revalidatePath("/dashboard/webapp/shipments");
  revalidatePath("/dashboard");
}
