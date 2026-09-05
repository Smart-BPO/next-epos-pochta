"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NEWS_CATEGORIES, type NewsCategory, type NewsStatus } from "@/data/news/types";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import {
  deleteNewsArticle,
  upsertNewsArticle,
} from "@/lib/cms/news";

function parseBody(raw: string): string[] {
  return raw
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function saveNewsAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "news") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as NewsStatus;
  const category = String(formData.get("category") ?? "company");
  const coverImage = String(formData.get("cover_image") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  if (!slug) throw new Error("Slug required");
  if (!(NEWS_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error("Invalid category");
  }

  const newsId = await upsertNewsArticle({
    id,
    slug,
    status: status === "published" ? "published" : "draft",
    category: category as NewsCategory,
    coverImage: coverImage || undefined,
    publishedAt: publishedAt || undefined,
    locales: {
      uz: {
        title: String(formData.get("title_uz") ?? "").trim(),
        excerpt: String(formData.get("excerpt_uz") ?? "").trim(),
        body: parseBody(String(formData.get("body_uz") ?? "")),
      },
      ru: {
        title: String(formData.get("title_ru") ?? "").trim(),
        excerpt: String(formData.get("excerpt_ru") ?? "").trim(),
        body: parseBody(String(formData.get("body_ru") ?? "")),
      },
    },
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/ru/news");
  redirect(`/dashboard/news/${newsId}/`);
}

export async function deleteNewsAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "news") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  await deleteNewsArticle(id);
  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  redirect("/dashboard/news/");
}
