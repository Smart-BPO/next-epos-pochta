import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isNextResponse, requireWebAppInitData } from "@/lib/webapp/auth";

export async function POST(request: Request) {
  let body: { initData?: string };
  try {
    body = (await request.json()) as { initData?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const auth = requireWebAppInitData(body.initData);
  if (isNextResponse(auth)) return auth;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_webapp_shipments")
    .select(
      "id, from_label, to_label, status, track_number, weight_kg, created_at",
    )
    .eq("telegram_user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[webapp:shipments:list]", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const rows = data ?? [];
  const tracks = [
    ...new Set(rows.map((r) => r.track_number).filter(Boolean) as string[]),
  ];
  const fcargoByTrack = new Map<string, string>();
  if (tracks.length) {
    const { data: pkgs } = await admin
      .from("epos_fcargo_packages")
      .select("tracking_number, status")
      .in("tracking_number", tracks);
    for (const p of pkgs ?? []) {
      if (p.tracking_number && p.status) {
        fcargoByTrack.set(p.tracking_number, p.status);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    items: rows.map((r) => ({
      ...r,
      fcargo_status: r.track_number
        ? (fcargoByTrack.get(r.track_number) ?? null)
        : null,
    })),
  });
}
