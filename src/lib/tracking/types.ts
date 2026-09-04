/** Tracking domain types from product TZ — ready for TODO(tracking-api). */

export type TrackingStatusCode =
  | "created"
  | "accepted"
  | "in_transit"
  | "out_for_delivery"
  | "delivery_attempt"
  | "delivered"
  | "returned"
  | "cancelled"
  | "unknown";

export interface TrackingEvent {
  code: TrackingStatusCode;
  label: string;
  occurredAt: string;
  location?: string;
  note?: string;
}

export interface TrackingShipment {
  number: string;
  status: TrackingStatusCode;
  events: TrackingEvent[];
  updatedAt: string;
}

export interface TrackingLookupResult {
  ok: boolean;
  shipment?: TrackingShipment;
  error?: "invalid_format" | "not_found" | "unavailable" | "rate_limited";
}

export function isValidTrackingNumber(value: string): boolean {
  const normalized = value.trim().toUpperCase();
  // Accept EP-… style and alphanumeric track codes 6–32 chars until API schema is fixed.
  return /^[A-Z0-9-]{6,32}$/.test(normalized);
}

export function normalizeTrackingNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}
