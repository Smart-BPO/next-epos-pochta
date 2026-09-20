-- Richer FCargo request log for CMS debugging (headers + bodies)

alter table public.epos_fcargo_request_log
  add column if not exists request_headers jsonb,
  add column if not exists response_headers jsonb,
  add column if not exists url text;
