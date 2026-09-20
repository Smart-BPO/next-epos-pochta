import { headers } from "next/headers";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

export async function resolveFcargoSiteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }
  return getCanonicalSiteUrl();
}

export function fcargoWebhookUrl(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/api/fcargo/webhook/`;
}
