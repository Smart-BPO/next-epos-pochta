import { NextResponse } from "next/server";
import { canAccess, getAdminSession } from "@/lib/cms/auth";
import { resolveTelegramProfilePhotoUrl } from "@/lib/telegram/bot";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ telegramUserId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin || !canAccess(admin.role, "webapp")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { telegramUserId: raw } = await context.params;
  const telegramUserId = Number(raw);
  if (!Number.isFinite(telegramUserId) || telegramUserId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const url = await resolveTelegramProfilePhotoUrl(telegramUserId);
  if (!url) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const upstream = await fetch(url, { cache: "force-cache" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
    }
    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
