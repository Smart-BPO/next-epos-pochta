"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import {
  accountAuthBody,
  type AccountAuthMode,
  type AccountShipmentRow,
} from "@/components/account/types";

export type CabinetStageCounts = {
  created: number;
  accepted: number;
  in_transit: number;
  out_for_delivery: number;
  delivery_attempt: number;
  delivered: number;
  returned: number;
  cancelled: number;
  other: number;
};

export type CabinetStats = {
  items: AccountShipmentRow[];
  total: number;
  loaded: boolean;
  busy: boolean;
  error: string | null;
  reload: () => void;
  counts: CabinetStageCounts;
  inProgress: number;
  returns: number;
  attention: AccountShipmentRow[];
  recent: AccountShipmentRow[];
  daily: Array<{ key: string; label: string; count: number }>;
};

const EMPTY: CabinetStageCounts = {
  created: 0,
  accepted: 0,
  in_transit: 0,
  out_for_delivery: 0,
  delivery_attempt: 0,
  delivered: 0,
  returned: 0,
  cancelled: 0,
  other: 0,
};

function bump(counts: CabinetStageCounts, stage: string) {
  if (stage in counts) {
    counts[stage as keyof CabinetStageCounts] += 1;
  } else {
    counts.other += 1;
  }
}

export function useCabinetStats(
  locale: Locale,
  auth: AccountAuthMode,
  onRelinkRequired?: () => void,
): CabinetStats {
  const [items, setItems] = useState<AccountShipmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const collected: AccountShipmentRow[] = [];
      let page = 1;
      let lastPage = 1;
      let reportedTotal = 0;
      while (page <= lastPage && page <= 4) {
        const res = await fetch("/api/account/shipments/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            accountAuthBody(auth, { locale, page, filter: "all" }),
          ),
          cache: "no-store",
        });
        if (res.status === 401) {
          onRelinkRequired?.();
          return;
        }
        const json = (await res.json()) as {
          ok?: boolean;
          shipments?: AccountShipmentRow[];
          page?: number;
          lastPage?: number;
          total?: number;
          error?: string;
        };
        if (!json.ok || !json.shipments) {
          setError(json.error ?? "load_failed");
          return;
        }
        collected.push(...json.shipments);
        reportedTotal = json.total ?? collected.length;
        lastPage = json.lastPage ?? 1;
        page += 1;
      }
      setItems(collected);
      setTotal(reportedTotal);
      setLoaded(true);
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }, [auth, locale, onRelinkRequired]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load, tick]);

  const derived = useMemo(() => {
    const counts = { ...EMPTY };
    for (const row of items) bump(counts, row.stage);
    const inProgress =
      counts.created +
      counts.accepted +
      counts.in_transit +
      counts.out_for_delivery +
      counts.delivery_attempt;
    const returns = counts.returned + counts.cancelled;
    const attention = items.filter(
      (r) => r.stage === "delivery_attempt" || r.stage === "returned",
    );
    const recent = [...items]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 8);

    const dayMap = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    for (const row of items) {
      if (!row.createdAt) continue;
      const key = row.createdAt.slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    const daily = [...dayMap.entries()].map(([key, count]) => ({
      key,
      label: `${key.slice(8, 10)}.${key.slice(5, 7)}`,
      count,
    }));

    return { counts, inProgress, returns, attention, recent, daily };
  }, [items]);

  return {
    items,
    total,
    loaded,
    busy,
    error,
    reload: () => setTick((n) => n + 1),
    ...derived,
  };
}
