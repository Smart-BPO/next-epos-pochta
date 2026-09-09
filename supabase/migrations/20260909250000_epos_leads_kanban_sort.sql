-- Kanban board ordering for leads (status columns + within-column order).
-- Higher sort_order = closer to top of column.

alter table public.epos_leads
  add column if not exists sort_order integer not null default 0;

-- Backfill from created_at so existing rows keep chronological order (newest on top).
update public.epos_leads
set sort_order = extract(epoch from coalesce(created_at, now()))::integer
where sort_order = 0;

create index if not exists epos_leads_status_sort_order_idx
  on public.epos_leads (status, sort_order desc);
