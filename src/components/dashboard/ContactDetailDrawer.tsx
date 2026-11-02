"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/dashboard/CopyButton";
import {
  DashAvatar,
  DashBadge,
  DashBoolIcon,
  DashDrawer,
  DashTimeline,
} from "@/components/dashboard/ds";
import type { WebappContactRow } from "@/components/dashboard/WebappContactsClient";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import { dashBtnRowSecondary } from "@/styles/dashboard";

export function ContactDetailDrawer({
  row,
  open,
  onClose,
}: {
  row: WebappContactRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  if (!row) return null;

  const name =
    `${row.first_name} ${row.last_name}`.trim() || "—";
  const username = row.telegram_username
    ? `@${row.telegram_username.replace(/^@/, "")}`
    : null;
  const tgHref = row.telegram_username
    ? `https://t.me/${row.telegram_username.replace(/^@/, "")}`
    : null;

  const timeline = [
    {
      id: "created",
      title: t.list.created,
      meta: formatDashDate(row.created_at, intlLocale),
      tone: "info" as const,
    },
    ...(row.lastShipmentAt
      ? [
          {
            id: "last-ship",
            title: t.contacts.lastShipment,
            meta: formatDashDate(row.lastShipmentAt, intlLocale),
            tone: "success" as const,
          },
        ]
      : []),
    {
      id: "fcargo",
      title: row.fcargoLinked
        ? t.contacts.fcargoLinked
        : t.contacts.fcargoNotLinked,
      tone: row.fcargoLinked ? ("success" as const) : ("neutral" as const),
    },
  ];

  return (
    <DashDrawer
      open={open}
      onClose={onClose}
      title={t.contacts.drawerTitle}
      footer={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/webapp/shipments/?contact=${encodeURIComponent(row.session_id)}`}
            className={dashBtnRowSecondary}
            onClick={onClose}
          >
            {t.contacts.openShipments}
            {row.shipmentTotal > 0 ? ` · ${row.shipmentTotal}` : ""}
          </Link>
          {tgHref ? (
            <a
              href={tgHref}
              target="_blank"
              rel="noopener noreferrer"
              className={dashBtnRowSecondary}
            >
              {t.contacts.openTelegram}
              <ExternalLink className="ml-1 size-3.5 opacity-60" aria-hidden />
            </a>
          ) : null}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <DashAvatar
            name={name}
            photoUrl={row.photo_url}
            telegramUserId={row.telegram_user_id}
            size={64}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--dash-ink)]">
              {name}
            </p>
            {username ? (
              <div className="group mt-0.5 inline-flex items-center gap-0.5">
                <span className="text-sm font-medium text-primary">{username}</span>
                <CopyButton value={username} />
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <DashBadge tone="neutral">/{row.locale || "uz"}</DashBadge>
              <DashBadge tone={row.source === "telegram_contact" ? "info" : "neutral"}>
                {row.source || "manual"}
              </DashBadge>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[var(--dash-border)] p-3">
          <div className="group flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
              {t.list.phone}
            </span>
            <span className="inline-flex items-center gap-0.5 font-medium tabular-nums">
              {row.phone || "—"}
              {row.phone ? <CopyButton value={row.phone} /> : null}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
              {t.contacts.verified}
            </span>
            <DashBoolIcon
              value={row.init_data_ok}
              trueTone="success"
              trueLabel={t.contacts.verified}
              falseLabel={t.contacts.unverified}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
              {t.contacts.fcargoLinked}
            </span>
            <DashBoolIcon
              value={row.fcargoLinked}
              trueTone="info"
              trueLabel={t.contacts.fcargoLinked}
              falseLabel={t.contacts.fcargoNotLinked}
            />
          </div>
          <p className="m-0 font-mono text-[0.65rem] text-[var(--dash-faint)]">
            {row.session_id}
          </p>
        </div>

        <div>
          <h3 className="m-0 mb-3 text-sm font-semibold text-[var(--dash-ink)]">
            {t.common.activityFeed}
          </h3>
          <DashTimeline items={timeline} />
        </div>
      </div>
    </DashDrawer>
  );
}
