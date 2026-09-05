import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  requireSupabaseSecretKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

/** Service-role client — server only. */
export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(requireSupabaseUrl(), requireSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
