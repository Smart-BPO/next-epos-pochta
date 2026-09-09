import { getEnv, requireEnv } from "@/utils/env";

/**
 * Supabase credentials are server-only.
 * Never use NEXT_PUBLIC_SUPABASE_* — those would ship to the browser bundle.
 */
function assertNoPublicSupabaseEnv() {
  const leaked = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_SECRET_KEY",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  ].filter((key) => Boolean(process.env[key]?.trim()));
  if (leaked.length > 0) {
    throw new Error(
      `Remove public Supabase env (use server-only names): ${leaked.join(", ")}`,
    );
  }
}

export function getSupabaseUrl(): string {
  assertNoPublicSupabaseEnv();
  return getEnv("SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  assertNoPublicSupabaseEnv();
  return getEnv("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY");
}

export function getSupabaseSecretKey(): string {
  assertNoPublicSupabaseEnv();
  const secret = getEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_API_KEY",
  );
  const publishable = getSupabasePublishableKey();
  if (secret && publishable && secret === publishable) {
    throw new Error("Invalid env: secret key must not match anon key.");
  }
  return secret;
}

export function requireSupabaseUrl(): string {
  assertNoPublicSupabaseEnv();
  return requireEnv("SUPABASE_URL");
}

export function requireSupabasePublishableKey(): string {
  assertNoPublicSupabaseEnv();
  return requireEnv("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY");
}

export function requireSupabaseSecretKey(): string {
  assertNoPublicSupabaseEnv();
  return requireEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_API_KEY",
  );
}

/** URL + anon key present (cookie session / SSR auth). */
export function hasSupabaseSessionConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

/** @deprecated use hasSupabaseSessionConfig */
export function hasSupabaseBrowserConfig(): boolean {
  return hasSupabaseSessionConfig();
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

/** Same-origin public media path (proxied to Storage by Next rewrite). */
export function publicMediaPath(objectPath: string): string {
  const clean = objectPath.replace(/^\/+/, "");
  return `/media/${clean}`;
}
