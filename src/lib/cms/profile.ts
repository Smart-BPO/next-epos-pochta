import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import type { AdminUser } from "@/lib/cms/auth-shared";

const PROFILE_SELECT =
  "user_id, email, role, display_name, is_active, phone, phone_verified_at, bio, email_verified_at";

export type AdminProfileRow = {
  user_id: string;
  email: string;
  role: string;
  display_name: string;
  phone: string | null;
  phone_verified_at: string | null;
  bio: string;
  email_verified_at: string | null;
};

export async function getAdminProfileRow(
  userId: string,
): Promise<AdminProfileRow | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_admin_users")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as AdminProfileRow;
}

export async function updateAdminProfileFields(
  userId: string,
  fields: {
    display_name?: string;
    bio?: string;
    phone?: string | null;
    phone_verified_at?: string | null;
    email?: string;
    email_verified_at?: string | null;
  },
): Promise<void> {
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_admin_users")
    .update(fields)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function isAdminEmailTaken(
  email: string,
  exceptUserId: string,
): Promise<boolean> {
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_admin_users")
    .select("user_id")
    .eq("email", email)
    .neq("user_id", exceptUserId)
    .maybeSingle();
  return Boolean(data);
}

export async function isAdminPhoneTaken(
  phone: string,
  exceptUserId: string,
): Promise<boolean> {
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_admin_users")
    .select("user_id")
    .eq("phone", phone)
    .neq("user_id", exceptUserId)
    .maybeSingle();
  return Boolean(data);
}

export function profileSnapshotFromAdmin(admin: AdminUser) {
  return {
    email: admin.email,
    displayName: admin.displayName,
    role: admin.role,
    phone: admin.phone,
    phoneVerifiedAt: admin.phoneVerifiedAt,
    bio: admin.bio,
    emailVerifiedAt: admin.emailVerifiedAt,
  };
}
