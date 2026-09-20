/**
 * Live FCargo HTTP must not run during `next build` SSG — `cache: "no-store"`
 * throws DynamicServerError and used to flood epos_fcargo_request_log.
 *
 * Tenant circuit only blocks *public* estimate path (calculator / delivery hubs),
 * never CMS probes on /dashboard/settings/fcargo/test/.
 */

let tenantCircuitOpenUntil = 0;

/** True during next build / export — no live HTTP at all. */
export function isFcargoBuildPhase(): boolean {
  const phase = process.env.NEXT_PHASE ?? "";
  return phase === "phase-production-build" || phase === "phase-export";
}

/**
 * @deprecated Prefer isFcargoBuildPhase + isFcargoTenantCircuitOpen.
 * Kept for callers that meant "may call outbound HTTP" (build-only).
 */
export function isFcargoLiveFetchAllowed(): boolean {
  return !isFcargoBuildPhase();
}

export function isFcargoTenantCircuitOpen(): boolean {
  return Date.now() < tenantCircuitOpenUntil;
}

export function noteFcargoTenantFailure(): void {
  // 10 min — stop public calculator spam until CMS domain is fixed
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
