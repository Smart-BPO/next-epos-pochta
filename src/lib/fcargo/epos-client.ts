import "server-only";

/**
 * Legacy EPOS customer API (`/api/v1/web/clients/epos/*`).
 * Server-only — tokens never leave Route Handlers.
 * Tenant domain + base host come from CMS FCargo settings.
 */

import { resolveFcargoConfig } from "@/lib/fcargo/settings";
import { logFcargoRequest } from "@/lib/fcargo/log";
import {
  isDynamicServerBailError,
  isFcargoBuildPhase,
} from "@/lib/fcargo/runtime";
import type {
  EposClientPackage,
  EposClientProfile,
  EposOtpStartResult,
  EposOtpVerifyResult,
  EposPackagesPage,
  FcargoResult,
} from "@/lib/fcargo/types";

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

function pickId(
  obj: Record<string, unknown> | null,
  keys: string[],
): string | number | null {
  if (!obj) return null;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Client API base → tenant API v1 host (`…/api/client/v1` → `…/api/v1`). */
export function eposApiBaseFromClientBase(clientBase: string): string {
  const trimmed = clientBase.replace(/\/+$/, "");
  if (/\/api\/client\/v1$/i.test(trimmed)) {
    return trimmed.replace(/\/api\/client\/v1$/i, "/api/v1");
  }
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
}

type EposFetchOpts = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  accessToken?: string | null;
  /** Extra fields to redact from logs (e.g. OTP code). */
  redactBody?: boolean;
};

async function eposFetch<T>(
  path: string,
  opts: EposFetchOpts = {},
): Promise<FcargoResult<T>> {
  if (isFcargoBuildPhase()) {
    return {
      ok: false,
      code: "SKIPPED_BUILD",
      message: "FCargo live fetch skipped during static generation",
      status: 0,
    };
  }

  const cfg = await resolveFcargoConfig();
  if (!cfg) {
    logFcargoRequest({
      direction: "out",
      source: "out_api",
      method: opts.method ?? "GET",
      path,
      ok: false,
      httpStatus: 0,
      errorCode: "NOT_CONFIGURED",
      errorMessage: "FCargo not configured",
      requestBody: opts.redactBody ? { redacted: true } : (opts.body ?? null),
    });
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "FCargo not configured",
      status: 0,
    };
  }

  const method = opts.method ?? "GET";
  const base = eposApiBaseFromClientBase(cfg.baseUrl);
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant-Domain": cfg.tenantDomain,
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.accessToken) {
    headers.Authorization = `Bearer ${opts.accessToken}`;
  }

  const started = Date.now();
  const logHeaders = { ...headers };
  if (logHeaders.Authorization) {
    logHeaders.Authorization = "Bearer ••••";
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    const durationMs = Date.now() - started;
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    const envelope = asRecord(json);
    const errorCode =
      (typeof envelope?.error_code === "string" && envelope.error_code) ||
      (typeof envelope?.code === "string" && envelope.code) ||
      null;
    const message =
      (typeof envelope?.message === "string" && envelope.message) ||
      (res.ok ? null : `HTTP ${res.status}`);

    logFcargoRequest({
      direction: "out",
      source: "out_api",
      method,
      path,
      url,
      httpStatus: res.status,
      durationMs,
      ok: res.ok,
      requestHeaders: logHeaders,
      requestBody: opts.redactBody
        ? { phone: asRecord(opts.body)?.phone ?? null, redacted: true }
        : (opts.body ?? null),
      responseBody: json,
      errorCode: res.ok ? null : errorCode,
      errorMessage: res.ok ? null : message,
    });

    if (!res.ok) {
      return {
        ok: false,
        code: errorCode || `HTTP_${res.status}`,
        message: message || `HTTP ${res.status}`,
        status: res.status,
        details: json,
      };
    }

    return { ok: true, data: json as T };
  } catch (e) {
    if (isDynamicServerBailError(e)) {
      return {
        ok: false,
        code: "SKIPPED_SSG",
        message: "FCargo fetch not allowed during static render",
        status: 0,
      };
    }
    const message = e instanceof Error ? e.message : "network_error";
    logFcargoRequest({
      direction: "out",
      source: "out_api",
      method,
      path,
      url,
      httpStatus: 0,
      durationMs: Date.now() - started,
      ok: false,
      errorCode: "NETWORK",
      errorMessage: message,
      requestBody: opts.redactBody ? { redacted: true } : (opts.body ?? null),
    });
    return { ok: false, code: "NETWORK", message, status: 0 };
  }
}

function parseOtpStart(raw: unknown): EposOtpStartResult | null {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  const challenge = pickString(data, [
    "challenge",
    "challenge_id",
    "challengeId",
  ]);
  if (!challenge || challenge.length < 16) return null;

  const expiresAt = pickString(data, ["expires_at", "expiresAt"]);
  const expiresRaw = data?.expires_in ?? data?.expiresIn ?? data?.ttl;
  let expiresInSec: number | null =
    typeof expiresRaw === "number" && expiresRaw > 0
      ? Math.round(expiresRaw)
      : null;
  if (expiresInSec == null && expiresAt) {
    const ms = Date.parse(expiresAt);
    if (Number.isFinite(ms)) {
      expiresInSec = Math.max(0, Math.round((ms - Date.now()) / 1000));
    }
  }

  const resendRaw =
    data?.resend_after_seconds ?? data?.resendAfterSeconds ?? data?.resend_after;
  const resendAfterSeconds =
    typeof resendRaw === "number" && resendRaw >= 0
      ? Math.round(resendRaw)
      : null;

  return {
    challenge,
    expiresAt,
    expiresInSec,
    resendAfterSeconds,
    message: pickString(root, ["message"]),
  };
}

function parseOtpVerify(raw: unknown): EposOtpVerifyResult | null {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  const accessToken = pickString(data, [
    "access_token",
    "token",
    "accessToken",
  ]);
  if (!accessToken) return null;
  // Live FCargo shape: { token, profile: { id, name, phone, email } }
  const client =
    asRecord(data?.profile) ??
    asRecord(data?.client) ??
    asRecord(data?.user) ??
    asRecord(data?.customer) ??
    data;
  return {
    accessToken,
    tokenType: pickString(data, ["token_type", "tokenType"]) || "Bearer",
    clientId: pickId(client, ["id", "client_id", "customer_id"]),
    name: pickString(client, ["name", "full_name", "fullName"]),
    phone: pickString(client, ["phone", "phone_number", "phoneNumber"]),
    email: pickString(client, ["email"]),
    avatarUrl: pickString(client, ["avatar", "avatar_url", "avatarUrl", "photo"]),
    raw: root ?? {},
  };
}

function parseProfile(raw: unknown): EposClientProfile {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root ?? {};
  return {
    id: pickId(data, ["id", "client_id", "customer_id"]),
    name: pickString(data, ["name", "full_name", "fullName"]),
    phone: pickString(data, ["phone", "phone_number", "phoneNumber"]),
    email: pickString(data, ["email"]),
    avatarUrl: pickString(data, ["avatar", "avatar_url", "avatarUrl", "photo"]),
    raw: data,
  };
}

function partyLabel(party: Record<string, unknown> | null): string | null {
  if (!party) return null;
  const address = pickString(party, ["address", "full_address"]);
  const region =
    pickString(asRecord(party.region), ["name", "title"]) ||
    pickString(party, ["region", "region_name"]);
  const district =
    pickString(asRecord(party.district), ["name", "title"]) ||
    pickString(party, ["district", "district_name"]);
  const parts = [district || region, address].filter(Boolean);
  return parts.length ? parts.join(", ") : region || district || address;
}

/** Live EPOS packages use flat sender_* / receiver_* fields. */
function flatPartyLabel(
  row: Record<string, unknown>,
  prefix: "sender" | "receiver",
): string | null {
  const nested = partyLabel(asRecord(row[prefix]));
  if (nested) return nested;
  const branch = asRecord(row[`${prefix}_branch`]);
  const district =
    pickString(row, [`${prefix}_district_name`, `${prefix}_district`]) ||
    pickString(asRecord(row[`${prefix}_district`]), ["name", "title"]);
  const region =
    pickString(row, [`${prefix}_region_name`, `${prefix}_region`]) ||
    pickString(asRecord(row[`${prefix}_region`]), ["name", "title"]);
  const address = pickString(row, [`${prefix}_address`, `${prefix}_full_address`]);
  const branchName = pickString(branch, ["name", "title", "localized_name"]);
  const place = district || region || branchName;
  const parts = [place, address].filter(Boolean);
  return parts.length ? parts.join(", ") : place || address;
}

function pickNumber(
  obj: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function parsePackage(item: unknown): EposClientPackage | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = pickId(row, ["id", "package_id"]);
  if (id == null) return null;
  const status = asRecord(row.status);
  const isTerminal =
    row.is_terminal === true ||
    status?.is_terminal === true ||
    status?.isTerminal === true;
  return {
    id,
    trackingNumber: pickString(row, [
      "tracking_code",
      "tracking_number",
      "trackingNumber",
      "barcode",
    ]),
    statusCode:
      pickString(row, ["status_code", "statusCode"]) ||
      pickString(status, ["code"]),
    statusName:
      pickString(row, ["status_name", "statusName"]) ||
      pickString(status, ["localized_name", "name", "name_ru", "name_uz"]),
    isTerminal,
    fromLabel: flatPartyLabel(row, "sender"),
    toLabel: flatPartyLabel(row, "receiver"),
    createdAt: pickString(row, ["created_at", "createdAt"]),
    estimatedDeliveryAt: pickString(row, [
      "estimated_delivery_at",
      "estimatedDeliveryAt",
    ]),
    deliveredAt: pickString(row, ["delivered_at", "deliveredAt"]),
    creationSource: pickString(row, ["creation_source", "creationSource"]),
    externalOrderId: pickString(row, [
      "external_order_id",
      "externalOrderId",
    ]),
    seats: pickNumber(row, ["seats"]),
    weight: pickNumber(row, ["weight"]),
    raw: row,
  };
}

function parsePackagesPage(raw: unknown): EposPackagesPage {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  // Laravel paginator: { data: { data: [...], current_page, last_page, total, per_page } }
  // Also tolerate Client-API style { data: { items, meta } } and bare arrays.
  const list = Array.isArray(data?.data)
    ? (data!.data as unknown[])
    : Array.isArray(data?.items)
      ? (data!.items as unknown[])
      : Array.isArray(root?.data)
        ? (root!.data as unknown[])
        : Array.isArray(root?.items)
          ? (root!.items as unknown[])
          : [];

  const meta = asRecord(data?.meta) ?? data;
  const page =
    pickNumber(meta ?? {}, ["current_page", "currentPage", "page"]) ?? 1;
  const lastPage =
    pickNumber(meta ?? {}, ["last_page", "lastPage"]) ?? page;
  const total =
    pickNumber(meta ?? {}, ["total"]) ?? list.length;
  const perPage =
    pickNumber(meta ?? {}, ["per_page", "perPage"]) ??
    (list.length > 0 ? list.length : 15);

  return {
    items: list
      .map(parsePackage)
      .filter((x): x is EposClientPackage => Boolean(x)),
    page,
    lastPage,
    total,
    perPage,
  };
}

export async function eposOtpStart(
  phone: string,
): Promise<FcargoResult<EposOtpStartResult>> {
  const result = await eposFetch<unknown>("/web/clients/epos/auth/otp", {
    method: "POST",
    body: { phone },
    redactBody: true,
  });
  if (!result.ok) return result;
  const parsed = parseOtpStart(result.data);
  if (!parsed) {
    return {
      ok: false,
      code: "BAD_RESPONSE",
      message: "OTP challenge missing in response",
      status: 502,
      details: result.data,
    };
  }
  return { ok: true, data: parsed };
}

export async function eposOtpResend(
  phone: string,
  challenge: string,
): Promise<FcargoResult<EposOtpStartResult>> {
  const result = await eposFetch<unknown>("/web/clients/epos/auth/otp/resend", {
    method: "POST",
    body: { phone, challenge },
    redactBody: true,
  });
  if (!result.ok) return result;
  const parsed = parseOtpStart(result.data) ?? {
    challenge,
    expiresAt: null,
    expiresInSec: null,
    resendAfterSeconds: null,
    message: pickString(asRecord(result.data), ["message"]),
  };
  return { ok: true, data: parsed };
}

export async function eposOtpVerify(
  challenge: string,
  code: string,
): Promise<FcargoResult<EposOtpVerifyResult>> {
  const result = await eposFetch<unknown>(
    "/web/clients/epos/auth/otp/verify",
    {
      method: "POST",
      body: { challenge, code },
      redactBody: true,
    },
  );
  if (!result.ok) return result;
  const parsed = parseOtpVerify(result.data);
  if (!parsed) {
    return {
      ok: false,
      code: "BAD_RESPONSE",
      message: "Access token missing in verify response",
      status: 502,
      details: result.data,
    };
  }
  return { ok: true, data: parsed };
}

export async function eposLogout(
  accessToken: string,
): Promise<FcargoResult<{ ok: true }>> {
  const result = await eposFetch<unknown>("/web/clients/epos/auth/logout", {
    method: "POST",
    accessToken,
  });
  if (!result.ok) return result;
  return { ok: true, data: { ok: true } };
}

export async function eposProfile(
  accessToken: string,
): Promise<FcargoResult<EposClientProfile>> {
  const result = await eposFetch<unknown>("/web/clients/epos/profile", {
    method: "GET",
    accessToken,
  });
  if (!result.ok) return result;
  return { ok: true, data: parseProfile(result.data) };
}

export async function eposPackages(
  accessToken: string,
  opts?: { page?: number },
): Promise<FcargoResult<EposPackagesPage>> {
  const page = opts?.page && opts.page > 0 ? Math.floor(opts.page) : 1;
  const path =
    page > 1
      ? `/web/clients/epos/packages?page=${page}`
      : "/web/clients/epos/packages";
  const result = await eposFetch<unknown>(path, {
    method: "GET",
    accessToken,
  });
  if (!result.ok) return result;
  return { ok: true, data: parsePackagesPage(result.data) };
}

/**
 * Probe whether a customer bearer is still accepted by FCargo.
 * Profile alone can 401 intermittently — confirm with packages before
 * treating the session as dead (avoids false `relink_required`).
 */
export async function eposBearerAlive(
  accessToken: string,
): Promise<
  | { alive: true; profile: EposClientProfile | null }
  | { alive: false; status: number }
  | { alive: "unknown"; status: number }
> {
  const profile = await eposProfile(accessToken);
  if (profile.ok) {
    return { alive: true, profile: profile.data };
  }
  if (profile.status !== 401) {
    return { alive: "unknown", status: profile.status };
  }

  const packages = await eposPackages(accessToken, { page: 1 });
  if (packages.ok) {
    return { alive: true, profile: null };
  }
  if (packages.status === 401) {
    return { alive: false, status: 401 };
  }
  // Profile 401 but packages failed for another reason — don't revoke yet.
  return { alive: "unknown", status: packages.status || profile.status };
}
