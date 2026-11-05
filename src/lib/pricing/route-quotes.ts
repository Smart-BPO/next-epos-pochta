import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isFcargoBuildPhase } from "@/lib/fcargo/runtime";
import { runEstimate } from "@/lib/pricing/settings";
import type { EstimateInput } from "@/lib/pricing/estimate";
import { getSettlementById } from "@/data/settlements";
import { DELIVERY_CITIES } from "@/data/delivery-cities";
import { etaHoursForSettlements } from "@/data/delivery-routes";

export type RouteQuote = {
  amount: number;
  currency: string;
  etaHours: number;
  weightKg: number;
  fetchedAt: string;
};

const WEIGHT_KG = 1;
const FRESH_MS = 6 * 60 * 60 * 1000;
const MEMORY_MS = 10 * 60 * 1000;

const memory = new Map<string, { at: number; quote: RouteQuote }>();
const inflight = new Map<string, Promise<RouteQuote | null>>();

const HUB_SETTLEMENTS = new Set(
  DELIVERY_CITIES.map((c) => c.settlementId).filter((id): id is string =>
    Boolean(id),
  ),
);

export function isHubRoute(fromId: string, toId: string) {
  return (
    fromId !== toId && HUB_SETTLEMENTS.has(fromId) && HUB_SETTLEMENTS.has(toId)
  );
}

/** Same reference parcel the calculator quotes for 1 kg without extras. */
function referenceInput(fromId: string, toId: string): EstimateInput | null {
  const from = getSettlementById(fromId);
  const to = getSettlementById(toId);
  if (!from || !to) return null;
  return {
    fromRegionId: from.regionId,
    fromCityId: from.id,
    toRegionId: to.regionId,
    toCityId: to.id,
    weightKg: WEIGHT_KG,
    lengthCm: null,
    widthCm: null,
    heightCm: null,
    unknownDims: false,
    pickup: false,
    doorDelivery: false,
    places: 1,
    urgent: false,
    category: "parcel",
  };
}

type Row = {
  amount: number;
  currency: string;
  fetched_at: string;
};

function toQuote(fromId: string, toId: string, row: Row): RouteQuote {
  return {
    amount: row.amount,
    currency: row.currency,
    etaHours: etaHoursForSettlements(fromId, toId),
    weightKg: WEIGHT_KG,
    fetchedAt: row.fetched_at,
  };
}

async function readRow(fromId: string, toId: string): Promise<Row | null> {
  if (!hasSupabaseAdminConfig()) return null;
  try {
    const { data } = await createSupabaseAdminClient()
      .from("epos_route_quotes")
      .select("amount, currency, fetched_at")
      .eq("from_soato", fromId)
      .eq("to_soato", toId)
      .eq("weight_kg", WEIGHT_KG)
      .maybeSingle();
    return (data as Row | null) ?? null;
  } catch {
    return null;
  }
}

async function fetchAndStore(fromId: string, toId: string): Promise<Row | null> {
  const input = referenceInput(fromId, toId);
  if (!input) return null;
  const result = await runEstimate(input);
  if (!result.ok || result.estimate.rateSource !== "fcargo") return null;
  const row: Row = {
    amount: Math.round(result.estimate.amount),
    currency: result.estimate.currency,
    fetched_at: new Date().toISOString(),
  };
  if (hasSupabaseAdminConfig()) {
    try {
      await createSupabaseAdminClient()
        .from("epos_route_quotes")
        .upsert(
          {
            from_soato: fromId,
            to_soato: toId,
            weight_kg: WEIGHT_KG,
            amount: row.amount,
            currency: row.currency,
            rate_source: result.estimate.rateSource,
            fetched_at: row.fetched_at,
          },
          { onConflict: "from_soato,to_soato,weight_kg" },
        );
    } catch {
      // cache write is best-effort; the fresh quote is still returned
    }
  }
  return row;
}

/**
 * Calculator (FCargo) price for a hub corridor, cached in `epos_route_quotes`.
 * During `next build` only the stored row is used — never the local matrix.
 */
export async function getRouteQuote(
  fromId: string,
  toId: string,
  opts?: { forceRefresh?: boolean },
): Promise<RouteQuote | null> {
  if (!isHubRoute(fromId, toId)) return null;
  const key = `${fromId}:${toId}`;

  const hit = memory.get(key);
  if (!opts?.forceRefresh && hit && Date.now() - hit.at < MEMORY_MS) {
    return hit.quote;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const job = (async () => {
    const row = await readRow(fromId, toId);
    const fresh =
      row && Date.now() - new Date(row.fetched_at).getTime() < FRESH_MS;
    if (isFcargoBuildPhase() || (fresh && !opts?.forceRefresh)) {
      return row ? toQuote(fromId, toId, row) : null;
    }
    const next = (await fetchAndStore(fromId, toId).catch(() => null)) ?? row;
    return next ? toQuote(fromId, toId, next) : null;
  })();

  inflight.set(key, job);
  try {
    const quote = await job;
    if (quote) memory.set(key, { at: Date.now(), quote });
    return quote;
  } finally {
    inflight.delete(key);
  }
}

/** Refresh the stalest hub corridors (cron). */
export async function refreshStaleRouteQuotes(limit = 12): Promise<{
  refreshed: number;
  failed: number;
}> {
  const ids = [...HUB_SETTLEMENTS];
  const pairs: Array<[string, string]> = [];
  for (const a of ids) for (const b of ids) if (a !== b) pairs.push([a, b]);

  const stamps = new Map<string, number>();
  if (hasSupabaseAdminConfig()) {
    const { data } = await createSupabaseAdminClient()
      .from("epos_route_quotes")
      .select("from_soato, to_soato, fetched_at")
      .eq("weight_kg", WEIGHT_KG);
    for (const r of data ?? []) {
      stamps.set(
        `${r.from_soato}:${r.to_soato}`,
        new Date(r.fetched_at as string).getTime(),
      );
    }
  }

  const due = pairs
    .map(([a, b]) => ({ a, b, at: stamps.get(`${a}:${b}`) ?? 0 }))
    .filter((p) => Date.now() - p.at >= FRESH_MS)
    .sort((x, y) => x.at - y.at)
    .slice(0, limit);

  let refreshed = 0;
  let failed = 0;
  for (const { a, b } of due) {
    const quote = await getRouteQuote(a, b, { forceRefresh: true });
    if (quote && Date.now() - new Date(quote.fetchedAt).getTime() < 60_000) {
      refreshed += 1;
    } else {
      failed += 1;
    }
  }
  return { refreshed, failed };
}
