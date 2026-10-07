import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  findFcargoOrder,
  listOpenFcargoOrders,
  upsertFcargoOrderLink,
} from "@/lib/fcargo/orders-store";
import {
  fcargoGetOrder,
  fcargoTrackPackage,
  type FcargoCustomerScope,
} from "@/lib/fcargo/client";
import {
  listOpenCatalogPackages,
  normalizeUzPhone,
  upsertFcargoPackage,
} from "@/lib/fcargo/packages-store";
import { ingestFcargoWebhook } from "@/lib/fcargo/ingest";
import { linkPackageToVerifiedContact } from "@/lib/fcargo/link-contact";

export type LeadCrmStatus = "draft" | "new" | "in_progress" | "done" | "spam";

/**
 * Map FCargo delivery status → CRM lead status.
 * Unknown statuses leave CRM unchanged.
 */
const CRM_BY_FCARGO_CODE: Record<string, LeadCrmStatus | null> = {
  CREATED: "new",
  ON_HOLD: "in_progress",
  EXCEPTION: "in_progress",
  PICKUP_ASSIGNED: "in_progress",
  AWAITING_PICKUP: "in_progress",
  PICKUP_STARTED: "in_progress",
  PICKUP_FAILED: "in_progress",
  PICKED_UP: "in_progress",
  AWAITING_HANDOVER: "in_progress",
  RECEIVED_AT_ORIGIN_WAREHOUSE: "in_progress",
  REPACKED: "in_progress",
  READY_FOR_DISPATCH: "in_progress",
  IN_TRANSIT: "in_progress",
  RECEIVED_AT_HUB: "in_progress",
  ARRIVED_AT_DESTINATION_WAREHOUSE: "in_progress",
  RECEIVED_AT_DESTINATION_WAREHOUSE: "in_progress",
  DELIVERY_ASSIGNED: "in_progress",
  OUT_FOR_DELIVERY: "in_progress",
  DELIVERY_ATTEMPT_FAILED: "in_progress",
  DELIVERY_RESCHEDULED: "in_progress",
  DELIVERED: "done",
  // Problem / return / cancel flows — manager decides, CRM untouched.
  REFUSED: null,
  MISSING: null,
  DAMAGED: null,
  AWAITING_SENDER_DECISION: null,
  RETURN_RECEIVED_AT_WAREHOUSE: null,
  RETURN_IN_TRANSIT: null,
  RETURN_OUT_FOR_DELIVERY: null,
  RETURNED_TO_SENDER: null,
  CANCELLED: null,
  LOST: null,
  DISPOSED: null,
};

export function mapFcargoStatusToCrm(
  statusRaw: string | null | undefined,
): LeadCrmStatus | null {
  if (!statusRaw) return null;
  const code = statusRaw.trim().toUpperCase();
  if (code in CRM_BY_FCARGO_CODE) return CRM_BY_FCARGO_CODE[code] ?? null;

  // Legacy / localized labels (pre-code payloads).
  const s = statusRaw.trim().toLowerCase();
  if (/return|refus/.test(s)) return null;

  if (
    /cancel|отмен|returned|возврат|lost|утер/.test(s)
  ) {
    return null; // delivery cancelled — do not auto-spam CRM
  }
  if (
    /delivered|доставлен|completed|complete|done|выдан|получен/.test(s)
  ) {
    return "done";
  }
  if (
    /transit|way|склад|warehouse|picked|забор|отправл|in_progress|processing|shipped|on_the_way|в_пути|в пути/.test(
      s,
    )
  ) {
    return "in_progress";
  }
  if (
    /creat|new|draft|принят|оформ|pending|registered|зарегистр/.test(s)
  ) {
    return "new";
  }
  return null;
}

export function normalizeFcargoStatusLabel(status: unknown): string | null {
  if (status == null) return null;
  if (typeof status === "string") return status.trim() || null;
  if (typeof status === "object") {
    const o = status as Record<string, unknown>;
    const code =
      typeof o.code === "string" && o.code.trim() ? o.code.trim() : null;
    const name =
      typeof o.name === "string" && o.name.trim() ? o.name.trim() : null;
    const id = o.id != null ? String(o.id) : null;
    // Prefer stable API code over localized name (UNDEFINED → fall back to name).
    if (code && code.toUpperCase() !== "UNDEFINED") return code;
    return name || code || id;
  }
  return String(status);
}

export type ApplyFcargoStatusInput = {
  orderId?: string | number | null;
  externalOrderId?: string | null;
  tracking?: string | null;
  status?: unknown;
  raw?: unknown;
};

export type ApplyFcargoStatusResult = {
  ok: boolean;
  leadId?: string;
  fcargoStatus?: string | null;
  crmStatus?: LeadCrmStatus | null;
  message?: string;
};

function extractFromUnknown(data: unknown): {
  orderId?: string;
  tracking?: string;
  status?: unknown;
  externalOrderId?: string;
} {
  if (!data || typeof data !== "object") return {};
  const o = data as Record<string, unknown>;
  const nested =
    o.data && typeof o.data === "object"
      ? (o.data as Record<string, unknown>)
      : o;
  const orderId =
    nested.order_id ?? nested.orderId ?? nested.id ?? o.order_id ?? o.orderId;
  const tracking =
    nested.tracking_number ??
    nested.trackingNumber ??
    nested.tracking ??
    nested.barcode ??
    o.tracking_number ??
    o.barcode;
  const status = nested.status ?? o.status;
  const external =
    nested.external_order_id ??
    nested.externalOrderId ??
    o.external_order_id ??
    o.externalOrderId;
  return {
    orderId: orderId != null ? String(orderId) : undefined,
    tracking: typeof tracking === "string" ? tracking : tracking != null ? String(tracking) : undefined,
    status,
    externalOrderId:
      typeof external === "string"
        ? external
        : external != null
          ? String(external)
          : undefined,
  };
}

export async function applyFcargoStatusUpdate(
  input: ApplyFcargoStatusInput,
): Promise<ApplyFcargoStatusResult> {
  if (!hasSupabaseAdminConfig()) {
    return { ok: false, message: "db_unavailable" };
  }

  const statusLabel = normalizeFcargoStatusLabel(input.status);
  const orderId =
    input.orderId != null ? String(input.orderId) : null;
  const leadHint = input.externalOrderId?.trim() || null;
  const tracking = input.tracking?.trim() || null;

  let link = await findFcargoOrder({
    orderId,
    leadId: leadHint,
    tracking,
  });

  // Fallback: lead payload may have fcargo ids without orders row yet
  if (!link && leadHint) {
    const client = createSupabaseAdminClient();
    const { data: lead } = await client
      .from("epos_leads")
      .select("id, payload, status")
      .eq("id", leadHint)
      .maybeSingle();
    if (lead) {
      const payload =
        lead.payload && typeof lead.payload === "object"
          ? (lead.payload as Record<string, unknown>)
          : {};
      const data =
        payload.data && typeof payload.data === "object"
          ? (payload.data as Record<string, unknown>)
          : {};
      const existingOrderId =
        data.fcargoOrderId != null ? String(data.fcargoOrderId) : orderId;
      if (existingOrderId) {
        await upsertFcargoOrderLink({
          leadId: lead.id,
          fcargoOrderId: existingOrderId,
          trackingNumber:
            tracking ||
            (typeof data.fcargoTrackingNumber === "string"
              ? data.fcargoTrackingNumber
              : null),
          fcargoStatus: statusLabel,
          statusRaw: input.raw ?? input.status,
        });
        link = await findFcargoOrder({ leadId: lead.id });
      }
    }
  }

  if (!link && orderId) {
    // Try find lead by payload.fcargoOrderId
    const client = createSupabaseAdminClient();
    const { data: leads } = await client
      .from("epos_leads")
      .select("id, payload")
      .contains("payload", { data: { fcargoOrderId: orderId } })
      .limit(1);
    const lead = leads?.[0];
    if (lead) {
      await upsertFcargoOrderLink({
        leadId: lead.id,
        fcargoOrderId: orderId,
        trackingNumber: tracking,
        fcargoStatus: statusLabel,
        statusRaw: input.raw ?? input.status,
      });
      link = await findFcargoOrder({ leadId: lead.id });
    }
  }

  if (!link) {
    return { ok: false, message: "order_not_found" };
  }

  const client = createSupabaseAdminClient();
  const nextTracking = tracking || link.tracking_number;
  const nextStatus = statusLabel || link.fcargo_status;

  await upsertFcargoOrderLink({
    leadId: link.lead_id,
    fcargoOrderId: link.fcargo_order_id,
    trackingNumber: nextTracking,
    fcargoStatus: nextStatus,
    statusRaw: input.raw ?? input.status ?? link.fcargo_status_raw,
  });

  const { data: lead } = await client
    .from("epos_leads")
    .select("id, status, payload")
    .eq("id", link.lead_id)
    .maybeSingle();

  if (!lead) {
    return { ok: false, message: "lead_not_found", leadId: link.lead_id };
  }

  const prevPayload =
    lead.payload && typeof lead.payload === "object"
      ? (lead.payload as Record<string, unknown>)
      : {};
  const prevData =
    prevPayload.data && typeof prevPayload.data === "object"
      ? (prevPayload.data as Record<string, unknown>)
      : {};

  const patch = {
    fcargoOrderId: link.fcargo_order_id,
    fcargoTrackingNumber: nextTracking,
    fcargoStatus: nextStatus,
  };

  const mapped = mapFcargoStatusToCrm(nextStatus);
  const current = String(lead.status ?? "new") as LeadCrmStatus;
  let nextCrm: LeadCrmStatus | null = null;

  if (mapped) {
    // Do not reopen done/spam unless mapping is done (idempotent)
    if (current === "spam") {
      nextCrm = null;
    } else if (current === "done" && mapped !== "done") {
      nextCrm = null;
    } else if (current === "draft") {
      nextCrm = mapped === "done" ? "done" : mapped === "in_progress" ? "in_progress" : "new";
    } else {
      nextCrm = mapped;
    }
  }

  const update: Record<string, unknown> = {
    payload: {
      ...prevPayload,
      data: { ...prevData, ...patch },
    },
  };
  if (nextCrm && nextCrm !== current) {
    update.status = nextCrm;
  }

  await client.from("epos_leads").update(update).eq("id", lead.id);

  // Catalog + Mini App mirror follow the same status (linked by lead phone).
  if (nextTracking) {
    const leadPhone =
      typeof prevData.phone === "string" ? normalizeUzPhone(prevData.phone) : "";
    const catalog = await upsertFcargoPackage({
      fcargoOrderId: link.fcargo_order_id,
      trackingNumber: nextTracking,
      status: nextStatus,
      phones: leadPhone ? [leadPhone] : [],
      externalOrderId: lead.id,
      leadId: lead.id,
    });
    if (catalog) {
      await linkPackageToVerifiedContact(catalog).catch((e) => {
        console.warn("[fcargo:status:mirror]", e);
      });
    }
  }

  return {
    ok: true,
    leadId: lead.id,
    fcargoStatus: nextStatus,
    crmStatus: nextCrm,
  };
}

/**
 * FCargo order reads need `customer_id` or `customer_phone` — taken from the
 * lead payload written at order creation.
 */
async function customerScopesForLeads(
  leadIds: string[],
): Promise<Map<string, FcargoCustomerScope>> {
  const out = new Map<string, FcargoCustomerScope>();
  if (!leadIds.length || !hasSupabaseAdminConfig()) return out;
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_leads")
    .select("id, payload")
    .in("id", leadIds);
  for (const lead of data ?? []) {
    const payload =
      lead.payload && typeof lead.payload === "object"
        ? (lead.payload as Record<string, unknown>)
        : {};
    const d =
      payload.data && typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : {};
    const customerId =
      typeof d.fcargoCustomerId === "number" ? d.fcargoCustomerId : null;
    const phone =
      typeof d.phone === "string" ? normalizeUzPhone(d.phone) : "";
    if (customerId != null || phone) {
      out.set(String(lead.id), {
        customerId,
        customerPhone: phone || null,
      });
    }
  }
  return out;
}

export async function syncOpenFcargoOrders(opts?: {
  limit?: number;
}): Promise<{ checked: number; updated: number; errors: number }> {
  const limit = opts?.limit ?? 40;
  const open = await listOpenFcargoOrders(Math.ceil(limit / 2));
  const catalog = await listOpenCatalogPackages(Math.ceil(limit / 2));
  let updated = 0;
  let errors = 0;
  let checked = 0;

  const scopes = await customerScopesForLeads(open.map((r) => r.lead_id));

  for (const row of open) {
    checked += 1;
    try {
      let status: unknown = null;
      let tracking = row.tracking_number;
      let raw: unknown = null;

      const scope = scopes.get(row.lead_id);
      const orderRes = scope
        ? await fcargoGetOrder(row.fcargo_order_id, scope)
        : ({ ok: false } as const);
      if (orderRes.ok) {
        raw = orderRes.data;
        const extracted = extractFromUnknown(orderRes.data);
        status = extracted.status ?? status;
        if (extracted.tracking) tracking = extracted.tracking;
      } else if (row.tracking_number) {
        const trackRes = await fcargoTrackPackage(row.tracking_number);
        if (trackRes.ok) {
          raw = trackRes.data;
          const extracted = extractFromUnknown(trackRes.data);
          status = extracted.status ?? status;
          if (extracted.tracking) tracking = extracted.tracking;
        } else {
          errors += 1;
          continue;
        }
      } else {
        errors += 1;
        continue;
      }

      const before = row.fcargo_status;
      const label = normalizeFcargoStatusLabel(status) ?? before;
      const result = await applyFcargoStatusUpdate({
        orderId: row.fcargo_order_id,
        externalOrderId: row.lead_id,
        tracking,
        status: label,
        raw,
      });
      if (result.ok) updated += 1;
    } catch {
      errors += 1;
    }
  }

  // Catalog packages (any channel) — ingest refresh + mirror
  const seenTracking = new Set(
    open.map((r) => r.tracking_number).filter(Boolean) as string[],
  );
  for (const row of catalog) {
    if (row.tracking_number && seenTracking.has(row.tracking_number)) continue;
    checked += 1;
    try {
      if (!row.tracking_number) {
        errors += 1;
        continue;
      }
      const trackRes = await fcargoTrackPackage(row.tracking_number);
      if (!trackRes.ok) {
        errors += 1;
        continue;
      }
      const ingested = await ingestFcargoWebhook({
        event: "package.status_changed",
        data: trackRes.data,
        tracking_number: row.tracking_number,
        order_id: row.fcargo_order_id,
        external_order_id: row.external_order_id ?? row.lead_id,
      });
      if (ingested.package) updated += 1;
    } catch {
      errors += 1;
    }
  }

  return { checked, updated, errors };
}

/** Parse inbound webhook body (JSON object or form fields). */
export function parseFcargoWebhookPayload(body: unknown): ApplyFcargoStatusInput {
  if (body == null) return {};
  if (typeof body === "string") {
    try {
      return parseFcargoWebhookPayload(JSON.parse(body));
    } catch {
      return {};
    }
  }
  if (typeof body !== "object") return {};

  // form-data sometimes wraps JSON in a single string field
  const o = body as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 1 && typeof o[keys[0]!] === "string") {
    const maybe = o[keys[0]!];
    if (typeof maybe === "string" && maybe.trim().startsWith("{")) {
      try {
        return parseFcargoWebhookPayload(JSON.parse(maybe));
      } catch {
        // fall through
      }
    }
  }

  const extracted = extractFromUnknown(o);
  return {
    orderId: extracted.orderId,
    externalOrderId: extracted.externalOrderId,
    tracking: extracted.tracking,
    status: extracted.status,
    raw: o,
  };
}
