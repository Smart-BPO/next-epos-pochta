"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const LEAD_STATUSES = ["draft", "new", "in_progress", "done", "spam"] as const;

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

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${id}`);
  revalidatePath("/dashboard");
}
