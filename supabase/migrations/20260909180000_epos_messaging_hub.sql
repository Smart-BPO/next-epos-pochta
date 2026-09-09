-- Messaging hub: providers, templates, notify rules, message log, OTP

create table if not exists public.epos_messaging_providers (
  id text primary key check (id in ('playmobile', 'eskiz', 'resend')),
  enabled boolean not null default false,
  is_primary_sms boolean not null default false,
  config_public jsonb not null default '{}'::jsonb,
  secrets_cipher text,
  secrets_meta jsonb not null default '{}'::jsonb,
  last_test_at timestamptz,
  last_test_ok boolean,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_messaging_providers_updated_at on public.epos_messaging_providers;
create trigger epos_messaging_providers_updated_at
before update on public.epos_messaging_providers
for each row execute function private.set_updated_at();

-- Exactly one primary SMS among enabled SMS providers (enforced in app; soft check)
create unique index if not exists epos_messaging_providers_one_primary_sms
  on public.epos_messaging_providers (is_primary_sms)
  where is_primary_sms = true and id in ('playmobile', 'eskiz');

insert into public.epos_messaging_providers (id, enabled, is_primary_sms, config_public)
values
  ('playmobile', false, true, '{"originator":"","base_url":""}'::jsonb),
  ('eskiz', false, false, '{"from":"4546"}'::jsonb),
  ('resend', false, false, '{"from_email":"","from_name":"EPOS POCHTA"}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.epos_message_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  channel text not null check (channel in ('sms', 'email')),
  locale text not null check (locale in ('uz', 'ru')),
  name text not null default '',
  description text not null default '',
  subject text not null default '',
  body_text text not null default '',
  body_html text not null default '',
  variables text[] not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, channel, locale)
);

drop trigger if exists epos_message_templates_updated_at on public.epos_message_templates;
create trigger epos_message_templates_updated_at
before update on public.epos_message_templates
for each row execute function private.set_updated_at();

create index if not exists epos_message_templates_key_idx
  on public.epos_message_templates (key);

create table if not exists public.epos_notify_rules (
  event text primary key check (event in (
    'lead_created_staff',
    'lead_created_customer',
    'shipment_status',
    'otp_send'
  )),
  enabled boolean not null default true,
  channels jsonb not null default '{"sms":false,"email":false,"telegram":false}'::jsonb,
  audience text not null default 'staff'
    check (audience in ('staff', 'customer', 'custom')),
  staff_emails text[] not null default '{}',
  staff_phones text[] not null default '{}',
  customer_from text not null default 'lead.phone'
    check (customer_from in ('lead.phone', 'shipment.contact', 'otp.phone')),
  locale_mode text not null default 'customer'
    check (locale_mode in ('customer', 'uz', 'ru', 'both')),
  sms_provider text not null default 'primary'
    check (sms_provider in ('primary', 'playmobile', 'eskiz', 'failover')),
  template_sms_key text,
  template_email_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists epos_notify_rules_updated_at on public.epos_notify_rules;
create trigger epos_notify_rules_updated_at
before update on public.epos_notify_rules
for each row execute function private.set_updated_at();

create table if not exists public.epos_message_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  channel text not null check (channel in ('sms', 'email', 'telegram')),
  provider text,
  to_masked text not null default '',
  template_key text,
  locale text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  error text,
  payload_snapshot jsonb not null default '{}'::jsonb,
  entity_type text,
  entity_id text,
  idempotency_key text
);

create index if not exists epos_message_log_created_idx
  on public.epos_message_log (created_at desc);

create index if not exists epos_message_log_entity_idx
  on public.epos_message_log (entity_type, entity_id);

create unique index if not exists epos_message_log_idempotency_idx
  on public.epos_message_log (idempotency_key)
  where idempotency_key is not null and status = 'sent';

create table if not exists public.epos_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  purpose text not null default 'verify'
    check (purpose in ('verify', 'login', 'webapp')),
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists epos_otp_challenges_phone_idx
  on public.epos_otp_challenges (phone, created_at desc);

-- Seed system templates
insert into public.epos_message_templates
  (key, channel, locale, name, description, subject, body_text, body_html, variables, is_system)
values
  (
    'lead_staff', 'email', 'uz',
    'Yangi ariza — xodimlarga',
    'Saytdan yangi ariza kelganda xodimlarga email.',
    '[EPOS] {{type}} {{id}}',
    'Yangi ariza: {{type}} {{id}}\nMijoz: {{name}}\nTelefon: {{phone}}\n{{details}}',
    '<p>Yangi ariza: <strong>{{type}}</strong> {{id}}</p><p>Mijoz: {{name}}<br/>Telefon: {{phone}}</p><pre>{{details}}</pre>',
    array['id','type','name','phone','details','locale'],
    true
  ),
  (
    'lead_staff', 'email', 'ru',
    'Новая заявка — сотрудникам',
    'Письмо сотрудникам при новой заявке с сайта.',
    '[EPOS] {{type}} {{id}}',
    'Новая заявка: {{type}} {{id}}\nКлиент: {{name}}\nТелефон: {{phone}}\n{{details}}',
    '<p>Новая заявка: <strong>{{type}}</strong> {{id}}</p><p>Клиент: {{name}}<br/>Телефон: {{phone}}</p><pre>{{details}}</pre>',
    array['id','type','name','phone','details','locale'],
    true
  ),
  (
    'lead_staff', 'sms', 'uz',
    'Yangi ariza SMS',
    'Xodimlarga qisqa SMS.',
    '',
    'EPOS: yangi ariza {{id}}. Tel: {{phone}}',
    '',
    array['id','type','name','phone'],
    true
  ),
  (
    'lead_staff', 'sms', 'ru',
    'Новая заявка SMS',
    'Короткое SMS сотрудникам.',
    '',
    'EPOS: новая заявка {{id}}. Тел: {{phone}}',
    '',
    array['id','type','name','phone'],
    true
  ),
  (
    'lead_customer_ack', 'sms', 'uz',
    'Ariza qabul qilindi — mijoz',
    'Mijozga tasdiq SMS.',
    '',
    'EPOS POCHTA: arizangiz qabul qilindi ({{id}}). Tez orada bog''lanamiz.',
    '',
    array['id','name','phone'],
    true
  ),
  (
    'lead_customer_ack', 'sms', 'ru',
    'Заявка принята — клиент',
    'SMS-подтверждение клиенту.',
    '',
    'EPOS POCHTA: ваша заявка принята ({{id}}). Мы свяжемся с вами.',
    '',
    array['id','name','phone'],
    true
  ),
  (
    'lead_customer_ack', 'email', 'uz',
    'Ariza qabul qilindi — email',
    'Mijozga email tasdiq.',
    'Arizangiz qabul qilindi — EPOS POCHTA',
    'Salom{{name_part}}!\n\nArizangiz ({{id}}) qabul qilindi. Tez orada bog''lanamiz.\n\nEPOS POCHTA',
    '<p>Salom{{name_part}}!</p><p>Arizangiz (<strong>{{id}}</strong>) qabul qilindi. Tez orada bog''lanamiz.</p><p>EPOS POCHTA</p>',
    array['id','name','name_part','phone'],
    true
  ),
  (
    'lead_customer_ack', 'email', 'ru',
    'Заявка принята — email',
    'Email-подтверждение клиенту.',
    'Ваша заявка принята — EPOS POCHTA',
    'Здравствуйте{{name_part}}!\n\nВаша заявка ({{id}}) принята. Мы свяжемся с вами.\n\nEPOS POCHTA',
    '<p>Здравствуйте{{name_part}}!</p><p>Ваша заявка (<strong>{{id}}</strong>) принята. Мы свяжемся с вами.</p><p>EPOS POCHTA</p>',
    array['id','name','name_part','phone'],
    true
  ),
  (
    'shipment_status', 'sms', 'uz',
    'Jo''natma holati',
    'Mijozga status / trek SMS.',
    '',
    'EPOS: jo''natma {{id}} — {{status_label}}. Trek: {{track}}',
    '',
    array['id','status','status_label','track','phone','route'],
    true
  ),
  (
    'shipment_status', 'sms', 'ru',
    'Статус отправления',
    'SMS клиенту о статусе / треке.',
    '',
    'EPOS: отправление {{id}} — {{status_label}}. Трек: {{track}}',
    '',
    array['id','status','status_label','track','phone','route'],
    true
  ),
  (
    'shipment_status', 'email', 'uz',
    'Jo''natma holati — email',
    'Email mijozga status haqida.',
    'Jo''natma {{id}}: {{status_label}}',
    'Jo''natma {{id}}\nYo''nalish: {{route}}\nHolat: {{status_label}}\nTrek: {{track}}',
    '<p>Jo''natma <strong>{{id}}</strong></p><p>Yo''nalish: {{route}}<br/>Holat: {{status_label}}<br/>Trek: {{track}}</p>',
    array['id','status','status_label','track','phone','route'],
    true
  ),
  (
    'shipment_status', 'email', 'ru',
    'Статус отправления — email',
    'Email клиенту о статусе.',
    'Отправление {{id}}: {{status_label}}',
    'Отправление {{id}}\nМаршрут: {{route}}\nСтатус: {{status_label}}\nТрек: {{track}}',
    '<p>Отправление <strong>{{id}}</strong></p><p>Маршрут: {{route}}<br/>Статус: {{status_label}}<br/>Трек: {{track}}</p>',
    array['id','status','status_label','track','phone','route'],
    true
  ),
  (
    'otp', 'sms', 'uz',
    'SMS kod',
    'Tasdiqlash kodi. Eskiz shabloniga moslashtiring.',
    '',
    'EPOS POCHTA tasdiqlash kodi: {{code}}. Hech kimga aytmang.',
    '',
    array['code','phone'],
    true
  ),
  (
    'otp', 'sms', 'ru',
    'SMS-код',
    'Код подтверждения. Согласуйте с шаблоном Eskiz.',
    '',
    'EPOS POCHTA код подтверждения: {{code}}. Никому не сообщайте.',
    '',
    array['code','phone'],
    true
  )
on conflict (key, channel, locale) do nothing;

insert into public.epos_notify_rules
  (event, enabled, channels, audience, customer_from, locale_mode, sms_provider, template_sms_key, template_email_key)
values
  (
    'lead_created_staff', true,
    '{"sms":false,"email":true,"telegram":true}'::jsonb,
    'staff', 'lead.phone', 'uz', 'primary',
    'lead_staff', 'lead_staff'
  ),
  (
    'lead_created_customer', true,
    '{"sms":true,"email":false,"telegram":false}'::jsonb,
    'customer', 'lead.phone', 'customer', 'primary',
    'lead_customer_ack', 'lead_customer_ack'
  ),
  (
    'shipment_status', true,
    '{"sms":true,"email":false,"telegram":false}'::jsonb,
    'customer', 'shipment.contact', 'customer', 'primary',
    'shipment_status', 'shipment_status'
  ),
  (
    'otp_send', true,
    '{"sms":true,"email":false,"telegram":false}'::jsonb,
    'customer', 'otp.phone', 'customer', 'primary',
    'otp', null
  )
on conflict (event) do nothing;

-- RLS
alter table public.epos_messaging_providers enable row level security;
alter table public.epos_message_templates enable row level security;
alter table public.epos_notify_rules enable row level security;
alter table public.epos_message_log enable row level security;
alter table public.epos_otp_challenges enable row level security;

drop policy if exists epos_messaging_providers_staff on public.epos_messaging_providers;
create policy epos_messaging_providers_staff
  on public.epos_messaging_providers for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_message_templates_staff on public.epos_message_templates;
create policy epos_message_templates_staff
  on public.epos_message_templates for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_notify_rules_staff on public.epos_notify_rules;
create policy epos_notify_rules_staff
  on public.epos_notify_rules for all to authenticated
  using (private.is_epos_admin())
  with check (private.is_epos_admin());

drop policy if exists epos_message_log_staff_select on public.epos_message_log;
create policy epos_message_log_staff_select
  on public.epos_message_log for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_message_log_staff_insert on public.epos_message_log;
create policy epos_message_log_staff_insert
  on public.epos_message_log for insert to authenticated
  with check (private.is_epos_admin());

-- OTP: no client policies (service role only via admin client)
