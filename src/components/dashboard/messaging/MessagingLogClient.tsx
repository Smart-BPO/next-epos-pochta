"use client";

import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import type { MessageLogRow } from "@/lib/messaging/store";

export function MessagingLogClient({ rows }: { rows: MessageLogRow[] }) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);

  return (
    <DashCrudPage title={t.messaging.logTitle} lead={t.messaging.logLead}>
      <MessagingSubnav />
      <DashListView
        storageKey="msg-log"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle={t.messaging.emptyLog}
        defaultSortId="created"
        defaultSortDir="desc"
        defaultView="table"
        filters={[
          {
            id: "channel",
            label: t.list.type,
            options: [
              { value: "sms", label: t.messaging.channelSms },
              { value: "email", label: t.messaging.channelEmail },
              { value: "telegram", label: t.messaging.channelTelegram },
            ],
            getValue: (r) => r.channel,
          },
          {
            id: "status",
            label: t.list.status,
            options: [
              { value: "sent", label: t.messaging.statusSent },
              { value: "failed", label: t.messaging.statusFailed },
              { value: "skipped", label: t.messaging.statusSkipped },
            ],
            getValue: (r) => r.status,
          },
        ]}
        columns={[
          {
            id: "created",
            header: t.list.created,
            searchText: (r) =>
              `${r.event} ${r.to_masked} ${r.template_key ?? ""} ${r.error ?? ""}`,
            sortValue: (r) => r.created_at,
            cell: (r) => (
              <span className="text-xs text-black/55">
                {formatDashDate(r.created_at, intlLocale)}
              </span>
            ),
          },
          {
            id: "event",
            header: t.list.type,
            sortValue: (r) => r.event,
            cell: (r) => (
              <span className="font-mono text-xs">{r.event}</span>
            ),
          },
          {
            id: "channel",
            header: t.messaging.channelSms,
            sortValue: (r) => r.channel,
            cell: (r) => (
              <span className="text-xs font-semibold uppercase">
                {r.channel}
              </span>
            ),
          },
          {
            id: "to",
            header: t.list.contact,
            cell: (r) => (
              <span className="font-mono text-xs">{r.to_masked || "—"}</span>
            ),
          },
          {
            id: "status",
            header: t.list.status,
            sortValue: (r) => r.status,
            cell: (r) => (
              <span
                className={
                  r.status === "sent"
                    ? "text-xs font-semibold text-emerald-700"
                    : r.status === "failed"
                      ? "text-xs font-semibold text-primary"
                      : "text-xs font-semibold text-black/40"
                }
              >
                {r.status}
              </span>
            ),
          },
        ]}
      />
    </DashCrudPage>
  );
}
