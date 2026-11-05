import type { PricingRouteOverride } from "@/lib/pricing/types";

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
