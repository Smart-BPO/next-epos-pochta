import { NextResponse } from "next/server";

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

  const sessionId = createSessionId();
  const record = {
    sessionId,
    phone,
    firstName,
    lastName: (body.lastName ?? "").trim(),
    locale: body.locale === "ru" ? "ru" : "uz",
    source: body.source === "telegram_contact" ? "telegram_contact" : "manual",
    telegramUser: body.telegramUser ?? null,
    // TODO(admin): verify Telegram initData HMAC with bot token before trusting user id
    initDataPresent: Boolean(body.initData),
    createdAt: new Date().toISOString(),
  };

  // TODO(admin): upsert contact profile in Supabase / CRM keyed by telegramUser.id + phone
  console.info("[webapp:contact]", JSON.stringify(record));

  return NextResponse.json({
    ok: true,
    sessionId,
    phone: record.phone,
    firstName: record.firstName,
    lastName: record.lastName,
  });
}
