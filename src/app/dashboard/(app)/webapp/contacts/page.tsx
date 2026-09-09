import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashEmptyState,
  DashPageHeader,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
} from "@/components/dashboard/ui";
import { formatDashDate } from "@/lib/cms/lead-display";

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
    <div className="space-y-5">
      <DashPageHeader
        title="WebApp контакты"
        lead="Контакты из Telegram Mini App"
      />
      <DashTableShell title="Список">
        {rows.length === 0 ? (
          <DashEmptyState
            title="Нет контактов"
            lead="Пользователи мини-приложения появятся после первого входа."
          />
        ) : (
          <DashTable minWidth="820px">
            <thead>
              <tr>
                <DashTh>Имя</DashTh>
                <DashTh>Телефон</DashTh>
                <DashTh>Telegram</DashTh>
                <DashTh>Источник</DashTh>
                <DashTh>initData</DashTh>
                <DashTh>Когда</DashTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const name =
                  `${row.first_name} ${row.last_name}`.trim() || "—";
                const username = row.telegram_username
                  ? `@${row.telegram_username}`
                  : "";
                return (
                  <tr key={row.session_id} className="hover:bg-black/[0.015]">
                    <DashTd>
                      <div className="font-medium text-ink">{name}</div>
                      <div className="mt-0.5 font-mono text-[0.65rem] text-black/35">
                        {row.session_id} · /{row.locale}
                      </div>
                    </DashTd>
                    <DashTd>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{row.phone || "—"}</span>
                        {row.phone ? <CopyButton value={row.phone} /> : null}
                      </div>
                    </DashTd>
                    <DashTd>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span>
                          {username || row.telegram_user_id || "—"}
                        </span>
                        {username ? (
                          <CopyButton value={username} label="@copy" />
                        ) : null}
                      </div>
                    </DashTd>
                    <DashTd>
                      <DashStatusBadge kind="source" value={row.source || "manual"} />
                    </DashTd>
                    <DashTd className="text-xs text-black/50">
                      {row.init_data_ok ? "ok" : "—"}
                    </DashTd>
                    <DashTd className="text-xs text-black/45">
                      {formatDashDate(row.created_at)}
                    </DashTd>
                  </tr>
                );
              })}
            </tbody>
          </DashTable>
        )}
      </DashTableShell>
    </div>
  );
}
