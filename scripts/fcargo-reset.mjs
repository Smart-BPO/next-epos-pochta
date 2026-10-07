/**
 * Backup + wipe operational FCargo/CRM mirrors (not contacts, hubs, CMS).
 * Usage: node --env-file=.env.local scripts/fcargo-reset.mjs
 *
 * Delete order respects FKs (orders → leads).
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BACKUP_TABLES = [
  "epos_leads",
  "epos_webapp_shipments",
  "epos_fcargo_packages",
  "epos_fcargo_orders",
  "epos_fcargo_webhook_inbox",
  "epos_fcargo_request_log",
];

/** Children first, then parents. */
const DELETE_ORDER = [
  "epos_fcargo_orders",
  "epos_fcargo_packages",
  "epos_webapp_shipments",
  "epos_fcargo_webhook_inbox",
  "epos_fcargo_request_log",
  "epos_leads",
];

const url = process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_API_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / service role key");
  process.exit(1);
}

const sb = createClient(url, key);
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = join(process.cwd(), "backups", stamp);
mkdirSync(dir, { recursive: true });

for (const table of BACKUP_TABLES) {
  const { data, error } = await sb.from(table).select("*");
  if (error) {
    console.error(table, "backup failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows, null, 2));
  console.log(`backed up ${table}: ${rows.length}`);
}

async function deleteAll(table) {
  // Page through ids then delete — works for uuid and text PKs.
  for (;;) {
    const { data, error } = await sb.from(table).select("id").limit(500);
    if (error) throw new Error(`${table} select: ${error.message}`);
    if (!data?.length) return;
    const ids = data.map((r) => r.id);
    const { error: delErr } = await sb.from(table).delete().in("id", ids);
    if (delErr) throw new Error(`${table} delete: ${delErr.message}`);
    console.log(`  deleted ${table} batch: ${ids.length}`);
    if (ids.length < 500) return;
  }
}

for (const table of DELETE_ORDER) {
  try {
    await deleteAll(table);
    console.log(`cleared ${table}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

console.log("done →", dir);
