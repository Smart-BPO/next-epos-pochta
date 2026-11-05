"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Calculator,
  PackagePlus,
  Phone,
  Send,
  MapPinned,
} from "lucide-react";
import { cabinetCopy } from "@/data/cabinet";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import {
  cabinetHref,
  cabinetShipmentHref,
} from "@/components/cabinet/nav";
import { cabCard, cabPageTitle } from "@/styles/cabinet";
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";
import { intlLocale } from "@/i18n/config";

export function CabinetHomeView() {
  const { locale, linked } = useCabinetSession();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);
  const name = linked.displayName || linked.phone;
  const successRate =
    stats.total > 0
      ? Math.round((stats.counts.delivered / stats.total) * 100)
      : 0;
  const returnRate =
    stats.total > 0 ? Math.round((stats.returns / stats.total) * 1000) / 10 : 0;
  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.count));

  const stageCards = [
    { key: "created", label: c.stageCreated, n: stats.counts.created, color: "bg-black/70" },
    { key: "accepted", label: c.stageAccepted, n: stats.counts.accepted, color: "bg-sky-500" },
    { key: "in_transit", label: c.stageTransit, n: stats.counts.in_transit, color: "bg-amber-500" },
    { key: "out_for_delivery", label: c.stageOut, n: stats.counts.out_for_delivery, color: "bg-orange-500" },
    { key: "delivery_attempt", label: c.stageAttempt, n: stats.counts.delivery_attempt, color: "bg-rose-500" },
    { key: "delivered", label: c.stageDelivered, n: stats.counts.delivered, color: "bg-emerald-500" },
    { key: "returned", label: c.stageReturned, n: stats.counts.returned, color: "bg-violet-500" },
    { key: "cancelled", label: c.stageCancelled, n: stats.counts.cancelled, color: "bg-black/35" },
  ] as const;

  const barTotal = stageCards.reduce((s, x) => s + x.n, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={cabPageTitle}>
            {c.goodDay}, {name.split(/\s+/)[0]}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
            {c.range30}
          </span>
          <Link
            href={cabinetHref(locale, "orders/")}
            className="inline-flex h-9 items-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-ink no-underline hover:bg-black/[0.03]"
          >
            {c.allOrders}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: c.statTotal,
            value: stats.total,
            hint: null as string | null,
          },
          {
            label: c.kpiInProgress,
            value: stats.inProgress,
            hint: null,
          },
          {
            label: c.kpiDelivered,
            value: stats.counts.delivered,
            hint: `${successRate}% ${c.kpiSuccessRate}`,
          },
          {
            label: c.kpiReturns,
            value: stats.returns,
            hint: `${returnRate}% ${c.kpiOfAll}`,
          },
        ].map((card) => (
          <div key={card.label} className={`${cabCard} p-4`}>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
              {card.label}
            </p>
            <p className="m-0 mt-1 font-display text-3xl font-bold tracking-tight text-ink">
              {stats.loaded ? card.value : "—"}
            </p>
            {card.hint ? (
              <p className="m-0 mt-1 text-xs text-[var(--dash-muted)]">
                {card.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {stats.attention.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-800">
            <AlertTriangle className="size-4" aria-hidden />
            {c.attentionTitle}
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs text-white">
              {stats.attention.length}
            </span>
          </div>
          <Link
            href={cabinetHref(locale, "orders/")}
            className="text-sm font-semibold text-rose-800 underline-offset-2 hover:underline"
          >
            {c.attentionReview}
          </Link>
        </div>
      ) : null}

      <div className={`${cabCard} p-4 sm:p-5`}>
        <p className="m-0 mb-3 text-sm font-semibold text-ink">
          {c.statusBreakdown}
        </p>
        <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-black/[0.04]">
          {stageCards.map((s) =>
            s.n > 0 ? (
              <span
                key={s.key}
                className={cn(s.color)}
                style={{ width: `${(s.n / barTotal) * 100}%` }}
                title={`${s.label}: ${s.n}`}
              />
            ) : null,
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {stageCards.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-black/[0.06] bg-black/[0.015] px-2.5 py-2"
            >
              <p className="m-0 truncate text-[11px] text-[var(--dash-muted)]">
                {s.label}
              </p>
              <p className="m-0 font-display text-lg font-semibold text-ink">
                {s.n}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className={`${cabCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <p className="m-0 text-sm font-semibold text-ink">{c.dailyOrders}</p>
            <p className="m-0 text-xs text-[var(--dash-muted)]">{c.last14Days}</p>
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {stats.daily.map((d, i) => {
              const h = (d.count / maxDaily) * 100;
              const active = i === stats.daily.length - 1;
              return (
                <div
                  key={d.key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                  title={`${d.label}: ${d.count}`}
                >
                  <span className="text-[10px] font-semibold text-ink">
                    {d.count || ""}
                  </span>
                  <span
                    className={cn(
                      "w-full rounded-t-md",
                      active ? "bg-primary" : "bg-primary/25",
                    )}
                    style={{ height: `${Math.max(d.count ? 8 : 2, h)}%` }}
                  />
                  <span className="truncate text-[9px] text-[var(--dash-faint)]">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${cabCard} flex flex-col p-4 sm:p-5`}>
          <p className="m-0 text-sm font-semibold text-ink">{c.financeTitle}</p>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-[var(--dash-muted)]">
            {c.financeLead}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white no-underline"
            >
              <Phone className="size-3.5" aria-hidden />
              {c.managerCall}
            </a>
            <a
              href={SITE_CONFIG.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-ink no-underline"
            >
              <Send className="size-3.5" aria-hidden />
              {c.financeCta}
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className={`${cabCard} overflow-hidden`}>
          <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-3">
            <p className="m-0 text-sm font-semibold text-ink">{c.recentOrders}</p>
            <Link
              href={cabinetHref(locale, "orders/")}
              className="text-xs font-semibold text-primary no-underline hover:underline"
            >
              {c.allOrders}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wide text-[var(--dash-faint)]">
                  <th className="px-4 py-2 font-semibold">{c.colTrack}</th>
                  <th className="px-4 py-2 font-semibold">{c.colRoute}</th>
                  <th className="px-4 py-2 font-semibold">{c.colStatus}</th>
                  <th className="px-4 py-2 font-semibold">{c.colCreated}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.length === 0 && stats.loaded ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-[var(--dash-muted)]"
                    >
                      —
                    </td>
                  </tr>
                ) : null}
                {stats.recent.map((row) => (
                  <tr
                    key={row.trackingNumber}
                    className="border-b border-black/[0.04] last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={cabinetShipmentHref(locale, row.trackingNumber)}
                        className="font-mono text-xs font-semibold text-primary no-underline hover:underline"
                      >
                        {row.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink">
                      {[row.fromLabel, row.toLabel].filter(Boolean).join(" → ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <AccountStatusBadge
                        stage={row.stage}
                        label={row.statusLabel}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--dash-muted)]">
                      {row.createdAt
                        ? new Intl.DateTimeFormat(intlLocale(locale), {
                            day: "2-digit",
                            month: "short",
                          }).format(new Date(row.createdAt))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`${cabCard} p-4`}>
            <p className="m-0 mb-3 text-sm font-semibold text-ink">
              {c.attentionTitle}
            </p>
            {stats.attention.length === 0 ? (
              <p className="m-0 text-sm text-[var(--dash-muted)]">
                {c.noAttention}
              </p>
            ) : (
              <ul className="m-0 list-none space-y-2 p-0">
                {stats.attention.slice(0, 5).map((row) => (
                  <li key={row.trackingNumber}>
                    <Link
                      href={cabinetShipmentHref(locale, row.trackingNumber)}
                      className="flex items-start justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2 no-underline hover:bg-rose-100/80"
                    >
                      <span>
                        <span className="block font-mono text-xs font-semibold text-ink">
                          {row.trackingNumber}
                        </span>
                        <span className="block text-xs text-rose-800">
                          {row.statusLabel}
                        </span>
                      </span>
                      <AlertTriangle
                        className="mt-0.5 size-3.5 shrink-0 text-rose-600"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`${cabCard} p-4`}>
            <p className="m-0 mb-3 text-sm font-semibold text-ink">
              {c.quickActions}
            </p>
            <div className="grid gap-2">
              {(
                [
                  {
                    href: cabinetHref(locale, "new/"),
                    icon: PackagePlus,
                    label: c.quickNew,
                  },
                  {
                    href: cabinetHref(locale, "tracking/"),
                    icon: MapPinned,
                    label: c.quickTrack,
                  },
                  {
                    href: cabinetHref(locale, "calculator/"),
                    icon: Calculator,
                    label: c.quickCalc,
                  },
                  {
                    href: SITE_CONFIG.telegramUrl,
                    icon: Send,
                    label: c.quickHelp,
                    external: true,
                  },
                ] as const
              ).map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  {...("external" in a && a.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/[0.06] px-3 py-2.5 text-sm font-semibold text-ink no-underline transition hover:bg-black/[0.03]"
                >
                  <a.icon className="size-4 text-primary" aria-hidden />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
