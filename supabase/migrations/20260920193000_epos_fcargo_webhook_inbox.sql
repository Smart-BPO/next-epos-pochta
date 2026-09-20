-- Durable inbox for FCargo webhooks: fast ack → async ingest

create table if not exists public.epos_fcargo_webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  delivery_id text,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed')),
  attempts int not null default 0,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  available_at timestamptz not null default now(),
  locked_at timestamptz
);

create unique index if not exists epos_fcargo_webhook_inbox_event_uidx
  on public.epos_fcargo_webhook_inbox (event_id);

create index if not exists epos_fcargo_webhook_inbox_claim_idx
  on public.epos_fcargo_webhook_inbox (status, available_at, received_at);

alter table public.epos_fcargo_webhook_inbox enable row level security;

drop policy if exists epos_fcargo_webhook_inbox_staff on public.epos_fcargo_webhook_inbox;
create policy epos_fcargo_webhook_inbox_staff
  on public.epos_fcargo_webhook_inbox for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

-- Claim a batch for processing (SKIP LOCKED). Also reclaims stale processing rows.
create or replace function public.epos_fcargo_webhook_inbox_claim(p_limit int default 5)
returns setof public.epos_fcargo_webhook_inbox
language plpgsql
security definer
set search_path = public
as $$
declare
  lim int := greatest(1, least(coalesce(p_limit, 5), 50));
begin
  return query
  with picked as (
    select i.id
    from public.epos_fcargo_webhook_inbox i
    where (
      (i.status = 'pending' and i.available_at <= now())
      or (
        i.status = 'processing'
        and i.locked_at is not null
        and i.locked_at < now() - interval '5 minutes'
      )
    )
    order by i.received_at asc
    for update of i skip locked
    limit lim
  )
  update public.epos_fcargo_webhook_inbox dest
  set
    status = 'processing',
    locked_at = now(),
    attempts = dest.attempts + 1
  from picked
  where dest.id = picked.id
  returning dest.*;
end;
$$;

revoke all on function public.epos_fcargo_webhook_inbox_claim(int) from public;
grant execute on function public.epos_fcargo_webhook_inbox_claim(int) to service_role;
