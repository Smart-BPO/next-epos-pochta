-- Fix anon/public news reads: evaluating OR private.is_epos_admin() failed
-- for anon (no EXECUTE on the helper). Split published vs staff select.

drop policy if exists epos_news_public_select on public.epos_news_articles;
create policy epos_news_public_select
  on public.epos_news_articles for select to anon, authenticated
  using (status = 'published');

drop policy if exists epos_news_articles_staff_select on public.epos_news_articles;
create policy epos_news_articles_staff_select
  on public.epos_news_articles for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_news_tr_public_select on public.epos_news_translations;
create policy epos_news_tr_public_select
  on public.epos_news_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.epos_news_articles a
      where a.id = article_id and a.status = 'published'
    )
  );

drop policy if exists epos_news_translations_staff_select on public.epos_news_translations;
create policy epos_news_translations_staff_select
  on public.epos_news_translations for select to authenticated
  using (private.is_epos_admin());
