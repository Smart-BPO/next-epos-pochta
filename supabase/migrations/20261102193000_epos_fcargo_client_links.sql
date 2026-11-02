-- FCargo legacy EPOS customer-account links (site cabinet + Mini App).
-- Tokens encrypted with MESSAGING_SECRETS_KEY; service role only.

create table if not exists public.epos_fcargo_client_links (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('web', 'telegram')),
  subject_id text not null,
  phone text not null,
  fcargo_client_id text,
  display_name text,
  token_cipher text not null,
  session_token text not null unique,
  linked_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists epos_fcargo_client_links_subject_active_uidx
  on public.epos_fcargo_client_links (subject_type, subject_id)
  where revoked_at is null;

create index if not exists epos_fcargo_client_links_phone_idx
  on public.epos_fcargo_client_links (phone);

create index if not exists epos_fcargo_client_links_session_idx
  on public.epos_fcargo_client_links (session_token)
  where revoked_at is null;

drop trigger if exists epos_fcargo_client_links_updated_at
  on public.epos_fcargo_client_links;
create trigger epos_fcargo_client_links_updated_at
before update on public.epos_fcargo_client_links
for each row execute function private.set_updated_at();

alter table public.epos_fcargo_client_links enable row level security;

drop policy if exists epos_fcargo_client_links_staff_select
  on public.epos_fcargo_client_links;
create policy epos_fcargo_client_links_staff_select
  on public.epos_fcargo_client_links for select to authenticated
  using (private.is_epos_admin());

-- OTP rate-limit / challenge bookkeeping (no SMS codes stored).
create table if not exists public.epos_fcargo_otp_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  challenge text,
  ip text,
  subject_type text check (subject_type in ('web', 'telegram')),
  subject_id text,
  kind text not null check (kind in ('start', 'resend', 'verify', 'verify_fail')),
  ok boolean not null default false,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists epos_fcargo_otp_attempts_phone_created_idx
  on public.epos_fcargo_otp_attempts (phone, created_at desc);

create index if not exists epos_fcargo_otp_attempts_ip_created_idx
  on public.epos_fcargo_otp_attempts (ip, created_at desc);

alter table public.epos_fcargo_otp_attempts enable row level security;

drop policy if exists epos_fcargo_otp_attempts_staff_select
  on public.epos_fcargo_otp_attempts;
create policy epos_fcargo_otp_attempts_staff_select
  on public.epos_fcargo_otp_attempts for select to authenticated
  using (private.is_epos_admin());
