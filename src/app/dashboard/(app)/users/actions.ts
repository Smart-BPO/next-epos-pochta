"use server";

import { revalidatePath } from "next/cache";
import {
  countActiveOwners,
  isAdminRole,
  requireMutation,
  writeAuditLog,
  type AdminRole,
} from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function parseRole(raw: string): AdminRole | null {
  if (isAdminRole(raw)) return raw;
  return null;
}

export async function inviteStaffAction(formData: FormData) {
  const admin = await requireMutation("users");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? "editor"));
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || password.length < 8) throw new Error("Invalid credentials");
  if (!role) throw new Error("Invalid role");

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

  await writeAuditLog({
    actor: admin,
    action: "staff.invite",
    entityType: "epos_admin_users",
    entityId: data.user.id,
    payload: { email, role },
  });

  revalidatePath("/dashboard/users");
}

export async function setStaffActiveAction(formData: FormData) {
  const admin = await requireMutation("users");

  const userId = String(formData.get("user_id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!userId) throw new Error("Missing user");

  const client = createSupabaseAdminClient();
  const { data: target } = await client
    .from("epos_admin_users")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    target?.role === "owner" &&
    target.is_active &&
    !isActive &&
    (await countActiveOwners()) <= 1
  ) {
    throw new Error("Cannot deactivate the last owner");
  }

  await client
    .from("epos_admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  await writeAuditLog({
    actor: admin,
    action: isActive ? "staff.activate" : "staff.deactivate",
    entityType: "epos_admin_users",
    entityId: userId,
  });

  revalidatePath("/dashboard/users");
}

export async function setStaffRoleAction(formData: FormData) {
  const admin = await requireMutation("users");

  const userId = String(formData.get("user_id") ?? "");
  const role = parseRole(String(formData.get("role") ?? ""));
  if (!userId || !role) throw new Error("Invalid input");

  const client = createSupabaseAdminClient();
  const { data: target } = await client
    .from("epos_admin_users")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!target) throw new Error("User not found");

  if (
    target.role === "owner" &&
    role !== "owner" &&
    target.is_active &&
    (await countActiveOwners()) <= 1
  ) {
    throw new Error("Cannot demote the last owner");
  }

  const { error } = await client
    .from("epos_admin_users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  await client.auth.admin.updateUserById(userId, {
    app_metadata: { epos_role: role },
  });

  await writeAuditLog({
    actor: admin,
    action: "staff.set_role",
    entityType: "epos_admin_users",
    entityId: userId,
    payload: { from: target.role, to: role },
  });

  revalidatePath("/dashboard/users");
}
