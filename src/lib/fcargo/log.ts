import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type FcargoLogDirection = "out" | "in";

export type FcargoLogEntry = {
  direction: FcargoLogDirection;
  method?: string;
  path?: string;
  url?: string | null;
  httpStatus?: number | null;
  durationMs?: number | null;
  ok?: boolean | null;
  leadId?: string | null;
  orderId?: string | null;
  trackingNumber?: string | null;
  requestHeaders?: Record<string, string> | null;
  responseHeaders?: Record<string, string> | null;
  requestBody?: unknown;
  responseBody?: unknown;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type FcargoLogRow = {
  id: string;
  direction: string;
  method: string;
  path: string;
  url?: string | null;
  http_status: number | null;
  duration_ms: number | null;
  ok: boolean | null;
  lead_id: string | null;
  order_id: string | null;
  tracking_number: string | null;
  error_message: string | null;
  created_at: string;
  request_headers?: Record<string, string> | null;
  response_headers?: Record<string, string> | null;
  request_body?: unknown;
  response_body?: unknown;
};

const SENSITIVE_HEADER =
  /^(authorization|x-api-key|x-fcargo-webhook-secret|cookie|set-cookie)$/i;

function maskSecretValue(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^Bearer\s+/i.test(v)) {
    const token = v.replace(/^Bearer\s+/i, "").trim();
    if (token.length <= 4) return "Bearer ••••";
    return `Bearer ••••${token.slice(-4)}`;
  }
  if (v.length <= 4) return "••••";
  return `••••${v.slice(-4)}`;
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
      // Keep t= and d=, mask hex signatures
      out[key] = value.replace(/(v\d+)=([0-9a-f]+)/gi, (_, k, hex: string) => {
        const h = String(hex);
        return `${k}=••••${h.slice(-6)}`;
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
    if (/api[_-]?key|secret|password|token|authorization/i.test(k) && typeof v === "string") {
      out[k] = maskSecretValue(v);
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
    includeBodies?: boolean;
  } = {},
): Promise<FcargoLogRow[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const limit = Math.max(1, Math.min(opts.limit ?? 40, 100));
  const client = createSupabaseAdminClient();

  const detailCols =
    "id, direction, method, path, url, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at, request_headers, response_headers, request_body, response_body";
  const basicCols =
    "id, direction, method, path, url, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at";

  let q = client
    .from("epos_fcargo_request_log")
    .select(opts.includeBodies ? detailCols : basicCols)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.direction) q = q.eq("direction", opts.direction);
  const { data } = await q;
  return (data ?? []) as unknown as FcargoLogRow[];
}
