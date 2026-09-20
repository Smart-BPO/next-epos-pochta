-- FCargo Client API credentials (encrypted in CMS, not env)

create table if not exists public.epos_fcargo_settings (
  id text primary key default 'default' check (id = 'default'),
  enabled boolean not null default false,
  tenant_domain text not null default '',
  base_url text not null default 'https://api.fcargo.uz/api/client/v1',
  mode text not null default 'live' check (mode in ('test', 'live')),
  secrets_cipher text,
  secrets_meta jsonb not null default '{}'::jsonb,
  last_test_at timestamptz,
  last_test_ok boolean,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_fcargo_settings_updated_at on public.epos_fcargo_settings;
create trigger epos_fcargo_settings_updated_at
before update on public.epos_fcargo_settings
for each row execute function private.set_updated_at();

insert into public.epos_fcargo_settings (id, enabled, tenant_domain, base_url, mode)
values ('default', false, 'epos-pochta.uz', 'https://api.fcargo.uz/api/client/v1', 'live')
on conflict (id) do nothing;

alter table public.epos_fcargo_settings enable row level security;

drop policy if exists epos_fcargo_settings_staff on public.epos_fcargo_settings;
create policy epos_fcargo_settings_staff
  on public.epos_fcargo_settings for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());
