import {
  getAllCities,
  getAllDistricts,
  getAllRegions,
} from "uzbgeo";

export type SettlementLevel = "region" | "district" | "city";

export type Settlement = {
  id: string;
  regionId: string;
  level: SettlementLevel;
  ru: string;
  uz: string;
  regionRu: string;
  regionUz: string;
};

function regionLabel(region: ReturnType<typeof getAllRegions>[number]) {
  return {
    ru: region.titles.ru,
    uz: region.titles.uz,
  };
}

/** Flat searchable list: regions + districts + cities (uzbgeo). */
export const uzbekistanSettlements: Settlement[] = (() => {
  const regions = getAllRegions();
  const regionBySlug = new Map(regions.map((r) => [r.slug, r]));

  const items: Settlement[] = [];

  for (const region of regions) {
    const isCityRegion = region.category === "city";
    items.push({
      id: region.slug,
      regionId: region.slug,
      level: isCityRegion ? "city" : "region",
      ru: isCityRegion ? region.names.ru : region.titles.ru,
      uz: isCityRegion ? region.names.uz : region.titles.uz,
      regionRu: region.titles.ru,
      regionUz: region.titles.uz,
    });
  }

  for (const district of getAllDistricts()) {
    const region = regionBySlug.get(district.regionSlug);
    if (!region) continue;
    const labels = regionLabel(region);
    // Some tumans reuse the viloyat slug (e.g. "samarkand") — keep ids unique.
    const id =
      district.slug === district.regionSlug
        ? `${district.slug}_district`
        : district.slug;
    items.push({
      id,
      regionId: district.regionSlug,
      level: "district",
      ru: district.titles.ru,
      uz: district.titles.uz,
      regionRu: labels.ru,
      regionUz: labels.uz,
    });
  }

  for (const city of getAllCities()) {
    const region = regionBySlug.get(city.regionSlug);
    if (!region) continue;
    const labels = regionLabel(region);
    items.push({
      id: city.slug,
      regionId: city.regionSlug,
      level: "city",
      ru: city.names.ru,
      uz: city.names.uz,
      regionRu: labels.ru,
      regionUz: labels.uz,
    });
  }

  return items;
})();

export function getSettlementById(id: string): Settlement | undefined {
  return uzbekistanSettlements.find((s) => s.id === id);
}

export function settlementLabel(
  settlement: Settlement,
  locale: "ru" | "uz",
): string {
  return locale === "uz" ? settlement.uz : settlement.ru;
}

/** @deprecated Prefer uzbekistanSettlements — kept for geo search / quick chips. */
export const uzbekistanCities = uzbekistanSettlements.filter(
  (s) => s.level === "city",
);
