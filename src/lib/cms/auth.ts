import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type AdminRole = "owner" | "editor" | "viewer";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
};

type AdminRow = {
  user_id: string;
  email: string;
  role: string;
  display_name?: string | null;
  is_active?: boolean;
};

const ADMIN_SELECT = "user_id, email, role, display_name, is_active";

export type AdminPermissionArea =
  | "overview"
  | "leads"
  | "webapp"
  | "news"
  | "settings"
  | "media"
  | "delivery"
  | "users";

export function canAccess(role: AdminRole, area: AdminPermissionArea): boolean {
  if (role === "owner") return true;
  if (role === "viewer") {
    return area === "overview" || area === "leads" || area === "webapp";
  }
  // editor
  return area !== "users";
}

function mapAdmin(row: AdminRow): AdminUser | null {
  if (row.is_active === false) return null;
  return {
    id: row.user_id,
    email: row.email,
    role: row.role as AdminRole,
    displayName: row.display_name ?? "",
  };
}

export async function countAdmins(): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("epos_admin_users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  return count ?? 0;
}

export async function getAdminByUserId(
  userId: string,
): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("epos_admin_users")
      .select(ADMIN_SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return mapAdmin(data as AdminRow);
  } catch {
    // fall through
  }

  if (!hasSupabaseAdminConfig()) return null;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("epos_admin_users")
      .select(ADMIN_SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapAdmin(data as AdminRow);
  } catch {
    return null;
  }
}

export const getAdminSession = cache(async (): Promise<AdminUser | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return getAdminByUserId(user.id);
  } catch {
    return null;
  }
});

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession();
  if (!admin) redirect("/dashboard/login/");
  return admin;
}

export async function touchAdminLastLogin(userId: string) {
  if (!hasSupabaseAdminConfig()) return;
  try {
    const admin = createSupabaseAdminClient();
    await admin
      .from("epos_admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", userId);
  } catch {
    // non-fatal
  }
}
