import { NextResponse } from "next/server";
import { markLinkValidated } from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import {
  listAccountShipments,
  type AccountShipmentFilter,
} from "@/lib/fcargo/account-shipments";
import { isLocale } from "@/i18n/config";

function parseFilter(raw: unknown): AccountShipmentFilter {
  if (raw === "active" || raw === "done" || raw === "all") return raw;
  return "all";
}

function parseDirection(raw: unknown): "out" | "in" {
  return raw === "in" ? "in" : "out";
}

async function handle(request: Request, body: Record<string, unknown>) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return linked.response;

  const localeRaw =
    typeof body.locale === "string" ? body.locale : "uz";
  const locale = isLocale(localeRaw) ? localeRaw : "uz";
  const page =
    typeof body.page === "number"
      ? body.page
      : typeof body.page === "string"
        ? Number(body.page)
        : 1;
  const filter = parseFilter(body.filter);
  const direction = parseDirection(body.direction);

  const result = await listAccountShipments(linked.link, {
    locale,
    page: Number.isFinite(page) ? page : 1,
    filter,
    direction,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: 502 },
    );
  }

  await markLinkValidated(linked.link);

  return NextResponse.json({
    ok: true,
    shipments: result.page.items,
    page: result.page.page,
    lastPage: result.page.lastPage,
    total: result.page.total,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const locale = url.searchParams.get("locale") || "uz";
  const page = url.searchParams.get("page") || "1";
  const filter = url.searchParams.get("filter") || "all";
  const direction = url.searchParams.get("direction") || "out";
  return handle(request, {
    ...(initData ? { initData } : {}),
    locale,
    page,
    filter,
    direction,
  });
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
