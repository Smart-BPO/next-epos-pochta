import { requireAccess } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  UsersInviteClient,
  type StaffRow,
} from "@/components/dashboard/UsersInviteClient";
import {
  inviteStaffAction,
  setStaffActiveAction,
  setStaffRoleAction,
} from "./actions";

export default async function DashboardUsersPage() {
  const me = await requireAccess("users");
  if (!me) {
    return <DashDenied section="users" />;
  }

  let rows: StaffRow[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client
      .from("epos_admin_users")
      .select("user_id, email, display_name, role, is_active, last_login_at")
      .order("created_at", { ascending: true });
    rows = (data ?? []) as StaffRow[];
  }

  return (
    <UsersInviteClient
      meId={me.id}
      rows={rows}
      inviteAction={inviteStaffAction}
      setRoleAction={setStaffRoleAction}
      setActiveAction={setStaffActiveAction}
    />
  );
}
