"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function uploadMediaAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "media") || admin.role === "viewer") {
    throw new Error("Forbidden");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File required");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const client = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from("epos-media").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/media");
}
