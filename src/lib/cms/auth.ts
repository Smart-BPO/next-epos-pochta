import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  canAccess,
  canMutate,
  isAdminRole,
  type AdminMutation,
  type AdminPermissionArea,
  type AdminRole,
  type AdminUser,
} from "@/lib/cms/auth-shared";

export type {
  AdminRole,
  AdminUser,
  AdminPermissionArea,
  AdminMutation,
} from "@/lib/cms/auth-shared";
export { canAccess, canMutate, isAdminRole } from "@/lib/cms/auth-shared";

type AdminRow = {
  user_id: string;
  email: string;
  role: string;
  display_name?: string | null;
  is_active?: boolean;
  phone?: string | null;
  phone_verified_at?: string | null;
  bio?: string | null;
  email_verified_at?: string | null;
};

const ADMIN_SELECT =
  "user_id, email, role, display_name, is_active, phone, phone_verified_at, bio, email_verified_at";

function mapAdmin(row: AdminRow): AdminUser | null {
  if (row.is_active === false) return null;
  if (!isAdminRole(row.role)) return null;
  return {
    id: row.user_id,
    email: row.email,
    role: row.role,
    displayName: row.display_name ?? "",
    phone: row.phone ?? null,
    phoneVerifiedAt: row.phone_verified_at ?? null,
    bio: row.bio ?? "",
    emailVerifiedAt: row.email_verified_at ?? null,
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

export async function countActiveOwners(): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("epos_admin_users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("role", "owner");
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

/** Page gate: returns admin or null when area denied (caller renders DashAccessDenied). */
export async function requireAccess(
  area: AdminPermissionArea,
): Promise<AdminUser | null> {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, area)) return null;
  return admin;
}

/** Mutation gate for server actions / API routes. Redirects unauthenticated to login. */
export async function requireMutation(
  action: AdminMutation,
): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!canMutate(admin.role, action)) {
    throw new Error("Forbidden");
  }
  return admin;
}

/** Same as requireMutation but returns 401-style errors (no redirect) for Route Handlers. */
export async function requireMutationApi(
  action: AdminMutation | AdminMutation[],
): Promise<AdminUser> {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Unauthorized");
  const actions = Array.isArray(action) ? action : [action];
  if (!actions.some((a) => canMutate(admin.role, a))) {
    throw new Error("Forbidden");
  }
  return admin;
}

export async function writeAuditLog(params: {
  actor: AdminUser;
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}) {
  if (!hasSupabaseAdminConfig()) return;
  try {
    const client = createSupabaseAdminClient();
    await client.from("epos_admin_audit_log").insert({
      actor_user_id: params.actor.id,
      actor_email: params.actor.email,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      payload: params.payload ?? {},
    });
  } catch (err) {
    console.error("[cms:audit]", err);
  }
}

export async function touchAdminLastLogin(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase
      .from("epos_admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", userId);
    return;
  } catch {
    // fall through to service role
  }

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
