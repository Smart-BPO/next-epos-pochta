import type { NextRequest } from "next/server";
import { CANONICAL_SITE_URL, PRODUCTION_HOSTS } from "./indexing";

const CANONICAL_ORIGIN = CANONICAL_SITE_URL.replace(/\/$/, "");
const CANONICAL_HOST = new URL(CANONICAL_SITE_URL).host;

/**
 * Build a public https apex URL without leaking the Node listen port (:3000).
 * Hostinger proxies to localhost:3000; cloning nextUrl keeps that port in Location.
 */
export function toCanonicalPublicUrl(
  pathname: string,
  search = "",
): URL {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`${path}${search}`, `${CANONICAL_ORIGIN}/`);
}

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

  if (proto !== "https" && PRODUCTION_HOSTS.has(hostname)) {
    needsRedirect = true;
  }

  if (hostname.startsWith("www.") && PRODUCTION_HOSTS.has(hostname.slice(4))) {
    needsRedirect = true;
  }

  if (PRODUCTION_HOSTS.has(hostname) && hostname !== CANONICAL_HOST) {
    needsRedirect = true;
  }

  let pathname = nextUrl.pathname;
  if (pathname !== "/" && !pathname.endsWith("/") && !pathname.includes(".")) {
    pathname = `${pathname}/`;
    needsRedirect = true;
  }

  if (!needsRedirect) {
    return null;
  }

  return toCanonicalPublicUrl(pathname, nextUrl.search);
}
