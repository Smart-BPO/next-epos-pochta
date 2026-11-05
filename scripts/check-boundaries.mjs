#!/usr/bin/env node
/**
 * Fail if dashboard ↔ account / customer UI domains cross-import.
 * Also fail if a "use client" file value-imports server secret modules.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const errors = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

function rel(p) {
  return relative(root, p).replaceAll("\\", "/");
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function importsOf(src) {
  const text = stripComments(src);
  const found = [];
  const re =
    /(?:import|export)\s+(?:type\s+)?(?:[^"'();]+?\s+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) found.push(m[1]);
  return found;
}

function isTypeOnlyImport(line) {
  return /^\s*import\s+type\b/.test(line) || /\bexport\s+type\b/.test(line);
}

const files = walk(join(root, "src"));

for (const file of files) {
  const path = rel(file);
  const src = readFileSync(file, "utf8");
  const imps = importsOf(src);

  if (path.startsWith("src/components/dashboard/")) {
    for (const i of imps) {
      if (
        i === "@/components/account" ||
        i.startsWith("@/components/account/")
      ) {
        errors.push(`${path} imports ${i} (dashboard → account forbidden)`);
      }
    }
  }

  if (
    path.startsWith("src/components/account/") ||
    path.startsWith("src/views/CabinetPageView") ||
    path.startsWith("src/views/webapp/") ||
    path.startsWith("src/components/webapp/")
  ) {
    for (const i of imps) {
      if (
        i === "@/components/dashboard" ||
        i.startsWith("@/components/dashboard/")
      ) {
        errors.push(`${path} imports ${i} (customer → dashboard forbidden)`);
      }
    }
  }

  const isClient = /^["']use client["']\s*;?/m.test(src);
  if (isClient) {
    const secretMods = [
      "@/lib/crypto/secrets",
      "@/lib/supabase/admin",
      "@/lib/telegram/bot",
      "@/lib/fcargo/client",
      "@/lib/fcargo/epos-client",
      "@/lib/fcargo/epos-account",
      "@/lib/fcargo/create-order",
      "@/lib/fcargo/settings",
      "@/lib/messaging/providers",
    ];
    for (const line of src.split("\n")) {
      if (isTypeOnlyImport(line)) continue;
      for (const mod of secretMods) {
        if (line.includes(`"${mod}"`) || line.includes(`'${mod}'`)) {
          if (/^\s*import\s+type\b/.test(line.trim())) continue;
          // allow `import type { X } from "..."` already skipped
          if (
            /^\s*import\b/.test(line.trim()) &&
            !/^\s*import\s+type\b/.test(line.trim())
          ) {
            errors.push(
              `${path} value-imports ${mod} from a Client Component`,
            );
          }
        }
      }
    }
  }
}

if (errors.length) {
  console.error("Boundary check failed:\n" + errors.map((e) => ` - ${e}`).join("\n"));
  process.exit(1);
}

console.log("Boundary check passed.");
