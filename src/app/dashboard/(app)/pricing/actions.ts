"use server";

import { revalidatePath } from "next/cache";
import { requireMutation } from "@/lib/cms/auth";
import {
  DEFAULT_PRICING_CONFIG,
  ESTIMATE_FORMULA_VERSION,
  normalizePricingConfig,
  type PricingConfig,
  type PricingRouteOverride,
} from "@/lib/pricing/types";
import {
  createPricingRevision,
  publishDraftPricing,
  restoreRevisionToDraft,
  savePricingSettings,
} from "@/lib/pricing/settings";
import {
  deletePricingRoute,
  parseRoutesCsv,
  replacePricingRoutes,
  upsertPricingRoute,
} from "@/lib/pricing/routes";
import { invalidatePricingCache } from "@/lib/pricing/settings";

function revalidatePricing() {
  revalidatePath("/dashboard/pricing");
  revalidatePath("/dashboard/pricing/book");
  revalidatePath("/calculator");
  revalidatePath("/ru/calculator");
  revalidatePath("/delivery");
  revalidatePath("/api/estimate");
  revalidatePath("/api/estimate/config");
  invalidatePricingCache();
}

export async function savePricingAction(payload: {
  enabled: boolean;
  config: PricingConfig;
  target?: "live" | "draft";
}) {
  const admin = await requireMutation("settings");
  const config = normalizePricingConfig(payload.config);
  const result = await savePricingSettings({
    enabled: Boolean(payload.enabled),
    config,
    formulaVersion: ESTIMATE_FORMULA_VERSION,
    updatedBy: admin.id,
    target: payload.target ?? "live",
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
}

export async function resetPricingAction() {
  const admin = await requireMutation("settings");
  const result = await savePricingSettings({
    enabled: true,
    config: structuredClone(DEFAULT_PRICING_CONFIG),
    formulaVersion: ESTIMATE_FORMULA_VERSION,
    updatedBy: admin.id,
    target: "live",
  });
  if (!result.ok) throw new Error(result.error);
  await replacePricingRoutes([]);
  revalidatePricing();
}

export async function upsertRouteAction(route: PricingRouteOverride) {
  await requireMutation("settings");
  const result = await upsertPricingRoute(route);
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
  return result.route;
}

export async function deleteRouteAction(id: number) {
  await requireMutation("settings");
  const result = await deletePricingRoute(id);
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
}

export async function importRoutesCsvAction(csv: string) {
  const admin = await requireMutation("settings");
  await createPricingRevision({
    kind: "auto",
    label: "before CSV import",
    createdBy: admin.id,
  });
  const routes = parseRoutesCsv(csv);
  const result = await replacePricingRoutes(routes);
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
  return result.count;
}

export async function publishDraftAction() {
  const admin = await requireMutation("settings");
  const result = await publishDraftPricing({ updatedBy: admin.id });
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
}

export async function restoreRevisionAction(revisionId: number) {
  await requireMutation("settings");
  const result = await restoreRevisionToDraft(revisionId);
  if (!result.ok) throw new Error(result.error);
  revalidatePricing();
}

export async function saveManualRevisionAction(label: string) {
  const admin = await requireMutation("settings");
  const result = await createPricingRevision({
    kind: "manual",
    label: label.trim() || "manual snapshot",
    createdBy: admin.id,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/pricing");
}
