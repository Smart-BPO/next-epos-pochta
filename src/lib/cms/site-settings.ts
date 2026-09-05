import { SITE_CONFIG } from "@/utils/consts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  hasSupabaseAdminConfig,
  hasSupabaseSessionConfig,
} from "@/lib/supabase/env";
import { cache } from "react";

export type SiteSettingsOverlay = {
  phone: string;
  phoneDisplay: string;
  email: string;
  telegramUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  hours: string;
  addressLine: string;
  addressLineUz: string;
  mapLat: number | null;
  mapLng: number | null;
};

function defaults(): SiteSettingsOverlay {
  return {
    phone: SITE_CONFIG.phone,
    phoneDisplay: SITE_CONFIG.phoneDisplay,
    email: SITE_CONFIG.email,
    telegramUrl: SITE_CONFIG.telegramUrl,
    instagramUrl: SITE_CONFIG.instagramUrl,
    facebookUrl: SITE_CONFIG.facebookUrl,
    hours: SITE_CONFIG.hours,
    addressLine: SITE_CONFIG.address.line,
    addressLineUz: SITE_CONFIG.address.lineUz,
    mapLat: SITE_CONFIG.address.lat,
    mapLng: SITE_CONFIG.address.lng,
  };
}

type SettingsRow = {
  phone: string;
  phone_display: string;
  email: string;
  telegram_url: string;
  instagram_url: string;
  facebook_url: string;
  hours: string;
  address_line: string;
  address_line_uz: string;
  map_lat: number | null;
  map_lng: number | null;
};

function mapRow(row: SettingsRow): SiteSettingsOverlay {
  return {
    phone: row.phone || SITE_CONFIG.phone,
    phoneDisplay: row.phone_display || SITE_CONFIG.phoneDisplay,
    email: row.email || SITE_CONFIG.email,
    telegramUrl: row.telegram_url || SITE_CONFIG.telegramUrl,
    instagramUrl: row.instagram_url || SITE_CONFIG.instagramUrl,
    facebookUrl: row.facebook_url || SITE_CONFIG.facebookUrl,
    hours: row.hours || SITE_CONFIG.hours,
    addressLine: row.address_line || SITE_CONFIG.address.line,
    addressLineUz: row.address_line_uz || SITE_CONFIG.address.lineUz,
    mapLat: row.map_lat ?? SITE_CONFIG.address.lat,
    mapLng: row.map_lng ?? SITE_CONFIG.address.lng,
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettingsOverlay> => {
  const base = defaults();
  if (!hasSupabaseSessionConfig() && !hasSupabaseAdminConfig()) return base;

  try {
    if (hasSupabaseAdminConfig()) {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("epos_site_settings")
        .select(
          "phone, phone_display, email, telegram_url, instagram_url, facebook_url, hours, address_line, address_line_uz, map_lat, map_lng",
        )
        .eq("id", 1)
        .maybeSingle();
      if (data) return mapRow(data as SettingsRow);
    } else {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("epos_site_settings")
        .select(
          "phone, phone_display, email, telegram_url, instagram_url, facebook_url, hours, address_line, address_line_uz, map_lat, map_lng",
        )
        .eq("id", 1)
        .maybeSingle();
      if (data) return mapRow(data as SettingsRow);
    }
  } catch {
    // keep defaults
  }
  return base;
});

/** Merged runtime config for server components (NAP / messengers / hours). */
export const getRuntimeSiteConfig = cache(async () => {
  const settings = await getSiteSettings();
  return {
    ...SITE_CONFIG,
    phone: settings.phone,
    phoneDisplay: settings.phoneDisplay,
    email: settings.email,
    telegramUrl: settings.telegramUrl,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    hours: settings.hours,
    address: {
      ...SITE_CONFIG.address,
      line: settings.addressLine,
      lineUz: settings.addressLineUz,
      lat: settings.mapLat ?? SITE_CONFIG.address.lat,
      lng: settings.mapLng ?? SITE_CONFIG.address.lng,
    },
  };
});
