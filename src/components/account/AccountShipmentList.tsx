"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, PackageOpen, RefreshCw, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import {
  accountAuthBody,
  type AccountAuthMode,
  type AccountShipmentRow,
} from "@/components/account/types";
import { cn } from "@/lib/cn";
import { formatAppDate } from "@/lib/format/datetime";

type Filter = "all" | "active" | "done";



export function AccountShipmentList({
  locale,
  auth,
  highlightTracking,
  onOpen,
  onRelinkRequired,
  onTotal,
  onCreate,
}: {
  locale: Locale;
  auth: AccountAuthMode;
  highlightTracking?: string | null;
  onOpen: (row: AccountShipmentRow) => void;
  onRelinkRequired?: () => void;
  /** Reported for the unfiltered list only. */
  onTotal?: (total: number) => void;
  /** Shows a CTA in the empty state. */
  onCreate?: () => void;
}) {
  const c = accountCopy(locale);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AccountShipmentRow[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
          total?: number;
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
        if (filter === "all" && typeof json.total === "number") {
          onTotal?.(json.total);
        }
      } catch {
        setError(c.genericError);
      } finally {
        setBusy(false);
        setLoaded(true);
      }
    },
    [auth, c.genericError, filter, locale, onRelinkRequired, onTotal],
  );

  useEffect(() => {
    void Promise.resolve().then(() => load(1, true));
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void load(1, true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) =>
      [row.trackingNumber, row.fromLabel, row.toLabel, row.statusLabel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: c.filterAll },
    { id: "active", label: c.filterActive },
    { id: "done", label: c.filterDone },
  ];

  const showSkeleton = busy && items.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/35"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-black/35 focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-xl bg-black/[0.04] p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  filter === f.id
                    ? "bg-white text-ink shadow-sm"
                    : "text-black/55 hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={c.refresh}
            title={c.refresh}
            disabled={busy}
            onClick={() => void load(1, true)}
            className="inline-flex size-9 items-center justify-center rounded-xl text-black/50 transition hover:bg-black/[0.05] hover:text-ink disabled:opacity-50"
          >
            <RefreshCw className={cn("size-4", busy && "animate-spin")} />
          </button>
        </div>
      </div>

      {error ? (
        <p
          className="m-0 rounded-xl bg-primary-soft px-3 py-2 text-sm text-primary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {showSkeleton ? (
        <ul className="m-0 list-none space-y-2.5 p-0" aria-busy>
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-[88px] animate-pulse rounded-2xl border border-black/[0.06] bg-black/[0.03]"
            />
          ))}
        </ul>
      ) : null}

      {loaded && !busy && items.length === 0 && !error ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/12 bg-white px-6 py-10 text-center">
          <PackageOpen className="size-10 text-black/25" aria-hidden />
          <p className="mt-3 mb-0 font-display text-base font-semibold text-ink">
            {c.emptyPackages}
          </p>
          <p className="mt-1 mb-0 max-w-xs text-sm text-black/50">
            {c.emptyLead}
          </p>
          {onCreate ? (
            <Button type="button" className="mt-4" onClick={onCreate}>
              {c.submitShipment}
            </Button>
          ) : null}
        </div>
      ) : null}

      {items.length > 0 && visible.length === 0 ? (
        <p className="m-0 py-6 text-center text-sm text-black/45">
          {c.noMatches}
        </p>
      ) : null}

      <ul className="m-0 list-none space-y-2.5 p-0">
        {visible.map((row) => {
          const hi =
            highlightTracking &&
            row.trackingNumber.toUpperCase() ===
              highlightTracking.toUpperCase();
          const date = formatAppDate(row.createdAt, locale);
          const route = [row.fromLabel, row.toLabel].filter(Boolean);
          return (
            <li key={`${row.trackingNumber}-${row.packageId ?? ""}`}>
              <button
                type="button"
                onClick={() => onOpen(row)}
                className={cn(
                  "group w-full rounded-2xl border bg-white p-4 text-left transition sm:px-5",
                  hi
                    ? "border-primary/50 ring-2 ring-primary/15"
                    : "border-black/[0.08] hover:border-black/20 hover:shadow-[0_4px_18px_rgba(0,0,0,0.05)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="m-0 font-mono text-[13px] font-semibold tracking-wide text-ink">
                    {row.trackingNumber}
                  </p>
                  <AccountStatusBadge
                    stage={row.stage}
                    label={row.statusLabel}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-black/70">
                  {route.length === 2 ? (
                    <>
                      <span className="min-w-0 truncate">{route[0]}</span>
                      <ArrowRight
                        className="size-3.5 shrink-0 text-black/30"
                        aria-hidden
                      />
                      <span className="min-w-0 truncate">{route[1]}</span>
                    </>
                  ) : (
                    <span className="truncate">{route[0] ?? "—"}</span>
                  )}
                </div>
                {date ? (
                  <p className="mt-1.5 mb-0 text-xs text-black/40">
                    {c.createdAt}: {date}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {page < lastPage ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void load(page + 1, false)}
          >
            {c.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
