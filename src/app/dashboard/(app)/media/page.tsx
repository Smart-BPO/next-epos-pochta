import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { uploadMediaAction } from "./actions";

export default async function DashboardMediaPage() {
  let files: { name: string; created_at?: string | null }[] = [];
  let baseUrl = "";

  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client.storage.from("epos-media").list("covers", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
    files = data ?? [];
    const { data: pub } = client.storage
      .from("epos-media")
      .getPublicUrl("covers/placeholder");
    baseUrl = pub.publicUrl.replace(/\/covers\/placeholder$/, "");
  }

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Медиа</h1>
      <p className="mt-1 text-sm text-black/50">
        Bucket <code>epos-media</code> — обложки новостей
      </p>
      <form
        action={uploadMediaAction}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/8 bg-white p-4"
      >
        <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
          Файл
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-sm font-normal normal-case"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Загрузить
        </button>
      </form>
      <ul className="mt-6 grid gap-2">
        {files.length === 0 ? (
          <li className="text-sm text-black/40">Пока пусто</li>
        ) : (
          files.map((f) => {
            const url = `${baseUrl}/covers/${f.name}`;
            return (
              <li
                key={f.name}
                className="rounded-lg border border-black/8 bg-white px-3 py-2 text-sm"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {url}
                </a>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
