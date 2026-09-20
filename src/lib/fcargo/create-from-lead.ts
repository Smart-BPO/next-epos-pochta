import "server-only";

import { fcargoCreateOrder, hasFcargoConfig } from "@/lib/fcargo/client";
import { soatoForSettlement } from "@/lib/fcargo/soato";
import { getSettlementById } from "@/data/settlements";
import type { FcargoCreateOrderResult } from "@/lib/fcargo/types";

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

/**
 * Creates a FCargo delivery order from a calculator lead.
 * Sender = customer (pickup contact); receiver uses same contact as placeholder
 * until manager fills destination contact — address lines use settlement labels.
 */
export async function createFcargoOrderFromLead(
  input: CreateShipmentFromLeadInput,
): Promise<
  | { ok: true; order: FcargoCreateOrderResult }
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

  const fromSoato = soatoForSettlement({
    settlementId: from.id,
    regionId: from.regionId,
  });
  const toSoato = soatoForSettlement({
    settlementId: to.id,
    regionId: to.regionId,
  });
  if (!fromSoato || !toSoato) {
    return { ok: false, message: "soato_unmapped" };
  }

  const uz = input.locale === "uz";
  const fromLabel = uz ? from.uz : from.ru;
  const toLabel = uz ? to.uz : to.ru;
  const name = input.name.trim() || "EPOS customer";
  const phone = input.phone.trim();
  if (!phone) return { ok: false, message: "phone_required" };

  const pkg: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    seats: number;
    description: string;
  } = {
    seats: 1,
    description: `EPOS lead ${input.leadId}`,
  };
  if (input.weightKg && input.weightKg > 0) pkg.weight = input.weightKg;
  if (input.lengthCm && input.lengthCm > 0) pkg.length = input.lengthCm;
  if (input.widthCm && input.widthCm > 0) pkg.width = input.widthCm;
  if (input.heightCm && input.heightCm > 0) pkg.height = input.heightCm;
  if (!pkg.weight && !(pkg.length && pkg.width && pkg.height)) {
    pkg.weight = 1;
  }

  const result = await fcargoCreateOrder(
    {
      external_order_id: input.leadId,
      sender: {
        name,
        phone,
        region_soato: fromSoato.regionSoato,
        address: fromLabel,
      },
      receiver: {
        name,
        phone,
        region_soato: toSoato.regionSoato,
        address: toLabel,
      },
      package: pkg,
      payment: { payer_type: "sender" },
      comment:
        input.comment?.trim() ||
        `EPOS calculator lead ${input.leadId}${input.requestId ? ` / ${input.requestId}` : ""}`,
    },
    input.leadId,
  );

  if (!result.ok) {
    console.warn("[fcargo:order]", result.code, result.message);
    return { ok: false, message: result.message };
  }

  return { ok: true, order: result.data };
}
