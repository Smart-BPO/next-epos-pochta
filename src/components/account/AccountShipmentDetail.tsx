"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 font-mono text-lg font-semibold text-ink">
            {trackingNumber}
          </p>
          {detail ? (
            <p className="mt-1 m-0 text-sm text-black/55">{detail.statusLabel}</p>
          ) : null}
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        ) : null}
      </div>

      {busy ? <p className="m-0 text-sm text-black/45">{c.refresh}…</p> : null}
      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      {detail ? (
        <>
          <div className="space-y-1 text-sm text-black/65">
            <p className="m-0">
              {[detail.fromLabel, detail.toLabel].filter(Boolean).join(" → ") ||
                "—"}
            </p>
            {detail.createdAt ? (
              <p className="m-0">
                {c.createdAt}: {new Date(detail.createdAt).toLocaleString()}
              </p>
            ) : null}
            {detail.estimatedDeliveryAt ? (
              <p className="m-0">
                {c.eta}:{" "}
                {new Date(detail.estimatedDeliveryAt).toLocaleDateString()}
              </p>
            ) : null}
            {detail.deliveredAt ? (
              <p className="m-0">
                {c.deliveredAt}:{" "}
                {new Date(detail.deliveredAt).toLocaleString()}
              </p>
            ) : null}
          </div>

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
                          ? new Date(ev.occurredAt).toLocaleString()
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
