-- Catalog of all FCargo packages/orders (any channel), linkable later to Mini App contacts

create table if not exists public.epos_fcargo_packages (
  id uuid primary key default gen_random_uuid(),
  fcargo_order_id text,
  fcargo_package_id text,
  tracking_number text,
  barcode text,
  status text,
  status_raw jsonb not null default '{}'::jsonb,
  event_type text,
  phones text[] not null default '{}',
  external_order_id text,
  lead_id text references public.epos_leads (id) on delete set null,
  contact_session_id text references public.epos_webapp_contacts (session_id) on delete set null,
  last_event_at timestamptz,
  raw_last jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_fcargo_packages_updated_at on public.epos_fcargo_packages;
create trigger epos_fcargo_packages_updated_at
before update on public.epos_fcargo_packages
for each row execute function private.set_updated_at();

create unique index if not exists epos_fcargo_packages_tracking_uidx
  on public.epos_fcargo_packages (tracking_number)
  where tracking_number is not null and tracking_number <> '';

create unique index if not exists epos_fcargo_packages_order_pkg_uidx
  on public.epos_fcargo_packages (fcargo_order_id, (coalesce(fcargo_package_id, '')))
  where fcargo_order_id is not null and fcargo_order_id <> '';

create index if not exists epos_fcargo_packages_phones_gin
  on public.epos_fcargo_packages using gin (phones);

create index if not exists epos_fcargo_packages_contact_idx
  on public.epos_fcargo_packages (contact_session_id)
  where contact_session_id is not null;

create index if not exists epos_fcargo_packages_lead_idx
  on public.epos_fcargo_packages (lead_id)
  where lead_id is not null;

create index if not exists epos_fcargo_packages_status_idx
  on public.epos_fcargo_packages (status);

create index if not exists epos_webapp_shipments_track_idx
  on public.epos_webapp_shipments (track_number)
  where track_number is not null and track_number <> '';

alter table public.epos_fcargo_packages enable row level security;

drop policy if exists epos_fcargo_packages_staff on public.epos_fcargo_packages;
create policy epos_fcargo_packages_staff
  on public.epos_fcargo_packages for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());
