import { NextResponse } from "next/server";
import { isNextResponse, requireWebAppInitData } from "@/lib/webapp/auth";
import { upsertWebAppContact } from "@/lib/webapp/contact";
import { verifyTelegramContactResponse } from "@/lib/webapp/telegram-init-data";

type ContactPayload = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  source?: "telegram_contact" | "manual";
  contactResponse?: string;
  telegramUser?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    photoUrl?: string;
  } | null;
  photoUrl?: string;
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
  // Phone counts as Telegram-verified only with a signed contact response;
  // the bot webhook also upgrades the source when the contact reaches the bot.
  const signedPhone =
    body.source === "telegram_contact" && typeof body.contactResponse === "string"
      ? verifyTelegramContactResponse(
          body.contactResponse,
          (process.env.TELEGRAM_BOT_TOKEN ?? "").trim(),
          auth.userId,
        )
      : null;
  const source =
    signedPhone && normalizePhone(signedPhone) === phone
      ? "telegram_contact"
      : "manual";
  const lastName = (body.lastName ?? "").trim();
  const telegramUsername =
    auth.username ??
    (typeof body.telegramUser?.username === "string"
      ? body.telegramUser.username
      : null);
  const photoUrl =
    (typeof body.photoUrl === "string" && body.photoUrl.trim()) ||
    (typeof body.telegramUser?.photoUrl === "string"
      ? body.telegramUser.photoUrl.trim()
      : "") ||
    null;

  try {
    const result = await upsertWebAppContact({
      telegramUserId: auth.userId,
      phone,
      firstName,
      lastName,
      locale,
      source,
      telegramUsername,
      photoUrl,
      initDataOk: true,
    });

    try {
      const { linkFcargoPackagesToContact } = await import(
        "@/lib/fcargo/link-contact"
      );
      await linkFcargoPackagesToContact({
        sessionId: result.sessionId,
        phone: result.phone,
        telegramUserId: auth.userId,
      });
    } catch (e) {
      console.warn("[webapp:contact:fcargo-link]", e);
    }

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
