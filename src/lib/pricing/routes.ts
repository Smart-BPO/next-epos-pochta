import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import type { PricingRouteOverride } from "@/lib/pricing/types";

type RouteRow = {
  id: number;
  from_settlement_id: string;
  to_settlement_id: string;
  base_uzs: number;
  per_kg_uzs: number;
  eta_min: number | null;
  eta_max: number | null;
  active: boolean;
};

export function mapRouteRow(row: RouteRow): PricingRouteOverride {
  return {
    id: row.id,
    fromSettlementId: row.from_settlement_id,
    toSettlementId: row.to_settlement_id,
    baseUzs: row.base_uzs,
    perKgUzs: row.per_kg_uzs,
    etaMin: row.eta_min,
    etaMax: row.eta_max,
    active: row.active !== false,
  };
}

export async function listPricingRoutes(opts?: {
  activeOnly?: boolean;
}): Promise<PricingRouteOverride[]> {
  if (!hasSupabaseAdminConfig()) return [];
  try {
    const admin = createSupabaseAdminClient();
    let q = admin
      .from("epos_pricing_routes")
      .select(
        "id, from_settlement_id, to_settlement_id, base_uzs, per_kg_uzs, eta_min, eta_max, active",
      )
      .order("from_settlement_id")
      .order("to_settlement_id");
    if (opts?.activeOnly) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) {
      console.error("[pricing:routes:list]", error.message);
      return [];
    }
    return ((data ?? []) as RouteRow[]).map(mapRouteRow);
  } catch (err) {
    console.error("[pricing:routes:list]", err);
    return [];
  }
}

export async function upsertPricingRoute(
  route: Omit<PricingRouteOverride, "id"> & { id?: number },
): Promise<{ ok: true; route: PricingRouteOverride } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) return { ok: false, error: "supabase_not_configured" };
  try {
    const admin = createSupabaseAdminClient();
    const payload = {
      from_settlement_id: route.fromSettlementId.trim(),
      to_settlement_id: route.toSettlementId.trim(),
      base_uzs: Math.max(0, Math.round(route.baseUzs)),
      per_kg_uzs: Math.max(0, Math.round(route.perKgUzs)),
      eta_min: route.etaMin == null ? null : Math.max(1, Math.round(route.etaMin)),
      eta_max: route.etaMax == null ? null : Math.max(1, Math.round(route.etaMax)),
      active: route.active !== false,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await admin
      .from("epos_pricing_routes")
      .upsert(payload, { onConflict: "from_settlement_id,to_settlement_id" })
      .select(
        "id, from_settlement_id, to_settlement_id, base_uzs, per_kg_uzs, eta_min, eta_max, active",
      )
      .single();
    if (error || !data) {
      console.error("[pricing:routes:upsert]", error?.message);
      return { ok: false, error: "db_error" };
    }
    return { ok: true, route: mapRouteRow(data as RouteRow) };
  } catch (err) {
    console.error("[pricing:routes:upsert]", err);
    return { ok: false, error: "db_error" };
  }
}

export async function deletePricingRoute(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) return { ok: false, error: "supabase_not_configured" };
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("epos_pricing_routes").delete().eq("id", id);
    if (error) {
      console.error("[pricing:routes:delete]", error.message);
      return { ok: false, error: "db_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[pricing:routes:delete]", err);
    return { ok: false, error: "db_error" };
  }
}

export async function replacePricingRoutes(
  routes: PricingRouteOverride[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) return { ok: false, error: "supabase_not_configured" };
  try {
    const admin = createSupabaseAdminClient();
    const { error: delErr } = await admin
      .from("epos_pricing_routes")
      .delete()
      .neq("id", 0);
    if (delErr) {
      console.error("[pricing:routes:replace]", delErr.message);
      return { ok: false, error: "db_error" };
    }
    if (!routes.length) return { ok: true, count: 0 };
    const rows = routes.map((r) => ({
      from_settlement_id: r.fromSettlementId.trim(),
      to_settlement_id: r.toSettlementId.trim(),
      base_uzs: Math.max(0, Math.round(r.baseUzs)),
      per_kg_uzs: Math.max(0, Math.round(r.perKgUzs)),
      eta_min: r.etaMin == null ? null : Math.max(1, Math.round(r.etaMin)),
      eta_max: r.etaMax == null ? null : Math.max(1, Math.round(r.etaMax)),
      active: r.active !== false,
    }));
    const { error } = await admin.from("epos_pricing_routes").insert(rows);
    if (error) {
      console.error("[pricing:routes:replace]", error.message);
      return { ok: false, error: "db_error" };
    }
    return { ok: true, count: rows.length };
  } catch (err) {
    console.error("[pricing:routes:replace]", err);
    return { ok: false, error: "db_error" };
  }
}

export function parseRoutesCsv(text: string): PricingRouteOverride[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const start = lines[0].toLowerCase().includes("from") ? 1 : 0;
  const out: PricingRouteOverride[] = [];
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map((c) => c.trim());
    if (cols.length < 4) continue;
    const [from, to, base, perKg, etaMin, etaMax] = cols;
    if (!from || !to) continue;
    out.push({
      fromSettlementId: from,
      toSettlementId: to,
      baseUzs: Number(base) || 0,
      perKgUzs: Number(perKg) || 0,
      etaMin: etaMin ? Number(etaMin) || null : null,
      etaMax: etaMax ? Number(etaMax) || null : null,
      active: true,
    });
  }
  return out;
}

export function routesToCsv(routes: PricingRouteOverride[]): string {
  const header = "from,to,base,perKg,etaMin,etaMax,active";
  const rows = routes.map((r) =>
    [
      r.fromSettlementId,
      r.toSettlementId,
      r.baseUzs,
      r.perKgUzs,
      r.etaMin ?? "",
      r.etaMax ?? "",
      r.active ? "1" : "0",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}
