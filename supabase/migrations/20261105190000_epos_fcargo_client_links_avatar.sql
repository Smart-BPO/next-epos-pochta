-- Persist FCargo profile avatar for cabinet user chip.
alter table public.epos_fcargo_client_links
  add column if not exists avatar_url text null;
