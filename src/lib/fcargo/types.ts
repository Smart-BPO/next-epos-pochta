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
  masterKeyOk: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
  runtimeSource: "cms" | "env" | "none";
};
