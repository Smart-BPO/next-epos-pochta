"use server";

import { revalidatePath } from "next/cache";
import { requireMutation, writeAuditLog } from "@/lib/cms/auth";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";
import {
  clearFcargoApiKey,
  markFcargoTest,
  saveFcargoSettings,
  type FcargoMode,
} from "@/lib/fcargo/settings";
import { syncOpenFcargoOrders } from "@/lib/fcargo/sync-status";
import { runFcargoDebugProbe } from "@/lib/fcargo/probe";

export type { FcargoDebugProbeResult } from "@/lib/fcargo/probe";

function revalidate() {
  revalidatePath("/dashboard/settings/fcargo/");
  revalidatePath("/dashboard/settings/");
}

export type FcargoSaveState = {
  ok?: boolean;
  error?: string;
  message?: string;
  warning?: string;
} | null;

async function withRegionsProbe() {
  const fd = new FormData();
  fd.set("probe", "regions");
  return runFcargoDebugProbe(fd);
}

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

    // Connectivity: /health often rejects company-scoped keys (FORBIDDEN_COMPANY_KEY).
    // Prefer locations list — same auth path as pricing/orders.
    let warning: string | undefined;
    if (enabled) {
      const probe = await withRegionsProbe();
      if (probe.ok) {
        await markFcargoTest(true);
      } else {
        await markFcargoTest(false, probe.message);
        warning = probe.message || "regions_failed";
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
  const { clearFcargoTenantCircuit } = await import("@/lib/fcargo/runtime");
  clearFcargoTenantCircuit();
  const result = await withRegionsProbe();
  if (!result.ok) {
    await markFcargoTest(false, result.message);
    revalidate();
    throw new Error(result.message || "regions_failed");
  }
  await markFcargoTest(true);
  revalidate();
  return result;
}

/** @deprecated Prefer POST /api/dashboard/fcargo/probe/ (avoids Hostinger page POST 404). */
export async function debugFcargoProbeAction(formData: FormData) {
  await requireMutation("fcargo_secrets");
  return runFcargoDebugProbe(formData);
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
