import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  NEWS_CATEGORIES as NEWS_CATEGORIES_SEED,
  type NewsCategory,
} from "@/data/news/types";

export type NewsCategoryRow = {
  id: string;
  labelUz: string;
  labelRu: string;
  sortOrder: number;
  isActive: boolean;
};

const SEED_LABELS: Record<
  (typeof NEWS_CATEGORIES_SEED)[number],
  { uz: string; ru: string }
> = {
  company: { uz: "Kompaniya", ru: "Компания" },
  product: { uz: "Mahsulot", ru: "Продукт" },
  business: { uz: "Biznes", ru: "Бизнес" },
  geography: { uz: "Geografiya", ru: "География" },
};

function seedCategories(): NewsCategoryRow[] {
  return NEWS_CATEGORIES_SEED.map((id, i) => ({
    id,
    labelUz: SEED_LABELS[id].uz,
    labelRu: SEED_LABELS[id].ru,
    sortOrder: (i + 1) * 10,
    isActive: true,
  }));
}

export const listNewsCategories = cache(
  async (opts?: { includeInactive?: boolean }): Promise<NewsCategoryRow[]> => {
    if (!hasSupabaseAdminConfig()) return seedCategories();
    try {
      const client = createSupabaseAdminClient();
      let q = client
        .from("epos_news_categories")
        .select("id, label_uz, label_ru, sort_order, is_active")
        .order("sort_order", { ascending: true });
      if (!opts?.includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error || !data?.length) return seedCategories();
      return data.map((row) => ({
        id: row.id as string,
        labelUz: (row.label_uz as string) || row.id,
        labelRu: (row.label_ru as string) || row.id,
        sortOrder: Number(row.sort_order) || 0,
        isActive: Boolean(row.is_active),
      }));
    } catch {
      return seedCategories();
    }
  },
);

export async function listNewsCategoryIds(): Promise<NewsCategory[]> {
  const rows = await listNewsCategories();
  return rows.map((r) => r.id);
}

export async function upsertNewsCategory(input: {
  id: string;
  labelUz: string;
  labelRu: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("epos_news_categories").upsert(
    {
      id: input.id,
      label_uz: input.labelUz,
      label_ru: input.labelRu,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
}

export async function deleteNewsCategory(id: string) {
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_news_categories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
