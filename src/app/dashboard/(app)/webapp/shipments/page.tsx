import { Suspense } from "react";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  WebappShipmentsClient,
  type WebappShipmentRow,
} from "@/components/dashboard/WebappShipmentsClient";
import {
  attachFcargoTrackAction,
  refreshFcargoShipmentAction,
} from "./actions";

export default async function WebappShipmentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAccess("webapp");
  if (!admin) {
    return <DashDenied section="shipments" />;
  }
  const readOnly = !canMutate(admin.role, "webapp");
  const sp = (await searchParams) ?? {};
  const statusFilter = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const contactFilter = Array.isArray(sp.contact) ? sp.contact[0] : sp.contact;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  let rows: WebappShipmentRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    let req = client
      .from("epos_webapp_shipments")
      .select(
        "id, contact_session_id, from_label, to_label, weight_kg, status, track_number, phone, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (statusFilter) req = req.eq("status", statusFilter);
    if (contactFilter) req = req.eq("contact_session_id", contactFilter);
    if (q) {
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 4) req = req.ilike("phone", `%${digits}%`);
      else if (/^PKG/i.test(q)) req = req.ilike("track_number", `%${q}%`);
    }
    const { data } = await req;
    rows = (data ?? []) as WebappShipmentRow[];

    const tracks = Array.from(
      new Set(rows.map((r) => r.track_number?.trim()).filter(Boolean) as string[]),
    );
    if (tracks.length) {
      const chunks: string[][] = [];
      for (let i = 0; i < tracks.length; i += 100) {
        chunks.push(tracks.slice(i, i + 100));
      }
      const results = await Promise.all(
        chunks.map((chunk) =>
          client
            .from("epos_fcargo_packages")
            .select("tracking_number, status, last_event_at")
            .in("tracking_number", chunk),
        ),
      );
      const byTrack = new Map(
        results
          .flatMap((r) => r.data ?? [])
          .map((p) => [p.tracking_number as string, p]),
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
        attachAction={attachFcargoTrackAction}
        refreshAction={refreshFcargoShipmentAction}
      />
    </Suspense>
  );
}
