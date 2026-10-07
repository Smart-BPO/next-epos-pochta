/**
 * Pull FCargo /locations/regions and write src/data/fcargo-locations.json.
 * Usage: node --env-file=.env.local scripts/sync-fcargo-locations.mjs
 *
 * Optional --check: exit 1 if committed JSON diverges from live FCargo.
 */
import { createClient } from "@supabase/supabase-js";
import { createDecipheriv, createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getAllCities,
  getAllDistricts,
  getAllRegions,
} from "uzbgeo";

const checkOnly = process.argv.includes("--check");
const OUT = join(process.cwd(), "src/data/fcargo-locations.json");

const REGION_SOATO_BY_SLUG = {
  andijan: "1703",
  bukhara: "1706",
  jizzakh: "1708",
  kashkadarya: "1710",
  navoi: "1712",
  namangan: "1714",
  samarkand: "1718",
  surkhandarya: "1722",
  syrdarya: "1724",
  tashkent_city: "1726",
  tashkent: "1727",
  fergana: "1730",
  khorezm: "1733",
  karakalpakstan: "1735",
};

/** Manual slug → district SOATO when name matching fails. */
const SLUG_OVERRIDES = {
  bustan: "1703209", // Bo'ston ↔ Bo'z
  gazgan_city: "1712412", // G'ozg'on shahri ↔ G'ozg'on tumani
};

function loose(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/sharof\s+rashidov/g, "sh.rashidov")
    .replace(/[^a-z]/g, "")
    .replace(/h/g, "x")
    .replace(/q/g, "k");
}

async function loadFcargoSecrets() {
  const raw = (process.env.MESSAGING_SECRETS_KEY ?? "").trim();
  if (!raw) throw new Error("MESSAGING_SECRETS_KEY missing");
  let key = Buffer.from(raw, "base64");
  if (key.length !== 32) key = createHash("sha256").update(raw, "utf8").digest();
  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_API_KEY,
  );
  const { data: s, error } = await sb
    .from("epos_fcargo_settings")
    .select("*")
    .limit(1)
    .single();
  if (error || !s?.secrets_cipher) throw new Error(error?.message ?? "no settings");
  const [, iv, tag, enc] = s.secrets_cipher.split(":");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  const sec = JSON.parse(
    Buffer.concat([d.update(Buffer.from(enc, "base64")), d.final()]).toString(),
  );
  return { apiKey: sec.api_key, tenant: s.tenant_domain };
}

async function fetchRegions(apiKey, tenant) {
  const res = await fetch("https://api.fcargo.uz/api/client/v1/locations/regions", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Tenant-Domain": tenant,
      Accept: "application/json",
    },
  });
  const json = await res.json();
  if (!res.ok || !Array.isArray(json?.data)) {
    throw new Error(`FCargo regions ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.data;
}

function buildLocations(fcargoRegions) {
  const locations = [];
  const warnings = [];
  const byRegionSoato = new Map();

  for (const region of fcargoRegions) {
    const regionSoato = String(region.soato_code ?? "");
    if (!regionSoato) continue;
    const districtIndex = new Map();
    for (const d of region.districts ?? []) {
      if (!d?.soato_code || !d?.name) {
        warnings.push(`skip no-soato: ${regionSoato} «${d?.name}»`);
        continue;
      }
      districtIndex.set(loose(d.name), {
        soato: String(d.soato_code),
        name: d.name,
      });
    }
    byRegionSoato.set(regionSoato, { region, districtIndex });
  }

  const uzbRegions = getAllRegions();
  const districts = getAllDistricts();
  const cities = getAllCities();
  const districtBySlug = new Map(districts.map((d) => [d.slug, d]));

  // Region-level settlements (4-digit SOATO)
  for (const region of uzbRegions) {
    const regionSoato = REGION_SOATO_BY_SLUG[region.slug];
    if (!regionSoato) {
      warnings.push(`no region SOATO for slug ${region.slug}`);
      continue;
    }
    const isCityRegion = region.category === "city";
    locations.push({
      soato: regionSoato,
      regionSoato,
      regionSlug: region.slug,
      level: isCityRegion ? "city" : "region",
      fcargoName: byRegionSoato.get(regionSoato)?.region?.name ?? region.titles.uz,
      uzbgeoSlug: region.slug,
      ru: isCityRegion ? region.names.ru : region.titles.ru,
      uz: isCityRegion ? region.names.uz : region.titles.uz,
      regionRu: region.titles.ru,
      regionUz: region.titles.uz,
    });
  }

  const regionSlugBySoato = new Map(
    Object.entries(REGION_SOATO_BY_SLUG).map(([slug, code]) => [code, slug]),
  );

  const usedDistrictSoatos = new Set(
    locations.filter((l) => l.soato.length > 4).map((l) => l.soato),
  );

  function pushDistrict(opts) {
    const {
      soato,
      regionSoato,
      fcargoName,
      uzbgeoSlug,
      ru,
      uz,
      regionRu,
      regionUz,
    } = opts;
    if (usedDistrictSoatos.has(soato)) return;
    usedDistrictSoatos.add(soato);
    locations.push({
      soato,
      regionSoato,
      regionSlug: regionSlugBySoato.get(regionSoato) ?? null,
      level: "district",
      fcargoName,
      uzbgeoSlug,
      ru,
      uz,
      regionRu,
      regionUz,
    });
  }

  // Districts
  for (const d of districts) {
    const regionSoato = REGION_SOATO_BY_SLUG[d.regionSlug];
    if (!regionSoato) continue;
    const region = uzbRegions.find((r) => r.slug === d.regionSlug);
    const override = SLUG_OVERRIDES[d.slug];
    const index = byRegionSoato.get(regionSoato)?.districtIndex;
    let hit = null;
    if (override) {
      hit =
        [...(index?.values() ?? [])].find((x) => x.soato === override) ?? {
          soato: override,
          name: d.titles.uz,
        };
    } else {
      hit = index?.get(loose(d.titles.uz)) ?? null;
    }
    if (!hit?.soato) {
      warnings.push(`district unmatched: ${d.regionSlug}/${d.slug} «${d.titles.uz}»`);
      continue;
    }
    const id =
      d.slug === d.regionSlug ? `${d.slug}_district` : d.slug;
    pushDistrict({
      soato: hit.soato,
      regionSoato,
      fcargoName: hit.name ?? d.titles.uz,
      uzbgeoSlug: id,
      ru: d.titles.ru,
      uz: d.titles.uz,
      regionRu: region?.titles.ru ?? "",
      regionUz: region?.titles.uz ?? "",
    });
  }

  // Cities → map to covering FCargo district (city shahri or parent tuman)
  for (const c of cities) {
    const regionSoato = REGION_SOATO_BY_SLUG[c.regionSlug];
    if (!regionSoato) continue;
    // Regional centre cities often share slug with region — already have region entry.
    if (c.slug === c.regionSlug || c.slug === `${c.regionSlug}_city`) {
      // Prefer district SOATO when FCargo has «X shahri»
    }
    const region = uzbRegions.find((r) => r.slug === c.regionSlug);
    const override = SLUG_OVERRIDES[c.slug];
    const index = byRegionSoato.get(regionSoato)?.districtIndex;
    let hit = null;
    if (override) {
      hit = [...(index?.values() ?? [])].find((x) => x.soato === override) ?? {
        soato: override,
        name: c.titles.uz,
      };
    } else {
      const cands = [`${c.names.uz} shahri`, c.titles.uz];
      const parent = districtBySlug.get(c.parentSlug);
      if (parent) cands.push(parent.titles.uz);
      for (const name of cands) {
        hit = index?.get(loose(name));
        if (hit) break;
      }
    }
    if (!hit?.soato) {
      warnings.push(`city unmatched: ${c.regionSlug}/${c.slug} «${c.titles.uz}»`);
      continue;
    }
    // City entries: if SOATO already used by a district, still add city alias via slug map only
    // by recording a separate row only when soato not yet present OR uzbgeoSlug differs.
    const existing = locations.find((l) => l.soato === hit.soato);
    if (existing) {
      // Keep district row; city slug maps via legacySlug later.
      if (!existing.citySlugs) existing.citySlugs = [];
      if (!existing.citySlugs.includes(c.slug) && existing.uzbgeoSlug !== c.slug) {
        existing.citySlugs.push(c.slug);
      }
      continue;
    }
    pushDistrict({
      soato: hit.soato,
      regionSoato,
      fcargoName: hit.name ?? c.titles.uz,
      uzbgeoSlug: c.slug,
      ru: c.names.ru,
      uz: c.names.uz,
      regionRu: region?.titles.ru ?? "",
      regionUz: region?.titles.uz ?? "",
    });
  }

  // Add any FCargo districts we never matched (still usable by SOATO)
  for (const [regionSoato, { region, districtIndex }] of byRegionSoato) {
    const regionMeta = uzbRegions.find(
      (r) => REGION_SOATO_BY_SLUG[r.slug] === regionSoato,
    );
    for (const d of districtIndex.values()) {
      if (usedDistrictSoatos.has(d.soato)) continue;
      pushDistrict({
        soato: d.soato,
        regionSoato,
        fcargoName: d.name,
        uzbgeoSlug: null,
        ru: d.name,
        uz: d.name,
        regionRu: regionMeta?.titles.ru ?? region.name,
        regionUz: regionMeta?.titles.uz ?? region.name,
      });
      warnings.push(`fcargo-only district: ${regionSoato} ${d.soato} «${d.name}»`);
    }
  }

  locations.sort((a, b) => a.soato.localeCompare(b.soato));
  return { locations, warnings };
}

function stablePayload(locations) {
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "FCargo GET /locations/regions",
    locations: locations.map(({ citySlugs, ...rest }) => ({
      ...rest,
      ...(citySlugs?.length ? { citySlugs } : {}),
    })),
  };
}

const { apiKey, tenant } = await loadFcargoSecrets();
const regions = await fetchRegions(apiKey, tenant);
const { locations, warnings } = buildLocations(regions);
const payload = stablePayload(locations);

if (checkOnly) {
  let committed;
  try {
    committed = JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    console.error("check:geo — missing", OUT);
    process.exit(1);
  }
  const a = JSON.stringify(
    committed.locations.map((l) => ({
      soato: l.soato,
      regionSoato: l.regionSoato,
      fcargoName: l.fcargoName,
    })),
  );
  const b = JSON.stringify(
    payload.locations.map((l) => ({
      soato: l.soato,
      regionSoato: l.regionSoato,
      fcargoName: l.fcargoName,
    })),
  );
  if (a !== b) {
    console.error("check:geo FAIL — committed locations diverge from FCargo");
    console.error("Run: node --env-file=.env.local scripts/sync-fcargo-locations.mjs");
    process.exit(1);
  }
  console.log(`check:geo OK (${payload.locations.length} locations)`);
  process.exit(0);
}

writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`wrote ${OUT} (${payload.locations.length} locations)`);
if (warnings.length) {
  console.log(`warnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log(" ", w);
  if (warnings.length > 40) console.log(`  … +${warnings.length - 40} more`);
}
