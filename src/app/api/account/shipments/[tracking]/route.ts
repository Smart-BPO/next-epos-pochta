import { NextResponse } from "next/server";
import { markLinkValidated } from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { getAccountShipment } from "@/lib/fcargo/account-shipments";
import { isLocale } from "@/i18n/config";
import { normalizeTrackingNumber } from "@/lib/tracking/types";

async function handle(
  request: Request,
  body: Record<string, unknown>,
  trackingRaw: string,
) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return linked.response;

  const tracking = normalizeTrackingNumber(trackingRaw);
  if (!tracking) {
    return NextResponse.json({ error: "invalid_tracking" }, { status: 400 });
  }

  const localeRaw =
    typeof body.locale === "string" ? body.locale : "uz";
  const locale = isLocale(localeRaw) ? localeRaw : "uz";

  const detail = await getAccountShipment(linked.link, tracking, locale);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await markLinkValidated(linked.link);

  return NextResponse.json({
    ok: true,
    shipment: detail,
  });
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ tracking: string }> },
) {
  const { tracking } = await ctx.params;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const locale = url.searchParams.get("locale") || "uz";
  return handle(
    request,
    { ...(initData ? { initData } : {}), locale },
    tracking,
  );
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ tracking: string }> },
) {
  const { tracking } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return handle(request, body, tracking);
}
