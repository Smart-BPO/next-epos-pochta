import "server-only";

import { fcargoTrackPackage, hasFcargoConfig } from "@/lib/fcargo/client";
import { fcargoStatusCopy } from "./fcargo-status";
import type {
  TrackingEvent,
  TrackingLookupResult,
  TrackingShipment,
} from "./types";
import { isValidTrackingNumber, normalizeTrackingNumber } from "./types";

type Rec = Record<string, unknown>;

const FOUND_TTL_MS = 60 * 1000;
const MISS_TTL_MS = 30 * 1000;
const CACHE_MAX = 1000;
const cache = new Map<
  string,
  { at: number; ttl: number; result: TrackingLookupResult }
>();

function rec(v: unknown): Rec | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function isoOrUndefined(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
}

function statusOf(v: unknown): { code?: string; name?: string } {
  if (typeof v === "string") return { code: v };
  const o = rec(v);
  return o ? { code: str(o.code), name: str(o.name) } : {};
}

/** Timeline items are not in the OpenAPI schema — accept common shapes. */
function mapEvent(item: unknown, locale: "uz" | "ru"): TrackingEvent | null {
  const o = rec(item);
  if (!o) return null;
  const st = statusOf(o.status ?? o.status_code ?? o.code);
  const name = st.name ?? str(o.status_name) ?? str(o.title);
  const { label, stage } = fcargoStatusCopy(st.code, locale, name);
  const branch = rec(o.branch);
  return {
    code: stage,
    label,
    occurredAt: isoOrUndefined(
      o.occurred_at ?? o.created_at ?? o.happened_at ?? o.date ?? o.timestamp,
    ),
    location:
      str(o.location) ??
      str(o.branch_name) ??
      str(branch?.name) ??
      str(o.branch) ??
      str(o.current_branch),
    note: str(o.comment) ?? str(o.note) ?? str(o.description),
  };
}

function toShipment(
  number: string,
  data: Rec,
  locale: "uz" | "ru",
): TrackingShipment {
  const st = statusOf(data.status);
  const current = fcargoStatusCopy(st.code, locale, st.name);
  const currentLocation = str(data.current_branch);
  const deliveredAt = isoOrUndefined(data.delivered_at);

  const events = (Array.isArray(data.timeline) ? data.timeline : [])
    .map((item) => mapEvent(item, locale))
    .filter((e): e is TrackingEvent => Boolean(e))
    .sort((a, b) => (a.occurredAt ?? "").localeCompare(b.occurredAt ?? ""));

  const last = events[events.length - 1];
  if (!last || last.label !== current.label) {
    events.push({
      code: current.stage,
      label: current.label,
      occurredAt: deliveredAt,
      location: currentLocation,
    });
  }

  return {
    number: str(data.tracking_number) ?? number,
    status: current.stage,
    statusLabel: current.label,
    currentLocation,
    estimatedDeliveryAt: isoOrUndefined(data.estimated_delivery_at),
    deliveredAt,
    events,
    updatedAt: new Date().toISOString(),
  };
}

/** Public lookup by tracking code — FCargo track returns no personal data. */
export async function lookupShipment(
  rawNumber: string,
  locale: "uz" | "ru",
): Promise<TrackingLookupResult> {
  const number = normalizeTrackingNumber(rawNumber);
  if (!number || !isValidTrackingNumber(number)) {
    return { ok: false, error: "invalid_format" };
  }
  if (!(await hasFcargoConfig())) return { ok: false, error: "unavailable" };

  const key = `${locale}:${number}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.result;

  const res = await fcargoTrackPackage(number);
  let result: TrackingLookupResult;
  if (res.ok && rec(res.data)) {
    result = { ok: true, shipment: toShipment(number, res.data as Rec, locale) };
  } else if (!res.ok && (res.status === 404 || res.status === 422)) {
    result = { ok: false, error: "not_found" };
  } else if (!res.ok && res.status === 429) {
    return { ok: false, error: "rate_limited" };
  } else {
    return { ok: false, error: "unavailable" };
  }

  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, {
    at: Date.now(),
    ttl: result.ok ? FOUND_TTL_MS : MISS_TTL_MS,
    result,
  });
  return result;
}
