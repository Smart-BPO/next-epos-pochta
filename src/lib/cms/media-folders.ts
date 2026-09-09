/** Client-safe media folder ids (no Supabase imports). */
export const MEDIA_FOLDERS = [
  "covers",
  "news/covers",
  "news/inline",
  "news/og",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export type MediaFileRow = {
  name: string;
  path: string;
  folder: MediaFolder;
  url: string;
  created_at: string | null;
  size: number | null;
};

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}
