import "server-only";

import {
  fcargoCreateOrder,
  fcargoListOrders,
  hasFcargoConfig,
} from "@/lib/fcargo/client";
import { resolveSettlementSoato } from "@/lib/fcargo/locations";
import { normalizeUzPhone } from "@/lib/fcargo/packages-store";
import { getSettlementById } from "@/data/settlements";
import type {
  FcargoCreateOrderRequest,
  FcargoCreateOrderResult,
} from "@/lib/fcargo/types";

export type CreateShipmentFromLeadInput = {
  leadId: string;
  requestId?: string;
  name: string;
  phone: string;
  fromCityId: string;
  toCityId: string;
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  comment?: string;
  locale?: string;
};

export type CreatedFcargoOrder = {
  orderId: string;
  trackingNumber: string;
  status: string | null;
  customerId: number | null;
  /** Tariff price from FCargo — internal, manager confirms the final price. */
  price: number | null;
  currency: string | null;
  duplicate: boolean;
};

/** FCargo wants +998XXXXXXXXX; anything else is rejected before the call. */
export function toFcargoPhone(raw: string): string | null {
  const phone = normalizeUzPhone(raw);
  return /^\+998\d{9}$/.test(phone) ? phone : null;
}

function statusCode(status: FcargoCreateOrderResult["status"]): string | null {
  if (typeof status === "string") return status || null;
  if (status && typeof status === "object") {
    return status.code || status.name || null;
  }
  return null;
}

function toCreated(
  order: FcargoCreateOrderResult,
  duplicate: boolean,
): CreatedFcargoOrder {
  const price = Number(order.total_price ?? order.price);
  return {
    orderId: String(order.order_id),
    trackingNumber: order.tracking_number,
    status: statusCode(order.status),
    customerId:
      typeof order.sender_customer_id === "number"
        ? order.sender_customer_id
        : null,
    price: Number.isFinite(price) && price > 0 ? price : null,
    currency: typeof order.currency === "string" ? order.currency : null,
    duplicate,
  };
}

/** Same lead re-submitted → FCargo answers 409 DUPLICATE_EXTERNAL_ID. */
async function findExistingOrder(
  leadId: string,
  phone: string,
): Promise<CreatedFcargoOrder | null> {
  const list = await fcargoListOrders({
    customerPhone: phone,
    externalOrderId: leadId,
  });
  if (!list.ok) return null;
  const hit = list.data?.items?.find((o) => o.external_order_id === leadId);
  if (!hit) return null;
  return toCreated(
    {
      order_id: hit.order_id,
      tracking_number: hit.tracking_number,
      status: hit.status,
      price: hit.price,
      currency: hit.currency,
    },
    true,
  );
}

function buildPackage(input: CreateShipmentFromLeadInput) {
  const pkg: FcargoCreateOrderRequest["package"] = {
    seats: 1,
    description: `EPOS lead ${input.leadId}`,
  };
  if (input.weightKg && input.weightKg > 0) pkg.weight = input.weightKg;
  const hasDims =
    Boolean(input.lengthCm && input.lengthCm > 0) &&
    Boolean(input.widthCm && input.widthCm > 0) &&
    Boolean(input.heightCm && input.heightCm > 0);
  if (hasDims) {
    pkg.length = input.lengthCm!;
    pkg.width = input.widthCm!;
    pkg.height = input.heightCm!;
  }
  if (!pkg.weight && !hasDims) pkg.weight = 1;
  return pkg;
}

/**
 * Creates a FCargo delivery order from a calculator lead.
 * Sender = customer (pickup contact); receiver uses same contact as placeholder
 * until the manager fills the destination contact — addresses are settlement
 * labels, SOATO resolves the branch / tariff.
 * Idempotent per lead: `external_order_id` = lead id.
 */
export async function createFcargoOrderFromLead(
  input: CreateShipmentFromLeadInput,
): Promise<
  | { ok: true; order: CreatedFcargoOrder }
  | { ok: false; skipped?: boolean; message: string }
> {
  if (!(await hasFcargoConfig())) {
    return { ok: false, skipped: true, message: "fcargo_not_configured" };
  }

  const from = getSettlementById(input.fromCityId);
  const to = getSettlementById(input.toCityId);
  if (!from || !to) {
    return { ok: false, message: "invalid_settlements" };
  }

  const phone = toFcargoPhone(input.phone);
  if (!phone) return { ok: false, message: "invalid_phone" };

  const [fromSoato, toSoato] = await Promise.all([
    resolveSettlementSoato({ settlementId: from.id, regionId: from.regionId }),
    resolveSettlementSoato({ settlementId: to.id, regionId: to.regionId }),
  ]);
  if (!fromSoato || !toSoato) {
    return { ok: false, message: "soato_unmapped" };
  }

  const uz = input.locale === "uz";
  const fromLabel = uz ? from.uz : from.ru;
  const toLabel = uz ? to.uz : to.ru;
  const name = input.name.trim() || "EPOS customer";

  const body: FcargoCreateOrderRequest = {
    external_order_id: input.leadId,
    webhook_enabled: true,
    sender: {
      name,
      phone,
      region_soato: fromSoato.regionSoato,
      ...(fromSoato.districtSoato
        ? { district_soato: fromSoato.districtSoato }
        : {}),
      address: fromLabel,
    },
    receiver: {
      name,
      phone,
      region_soato: toSoato.regionSoato,
      ...(toSoato.districtSoato
        ? { district_soato: toSoato.districtSoato }
        : {}),
      address: toLabel,
    },
    package: buildPackage(input),
    payment: { payer_type: "sender" },
    comment:
      input.comment?.trim() ||
      `EPOS calculator lead ${input.leadId}${input.requestId ? ` / ${input.requestId}` : ""}`,
  };

  const result = await fcargoCreateOrder(body, `epos-lead-${input.leadId}`);

  let order: CreatedFcargoOrder | null = null;
  if (result.ok) {
    order = toCreated(result.data, false);
  } else if (
    result.status === 409 &&
    result.code === "DUPLICATE_EXTERNAL_ID"
  ) {
    const details =
      result.details && typeof result.details === "object"
        ? (result.details as Record<string, unknown>)
        : {};
    order =
      details.order_id != null && typeof details.tracking_number === "string"
        ? toCreated(
            {
              order_id: details.order_id as number | string,
              tracking_number: details.tracking_number,
            },
            true,
          )
        : await findExistingOrder(input.leadId, phone);
  }

  if (!order) {
    const message = result.ok ? "order_lookup_failed" : result.message;
    console.warn("[fcargo:order]", result.ok ? "" : result.code, message);
    return { ok: false, message };
  }

  try {
    const { findFcargoOrder, upsertFcargoOrderLink } = await import(
      "@/lib/fcargo/orders-store"
    );
    const known =
      order.duplicate && (await findFcargoOrder({ leadId: input.leadId }));
    if (!known) await upsertFcargoOrderLink({
      leadId: input.leadId,
      fcargoOrderId: order.orderId,
      trackingNumber: order.trackingNumber,
      fcargoStatus: order.status,
      statusRaw: result.ok ? result.data : { duplicate: true },
    });
  } catch (e) {
    console.warn("[fcargo:order:link]", e);
  }

  try {
    const { upsertFcargoPackage } = await import("@/lib/fcargo/packages-store");
    const { linkPackageToVerifiedContact } = await import(
      "@/lib/fcargo/link-contact"
    );
    const catalog = await upsertFcargoPackage({
      fcargoOrderId: order.orderId,
      trackingNumber: order.trackingNumber,
      status: order.status,
      eventType: "order.created",
      phones: [phone],
      externalOrderId: input.leadId,
      leadId: input.leadId,
      rawLast: { sender: body.sender, receiver: body.receiver },
    });
    if (catalog) await linkPackageToVerifiedContact(catalog);
  } catch (e) {
    console.warn("[fcargo:order:catalog]", e);
  }

  return { ok: true, order };
}
