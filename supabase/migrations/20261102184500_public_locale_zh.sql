-- Allow Simplified Chinese on public leads, Mini App contacts/shipments, and news.

alter table public.epos_leads drop constraint if exists epos_leads_locale_check;
alter table public.epos_leads
  add constraint epos_leads_locale_check
  check (locale in ('uz', 'ru', 'zh'));

alter table public.epos_webapp_contacts drop constraint if exists epos_webapp_contacts_locale_check;
alter table public.epos_webapp_contacts
  add constraint epos_webapp_contacts_locale_check
  check (locale in ('uz', 'ru', 'zh'));

alter table public.epos_webapp_shipments drop constraint if exists epos_webapp_shipments_locale_check;
alter table public.epos_webapp_shipments
  add constraint epos_webapp_shipments_locale_check
  check (locale in ('uz', 'ru', 'zh'));

alter table public.epos_news_translations drop constraint if exists epos_news_translations_locale_check;
alter table public.epos_news_translations
  add constraint epos_news_translations_locale_check
  check (locale in ('uz', 'ru', 'zh'));
