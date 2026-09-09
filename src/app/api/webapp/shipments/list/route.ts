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

  return NextResponse.json({ ok: true, items: data ?? [] });
}
