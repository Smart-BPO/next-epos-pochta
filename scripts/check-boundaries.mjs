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

}

// Client Components must not reach a `server-only` module through value imports
// (directly or transitively). Server Actions ("use server") are RPC boundaries.
const fileSet = new Set(files);
const srcCache = new Map();
const readSrc = (f) => {
  if (!srcCache.has(f)) srcCache.set(f, readFileSync(f, "utf8"));
  return srcCache.get(f);
};

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(root, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = join(from, "..", spec);
  else return null;
  for (const ext of ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"]) {
    const p = base + ext;
    if (fileSet.has(p)) return p;
  }
  return null;
}

function valueImports(src) {
  const text = stripComments(src);
  const out = [];
  const re =
    /(?:^|\n)\s*(import|export)\s+(type\s+)?([^;]*?)\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[2]) continue;
    const clause = m[3].trim();
    const braces = clause.match(/^\{([\s\S]*)\}$/);
    if (braces) {
      const names = braces[1].split(",").map((s) => s.trim()).filter(Boolean);
      if (names.length && names.every((n) => n.startsWith("type "))) continue;
    }
    out.push(m[4]);
  }
  const bare = /(?:^|\n)\s*import\s*["']([^"']+)["']/g;
  while ((m = bare.exec(text))) out.push(m[1]);
  return out;
}

const isServerOnly = (src) => /^\s*import\s+["']server-only["']/m.test(src);
const isUseServer = (src) => /^\s*["']use server["']/m.test(src);
const isUseClient = (src) => /^\s*["']use client["']/m.test(src);

for (const file of files) {
  if (!isUseClient(readSrc(file))) continue;
  const seen = new Set([file]);
  const stack = [[file, [rel(file)]]];
  let hit = null;
  while (stack.length && !hit) {
    const [cur, trail] = stack.pop();
    for (const spec of valueImports(readSrc(cur))) {
      const next = resolveImport(cur, spec);
      if (!next || seen.has(next)) continue;
      seen.add(next);
      const nsrc = readSrc(next);
      if (isUseServer(nsrc)) continue;
      const nextTrail = [...trail, rel(next)];
      if (isServerOnly(nsrc)) {
        hit = nextTrail;
        break;
      }
      stack.push([next, nextTrail]);
    }
  }
  if (hit) {
    errors.push(`client reaches server-only: ${hit.join(" → ")}`);
  }
}

if (errors.length) {
  console.error("Boundary check failed:\n" + errors.map((e) => ` - ${e}`).join("\n"));
  process.exit(1);
}

console.log("Boundary check passed.");
