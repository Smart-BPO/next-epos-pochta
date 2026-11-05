import { NextResponse } from "next/server";
import { getFcargoTenantBranding } from "@/lib/fcargo/tenant-branding";

/** Public tenant logo/name for cabinet chrome (from Cargo CRM domain-info). */
export async function GET() {
  const branding = await getFcargoTenantBranding();
  return NextResponse.json(
    {
      ok: true,
      logoUrl: branding?.logoUrl ?? null,
      faviconUrl: branding?.faviconUrl ?? null,
      companyName: branding?.companyName ?? null,
      name: branding?.name ?? null,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
