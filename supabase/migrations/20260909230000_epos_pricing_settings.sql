-- Singleton pricing config for public calculator estimates (non-binding).

create table if not exists public.epos_pricing_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default true,
  formula_version text not null default '2026-09-v4-cms',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

drop trigger if exists epos_pricing_settings_updated_at on public.epos_pricing_settings;
create trigger epos_pricing_settings_updated_at
before update on public.epos_pricing_settings
for each row execute function private.set_updated_at();

alter table public.epos_pricing_settings enable row level security;

drop policy if exists epos_pricing_settings_staff_select on public.epos_pricing_settings;
create policy epos_pricing_settings_staff_select
  on public.epos_pricing_settings for select to authenticated
  using (private.is_epos_admin());

drop policy if exists epos_pricing_settings_staff_update on public.epos_pricing_settings;
create policy epos_pricing_settings_staff_update
  on public.epos_pricing_settings for update to authenticated
  using (private.is_epos_editor())
  with check (private.is_epos_editor());

drop policy if exists epos_pricing_settings_staff_insert on public.epos_pricing_settings;
create policy epos_pricing_settings_staff_insert
  on public.epos_pricing_settings for insert to authenticated
  with check (private.is_epos_editor());

-- Seed defaults matching DEFAULT_PRICING_CONFIG / 2026-09-v4-cms
insert into public.epos_pricing_settings (id, enabled, formula_version, config)
values (
  1,
  true,
  '2026-09-v4-cms',
  '{
    "currency": "UZS",
    "zones": {
      "same_city": { "base": 25000, "perKg": 3000, "etaMin": 1, "etaMax": 2 },
      "same_region": { "base": 35000, "perKg": 4500, "etaMin": 1, "etaMax": 3 },
      "inter_region": { "base": 55000, "perKg": 7000, "etaMin": 2, "etaMax": 5 }
    },
    "surcharges": {
      "pickup": 12000,
      "door": 15000,
      "place": 5000,
      "urgentMultiplier": 1.35
    },
    "categories": {
      "documents": 0.85,
      "parcel": 1,
      "goods": 1.05,
      "other": 1
    },
    "volumetric": { "enabled": false, "divisor": 5000 },
    "limits": {
      "weightKg": { "min": 0, "max": 30, "step": 0.5, "default": 1 },
      "lengthCm": { "min": 0, "max": 100, "step": 1, "default": 20 },
      "widthCm": { "min": 0, "max": 100, "step": 1, "default": 15 },
      "heightCm": { "min": 0, "max": 100, "step": 1, "default": 10 }
    },
    "quickCityIds": [
      "tashkent_city",
      "samarkand_city",
      "fergana_city",
      "andijan_city"
    ]
  }'::jsonb
)
on conflict (id) do nothing;
