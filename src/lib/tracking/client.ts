import type { TrackingLookupResult } from "./types";
import { isValidTrackingNumber, normalizeTrackingNumber } from "./types";

/**
 * Client adapter for shipment lookup.
 * TODO(tracking-api): replace stub with real EPOS tracking HTTP client.
 */
export async function lookupTracking(
  rawNumber: string,
): Promise<TrackingLookupResult> {
  const number = normalizeTrackingNumber(rawNumber);
  if (!number || !isValidTrackingNumber(number)) {
    return { ok: false, error: "invalid_format" };
  }

  // Honest stub: never invent delivery history.
  return { ok: false, error: "unavailable" };
}
