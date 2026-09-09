import { cache } from "react";
import {
  DELIVERY_CITIES,
  type DeliveryCity,
} from "@/data/delivery-cities";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

type FaqItem = { question: string; answer: string };

type HubRow = {
  code: string;
  slug: string;
  name_en: string;
  name_ru: string;
  name_uz: string;
  settlement_id: string | null;
  eta_hint_ru: string;
  eta_hint_uz: string;
  lead_ru: string;
  lead_uz: string;
  body_ru: unknown;
  body_uz: unknown;
  faq_ru: unknown;
  faq_uz: unknown;
  meta_title_ru: string;
  meta_title_uz: string;
  meta_description_ru: string;
  meta_description_uz: string;
  is_active: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function asFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const q = (item as { question?: unknown }).question;
      const a = (item as { answer?: unknown }).answer;
      if (typeof q !== "string" || typeof a !== "string") return null;
      return { question: q, answer: a };
    })
    .filter((x): x is FaqItem => Boolean(x));
}

function rowToCity(row: HubRow): DeliveryCity {
  const seed = DELIVERY_CITIES.find((c) => c.code === row.code);
  const bodyRu = asStringArray(row.body_ru);
  const bodyUz = asStringArray(row.body_uz);
  const faqRu = asFaq(row.faq_ru);
  const faqUz = asFaq(row.faq_uz);
  return {
    slug: row.slug,
    code: row.code,
    nameEn: row.name_en || seed?.nameEn || row.code,
    nameRu: row.name_ru || seed?.nameRu || row.code,
    nameUz: row.name_uz || seed?.nameUz || row.code,
    settlementId: row.settlement_id || seed?.settlementId,
    etaHintRu: row.eta_hint_ru || seed?.etaHintRu || "",
    etaHintUz: row.eta_hint_uz || seed?.etaHintUz || "",
    leadRu: row.lead_ru || seed?.leadRu || "",
    leadUz: row.lead_uz || seed?.leadUz || "",
    bodyRu: bodyRu.length ? bodyRu : seed?.bodyRu ?? [],
    bodyUz: bodyUz.length ? bodyUz : seed?.bodyUz ?? [],
    faqRu: faqRu.length ? faqRu : seed?.faqRu ?? [],
    faqUz: faqUz.length ? faqUz : seed?.faqUz ?? [],
    metaTitleRu: row.meta_title_ru || seed?.metaTitleRu || "",
    metaTitleUz: row.meta_title_uz || seed?.metaTitleUz || "",
    metaDescriptionRu:
      row.meta_description_ru || seed?.metaDescriptionRu || "",
    metaDescriptionUz:
      row.meta_description_uz || seed?.metaDescriptionUz || "",
  };
}

export const loadDeliveryCities = cache(async (): Promise<DeliveryCity[]> => {
  if (!hasSupabaseAdminConfig()) return DELIVERY_CITIES;
  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("epos_delivery_hubs")
      .select(
        "code, slug, name_en, name_ru, name_uz, settlement_id, eta_hint_ru, eta_hint_uz, lead_ru, lead_uz, body_ru, body_uz, faq_ru, faq_uz, meta_title_ru, meta_title_uz, meta_description_ru, meta_description_uz, is_active",
      )
      .eq("is_active", true)
      .order("code");
    if (error || !data?.length) return DELIVERY_CITIES;
    return (data as HubRow[]).map(rowToCity);
  } catch {
    return DELIVERY_CITIES;
  }
});

export async function getDeliveryCityByCodeAsync(
  code: string,
): Promise<DeliveryCity | undefined> {
  const cities = await loadDeliveryCities();
  const normalized = code.toLowerCase();
  return cities.find((c) => c.code === normalized);
}

export async function getDeliveryCityBySlugAsync(
  slug: string,
): Promise<DeliveryCity | undefined> {
  const cities = await loadDeliveryCities();
  return cities.find((c) => c.slug === slug);
}

export async function listDeliveryHubAdminRows() {
  if (!hasSupabaseAdminConfig()) return [];
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_delivery_hubs")
    .select(
      "code, slug, name_en, name_ru, name_uz, settlement_id, eta_hint_ru, eta_hint_uz, lead_ru, lead_uz, body_ru, body_uz, faq_ru, faq_uz, meta_title_ru, meta_title_uz, meta_description_ru, meta_description_uz, is_active",
    )
    .order("code");
  return (data ?? []) as HubRow[];
}
