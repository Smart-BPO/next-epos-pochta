import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type FcargoOrderRow = {
  id: string;
  lead_id: string;
  fcargo_order_id: string;
  tracking_number: string | null;
  fcargo_status: string | null;
  fcargo_status_raw: Record<string, unknown>;
  last_synced_at: string | null;
};

export async function upsertFcargoOrderLink(params: {
  leadId: string;
  fcargoOrderId: string | number;
  trackingNumber?: string | null;
  fcargoStatus?: string | null;
  statusRaw?: unknown;
}): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const client = createSupabaseAdminClient();
  const orderId = String(params.fcargoOrderId);
  const raw =
    params.statusRaw && typeof params.statusRaw === "object"
      ? (params.statusRaw as Record<string, unknown>)
      : params.statusRaw != null
        ? { value: params.statusRaw }
        : {};

  const { error } = await client.from("epos_fcargo_orders").upsert(
    {
      lead_id: params.leadId,
      fcargo_order_id: orderId,
      tracking_number: params.trackingNumber?.trim() || null,
      fcargo_status: params.fcargoStatus?.trim() || null,
      fcargo_status_raw: raw,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "lead_id" },
  );
  if (error) {
    console.warn("[fcargo:orders:upsert]", error.message);
  }
}

export async function findFcargoOrder(params: {
  orderId?: string | null;
  leadId?: string | null;
  tracking?: string | null;
}): Promise<FcargoOrderRow | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();

  if (params.orderId) {
    const { data } = await client
      .from("epos_fcargo_orders")
      .select(
        "id, lead_id, fcargo_order_id, tracking_number, fcargo_status, fcargo_status_raw, last_synced_at",
      )
      .eq("fcargo_order_id", String(params.orderId))
      .maybeSingle();
    if (data) return data as FcargoOrderRow;
  }

  if (params.leadId) {
    const { data } = await client
      .from("epos_fcargo_orders")
      .select(
        "id, lead_id, fcargo_order_id, tracking_number, fcargo_status, fcargo_status_raw, last_synced_at",
      )
      .eq("lead_id", params.leadId)
      .maybeSingle();
    if (data) return data as FcargoOrderRow;
  }

  if (params.tracking) {
    const { data } = await client
      .from("epos_fcargo_orders")
      .select(
        "id, lead_id, fcargo_order_id, tracking_number, fcargo_status, fcargo_status_raw, last_synced_at",
      )
      .eq("tracking_number", params.tracking)
      .maybeSingle();
    if (data) return data as FcargoOrderRow;
  }

  return null;
}

const TERMINAL = new Set([
  "delivered",
  "cancelled",
  "canceled",
  "returned",
  "returned_to_sender",
  "lost",
  "done",
  "completed",
  "доставлен",
  "yetkazildi",
  "отменен",
  "отменён",
  "возврат",
  "qaytarildi",
  "bekor qilindi",
]);

export function isTerminalFcargoStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return TERMINAL.has(status.trim().toLowerCase());
}

export async function listOpenFcargoOrders(limit = 40): Promise<FcargoOrderRow[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_fcargo_orders")
    .select(
      "id, lead_id, fcargo_order_id, tracking_number, fcargo_status, fcargo_status_raw, last_synced_at",
    )
    .order("last_synced_at", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 100)));

  const rows = (data ?? []) as FcargoOrderRow[];
  return rows.filter((r) => !isTerminalFcargoStatus(r.fcargo_status));
}
