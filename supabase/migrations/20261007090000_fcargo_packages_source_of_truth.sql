-- FCargo packages become the secondary mirror of truth; drop lead-order link table.

alter table public.epos_fcargo_packages
  add column if not exists from_soato text,
  add column if not exists to_soato text,
  add column if not exists source text
    check (source is null or source in ('lead', 'webapp', 'pull', 'webhook')),
  add column if not exists telegram_user_id bigint;

create index if not exists epos_fcargo_packages_telegram_idx
  on public.epos_fcargo_packages (telegram_user_id)
  where telegram_user_id is not null;

create index if not exists epos_fcargo_packages_from_soato_idx
  on public.epos_fcargo_packages (from_soato)
  where from_soato is not null;

create index if not exists epos_fcargo_packages_to_soato_idx
  on public.epos_fcargo_packages (to_soato)
  where to_soato is not null;

-- Move any remaining lead↔order links into the catalog (idempotent).
insert into public.epos_fcargo_packages (
  fcargo_order_id,
  tracking_number,
  status,
  status_raw,
  event_type,
  external_order_id,
  lead_id,
  last_event_at,
  raw_last,
  source
)
select
  o.fcargo_order_id,
  o.tracking_number,
  o.fcargo_status,
  coalesce(o.fcargo_status_raw, '{}'::jsonb),
  'orders_store.migrate',
  o.lead_id,
  o.lead_id,
  coalesce(o.last_synced_at, o.updated_at, o.created_at),
  jsonb_build_object('migrated_from', 'epos_fcargo_orders'),
  'lead'
from public.epos_fcargo_orders o
where not exists (
  select 1
  from public.epos_fcargo_packages p
  where p.fcargo_order_id = o.fcargo_order_id
     or (
       o.tracking_number is not null
       and o.tracking_number <> ''
       and p.tracking_number = o.tracking_number
     )
);

drop table if exists public.epos_fcargo_orders cascade;

-- Mini App shipments: allow FCargo-driven statuses alongside legacy CRM ones.
alter table public.epos_webapp_shipments
  drop constraint if exists epos_webapp_shipments_status_check;

alter table public.epos_webapp_shipments
  add constraint epos_webapp_shipments_status_check
  check (
    status in (
      'draft',
      'pending_manager',
      'confirmed',
      'cancelled',
      'from_fcargo'
    )
  );
