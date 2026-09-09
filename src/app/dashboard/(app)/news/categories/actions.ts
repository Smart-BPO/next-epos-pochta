"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import {
  deleteNewsCategory,
  upsertNewsCategory,
} from "@/lib/cms/news-categories";

export async function saveNewsCategoryAction(formData: FormData) {
  await requireMutation("news");
  const id = String(formData.get("id") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (!id) throw new Error("Invalid id");
  await upsertNewsCategory({
    id,
    labelUz: String(formData.get("label_uz") ?? "").trim() || id,
    labelRu: String(formData.get("label_ru") ?? "").trim() || id,
    sortOrder: Number(formData.get("sort_order") ?? 0) || 0,
    isActive: String(formData.get("is_active") ?? "") === "on",
  });
  revalidatePath("/dashboard/news");
  revalidatePath("/dashboard/news/categories");
  revalidatePath("/news");
  revalidatePath("/ru/news");
}

export async function deleteNewsCategoryAction(formData: FormData) {
  await requireMutation("news");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing id");
  await deleteNewsCategory(id);
  revalidatePath("/dashboard/news");
  revalidatePath("/dashboard/news/categories");
  revalidatePath("/news");
  revalidatePath("/ru/news");
}
