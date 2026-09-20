-- Full FCargo logging: source + correlation for API / webhook / worker traces

alter table public.epos_fcargo_request_log
  add column if not exists source text,
  add column if not exists correlation_id text;

alter table public.epos_fcargo_request_log
  drop constraint if exists epos_fcargo_request_log_source_check;

alter table public.epos_fcargo_request_log
  add constraint epos_fcargo_request_log_source_check
  check (
    source is null
    or source in (
      'out_api',
      'in_webhook',
      'in_sync',
      'in_drain',
      'inbox_worker'
    )
  );

-- Backfill from direction/path for existing rows
update public.epos_fcargo_request_log
set source = case
  when direction = 'out' then 'out_api'
  when path like '%/webhook%' then 'in_webhook'
  when path like '%/sync%' then 'in_sync'
  when path like '%/drain%' then 'in_drain'
  else 'in_webhook'
end
where source is null;

create index if not exists epos_fcargo_request_log_source_created_idx
  on public.epos_fcargo_request_log (source, created_at desc);

create index if not exists epos_fcargo_request_log_correlation_idx
  on public.epos_fcargo_request_log (correlation_id)
  where correlation_id is not null;
