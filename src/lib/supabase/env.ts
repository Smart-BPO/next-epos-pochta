import { getEnv, requireEnv } from "@/utils/env";

export function getSupabaseUrl(): string {
  return getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  return getEnv(
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export function getSupabaseSecretKey(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
    throw new Error(
      "Invalid env: NEXT_PUBLIC_SUPABASE_SECRET_KEY must not be set.",
    );
  }
  const secret = getEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  const publishable = getSupabasePublishableKey();
  if (secret && publishable && secret === publishable) {
    throw new Error("Invalid env: secret key must not match anon key.");
  }
  return secret;
}

export function requireSupabaseUrl(): string {
  return requireEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
}

export function requireSupabasePublishableKey(): string {
  return requireEnv(
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export function requireSupabaseSecretKey(): string {
  return requireEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
}

export function hasSupabaseBrowserConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}
