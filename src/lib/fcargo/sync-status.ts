import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  findFcargoOrder,
  isTerminalFcargoStatus,
  listOpenFcargoOrders,
  upsertFcargoOrderLink,
} from "@/lib/fcargo/orders-store";
import { fcargoGetOrder, fcargoTrackPackage } from "@/lib/fcargo/client";

export type LeadCrmStatus = "draft" | "new" | "in_progress" | "done" | "spam";

/**
 * Map FCargo delivery status → CRM lead status.
 * Unknown statuses leave CRM unchanged.
 */
export function mapFcargoStatusToCrm(
  statusRaw: string | null | undefined,
): LeadCrmStatus | null {
  if (!statusRaw) return null;
  const s = statusRaw.trim().toLowerCase();

  if (
    /cancel|отмен|returned|возврат|lost|утер/.test(s)
  ) {
    return null; // delivery cancelled — do not auto-spam CRM
  }
  if (
    /deliver|доставл|completed|complete|done|выдач|получен/.test(s)
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
    const code = typeof o.code === "string" ? o.code : null;
    const name = typeof o.name === "string" ? o.name : null;
    const id = o.id != null ? String(o.id) : null;
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

  // Sync webapp shipment track_number if matching trek exists
  if (nextTracking) {
    const shipmentUpdate: Record<string, unknown> = {
      track_number: nextTracking,
    };
    if (mapped === "done") {
      shipmentUpdate.status = "confirmed";
    }
    await client
      .from("epos_webapp_shipments")
      .update(shipmentUpdate)
      .eq("track_number", nextTracking);
  }

  return {
    ok: true,
    leadId: lead.id,
    fcargoStatus: nextStatus,
    crmStatus: nextCrm,
  };
}

export async function syncOpenFcargoOrders(opts?: {
  limit?: number;
}): Promise<{ checked: number; updated: number; errors: number }> {
  const open = await listOpenFcargoOrders(opts?.limit ?? 40);
  let updated = 0;
  let errors = 0;

  for (const row of open) {
    try {
      let status: unknown = null;
      let tracking = row.tracking_number;
      let raw: unknown = null;

      const orderRes = await fcargoGetOrder(row.fcargo_order_id);
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
      if (result.ok && (label !== before || isTerminalFcargoStatus(label))) {
        updated += 1;
      } else if (result.ok) {
        updated += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return { checked: open.length, updated, errors };
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
