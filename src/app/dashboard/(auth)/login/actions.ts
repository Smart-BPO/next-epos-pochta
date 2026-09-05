"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { touchAdminLastLogin } from "@/lib/cms/auth";
import {
  hasSupabaseBrowserConfig,
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

function safeNextPath(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value.startsWith("/dashboard/")) return "/dashboard/";
  if (value.startsWith("//") || value.includes("://")) return "/dashboard/";
  if (
    value.startsWith("/dashboard/login") ||
    value.startsWith("/dashboard/setup")
  ) {
    return "/dashboard/";
  }
  return value;
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!hasSupabaseBrowserConfig()) {
    return {
      error:
        "Нет NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY на сервере",
    };
  }

  try {
    requireSupabaseUrl();
    requireSupabasePublishableKey();
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Supabase env missing",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Email и пароль обязательны" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return { error: authError?.message ?? "Неверный логин или пароль" };
  }

  // Membership via user session + RLS (own row) — no service role required.
  const { data: adminRow, error: adminError } = await supabase
    .from("epos_admin_users")
    .select("user_id, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !adminRow || adminRow.is_active === false) {
    await supabase.auth.signOut();
    return { error: "Нет доступа сотрудника" };
  }

  await touchAdminLastLogin(data.user.id);
  redirect(next);
}
