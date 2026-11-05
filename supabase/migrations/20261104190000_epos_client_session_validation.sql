-- Client session idle expiry + FCargo bearer validation timestamps.
-- Server-bound OTP challenges (hashed) for cabinet / Mini App linking.

alter table public.epos_fcargo_client_links
  add column if not exists last_validated_at timestamptz,
  add column if not exists session_expires_at timestamptz;

-- Backfill idle session window (30d from link) for existing active rows.
update public.epos_fcargo_client_links
set session_expires_at = coalesce(last_used_at, linked_at, created_at) + interval '30 days'
where revoked_at is null
  and session_expires_at is null;

create index if not exists epos_fcargo_client_links_validate_idx
  on public.epos_fcargo_client_links (last_validated_at nulls first, last_used_at desc)
  where revoked_at is null;

create table if not exists public.epos_fcargo_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  challenge_hash text not null,
  subject_type text check (subject_type in ('web', 'telegram')),
  subject_id text,
  ip text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists epos_fcargo_otp_challenges_lookup_idx
  on public.epos_fcargo_otp_challenges (phone, challenge_hash)
  where consumed_at is null;

create index if not exists epos_fcargo_otp_challenges_expires_idx
  on public.epos_fcargo_otp_challenges (expires_at);

alter table public.epos_fcargo_otp_challenges enable row level security;

drop policy if exists epos_fcargo_otp_challenges_staff_select
  on public.epos_fcargo_otp_challenges;
create policy epos_fcargo_otp_challenges_staff_select
  on public.epos_fcargo_otp_challenges for select to authenticated
  using (private.is_epos_admin());
