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

export async function canBootstrapAdmin(): Promise<boolean> {
  if (!hasSupabaseAdminConfig()) return false;
  if (!bootstrapSecretConfigured()) return false;
  return (await countAdmins()) === 0;
}

export async function bootstrapAdminAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!(await canBootstrapAdmin())) {
    return { error: "Setup недоступен (уже есть staff или нет env)" };
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
