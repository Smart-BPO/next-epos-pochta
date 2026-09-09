-- Drop legacy staff write policies that still use is_epos_admin() (viewer could write via cookie client).
-- Keep the is_epos_editor() policies created in epos_admin_taxonomy_rls.

drop policy if exists epos_news_staff_insert on public.epos_news_articles;
drop policy if exists epos_news_staff_update on public.epos_news_articles;
drop policy if exists epos_news_staff_delete on public.epos_news_articles;

drop policy if exists epos_news_tr_staff_insert on public.epos_news_translations;
drop policy if exists epos_news_tr_staff_update on public.epos_news_translations;
drop policy if exists epos_news_tr_staff_delete on public.epos_news_translations;

drop policy if exists epos_hubs_staff_insert on public.epos_delivery_hubs;
drop policy if exists epos_hubs_staff_update on public.epos_delivery_hubs;
drop policy if exists epos_hubs_staff_delete on public.epos_delivery_hubs;

drop policy if exists epos_settings_staff_update on public.epos_site_settings;

-- Ensure editor-only policies exist under canonical names (idempotent recreate).
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
