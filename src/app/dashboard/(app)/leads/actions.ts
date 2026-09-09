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
 * Persist kanban drop: rewrite status + sort_order for the target column order.
 * `orderedIds` is top→bottom (index 0 = highest sort_order).
 */
export async function updateLeadBoardAction(input: {
  status: string;
  orderedIds: string[];
}) {
  await requireMutation("leads");

  const status = input.status;
  const orderedIds = input.orderedIds.filter(Boolean);
  if (
    !(LEAD_STATUSES as readonly string[]).includes(status) ||
    orderedIds.length === 0
  ) {
    throw new Error("Invalid");
  }

  const client = createSupabaseAdminClient();
  const now = new Date().toISOString();
  // Leave headroom between ranks; top of column gets the largest value.
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
