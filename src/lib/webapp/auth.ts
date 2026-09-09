import { NextResponse } from "next/server";
import { verifyTelegramWebAppInitData } from "@/lib/webapp/telegram-init-data";

export type VerifiedWebAppUser = {
  userId: number;
  username?: string;
};

/** Require valid Telegram WebApp initData; returns 401 response on failure. */
export function requireWebAppInitData(
  initData: unknown,
): VerifiedWebAppUser | NextResponse {
  const raw = typeof initData === "string" ? initData : "";
  const botToken = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  if (!raw || !botToken) {
    return NextResponse.json({ error: "telegram_required" }, { status: 401 });
  }
  const verified = verifyTelegramWebAppInitData(raw, botToken);
  if (!verified.ok || verified.userId == null) {
    return NextResponse.json({ error: "telegram_invalid" }, { status: 401 });
  }
  return {
    userId: verified.userId,
    username: verified.username,
  };
}

export function isNextResponse(
  value: VerifiedWebAppUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
