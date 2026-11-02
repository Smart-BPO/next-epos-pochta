import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  decryptJson,
  encryptJson,
  hasMessagingSecretsKey,
} from "@/lib/crypto/secrets";
import { toFcargoPhone } from "@/lib/fcargo/create-order";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export const EPOS_ACCT_COOKIE = "epos_acct";
export const EPOS_ACCT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30d

export type EposLinkSubjectType = "web" | "telegram";

export type EposClientLinkRow = {
  id: string;
  subject_type: EposLinkSubjectType;
  subject_id: string;
  phone: string;
  fcargo_client_id: string | null;
  display_name: string | null;
  token_cipher: string;
  session_token: string;
  linked_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type EposLinkPublic = {
  id: string;
  phone: string;
  displayName: string | null;
  fcargoClientId: string | null;
  linkedAt: string;
  subjectType: EposLinkSubjectType;
};

function newSessionToken() {
  return randomBytes(32).toString("hex");
}

function hashChallenge(challenge: string) {
  return createHash("sha256").update(challenge).digest("hex").slice(0, 32);
}

export function normalizeAccountPhone(raw: string): string | null {
  return toFcargoPhone(raw);
}

export function toPublicLink(row: EposClientLinkRow): EposLinkPublic {
  return {
    id: row.id,
    phone: row.phone,
    displayName: row.display_name,
    fcargoClientId: row.fcargo_client_id,
    linkedAt: row.linked_at,
    subjectType: row.subject_type,
  };
}

export async function decryptLinkToken(
  row: EposClientLinkRow,
): Promise<string | null> {
  if (!hasMessagingSecretsKey()) return null;
  try {
    const payload = decryptJson<{ access_token?: string }>(row.token_cipher);
    const token = (payload.access_token ?? "").trim();
    return token || null;
  } catch {
    return null;
  }
}

export async function findActiveLinkBySession(
  sessionToken: string,
): Promise<EposClientLinkRow | null> {
  if (!hasSupabaseAdminConfig() || !sessionToken) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_fcargo_client_links")
    .select("*")
    .eq("session_token", sessionToken)
    .is("revoked_at", null)
    .maybeSingle();
  return (data as EposClientLinkRow | null) ?? null;
}

export async function findActiveLinkBySubject(
  subjectType: EposLinkSubjectType,
  subjectId: string,
): Promise<EposClientLinkRow | null> {
  if (!hasSupabaseAdminConfig() || !subjectId) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_fcargo_client_links")
    .select("*")
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .is("revoked_at", null)
    .maybeSingle();
  return (data as EposClientLinkRow | null) ?? null;
}

export async function upsertClientLink(params: {
  subjectType: EposLinkSubjectType;
  subjectId: string;
  phone: string;
  accessToken: string;
  fcargoClientId?: string | number | null;
  displayName?: string | null;
}): Promise<EposClientLinkRow | null> {
  if (!hasSupabaseAdminConfig() || !hasMessagingSecretsKey()) return null;
  const phone = normalizeAccountPhone(params.phone);
  if (!phone) return null;

  const admin = createSupabaseAdminClient();
  const existing = await findActiveLinkBySubject(
    params.subjectType,
    params.subjectId,
  );
  const sessionToken = existing?.session_token ?? newSessionToken();
  const tokenCipher = encryptJson({ access_token: params.accessToken });
  const clientId =
    params.fcargoClientId != null ? String(params.fcargoClientId) : null;

  if (existing) {
    const { data, error } = await admin
      .from("epos_fcargo_client_links")
      .update({
        phone,
        fcargo_client_id: clientId ?? existing.fcargo_client_id,
        display_name: params.displayName ?? existing.display_name,
        token_cipher: tokenCipher,
        last_used_at: new Date().toISOString(),
        revoked_at: null,
      })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) {
      console.warn("[epos-account] update link", error.message);
      return null;
    }
    return (data as EposClientLinkRow | null) ?? null;
  }

  // Revoke any previous links for this subject (safety if unique index lags).
  await admin
    .from("epos_fcargo_client_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("subject_type", params.subjectType)
    .eq("subject_id", params.subjectId)
    .is("revoked_at", null);

  const { data, error } = await admin
    .from("epos_fcargo_client_links")
    .insert({
      subject_type: params.subjectType,
      subject_id: params.subjectId,
      phone,
      fcargo_client_id: clientId,
      display_name: params.displayName ?? null,
      token_cipher: tokenCipher,
      session_token: sessionToken,
      last_used_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();
  if (error) {
    console.warn("[epos-account] insert link", error.message);
    return null;
  }
  return (data as EposClientLinkRow | null) ?? null;
}

export async function revokeLink(row: EposClientLinkRow): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("epos_fcargo_client_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("revoked_at", null);
}

export async function touchLink(row: EposClientLinkRow): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("epos_fcargo_client_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);
}

export async function logOtpAttempt(params: {
  phone: string;
  challenge?: string | null;
  ip?: string | null;
  subjectType?: EposLinkSubjectType | null;
  subjectId?: string | null;
  kind: "start" | "resend" | "verify" | "verify_fail";
  ok: boolean;
  errorCode?: string | null;
}): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("epos_fcargo_otp_attempts").insert({
      phone: params.phone,
      challenge: params.challenge ? hashChallenge(params.challenge) : null,
      ip: params.ip ?? null,
      subject_type: params.subjectType ?? null,
      subject_id: params.subjectId ?? null,
      kind: params.kind,
      ok: params.ok,
      error_code: params.errorCode ?? null,
    });
  } catch (e) {
    console.warn(
      "[epos-account] otp log",
      e instanceof Error ? e.message : e,
    );
  }
}

export async function countRecentOtpAttempts(params: {
  phone?: string;
  ip?: string;
  kind?: string[];
  windowMs: number;
}): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const since = new Date(Date.now() - params.windowMs).toISOString();
  const admin = createSupabaseAdminClient();
  let q = admin
    .from("epos_fcargo_otp_attempts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (params.phone) q = q.eq("phone", params.phone);
  if (params.ip) q = q.eq("ip", params.ip);
  if (params.kind?.length) q = q.in("kind", params.kind);
  const { count } = await q;
  return count ?? 0;
}

export async function readWebAccountCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(EPOS_ACCT_COOKIE)?.value?.trim();
  return value || null;
}

export async function setWebAccountCookie(sessionToken: string) {
  const jar = await cookies();
  jar.set(EPOS_ACCT_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EPOS_ACCT_COOKIE_MAX_AGE,
  });
}

export async function clearWebAccountCookie() {
  const jar = await cookies();
  jar.set(EPOS_ACCT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function countLinkedAccounts(): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("epos_fcargo_client_links")
    .select("id", { count: "exact", head: true })
    .is("revoked_at", null);
  return count ?? 0;
}

export async function listRecentOtpErrors(limit = 10): Promise<
  Array<{
    phone: string;
    kind: string;
    errorCode: string | null;
    createdAt: string;
  }>
> {
  if (!hasSupabaseAdminConfig()) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_fcargo_otp_attempts")
    .select("phone, kind, error_code, created_at")
    .eq("ok", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    phone: String(row.phone ?? ""),
    kind: String(row.kind ?? ""),
    errorCode: (row.error_code as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function isPhoneLinked(phone: string): Promise<boolean> {
  const normalized = normalizeAccountPhone(phone);
  if (!normalized || !hasSupabaseAdminConfig()) return false;
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("epos_fcargo_client_links")
    .select("id", { count: "exact", head: true })
    .eq("phone", normalized)
    .is("revoked_at", null);
  return (count ?? 0) > 0;
}

/** Active telegram subject_ids that have a FCargo client link. */
export async function linkedTelegramSubjectIds(
  telegramUserIds: Array<string | number>,
): Promise<Set<string>> {
  const ids = [
    ...new Set(
      telegramUserIds
        .map((id) => String(id).trim())
        .filter(Boolean),
    ),
  ];
  if (ids.length === 0 || !hasSupabaseAdminConfig()) return new Set();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_fcargo_client_links")
    .select("subject_id")
    .eq("subject_type", "telegram")
    .in("subject_id", ids)
    .is("revoked_at", null);
  return new Set((data ?? []).map((row) => String(row.subject_id)));
}
