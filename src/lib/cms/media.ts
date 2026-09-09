import { publicMediaPath } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isMediaFolder,
  MEDIA_FOLDERS,
  type MediaFileRow,
  type MediaFolder,
} from "@/lib/cms/media-folders";

export {
  MEDIA_FOLDERS,
  isMediaFolder,
  type MediaFileRow,
  type MediaFolder,
} from "@/lib/cms/media-folders";

export const MEDIA_BUCKET = "epos-media";
/** Legacy + news folders under storage. */
export const MEDIA_PREFIX = "covers/";
export const MEDIA_NEWS_PREFIX = "news/";
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export function assertMediaPath(path: string) {
  if (path.includes("..")) throw new Error("Invalid path");
  if (
    !path.startsWith(MEDIA_PREFIX) &&
    !path.startsWith(MEDIA_NEWS_PREFIX)
  ) {
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

function normalizeFolder(folder?: string): MediaFolder {
  const raw = (folder ?? "covers").replace(/^\/+|\/+$/g, "");
  if (!isMediaFolder(raw)) {
    throw new Error("Invalid folder");
  }
  return raw;
}

export async function uploadMediaBuffer(params: {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  folder?: string;
}): Promise<{ path: string; url: string }> {
  assertMediaFile({
    size: params.buffer.byteLength,
    type: params.contentType,
    name: params.fileName,
  });

  const folder = normalizeFolder(params.folder);
  const ext = params.fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

/** List files from every allowed media folder. */
export async function listMediaFiles(
  limitPerFolder = 200,
): Promise<MediaFileRow[]> {
  const client = createSupabaseAdminClient();
  const chunks = await Promise.all(
    MEDIA_FOLDERS.map(async (folder) => {
      const { data, error } = await client.storage
        .from(MEDIA_BUCKET)
        .list(folder, {
          limit: limitPerFolder,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (error) throw new Error(error.message);

      return (data ?? [])
        .filter((f) => Boolean(f.id) && f.name && !f.name.startsWith("."))
        .map((f): MediaFileRow => {
          const path = `${folder}/${f.name}`;
          const size =
            f.metadata &&
            typeof f.metadata === "object" &&
            "size" in f.metadata &&
            typeof (f.metadata as { size?: unknown }).size === "number"
              ? (f.metadata as { size: number }).size
              : null;
          return {
            name: f.name,
            path,
            folder,
            url: publicMediaPath(path),
            created_at: f.created_at ?? null,
            size,
          };
        });
    }),
  );

  return chunks.flat().sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });
}

/** @deprecated Prefer listMediaFiles — kept for callers that only need legacy covers. */
export async function listMediaCovers(limit = 100) {
  const all = await listMediaFiles(limit);
  return all.filter((f) => f.folder === "covers");
}
