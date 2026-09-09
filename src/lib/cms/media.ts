import { publicMediaPath } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const MEDIA_BUCKET = "epos-media";
export const MEDIA_PREFIX = "covers/";
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export function assertMediaPath(path: string) {
  if (!path.startsWith(MEDIA_PREFIX) || path.includes("..")) {
    throw new Error("Invalid path");
  }
}

export function assertMediaFile(file: {
  size: number;
  type: string;
  name: string;
}) {
  if (!file.size) throw new Error("File required");
  if (file.size > MEDIA_MAX_BYTES) throw new Error("File too large (max 5MB)");
  if (file.type && !MEDIA_ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported file type");
  }
}

export async function uploadMediaBuffer(params: {
  buffer: Buffer;
  contentType: string;
  fileName: string;
}): Promise<{ path: string; url: string }> {
  assertMediaFile({
    size: params.buffer.byteLength,
    type: params.contentType,
    name: params.fileName,
  });

  const ext = params.fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `${MEDIA_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const client = createSupabaseAdminClient();
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, params.buffer, {
    contentType: params.contentType || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { path, url: publicMediaPath(path) };
}

export async function deleteMediaPath(path: string) {
  assertMediaPath(path);
  const client = createSupabaseAdminClient();
  const { error } = await client.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

export async function listMediaCovers(limit = 100) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client.storage.from(MEDIA_BUCKET).list("covers", {
    limit,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(error.message);
  return (data ?? []).filter((f) => f.name && !f.name.startsWith("."));
}
