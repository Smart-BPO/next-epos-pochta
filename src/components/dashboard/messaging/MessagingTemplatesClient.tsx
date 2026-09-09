"use client";

import Link from "next/link";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { DashCrudPage, DashListView } from "@/components/dashboard/ds";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import type { MessageTemplate } from "@/lib/messaging/store";

export function MessagingTemplatesClient({
  rows,
}: {
  rows: MessageTemplate[];
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);

  return (
    <DashCrudPage
      title={t.messaging.templatesTitle}
      lead={t.messaging.templatesLead}
    >
      <MessagingSubnav />
      <DashListView
        storageKey="msg-templates"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle={t.common.emptyTitle}
        defaultSortId="key"
        defaultSortDir="asc"
        defaultView="table"
        filters={[
          {
            id: "channel",
            label: t.list.type,
            options: [
              { value: "sms", label: t.messaging.channelSms },
              { value: "email", label: t.messaging.channelEmail },
            ],
            getValue: (r) => r.channel,
          },
          {
            id: "locale",
            label: t.list.locale,
            options: [
              { value: "uz", label: "uz" },
              { value: "ru", label: "ru" },
            ],
            getValue: (r) => r.locale,
          },
        ]}
        columns={[
          {
            id: "name",
            header: t.list.title,
            searchText: (r) =>
              `${r.name} ${r.key} ${r.description} ${r.body_text}`,
            sortValue: (r) => r.name,
            cell: (row) => (
              <div>
                <Link
                  href={`/dashboard/messaging/templates/${row.id}/`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.name}
                </Link>
                <p className="m-0 mt-0.5 font-mono text-[0.65rem] text-black/40">
                  {row.key}
                </p>
              </div>
            ),
          },
          {
            id: "channel",
            header: t.list.type,
            sortValue: (r) => r.channel,
            cell: (r) => (
              <span className="text-xs font-semibold uppercase text-black/55">
                {r.channel === "sms"
                  ? t.messaging.channelSms
                  : t.messaging.channelEmail}
              </span>
            ),
          },
          {
            id: "locale",
            header: t.list.locale,
            sortValue: (r) => r.locale,
            cell: (r) => (
              <span className="text-xs font-medium">{r.locale}</span>
            ),
          },
          {
            id: "updated",
            header: t.list.updated,
            sortValue: (r) => r.updated_at,
            cell: (r) => (
              <span className="text-xs text-black/45">
                {formatDashDate(r.updated_at, intlLocale)}
              </span>
            ),
          },
        ]}
      />
    </DashCrudPage>
  );
}
