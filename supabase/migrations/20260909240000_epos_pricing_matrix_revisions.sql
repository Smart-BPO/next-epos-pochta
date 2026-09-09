-- Hub↔ hub sparse pricing overrides + revision history + draft settings row.

-- Allow live (1) + draft (2) singleton rows
alter table public.epos_pricing_settings
  drop constraint if exists epos_pricing_settings_id_check;

alter table public.epos_pricing_settings
  add constraint epos_pricing_settings_id_check check (id in (1, 2));

insert into public.epos_pricing_settings (id, enabled, formula_version, config)
select 2, enabled, formula_version, config
from public.epos_pricing_settings
where id = 1
on conflict (id) do nothing;

create table if not exists public.epos_pricing_routes (
  id bigint generated always as identity primary key,
  from_settlement_id text not null,
  to_settlement_id text not null,
  base_uzs integer not null check (base_uzs >= 0),
  per_kg_uzs integer not null check (per_kg_uzs >= 0),
  eta_min integer null check (eta_min is null or eta_min >= 1),
  eta_max integer null check (eta_max is null or eta_max >= 1),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint epos_pricing_routes_pair_uidx unique (from_settlement_id, to_settlement_id)
);

create index if not exists epos_pricing_routes_active_idx
  on public.epos_pricing_routes (active)
  where active = true;

drop trigger if exists epos_pricing_routes_updated_at on public.epos_pricing_routes;
create trigger epos_pricing_routes_updated_at
before update on public.epos_pricing_routes
for each row execute function private.set_updated_at();

alter table public.epos_pricing_routes enable row level security;

drop policy if exists epos_pricing_routes_staff_select on public.epos_pricing_routes;
create policy epos_pricing_routes_staff_select
  on public.epos_pricing_routes for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_pricing_routes_staff_write on public.epos_pricing_routes;
create policy epos_pricing_routes_staff_insert
  on public.epos_pricing_routes for insert to authenticated
  with check (private.is_epos_editor());

drop policy if exists epos_pricing_routes_staff_update on public.epos_pricing_routes;
create policy epos_pricing_routes_staff_update
  on public.epos_pricing_routes for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_pricing_routes_staff_delete on public.epos_pricing_routes;
create policy epos_pricing_routes_staff_delete
  on public.epos_pricing_routes for delete to authenticated
  using (private.is_epos_editor());

create table if not exists public.epos_pricing_revisions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid null,
  label text not null default '',
  kind text not null default 'auto' check (kind in ('auto', 'manual')),
  snapshot jsonb not null,
  experiment jsonb null
);

create index if not exists epos_pricing_revisions_created_idx
  on public.epos_pricing_revisions (created_at desc);

alter table public.epos_pricing_revisions enable row level security;

drop policy if exists epos_pricing_revisions_staff_select on public.epos_pricing_revisions;
create policy epos_pricing_revisions_staff_select
  on public.epos_pricing_revisions for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_pricing_revisions_staff_insert on public.epos_pricing_revisions;
create policy epos_pricing_revisions_staff_insert
  on public.epos_pricing_revisions for insert to authenticated
  with check (private.is_epos_editor());

-- Update live formula version tag when matrix ships
update public.epos_pricing_settings
set formula_version = '2026-09-v5-matrix'
where id in (1, 2)
  and formula_version = '2026-09-v4-cms';
