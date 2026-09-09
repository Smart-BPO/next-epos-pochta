"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

export async function updateShipmentAction(formData: FormData) {
  await requireMutation("webapp");

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
