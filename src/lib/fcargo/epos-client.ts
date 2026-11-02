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
  const expiresRaw = data?.expires_in ?? data?.expiresIn ?? data?.ttl;
  const expiresInSec =
    typeof expiresRaw === "number" && expiresRaw > 0
      ? Math.round(expiresRaw)
      : null;
  return {
    challenge,
    expiresInSec,
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
  const client =
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

function parsePackage(item: unknown): EposClientPackage | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = pickId(row, ["id", "package_id"]);
  if (id == null) return null;
  const status = asRecord(row.status);
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
      pickString(status, ["localized_name", "name"]),
    fromLabel: partyLabel(asRecord(row.sender)),
    toLabel: partyLabel(asRecord(row.receiver)),
    createdAt: pickString(row, ["created_at", "createdAt"]),
    raw: row,
  };
}

function parsePackages(raw: unknown): EposClientPackage[] {
  const root = asRecord(raw);
  const data = root?.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)!.items as unknown[])
      : Array.isArray(root?.items)
        ? (root!.items as unknown[])
        : [];
  return list.map(parsePackage).filter((x): x is EposClientPackage => Boolean(x));
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
    expiresInSec: null,
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
): Promise<FcargoResult<EposClientPackage[]>> {
  const result = await eposFetch<unknown>("/web/clients/epos/packages", {
    method: "GET",
    accessToken,
  });
  if (!result.ok) return result;
  return { ok: true, data: parsePackages(result.data) };
}
