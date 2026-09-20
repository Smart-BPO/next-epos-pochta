import "server-only";

import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { ingestFcargoWebhook } from "@/lib/fcargo/ingest";
import { logFcargoRequest } from "@/lib/fcargo/log";

export type FcargoInboxRow = {
  id: string;
  event_id: string;
  delivery_id: string | null;
  event_type: string | null;
  payload: unknown;
  status: string;
  attempts: number;
  last_error: string | null;
  received_at: string;
  processed_at: string | null;
  available_at: string;
  locked_at: string | null;
};

const MAX_ATTEMPTS = 8;

function backoffSeconds(attempts: number): number {
  // 15s, 30s, 1m, 2m, 5m, 15m, 1h, 6h (cap)
  const table = [15, 30, 60, 120, 300, 900, 3600, 21600];
  return table[Math.min(Math.max(attempts, 1), table.length) - 1]!;
}

export function resolveFcargoEventId(opts: {
  headerEventId?: string | null;
  deliveryId?: string | null;
  payload: unknown;
  rawBody: string;
}): string {
  const fromHeader = (opts.headerEventId ?? "").trim();
  if (fromHeader) return fromHeader;

  if (opts.payload && typeof opts.payload === "object") {
    const id = (opts.payload as Record<string, unknown>).id;
    if (typeof id === "string" && id.trim()) return id.trim();
  }

  const del = (opts.deliveryId ?? "").trim();
  if (del) return `del:${del}`;

  const hash = createHash("sha256")
    .update(opts.rawBody || "{}")
    .digest("hex")
    .slice(0, 32);
  return `hash:${hash}`;
}

export type EnqueueResult = {
  id: string;
  eventId: string;
  inserted: boolean;
};

/** Insert pending job; duplicate event_id → inserted=false (idempotent). */
export async function enqueueFcargoWebhook(input: {
  eventId: string;
  deliveryId?: string | null;
  eventType?: string | null;
  payload: unknown;
}): Promise<EnqueueResult | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const eventId = input.eventId.trim();
  if (!eventId) return null;

  const client = createSupabaseAdminClient();
  const row = {
    event_id: eventId,
    delivery_id: input.deliveryId?.trim() || null,
    event_type: input.eventType?.trim() || null,
    payload: input.payload ?? {},
    status: "pending",
    available_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("epos_fcargo_webhook_inbox")
    .insert(row)
    .select("id, event_id")
    .maybeSingle();

  if (!error && data) {
    return {
      id: data.id as string,
      eventId: data.event_id as string,
      inserted: true,
    };
  }

  // Unique violation → already queued/processed
  if (error?.code === "23505") {
    const { data: existing } = await client
      .from("epos_fcargo_webhook_inbox")
      .select("id, event_id")
      .eq("event_id", eventId)
      .maybeSingle();
    if (existing) {
      return {
        id: existing.id as string,
        eventId: existing.event_id as string,
        inserted: false,
      };
    }
    return { id: "", eventId, inserted: false };
  }

  console.warn("[fcargo:inbox:enqueue]", error?.message ?? "enqueue_failed");
  return null;
}

async function markDone(id: string): Promise<void> {
  const client = createSupabaseAdminClient();
  await client
    .from("epos_fcargo_webhook_inbox")
    .update({
      status: "done",
      processed_at: new Date().toISOString(),
      locked_at: null,
      last_error: null,
    })
    .eq("id", id);
}

async function markRetryOrFail(
  row: FcargoInboxRow,
  errMsg: string,
): Promise<void> {
  const client = createSupabaseAdminClient();
  const attempts = row.attempts;
  if (attempts >= MAX_ATTEMPTS) {
    await client
      .from("epos_fcargo_webhook_inbox")
      .update({
        status: "failed",
        last_error: errMsg.slice(0, 500),
        processed_at: new Date().toISOString(),
        locked_at: null,
      })
      .eq("id", row.id);
    return;
  }

  const delay = backoffSeconds(attempts);
  await client
    .from("epos_fcargo_webhook_inbox")
    .update({
      status: "pending",
      last_error: errMsg.slice(0, 500),
      available_at: new Date(Date.now() + delay * 1000).toISOString(),
      locked_at: null,
    })
    .eq("id", row.id);
}

export type ProcessInboxResult = {
  claimed: number;
  done: number;
  failed: number;
  retried: number;
};

/** Claim + ingest a batch. Safe to call from after() or drain cron. */
export async function processFcargoWebhookInbox(
  opts: { limit?: number } = {},
): Promise<ProcessInboxResult> {
  const result: ProcessInboxResult = {
    claimed: 0,
    done: 0,
    failed: 0,
    retried: 0,
  };
  if (!hasSupabaseAdminConfig()) return result;

  const limit = Math.max(1, Math.min(opts.limit ?? 5, 20));
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("epos_fcargo_webhook_inbox_claim", {
    p_limit: limit,
  });

  if (error) {
    console.warn("[fcargo:inbox:claim]", error.message);
    return result;
  }

  const rows = (data ?? []) as FcargoInboxRow[];
  result.claimed = rows.length;

  for (const row of rows) {
    const started = Date.now();
    const requestSummary = summarizeInboxPayload(row);
    try {
      const ingest = await ingestFcargoWebhook(row.payload);
      await markDone(row.id);
      result.done += 1;
      logFcargoRequest({
        direction: "in",
        source: "inbox_worker",
        correlationId: row.event_id,
        method: "WORKER",
        path: "/fcargo/inbox",
        durationMs: Date.now() - started,
        ok: true,
        leadId: ingest.leadId ?? null,
        trackingNumber:
          ingest.package?.tracking_number ??
          (typeof requestSummary.tracking === "string"
            ? requestSummary.tracking
            : null),
        requestBody: requestSummary,
        responseBody: {
          leadApplied: ingest.leadApplied,
          packageId: ingest.package?.id ?? null,
          fcargoStatus: ingest.fcargoStatus ?? null,
          crmStatus: ingest.crmStatus ?? null,
          eventType: ingest.eventType ?? row.event_type,
          message: ingest.message ?? null,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ingest_failed";
      console.warn("[fcargo:inbox:process]", row.event_id, msg);
      const before = row.attempts;
      await markRetryOrFail(row, msg);
      const terminal = before >= MAX_ATTEMPTS;
      if (terminal) result.failed += 1;
      else result.retried += 1;
      logFcargoRequest({
        direction: "in",
        source: "inbox_worker",
        correlationId: row.event_id,
        method: "WORKER",
        path: "/fcargo/inbox",
        durationMs: Date.now() - started,
        ok: false,
        requestBody: requestSummary,
        responseBody: {
          terminal,
          attempts: before,
          eventType: row.event_type,
        },
        errorCode: terminal ? "INGEST_FAILED" : "INGEST_RETRY",
        errorMessage: msg,
      });
    }
  }

  return result;
}

function summarizeInboxPayload(row: FcargoInboxRow): Record<string, unknown> {
  const payload =
    row.payload && typeof row.payload === "object"
      ? (row.payload as Record<string, unknown>)
      : {};
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : payload;
  const pkg =
    data.package && typeof data.package === "object"
      ? (data.package as Record<string, unknown>)
      : null;
  const tracking =
    (typeof pkg?.tracking_number === "string" && pkg.tracking_number) ||
    (typeof data.tracking_number === "string" && data.tracking_number) ||
    null;
  const status =
    (typeof data.status === "string" && data.status) ||
    (typeof pkg?.status === "string" && pkg.status) ||
    null;
  return {
    event_id: row.event_id,
    event_type: row.event_type,
    type:
      (typeof payload.type === "string" && payload.type) ||
      (typeof payload.event === "string" && payload.event) ||
      row.event_type,
    tracking,
    status,
  };
}

export async function countFcargoWebhookInboxPending(): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const client = createSupabaseAdminClient();
  const { count } = await client
    .from("epos_fcargo_webhook_inbox")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "processing"]);
  return count ?? 0;
}
