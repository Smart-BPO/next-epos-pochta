import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isTerminalFcargoStatus } from "@/lib/fcargo/orders-store";

export type FcargoPackageRow = {
  id: string;
  fcargo_order_id: string | null;
  fcargo_package_id: string | null;
  tracking_number: string | null;
  barcode: string | null;
  status: string | null;
  status_raw: Record<string, unknown>;
  event_type: string | null;
  phones: string[];
  external_order_id: string | null;
  lead_id: string | null;
  contact_session_id: string | null;
  last_event_at: string | null;
  raw_last: Record<string, unknown>;
};

export function normalizeUzPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (phone.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

export async function findFcargoPackage(params: {
  tracking?: string | null;
  orderId?: string | null;
  packageId?: string | null;
}): Promise<FcargoPackageRow | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();

  if (params.tracking?.trim()) {
    const { data } = await client
      .from("epos_fcargo_packages")
      .select("*")
      .eq("tracking_number", params.tracking.trim())
      .maybeSingle();
    if (data) return data as FcargoPackageRow;
  }

  if (params.orderId?.trim()) {
    let q = client
      .from("epos_fcargo_packages")
      .select("*")
      .eq("fcargo_order_id", params.orderId.trim());
    if (params.packageId?.trim()) {
      q = q.eq("fcargo_package_id", params.packageId.trim());
    } else {
      q = q.is("fcargo_package_id", null);
    }
    const { data } = await q.maybeSingle();
    if (data) return data as FcargoPackageRow;

    // Fallback: any row for this order
    const { data: anyOrder } = await client
      .from("epos_fcargo_packages")
      .select("*")
      .eq("fcargo_order_id", params.orderId.trim())
      .limit(1)
      .maybeSingle();
    if (anyOrder) return anyOrder as FcargoPackageRow;
  }

  return null;
}

export async function upsertFcargoPackage(input: {
  fcargoOrderId?: string | null;
  fcargoPackageId?: string | null;
  trackingNumber?: string | null;
  barcode?: string | null;
  status?: string | null;
  statusRaw?: unknown;
  eventType?: string | null;
  phones?: string[];
  externalOrderId?: string | null;
  leadId?: string | null;
  contactSessionId?: string | null;
  rawLast?: unknown;
}): Promise<FcargoPackageRow | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();

  const existing = await findFcargoPackage({
    tracking: input.trackingNumber,
    orderId: input.fcargoOrderId,
    packageId: input.fcargoPackageId,
  });

  const phones = Array.from(
    new Set([
      ...(existing?.phones ?? []),
      ...(input.phones ?? []).filter(Boolean),
    ]),
  );

  const statusRaw =
    input.statusRaw && typeof input.statusRaw === "object"
      ? (input.statusRaw as Record<string, unknown>)
      : input.statusRaw != null
        ? { value: input.statusRaw }
        : (existing?.status_raw ?? {});

  const rawLast =
    input.rawLast && typeof input.rawLast === "object"
      ? (input.rawLast as Record<string, unknown>)
      : (existing?.raw_last ?? {});

  const row = {
    fcargo_order_id:
      input.fcargoOrderId?.trim() || existing?.fcargo_order_id || null,
    fcargo_package_id:
      input.fcargoPackageId?.trim() || existing?.fcargo_package_id || null,
    tracking_number:
      input.trackingNumber?.trim() || existing?.tracking_number || null,
    barcode: input.barcode?.trim() || existing?.barcode || null,
    status: input.status?.trim() || existing?.status || null,
    status_raw: statusRaw,
    event_type: input.eventType?.trim() || existing?.event_type || null,
    phones,
    external_order_id:
      input.externalOrderId?.trim() || existing?.external_order_id || null,
    lead_id: input.leadId?.trim() || existing?.lead_id || null,
    contact_session_id:
      input.contactSessionId?.trim() || existing?.contact_session_id || null,
    last_event_at: new Date().toISOString(),
    raw_last: rawLast,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await client
      .from("epos_fcargo_packages")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) {
      console.warn("[fcargo:packages:update]", error.message);
      return existing;
    }
    return data as FcargoPackageRow;
  }

  const { data, error } = await client
    .from("epos_fcargo_packages")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    console.warn("[fcargo:packages:insert]", error.message);
    return null;
  }
  return data as FcargoPackageRow;
}

export async function listPackagesByPhone(
  phone: string,
): Promise<FcargoPackageRow[]> {
  if (!hasSupabaseAdminConfig() || !phone) return [];
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_fcargo_packages")
    .select("*")
    .contains("phones", [phone])
    .order("last_event_at", { ascending: false })
    .limit(100);
  return (data ?? []) as FcargoPackageRow[];
}

export async function listOpenCatalogPackages(
  limit = 40,
): Promise<FcargoPackageRow[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_fcargo_packages")
    .select("*")
    .not("tracking_number", "is", null)
    .neq("tracking_number", "")
    .order("last_event_at", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 100)));
  const rows = (data ?? []) as FcargoPackageRow[];
  return rows.filter((r) => !isTerminalFcargoStatus(r.status));
}

export async function setPackageContactSession(
  packageId: string,
  contactSessionId: string,
): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const client = createSupabaseAdminClient();
  await client
    .from("epos_fcargo_packages")
    .update({
      contact_session_id: contactSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", packageId);
}
