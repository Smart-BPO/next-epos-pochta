import { getSettlementById, legacySlugToSoato } from "@/data/settlements";

export type SoatoRef = {
  regionSoato: string;
  /** SOATO as integer (legacy; not valid as pricing `from_region_id`). */
  regionIdNum: number;
  /** District SOATO when the settlement is a district / city, else omitted. */
  districtSoato?: string;
};

/**
 * Resolve FCargo SOATO for a calculator / Mini App settlement id
 * (SOATO string or legacy uzbgeo slug).
 */
export function soatoForSettlement(opts: {
  settlementId: string;
  regionId?: string;
}): SoatoRef | null {
  const settlement = getSettlementById(opts.settlementId);
  if (!settlement) {
    const soato = legacySlugToSoato(opts.settlementId);
    if (!soato) return null;
    return soatoRefFromCodes(soato, opts.regionId);
  }
  return soatoRefFromCodes(settlement.id, settlement.regionId);
}

function soatoRefFromCodes(
  soato: string,
  regionSoatoHint?: string,
): SoatoRef | null {
  const regionSoato =
    regionSoatoHint && /^\d{4}$/.test(regionSoatoHint)
      ? regionSoatoHint
      : soato.length === 4
        ? soato
        : soato.slice(0, 4);
  if (!/^\d{4}$/.test(regionSoato)) return null;
  const regionIdNum = Number(regionSoato);
  if (!Number.isFinite(regionIdNum)) return null;
  if (soato.length > 4 && /^\d{7}$/.test(soato)) {
    return { regionSoato, regionIdNum, districtSoato: soato };
  }
  return { regionSoato, regionIdNum };
}

/** @deprecated Prefer soatoForSettlement — kept for rare region-only callers. */
export function soatoForRegionSlug(regionId: string): SoatoRef | null {
  return soatoForSettlement({ settlementId: regionId, regionId });
}
