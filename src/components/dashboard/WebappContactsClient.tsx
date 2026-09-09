"use client";

import { CopyButton } from "@/components/dashboard/CopyButton";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashAvatar,
  DashCrudPage,
  DashListView,
} from "@/components/dashboard/ds";
import { formatDashDate } from "@/lib/cms/lead-display";

export type WebappContactRow = {
  session_id: string;
  phone: string;
  first_name: string;
  last_name: string;
  locale: string;
  source: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  photo_url: string | null;
  init_data_ok: boolean;
  created_at: string;
};

function contactName(row: WebappContactRow) {
  return `${row.first_name} ${row.last_name}`.trim() || "—";
}

export function WebappContactsClient({ rows }: { rows: WebappContactRow[] }) {
  return (
    <DashCrudPage
      title="WebApp контакты"
      lead="Контакты из Telegram Mini App · фото через Bot API / photo_url"
    >
      <DashListView
        storageKey="webapp-contacts"
        rows={rows}
        rowKey={(r) => r.session_id}
        emptyTitle="Нет контактов"
        emptyLead="Пользователи мини-приложения появятся после первого входа."
        defaultSortId="created"
        defaultSortDir="desc"
        filters={[
          {
            id: "source",
            label: "Источник",
            options: [
              { value: "telegram_contact", label: "Telegram" },
              { value: "manual", label: "Вручную" },
            ],
            getValue: (r) => r.source || "manual",
          },
          {
            id: "locale",
            label: "Язык",
            options: [
              { value: "uz", label: "uz" },
              { value: "ru", label: "ru" },
            ],
            getValue: (r) => r.locale || "uz",
          },
        ]}
        columns={[
          {
            id: "name",
            header: "Имя",
            searchText: (r) =>
              `${contactName(r)} ${r.session_id} ${r.phone} ${r.telegram_username ?? ""} ${r.telegram_user_id ?? ""}`,
            sortValue: (r) => contactName(r),
            cell: (row) => (
              <div className="flex items-center gap-3">
                <DashAvatar
                  name={contactName(row)}
                  photoUrl={row.photo_url}
                  telegramUserId={row.telegram_user_id}
                  size={40}
                />
                <div className="min-w-0">
                  <div className="font-medium text-ink">{contactName(row)}</div>
                  <div className="mt-0.5 font-mono text-[0.65rem] text-black/35">
                    {row.session_id} · /{row.locale}
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "phone",
            header: "Телефон",
            searchText: true,
            sortValue: (r) => r.phone,
            cell: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                <span>{row.phone || "—"}</span>
                {row.phone ? <CopyButton value={row.phone} /> : null}
              </div>
            ),
          },
          {
            id: "telegram",
            header: "Telegram",
            searchText: (r) =>
              `${r.telegram_username ?? ""} ${r.telegram_user_id ?? ""}`,
            sortValue: (r) => r.telegram_username || String(r.telegram_user_id ?? ""),
            cell: (row) => {
              const username = row.telegram_username
                ? `@${row.telegram_username}`
                : "";
              return (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>{username || row.telegram_user_id || "—"}</span>
                  {username ? (
                    <CopyButton value={username} label="@copy" />
                  ) : null}
                </div>
              );
            },
          },
          {
            id: "source",
            header: "Источник",
            sortValue: (r) => r.source,
            cell: (row) => (
              <DashStatusBadge kind="source" value={row.source || "manual"} />
            ),
          },
          {
            id: "init",
            header: "initData",
            hideInCard: true,
            sortValue: (r) => (r.init_data_ok ? 1 : 0),
            cell: (row) => (
              <span className="text-xs text-black/50">
                {row.init_data_ok ? "ok" : "—"}
              </span>
            ),
          },
          {
            id: "created",
            header: "Когда",
            sortValue: (r) => r.created_at,
            cell: (row) => (
              <span className="text-xs text-black/45">
                {formatDashDate(row.created_at)}
              </span>
            ),
          },
        ]}
        renderCard={(row, actionsNode) => (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <DashAvatar
                name={contactName(row)}
                photoUrl={row.photo_url}
                telegramUserId={row.telegram_user_id}
                size={56}
              />
              <div className="min-w-0">
                <p className="m-0 font-semibold text-ink">{contactName(row)}</p>
                <p className="m-0 mt-0.5 font-mono text-[0.65rem] text-black/35">
                  {row.session_id}
                </p>
                <div className="mt-2">
                  <DashStatusBadge kind="source" value={row.source || "manual"} />
                </div>
              </div>
            </div>
            <div className="grid gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-black/45">Тел.</span>
                <span>{row.phone || "—"}</span>
                {row.phone ? <CopyButton value={row.phone} /> : null}
              </div>
              <div>
                <span className="text-black/45">TG · </span>
                {row.telegram_username
                  ? `@${row.telegram_username}`
                  : row.telegram_user_id || "—"}
              </div>
              <div className="text-xs text-black/45">
                {formatDashDate(row.created_at)} · /{row.locale}
              </div>
            </div>
            {actionsNode}
          </div>
        )}
      />
    </DashCrudPage>
  );
}
