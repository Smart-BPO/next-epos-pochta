import { NextResponse } from "next/server";
import { isNextResponse, requireWebAppInitData } from "@/lib/webapp/auth";
import { upsertWebAppContact } from "@/lib/webapp/contact";

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

  const auth = requireWebAppInitData(body.initData);
  if (isNextResponse(auth)) return auth;

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").trim();
  if (!firstName) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const locale = body.locale === "ru" ? "ru" : "uz";
  const source =
    body.source === "telegram_contact" ? "telegram_contact" : "manual";
  const lastName = (body.lastName ?? "").trim();
  const telegramUsername =
    auth.username ??
    (typeof body.telegramUser?.username === "string"
      ? body.telegramUser.username
      : null);

  try {
    const result = await upsertWebAppContact({
      telegramUserId: auth.userId,
      phone,
      firstName,
      lastName,
      locale,
      source,
      telegramUsername,
      initDataOk: true,
    });

    return NextResponse.json({
      ok: true,
      sessionId: result.sessionId,
      phone: result.phone,
      firstName: result.firstName,
      lastName: result.lastName,
      created: result.created,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "db_error";
    if (message === "telegram_user_required") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[webapp:contact]", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
