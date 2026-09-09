-- Seed messaging templates and notify rules (idempotent)
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
