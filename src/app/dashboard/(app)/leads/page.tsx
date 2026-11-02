import { requireAccess, canMutate } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { LeadsListClient } from "@/components/dashboard/LeadsListClient";
import {
  leadToInboxRow,
  mergeInboxRows,
  shipmentToInboxRow,
  type ContactNameRow,
  type InboxRow,
  type LeadDbRow,
  type ShipmentDbRow,
} from "@/lib/cms/inbox";
import { updateLeadStatusAction } from "./actions";

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAccess("leads");
  if (!admin) {
    return <DashDenied section="leads" />;
  }
  const readOnly = !canMutate(admin.role, "leads");
  const sp = (await searchParams) ?? {};
  const statusFilter = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  let rows: InboxRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    let leadsQuery = client
      .from("epos_leads")
      .select("id, type, locale, status, source, payload, created_at, sort_order")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (statusFilter) leadsQuery = leadsQuery.eq("status", statusFilter);

    const [leadsRes, shipsRes] = await Promise.all([
      leadsQuery,
      client
        .from("epos_webapp_shipments")
        .select(
          "id, locale, status, phone, from_label, to_label, contact_session_id, created_at, weight_kg",
        )
        .eq("status", "pending_manager")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const leadRows = ((leadsRes.data ?? []) as LeadDbRow[]).map(leadToInboxRow);
    const shipRows = (shipsRes.data ?? []) as ShipmentDbRow[];

    const sessionIds = [
      ...new Set(
        shipRows
          .map((s) => s.contact_session_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    let contactsBySession = new Map<string, ContactNameRow>();
    if (sessionIds.length > 0) {
      const { data: contacts } = await client
        .from("epos_webapp_contacts")
        .select("session_id, first_name, last_name, phone")
        .in("session_id", sessionIds);
      contactsBySession = new Map(
        ((contacts ?? []) as ContactNameRow[]).map((c) => [c.session_id, c]),
      );
    }

    const shipmentInbox = shipRows.map((s) =>
      shipmentToInboxRow(
        s,
        s.contact_session_id
          ? contactsBySession.get(s.contact_session_id)
          : null,
      ),
    );

    rows = mergeInboxRows(leadRows, shipmentInbox);
  }

  return (
    <LeadsListClient
      rows={rows}
      readOnly={readOnly}
      updateStatusAction={updateLeadStatusAction}
    />
  );
}
