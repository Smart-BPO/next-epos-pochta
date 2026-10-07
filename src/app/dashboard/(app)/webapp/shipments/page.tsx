import { Suspense } from "react";
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

    const tracks = Array.from(
      new Set(rows.map((r) => r.track_number?.trim()).filter(Boolean) as string[]),
    );
    if (tracks.length) {
      const { data: packages } = await client
        .from("epos_fcargo_packages")
        .select("tracking_number, status, last_event_at")
        .in("tracking_number", tracks);
      const byTrack = new Map(
        (packages ?? []).map((p) => [p.tracking_number as string, p]),
      );
      rows = rows.map((r) => {
        const pkg = r.track_number ? byTrack.get(r.track_number.trim()) : null;
        return pkg
          ? {
              ...r,
              fcargo_status: pkg.status ?? null,
              fcargo_updated_at: pkg.last_event_at ?? null,
            }
          : r;
      });
    }
  }

  return (
    <Suspense fallback={null}>
      <WebappShipmentsClient
        rows={rows}
        readOnly={readOnly}
        updateAction={updateShipmentAction}
      />
    </Suspense>
  );
}
