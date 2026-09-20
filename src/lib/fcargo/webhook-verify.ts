import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify FCargo outbound webhook HMAC.
 * Header: `X-FCargo-Signature: t=<ts>,d=<delivery_id>,v1=<hex>[,v2=<hex>]`
 * Signed string: `<timestamp>.<delivery_id>.<raw_body>`
 * @see FCargo Webhooks docs
 */
export function verifyFcargoWebhookSignature(
  rawBody: string,
  header: string,
  secret: string,
  opts?: { maxSkewSec?: number; nowSec?: number },
): boolean {
  const secretTrim = secret.trim();
  const headerTrim = header.trim();
  if (!secretTrim || !headerTrim) return false;

  const parts: Record<string, string> = {};
  for (const kv of headerTrim.split(",")) {
    const idx = kv.indexOf("=");
    if (idx <= 0) continue;
    const k = kv.slice(0, idx).trim();
    const v = kv.slice(idx + 1).trim();
    if (k && v) parts[k] = v;
  }

  const t = Number(parts.t);
  const d = parts.d;
  if (!Number.isFinite(t) || !d) return false;

  const now = opts?.nowSec ?? Math.floor(Date.now() / 1000);
  const maxSkew = opts?.maxSkewSec ?? 300;
  if (Math.abs(now - t) > maxSkew) return false;

  const signed = `${parts.t}.${d}.${rawBody}`;
  const expected = createHmac("sha256", secretTrim)
    .update(signed, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  for (const slot of ["v1", "v2"] as const) {
    const got = parts[slot];
    if (!got) continue;
    const gotBuf = Buffer.from(got, "utf8");
    if (
      expectedBuf.length === gotBuf.length &&
      timingSafeEqual(expectedBuf, gotBuf)
    ) {
      return true;
    }
  }
  return false;
}
