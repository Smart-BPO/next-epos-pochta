import "server-only";

import {
  createFcargoOrder,
  toFcargoPhone,
  type CreatedFcargoOrder,
} from "@/lib/fcargo/create-order";

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

export type { CreatedFcargoOrder };
export { toFcargoPhone };

/**
 * Creates a FCargo delivery order from a calculator lead.
 * Sender = customer (pickup contact); receiver uses same contact as placeholder
 * until the manager fills the destination contact.
 * Idempotent per lead: `external_order_id` = lead id.
 */
export async function createFcargoOrderFromLead(
  input: CreateShipmentFromLeadInput,
): Promise<
  | { ok: true; order: CreatedFcargoOrder }
  | { ok: false; skipped?: boolean; message: string }
> {
  const phone = toFcargoPhone(input.phone);
  if (!phone) return { ok: false, message: "invalid_phone" };
  const name = input.name.trim() || "EPOS customer";

  const created = await createFcargoOrder({
    externalId: input.leadId,
    idempotencyKey: `epos-lead-${input.leadId}`,
    sender: {
      name,
      phone,
      settlementId: input.fromCityId,
    },
    receiver: {
      name,
      phone,
      settlementId: input.toCityId,
    },
    weightKg: input.weightKg,
    lengthCm: input.lengthCm,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    comment:
      input.comment?.trim() ||
      `EPOS calculator lead ${input.leadId}${input.requestId ? ` / ${input.requestId}` : ""}`,
    locale: input.locale,
    packageDescription: `EPOS lead ${input.leadId}`,
    source: "lead",
    leadId: input.leadId,
  });

  if (!created.ok) return created;

  try {
    const { findFcargoOrder, upsertFcargoOrderLink } = await import(
      "@/lib/fcargo/orders-store"
    );
    const known =
      created.order.duplicate &&
      (await findFcargoOrder({ leadId: input.leadId }));
    if (!known) {
      await upsertFcargoOrderLink({
        leadId: input.leadId,
        fcargoOrderId: created.order.orderId,
        trackingNumber: created.order.trackingNumber,
        fcargoStatus: created.order.status,
        statusRaw: { source: "lead" },
      });
    }
  } catch (e) {
    console.warn("[fcargo:order:link]", e);
  }

  return created;
}
