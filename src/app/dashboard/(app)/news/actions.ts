"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { NewsCategory, NewsStatus } from "@/data/news/types";
import { requireMutation } from "@/lib/cms/auth";
import { listNewsCategoryIds } from "@/lib/cms/news-categories";
import { deleteNewsArticle, upsertNewsArticle } from "@/lib/cms/news";
import { sanitizeNewsHtml } from "@/lib/news/body-html";

function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

/** datetime-local (interpreted as Asia/Tashkent UTC+5) → ISO */
function localTashkentToIso(local: string): string | undefined {
  const trimmed = local.trim();
  if (!trimmed) return undefined;
  // YYYY-MM-DDTHH:mm
  const m = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const [, y, mo, d, h, mi, s] = m;
  const utc = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h) - 5,
    Number(mi),
    Number(s ?? 0),
  );
  return new Date(utc).toISOString();
}

export async function saveNewsAction(formData: FormData) {
  await requireMutation("news");

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as NewsStatus;
  const category = String(formData.get("category") ?? "company");
  const coverImage = String(formData.get("cover_image") ?? "").trim();
  const coverAlt = String(formData.get("cover_alt") ?? "").trim();
  const ogImage = String(formData.get("og_image") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const noindex = formData.get("noindex") === "1";
  const publishedLocal = String(formData.get("published_at_local") ?? "").trim();
  const publishedAt =
    localTashkentToIso(publishedLocal) ||
    String(formData.get("published_at") ?? "").trim() ||
    undefined;

  if (!slug) throw new Error("Slug required");
  const allowed = await listNewsCategoryIds();
  if (!allowed.includes(category)) {
    throw new Error("Invalid category");
  }

  const newsId = await upsertNewsArticle({
    id,
    slug,
    status: status === "published" ? "published" : "draft",
    category: category as NewsCategory,
    coverImage: coverImage || undefined,
    coverAlt,
    ogImage: ogImage || undefined,
    tags,
    noindex,
    publishedAt,
    locales: {
      uz: {
        title: String(formData.get("title_uz") ?? "").trim(),
        excerpt: String(formData.get("excerpt_uz") ?? "").trim(),
        bodyHtml: sanitizeNewsHtml(String(formData.get("body_uz") ?? "")),
        seoTitle: String(formData.get("seo_title_uz") ?? "").trim(),
        seoDescription: String(formData.get("seo_description_uz") ?? "").trim(),
        ogTitle: String(formData.get("og_title_uz") ?? "").trim(),
        ogDescription: String(formData.get("og_description_uz") ?? "").trim(),
      },
      ru: {
        title: String(formData.get("title_ru") ?? "").trim(),
        excerpt: String(formData.get("excerpt_ru") ?? "").trim(),
        bodyHtml: sanitizeNewsHtml(String(formData.get("body_ru") ?? "")),
        seoTitle: String(formData.get("seo_title_ru") ?? "").trim(),
        seoDescription: String(formData.get("seo_description_ru") ?? "").trim(),
        ogTitle: String(formData.get("og_title_ru") ?? "").trim(),
        ogDescription: String(formData.get("og_description_ru") ?? "").trim(),
      },
    },
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/ru/news");
  revalidatePath(`/news/${slug}/`);
  revalidatePath(`/ru/news/${slug}/`);
  redirect(`/dashboard/news/${newsId}/?saved=1`);
}

export async function deleteNewsAction(formData: FormData) {
  await requireMutation("news");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  await deleteNewsArticle(id);
  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/ru/news");
  redirect("/dashboard/news/");
}
