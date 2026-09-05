"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function inviteStaffAction(formData: FormData) {
  const admin = await requireAdmin();
  if (admin.role !== "owner") throw new Error("Forbidden");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "editor");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || password.length < 8) throw new Error("Invalid credentials");
  if (role !== "owner" && role !== "editor" && role !== "viewer") {
    throw new Error("Invalid role");
  }

  const client = createSupabaseAdminClient();
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { epos_role: role },
  });
  if (error || !data.user) throw new Error(error?.message ?? "Create failed");

  const { error: insertError } = await client.from("epos_admin_users").insert({
    user_id: data.user.id,
    email,
    display_name: displayName || email.split("@")[0],
    role,
    is_active: true,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath("/dashboard/users");
}

export async function setStaffActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  if (admin.role !== "owner") throw new Error("Forbidden");

  const userId = String(formData.get("user_id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!userId) throw new Error("Missing user");

  const client = createSupabaseAdminClient();
  await client
    .from("epos_admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  revalidatePath("/dashboard/users");
}
