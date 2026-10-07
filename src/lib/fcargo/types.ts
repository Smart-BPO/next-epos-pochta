/** FCargo Client API types (subset used by EPOS). */

export type FcargoEnvelope<T> = {
  success: boolean;
  data: T | null;
  message?: string | null;
  request_id?: string;
};

export type FcargoErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
  request_id?: string;
};

export type FcargoPricingQuote = {
  from_region_id: number;
  to_region_id: number;
  weight: number;
  volumetric_weight?: number;
  billable_weight?: number;
  base_price: number;
  services_price?: number;
  discount?: number;
  total: number;
  currency?: string;
  tariff_source?: string;
  eta_days?: number;
  eta_min?: number;
  eta_max?: number;
};

/**
 * POST /pricing/calculate. Prefer `*_region_soato` strings — integer
 * `*_region_id` are FCargo internal ids, not SOATO, and quote a different
 * route than Create Order resolves.
 */
export type FcargoPricingRequest = {
  from_region_id?: number;
  to_region_id?: number;
  from_region_soato?: string;
  to_region_soato?: string;
  from_district_soato?: string;
  to_district_soato?: string;
  sender_phone?: string;
  receiver_phone?: string;
  declared_value?: number;
  is_insured?: boolean;
  payment_type_id?: number;
  /** Omit when quoting by dimensions only (OpenAPI: weight XOR L×W×H). */
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  service_ids?: number[];
};

export type FcargoStatusRef = {
  id?: number;
  code?: string;
  name?: string;
};

export type FcargoPage<T> = {
  items: T[];
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

export type FcargoOrderSummary = {
  order_id: number;
  external_order_id?: string | null;
  tracking_number: string;
  status?: FcargoStatusRef;
  price?: number;
  currency?: string;
  created_at?: string;
};

export type FcargoOrderDetail = {
  id: number;
  tracking_number: string;
  external_order_id?: string | null;
  status?: FcargoStatusRef;
  is_terminal?: boolean;
  current_branch?: string | null;
  price?: number;
  currency?: string;
  payment_status?: string;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  timeline?: unknown[];
  [key: string]: unknown;
};

export type FcargoParty = {
  name: string;
  phone: string;
  region_soato: string;
  district_soato?: string;
  branch_id?: number;
  address?: string;
  /** Legacy OpenAPI fields — prefer SOATO. */
  region_id?: number;
  district_id?: number;
};

export type FcargoPackageInput = {
  barcode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  seats?: number;
  description?: string;
  declared_value?: number;
  is_fragile?: boolean;
  requires_signature?: boolean;
  is_insured?: boolean;
};

export type FcargoCreateOrderRequest = {
  external_order_id?: string;
  webhook_enabled?: boolean;
  sender: FcargoParty;
  receiver: FcargoParty;
  package: FcargoPackageInput;
  payment?: {
    payer_type?: "sender" | "receiver" | "third_party";
    payment_type_id?: number;
    cod_amount?: number;
  };
  comment?: string;
};

export type FcargoCreateOrderResult = {
  order_id: number | string;
  tracking_number: string;
  barcode?: string | null;
  sender_customer_id?: number | null;
  receiver_customer_id?: number | null;
  price?: number;
  total_price?: number;
  currency?: string;
  status?: { code?: string; name?: string } | string;
  [key: string]: unknown;
};

export type FcargoResult<T> =
  | { ok: true; data: T; requestId?: string }
  | { ok: false; code: string; message: string; status: number; details?: unknown };

/** CMS settings view (safe for Client Components — no secrets). */
export type FcargoMode = "test" | "live";

export type FcargoSettingsView = {
  enabled: boolean;
  tenantDomain: string;
  baseUrl: string;
  mode: FcargoMode;
  hasSecrets: boolean;
  secretsHint: string;
  hasWebhookSecret: boolean;
  webhookSecretHint: string;
  masterKeyOk: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
  runtimeSource: "cms" | "env" | "none";
};
