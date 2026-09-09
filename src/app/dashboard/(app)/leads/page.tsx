import { requireAccess, canMutate } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  LeadsListClient,
  type LeadListRow,
} from "@/components/dashboard/LeadsListClient";
import { updateLeadStatusAction } from "./actions";

export default async function DashboardLeadsPage() {
  const admin = await requireAccess("leads");
  if (!admin) {
    return <DashDenied section="leads" />;
  }
  const readOnly = !canMutate(admin.role, "leads");

  let rows: LeadListRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client
      .from("epos_leads")
      .select("id, type, locale, status, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    rows = (data ?? []) as LeadListRow[];
  }

  return (
    <LeadsListClient
      rows={rows}
      readOnly={readOnly}
      updateStatusAction={updateLeadStatusAction}
    />
  );
}
