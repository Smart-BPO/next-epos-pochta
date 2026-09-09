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
      .select("id, type, locale, status, payload, created_at, sort_order")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    rows = (data ?? []).map((row) => {
      const r = row as LeadListRow & { sort_order?: number | null };
      return {
        id: r.id,
        type: r.type,
        locale: r.locale,
        status: r.status,
        payload: r.payload,
        created_at: r.created_at,
        sort_order: typeof r.sort_order === "number" ? r.sort_order : 0,
      };
    });
  }

  return (
    <LeadsListClient
      rows={rows}
      readOnly={readOnly}
      updateStatusAction={updateLeadStatusAction}
    />
  );
}
