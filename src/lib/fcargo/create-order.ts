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

export type FcargoPartyInput = {
  name: string;
  phone: string;
  settlementId: string;
  address?: string;
};

export type CreateFcargoOrderInput = {
  externalId: string;
  idempotencyKey?: string;
  sender: FcargoPartyInput;
  receiver: FcargoPartyInput;
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  comment?: string;
  locale?: string;
  packageDescription?: string;
  /** Source tag stored on catalog row. */
  source?: "lead" | "webapp" | "pull" | "webhook";
  leadId?: string | null;
  contactSessionId?: string | null;
  telegramUserId?: number | null;
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

async function findExistingOrder(
  externalId: string,
  phone: string,
): Promise<CreatedFcargoOrder | null> {
  const list = await fcargoListOrders({
    customerPhone: phone,
    externalOrderId: externalId,
  });
  if (!list.ok) return null;
  const hit = list.data?.items?.find((o) => o.external_order_id === externalId);
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

function buildPackage(input: CreateFcargoOrderInput) {
  const pkg: FcargoCreateOrderRequest["package"] = {
    seats: 1,
    description: input.packageDescription ?? `EPOS ${input.externalId}`,
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

async function partyAddress(
  party: FcargoPartyInput,
  locale?: string,
): Promise<{
  soato: NonNullable<Awaited<ReturnType<typeof resolveSettlementSoato>>>;
  label: string;
  phone: string;
  name: string;
} | null> {
  const settlement = getSettlementById(party.settlementId);
  if (!settlement) return null;
  const phone = toFcargoPhone(party.phone);
  if (!phone) return null;
  const soato = await resolveSettlementSoato({
    settlementId: settlement.id,
    regionId: settlement.regionId,
  });
  if (!soato) return null;
  const uz = locale === "uz";
  const label =
    party.address?.trim() || (uz ? settlement.uz : settlement.ru);
  return {
    soato,
    label,
    phone,
    name: party.name.trim() || "EPOS customer",
  };
}

/**
 * Create a FCargo order. Idempotent via `external_order_id` + optional key.
 * Always upserts the local catalog mirror (secondary store).
 */
export async function createFcargoOrder(
  input: CreateFcargoOrderInput,
): Promise<
  | { ok: true; order: CreatedFcargoOrder }
  | { ok: false; skipped?: boolean; message: string }
> {
  if (!(await hasFcargoConfig())) {
    return { ok: false, skipped: true, message: "fcargo_not_configured" };
  }

  const [sender, receiver] = await Promise.all([
    partyAddress(input.sender, input.locale),
    partyAddress(input.receiver, input.locale),
  ]);
  if (!sender || !receiver) {
    return {
      ok: false,
      message: !sender && !receiver
        ? "invalid_parties"
        : !sender
          ? "invalid_sender"
          : "invalid_receiver",
    };
  }

  const body: FcargoCreateOrderRequest = {
    external_order_id: input.externalId,
    webhook_enabled: true,
    sender: {
      name: sender.name,
      phone: sender.phone,
      region_soato: sender.soato.regionSoato,
      ...(sender.soato.districtSoato
        ? { district_soato: sender.soato.districtSoato }
        : {}),
      address: sender.label,
    },
    receiver: {
      name: receiver.name,
      phone: receiver.phone,
      region_soato: receiver.soato.regionSoato,
      ...(receiver.soato.districtSoato
        ? { district_soato: receiver.soato.districtSoato }
        : {}),
      address: receiver.label,
    },
    package: buildPackage(input),
    payment: { payer_type: "sender" },
    comment: input.comment?.trim() || `EPOS ${input.externalId}`,
  };

  const idem =
    input.idempotencyKey?.trim() || `epos-${input.externalId}`;
  const result = await fcargoCreateOrder(body, idem);

  let order: CreatedFcargoOrder | null = null;
  if (result.ok) {
    order = toCreated(result.data, false);
  } else if (result.status === 409 && result.code === "DUPLICATE_EXTERNAL_ID") {
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
        : await findExistingOrder(input.externalId, sender.phone);
  }

  if (!order) {
    const message = result.ok ? "order_lookup_failed" : result.message;
    console.warn("[fcargo:order]", result.ok ? "" : result.code, message);
    return { ok: false, message };
  }

  const phones = Array.from(
    new Set([sender.phone, receiver.phone].filter(Boolean)),
  );

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
      phones,
      externalOrderId: input.externalId,
      leadId: input.leadId ?? null,
      contactSessionId: input.contactSessionId ?? null,
      fromSoato: sender.soato.districtSoato ?? sender.soato.regionSoato,
      toSoato: receiver.soato.districtSoato ?? receiver.soato.regionSoato,
      source: input.source ?? null,
      telegramUserId: input.telegramUserId ?? null,
      rawLast: {
        sender: body.sender,
        receiver: body.receiver,
      },
    });
    if (catalog) {
      if (input.contactSessionId && !catalog.contact_session_id) {
        const { setPackageContactSession } = await import(
          "@/lib/fcargo/packages-store"
        );
        await setPackageContactSession(catalog.id, input.contactSessionId);
        await linkPackageToVerifiedContact({
          ...catalog,
          contact_session_id: input.contactSessionId,
        });
      } else {
        await linkPackageToVerifiedContact(catalog);
      }
    }
  } catch (e) {
    console.warn("[fcargo:order:catalog]", e);
  }

  return { ok: true, order };
}
