import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import type {
  FcargoLogDirection,
  FcargoLogEntry,
  FcargoLogRow,
  FcargoLogSource,
} from "@/lib/fcargo/log-types";

export type {
  FcargoLogDirection,
  FcargoLogEntry,
  FcargoLogRow,
  FcargoLogSource,
} from "@/lib/fcargo/log-types";

const SENSITIVE_HEADER =
  /^(authorization|x-api-key|x-fcargo-webhook-secret|cookie|set-cookie)$/i;

function maskSecretValue(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^Bearer\s+/i.test(v)) return "Bearer ••••";
  return "••••";
}

/** Redact secrets; keep structure readable for CMS debugging. */
export function sanitizeFcargoHeaders(
  headers: Record<string, string> | Headers | null | undefined,
): Record<string, string> | null {
  if (!headers) return null;
  const out: Record<string, string> = {};
  const entries =
    headers instanceof Headers
      ? Array.from(headers.entries())
      : Object.entries(headers);

  for (const [rawKey, rawVal] of entries) {
    const key = rawKey.trim();
    if (!key) continue;
    const value = String(rawVal ?? "");
    if (SENSITIVE_HEADER.test(key)) {
      out[key] = maskSecretValue(value);
      continue;
    }
    if (/^x-fcargo-signature$/i.test(key)) {
      // Keep t= and d=, fully mask hex signatures (no last-n leak)
      out[key] = value.replace(/(v\d+)=([0-9a-f]+)/gi, (_m, k: string) => {
        return `${k}=••••`;
      });
      continue;
    }
    out[key] = value.length > 500 ? `${value.slice(0, 500)}…` : value;
  }
  return Object.keys(out).length ? out : null;
}

function sanitizeBody(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value !== "object") return value;
  try {
    const cloned = JSON.parse(JSON.stringify(value)) as unknown;
    return redactDeep(cloned);
  } catch {
    return { note: "unserializable" };
  }
}

function redactDeep(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactDeep);
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (
      /api[_-]?key|secret|password|token|authorization|challenge/i.test(k) &&
      typeof v === "string"
    ) {
      out[k] = maskSecretValue(v);
    } else if (k === "code" && typeof v === "string" && /^\d{4,8}$/.test(v)) {
      out[k] = "••••••";
    } else {
      out[k] = redactDeep(v);
    }
  }
  return out;
}

/** Collect selected inbound headers from a Request for logging. */
export function pickRequestHeadersForLog(request: Request): Record<string, string> {
  const names = [
    "content-type",
    "user-agent",
    "x-fcargo-event",
    "x-fcargo-event-id",
    "x-fcargo-delivery-id",
    "x-fcargo-timestamp",
    "x-fcargo-signature",
    "x-fcargo-api-version",
    "x-fcargo-webhook-secret",
    "authorization",
  ];
  const out: Record<string, string> = {};
  for (const name of names) {
    const v = request.headers.get(name);
    if (v) out[name] = v;
  }
  return out;
}

/** Fire-and-forget insert; never throws to callers. */
export function logFcargoRequest(entry: FcargoLogEntry): void {
  if (!hasSupabaseAdminConfig()) return;
  void (async () => {
    try {
      const client = createSupabaseAdminClient();
      await client.from("epos_fcargo_request_log").insert({
        direction: entry.direction,
        source: entry.source,
        correlation_id: entry.correlationId ?? null,
        method: entry.method ?? "",
        path: entry.path ?? "",
        url: entry.url ?? null,
        http_status: entry.httpStatus ?? null,
        duration_ms: entry.durationMs ?? null,
        ok: entry.ok ?? null,
        lead_id: entry.leadId ?? null,
        order_id: entry.orderId != null ? String(entry.orderId) : null,
        tracking_number: entry.trackingNumber ?? null,
        request_headers: sanitizeFcargoHeaders(entry.requestHeaders) ?? null,
        response_headers: sanitizeFcargoHeaders(entry.responseHeaders) ?? null,
        request_body: sanitizeBody(entry.requestBody) ?? null,
        response_body: sanitizeBody(entry.responseBody) ?? null,
        error_code: entry.errorCode ?? null,
        error_message: entry.errorMessage ?? null,
      });
    } catch (e) {
      console.warn(
        "[fcargo:log]",
        e instanceof Error ? e.message : "log_failed",
      );
    }
  })();
}

export async function listFcargoRequestLog(
  opts: {
    limit?: number;
    direction?: FcargoLogDirection;
    source?: FcargoLogSource | FcargoLogSource[];
    includeBodies?: boolean;
  } = {},
): Promise<FcargoLogRow[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const limit = Math.max(1, Math.min(opts.limit ?? 40, 100));
  const client = createSupabaseAdminClient();

  const detailCols =
    "id, direction, source, correlation_id, method, path, url, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at, request_headers, response_headers, request_body, response_body";
  const basicCols =
    "id, direction, source, correlation_id, method, path, url, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at";

  let q = client
    .from("epos_fcargo_request_log")
    .select(opts.includeBodies ? detailCols : basicCols)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.direction) q = q.eq("direction", opts.direction);
  if (opts.source) {
    if (Array.isArray(opts.source)) {
      q = q.in("source", opts.source);
    } else {
      q = q.eq("source", opts.source);
    }
  }
  const { data } = await q;
  return (data ?? []) as unknown as FcargoLogRow[];
}

/** Delete oldest request-log rows past retention. Returns deleted count. */
export async function pruneFcargoRequestLog(
  olderThanDays = 30,
  limit = 5000,
): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const days = Math.max(1, Math.min(olderThanDays, 365));
  const max = Math.max(1, Math.min(limit, 10000));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const client = createSupabaseAdminClient();
    const { data: ids } = await client
      .from("epos_fcargo_request_log")
      .select("id")
      .lt("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(max);
    const list = (ids ?? []) as { id: string }[];
    if (!list.length) return 0;
    const { error } = await client
      .from("epos_fcargo_request_log")
      .delete()
      .in(
        "id",
        list.map((r) => r.id),
      );
    if (error) {
      console.warn("[fcargo:log] prune_failed", error.message);
      return 0;
    }
    return list.length;
  } catch (e) {
    console.warn(
      "[fcargo:log] prune_failed",
      e instanceof Error ? e.message : "prune_failed",
    );
    return 0;
  }
}
