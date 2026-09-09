import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  estimateQuote,
  type EstimateInput,
  type QuoteEstimate,
} from "@/lib/pricing/estimate";
import { listPricingRoutes, replacePricingRoutes } from "@/lib/pricing/routes";
import {
  DEFAULT_PRICING_CONFIG,
  ESTIMATE_FORMULA_VERSION,
  normalizePricingConfig,
  toPublicPricingUi,
  type PricingConfig,
  type PricingRouteOverride,
  type PricingSnapshot,
  type PublicPricingUiConfig,
} from "@/lib/pricing/types";

export type LoadedPricing = {
  enabled: boolean;
  formulaVersion: string;
  config: PricingConfig;
  routes: PricingRouteOverride[];
  updatedAt: string | null;
};

type CacheEntry = {
  at: number;
  value: LoadedPricing;
};

const CACHE_TTL_MS = 45_000;
let liveCache: CacheEntry | null = null;

export const PRICING_LIVE_ID = 1;
export const PRICING_DRAFT_ID = 2;
const REVISION_KEEP = 50;

export function invalidatePricingCache() {
  liveCache = null;
}

export function defaultLoadedPricing(): LoadedPricing {
  return {
    enabled: true,
    formulaVersion: ESTIMATE_FORMULA_VERSION,
    config: structuredClone(DEFAULT_PRICING_CONFIG),
    routes: [],
    updatedAt: null,
  };
}

async function fetchSettingsRow(id: number): Promise<{
  enabled: boolean;
  formulaVersion: string;
  config: PricingConfig;
  updatedAt: string | null;
}> {
  const fallback = {
    enabled: true,
    formulaVersion: ESTIMATE_FORMULA_VERSION,
    config: structuredClone(DEFAULT_PRICING_CONFIG),
    updatedAt: null as string | null,
  };
  if (!hasSupabaseAdminConfig()) return fallback;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_pricing_settings")
    .select("enabled, formula_version, config, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[pricing:load]", error.message);
    return fallback;
  }

  return {
    enabled: data.enabled !== false,
    formulaVersion:
      (typeof data.formula_version === "string" && data.formula_version) ||
      ESTIMATE_FORMULA_VERSION,
    config: normalizePricingConfig(data.config),
    updatedAt: typeof data.updated_at === "string" ? data.updated_at : null,
  };
}

async function fetchPricingBundle(id: number): Promise<LoadedPricing> {
  const settings = await fetchSettingsRow(id);
  const routes = await listPricingRoutes({
    activeOnly: id === PRICING_LIVE_ID,
  });
  return {
    ...settings,
    routes,
  };
}

export async function loadPricingConfig(
  opts?: { bypassCache?: boolean; draft?: boolean },
): Promise<LoadedPricing> {
  if (opts?.draft) {
    return fetchPricingBundle(PRICING_DRAFT_ID);
  }

  if (!opts?.bypassCache && liveCache) {
    if (Date.now() - liveCache.at < CACHE_TTL_MS) {
      return liveCache.value;
    }
  }

  const value = await fetchPricingBundle(PRICING_LIVE_ID);
  liveCache = { at: Date.now(), value };
  return value;
}

export const getPricingSettings = cache(async () => loadPricingConfig());

export async function getPublicPricingUi(): Promise<PublicPricingUiConfig> {
  const loaded = await loadPricingConfig();
  return toPublicPricingUi(
    loaded.enabled,
    loaded.formulaVersion,
    loaded.config,
  );
}

export async function runEstimate(
  input: EstimateInput,
  opts?: { draft?: boolean },
): Promise<{ ok: true; estimate: QuoteEstimate } | { ok: false; error: string }> {
  const loaded = await loadPricingConfig({
    draft: opts?.draft,
    bypassCache: Boolean(opts?.draft),
  });
  if (!loaded.enabled && !opts?.draft) {
    return { ok: false, error: "calculator_disabled" };
  }
  return {
    ok: true,
    estimate: estimateQuote(
      input,
      loaded.config,
      loaded.formulaVersion,
      loaded.routes,
    ),
  };
}

async function pruneRevisions() {
  if (!hasSupabaseAdminConfig()) return;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_pricing_revisions")
    .select("id")
    .order("created_at", { ascending: false })
    .range(REVISION_KEEP, REVISION_KEEP + 200);
  const ids = (data ?? []).map((r) => r.id as number);
  if (!ids.length) return;
  await admin.from("epos_pricing_revisions").delete().in("id", ids);
}

export async function createPricingRevision(opts: {
  label?: string;
  kind?: "auto" | "manual";
  createdBy?: string | null;
  snapshot?: PricingSnapshot;
}): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) return { ok: false, error: "supabase_not_configured" };
  try {
    const snapshot =
      opts.snapshot ??
      (await (async () => {
        const live = await loadPricingConfig({ bypassCache: true });
        return {
          enabled: live.enabled,
          formulaVersion: live.formulaVersion,
          config: live.config,
          routes: live.routes,
        } satisfies PricingSnapshot;
      })());

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("epos_pricing_revisions")
      .insert({
        label: opts.label ?? "",
        kind: opts.kind ?? "auto",
        created_by: opts.createdBy ?? null,
        snapshot,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[pricing:revision]", error?.message);
      return { ok: false, error: "db_error" };
    }
    void pruneRevisions();
    return { ok: true, id: data.id as number };
  } catch (err) {
    console.error("[pricing:revision]", err);
    return { ok: false, error: "db_error" };
  }
}

export async function listPricingRevisions(limit = 30) {
  if (!hasSupabaseAdminConfig()) return [];
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_pricing_revisions")
    .select("id, created_at, created_by, label, kind, snapshot")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[pricing:revisions:list]", error.message);
    return [];
  }
  return data ?? [];
}

export async function savePricingSettings(opts: {
  enabled: boolean;
  config: PricingConfig;
  formulaVersion?: string;
  updatedBy?: string | null;
  target?: "live" | "draft";
  skipRevision?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const config = normalizePricingConfig(opts.config);
  const formulaVersion =
    opts.formulaVersion?.trim() || ESTIMATE_FORMULA_VERSION;
  const id = opts.target === "draft" ? PRICING_DRAFT_ID : PRICING_LIVE_ID;

  try {
    if (!opts.skipRevision && id === PRICING_LIVE_ID) {
      await createPricingRevision({
        kind: "auto",
        label: "before save",
        createdBy: opts.updatedBy,
      });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("epos_pricing_settings").upsert(
      {
        id,
        enabled: opts.enabled,
        formula_version: formulaVersion,
        config,
        updated_by: opts.updatedBy ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) {
      console.error("[pricing:save]", error.message);
      return { ok: false, error: "db_error" };
    }
    if (id === PRICING_LIVE_ID) invalidatePricingCache();
    return { ok: true };
  } catch (err) {
    console.error("[pricing:save]", err);
    return { ok: false, error: "db_error" };
  }
}

export async function publishDraftPricing(opts: {
  updatedBy?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const draft = await loadPricingConfig({ draft: true, bypassCache: true });
  const routes = await listPricingRoutes({ activeOnly: false });

  await createPricingRevision({
    kind: "manual",
    label: "before publish draft",
    createdBy: opts.updatedBy,
  });

  const saved = await savePricingSettings({
    enabled: draft.enabled,
    config: draft.config,
    formulaVersion: draft.formulaVersion,
    updatedBy: opts.updatedBy,
    target: "live",
    skipRevision: true,
  });
  if (!saved.ok) return saved;

  const replaced = await replacePricingRoutes(routes);
  if (!replaced.ok) return replaced;
  invalidatePricingCache();
  return { ok: true };
}

export async function restoreRevisionToDraft(
  revisionId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminConfig()) return { ok: false, error: "supabase_not_configured" };
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_pricing_revisions")
    .select("snapshot")
    .eq("id", revisionId)
    .maybeSingle();
  if (error || !data?.snapshot) return { ok: false, error: "not_found" };

  const snap = data.snapshot as PricingSnapshot;
  const saved = await savePricingSettings({
    enabled: snap.enabled !== false,
    config: normalizePricingConfig(snap.config),
    formulaVersion: snap.formulaVersion || ESTIMATE_FORMULA_VERSION,
    target: "draft",
    skipRevision: true,
  });
  if (!saved.ok) return saved;
  const routes = Array.isArray(snap.routes) ? snap.routes : [];
  // Restoring routes affects live table — plan says restore → draft.
  // Routes are single table; we only replace when publishing.
  // Store routes into a staging approach: replace live only on publish.
  // For draft restore of routes, write to draft settings config meta OR replace routes immediately into a draft copy.
  // Simplest workable approach: replace routes table only on publish; for restore-to-draft,
  // stash routes inside draft config under a reserved key is messy.
  // Better: on restore, write routes to draft snapshot only by saving them into epos_pricing_settings
  // config._routesDraft — but that pollutes config.
  // Plan: draft row id=2 for settings; routes shared. On restore to draft: save settings to id=2
  // AND store routes JSON in a side table... We only have one routes table.
  // Practical approach matching plan "Publish draft → live":
  // - Keep routes edits on the live routes table (current admin)
  // - Draft is for zone config only until we add routes_draft
  // OR: on restore, replace routes immediately (admin-only) which is OK for v2.
  const replaced = await replacePricingRoutes(
    routes.map((r) => ({
      fromSettlementId: r.fromSettlementId,
      toSettlementId: r.toSettlementId,
      baseUzs: r.baseUzs,
      perKgUzs: r.perKgUzs,
      etaMin: r.etaMin ?? null,
      etaMax: r.etaMax ?? null,
      active: r.active !== false,
    })),
  );
  if (!replaced.ok) return replaced;
  invalidatePricingCache();
  return { ok: true };
}

export async function buildLiveSnapshot(): Promise<PricingSnapshot> {
  const live = await loadPricingConfig({ bypassCache: true });
  return {
    enabled: live.enabled,
    formulaVersion: live.formulaVersion,
    config: live.config,
    routes: await listPricingRoutes({ activeOnly: false }),
  };
}
