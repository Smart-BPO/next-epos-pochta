import { requireAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  WebappContactsClient,
  type WebappContactRow,
} from "@/components/dashboard/WebappContactsClient";

export default async function WebappContactsPage() {
  const session = await requireAccess("webapp");
  if (!session) {
    return (
      <DashAccessDenied title="WebApp контакты" lead="Нет доступа." />
    );
  }

  let rows: WebappContactRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("epos_webapp_contacts")
      .select(
        "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, photo_url, init_data_ok, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    rows = (data ?? []) as WebappContactRow[];
  }

  return <WebappContactsClient rows={rows} />;
}
