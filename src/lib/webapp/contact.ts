import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type WebAppContactLocale = "uz" | "ru";
export type WebAppContactSource = "telegram_contact" | "manual";

export type UpsertWebAppContactInput = {
  telegramUserId: number;
  phone: string;
  firstName: string;
  lastName?: string;
  locale: WebAppContactLocale;
  source: WebAppContactSource;
  telegramUsername?: string | null;
  photoUrl?: string | null;
  initDataOk: boolean;
  /**
   * When true (bot share with lost onboarding Map), keep existing DB locale
   * instead of overwriting with a default.
   */
  preserveExistingLocale?: boolean;
};

export type UpsertWebAppContactResult = {
  sessionId: string;
  phone: string;
  firstName: string;
  lastName: string;
  created: boolean;
};

function createSessionId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TG-${stamp}-${rand}`;
}

type ContactRow = {
  session_id: string;
  phone: string;
  first_name: string;
  last_name: string;
  locale: string;
  init_data_ok: boolean;
  telegram_username: string | null;
  photo_url: string | null;
  source: string;
};

function resolveLocale(
  existing: ContactRow,
  input: UpsertWebAppContactInput,
): WebAppContactLocale {
  if (input.preserveExistingLocale) {
    if (existing.locale === "ru" || existing.locale === "uz") {
      return existing.locale;
    }
  }
  return input.locale;
}

async function updateExisting(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  existing: ContactRow,
  input: UpsertWebAppContactInput,
): Promise<UpsertWebAppContactResult> {
  const nextLocale = resolveLocale(existing, input);
  const nextInitOk = existing.init_data_ok || input.initDataOk;
  const nextUsername =
    input.telegramUsername?.trim() || existing.telegram_username || null;
  const nextPhoto =
    input.photoUrl?.trim() || existing.photo_url || null;
  const nextSource: WebAppContactSource =
    existing.source === "telegram_contact" || input.source === "telegram_contact"
      ? "telegram_contact"
      : "manual";

  const { error } = await admin
    .from("epos_webapp_contacts")
    .update({
      phone: input.phone,
      first_name: input.firstName,
      last_name: input.lastName ?? "",
      locale: nextLocale,
      source: nextSource,
      telegram_username: nextUsername,
      photo_url: nextPhoto,
      init_data_ok: nextInitOk,
    })
    .eq("session_id", existing.session_id);

  if (error) {
    console.error("[webapp:contact:upsert:update]", error.message);
    throw new Error(error.message);
  }

  return {
    sessionId: existing.session_id,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName ?? "",
    created: false,
  };
}

/**
 * Idempotent contact write keyed by telegram_user_id.
 * Keeps a stable session_id for shipment FK links.
 */
export async function upsertWebAppContact(
  input: UpsertWebAppContactInput,
): Promise<UpsertWebAppContactResult> {
  if (!Number.isFinite(input.telegramUserId) || input.telegramUserId <= 0) {
    throw new Error("telegram_user_required");
  }

  if (!hasSupabaseAdminConfig()) {
    const sessionId = createSessionId();
    console.info(
      "[webapp:contact:upsert]",
      JSON.stringify({ sessionId, ...input, created: true }),
    );
    return {
      sessionId,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName ?? "",
      created: true,
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: existing, error: selectError } = await admin
    .from("epos_webapp_contacts")
    .select(
      "session_id, phone, first_name, last_name, locale, init_data_ok, telegram_username, photo_url, source",
    )
    .eq("telegram_user_id", input.telegramUserId)
    .maybeSingle();

  if (selectError) {
    console.error("[webapp:contact:upsert:select]", selectError.message);
    throw new Error(selectError.message);
  }

  if (existing) {
    return updateExisting(admin, existing as ContactRow, input);
  }

  const sessionId = createSessionId();
  const { error: insertError } = await admin.from("epos_webapp_contacts").insert({
    session_id: sessionId,
    phone: input.phone,
    first_name: input.firstName,
    last_name: input.lastName ?? "",
    locale: input.locale,
    source: input.source,
    telegram_user_id: input.telegramUserId,
    telegram_username: input.telegramUsername ?? null,
    photo_url: input.photoUrl?.trim() || null,
    init_data_ok: input.initDataOk,
  });

  if (!insertError) {
    return {
      sessionId,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName ?? "",
      created: true,
    };
  }

  // Race: another writer inserted first — update that row.
  if (insertError.code === "23505") {
    const { data: raced, error: raceSelectError } = await admin
      .from("epos_webapp_contacts")
      .select(
        "session_id, phone, first_name, last_name, locale, init_data_ok, telegram_username, photo_url, source",
      )
      .eq("telegram_user_id", input.telegramUserId)
      .maybeSingle();

    if (raceSelectError || !raced) {
      console.error(
        "[webapp:contact:upsert:race]",
        raceSelectError?.message ?? "missing",
      );
      throw new Error(raceSelectError?.message ?? "upsert_race");
    }
    return updateExisting(admin, raced as ContactRow, input);
  }

  console.error("[webapp:contact:upsert:insert]", insertError.message);
  throw new Error(insertError.message);
}
