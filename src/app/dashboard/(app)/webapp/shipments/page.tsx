import { requireAccess, canMutate } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  WebappShipmentsClient,
  type WebappShipmentRow,
} from "@/components/dashboard/WebappShipmentsClient";
import { updateShipmentAction } from "./actions";

export default async function WebappShipmentsPage() {
  const admin = await requireAccess("webapp");
  if (!admin) {
    return <DashDenied section="shipments" />;
  }
  const readOnly = !canMutate(admin.role, "webapp");

  let rows: WebappShipmentRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client
      .from("epos_webapp_shipments")
      .select(
        "id, contact_session_id, from_label, to_label, weight_kg, status, track_number, phone, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    rows = (data ?? []) as WebappShipmentRow[];
  }

  return (
    <WebappShipmentsClient
      rows={rows}
      readOnly={readOnly}
      updateAction={updateShipmentAction}
    />
  );
}
