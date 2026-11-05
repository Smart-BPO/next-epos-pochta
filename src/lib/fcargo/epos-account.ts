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
export const EPOS_SESSION_IDLE_MS = EPOS_ACCT_COOKIE_MAX_AGE * 1000;
/** Default OTP challenge TTL when FCargo omits expires_at. */
export const EPOS_OTP_CHALLENGE_DEFAULT_TTL_MS = 5 * 60_000;

export type EposLinkSubjectType = "web" | "telegram";

export type EposClientLinkRow = {
  id: string;
  subject_type: EposLinkSubjectType;
  subject_id: string;
  phone: string;
  fcargo_client_id: string | null;
  display_name: string | null;
  avatar_url?: string | null;
  token_cipher: string;
  session_token: string;
  linked_at: string;
  last_used_at: string | null;
  last_validated_at: string | null;
  session_expires_at: string | null;
  revoked_at: string | null;
};

export type EposLinkPublic = {
  id: string;
  phone: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
  subjectType: EposLinkSubjectType;
};

export type EposOtpChallengeRow = {
  id: string;
  phone: string;
  challenge_hash: string;
  subject_type: EposLinkSubjectType | null;
  subject_id: string | null;
  ip: string | null;
  expires_at: string;
  consumed_at: string | null;
};

function newSessionToken() {
  return randomBytes(32).toString("hex");
}

function hashChallenge(challenge: string) {
  return createHash("sha256").update(challenge).digest("hex").slice(0, 32);
}

function sessionExpiresAtFrom(now = Date.now()) {
  return new Date(now + EPOS_SESSION_IDLE_MS).toISOString();
}

function isSessionExpired(row: EposClientLinkRow, now = Date.now()) {
  if (!row.session_expires_at) return false;
  const ms = Date.parse(row.session_expires_at);
  return Number.isFinite(ms) && ms <= now;
}

export function normalizeAccountPhone(raw: string): string | null {
  return toFcargoPhone(raw);
}

export function toPublicLink(row: EposClientLinkRow): EposLinkPublic {
  return {
    id: row.id,
    phone: row.phone,
    displayName: row.display_name,
    avatarUrl: row.avatar_url?.trim() || null,
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

async function enforceSessionFreshness(
  row: EposClientLinkRow,
): Promise<EposClientLinkRow | null> {
  if (!isSessionExpired(row)) return row;
  await revokeLink(row);
  return null;
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
  const row = (data as EposClientLinkRow | null) ?? null;
  if (!row) return null;
  return enforceSessionFreshness(row);
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
  const row = (data as EposClientLinkRow | null) ?? null;
  if (!row) return null;
  return enforceSessionFreshness(row);
}

export async function upsertClientLink(params: {
  subjectType: EposLinkSubjectType;
  subjectId: string;
  phone: string;
  accessToken: string;
  fcargoClientId?: string | number | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}): Promise<EposClientLinkRow | null> {
  if (!hasSupabaseAdminConfig() || !hasMessagingSecretsKey()) return null;
  const phone = normalizeAccountPhone(params.phone);
  if (!phone) return null;

  const admin = createSupabaseAdminClient();
  const existing = await findActiveLinkBySubject(
    params.subjectType,
    params.subjectId,
  );
  // Always rotate session on (re)OTP so old cookies die.
  const sessionToken = newSessionToken();
  const tokenCipher = encryptJson({ access_token: params.accessToken });
  const clientId =
    params.fcargoClientId != null ? String(params.fcargoClientId) : null;
  const avatarUrl = params.avatarUrl?.trim() || null;
  const nowIso = new Date().toISOString();
  const sessionExpires = sessionExpiresAtFrom();

  if (existing) {
    const patch = {
      phone,
      fcargo_client_id: clientId ?? existing.fcargo_client_id,
      display_name: params.displayName ?? existing.display_name,
      avatar_url: avatarUrl ?? existing.avatar_url ?? null,
      token_cipher: tokenCipher,
      session_token: sessionToken,
      last_used_at: nowIso,
      last_validated_at: nowIso,
      session_expires_at: sessionExpires,
      revoked_at: null,
      linked_at: nowIso,
    };
    let { data, error } = await admin
      .from("epos_fcargo_client_links")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error && /avatar_url/i.test(error.message)) {
      const { avatar_url: _a, ...withoutAvatar } = patch;
      void _a;
      ({ data, error } = await admin
        .from("epos_fcargo_client_links")
        .update(withoutAvatar)
        .eq("id", existing.id)
        .select("*")
        .maybeSingle());
    }
    if (error) {
      console.warn("[epos-account] update link", error.message);
      return null;
    }
    return (data as EposClientLinkRow | null) ?? null;
  }

  // Revoke any previous links for this subject (safety if unique index lags).
  await admin
    .from("epos_fcargo_client_links")
    .update({ revoked_at: nowIso })
    .eq("subject_type", params.subjectType)
    .eq("subject_id", params.subjectId)
    .is("revoked_at", null);

  const insertRow = {
    subject_type: params.subjectType,
    subject_id: params.subjectId,
    phone,
    fcargo_client_id: clientId,
    display_name: params.displayName ?? null,
    avatar_url: avatarUrl,
    token_cipher: tokenCipher,
    session_token: sessionToken,
    last_used_at: nowIso,
    last_validated_at: nowIso,
    session_expires_at: sessionExpires,
  };
  let { data, error } = await admin
    .from("epos_fcargo_client_links")
    .insert(insertRow)
    .select("*")
    .maybeSingle();
  if (error && /avatar_url/i.test(error.message)) {
    const { avatar_url: _a, ...withoutAvatar } = insertRow;
    void _a;
    ({ data, error } = await admin
      .from("epos_fcargo_client_links")
      .insert(withoutAvatar)
      .select("*")
      .maybeSingle());
  }
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

/** Revoke DB link and clear web cookie when the subject is web. */
export async function revokeLinkSession(
  row: EposClientLinkRow,
): Promise<void> {
  await revokeLink(row);
  if (row.subject_type === "web") {
    await clearWebAccountCookie();
  }
}

/** Slide the idle window; returns the new `session_expires_at` ISO. */
export async function touchLink(row: EposClientLinkRow): Promise<string> {
  const sessionExpires = sessionExpiresAtFrom();
  if (!hasSupabaseAdminConfig()) return sessionExpires;
  const admin = createSupabaseAdminClient();
  await admin
    .from("epos_fcargo_client_links")
    .update({
      last_used_at: new Date().toISOString(),
      session_expires_at: sessionExpires,
    })
    .eq("id", row.id);
  return sessionExpires;
}

/**
 * Cabinet/session refresh: extend idle expiry and re-issue the httpOnly cookie
 * (FCargo Client API has no token refresh — only OTP + long-lived bearer).
 */
export async function refreshWebAccountSession(
  row: EposClientLinkRow,
): Promise<string> {
  const sessionExpires = await touchLink(row);
  if (row.subject_type === "web") {
    await setWebAccountCookie(row.session_token);
  }
  return sessionExpires;
}

export async function markLinkValidated(
  row: EposClientLinkRow,
  patch?: {
    displayName?: string | null;
    phone?: string | null;
    fcargoClientId?: string | number | null;
    avatarUrl?: string | null;
  },
): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const admin = createSupabaseAdminClient();
  const update: Record<string, unknown> = {
    last_validated_at: new Date().toISOString(),
  };
  if (patch?.displayName) update.display_name = patch.displayName;
  if (patch?.phone) {
    const phone = normalizeAccountPhone(patch.phone);
    if (phone) update.phone = phone;
  }
  if (patch?.fcargoClientId != null) {
    update.fcargo_client_id = String(patch.fcargoClientId);
  }
  if (patch?.avatarUrl !== undefined) {
    update.avatar_url = patch.avatarUrl?.trim() || null;
  }
  let { error } = await admin
    .from("epos_fcargo_client_links")
    .update(update)
    .eq("id", row.id)
    .is("revoked_at", null);
  if (error && /avatar_url/i.test(error.message)) {
    const { avatar_url: _a, ...withoutAvatar } = update;
    void _a;
    ({ error } = await admin
      .from("epos_fcargo_client_links")
      .update(withoutAvatar)
      .eq("id", row.id)
      .is("revoked_at", null));
  }
  if (error) {
    console.warn("[epos-account] mark validated", error.message);
  }
}

export async function storeOtpChallenge(params: {
  phone: string;
  challenge: string;
  expiresAt?: string | null;
  expiresInSec?: number | null;
  subjectType?: EposLinkSubjectType | null;
  subjectId?: string | null;
  ip?: string | null;
}): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const phone = normalizeAccountPhone(params.phone);
  if (!phone || params.challenge.length < 16) return;

  let expiresAt: string | null = null;
  if (params.expiresAt && Number.isFinite(Date.parse(params.expiresAt))) {
    expiresAt = new Date(params.expiresAt).toISOString();
  } else if (
    typeof params.expiresInSec === "number" &&
    params.expiresInSec > 0
  ) {
    expiresAt = new Date(
      Date.now() + params.expiresInSec * 1000,
    ).toISOString();
  } else {
    expiresAt = new Date(
      Date.now() + EPOS_OTP_CHALLENGE_DEFAULT_TTL_MS,
    ).toISOString();
  }

  const admin = createSupabaseAdminClient();
  const hash = hashChallenge(params.challenge);

  // Drop prior open challenges for this phone (one active flow).
  await admin
    .from("epos_fcargo_otp_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("phone", phone)
    .is("consumed_at", null);

  const { error } = await admin.from("epos_fcargo_otp_challenges").insert({
    phone,
    challenge_hash: hash,
    subject_type: params.subjectType ?? null,
    subject_id: params.subjectId || null,
    ip: params.ip ?? null,
    expires_at: expiresAt,
  });
  if (error) {
    console.warn("[epos-account] store challenge", error.message);
  }
}

export async function findValidOtpChallenge(params: {
  phone: string;
  challenge: string;
}): Promise<
  | { ok: true; row: EposOtpChallengeRow }
  | { ok: false; error: "invalid_challenge" | "expired_challenge" }
> {
  if (!hasSupabaseAdminConfig()) {
    return { ok: false, error: "invalid_challenge" };
  }
  const phone = normalizeAccountPhone(params.phone);
  if (!phone || params.challenge.length < 16) {
    return { ok: false, error: "invalid_challenge" };
  }

  const admin = createSupabaseAdminClient();
  const hash = hashChallenge(params.challenge);
  const { data } = await admin
    .from("epos_fcargo_otp_challenges")
    .select("*")
    .eq("phone", phone)
    .eq("challenge_hash", hash)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = data as EposOtpChallengeRow | null;
  if (!row) return { ok: false, error: "invalid_challenge" };

  const expiresMs = Date.parse(row.expires_at);
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
    await admin
      .from("epos_fcargo_otp_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: false, error: "expired_challenge" };
  }

  return { ok: true, row };
}

export async function consumeOtpChallengeRow(
  row: EposOtpChallengeRow,
): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("epos_fcargo_otp_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("consumed_at", null);
}

/** List hot links that need a FCargo /profile health check. */
export async function listLinksNeedingValidation(limit = 20): Promise<
  EposClientLinkRow[]
> {
  if (!hasSupabaseAdminConfig()) return [];
  const admin = createSupabaseAdminClient();
  const usedSince = new Date(Date.now() - 14 * 24 * 60 * 60_000).toISOString();
  const staleBeforeMs = Date.now() - 12 * 60 * 60_000;
  const capped = Math.max(1, Math.min(50, limit));

  const { data, error } = await admin
    .from("epos_fcargo_client_links")
    .select("*")
    .is("revoked_at", null)
    .gte("last_used_at", usedSince)
    .order("last_validated_at", { ascending: true, nullsFirst: true })
    .limit(capped * 3);

  if (error) {
    console.warn("[epos-account] list validate", error.message);
    return [];
  }

  return ((data as EposClientLinkRow[]) ?? [])
    .filter((row) => {
      if (!row.last_validated_at) return true;
      const ms = Date.parse(row.last_validated_at);
      return !Number.isFinite(ms) || ms < staleBeforeMs;
    })
    .slice(0, capped);
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
