import { requireAccess, canMutate } from "@/lib/cms/auth";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { listMediaFiles, type MediaFileRow } from "@/lib/cms/media";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MediaListClient } from "@/components/dashboard/MediaListClient";
import { deleteMediaAction } from "./actions";

export default async function DashboardMediaPage() {
  const admin = await requireAccess("media");
  if (!admin) {
    return <DashDenied section="media" />;
  }

  let files: MediaFileRow[] = [];

  if (hasSupabaseAdminConfig()) {
    try {
      files = await listMediaFiles();
    } catch {
      files = [];
    }
  }

  const canWrite = canMutate(admin.role, "media");

  return (
    <MediaListClient
      files={files}
      canWrite={canWrite}
      deleteAction={deleteMediaAction}
    />
  );
}
