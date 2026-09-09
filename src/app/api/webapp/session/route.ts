import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isNextResponse, requireWebAppInitData } from "@/lib/webapp/auth";

/**
 * Resolve an existing contact by verified Telegram initData user id
 * (e.g. after bot onboarding shared the phone).
 */
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
    return NextResponse.json({ ok: true, found: false });
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_webapp_contacts")
    .select(
      "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, created_at",
    )
    .eq("telegram_user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ ok: true, found: false });
  }

  return NextResponse.json({
    ok: true,
    found: true,
    session: {
      sessionId: data.session_id,
      phone: data.phone,
      firstName: data.first_name,
      lastName: data.last_name || "",
      telegramUserId: data.telegram_user_id ?? auth.userId,
      telegramUsername: data.telegram_username || auth.username || undefined,
      linkedAt: data.created_at,
      source:
        data.source === "telegram_contact" ? "telegram_contact" : "manual",
      locale: data.locale === "ru" ? "ru" : "uz",
    },
  });
}
