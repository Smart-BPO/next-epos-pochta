import { NextResponse } from "next/server";
import { getRouteQuote, isHubRoute } from "@/lib/pricing/route-quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from")?.trim() ?? "";
  const to = url.searchParams.get("to")?.trim() ?? "";
  if (!isHubRoute(from, to)) {
    return NextResponse.json({ ok: false, error: "unknown_route" }, { status: 400 });
  }

  const quote = await getRouteQuote(from, to);
  if (!quote) {
    return NextResponse.json(
      { ok: false, error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true, quote },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      },
    },
  );
}
