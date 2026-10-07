import "server-only";

import { getSettlementById } from "@/data/settlements";
import { soatoForSettlement, type SoatoRef } from "@/lib/fcargo/soato";

export type FullSoatoRef = SoatoRef;

/**
 * Resolve region + district SOATO for pricing / order creation.
 * Settlement ids are FCargo SOATO (or legacy uzbgeo slugs via getSettlementById).
 */
export async function resolveSettlementSoato(opts: {
  settlementId: string;
  regionId: string;
}): Promise<FullSoatoRef | null> {
  const settlement = getSettlementById(opts.settlementId);
  return soatoForSettlement({
    settlementId: settlement?.id ?? opts.settlementId,
    regionId: settlement?.regionId ?? opts.regionId,
  });
}
