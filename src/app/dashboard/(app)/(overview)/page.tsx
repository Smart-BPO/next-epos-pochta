import { requireAdmin } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  OverviewDashboardClient,
  type OverviewLeadRow,
  type OverviewShipmentRow,
} from "@/components/dashboard/OverviewDashboardClient";

async function fetchOverview() {
  if (!hasSupabaseAdminConfig()) {
    return {
      leads: [] as OverviewLeadRow[],
      shipments: [] as OverviewShipmentRow[],
      contacts: 0,
    };
  }
  const admin = createSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [leadsRes, shipRes, contactsRes] = await Promise.all([
    admin
      .from("epos_leads")
      .select("id, type, locale, status, payload, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("epos_webapp_shipments")
      .select("id, status, from_label, to_label, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("epos_webapp_contacts")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    leads: (leadsRes.data ?? []) as OverviewLeadRow[],
    shipments: (shipRes.data ?? []) as OverviewShipmentRow[],
    contacts: contactsRes.count ?? 0,
  };
}

export default async function DashboardOverviewPage() {
  const admin = await requireAdmin();
  const name = admin.displayName || admin.email.split("@")[0] || "Owner";
  const { leads, shipments, contacts } = await fetchOverview();

  return (
    <OverviewDashboardClient
      name={name}
      leads={leads}
      shipments={shipments}
      contacts={contacts}
    />
  );
}
