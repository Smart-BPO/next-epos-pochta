-- FCargo order links + request/webhook log for status sync

create table if not exists public.epos_fcargo_orders (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references public.epos_leads (id) on delete cascade,
  fcargo_order_id text not null,
  tracking_number text,
  fcargo_status text,
  fcargo_status_raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fcargo_order_id),
  unique (lead_id)
);

drop trigger if exists epos_fcargo_orders_updated_at on public.epos_fcargo_orders;
create trigger epos_fcargo_orders_updated_at
before update on public.epos_fcargo_orders
for each row execute function private.set_updated_at();

create index if not exists epos_fcargo_orders_tracking_idx
  on public.epos_fcargo_orders (tracking_number)
  where tracking_number is not null and tracking_number <> '';

create index if not exists epos_fcargo_orders_status_idx
  on public.epos_fcargo_orders (fcargo_status);

create index if not exists epos_fcargo_orders_synced_idx
  on public.epos_fcargo_orders (last_synced_at nulls first);

alter table public.epos_fcargo_orders enable row level security;

drop policy if exists epos_fcargo_orders_staff on public.epos_fcargo_orders;
create policy epos_fcargo_orders_staff
  on public.epos_fcargo_orders for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

-- Append-only request / webhook log (no API keys)
create table if not exists public.epos_fcargo_request_log (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('out', 'in')),
  method text not null default '',
  path text not null default '',
  http_status integer,
  duration_ms integer,
  ok boolean,
  lead_id text,
  order_id text,
  tracking_number text,
  request_body jsonb,
  response_body jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists epos_fcargo_request_log_created_idx
  on public.epos_fcargo_request_log (created_at desc);

create index if not exists epos_fcargo_request_log_lead_idx
  on public.epos_fcargo_request_log (lead_id)
  where lead_id is not null;

create index if not exists epos_fcargo_request_log_order_idx
  on public.epos_fcargo_request_log (order_id)
  where order_id is not null;

alter table public.epos_fcargo_request_log enable row level security;

drop policy if exists epos_fcargo_request_log_staff_select on public.epos_fcargo_request_log;
create policy epos_fcargo_request_log_staff_select
  on public.epos_fcargo_request_log for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_fcargo_request_log_staff_insert on public.epos_fcargo_request_log;
create policy epos_fcargo_request_log_staff_insert
  on public.epos_fcargo_request_log for insert to authenticated
  with check (private.is_epos_admin());
