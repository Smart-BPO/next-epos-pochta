import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type FcargoLogDirection = "out" | "in";

export type FcargoLogEntry = {
  direction: FcargoLogDirection;
  method?: string;
  path?: string;
  httpStatus?: number | null;
  durationMs?: number | null;
  ok?: boolean | null;
  leadId?: string | null;
  orderId?: string | null;
  trackingNumber?: string | null;
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
  http_status: number | null;
  duration_ms: number | null;
  ok: boolean | null;
  lead_id: string | null;
  order_id: string | null;
  tracking_number: string | null;
  error_message: string | null;
  created_at: string;
  request_body?: unknown;
  response_body?: unknown;
};

function sanitizeBody(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value !== "object") return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { note: "unserializable" };
  }
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
        http_status: entry.httpStatus ?? null,
        duration_ms: entry.durationMs ?? null,
        ok: entry.ok ?? null,
        lead_id: entry.leadId ?? null,
        order_id: entry.orderId != null ? String(entry.orderId) : null,
        tracking_number: entry.trackingNumber ?? null,
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

  if (opts.includeBodies) {
    let q = client
      .from("epos_fcargo_request_log")
      .select(
        "id, direction, method, path, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at, request_body, response_body",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (opts.direction) q = q.eq("direction", opts.direction);
    const { data } = await q;
    return (data ?? []) as unknown as FcargoLogRow[];
  }

  let q = client
    .from("epos_fcargo_request_log")
    .select(
      "id, direction, method, path, http_status, duration_ms, ok, lead_id, order_id, tracking_number, error_message, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.direction) q = q.eq("direction", opts.direction);
  const { data } = await q;
  return (data ?? []) as unknown as FcargoLogRow[];
}
