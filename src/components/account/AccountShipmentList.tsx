"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import {
  accountAuthBody,
  type AccountAuthMode,
  type AccountShipmentRow,
} from "@/components/account/types";
import { cn } from "@/lib/cn";

type Filter = "all" | "active" | "done";

export function AccountShipmentList({
  locale,
  auth,
  highlightTracking,
  onOpen,
  onRelinkRequired,
}: {
  locale: Locale;
  auth: AccountAuthMode;
  highlightTracking?: string | null;
  onOpen: (row: AccountShipmentRow) => void;
  onRelinkRequired?: () => void;
}) {
  const c = accountCopy(locale);
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<AccountShipmentRow[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/account/shipments/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            accountAuthBody(auth, {
              locale,
              page: nextPage,
              filter,
            }),
          ),
          cache: "no-store",
        });
        if (res.status === 401) {
          onRelinkRequired?.();
          return;
        }
        const json = (await res.json()) as {
          shipments?: AccountShipmentRow[];
          page?: number;
          lastPage?: number;
          error?: string;
        };
        if (!res.ok) {
          setError(c.genericError);
          return;
        }
        const rows = json.shipments ?? [];
        setItems((prev) => (replace ? rows : [...prev, ...rows]));
        setPage(json.page ?? nextPage);
        setLastPage(json.lastPage ?? nextPage);
      } catch {
        setError(c.genericError);
      } finally {
        setBusy(false);
      }
    },
    [auth, c.genericError, filter, locale, onRelinkRequired],
  );

  useEffect(() => {
    void load(1, true);
  }, [load]);

  useEffect(() => {
    const onFocus = () => {
      void load(1, true);
    };
    window.addEventListener("visibilitychange", onFocus);
    return () => window.removeEventListener("visibilitychange", onFocus);
  }, [load]);

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: c.filterAll },
    { id: "active", label: c.filterActive },
    { id: "done", label: c.filterDone },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              filter === f.id
                ? "bg-primary text-white"
                : "bg-black/[0.04] text-black/60 hover:bg-black/[0.07]",
            )}
          >
            {f.label}
          </button>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="ml-auto"
          disabled={busy}
          onClick={() => void load(1, true)}
        >
          {c.refresh}
        </Button>
      </div>

      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      {!busy && items.length === 0 ? (
        <p className="m-0 text-sm text-black/45">{c.emptyPackages}</p>
      ) : null}

      <ul className="m-0 list-none space-y-2 p-0">
        {items.map((row) => {
          const hi =
            highlightTracking &&
            row.trackingNumber.toUpperCase() ===
              highlightTracking.toUpperCase();
          return (
            <li key={`${row.trackingNumber}-${row.packageId ?? ""}`}>
              <button
                type="button"
                onClick={() => onOpen(row)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                  hi
                    ? "border-primary bg-primary-soft"
                    : "border-black/8 bg-white hover:border-black/15",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 truncate font-mono text-sm font-semibold text-ink">
                      {row.trackingNumber}
                    </p>
                    <p className="mt-1 m-0 truncate text-xs text-black/45">
                      {[row.fromLabel, row.toLabel].filter(Boolean).join(" → ") ||
                        "—"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-black/65">
                    {row.statusLabel}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {page < lastPage ? (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => void load(page + 1, false)}
        >
          {c.loadMore}
        </Button>
      ) : null}
    </div>
  );
}
