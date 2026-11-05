import "server-only";

import { eposApiBaseFromClientBase } from "@/lib/fcargo/epos-client";
import {
  getFcargoSettingsView,
  resolveFcargoConfig,
} from "@/lib/fcargo/settings";
import { isFcargoBuildPhase } from "@/lib/fcargo/runtime";

export type FcargoTenantBranding = {
  logoUrl: string | null;
  faviconUrl: string | null;
  companyName: string | null;
  name: string | null;
  domain: string;
};

type CacheEntry = {
  at: number;
  value: FcargoTenantBranding | null;
};

const CACHE_TTL_MS = 60 * 60_000;
let cache: CacheEntry | null = null;
let inflight: Promise<FcargoTenantBranding | null> | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(
  obj: Record<string, unknown> | null,
  keys: string[],
): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

async function resolveTenantContext(): Promise<{
  tenantDomain: string;
  apiV1Base: string;
} | null> {
  const cfg = await resolveFcargoConfig();
  if (cfg?.tenantDomain) {
    return {
      tenantDomain: cfg.tenantDomain,
      apiV1Base: eposApiBaseFromClientBase(cfg.baseUrl),
    };
  }
  const view = await getFcargoSettingsView();
  const tenantDomain =
    view.tenantDomain.trim() ||
    (process.env.FCARGO_TENANT_DOMAIN ?? "").trim();
  if (!tenantDomain) return null;
  const base =
    view.baseUrl.trim() ||
    (process.env.FCARGO_BASE_URL ?? "").trim() ||
    "https://api.fcargo.uz/api/client/v1";
  return {
    tenantDomain,
    apiV1Base: eposApiBaseFromClientBase(base),
  };
}

async function fetchTenantBranding(): Promise<FcargoTenantBranding | null> {
  if (isFcargoBuildPhase()) return null;
  const ctx = await resolveTenantContext();
  if (!ctx) return null;

  try {
    const res = await fetch(`${ctx.apiV1Base}/auth/domain-info`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Tenant-Domain": ctx.tenantDomain,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    const root = asRecord(json);
    const data = asRecord(root?.data) ?? root;
    const tenant = asRecord(data?.tenant);
    const logoUrl = pickString(tenant, ["logo_url", "logoUrl"]);
    const faviconUrl = pickString(tenant, ["favicon_url", "faviconUrl"]);
    return {
      domain: pickString(data, ["domain"]) || ctx.tenantDomain,
      logoUrl,
      faviconUrl,
      companyName: pickString(tenant, ["company_name", "companyName"]),
      name: pickString(tenant, ["name"]),
    };
  } catch {
    return null;
  }
}

/** Cached tenant branding from Cargo CRM (`GET /api/v1/auth/domain-info`). */
export async function getFcargoTenantBranding(opts?: {
  force?: boolean;
}): Promise<FcargoTenantBranding | null> {
  const now = Date.now();
  if (
    !opts?.force &&
    cache &&
    now - cache.at < CACHE_TTL_MS
  ) {
    return cache.value;
  }
  if (!opts?.force && inflight) return inflight;

  inflight = fetchTenantBranding()
    .then((value) => {
      cache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
