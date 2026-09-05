"use server";

import { revalidatePath } from "next/cache";
import { DELIVERY_CITIES } from "@/data/delivery-cities";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function seedDeliveryHubsAction() {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "delivery") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const client = createSupabaseAdminClient();
  const rows = DELIVERY_CITIES.map((city) => ({
    code: city.code,
    slug: city.slug,
    name_en: city.nameEn,
    name_ru: city.nameRu,
    name_uz: city.nameUz,
    settlement_id: city.settlementId ?? null,
    eta_hint_ru: city.etaHintRu,
    eta_hint_uz: city.etaHintUz,
    lead_ru: city.leadRu,
    lead_uz: city.leadUz,
    meta_title_ru: city.metaTitleRu,
    meta_title_uz: city.metaTitleUz,
    meta_description_ru: city.metaDescriptionRu,
    meta_description_uz: city.metaDescriptionUz,
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client.from("epos_delivery_hubs").upsert(rows, {
    onConflict: "code",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/delivery");
}

export async function updateDeliveryHubAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "delivery") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const code = String(formData.get("code") ?? "");
  if (!code) throw new Error("Missing code");

  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_delivery_hubs")
    .update({
      lead_ru: String(formData.get("lead_ru") ?? ""),
      lead_uz: String(formData.get("lead_uz") ?? ""),
      eta_hint_ru: String(formData.get("eta_hint_ru") ?? ""),
      eta_hint_uz: String(formData.get("eta_hint_uz") ?? ""),
      meta_title_ru: String(formData.get("meta_title_ru") ?? ""),
      meta_title_uz: String(formData.get("meta_title_uz") ?? ""),
      meta_description_ru: String(formData.get("meta_description_ru") ?? ""),
      meta_description_uz: String(formData.get("meta_description_uz") ?? ""),
      is_active: String(formData.get("is_active") ?? "") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("code", code);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/delivery");
}
