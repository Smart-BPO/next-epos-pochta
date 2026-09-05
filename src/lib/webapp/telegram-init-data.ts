import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify Telegram WebApp initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86_400,
): { ok: true; userId?: number; username?: string } | { ok: false } {
  if (!initData.trim() || !botToken.trim()) return { ok: false };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  } catch {
    return { ok: false };
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!Number.isFinite(authDate) || authDate <= 0) return { ok: false };
  const age = Math.floor(Date.now() / 1000) - authDate;
  if (age < 0 || age > maxAgeSec) return { ok: false };

  let userId: number | undefined;
  let username: string | undefined;
  const userRaw = params.get("user");
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw) as { id?: number; username?: string };
      if (typeof user.id === "number") userId = user.id;
      if (typeof user.username === "string") username = user.username;
    } catch {
      // ignore user parse
    }
  }

  return { ok: true, userId, username };
}
