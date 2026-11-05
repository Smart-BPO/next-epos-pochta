export type FcargoLogDirection = "out" | "in";

export type FcargoLogSource =
  | "out_api"
  | "in_webhook"
  | "in_sync"
  | "in_drain"
  | "inbox_worker";

export type FcargoLogEntry = {
  direction: FcargoLogDirection;
  source: FcargoLogSource;
  correlationId?: string | null;
  method?: string;
  path?: string;
  url?: string | null;
  httpStatus?: number | null;
  durationMs?: number | null;
  ok?: boolean | null;
  leadId?: string | null;
  orderId?: string | null;
  trackingNumber?: string | null;
  requestHeaders?: Record<string, string> | null;
  responseHeaders?: Record<string, string> | null;
  requestBody?: unknown;
  responseBody?: unknown;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type FcargoLogRow = {
  id: string;
  direction: string;
  source?: string | null;
  correlation_id?: string | null;
  method: string;
  path: string;
  url?: string | null;
  http_status: number | null;
  duration_ms: number | null;
  ok: boolean | null;
  lead_id: string | null;
  order_id: string | null;
  tracking_number: string | null;
  error_message: string | null;
  created_at: string;
  request_headers?: Record<string, string> | null;
  response_headers?: Record<string, string> | null;
  request_body?: unknown;
  response_body?: unknown;
};
