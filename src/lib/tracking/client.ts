import type { Locale } from "@/i18n/config";
import type { TrackingLookupResult } from "./types";
import { isValidTrackingNumber, normalizeTrackingNumber } from "./types";

/** Browser adapter for `/api/tracking/` (FCargo track, server-side). */
export async function lookupTracking(
  rawNumber: string,
  locale: Locale = "uz",
): Promise<TrackingLookupResult> {
  const number = normalizeTrackingNumber(rawNumber);
  if (!number || !isValidTrackingNumber(number)) {
    return { ok: false, error: "invalid_format" };
  }

  try {
    const qs = new URLSearchParams({ number, locale });
    const res = await fetch(`/api/tracking/?${qs.toString()}`, {
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as TrackingLookupResult | null;    if (json && typeof json.ok === "boolean") return json;
    return { ok: false, error: res.status === 404 ? "not_found" : "unavailable" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
