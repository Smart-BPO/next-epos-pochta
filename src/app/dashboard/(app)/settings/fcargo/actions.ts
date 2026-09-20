"use server";

import { revalidatePath } from "next/cache";
import { requireMutation, writeAuditLog } from "@/lib/cms/auth";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";
import {
  clearFcargoApiKey,
  markFcargoTest,
  resolveFcargoConfig,
  saveFcargoSettings,
  type FcargoMode,
} from "@/lib/fcargo/settings";
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
import { syncOpenFcargoOrders } from "@/lib/fcargo/sync-status";

function revalidate() {
  revalidatePath("/dashboard/settings/fcargo/");
  revalidatePath("/dashboard/settings/");
}

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

export type FcargoSaveState = {
  ok?: boolean;
  error?: string;
  message?: string;
  warning?: string;
} | null;

export async function saveFcargoSettingsAction(
  _prev: FcargoSaveState,
  formData: FormData,
): Promise<FcargoSaveState> {
  try {
    const admin = await requireMutation("fcargo_secrets");
    if (!hasMessagingSecretsKey()) {
      return { ok: false, error: "Master encryption key is not set" };
    }

    const enabled = String(formData.get("enabled") ?? "") === "on";
    const tenantDomain = String(formData.get("tenant_domain") ?? "").trim();
    const baseUrl = String(formData.get("base_url") ?? "").trim();
    const modeRaw = String(formData.get("mode") ?? "live").trim();
    const mode: FcargoMode = modeRaw === "test" ? "test" : "live";
    const apiKey = String(formData.get("api_key") ?? "").trim();
    const webhookSecret = String(formData.get("webhook_secret") ?? "").trim();

    if (!tenantDomain) {
      return { ok: false, error: "Tenant domain required" };
    }

    await saveFcargoSettings({
      enabled,
      tenantDomain,
      baseUrl,
      mode,
      apiKey: apiKey || null,
      webhookSecret: webhookSecret || null,
    });

    const { clearFcargoTenantCircuit } = await import("@/lib/fcargo/runtime");
    clearFcargoTenantCircuit();

    await writeAuditLog({
      actor: admin,
      action: "fcargo.settings.save",
      entityType: "fcargo_settings",
      entityId: "default",
      payload: {
        enabled,
        tenantDomain,
        mode,
        keyUpdated: Boolean(apiKey),
        webhookSecretUpdated: Boolean(webhookSecret),
      },
    });

    // Probe health so wrong X-Tenant-Domain is visible immediately.
    let warning: string | undefined;
    if (enabled) {
      const health = await withProbe("GET /health", () => fcargoHealth());
      if (health.ok) {
        await markFcargoTest(true);
      } else {
        await markFcargoTest(false, health.message);
        warning = health.message || "health_failed";
      }
    }

    revalidate();
    return { ok: true, message: "saved", warning };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "save_failed",
    };
  }
}

export async function clearFcargoApiKeyAction() {
  const admin = await requireMutation("fcargo_secrets");
  await clearFcargoApiKey();
  await writeAuditLog({
    actor: admin,
    action: "fcargo.settings.clear_key",
    entityType: "fcargo_settings",
    entityId: "default",
    payload: {},
  });
  revalidate();
}

export async function testFcargoAction() {
  await requireMutation("fcargo_secrets");
  const result = await withProbe("GET /health", () => fcargoHealth());
  if (!result.ok) {
    await markFcargoTest(false, result.message);
    revalidate();
    throw new Error(result.message || "health_failed");
  }
  await markFcargoTest(true);
  revalidate();
  return result;
}

export async function debugFcargoProbeAction(
  formData: FormData,
): Promise<FcargoDebugProbeResult> {
  await requireMutation("fcargo_secrets");
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
      const weight = Number(formData.get("weight") || 1);
      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return {
          ok: false,
          probe: "POST /pricing/calculate",
          elapsedMs: 0,
          message: "from_region_id / to_region_id required",
          data: null,
          meta: null,
        };
      }
      return withProbe("POST /pricing/calculate", () =>
        fcargoCalculatePrice({
          from_region_id: from,
          to_region_id: to,
          weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
        }),
      );
    }
    case "track": {
      const tracking = String(formData.get("tracking") ?? "").trim();
      if (!tracking) {
        return {
          ok: false,
          probe: "GET /packages/{tracking}/track",
          elapsedMs: 0,
          message: "tracking required",
          data: null,
          meta: null,
        };
      }
      return withProbe(`GET /packages/${tracking}/track`, () =>
        fcargoTrackPackage(tracking),
      );
    }
    case "order": {
      const orderId = String(formData.get("order_id") ?? "").trim();
      if (!orderId) {
        return {
          ok: false,
          probe: "GET /orders/{id}",
          elapsedMs: 0,
          message: "order_id required",
          data: null,
          meta: null,
        };
      }
      return withProbe(`GET /orders/${orderId}`, () => fcargoGetOrder(orderId));
    }
    case "resolve": {
      const soato = String(formData.get("soato") ?? "").trim();
      if (!soato) {
        return {
          ok: false,
          probe: "GET /locations/resolve/{soato}",
          elapsedMs: 0,
          message: "soato required",
          data: null,
          meta: null,
        };
      }
      return withProbe(`GET /locations/resolve/${soato}`, () =>
        fcargoResolveSoato(soato),
      );
    }
    default:
      return {
        ok: false,
        probe: probe || "unknown",
        elapsedMs: 0,
        message: "unknown probe",
        data: null,
        meta: null,
      };
  }
}

export async function syncFcargoOrdersAction(): Promise<{
  checked: number;
  updated: number;
  errors: number;
  inbox?: { claimed: number; done: number; failed: number; retried: number };
}> {
  await requireMutation("fcargo_secrets");
  const { processFcargoWebhookInbox } = await import(
    "@/lib/fcargo/webhook-inbox"
  );
  const inbox = await processFcargoWebhookInbox({ limit: 20 }).catch(() => ({
    claimed: 0,
    done: 0,
    failed: 0,
    retried: 0,
  }));
  const result = await syncOpenFcargoOrders({ limit: 40 });
  return { ...result, inbox };
}
