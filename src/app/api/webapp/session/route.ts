import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { verifyTelegramWebAppInitData } from "@/lib/webapp/telegram-init-data";

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

  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  if (!body.initData || !botToken) {
    return NextResponse.json({ ok: false, found: false });
  }

  const verified = verifyTelegramWebAppInitData(body.initData, botToken);
  if (!verified.ok || verified.userId == null) {
    return NextResponse.json({ ok: false, found: false });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, found: false });
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("epos_webapp_contacts")
    .select(
      "session_id, phone, first_name, last_name, locale, source, telegram_user_id, telegram_username, created_at",
    )
    .eq("telegram_user_id", verified.userId)
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
      telegramUserId: data.telegram_user_id ?? verified.userId,
      telegramUsername: data.telegram_username || verified.username || undefined,
      linkedAt: data.created_at,
      source:
        data.source === "telegram_contact" ? "telegram_contact" : "manual",
      locale: data.locale === "ru" ? "ru" : "uz",
    },
  });
}
