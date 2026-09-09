-- Draft leads for multi-step request-price + opaque resume token.

alter table public.epos_leads
  drop constraint if exists epos_leads_status_check;

alter table public.epos_leads
  add constraint epos_leads_status_check
  check (status in ('draft', 'new', 'in_progress', 'done', 'spam'));

alter table public.epos_leads
  add column if not exists resume_token uuid;

update public.epos_leads
set resume_token = gen_random_uuid()
where resume_token is null;

alter table public.epos_leads
  alter column resume_token set default gen_random_uuid();

alter table public.epos_leads
  alter column resume_token set not null;

create unique index if not exists epos_leads_resume_token_uidx
  on public.epos_leads (resume_token);
