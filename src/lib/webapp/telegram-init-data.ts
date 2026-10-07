import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Check a Mini App signed query string (initData, requestContact response) per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifySignedWebAppParams(
  raw: string,
  botToken: string,
  maxAgeSec: number,
): URLSearchParams | null {
  if (!raw.trim() || !botToken.trim()) return null;

  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash) return null;
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
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!Number.isFinite(authDate) || authDate <= 0) return null;
  const age = Math.floor(Date.now() / 1000) - authDate;
  if (age < 0 || age > maxAgeSec) return null;

  return params;
}

export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86_400,
): { ok: true; userId?: number; username?: string } | { ok: false } {
  const params = verifySignedWebAppParams(initData, botToken, maxAgeSec);
  if (!params) return { ok: false };

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

/**
 * Signed `requestContact` response (`contact=…&auth_date=…&hash=…`).
 * Returns the phone only when the contact belongs to `userId`.
 */
export function verifyTelegramContactResponse(
  response: string,
  botToken: string,
  userId: number,
  maxAgeSec = 3_600,
): string | null {
  const params = verifySignedWebAppParams(response, botToken, maxAgeSec);
  const contactRaw = params?.get("contact");
  if (!contactRaw) return null;
  try {
    const contact = JSON.parse(contactRaw) as {
      user_id?: number;
      phone_number?: string;
    };
    if (contact.user_id !== userId) return null;
    return typeof contact.phone_number === "string" && contact.phone_number
      ? contact.phone_number
      : null;
  } catch {
    return null;
  }
}
