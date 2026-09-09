alter table public.epos_webapp_contacts
  add column if not exists photo_url text;

comment on column public.epos_webapp_contacts.photo_url is
  'Telegram profile photo URL (from WebApp user.photo_url or Bot API cache path)';
