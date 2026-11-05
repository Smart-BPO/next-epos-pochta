"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { loc } from "@/i18n/loc";
import { formatUzs } from "@/lib/pricing/estimate";
import { etaHoursLabel } from "@/data/delivery-routes";

export type RoutePriceQuote = {
  amount: number;
  currency: string;
  etaHours: number;
  weightKg: number;
  fetchedAt: string;
};

export function RoutePriceCard({
  locale,
  fromId,
  toId,
  initial,
  disclaimer,
}: {
  locale: Locale;
  fromId: string;
  toId: string;
  initial: RoutePriceQuote | null;
  disclaimer: string;
}) {
  const [quote, setQuote] = useState(initial);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ from: fromId, to: toId });
    fetch(`/api/route-quote/?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { ok?: boolean; quote?: RoutePriceQuote } | null) => {
        if (!cancelled && json?.ok && json.quote) setQuote(json.quote);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromId, toId]);

  if (!quote && !loading) return null;

  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/55">
        {loc(
          locale,
          "Kalkulyator boʻyicha narx (1 kg)",
          "Цена по калькулятору (1 кг)",
          "计算器价格（1 公斤）",
        )}
      </p>
      {quote ? (
        <>
          <p className="m-0 mt-1 font-display text-2xl font-semibold text-black">
            {formatUzs(quote.amount, locale)} {quote.currency}
          </p>
          <p className="m-0 mt-1 text-sm text-black/55">
            {loc(locale, "Muddat", "Срок", "时效")}:{" "}
            {etaHoursLabel(locale, quote.etaHours)}
          </p>
        </>
      ) : (
        <div className="mt-2 space-y-2" aria-busy>
          <div className="h-7 w-40 animate-pulse rounded-lg bg-black/[0.06]" />
          <div className="h-4 w-28 animate-pulse rounded bg-black/[0.05]" />
        </div>
      )}
      <p className="m-0 mt-3 text-xs leading-relaxed text-black/55">
        {disclaimer}
      </p>
    </div>
  );
}
