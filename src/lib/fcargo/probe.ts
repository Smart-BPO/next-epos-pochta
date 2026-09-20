import "server-only";

import { resolveFcargoConfig } from "@/lib/fcargo/settings";
import {
  fcargoCalculatePrice,
  fcargoGetOrder,
  fcargoHealth,
  fcargoListOrders,
  fcargoListPackages,
  fcargoListRegions,
  fcargoListStatuses,
  fcargoResolveSoato,
  fcargoTrackPackage,
} from "@/lib/fcargo/client";

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

  switch (probe) {
    case "health":
      return withProbe("GET /health", () => fcargoHealth());
    case "statuses":
      return withProbe("GET /statuses", () => fcargoListStatuses());
    case "regions":
      return withProbe("GET /locations/regions", () => fcargoListRegions());
    case "orders":
      return withProbe("GET /orders", () => fcargoListOrders());
    case "packages":
      return withProbe("GET /packages", () => fcargoListPackages());
    case "pricing": {
      const from = Number(formData.get("from_region_id"));
      const to = Number(formData.get("to_region_id"));
      const modeRaw = String(formData.get("pricing_mode") ?? "both").trim();
      const mode =
        modeRaw === "weight" || modeRaw === "dims" || modeRaw === "both"
          ? modeRaw
          : "both";
      const weight = Number(formData.get("weight") || 0);
      const length = Number(formData.get("length") || 0);
      const width = Number(formData.get("width") || 0);
      const height = Number(formData.get("height") || 0);
      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return fail(
          "POST /pricing/calculate",
          "from_region_id / to_region_id required",
        );
      }

      const body: {
        from_region_id: number;
        to_region_id: number;
        weight?: number;
        length?: number;
        width?: number;
        height?: number;
      } = {
        from_region_id: from,
        to_region_id: to,
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
      return withProbe(`GET /orders/${orderId}`, () => fcargoGetOrder(orderId));
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
