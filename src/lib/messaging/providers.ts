import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  decryptJson,
  encryptJson,
  hasMessagingSecretsKey,
  last4,
  maskSecret,
} from "@/lib/crypto/secrets";

export type MessagingProviderId = "playmobile" | "eskiz" | "resend";

export type ProviderRow = {
  id: MessagingProviderId;
  enabled: boolean;
  is_primary_sms: boolean;
  config_public: Record<string, string>;
  secrets_cipher: string | null;
  secrets_meta: { last4?: string; updated_at?: string; fields?: string[] };
  last_test_at: string | null;
  last_test_ok: boolean | null;
  last_error: string | null;
};

export type ProviderPublicView = {
  id: MessagingProviderId;
  enabled: boolean;
  isPrimarySms: boolean;
  config: Record<string, string>;
  hasSecrets: boolean;
  secretsHint: string;
  masterKeyOk: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
};

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return out;
}

export async function listMessagingProviders(): Promise<ProviderPublicView[]> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_messaging_providers")
    .select(
      "id, enabled, is_primary_sms, config_public, secrets_cipher, secrets_meta, last_test_at, last_test_ok, last_error",
    )
    .order("id");
  if (error) throw new Error(error.message);
  const masterKeyOk = hasMessagingSecretsKey();
  return ((data ?? []) as ProviderRow[]).map((row) => {
    const meta = (row.secrets_meta ?? {}) as ProviderRow["secrets_meta"];
    return {
      id: row.id,
      enabled: row.enabled,
      isPrimarySms: row.is_primary_sms,
      config: asRecord(row.config_public),
      hasSecrets: Boolean(row.secrets_cipher),
      secretsHint: meta.last4 ? `••••${meta.last4}` : maskSecret(""),
      masterKeyOk,
      lastTestAt: row.last_test_at,
      lastTestOk: row.last_test_ok,
      lastError: row.last_error,
    };
  });
}

export async function getProviderSecrets(
  id: MessagingProviderId,
): Promise<Record<string, string> | null> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_messaging_providers")
    .select("secrets_cipher")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.secrets_cipher) return null;
  return decryptJson<Record<string, string>>(data.secrets_cipher);
}

export async function getProviderRow(
  id: MessagingProviderId,
): Promise<ProviderRow | null> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_messaging_providers")
    .select(
      "id, enabled, is_primary_sms, config_public, secrets_cipher, secrets_meta, last_test_at, last_test_ok, last_error",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as ProviderRow;
  return {
    ...row,
    config_public: asRecord(row.config_public),
    secrets_meta: (row.secrets_meta ?? {}) as ProviderRow["secrets_meta"],
  };
}

export async function saveProvider(params: {
  id: MessagingProviderId;
  enabled: boolean;
  isPrimarySms?: boolean;
  config: Record<string, string>;
  /** If provided and non-empty keys, merge/replace secrets */
  secrets?: Record<string, string> | null;
}): Promise<void> {
  const client = createSupabaseAdminClient();
  const existing = await getProviderRow(params.id);
  let secrets_cipher = existing?.secrets_cipher ?? null;
  let secrets_meta = existing?.secrets_meta ?? {};

  if (params.secrets) {
    const incoming = Object.fromEntries(
      Object.entries(params.secrets).filter(([, v]) => String(v ?? "").trim()),
    );
    if (Object.keys(incoming).length > 0) {
      const prev = secrets_cipher
        ? decryptJson<Record<string, string>>(secrets_cipher)
        : {};
      const merged = { ...prev, ...incoming };
      secrets_cipher = encryptJson(merged);
      const hintSrc =
        merged.api_key ||
        merged.password ||
        merged.login ||
        merged.email ||
        Object.values(merged)[0] ||
        "";
      secrets_meta = {
        last4: last4(hintSrc),
        updated_at: new Date().toISOString(),
        fields: Object.keys(merged),
      };
    }
  }

  if (params.isPrimarySms && (params.id === "playmobile" || params.id === "eskiz")) {
    await client
      .from("epos_messaging_providers")
      .update({ is_primary_sms: false })
      .in("id", ["playmobile", "eskiz"]);
  }

  const { error } = await client.from("epos_messaging_providers").upsert(
    {
      id: params.id,
      enabled: params.enabled,
      is_primary_sms:
        params.id === "resend"
          ? false
          : Boolean(params.isPrimarySms ?? existing?.is_primary_sms),
      config_public: params.config,
      secrets_cipher,
      secrets_meta,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
}

export async function markProviderTest(
  id: MessagingProviderId,
  ok: boolean,
  errorMsg?: string,
) {
  const client = createSupabaseAdminClient();
  await client
    .from("epos_messaging_providers")
    .update({
      last_test_at: new Date().toISOString(),
      last_test_ok: ok,
      last_error: ok ? null : (errorMsg ?? "test_failed"),
    })
    .eq("id", id);
}

/** Import from env once if DB has no secrets yet. */
export async function maybeImportProvidersFromEnv(): Promise<void> {
  if (!hasMessagingSecretsKey()) return;
  const client = createSupabaseAdminClient();

  const pm = await getProviderRow("playmobile");
  if (pm && !pm.secrets_cipher) {
    const login = process.env.PLAYMOBILE_LOGIN?.trim();
    const password = process.env.PLAYMOBILE_PASSWORD?.trim();
    if (login && password) {
      await saveProvider({
        id: "playmobile",
        enabled: true,
        isPrimarySms: true,
        config: {
          base_url: process.env.PLAYMOBILE_BASE_URL?.trim() ?? "",
          originator: process.env.PLAYMOBILE_ORIGINATOR?.trim() ?? "",
        },
        secrets: { login, password },
      });
    }
  }

  const rs = await getProviderRow("resend");
  if (rs && !rs.secrets_cipher) {
    const api_key = process.env.RESEND_API_KEY?.trim();
    if (api_key) {
      const from = process.env.RESEND_FROM?.trim() ?? "";
      let from_email = "";
      let from_name = "EPOS POCHTA";
      const m = from.match(/^(.+?)\s*<([^>]+)>$/);
      if (m) {
        from_name = m[1]!.trim();
        from_email = m[2]!.trim();
      } else if (from.includes("@")) {
        from_email = from;
      }
      await saveProvider({
        id: "resend",
        enabled: true,
        config: {
          from_email:
            from_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
          from_name,
          notify_to:
            process.env.RESEND_NOTIFY_TO?.trim() ||
            process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
            "",
        },
        secrets: { api_key },
      });
    }
  }

  void client;
}
