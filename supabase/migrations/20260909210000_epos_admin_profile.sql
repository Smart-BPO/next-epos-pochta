-- Admin profile fields + OTP channel/email support

alter table public.epos_admin_users
  add column if not exists phone text,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists bio text not null default '',
  add column if not exists email_verified_at timestamptz;

create unique index if not exists epos_admin_users_phone_uidx
  on public.epos_admin_users (phone)
  where phone is not null and phone <> '';

-- OTP challenges: channel + recipient + expanded purposes
alter table public.epos_otp_challenges
  add column if not exists channel text not null default 'sms',
  add column if not exists recipient text;

update public.epos_otp_challenges
set recipient = phone
where recipient is null and phone is not null;

alter table public.epos_otp_challenges
  alter column phone drop not null;

update public.epos_otp_challenges
set channel = 'sms'
where channel is null or channel = '';

alter table public.epos_otp_challenges
  drop constraint if exists epos_otp_challenges_channel_check;

alter table public.epos_otp_challenges
  add constraint epos_otp_challenges_channel_check
  check (channel in ('sms', 'email'));

alter table public.epos_otp_challenges
  drop constraint if exists epos_otp_challenges_purpose_check;

alter table public.epos_otp_challenges
  add constraint epos_otp_challenges_purpose_check
  check (purpose in (
    'verify',
    'login',
    'webapp',
    'profile_phone',
    'profile_email'
  ));

alter table public.epos_otp_challenges
  drop constraint if exists epos_otp_challenges_recipient_chk;

alter table public.epos_otp_challenges
  add constraint epos_otp_challenges_recipient_chk
  check (
    (recipient is not null and length(trim(recipient)) > 0)
    or (phone is not null and length(trim(phone)) > 0)
  );

create index if not exists epos_otp_challenges_recipient_idx
  on public.epos_otp_challenges (channel, recipient, purpose, created_at desc);

-- Notify rules: allow otp_email event
alter table public.epos_notify_rules
  drop constraint if exists epos_notify_rules_event_check;

alter table public.epos_notify_rules
  add constraint epos_notify_rules_event_check
  check (event in (
    'lead_created_staff',
    'lead_created_customer',
    'shipment_status',
    'otp_send',
    'otp_email'
  ));

-- Email OTP templates
insert into public.epos_message_templates
  (key, channel, locale, name, description, subject, body_text, body_html, variables, is_system)
values
  (
    'otp', 'email', 'uz',
    'Email tasdiqlash kodi',
    'Profil / email uchun OTP.',
    'EPOS POCHTA kod: {{code}}',
    'EPOS POCHTA tasdiqlash kodi: {{code}}. Hech kimga aytmang.',
    '<p>EPOS POCHTA tasdiqlash kodi: <strong>{{code}}</strong></p><p>Hech kimga aytmang.</p>',
    array['code','email','phone'],
    true
  ),
  (
    'otp', 'email', 'ru',
    'Email-код подтверждения',
    'OTP для профиля / email.',
    'EPOS POCHTA код: {{code}}',
    'EPOS POCHTA код подтверждения: {{code}}. Никому не сообщайте.',
    '<p>EPOS POCHTA код подтверждения: <strong>{{code}}</strong></p><p>Никому не сообщайте.</p>',
    array['code','email','phone'],
    true
  )
on conflict (key, channel, locale) do nothing;

insert into public.epos_notify_rules
  (event, enabled, channels, audience, customer_from, locale_mode, sms_provider, template_sms_key, template_email_key)
values
  (
    'otp_email', true,
    '{"sms":false,"email":true,"telegram":false}'::jsonb,
    'customer', 'otp.phone', 'customer', 'primary',
    null, 'otp'
  )
on conflict (event) do nothing;
