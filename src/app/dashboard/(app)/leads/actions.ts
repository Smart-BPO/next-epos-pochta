"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { dispatchNotification } from "@/lib/messaging/dispatch";

const LEAD_STATUSES = ["draft", "new", "in_progress", "done", "spam"] as const;
const SHIPMENT_INBOX_STATUSES = ["confirmed", "cancelled"] as const;

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

/** Confirm / cancel a pending Mini App shipment from the leads inbox. */
export async function updateInboxShipmentStatusAction(formData: FormData) {
  await requireMutation("webapp");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !id ||
    !(SHIPMENT_INBOX_STATUSES as readonly string[]).includes(status)
  ) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  const { data: before } = await client
    .from("epos_webapp_shipments")
    .select(
      "id, status, track_number, phone, from_label, to_label, contact_session_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!before || before.status !== "pending_manager") {
    throw new Error("Invalid");
  }

  await client
    .from("epos_webapp_shipments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (before.phone) {
    let locale: "uz" | "ru" = "uz";
    if (before.contact_session_id) {
      const { data: contact } = await client
        .from("epos_webapp_contacts")
        .select("locale")
        .eq("session_id", before.contact_session_id)
        .maybeSingle();
      if (contact?.locale === "ru") locale = "ru";
    }

    const route = `${before.from_label ?? ""} → ${before.to_label ?? ""}`;
    const statusLabel =
      locale === "ru"
        ? status === "confirmed"
          ? "Подтверждено"
          : "Отменено"
        : status === "confirmed"
          ? "Tasdiqlandi"
          : "Bekor qilindi";

    try {
      await dispatchNotification({
        event: "shipment_status",
        locale,
        data: {
          id,
          status,
          status_label: statusLabel,
          track: before.track_number || "—",
          phone: before.phone,
          route,
        },
        entityType: "shipment",
        entityId: id,
        idempotencyKey: `ship-inbox-${id}-${status}`,
      });
    } catch (err) {
      console.error("[inbox:shipment:notify]", err);
    }
  }

  revalidateShipments();
}
