create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.epos_admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  role text not null check (role in ('owner', 'editor', 'viewer')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_admin_users_updated_at on public.epos_admin_users;
create trigger epos_admin_users_updated_at
before update on public.epos_admin_users
for each row execute function private.set_updated_at();

create table if not exists public.epos_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists epos_admin_audit_log_created_idx
  on public.epos_admin_audit_log (created_at desc);

create table if not exists public.epos_leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('price', 'business', 'contact')),
  locale text not null default 'uz' check (locale in ('uz', 'ru')),
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'done', 'spam')),
  source text not null default 'website',
  payload jsonb not null default '{}'::jsonb,
  utm jsonb not null default '{}'::jsonb,
  request_id text unique,
  notified_email boolean not null default false,
  notified_telegram boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_leads_updated_at on public.epos_leads;
create trigger epos_leads_updated_at
before update on public.epos_leads
for each row execute function private.set_updated_at();

create index if not exists epos_leads_status_created_idx
  on public.epos_leads (status, created_at desc);

create table if not exists public.epos_webapp_contacts (
  session_id text primary key,
  phone text not null,
  first_name text not null default '',
  last_name text not null default '',
  locale text not null default 'uz' check (locale in ('uz', 'ru')),
  source text not null default 'manual'
    check (source in ('telegram_contact', 'manual')),
  telegram_user_id bigint,
  telegram_username text,
  init_data_ok boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_webapp_contacts_updated_at on public.epos_webapp_contacts;
create trigger epos_webapp_contacts_updated_at
before update on public.epos_webapp_contacts
for each row execute function private.set_updated_at();

create index if not exists epos_webapp_contacts_phone_idx on public.epos_webapp_contacts (phone);
create index if not exists epos_webapp_contacts_tg_idx on public.epos_webapp_contacts (telegram_user_id);

create table if not exists public.epos_webapp_shipments (
  id text primary key,
  contact_session_id text not null
    references public.epos_webapp_contacts (session_id) on delete restrict,
  locale text not null default 'uz' check (locale in ('uz', 'ru')),
  phone text not null default '',
  telegram_user_id bigint,
  from_settlement_id text not null default '',
  to_settlement_id text not null default '',
  from_label text not null default '',
  to_label text not null default '',
  weight_kg numeric,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  comment text not null default '',
  status text not null default 'pending_manager'
    check (status in ('draft', 'pending_manager', 'confirmed', 'cancelled')),
  track_number text,
  price_status text not null default 'pending_manager',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_webapp_shipments_updated_at on public.epos_webapp_shipments;
create trigger epos_webapp_shipments_updated_at
before update on public.epos_webapp_shipments
for each row execute function private.set_updated_at();

create index if not exists epos_webapp_shipments_status_idx on public.epos_webapp_shipments (status, created_at desc);
create index if not exists epos_webapp_shipments_contact_idx on public.epos_webapp_shipments (contact_session_id);

create table if not exists public.epos_news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  category text not null default 'company',
  cover_image text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_news_articles_updated_at on public.epos_news_articles;
create trigger epos_news_articles_updated_at
before update on public.epos_news_articles
for each row execute function private.set_updated_at();

create table if not exists public.epos_news_translations (
  article_id uuid not null references public.epos_news_articles (id) on delete cascade,
  locale text not null check (locale in ('uz', 'ru')),
  title text not null default '',
  excerpt text not null default '',
  body text not null default '',
  primary key (article_id, locale)
);

create table if not exists public.epos_site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null default '',
  phone_display text not null default '',
  email text not null default '',
  telegram_url text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  hours text not null default '',
  map_lat double precision,
  map_lng double precision,
  address_line text not null default '',
  address_line_uz text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.epos_site_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists epos_site_settings_updated_at on public.epos_site_settings;
create trigger epos_site_settings_updated_at
before update on public.epos_site_settings
for each row execute function private.set_updated_at();

create table if not exists public.epos_delivery_hubs (
  code text primary key,
  slug text not null unique,
  name_en text not null default '',
  name_ru text not null default '',
  name_uz text not null default '',
  settlement_id text,
  eta_hint_ru text not null default '',
  eta_hint_uz text not null default '',
  lead_ru text not null default '',
  lead_uz text not null default '',
  meta_title_ru text not null default '',
  meta_title_uz text not null default '',
  meta_description_ru text not null default '',
  meta_description_uz text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_delivery_hubs_updated_at on public.epos_delivery_hubs;
create trigger epos_delivery_hubs_updated_at
before update on public.epos_delivery_hubs
for each row execute function private.set_updated_at();
