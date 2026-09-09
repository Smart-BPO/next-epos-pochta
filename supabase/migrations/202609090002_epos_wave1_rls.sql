create or replace function private.is_epos_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.epos_admin_users u
    where u.user_id = auth.uid()
      and u.is_active = true
  );
$$;

revoke all on function private.is_epos_admin() from public;
grant execute on function private.is_epos_admin() to authenticated;

alter table public.epos_admin_users enable row level security;
alter table public.epos_admin_audit_log enable row level security;
alter table public.epos_leads enable row level security;
alter table public.epos_webapp_contacts enable row level security;
alter table public.epos_webapp_shipments enable row level security;
alter table public.epos_news_articles enable row level security;
alter table public.epos_news_translations enable row level security;
alter table public.epos_site_settings enable row level security;
alter table public.epos_delivery_hubs enable row level security;

drop policy if exists epos_admin_users_select_own_or_staff on public.epos_admin_users;
create policy epos_admin_users_select_own_or_staff
  on public.epos_admin_users for select to authenticated
  using (user_id = auth.uid() or private.is_epos_admin());

drop policy if exists epos_admin_users_update_staff on public.epos_admin_users;
create policy epos_admin_users_update_staff
  on public.epos_admin_users for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_admin_users_insert_staff on public.epos_admin_users;
create policy epos_admin_users_insert_staff
  on public.epos_admin_users for insert to authenticated
  with check (private.is_epos_admin());

drop policy if exists epos_audit_select_staff on public.epos_admin_audit_log;
create policy epos_audit_select_staff
  on public.epos_admin_audit_log for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_audit_insert_staff on public.epos_admin_audit_log;
create policy epos_audit_insert_staff
  on public.epos_admin_audit_log for insert to authenticated
  with check (private.is_epos_admin());

drop policy if exists epos_leads_staff_select on public.epos_leads;
create policy epos_leads_staff_select
  on public.epos_leads for select to authenticated
  using (private.is_epos_admin());
drop policy if exists epos_leads_staff_update on public.epos_leads;
create policy epos_leads_staff_update
  on public.epos_leads for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_webapp_contacts_staff_select on public.epos_webapp_contacts;
create policy epos_webapp_contacts_staff_select
  on public.epos_webapp_contacts for select to authenticated
  using (private.is_epos_admin());
drop policy if exists epos_webapp_contacts_staff_update on public.epos_webapp_contacts;
create policy epos_webapp_contacts_staff_update
  on public.epos_webapp_contacts for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_webapp_shipments_staff_select on public.epos_webapp_shipments;
create policy epos_webapp_shipments_staff_select
  on public.epos_webapp_shipments for select to authenticated
  using (private.is_epos_admin());
drop policy if exists epos_webapp_shipments_staff_update on public.epos_webapp_shipments;
create policy epos_webapp_shipments_staff_update
  on public.epos_webapp_shipments for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_news_public_select on public.epos_news_articles;
create policy epos_news_public_select
  on public.epos_news_articles for select to anon, authenticated
  using (status = 'published' or private.is_epos_admin());
drop policy if exists epos_news_staff_insert on public.epos_news_articles;
create policy epos_news_staff_insert
  on public.epos_news_articles for insert to authenticated
  with check (private.is_epos_admin());
drop policy if exists epos_news_staff_update on public.epos_news_articles;
create policy epos_news_staff_update
  on public.epos_news_articles for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());
drop policy if exists epos_news_staff_delete on public.epos_news_articles;
create policy epos_news_staff_delete
  on public.epos_news_articles for delete to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_news_tr_public_select on public.epos_news_translations;
create policy epos_news_tr_public_select
  on public.epos_news_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.epos_news_articles a
      where a.id = article_id
        and (a.status = 'published' or private.is_epos_admin())
    )
  );
drop policy if exists epos_news_tr_staff_insert on public.epos_news_translations;
create policy epos_news_tr_staff_insert
  on public.epos_news_translations for insert to authenticated
  with check (private.is_epos_admin());
drop policy if exists epos_news_tr_staff_update on public.epos_news_translations;
create policy epos_news_tr_staff_update
  on public.epos_news_translations for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());
drop policy if exists epos_news_tr_staff_delete on public.epos_news_translations;
create policy epos_news_tr_staff_delete
  on public.epos_news_translations for delete to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_settings_public_select on public.epos_site_settings;
create policy epos_settings_public_select
  on public.epos_site_settings for select to anon, authenticated
  using (true);
drop policy if exists epos_settings_staff_update on public.epos_site_settings;
create policy epos_settings_staff_update
  on public.epos_site_settings for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_hubs_public_select on public.epos_delivery_hubs;
create policy epos_hubs_public_select
  on public.epos_delivery_hubs for select to anon, authenticated
  using (is_active = true or private.is_epos_admin());
drop policy if exists epos_hubs_staff_insert on public.epos_delivery_hubs;
create policy epos_hubs_staff_insert
  on public.epos_delivery_hubs for insert to authenticated
  with check (private.is_epos_admin());
drop policy if exists epos_hubs_staff_update on public.epos_delivery_hubs;
create policy epos_hubs_staff_update
  on public.epos_delivery_hubs for update to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());
drop policy if exists epos_hubs_staff_delete on public.epos_delivery_hubs;
create policy epos_hubs_staff_delete
  on public.epos_delivery_hubs for delete to authenticated
  using (private.is_epos_admin());
