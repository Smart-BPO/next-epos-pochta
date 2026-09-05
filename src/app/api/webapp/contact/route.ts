import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { verifyTelegramWebAppInitData } from "@/lib/webapp/telegram-init-data";

type ContactPayload = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  source?: "telegram_contact" | "manual";
  telegramUser?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
  } | null;
  initData?: string;
};

function createSessionId() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TG-${stamp}-${rand}`;
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (phone.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").trim();
  if (!firstName) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  let initDataOk = false;
  let telegramUserId: number | null =
    typeof body.telegramUser?.id === "number" ? body.telegramUser.id : null;
  let telegramUsername: string | null =
    typeof body.telegramUser?.username === "string"
      ? body.telegramUser.username
      : null;

  if (body.initData && botToken) {
    const verified = verifyTelegramWebAppInitData(body.initData, botToken);
    if (verified.ok) {
      initDataOk = true;
      if (verified.userId != null) telegramUserId = verified.userId;
      if (verified.username) telegramUsername = verified.username;
    }
  }

  const sessionId = createSessionId();
  const locale = body.locale === "ru" ? "ru" : "uz";
  const source =
    body.source === "telegram_contact" ? "telegram_contact" : "manual";
  const lastName = (body.lastName ?? "").trim();

  if (!hasSupabaseAdminConfig()) {
    console.info(
      "[webapp:contact]",
      JSON.stringify({
        sessionId,
        phone,
        firstName,
        lastName,
        locale,
        source,
        telegramUserId,
        initDataOk,
      }),
    );
    return NextResponse.json({
      ok: true,
      sessionId,
      phone,
      firstName,
      lastName,
    });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("epos_webapp_contacts").insert({
      session_id: sessionId,
      phone,
      first_name: firstName,
      last_name: lastName,
      locale,
      source,
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername,
      init_data_ok: initDataOk,
    });
    if (error) {
      console.error("[webapp:contact:db]", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[webapp:contact:db]", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    sessionId,
    phone,
    firstName,
    lastName,
  });
}
