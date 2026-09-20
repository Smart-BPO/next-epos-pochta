import "server-only";

/**
 * FCargo Client API HTTP client (server-only).
 * Credentials: CMS `/dashboard/settings/fcargo/` (encrypted) or legacy env.
 * Called only from Route Handlers / Server Actions — never from the browser.
 * OpenAPI: GET {base}/openapi.json with header X-Tenant-Domain.
 */

import {
  hasFcargoConfig,
  resolveFcargoConfig,
} from "@/lib/fcargo/settings";
import type {
  FcargoCreateOrderRequest,
  FcargoCreateOrderResult,
  FcargoEnvelope,
  FcargoErrorEnvelope,
  FcargoPricingQuote,
  FcargoResult,
} from "@/lib/fcargo/types";

export { hasFcargoConfig, resolveFcargoConfig };

type RequestOpts = {
  method?: "GET" | "POST";
  body?: unknown;
  idempotencyKey?: string;
  scopeHint?: string;
};

async function fcargoFetch<T>(
  path: string,
  opts: RequestOpts = {},
): Promise<FcargoResult<T>> {
  const cfg = await resolveFcargoConfig();
  if (!cfg) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "FCargo not configured in CMS (or legacy FCARGO_* env)",
      status: 0,
    };
  }

  const url = `${cfg.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant-Domain": cfg.tenantDomain,
    "X-API-Key": cfg.apiKey,
    Authorization: `Bearer ${cfg.apiKey}`,
  };
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (opts.idempotencyKey) {
    headers["Idempotency-Key"] = opts.idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as
      | FcargoEnvelope<T>
      | FcargoErrorEnvelope
      | null;

    if (!res.ok || !json || json.success === false) {
      const err = json as FcargoErrorEnvelope | null;
      return {
        ok: false,
        code: err?.error?.code || `HTTP_${res.status}`,
        message:
          err?.error?.message ||
          (json && "message" in json && typeof json.message === "string"
            ? json.message
            : `FCargo request failed (${res.status})`),
        status: res.status,
        details: err?.error?.details ?? undefined,
      };
    }

    return {
      ok: true,
      data: (json as FcargoEnvelope<T>).data as T,
      requestId: (json as FcargoEnvelope<T>).request_id,
    };
  } catch (e) {
    return {
      ok: false,
      code: "NETWORK",
      message: e instanceof Error ? e.message : "network_error",
      status: 0,
    };
  }
}

export function fcargoHealth() {
  return fcargoFetch<{ status?: string }>("/health");
}

export function fcargoListStatuses() {
  return fcargoFetch<unknown>("/statuses");
}

export function fcargoCalculatePrice(input: {
  from_region_id: number;
  to_region_id: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  service_ids?: number[];
}) {
  return fcargoFetch<FcargoPricingQuote>("/pricing/calculate", {
    method: "POST",
    body: input,
    scopeHint: "pricing:read",
  });
}

export function fcargoCreateOrder(
  body: FcargoCreateOrderRequest,
  idempotencyKey?: string,
) {
  return fcargoFetch<FcargoCreateOrderResult>("/orders", {
    method: "POST",
    body,
    idempotencyKey,
    scopeHint: "orders:create",
  });
}

export function fcargoListOrders() {
  return fcargoFetch<unknown>("/orders");
}

export function fcargoGetOrder(orderId: string | number) {
  return fcargoFetch<unknown>(`/orders/${encodeURIComponent(String(orderId))}`);
}

export function fcargoCancelOrder(orderId: string | number) {
  return fcargoFetch<unknown>(
    `/orders/${encodeURIComponent(String(orderId))}/cancel`,
    { method: "POST" },
  );
}

export function fcargoListPackages() {
  return fcargoFetch<unknown>("/packages");
}

export function fcargoGetPackage(packageId: string | number) {
  return fcargoFetch<unknown>(
    `/packages/${encodeURIComponent(String(packageId))}`,
  );
}

export function fcargoTrackPackage(tracking: string) {
  return fcargoFetch<unknown>(
    `/packages/${encodeURIComponent(tracking)}/track`,
  );
}

export function fcargoListRegions() {
  return fcargoFetch<unknown>("/locations/regions");
}

export function fcargoListDistricts(soato: string) {
  return fcargoFetch<unknown>(
    `/locations/regions/${encodeURIComponent(soato)}/districts`,
  );
}

export function fcargoResolveSoato(soato: string) {
  return fcargoFetch<unknown>(
    `/locations/resolve/${encodeURIComponent(soato)}`,
  );
}
