"use client";

import { useCallback, useEffect, useState } from "react";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { useWebAppNav } from "@/components/webapp/WebAppNav";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

type ShipmentRow = {
  id: string;
  from_label: string;
  to_label: string;
  status: string;
  track_number: string | null;
  weight_kg: number | null;
  created_at: string;
};

type Filter = "all" | "active" | "done";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/webapp/shipments/list/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        items?: ShipmentRow[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "list_failed");
      setRows(json.items ?? []);
    } catch {
      setError(copy.submitError);
    } finally {
      setLoading(false);
    }
  }, [initData, copy.submitError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!highlightShipmentId) return;
    const t = window.setTimeout(() => setHighlightShipmentId(null), 8000);
    return () => window.clearTimeout(t);
  }, [highlightShipmentId, setHighlightShipmentId]);

  const filtered = rows.filter((row) => {
    if (filter === "active") {
      return row.status === "pending_manager" || row.status === "draft";
    }
    if (filter === "done") return row.status === "confirmed";
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
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === id
                ? "border-primary/30 bg-primary-soft text-primary"
                : "border-black/10 bg-white text-black/50",
            )}
          >
            {label}
          </button>
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
              {row.track_number ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                  onClick={() => {
                    const url = `${site}/tracking/?number=${encodeURIComponent(row.track_number!)}`;
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
