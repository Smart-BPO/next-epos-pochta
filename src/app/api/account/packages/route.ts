import { NextResponse } from "next/server";
import { revokeLink } from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { eposPackages } from "@/lib/fcargo/epos-client";
import { fcargoStatusCopy } from "@/lib/tracking/fcargo-status";
import { isLocale } from "@/i18n/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const localeRaw = url.searchParams.get("locale") || "uz";
  const locale = isLocale(localeRaw) ? localeRaw : "uz";
  return handle(request, initData ? { initData, locale } : { locale });
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

async function handle(request: Request, body: Record<string, unknown>) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return linked.response;

  const result = await eposPackages(linked.token);
  if (!result.ok) {
    if (result.status === 401) {
      await revokeLink(linked.link);
      return NextResponse.json({ error: "relink_required" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "fcargo_failed", message: result.message },
      { status: result.status >= 400 ? result.status : 502 },
    );
  }

  const localeRaw =
    typeof body.locale === "string" ? body.locale : "uz";
  const locale = isLocale(localeRaw) ? localeRaw : "uz";

  const packages = result.data.map((pkg) => ({
    id: pkg.id,
    trackingNumber: pkg.trackingNumber,
    statusCode: pkg.statusCode,
    statusLabel: fcargoStatusCopy(pkg.statusCode, locale, pkg.statusName)
      .label,
    fromLabel: pkg.fromLabel,
    toLabel: pkg.toLabel,
    createdAt: pkg.createdAt,
  }));

  return NextResponse.json({ ok: true, packages });
}
