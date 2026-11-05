-- Explicit sender/receiver phones for admin out/in splits.
-- `phones[]` still holds both for CRM notify; ownership uses these columns.

alter table public.epos_fcargo_packages
  add column if not exists sender_phone text null,
  add column if not exists receiver_phone text null;

create index if not exists epos_fcargo_packages_sender_phone_idx
  on public.epos_fcargo_packages (sender_phone)
  where sender_phone is not null;

create index if not exists epos_fcargo_packages_receiver_phone_idx
  on public.epos_fcargo_packages (receiver_phone)
  where receiver_phone is not null;

-- Backfill from raw_last.sender/receiver.phone (+ flat sender_phone / receiver_phone).
update public.epos_fcargo_packages
set
  sender_phone = coalesce(
    nullif(
      case
        when raw_last ? 'sender'
          and jsonb_typeof(raw_last->'sender') = 'object'
          and nullif(btrim(raw_last->'sender'->>'phone'), '') is not null
        then
          case
            when left(regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g'), 3) = '998'
              and length(regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g')) = 12
              then '+' || regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g')
            when length(regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g')) = 9
              then '+998' || regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g')
            when left(btrim(raw_last->'sender'->>'phone'), 1) = '+'
              then '+' || regexp_replace(raw_last->'sender'->>'phone', '\D', '', 'g')
            else null
          end
        else null
      end,
      ''
    ),
    nullif(
      case
        when nullif(btrim(raw_last->>'sender_phone'), '') is not null then
          case
            when left(regexp_replace(raw_last->>'sender_phone', '\D', '', 'g'), 3) = '998'
              and length(regexp_replace(raw_last->>'sender_phone', '\D', '', 'g')) = 12
              then '+' || regexp_replace(raw_last->>'sender_phone', '\D', '', 'g')
            when length(regexp_replace(raw_last->>'sender_phone', '\D', '', 'g')) = 9
              then '+998' || regexp_replace(raw_last->>'sender_phone', '\D', '', 'g')
            when left(btrim(raw_last->>'sender_phone'), 1) = '+'
              then '+' || regexp_replace(raw_last->>'sender_phone', '\D', '', 'g')
            else null
          end
        else null
      end,
      ''
    ),
    sender_phone
  ),
  receiver_phone = coalesce(
    nullif(
      case
        when raw_last ? 'receiver'
          and jsonb_typeof(raw_last->'receiver') = 'object'
          and nullif(btrim(raw_last->'receiver'->>'phone'), '') is not null
        then
          case
            when left(regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g'), 3) = '998'
              and length(regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g')) = 12
              then '+' || regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g')
            when length(regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g')) = 9
              then '+998' || regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g')
            when left(btrim(raw_last->'receiver'->>'phone'), 1) = '+'
              then '+' || regexp_replace(raw_last->'receiver'->>'phone', '\D', '', 'g')
            else null
          end
        else null
      end,
      ''
    ),
    nullif(
      case
        when nullif(btrim(raw_last->>'receiver_phone'), '') is not null then
          case
            when left(regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g'), 3) = '998'
              and length(regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g')) = 12
              then '+' || regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g')
            when length(regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g')) = 9
              then '+998' || regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g')
            when left(btrim(raw_last->>'receiver_phone'), 1) = '+'
              then '+' || regexp_replace(raw_last->>'receiver_phone', '\D', '', 'g')
            else null
          end
        else null
      end,
      ''
    ),
    receiver_phone
  )
where raw_last is not null
  and (
    sender_phone is null
    or receiver_phone is null
  );
