import { NextResponse } from "next/server";
import { markLinkValidated } from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { listAccountShipments } from "@/lib/fcargo/account-shipments";
import { isLocale } from "@/i18n/config";

/** @deprecated Prefer /api/account/shipments/ — kept as thin alias. */
async function handle(request: Request, body: Record<string, unknown>) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return linked.response;

  const localeRaw =
    typeof body.locale === "string" ? body.locale : "uz";
  const locale = isLocale(localeRaw) ? localeRaw : "uz";

  const result = await listAccountShipments(linked.link, {
    locale,
    page: 1,
    filter: "all",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "fcargo_failed", message: result.message },
      { status: 502 },
    );
  }

  await markLinkValidated(linked.link);

  const packages = result.page.items.map((pkg) => ({
    id: pkg.packageId ?? pkg.trackingNumber,
    trackingNumber: pkg.trackingNumber,
    statusCode: pkg.statusCode,
    statusLabel: pkg.statusLabel,
    fromLabel: pkg.fromLabel,
    toLabel: pkg.toLabel,
    createdAt: pkg.createdAt,
  }));

  return NextResponse.json({ ok: true, packages });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const localeRaw = url.searchParams.get("locale") || "uz";
  return handle(request, initData ? { initData, locale: localeRaw } : { locale: localeRaw });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return handle(request, body);
}
