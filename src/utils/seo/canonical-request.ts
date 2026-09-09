import type { NextRequest } from "next/server";
import { CANONICAL_SITE_URL, PRODUCTION_HOSTS } from "./indexing";

const CANONICAL_HOST = new URL(CANONICAL_SITE_URL).host;

/**
 * One-hop 308 to canonical https apex + trailing slash.
 * Also redirects legacy hosts (epospochta.uz) → epos-pochta.uz.
 */
export function getCanonicalRedirectFromHeaders(
  headers: Headers,
  nextUrl: NextRequest["nextUrl"],
): URL | null {
  const hostHeader = headers.get("x-forwarded-host") ?? headers.get("host");
  const hostname = (hostHeader ?? "").split(":")[0].toLowerCase();
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  const proto =
    headers.get("x-forwarded-proto") ??
    (nextUrl.protocol === "https:" ? "https" : "http");

  let needsRedirect = false;
  const target = new URL(nextUrl.href);

  if (proto !== "https" && PRODUCTION_HOSTS.has(hostname)) {
    target.protocol = "https:";
    needsRedirect = true;
  }

  if (hostname.startsWith("www.") && PRODUCTION_HOSTS.has(hostname.slice(4))) {
    target.hostname = hostname.slice(4);
    needsRedirect = true;
  }

  if (PRODUCTION_HOSTS.has(hostname) && hostname !== CANONICAL_HOST) {
    needsRedirect = true;
  }

  const pathname = nextUrl.pathname;
  if (pathname !== "/" && !pathname.endsWith("/") && !pathname.includes(".")) {
    target.pathname = `${pathname}/`;
    needsRedirect = true;
  }

  if (needsRedirect) {
    target.protocol = "https:";
    target.host = CANONICAL_HOST;
    return target;
  }

  return null;
}
