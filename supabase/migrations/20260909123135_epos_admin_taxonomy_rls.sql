-- News category taxonomy + delivery hub body/FAQ + role-aware write helpers/policies.

create table if not exists public.epos_news_categories (
  id text primary key,
  label_uz text not null default '',
  label_ru text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_news_categories_updated_at on public.epos_news_categories;
create trigger epos_news_categories_updated_at
before update on public.epos_news_categories
for each row execute function private.set_updated_at();

insert into public.epos_news_categories (id, label_uz, label_ru, sort_order, is_active)
values
  ('company', 'Kompaniya', 'Компания', 10, true),
  ('product', 'Mahsulot', 'Продукт', 20, true),
  ('business', 'Biznes', 'Бизнес', 30, true),
  ('geography', 'Geografiya', 'География', 40, true)
on conflict (id) do nothing;

alter table public.epos_delivery_hubs
  add column if not exists body_ru jsonb not null default '[]'::jsonb,
  add column if not exists body_uz jsonb not null default '[]'::jsonb,
  add column if not exists faq_ru jsonb not null default '[]'::jsonb,
  add column if not exists faq_uz jsonb not null default '[]'::jsonb;

-- Role helpers for RLS (defense in depth; CMS writes still use service role).
create or replace function private.epos_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.epos_admin_users
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

revoke all on function private.epos_admin_role() from public;
grant execute on function private.epos_admin_role() to authenticated;

create or replace function private.is_epos_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.epos_admin_role() in ('owner', 'editor'), false);
$$;

revoke all on function private.is_epos_editor() from public;
grant execute on function private.is_epos_editor() to authenticated;

alter table public.epos_news_categories enable row level security;

drop policy if exists epos_news_categories_public_read on public.epos_news_categories;
create policy epos_news_categories_public_read
  on public.epos_news_categories for select to anon, authenticated
  using (is_active = true or private.is_epos_admin());

drop policy if exists epos_news_categories_staff_write on public.epos_news_categories;
create policy epos_news_categories_staff_insert
  on public.epos_news_categories for insert to authenticated
  with check (private.is_epos_editor());

drop policy if exists epos_news_categories_staff_update on public.epos_news_categories;
create policy epos_news_categories_staff_update
  on public.epos_news_categories for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_news_categories_staff_delete on public.epos_news_categories;
create policy epos_news_categories_staff_delete
  on public.epos_news_categories for delete to authenticated
  using (private.is_epos_editor());

-- Tighten content write policies: viewer can still SELECT via is_epos_admin.
drop policy if exists epos_news_articles_staff_insert on public.epos_news_articles;
create policy epos_news_articles_staff_insert
  on public.epos_news_articles for insert to authenticated
  with check (private.is_epos_editor());

drop policy if exists epos_news_articles_staff_update on public.epos_news_articles;
create policy epos_news_articles_staff_update
  on public.epos_news_articles for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_news_articles_staff_delete on public.epos_news_articles;
create policy epos_news_articles_staff_delete
  on public.epos_news_articles for delete to authenticated
  using (private.is_epos_editor());

drop policy if exists epos_news_translations_staff_insert on public.epos_news_translations;
create policy epos_news_translations_staff_insert
  on public.epos_news_translations for insert to authenticated
  with check (private.is_epos_editor());

drop policy if exists epos_news_translations_staff_update on public.epos_news_translations;
create policy epos_news_translations_staff_update
  on public.epos_news_translations for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_news_translations_staff_delete on public.epos_news_translations;
create policy epos_news_translations_staff_delete
  on public.epos_news_translations for delete to authenticated
  using (private.is_epos_editor());

drop policy if exists epos_delivery_hubs_staff_insert on public.epos_delivery_hubs;
create policy epos_delivery_hubs_staff_insert
  on public.epos_delivery_hubs for insert to authenticated
  with check (private.is_epos_editor());

drop policy if exists epos_delivery_hubs_staff_update on public.epos_delivery_hubs;
create policy epos_delivery_hubs_staff_update
  on public.epos_delivery_hubs for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_delivery_hubs_staff_delete on public.epos_delivery_hubs;
create policy epos_delivery_hubs_staff_delete
  on public.epos_delivery_hubs for delete to authenticated
  using (private.is_epos_editor());

drop policy if exists epos_site_settings_staff_update on public.epos_site_settings;
create policy epos_site_settings_staff_update
  on public.epos_site_settings for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_leads_staff_update on public.epos_leads;
create policy epos_leads_staff_update
  on public.epos_leads for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_webapp_shipments_staff_update on public.epos_webapp_shipments;
create policy epos_webapp_shipments_staff_update
  on public.epos_webapp_shipments for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

-- Storage writes: editor/owner only
drop policy if exists epos_media_staff_insert on storage.objects;
create policy epos_media_staff_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'epos-media' and private.is_epos_editor());

drop policy if exists epos_media_staff_update on storage.objects;
create policy epos_media_staff_update
  on storage.objects for update to authenticated
  using (bucket_id = 'epos-media' and private.is_epos_editor())
  with check (bucket_id = 'epos-media' and private.is_epos_editor());

drop policy if exists epos_media_staff_delete on storage.objects;
create policy epos_media_staff_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'epos-media' and private.is_epos_editor());
