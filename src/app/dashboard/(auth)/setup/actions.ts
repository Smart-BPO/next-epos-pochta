"use server";

import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { safeEqual } from "@/lib/security/secrets";
import { getEnv } from "@/utils/env";

function bootstrapSecretConfigured(): string {
  return getEnv("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET");
}

export type BootstrapStatus =
  | { ok: true }
  | { ok: false; reason: "missing_service_role" | "missing_bootstrap_secret" | "already_bootstrapped" };

export async function getBootstrapStatus(): Promise<BootstrapStatus> {
  if (!hasSupabaseAdminConfig()) {
    return { ok: false, reason: "missing_service_role" };
  }
  if (!bootstrapSecretConfigured()) {
    return { ok: false, reason: "missing_bootstrap_secret" };
  }
  if ((await countAdmins()) > 0) {
    return { ok: false, reason: "already_bootstrapped" };
  }
  return { ok: true };
}

export async function canBootstrapAdmin(): Promise<boolean> {
  return (await getBootstrapStatus()).ok;
}

export async function bootstrapAdminAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const status = await getBootstrapStatus();
  if (!status.ok) {
    if (status.reason === "missing_service_role") {
      return { error: "На сервере нет SUPABASE_SERVICE_ROLE_KEY" };
    }
    if (status.reason === "missing_bootstrap_secret") {
      return { error: "На сервере нет CMS_BOOTSTRAP_SECRET" };
    }
    return { error: "Setup недоступен — staff уже создан" };
  }

  const expected = bootstrapSecretConfigured();
  const provided = String(formData.get("bootstrap_secret") ?? "");
  if (!safeEqual(provided, expected)) {
    return { error: "Неверный bootstrap-секрет" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || password.length < 8) {
    return { error: "Email и пароль (мин. 8 символов) обязательны" };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { epos_role: "owner" },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Не удалось создать пользователя" };
  }

  const { error: adminError } = await supabase.from("epos_admin_users").insert({
    user_id: data.user.id,
    email,
    display_name: displayName || email.split("@")[0],
    role: "owner",
    is_active: true,
  });
  if (adminError) {
    return { error: adminError.message };
  }

  redirect("/dashboard/login/");
}
