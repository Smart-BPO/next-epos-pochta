export function getEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function requireEnv(...keys: string[]): string {
  const value = getEnv(...keys);
  if (!value) {
    throw new Error(`Missing required env: ${keys.join(" | ")}`);
  }
  return value;
}

/**
 * Public env for client + server.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` when accessed as static property
 * (`process.env.NEXT_PUBLIC_FOO`). Dynamic `process.env[key]` stays empty
 * in the browser bundle and breaks analytics / consent hydration.
 */
const PUBLIC_ENV = {
  NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
  NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  NEXT_PUBLIC_BUSINESS_HOURS: process.env.NEXT_PUBLIC_BUSINESS_HOURS,
  NEXT_PUBLIC_MAP_LAT: process.env.NEXT_PUBLIC_MAP_LAT,
  NEXT_PUBLIC_MAP_LNG: process.env.NEXT_PUBLIC_MAP_LNG,
  NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  NEXT_PUBLIC_YANDEX_SITE_VERIFICATION:
    process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
} as const;

export type PublicEnvKey = keyof typeof PUBLIC_ENV;

export function getPublicEnv(key: PublicEnvKey, fallback = ""): string {
  const value = PUBLIC_ENV[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}
