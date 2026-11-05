-- Cached FCargo calculator quotes for /delivery/{from}/{to}/ pages (1 kg reference parcel).
-- Prerendered pages read this at build time; runtime refreshes stale rows.
create table if not exists public.epos_route_quotes (
  from_soato text not null,
  to_soato text not null,
  weight_kg numeric not null default 1,
  amount integer not null check (amount >= 0),
  currency text not null default 'UZS',
  rate_source text not null default 'fcargo',
  fetched_at timestamptz not null default now(),
  primary key (from_soato, to_soato, weight_kg)
);

create index if not exists epos_route_quotes_fetched_at_idx
  on public.epos_route_quotes (fetched_at);

alter table public.epos_route_quotes enable row level security;

revoke all on public.epos_route_quotes from anon, authenticated;
