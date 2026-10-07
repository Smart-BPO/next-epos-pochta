"use client";

import { useEffect, useState } from "react";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { useWebAppNav } from "@/components/webapp/WebAppNav";
import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { cn } from "@/lib/cn";
import { fcargoStatusCopy } from "@/lib/tracking/fcargo-status";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

type ShipmentRow = {
  id: string;
  from_label: string;
  to_label: string;
  status: string;
  track_number: string | null;
  fcargo_status?: string | null;
  weight_kg: number | null;
  created_at: string;
};

type Filter = "all" | "active" | "done";

/** `null` on any failure — the caller shows the generic error. */
async function fetchShipmentList(initData: string): Promise<ShipmentRow[] | null> {
  try {
    const res = await fetch("/api/webapp/shipments/list/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
    const json = (await res.json()) as { items?: ShipmentRow[] };
    return res.ok ? (json.items ?? []) : null;
  } catch {
    return null;
  }
}

function statusLabel(copy: ReturnType<typeof getWebAppCopy>, status: string) {
  if (status === "confirmed") return copy.statusConfirmed;
  if (status === "cancelled") return copy.statusCancelled;
  if (status === "draft") return copy.statusDraft;
  return copy.statusPending;
}

export function TrackTab() {
  const { locale, initData } = useTelegram();
  const { highlightShipmentId, setHighlightShipmentId, setTab } = useWebAppNav();
  const copy = getWebAppCopy(locale);
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchShipmentList(initData).then((items) => {
        if (cancelled) return;
        if (items) {
          setRows(items);
          setError("");
        } else {
          setError(copy.submitError);
        }
        setLoading(false);
      });
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initData, copy.submitError]);

  useEffect(() => {
    if (!highlightShipmentId) return;
    const t = window.setTimeout(() => setHighlightShipmentId(null), 8000);
    return () => window.clearTimeout(t);
  }, [highlightShipmentId, setHighlightShipmentId]);

  const filtered = rows.filter((row) => {
    const stage = row.fcargo_status
      ? fcargoStatusCopy(row.fcargo_status, locale).stage
      : null;
    if (filter === "active") {
      if (stage) {
        return !["delivered", "cancelled", "returned"].includes(stage);
      }
      return row.status === "pending_manager" || row.status === "draft";
    }
    if (filter === "done") {
      if (stage) return stage === "delivered";
      return row.status === "confirmed";
    }
    return true;
  });

  const site = getCanonicalSiteUrl().replace(/\/$/, "");

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.trackTitle}
        </h1>
        <p className="m-0 mt-1 text-sm text-black/55">{copy.trackLead}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", copy.trackAll],
            ["active", copy.trackActive],
            ["done", copy.trackDone],
          ] as const
        ).map(([id, label]) => (
          <Chip
            key={id}
            type="button"
            active={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <p className="m-0 text-sm text-black/40">{copy.loading}</p>
      ) : null}
      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 bg-white p-5 text-center">
          <p className="m-0 text-sm text-black/50">{copy.trackEmpty}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setTab("calc")}
          >
            {copy.tabCalc}
          </Button>
        </div>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {filtered.map((row) => {
          const hot = row.id === highlightShipmentId;
          return (
            <li
              key={row.id}
              className={cn(
                "rounded-2xl border bg-white p-3.5 shadow-[0_4px_16px_rgb(15_18_24/0.04)]",
                hot ? "border-primary/40 ring-2 ring-primary/15" : "border-black/10",
              )}
            >
              {hot ? (
                <p className="m-0 mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                  {copy.trackHighlight}
                </p>
              ) : null}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="m-0 font-medium text-ink">
                    {row.from_label} → {row.to_label}
                  </p>
                  <p className="m-0 mt-0.5 font-mono text-[0.7rem] text-black/40">
                    {row.id}
                    {row.weight_kg != null ? ` · ${row.weight_kg} kg` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-black/[0.05] px-2 py-0.5 text-[0.65rem] font-semibold text-black/55">
                  {statusLabel(copy, row.status)}
                </span>
              </div>
              <p className="m-0 mt-2 text-xs text-black/45">
                {row.track_number
                  ? `Trek: ${row.track_number}`
                  : copy.trackWaiting}
              </p>
              {row.fcargo_status ? (
                <p className="m-0 mt-1 text-xs font-medium text-ink">
                  {fcargoStatusCopy(row.fcargo_status, locale).label}
                </p>
              ) : null}
              {row.track_number ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                  onClick={() => {
                    const path = locale === "ru" ? "/ru/tracking/" : "/tracking/";
                    const url = `${site}${path}?number=${encodeURIComponent(row.track_number!)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  {copy.trackOpenSite}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
