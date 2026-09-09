"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { deleteMediaPath, uploadMediaBuffer } from "@/lib/cms/media";

export async function uploadMediaAction(formData: FormData) {
  await requireMutation("media");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File required");
  }

  const folder = String(formData.get("folder") ?? "covers").trim() || "covers";
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadMediaBuffer({
    buffer,
    contentType: file.type || "application/octet-stream",
    fileName: file.name,
    folder,
  });

  revalidatePath("/dashboard/media");
}

export async function deleteMediaAction(formData: FormData) {
  await requireMutation("media");
  const path = String(formData.get("path") ?? "").trim();
  await deleteMediaPath(path);
  revalidatePath("/dashboard/media");
}
