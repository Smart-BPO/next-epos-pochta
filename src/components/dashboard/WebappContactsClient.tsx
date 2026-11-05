"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { ContactDetailDrawer } from "@/components/dashboard/ContactDetailDrawer";
import {
  useDashLocale,
  useDashT,
} from "@/components/dashboard/DashLocaleProvider";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashAvatar,
  DashBoolIcon,
  DashCrudPage,
  DashListView,
} from "@/components/dashboard/ds";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import { cn } from "@/lib/cn";
import { dashBtnRowSecondary } from "@/styles/dashboard";

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
  shipmentTotal: number;
  shipmentPending: number;
  incomingTotal: number;
  lastShipmentAt: string | null;
  fcargoLinked: boolean;
};

function contactName(row: WebappContactRow) {
  return `${row.first_name} ${row.last_name}`.trim() || "—";
}

function telegramHref(row: WebappContactRow) {
  if (row.telegram_username) {
    return `https://t.me/${row.telegram_username.replace(/^@/, "")}`;
  }
  return null;
}

function ContactCard({
  row,
  intlLocale,
}: {
  row: WebappContactRow;
  intlLocale: string;
}) {
  const t = useDashT();
  const name = contactName(row);
  const tgLink = telegramHref(row);
  const username = row.telegram_username
    ? `@${row.telegram_username.replace(/^@/, "")}`
    : null;

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="border-b border-black/[0.06] bg-[linear-gradient(135deg,#fff5f5_0%,#ffffff_55%)] px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <DashAvatar
            name={name}
            photoUrl={row.photo_url}
            telegramUserId={row.telegram_user_id}
            size={64}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate font-display text-base font-semibold tracking-[-0.02em] text-ink">
              {name}
            </p>
            {username ? (
              tgLink ? (
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {username}
                  <ExternalLink className="size-3.5 opacity-60" aria-hidden />
                </a>
              ) : (
                <p className="m-0 mt-0.5 text-sm text-black/55">{username}</p>
              )
            ) : row.telegram_user_id ? (
              <p className="m-0 mt-0.5 font-mono text-xs text-black/40">
                id {row.telegram_user_id}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <DashStatusBadge kind="source" value={row.source || "manual"} />
              <span className="rounded-lg border border-black/8 bg-white px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-black/45">
                /{row.locale || "uz"}
              </span>
              <span
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[0.65rem] font-semibold",
                  row.init_data_ok
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-black/[0.04] text-black/40",
                )}
              >
                {row.init_data_ok ? t.contacts.verified : t.contacts.unverified}
              </span>
              {row.fcargoLinked ? (
                <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[0.65rem] font-semibold text-sky-700">
                  {t.contacts.fcargoLinked}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5 text-sm">
          <div className="group flex flex-wrap items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-black/35">
              {t.list.phone}
            </span>
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap font-medium tabular-nums text-ink">
              {row.phone || "—"}
              {row.phone ? <CopyButton value={row.phone} /> : null}
            </span>
          </div>
          <p className="m-0 font-mono text-[0.65rem] text-black/30">
            {row.session_id}
          </p>
          <p className="m-0 text-xs text-black/40">
            {formatDashDate(row.created_at, intlLocale)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-black/[0.06] bg-black/[0.015] p-2.5">
          <div className="min-w-0 text-center">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide text-black/35">
              {t.shipments.tabOut}
            </p>
            <p className="m-0 mt-1 font-display text-lg font-bold text-ink">
              {row.shipmentTotal}
            </p>
          </div>
          <div className="min-w-0 border-l border-black/[0.06] text-center">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide text-black/35">
              {t.shipments.tabIn}
            </p>
            <p className="m-0 mt-1 font-display text-lg font-bold text-ink">
              {row.incomingTotal}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-black/[0.06] pt-3">
          <Link
            href={`/dashboard/webapp/shipments/?dir=out&contact=${encodeURIComponent(row.session_id)}`}
            className={dashBtnRowSecondary}
          >
            {t.contacts.openShipments}
            {row.shipmentTotal > 0 ? ` · ${row.shipmentTotal}` : ""}
          </Link>
          <Link
            href={`/dashboard/webapp/shipments/?dir=in&contact=${encodeURIComponent(row.session_id)}`}
            className={dashBtnRowSecondary}
          >
            {t.contacts.openIncoming}
            {row.incomingTotal > 0 ? ` · ${row.incomingTotal}` : ""}
          </Link>
          {tgLink ? (
            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className={dashBtnRowSecondary}
            >
              {t.contacts.openTelegram}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function WebappContactsClient({ rows }: { rows: WebappContactRow[] }) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const [drawerRow, setDrawerRow] = useState<WebappContactRow | null>(null);

  return (
    <DashCrudPage title={t.contacts.title} lead={t.contacts.lead}>
      <ContactDetailDrawer
        row={drawerRow}
        open={Boolean(drawerRow)}
        onClose={() => setDrawerRow(null)}
      />
      <DashListView
        storageKey="webapp-contacts"
        rows={rows}
        rowKey={(r) => r.session_id}
        emptyTitle={t.contacts.emptyTitle}
        emptyLead={t.contacts.emptyLead}
        defaultView="table"
        defaultSortId="created"
        defaultSortDir="desc"
        selectable
        syncUrl
        filters={[
          {
            id: "source",
            label: t.list.source,
            options: [
              {
                value: "telegram_contact",
                label: t.badge.source.telegram_contact,
              },
              { value: "manual", label: t.badge.source.manual },
            ],
            getValue: (r) => r.source || "manual",
          },
          {
            id: "locale",
            label: t.list.locale,
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
            header: t.list.name,
            searchText: (r) =>
              `${contactName(r)} ${r.session_id} ${r.phone} ${r.telegram_username ?? ""} ${r.telegram_user_id ?? ""}`,
            sortValue: (r) => contactName(r),
            sticky: true,
            cell: (row) => (
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg text-left transition hover:bg-black/[0.02]"
                onClick={() => setDrawerRow(row)}
              >
                <DashAvatar
                  name={contactName(row)}
                  photoUrl={row.photo_url}
                  telegramUserId={row.telegram_user_id}
                  size={40}
                />
                <div className="min-w-0">
                  <div className="font-medium text-ink">{contactName(row)}</div>
                  <div className="mt-0.5 font-mono text-[0.65rem] tabular-nums text-black/35">
                    {row.session_id} · /{row.locale}
                  </div>
                </div>
              </button>
            ),
          },
          {
            id: "phone",
            header: t.list.phone,
            searchText: true,
            sortValue: (r) => r.phone,
            cell: (row) => (
              <div className="group inline-flex max-w-full items-center gap-0.5 whitespace-nowrap">
                <span className="tabular-nums">{row.phone || "—"}</span>
                {row.phone ? <CopyButton value={row.phone} /> : null}
              </div>
            ),
          },
          {
            id: "telegram",
            header: t.list.telegram,
            searchText: (r) =>
              `${r.telegram_username ?? ""} ${r.telegram_user_id ?? ""}`,
            sortValue: (r) =>
              r.telegram_username || String(r.telegram_user_id ?? ""),
            cell: (row) => {
              const username = row.telegram_username
                ? `@${row.telegram_username.replace(/^@/, "")}`
                : "";
              const href = telegramHref(row);
              return (
                <div className="group inline-flex max-w-full items-center gap-0.5 whitespace-nowrap text-sm">
                  {href && username ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {username}
                    </a>
                  ) : (
                    <span>{username || row.telegram_user_id || "—"}</span>
                  )}
                  {username ? <CopyButton value={username} /> : null}
                </div>
              );
            },
          },
          {
            id: "shipments",
            header: t.contacts.openShipments,
            sortValue: (r) => r.shipmentTotal + r.incomingTotal,
            cell: (row) => (
              <div className="inline-flex flex-col gap-0.5 text-sm">
                <Link
                  href={`/dashboard/webapp/shipments/?dir=out&contact=${encodeURIComponent(row.session_id)}`}
                  className="font-semibold text-ink hover:text-primary"
                >
                  {t.shipments.tabOut} · {row.shipmentTotal}
                  {row.shipmentPending > 0 ? (
                    <span className="ml-1 text-xs font-semibold text-amber-700">
                      · {row.shipmentPending} {t.contacts.shipmentsPending.toLowerCase()}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={`/dashboard/webapp/shipments/?dir=in&contact=${encodeURIComponent(row.session_id)}`}
                  className="text-[0.75rem] text-black/55 hover:text-primary"
                >
                  {t.shipments.tabIn} · {row.incomingTotal}
                </Link>
                <span className="text-[0.65rem] text-black/40">
                  {row.lastShipmentAt
                    ? formatDashDate(row.lastShipmentAt, intlLocale)
                    : t.contacts.noShipments}
                </span>
              </div>
            ),
          },
          {
            id: "source",
            header: t.list.source,
            sortValue: (r) => r.source,
            cell: (row) => (
              <DashStatusBadge kind="source" value={row.source || "manual"} />
            ),
          },
          {
            id: "init",
            header: t.list.verified,
            hideInCard: true,
            sortValue: (r) => (r.init_data_ok ? 1 : 0),
            cell: (row) => (
              <DashBoolIcon
                value={row.init_data_ok}
                trueTone="success"
                trueLabel={t.contacts.verified}
                falseLabel={t.contacts.unverified}
              />
            ),
          },
          {
            id: "fcargo",
            header: t.contacts.fcargoLinked,
            hideInCard: true,
            sortValue: (r) => (r.fcargoLinked ? 1 : 0),
            cell: (row) => (
              <DashBoolIcon
                value={row.fcargoLinked}
                trueTone="info"
                trueLabel={t.contacts.fcargoLinked}
                falseLabel={t.contacts.fcargoNotLinked}
              />
            ),
          },
          {
            id: "created",
            header: t.list.when,
            sortValue: (r) => r.created_at,
            cell: (row) => (
              <span className="text-xs text-black/45">
                {formatDashDate(row.created_at, intlLocale)}
              </span>
            ),
          },
        ]}
        renderCard={(row) => (
          <ContactCard row={row} intlLocale={intlLocale} />
        )}
      />
    </DashCrudPage>
  );
}
