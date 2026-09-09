"use server";

import { revalidatePath } from "next/cache";
import { DELIVERY_CITIES } from "@/data/delivery-cities";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function parseBody(raw: string): string[] {
  return raw
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseFaq(raw: string): Array<{ question: string; answer: string }> {
  return raw
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [question, ...rest] = block.split("\n");
      return {
        question: (question ?? "").trim(),
        answer: rest.join("\n").trim(),
      };
    })
    .filter((item) => item.question && item.answer);
}

export async function seedDeliveryHubsAction() {
  await requireMutation("delivery");

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
    body_ru: city.bodyRu,
    body_uz: city.bodyUz,
    faq_ru: city.faqRu,
    faq_uz: city.faqUz,
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
  revalidatePath("/delivery");
  revalidatePath("/ru/delivery");
}

export async function upsertDeliveryHubAction(formData: FormData) {
  await requireMutation("delivery");

  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!code || !slug) throw new Error("code and slug required");

  const client = createSupabaseAdminClient();
  const { error } = await client.from("epos_delivery_hubs").upsert(
    {
      code,
      slug,
      name_en: String(formData.get("name_en") ?? "").trim(),
      name_ru: String(formData.get("name_ru") ?? "").trim(),
      name_uz: String(formData.get("name_uz") ?? "").trim(),
      settlement_id:
        String(formData.get("settlement_id") ?? "").trim() || null,
      lead_ru: String(formData.get("lead_ru") ?? ""),
      lead_uz: String(formData.get("lead_uz") ?? ""),
      eta_hint_ru: String(formData.get("eta_hint_ru") ?? ""),
      eta_hint_uz: String(formData.get("eta_hint_uz") ?? ""),
      body_ru: parseBody(String(formData.get("body_ru") ?? "")),
      body_uz: parseBody(String(formData.get("body_uz") ?? "")),
      faq_ru: parseFaq(String(formData.get("faq_ru") ?? "")),
      faq_uz: parseFaq(String(formData.get("faq_uz") ?? "")),
      meta_title_ru: String(formData.get("meta_title_ru") ?? ""),
      meta_title_uz: String(formData.get("meta_title_uz") ?? ""),
      meta_description_ru: String(formData.get("meta_description_ru") ?? ""),
      meta_description_uz: String(formData.get("meta_description_uz") ?? ""),
      is_active: String(formData.get("is_active") ?? "") === "on",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "code" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/delivery");
  revalidatePath("/delivery");
  revalidatePath("/ru/delivery");
}

export async function deleteDeliveryHubAction(formData: FormData) {
  await requireMutation("delivery");
  const code = String(formData.get("code") ?? "").trim();
  if (!code) throw new Error("Missing code");
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_delivery_hubs")
    .delete()
    .eq("code", code);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/delivery");
  revalidatePath("/delivery");
  revalidatePath("/ru/delivery");
}

/** @deprecated use upsertDeliveryHubAction */
export async function updateDeliveryHubAction(formData: FormData) {
  return upsertDeliveryHubAction(formData);
}
