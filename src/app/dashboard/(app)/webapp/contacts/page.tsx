import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export default async function WebappContactsPage() {
  type Row = {
    session_id: string;
    phone: string;
    first_name: string;
    last_name: string;
    locale: string;
    source: string;
    telegram_user_id: number | null;
    telegram_username: string | null;
    init_data_ok: boolean;
    created_at: string;
  };

  let rows: Row[] = [];
  if (hasSupabaseAdminConfig()) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("epos_webapp_contacts")
      .select(
        "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, init_data_ok, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data ?? []) as Row[];
  }

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">WebApp контакты</h1>
      <p className="mt-1 text-sm text-black/50">Telegram Mini App</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/8 text-xs uppercase text-black/40">
            <tr>
              <th className="px-3 py-2">Сессия</th>
              <th className="px-3 py-2">Имя</th>
              <th className="px-3 py-2">Телефон</th>
              <th className="px-3 py-2">TG</th>
              <th className="px-3 py-2">initData</th>
              <th className="px-3 py-2">Когда</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-black/40">
                  Нет контактов
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.session_id} className="border-b border-black/5">
                  <td className="px-3 py-3 font-mono text-xs">
                    {row.session_id}
                  </td>
                  <td className="px-3 py-3">
                    {row.first_name} {row.last_name}
                    <span className="ml-1 text-xs text-black/35">
                      /{row.locale}
                    </span>
                  </td>
                  <td className="px-3 py-3">{row.phone}</td>
                  <td className="px-3 py-3 text-xs">
                    {row.telegram_username
                      ? `@${row.telegram_username}`
                      : (row.telegram_user_id ?? "—")}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {row.init_data_ok ? "ok" : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-black/45">
                    {new Date(row.created_at).toLocaleString("ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
