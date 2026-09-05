import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = getSupabaseUrl() || requireSupabaseUrl();
  const key = getSupabasePublishableKey() || requireSupabasePublishableKey();
  browserClient = createBrowserClient(url, key);
  return browserClient;
}
