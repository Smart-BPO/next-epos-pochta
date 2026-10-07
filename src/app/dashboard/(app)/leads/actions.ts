"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const LEAD_STATUSES = ["draft", "new", "in_progress", "done", "spam"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

function revalidateLeads(id?: string) {
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/dashboard/leads/${id}`);
}

function revalidateShipments() {
  revalidatePath("/dashboard/webapp/shipments");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireMutation("leads");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(LEAD_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  await client
    .from("epos_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidateLeads(id);
}

/**
 * Persist kanban drop for site leads only.
 * `orderedIds` is top→bottom (index 0 = highest sort_order).
 * Webapp shipment ids are ignored.
 */
export async function updateLeadBoardAction(input: {
  status: string;
  orderedIds: string[];
}) {
  await requireMutation("leads");

  const status = input.status;
  const orderedIds = input.orderedIds.filter(
    (id) => Boolean(id) && !id.startsWith("WS-"),
  );
  if (
    !(LEAD_STATUSES as readonly string[]).includes(status) ||
    orderedIds.length === 0
  ) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const base = Math.floor(Date.now() / 1000);

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      client
        .from("epos_leads")
        .update({
          status,
          sort_order: base - index,
          updated_at: now,
        })
        .eq("id", id),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  revalidateLeads(orderedIds[0]);
}

/** Pull the current FCargo status of a lead's order (lead, catalog, Mini App). */
export async function refreshFcargoLeadAction(formData: FormData) {
  await requireMutation("leads");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid");

  const [{ fcargoGetOrder, fcargoTrackPackage }, sync, { findFcargoOrder }, { normalizeUzPhone }] =
    await Promise.all([
      import("@/lib/fcargo/client"),
      import("@/lib/fcargo/sync-status"),
      import("@/lib/fcargo/orders-store"),
      import("@/lib/fcargo/packages-store"),
    ]);

  const client = createSupabaseAdminClient();
  const { data: lead } = await client
    .from("epos_leads")
    .select("id, payload")
    .eq("id", id)
    .maybeSingle();
  const data =
    (lead?.payload as { data?: Record<string, unknown> } | null)?.data ?? {};
  const link = await findFcargoOrder({ leadId: id });
  const orderId =
    link?.fcargo_order_id ??
    (data.fcargoOrderId != null ? String(data.fcargoOrderId) : null);
  const tracking =
    link?.tracking_number ??
    (typeof data.fcargoTrackingNumber === "string" ? data.fcargoTrackingNumber : null);
  if (!orderId && !tracking) {
    console.warn("[leads:fcargo-refresh]", id, "order_missing");
    return;
  }

  const phone = typeof data.phone === "string" ? normalizeUzPhone(data.phone) : "";
  const customerId =
    typeof data.fcargoCustomerId === "number" ? data.fcargoCustomerId : null;

  let raw: unknown = null;
  if (orderId && (phone || customerId != null)) {
    const res = await fcargoGetOrder(orderId, {
      customerId,
      customerPhone: phone || null,
    });
    if (res.ok) raw = res.data;
  }
  if (!raw && tracking) {
    const res = await fcargoTrackPackage(tracking);
    if (res.ok) raw = res.data;
  }
  if (!raw) {
    console.warn("[leads:fcargo-refresh]", id, "fcargo_unavailable");
    revalidateLeads(id);
    return;
  }

  const parsed = sync.parseFcargoWebhookPayload(raw);
  await sync.applyFcargoStatusUpdate({
    orderId: orderId ?? parsed.orderId,
    externalOrderId: id,
    tracking: parsed.tracking ?? tracking,
    status: parsed.status,
    raw,
  });

  revalidateLeads(id);
  revalidateShipments();
}
