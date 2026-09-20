import "server-only";

import {
  logFcargoRequest,
  pickRequestHeadersForLog,
  type FcargoLogSource,
} from "@/lib/fcargo/log";

function parseBodyForLog(raw: string | null | undefined): unknown {
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw.length > 2000 ? `${raw.slice(0, 2000)}…` : raw;
  }
}

function responseHeadersForLog(
  headers?: HeadersInit | null,
): Record<string, string> | null {
  if (!headers) return null;
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

/**
 * Full HTTP exchange log for inbound FCargo route handlers
 * (webhook / sync / drain), including early 401/503 exits.
 */
export function logFcargoHttpExchange(opts: {
  source: Extract<FcargoLogSource, "in_webhook" | "in_sync" | "in_drain">;
  request: Request;
  rawBody?: string | null;
  responseStatus: number;
  responseBody: unknown;
  responseHeaders?: HeadersInit | null;
  durationMs: number;
  ok: boolean;
  error?: string | null;
  correlationId?: string | null;
  trackingNumber?: string | null;
  orderId?: string | null;
}): void {
  const url = new URL(opts.request.url);
  const correlationId =
    opts.correlationId ??
    opts.request.headers.get("x-fcargo-event-id") ??
    opts.request.headers.get("x-fcargo-delivery-id") ??
    null;

  logFcargoRequest({
    direction: "in",
    source: opts.source,
    correlationId,
    method: opts.request.method,
    path: url.pathname,
    url: url.toString(),
    httpStatus: opts.responseStatus,
    durationMs: opts.durationMs,
    ok: opts.ok,
    orderId: opts.orderId ?? null,
    trackingNumber: opts.trackingNumber ?? null,
    requestHeaders: pickRequestHeadersForLog(opts.request),
    responseHeaders: responseHeadersForLog(opts.responseHeaders),
    requestBody: parseBodyForLog(opts.rawBody),
    responseBody: opts.responseBody,
    errorMessage: opts.error ?? null,
  });
}
