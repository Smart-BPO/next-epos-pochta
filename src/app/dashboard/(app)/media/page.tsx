import { requireAccess, canMutate } from "@/lib/cms/auth";
import {
  hasSupabaseAdminConfig,
  publicMediaPath,
} from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  MediaListClient,
  type MediaListItem,
} from "@/components/dashboard/MediaListClient";
import { deleteMediaAction } from "./actions";

export default async function DashboardMediaPage() {
  const admin = await requireAccess("media");
  if (!admin) {
    return (
      <DashAccessDenied
        title="Медиа"
        lead="Нет доступа к разделу медиа."
      />
    );
  }

  let files: MediaListItem[] = [];

  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client.storage.from("epos-media").list("covers", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    files = (data ?? [])
      .filter((f) => f.name && !f.name.startsWith("."))
      .map((f) => {
        const path = `covers/${f.name}`;
        return {
          name: f.name,
          path,
          url: publicMediaPath(path),
          created_at: f.created_at,
        };
      });
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
