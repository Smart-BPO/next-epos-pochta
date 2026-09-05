"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "settings") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const client = createSupabaseAdminClient();
  const mapLat = Number(formData.get("map_lat"));
  const mapLng = Number(formData.get("map_lng"));

  const { error } = await client.from("epos_site_settings").upsert({
    id: 1,
    phone: String(formData.get("phone") ?? "").trim(),
    phone_display: String(formData.get("phone_display") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telegram_url: String(formData.get("telegram_url") ?? "").trim(),
    instagram_url: String(formData.get("instagram_url") ?? "").trim(),
    facebook_url: String(formData.get("facebook_url") ?? "").trim(),
    hours: String(formData.get("hours") ?? "").trim(),
    address_line: String(formData.get("address_line") ?? "").trim(),
    address_line_uz: String(formData.get("address_line_uz") ?? "").trim(),
    map_lat: Number.isFinite(mapLat) ? mapLat : null,
    map_lng: Number.isFinite(mapLng) ? mapLng : null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
  revalidatePath("/");
  revalidatePath("/contacts");
}
