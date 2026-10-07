import "server-only";

import { resolveFcargoConfig } from "@/lib/fcargo/settings";
import {
  fcargoCalculatePrice,
  fcargoGetOrder,
  fcargoListOrders,
  fcargoListPackages,
  fcargoListRegions,
  fcargoListStatuses,
  fcargoResolveSoato,
  fcargoTrackPackage,
} from "@/lib/fcargo/client";
import { normalizeUzPhone } from "@/lib/fcargo/packages-store";
import type { FcargoPricingRequest } from "@/lib/fcargo/types";

export type FcargoDebugProbeResult = {
  ok: boolean;
  probe: string;
  elapsedMs: number;
  status?: number;
  code?: string;
  message?: string;
  requestId?: string;
  /** Sanitized JSON — never includes API key */
  data: unknown;
  meta: {
    tenantDomain: string;
    baseUrl: string;
    mode: string;
    source: string;
  } | null;
};

async function withProbe(
  probe: string,
  run: () => Promise<
    | { ok: true; data: unknown; requestId?: string }
    | {
        ok: false;
        code: string;
        message: string;
        status: number;
        details?: unknown;
      }
  >,
): Promise<FcargoDebugProbeResult> {
  const started = Date.now();
  const cfg = await resolveFcargoConfig();
  const meta = cfg
    ? {
        tenantDomain: cfg.tenantDomain,
        baseUrl: cfg.baseUrl,
        mode: cfg.mode,
        source: cfg.source,
      }
    : null;

  const result = await run();
  const elapsedMs = Date.now() - started;

  if (result.ok) {
    return {
      ok: true,
      probe,
      elapsedMs,
      requestId: result.requestId,
      data: result.data,
      meta,
    };
  }

  return {
    ok: false,
    probe,
    elapsedMs,
    status: result.status,
    code: result.code,
    message: result.message,
    data: result.details ?? null,
    meta,
  };
}

function fail(
  probe: string,
  message: string,
): FcargoDebugProbeResult {
  return {
    ok: false,
    probe,
    elapsedMs: 0,
    message,
    data: null,
    meta: null,
  };
}

/** Run a CMS FCargo debug probe from FormData fields. */
export async function runFcargoDebugProbe(
  formData: FormData,
): Promise<FcargoDebugProbeResult> {
  const { clearFcargoTenantCircuit } = await import("@/lib/fcargo/runtime");
  clearFcargoTenantCircuit();

  const probe = String(formData.get("probe") ?? "").trim();
  const customerPhone =
    normalizeUzPhone(String(formData.get("customer_phone") ?? "")) || null;
  const scope = customerPhone ? { customerPhone } : undefined;
  const needsCustomer = (name: string) =>
    fail(name, "customer phone required (FCargo: customer_phone or customer_id)");

  switch (probe) {
    case "health":
      // GET /health rejects company-scoped keys (FORBIDDEN_COMPANY_KEY).
      // Client keys: use regions as connectivity check.
      return withProbe("GET /locations/regions (connectivity)", () =>
        fcargoListRegions(),
      );
    case "statuses":
      return withProbe("GET /statuses", () => fcargoListStatuses());
    case "regions":
      return withProbe("GET /locations/regions", () => fcargoListRegions());
    case "orders":
      if (!scope) return needsCustomer("GET /orders");
      return withProbe("GET /orders", () => fcargoListOrders(scope));
    case "packages":
      if (!scope) return needsCustomer("GET /packages");
      return withProbe("GET /packages", () => fcargoListPackages(scope));
    case "pricing": {
      const from = String(formData.get("from_region_id") ?? "").trim();
      const to = String(formData.get("to_region_id") ?? "").trim();
      const modeRaw = String(formData.get("pricing_mode") ?? "both").trim();
      const mode =
        modeRaw === "weight" || modeRaw === "dims" || modeRaw === "both"
          ? modeRaw
          : "both";
      const weight = Number(formData.get("weight") || 0);
      const length = Number(formData.get("length") || 0);
      const width = Number(formData.get("width") || 0);
      const height = Number(formData.get("height") || 0);
      if (!/^\d{4}$/.test(from) || !/^\d{4}$/.test(to)) {
        return fail(
          "POST /pricing/calculate",
          "region SOATO (4 digits) required for from / to",
        );
      }

      const body: FcargoPricingRequest = {
        from_region_soato: from,
        to_region_soato: to,
      };

      const hasWeight = Number.isFinite(weight) && weight > 0;
      const hasDims =
        Number.isFinite(length) &&
        length > 0 &&
        Number.isFinite(width) &&
        width > 0 &&
        Number.isFinite(height) &&
        height > 0;

      if (mode === "weight" || mode === "both") {
        if (!hasWeight) {
          return fail("POST /pricing/calculate", "weight required");
        }
        body.weight = weight;
      }
      if (mode === "dims" || mode === "both") {
        if (!hasDims) {
          return fail(
            "POST /pricing/calculate",
            "length, width, height required",
          );
        }
        body.length = length;
        body.width = width;
        body.height = height;
      }

      return withProbe(`POST /pricing/calculate (${mode})`, () =>
        fcargoCalculatePrice(body),
      );
    }
    case "track": {
      const tracking = String(formData.get("tracking") ?? "").trim();
      if (!tracking) {
        return fail("GET /packages/{tracking}/track", "tracking required");
      }
      return withProbe(`GET /packages/${tracking}/track`, () =>
        fcargoTrackPackage(tracking),
      );
    }
    case "order": {
      const orderId = String(formData.get("order_id") ?? "").trim();
      if (!orderId) {
        return fail("GET /orders/{id}", "order_id required");
      }
      if (!scope) return needsCustomer(`GET /orders/${orderId}`);
      return withProbe(`GET /orders/${orderId}`, () =>
        fcargoGetOrder(orderId, scope),
      );
    }
    case "resolve": {
      const soato = String(formData.get("soato") ?? "").trim();
      if (!soato) {
        return fail("GET /locations/resolve/{soato}", "soato required");
      }
      return withProbe(`GET /locations/resolve/${soato}`, () =>
        fcargoResolveSoato(soato),
      );
    }
    default:
      return fail(probe || "unknown", "unknown probe");
  }
}
