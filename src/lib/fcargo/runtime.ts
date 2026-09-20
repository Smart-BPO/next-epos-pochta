/**
 * Live FCargo HTTP must not run during `next build` SSG — `cache: "no-store"`
 * throws DynamicServerError and used to flood epos_fcargo_request_log.
 */
export function isFcargoLiveFetchAllowed(): boolean {
  const phase = process.env.NEXT_PHASE ?? "";
  if (phase === "phase-production-build" || phase === "phase-export") {
    return false;
  }
  return true;
}

export function isDynamicServerBailError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest =
    "digest" in err && err.digest != null ? String(err.digest) : "";
  if (digest.includes("DYNAMIC_SERVER_USAGE")) return true;
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("Dynamic server usage");
}
