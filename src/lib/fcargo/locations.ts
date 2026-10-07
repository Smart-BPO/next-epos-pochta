import "server-only";

import { getAllCities, getAllDistricts } from "uzbgeo";
import { getSettlementById } from "@/data/settlements";
import { fcargoListRegions } from "@/lib/fcargo/client";
import { soatoForSettlement, type SoatoRef } from "@/lib/fcargo/soato";

type FcargoDistrict = { soato_code: string; name: string };
type FcargoRegion = {
  soato_code: string;
  name: string;
  districts?: FcargoDistrict[];
};

const REGIONS_TTL_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAIL_MS = 5 * 60 * 1000;

let cache: {
  at: number;
  byRegion: Map<string, Map<string, string>>;
} | null = null;
let failedAt = 0;
let inflight: Promise<Map<string, Map<string, string>> | null> | null = null;

/**
 * Loose key so uzbgeo and FCargo spellings meet: drop apostrophes / dots /
 * spaces, fold h→x and q→k ("Shayxontoxur" ≈ "Shayxontohur",
 * "Ellikkala" ≈ "Ellikqal'a").
 */
export function looseLocationKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/sharof\s+rashidov/g, "sh.rashidov")
    .replace(/[^a-z]/g, "")
    .replace(/h/g, "x")
    .replace(/q/g, "k");
}

async function loadDistrictIndex(): Promise<Map<
  string,
  Map<string, string>
> | null> {
  const now = Date.now();
  if (cache && now - cache.at < REGIONS_TTL_MS) return cache.byRegion;
  if (!cache && failedAt && now - failedAt < RETRY_AFTER_FAIL_MS) return null;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fcargoListRegions();
    if (!res.ok || !Array.isArray(res.data)) {
      failedAt = Date.now();
      return cache?.byRegion ?? null;
    }
    const byRegion = new Map<string, Map<string, string>>();
    for (const region of res.data as FcargoRegion[]) {
      const districts = new Map<string, string>();
      for (const d of region.districts ?? []) {
        if (d?.soato_code && d?.name) {
          districts.set(looseLocationKey(d.name), d.soato_code);
        }
      }
      byRegion.set(String(region.soato_code), districts);
    }
    cache = { at: Date.now(), byRegion };
    return byRegion;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

const districtsBySlug = new Map(getAllDistricts().map((d) => [d.slug, d]));
const citiesBySlug = new Map(getAllCities().map((c) => [c.slug, c]));

/** uzbgeo names to try against FCargo district list, most specific first. */
function districtCandidates(settlementId: string): string[] {
  const city = citiesBySlug.get(settlementId);
  if (city) {
    const out = [`${city.names.uz} shahri`, city.titles.uz];
    // District-centre towns are not separate FCargo districts → parent tuman.
    const parent = city.districtSlug
      ? districtsBySlug.get(city.districtSlug)
      : undefined;
    if (parent) out.push(parent.titles.uz);
    return out;
  }
  const districtSlug = settlementId.endsWith("_district")
    ? settlementId.slice(0, -"_district".length)
    : settlementId;
  const district = districtsBySlug.get(districtSlug);
  return district ? [district.titles.uz] : [];
}

export type FullSoatoRef = SoatoRef & { districtSoato?: string };

/**
 * Region SOATO (static map) + district SOATO matched by name against FCargo
 * `/locations/regions` (cached 24h). District is best-effort: when the lookup
 * fails the region alone is still a valid order / pricing address.
 */
export async function resolveSettlementSoato(opts: {
  settlementId: string;
  regionId: string;
}): Promise<FullSoatoRef | null> {
  const region = soatoForSettlement(opts);
  if (!region) return null;
  // Region slugs collide with same-named tumans ("samarkand") — whole region
  // means no district.
  if (getSettlementById(opts.settlementId)?.level === "region") return region;

  const candidates = districtCandidates(opts.settlementId);
  if (candidates.length === 0) return region;

  const index = await loadDistrictIndex();
  const districts = index?.get(region.regionSoato);
  if (!districts) return region;

  for (const name of candidates) {
    const code = districts.get(looseLocationKey(name));
    if (code) return { ...region, districtSoato: code };
  }
  return region;
}
