#!/usr/bin/env node
/**
 * Lightweight HTTP smoke checks for public pages + key APIs.
 * Usage: node scripts/smoke.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const base = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");

/** @type {Array<{ name: string; ok: boolean; detail: string }>} */
const results = [];

function pass(name, detail = "ok") {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name} — ${detail}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function req(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // not json
    }
    return { res, text, json };
  } finally {
    clearTimeout(timer);
  }
}

async function expectStatus(name, path, statuses, init) {
  try {
    const { res, json, text } = await req(path, init);
    if (!statuses.includes(res.status)) {
      fail(
        name,
        `expected ${statuses.join("|")}, got ${res.status}: ${text.slice(0, 160)}`,
      );
      return null;
    }
    pass(name, `${res.status}`);
    return { res, json, text };
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function main() {
  console.log(`smoke → ${base}\n`);

  const pages = [
    "/",
    "/calculator/",
    "/tracking/",
    "/request-price/",
    "/cabinet/",
    "/news/",
    "/webapp/",
    "/delivery/",
    "/ru/",
    "/ru/cabinet/",
    "/zh/",
    "/zh/cabinet/",
  ];
  for (const path of pages) {
    await expectStatus(`GET ${path}`, path, [200]);
  }

  const estimate = await expectStatus(
    "POST /api/estimate/",
    "/api/estimate/",
    [200],
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fromCityId: "tashkent",
        toCityId: "samarkand",
        weightKg: 1,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
      }),
    },
  );
  if (estimate?.json) {
    const amount = estimate.json?.estimate?.amount ?? estimate.json?.amount;
    if (typeof amount === "number" && amount > 0) {
      pass("estimate has amount", String(amount));
    } else if (estimate.json?.ok === false) {
      fail("estimate has amount", JSON.stringify(estimate.json).slice(0, 160));
    } else {
      fail("estimate has amount", JSON.stringify(estimate.json).slice(0, 160));
    }
  }

  const track = await expectStatus(
    "GET /api/tracking/?number=PKGNKS8IIVC",
    "/api/tracking/?number=PKGNKS8IIVC",
    [404],
  );
  if (track?.json && track.json.error !== "not_found") {
    fail("tracking not_found shape", JSON.stringify(track.json).slice(0, 160));
  } else if (track?.json) {
    pass("tracking not_found shape", "not_found");
  }

  const me = await expectStatus("GET /api/account/me/", "/api/account/me/", [
    200,
    401,
  ]);
  if (me?.json && typeof me.json === "object") {
    pass("account/me JSON", JSON.stringify(me.json).slice(0, 120));
  }

  await expectStatus(
    "POST /api/webapp/session/ (no initData)",
    "/api/webapp/session/",
    [401, 400, 403],
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    },
  );

  // 401/403 = bad signature; 503 = webhook secret not configured (still rejects).
  await expectStatus(
    "POST /api/fcargo/webhook/ (no signature)",
    "/api/fcargo/webhook/",
    [401, 403, 503],
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "webhook.test" }),
    },
  );

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} passed` +
      (failed.length ? `, ${failed.length} failed` : ""),
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
