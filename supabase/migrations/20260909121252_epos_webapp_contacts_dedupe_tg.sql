-- Dedupe epos_webapp_contacts by telegram_user_id, then enforce uniqueness.
-- Canonical row: prefer init_data_ok=true, then newest created_at.

with ranked as (
  select
    session_id,
    telegram_user_id,
    row_number() over (
      partition by telegram_user_id
      order by init_data_ok desc, created_at desc, session_id desc
    ) as rn
  from public.epos_webapp_contacts
  where telegram_user_id is not null
),
canonical as (
  select session_id, telegram_user_id
  from ranked
  where rn = 1
),
dupes as (
  select r.session_id as dupe_session_id, c.session_id as canonical_session_id
  from ranked r
  join canonical c on c.telegram_user_id = r.telegram_user_id
  where r.rn > 1
)
update public.epos_webapp_shipments s
set contact_session_id = d.canonical_session_id
from dupes d
where s.contact_session_id = d.dupe_session_id;

with ranked as (
  select
    session_id,
    telegram_user_id,
    row_number() over (
      partition by telegram_user_id
      order by init_data_ok desc, created_at desc, session_id desc
    ) as rn
  from public.epos_webapp_contacts
  where telegram_user_id is not null
)
delete from public.epos_webapp_contacts c
using ranked r
where c.session_id = r.session_id
  and r.rn > 1;

drop index if exists public.epos_webapp_contacts_tg_idx;

create unique index if not exists epos_webapp_contacts_tg_uidx
  on public.epos_webapp_contacts (telegram_user_id)
  where telegram_user_id is not null;
