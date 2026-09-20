import "server-only";

/**
 * FCargo Client API — credentials from CMS (`epos_fcargo_settings`),
 * encrypted with MESSAGING_SECRETS_KEY. Optional one-shot env import.
 * Never import from Client Components — use server actions / Route Handlers.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  decryptJson,
  encryptJson,
  hasMessagingSecretsKey,
  last4,
  maskSecret,
} from "@/lib/crypto/secrets";
import type { FcargoMode, FcargoSettingsView } from "@/lib/fcargo/types";

export type { FcargoMode, FcargoSettingsView };

const DEFAULT_BASE = "https://api.fcargo.uz/api/client/v1";
const CACHE_TTL_MS = 15_000;

export type FcargoRuntimeConfig = {
  apiKey: string;
  tenantDomain: string;
  baseUrl: string;
  mode: FcargoMode;
  source: "cms" | "env";
};

type Row = {
  enabled: boolean;
  tenant_domain: string;
  base_url: string;
  mode: string;
  secrets_cipher: string | null;
  secrets_meta: { last4?: string; updated_at?: string; fields?: string[] } | null;
  last_test_at: string | null;
  last_test_ok: boolean | null;
  last_error: string | null;
};

let cache: { at: number; value: FcargoRuntimeConfig | null } | null = null;

export function invalidateFcargoConfigCache() {
  cache = null;
}

export function defaultFcargoBaseUrl() {
  return DEFAULT_BASE;
}

function normalizeBaseUrl(raw: string): string {
  return (raw.trim() || DEFAULT_BASE).replace(/\/+$/, "");
}

function envFallback(): FcargoRuntimeConfig | null {
  const apiKey = (process.env.FCARGO_API_KEY ?? "").trim();
  const tenantDomain = (process.env.FCARGO_TENANT_DOMAIN ?? "").trim();
  if (!apiKey || !tenantDomain) return null;
  return {
    apiKey,
    tenantDomain,
    baseUrl: normalizeBaseUrl(process.env.FCARGO_BASE_URL ?? ""),
    mode: "live",
    source: "env",
  };
}

async function loadRow(): Promise<Row | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_fcargo_settings")
    .select(
      "enabled, tenant_domain, base_url, mode, secrets_cipher, secrets_meta, last_test_at, last_test_ok, last_error",
    )
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return null;
  return data as Row;
}

export async function getFcargoSettingsView(): Promise<FcargoSettingsView> {
  const masterKeyOk = hasMessagingSecretsKey();
  const empty: FcargoSettingsView = {
    enabled: false,
    tenantDomain: "epos-pochta.uz",
    baseUrl: DEFAULT_BASE,
    mode: "live",
    hasSecrets: false,
    secretsHint: maskSecret(""),
    hasWebhookSecret: false,
    webhookSecretHint: maskSecret(""),
    masterKeyOk,
    lastTestAt: null,
    lastTestOk: null,
    lastError: null,
    runtimeSource: envFallback() ? "env" : "none",
  };

  const row = await loadRow();
  if (!row) return empty;
  const meta = (row.secrets_meta ?? {}) as NonNullable<Row["secrets_meta"]> & {
    webhook_last4?: string;
  };
  const mode: FcargoMode = row.mode === "test" ? "test" : "live";
  const cmsReady =
    Boolean(row.enabled) &&
    Boolean(row.secrets_cipher) &&
    Boolean(row.tenant_domain?.trim()) &&
    masterKeyOk;

  let hasApiKey = Boolean(meta.last4);
  let hasWebhookSecret = Boolean(meta.webhook_last4);
  if (row.secrets_cipher && masterKeyOk && (!hasApiKey || !hasWebhookSecret)) {
    try {
      const secrets = decryptJson<Record<string, string>>(row.secrets_cipher);
      if (!hasApiKey) hasApiKey = Boolean((secrets.api_key ?? "").trim());
      if (!hasWebhookSecret) {
        hasWebhookSecret = Boolean((secrets.webhook_secret ?? "").trim());
      }
    } catch {
      // ignore
    }
  }

  return {
    enabled: Boolean(row.enabled),
    tenantDomain: row.tenant_domain || "epos-pochta.uz",
    baseUrl: normalizeBaseUrl(row.base_url || DEFAULT_BASE),
    mode,
    hasSecrets: hasApiKey,
    secretsHint: meta.last4 ? `••••${meta.last4}` : maskSecret(""),
    hasWebhookSecret,
    webhookSecretHint: meta.webhook_last4
      ? `••••${meta.webhook_last4}`
      : maskSecret(""),
    masterKeyOk,
    lastTestAt: row.last_test_at,
    lastTestOk: row.last_test_ok,
    lastError: row.last_error,
    runtimeSource: cmsReady ? "cms" : envFallback() ? "env" : "none",
  };
}

/**
 * Runtime credentials: CMS (enabled + key) preferred; env as legacy fallback.
 */
export async function resolveFcargoConfig(): Promise<FcargoRuntimeConfig | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }

  let value: FcargoRuntimeConfig | null = null;

  if (hasSupabaseAdminConfig()) {
    try {
      const client = createSupabaseAdminClient();
      const { data } = await client
        .from("epos_fcargo_settings")
        .select("enabled, tenant_domain, base_url, mode, secrets_cipher")
        .eq("id", "default")
        .maybeSingle();

      if (data?.enabled && data.secrets_cipher && hasMessagingSecretsKey()) {
        const secrets = decryptJson<Record<string, string>>(data.secrets_cipher);
        const apiKey = (secrets.api_key ?? "").trim();
        const tenantDomain = String(data.tenant_domain ?? "").trim();
        if (apiKey && tenantDomain) {
          value = {
            apiKey,
            tenantDomain,
            baseUrl: normalizeBaseUrl(String(data.base_url ?? "")),
            mode: data.mode === "test" ? "test" : "live",
            source: "cms",
          };
        }
      }
    } catch (e) {
      console.warn(
        "[fcargo:config]",
        e instanceof Error ? e.message : "resolve_failed",
      );
    }
  }

  if (!value) value = envFallback();

  cache = { at: Date.now(), value };
  return value;
}

export async function hasFcargoConfig(): Promise<boolean> {
  return Boolean(await resolveFcargoConfig());
}

export async function saveFcargoSettings(params: {
  enabled: boolean;
  tenantDomain: string;
  baseUrl: string;
  mode: FcargoMode;
  /** Leave blank to keep existing key */
  apiKey?: string | null;
  /** Leave blank to keep existing webhook secret */
  webhookSecret?: string | null;
}): Promise<void> {
  if (!hasMessagingSecretsKey()) {
    throw new Error("Master encryption key is not set");
  }

  const client = createSupabaseAdminClient();
  const { data: existing } = await client
    .from("epos_fcargo_settings")
    .select("secrets_cipher, secrets_meta")
    .eq("id", "default")
    .maybeSingle();

  let secrets_cipher = (existing?.secrets_cipher as string | null) ?? null;
  let secrets_meta =
    (existing?.secrets_meta as Record<string, unknown> | null) ?? {};

  const prev = secrets_cipher
    ? decryptJson<Record<string, string>>(secrets_cipher)
    : {};
  let merged = { ...prev };
  let changed = false;

  const incomingKey = (params.apiKey ?? "").trim();
  if (incomingKey) {
    merged = { ...merged, api_key: incomingKey };
    changed = true;
  }

  const incomingWebhook = (params.webhookSecret ?? "").trim();
  if (incomingWebhook) {
    merged = { ...merged, webhook_secret: incomingWebhook };
    changed = true;
  }

  if (changed) {
    secrets_cipher = encryptJson(merged);
    secrets_meta = {
      ...secrets_meta,
      last4: merged.api_key ? last4(merged.api_key) : secrets_meta.last4,
      webhook_last4: merged.webhook_secret
        ? last4(merged.webhook_secret)
        : secrets_meta.webhook_last4,
      updated_at: new Date().toISOString(),
      fields: Object.keys(merged),
    };
  }

  const { error } = await client.from("epos_fcargo_settings").upsert(
    {
      id: "default",
      enabled: params.enabled,
      tenant_domain: params.tenantDomain.trim(),
      base_url: normalizeBaseUrl(params.baseUrl),
      mode: params.mode,
      secrets_cipher,
      secrets_meta,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
  invalidateFcargoConfigCache();
}

/** Webhook / cron shared secret from CMS (or FCARGO_WEBHOOK_SECRET / FCARGO_SYNC_SECRET env). */
export async function resolveFcargoWebhookSecret(): Promise<string | null> {
  if (hasSupabaseAdminConfig() && hasMessagingSecretsKey()) {
    try {
      const client = createSupabaseAdminClient();
      const { data } = await client
        .from("epos_fcargo_settings")
        .select("secrets_cipher")
        .eq("id", "default")
        .maybeSingle();
      if (data?.secrets_cipher) {
        const secrets = decryptJson<Record<string, string>>(data.secrets_cipher);
        const fromCms = (secrets.webhook_secret ?? "").trim();
        if (fromCms) return fromCms;
      }
    } catch {
      // fall through to env
    }
  }
  const fromEnv =
    (process.env.FCARGO_WEBHOOK_SECRET ?? "").trim() ||
    (process.env.FCARGO_SYNC_SECRET ?? "").trim();
  return fromEnv || null;
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function clearFcargoApiKey(): Promise<void> {
  if (!hasMessagingSecretsKey()) {
    throw new Error("Master encryption key is not set");
  }
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_fcargo_settings")
    .update({
      secrets_cipher: null,
      secrets_meta: {},
      enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) throw new Error(error.message);
  invalidateFcargoConfigCache();
}

export async function markFcargoTest(ok: boolean, errorMsg?: string) {
  if (!hasSupabaseAdminConfig()) return;
  const client = createSupabaseAdminClient();
  await client
    .from("epos_fcargo_settings")
    .update({
      last_test_at: new Date().toISOString(),
      last_test_ok: ok,
      last_error: ok ? null : (errorMsg ?? "test_failed"),
    })
    .eq("id", "default");
}

/** Import from env once if DB has no secrets yet. */
export async function maybeImportFcargoFromEnv(): Promise<boolean> {
  if (!hasMessagingSecretsKey() || !hasSupabaseAdminConfig()) return false;
  const view = await getFcargoSettingsView();
  if (view.hasSecrets) return false;

  const apiKey = (process.env.FCARGO_API_KEY ?? "").trim();
  const tenantDomain = (process.env.FCARGO_TENANT_DOMAIN ?? "").trim();
  if (!apiKey || !tenantDomain) return false;

  await saveFcargoSettings({
    enabled: true,
    tenantDomain,
    baseUrl: process.env.FCARGO_BASE_URL ?? DEFAULT_BASE,
    mode: "live",
    apiKey,
  });
  return true;
}
