"use client";

import Link from "next/link";
import { cabinetCopy } from "@/data/cabinet";
import { intlLocale } from "@/i18n/config";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import {
  cabinetHref,
  cabinetShipmentHref,
} from "@/components/cabinet/nav";
import { cabCard, cabPageTitle } from "@/styles/cabinet";
import { cn } from "@/lib/cn";

export function CabinetHomeView() {
  const { locale, linked } = useCabinetSession();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);
  const firstName = (linked.displayName || "").trim().split(/\s+/)[0];
  const successRate =
    stats.total > 0
      ? Math.round((stats.counts.delivered / stats.total) * 100)
      : null;
  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.count));
  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "short",
  });

  const kpis = [
    { label: c.statTotal, value: stats.total, hint: null },
    { label: c.kpiInProgress, value: stats.inProgress, hint: null },
    {
      label: c.kpiDelivered,
      value: stats.counts.delivered,
      hint: successRate != null ? `${successRate}%` : null,
    },
    { label: c.kpiReturns, value: stats.returns, hint: null },
  ];

  const stages = [
    { key: "created", label: c.stageCreated, n: stats.counts.created },
    { key: "accepted", label: c.stageAccepted, n: stats.counts.accepted },
    { key: "in_transit", label: c.stageTransit, n: stats.counts.in_transit },
    { key: "out_for_delivery", label: c.stageOut, n: stats.counts.out_for_delivery },
    { key: "delivery_attempt", label: c.stageAttempt, n: stats.counts.delivery_attempt },
    { key: "delivered", label: c.stageDelivered, n: stats.counts.delivered },
    { key: "returned", label: c.stageReturned, n: stats.counts.returned },
  ].filter((s) => s.n > 0);

  return (
    <div className="space-y-4">
      <h1 className={cabPageTitle}>
        {firstName ? `${c.goodDay}, ${firstName}` : c.navHome}
      </h1>

      <dl className="m-0 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${cabCard} p-4`}>
            <dt className="text-xs text-[var(--dash-muted)]">{k.label}</dt>
            <dd className="m-0 mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {stats.loaded ? k.value : "—"}
              </span>
              {k.hint ? (
                <span className="text-xs text-[var(--dash-muted)]">{k.hint}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className={`${cabCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-ink">{c.dailyOrders}</h2>
            <span className="text-xs text-[var(--dash-muted)]">{c.last14Days}</span>
          </div>
          <div className="flex h-36 items-end gap-1">
            {stats.daily.map((d, i) => (
              <div
                key={d.key}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${d.label}: ${d.count}`}
              >
                <span
                  className={cn(
                    "w-full rounded-sm",
                    i === stats.daily.length - 1 ? "bg-primary" : "bg-black/[0.12]",
                  )}
                  style={{
                    height: `${d.count ? Math.max(6, (d.count / maxDaily) * 100) : 2}%`,
                  }}
                />
                <span className="hidden text-[10px] text-[var(--dash-faint)] sm:block">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${cabCard} p-4 sm:p-5`}>
          <h2 className="m-0 mb-3 text-sm font-semibold text-ink">
            {c.statusBreakdown}
          </h2>
          {stages.length === 0 ? (
            <p className="m-0 text-sm text-[var(--dash-muted)]">—</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-black/[0.06] p-0">
              {stages.map((s) => (
                <li
                  key={s.key}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-[var(--dash-muted-strong)]">{s.label}</span>
                  <span className="font-semibold tabular-nums text-ink">{s.n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {stats.attention.length > 0 ? (
        <section className={`${cabCard} p-4 sm:p-5`}>
          <h2 className="m-0 mb-2 text-sm font-semibold text-ink">
            {c.attentionTitle}
          </h2>
          <ul className="m-0 list-none divide-y divide-black/[0.06] p-0">
            {stats.attention.slice(0, 5).map((row) => (
              <li key={row.trackingNumber}>
                <Link
                  href={cabinetShipmentHref(locale, row.trackingNumber)}
                  className="flex items-center justify-between gap-3 py-2.5 no-underline"
                >
                  <span className="font-mono text-xs font-semibold text-ink">
                    {row.trackingNumber}
                  </span>
                  <AccountStatusBadge stage={row.stage} label={row.statusLabel} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`${cabCard} overflow-hidden`}>
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <h2 className="m-0 text-sm font-semibold text-ink">{c.recentOrders}</h2>
          <Link
            href={cabinetHref(locale, "orders/")}
            className="text-xs font-medium text-primary no-underline hover:underline"
          >
            {c.allOrders}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-black/[0.06] text-xs text-[var(--dash-faint)]">
                <th className="px-4 py-2 font-medium sm:px-5">{c.colTrack}</th>
                <th className="px-4 py-2 font-medium">{c.colRoute}</th>
                <th className="px-4 py-2 font-medium">{c.colStatus}</th>
                <th className="px-4 py-2 font-medium sm:px-5">{c.colCreated}</th>
              </tr>
            </thead>
            <tbody>
              {stats.loaded && stats.recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-[var(--dash-muted)]"
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
                  <td className="px-4 py-2.5 sm:px-5">
                    <Link
                      href={cabinetShipmentHref(locale, row.trackingNumber)}
                      className="font-mono text-xs font-semibold text-ink no-underline hover:text-primary"
                    >
                      {row.trackingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--dash-muted-strong)]">
                    {[row.fromLabel, row.toLabel].filter(Boolean).join(" → ") || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <AccountStatusBadge stage={row.stage} label={row.statusLabel} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--dash-muted)] sm:px-5">
                    {row.createdAt ? dateFmt.format(new Date(row.createdAt)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
