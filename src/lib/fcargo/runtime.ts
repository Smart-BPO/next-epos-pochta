/**
 * Live FCargo HTTP must not run during `next build` SSG — `cache: "no-store"`
 * throws DynamicServerError and used to flood epos_fcargo_request_log.
 * Also trip a short circuit when FCargo returns "Tenant not found".
 */

let tenantCircuitOpenUntil = 0;

export function isFcargoLiveFetchAllowed(): boolean {
  const phase = process.env.NEXT_PHASE ?? "";
  if (phase === "phase-production-build" || phase === "phase-export") {
    return false;
  }
  if (Date.now() < tenantCircuitOpenUntil) return false;
  return true;
}

export function noteFcargoTenantFailure(): void {
  // 10 min — stop calculator/log spam until CMS domain is fixed
  tenantCircuitOpenUntil = Date.now() + 10 * 60 * 1000;
}

export function clearFcargoTenantCircuit(): void {
  tenantCircuitOpenUntil = 0;
}

export function isDynamicServerBailError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest =
    "digest" in err && err.digest != null ? String(err.digest) : "";
  if (digest.includes("DYNAMIC_SERVER_USAGE")) return true;
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("Dynamic server usage");
}

export function isFcargoTenantNotFoundMessage(
  message: string | null | undefined,
): boolean {
  if (!message) return false;
  return /tenant not found/i.test(message);
}
