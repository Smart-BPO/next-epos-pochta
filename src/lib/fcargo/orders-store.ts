import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { upsertFcargoPackage } from "@/lib/fcargo/packages-store";

/** Compatibility shape — backed by epos_fcargo_packages after migration. */
export type FcargoOrderRow = {
  id: string;
  lead_id: string;
  fcargo_order_id: string;
  tracking_number: string | null;
  fcargo_status: string | null;
  fcargo_status_raw: Record<string, unknown>;
  last_synced_at: string | null;
};

function rowFromPackage(p: {
  id: string;
  lead_id: string | null;
  fcargo_order_id: string | null;
  tracking_number: string | null;
  status: string | null;
  status_raw: Record<string, unknown>;
  last_event_at: string | null;
}): FcargoOrderRow | null {
  if (!p.fcargo_order_id || !p.lead_id) return null;
  return {
    id: p.id,
    lead_id: p.lead_id,
    fcargo_order_id: p.fcargo_order_id,
    tracking_number: p.tracking_number,
    fcargo_status: p.status,
    fcargo_status_raw: p.status_raw ?? {},
    last_synced_at: p.last_event_at,
  };
}

export async function upsertFcargoOrderLink(params: {
  leadId: string;
  fcargoOrderId: string | number;
  trackingNumber?: string | null;
  fcargoStatus?: string | null;
  statusRaw?: unknown;
}): Promise<void> {
  await upsertFcargoPackage({
    leadId: params.leadId,
    fcargoOrderId: String(params.fcargoOrderId),
    trackingNumber: params.trackingNumber,
    status: params.fcargoStatus,
    statusRaw: params.statusRaw,
    externalOrderId: params.leadId,
    eventType: "orders_store.upsert",
    source: "lead",
  });
}

export async function findFcargoOrder(params: {
  orderId?: string | null;
  leadId?: string | null;
  tracking?: string | null;
}): Promise<FcargoOrderRow | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();
  const select =
    "id, lead_id, fcargo_order_id, tracking_number, status, status_raw, last_event_at";

  if (params.orderId) {
    const { data } = await client
      .from("epos_fcargo_packages")
      .select(select)
      .eq("fcargo_order_id", String(params.orderId))
      .not("lead_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (data) return rowFromPackage(data as Parameters<typeof rowFromPackage>[0]);
  }

  if (params.leadId) {
    const { data } = await client
      .from("epos_fcargo_packages")
      .select(select)
      .eq("lead_id", params.leadId)
      .order("last_event_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return rowFromPackage(data as Parameters<typeof rowFromPackage>[0]);
  }

  if (params.tracking) {
    const { data } = await client
      .from("epos_fcargo_packages")
      .select(select)
      .eq("tracking_number", params.tracking)
      .not("lead_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (data) return rowFromPackage(data as Parameters<typeof rowFromPackage>[0]);
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
  "disposed",
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
    .from("epos_fcargo_packages")
    .select(
      "id, lead_id, fcargo_order_id, tracking_number, status, status_raw, last_event_at",
    )
    .not("lead_id", "is", null)
    .not("fcargo_order_id", "is", null)
    .order("last_event_at", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 100)));

  return ((data ?? []) as Parameters<typeof rowFromPackage>[0][])
    .map(rowFromPackage)
    .filter((r): r is FcargoOrderRow => Boolean(r))
    .filter((r) => !isTerminalFcargoStatus(r.fcargo_status));
}
