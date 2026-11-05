"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import { formatAppDate, formatAppDateTime } from "@/lib/format/datetime";
import {
  accountAuthBody,
  type AccountAuthMode,
  type AccountShipmentRow,
  type AccountTimelineEvent,
} from "@/components/account/types";

type Detail = AccountShipmentRow & {
  timeline: AccountTimelineEvent[];
};

export function AccountShipmentDetail({
  locale,
  auth,
  trackingNumber,
  onClose,
  onRelinkRequired,
}: {
  locale: Locale;
  auth: AccountAuthMode;
  trackingNumber: string;
  onClose?: () => void;
  onRelinkRequired?: () => void;
}) {
  const c = accountCopy(locale);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/account/shipments/${encodeURIComponent(trackingNumber)}/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accountAuthBody(auth, { locale })),
            cache: "no-store",
          },
        );
        if (res.status === 401) {
          onRelinkRequired?.();
          return;
        }
        if (res.status === 404) {
          if (!cancelled) setError(c.emptyPackages);
          return;
        }
        const json = (await res.json()) as {
          shipment?: Detail;
          error?: string;
        };
        if (!res.ok || !json.shipment) {
          if (!cancelled) setError(c.genericError);
          return;
        }
        if (!cancelled) setDetail(json.shipment);
      } catch {
        if (!cancelled) setError(c.genericError);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, c.emptyPackages, c.genericError, locale, onRelinkRequired, trackingNumber]);

  const trackHref = localePath(
    locale,
    `/tracking/?number=${encodeURIComponent(trackingNumber)}`,
  );

  const facts: Array<{ label: string; value: string }> = detail
    ? [
        { label: c.fromLabel, value: detail.fromLabel || "—" },
        { label: c.toLabel, value: detail.toLabel || "—" },
        ...(detail.createdAt
          ? [
              {
                label: c.createdAt,
                value: formatAppDateTime(detail.createdAt, locale),
              },
            ]
          : []),
        ...(detail.estimatedDeliveryAt
          ? [
              {
                label: c.eta,
                value: formatAppDate(detail.estimatedDeliveryAt, locale),
              },
            ]
          : []),
        ...(detail.deliveredAt
          ? [
              {
                label: c.deliveredAt,
                value: formatAppDateTime(detail.deliveredAt, locale),
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
            {c.trackLabel}
          </p>
          <p className="mt-0.5 mb-0 break-all font-mono text-lg font-semibold text-ink">
            {trackingNumber}
          </p>
          {detail ? (
            <AccountStatusBadge
              stage={detail.stage}
              label={detail.statusLabel}
              className="mt-2"
            />
          ) : null}
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        ) : null}
      </div>

      {busy ? (
        <div className="space-y-2" aria-busy>
          <div className="h-16 animate-pulse rounded-xl bg-black/[0.04]" />
          <div className="h-24 animate-pulse rounded-xl bg-black/[0.04]" />
        </div>
      ) : null}
      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      {detail ? (
        <>
          <dl className="m-0 grid gap-x-6 gap-y-3 rounded-2xl bg-black/[0.025] p-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="text-xs text-black/45">{f.label}</dt>
                <dd className="m-0 mt-0.5 text-sm font-medium text-ink">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="m-0 mb-2 font-display text-base font-semibold text-ink">
              {c.timelineTitle}
            </h3>
            {detail.timeline.length === 0 ? (
              <p className="m-0 text-sm text-black/45">{c.noTimeline}</p>
            ) : (
              <ol className="m-0 list-none space-y-3 border-l border-black/10 p-0 pl-4">
                {detail.timeline.map((ev, i) => (
                  <li key={`${ev.label}-${ev.occurredAt ?? i}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="m-0 text-sm font-semibold text-ink">{ev.label}</p>
                    <p className="m-0 text-xs text-black/45">
                      {[
                        ev.occurredAt
                          ? formatAppDateTime(ev.occurredAt, locale)
                          : null,
                        ev.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {ev.note ? (
                      <p className="m-0 text-xs text-black/50">{ev.note}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <Link
            href={trackHref}
            className="inline-flex text-sm font-semibold text-primary underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {c.openPublicTrack}
          </Link>
        </>
      ) : null}
    </div>
  );
}
