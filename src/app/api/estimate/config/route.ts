import { NextResponse } from "next/server";
import { getPublicPricingUi } from "@/lib/pricing/settings";

export async function GET() {
  const ui = await getPublicPricingUi();
  return NextResponse.json(ui, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
