-- Secret / credential tables: service-role only.
-- Staff UI reads masked views via Next server actions (createSupabaseAdminClient).
-- Drop authenticated policies so PostgREST/Studio cookie clients cannot SELECT ciphertext
-- or usable customer session tokens.

-- epos_fcargo_client_links (token_cipher + session_token)
drop policy if exists epos_fcargo_client_links_staff_select
  on public.epos_fcargo_client_links;

-- epos_fcargo_settings (api key / webhook secret ciphertext)
drop policy if exists epos_fcargo_settings_staff
  on public.epos_fcargo_settings;

-- epos_messaging_providers (Playmobile / Eskiz / Resend ciphertext)
drop policy if exists epos_messaging_providers_staff
  on public.epos_messaging_providers;

-- Defense in depth: no table grants for anon/authenticated beyond what RLS already blocks.
revoke all on table public.epos_fcargo_client_links from anon, authenticated;
revoke all on table public.epos_fcargo_settings from anon, authenticated;
revoke all on table public.epos_messaging_providers from anon, authenticated;

-- Service role retains full access via bypass + default grants.
grant all on table public.epos_fcargo_client_links to service_role;
grant all on table public.epos_fcargo_settings to service_role;
grant all on table public.epos_messaging_providers to service_role;
