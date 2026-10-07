/** Public tracking domain (FCargo `packages:track` behind `/api/tracking/`). */

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
  /** ISO time; absent when the carrier gave no timestamp. */
  occurredAt?: string;
  location?: string;
  note?: string;
}

export interface TrackingShipment {
  number: string;
  status: TrackingStatusCode;
  statusLabel: string;
  currentLocation?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
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
  // FCargo `PKG…` codes and pre-printed barcodes (≤128, alnum + dash).
  return /^[A-Z0-9-]{6,64}$/.test(normalized);
}

export function normalizeTrackingNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}
