import { requireAdmin } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { inviteStaffAction, setStaffActiveAction } from "./actions";

export default async function DashboardUsersPage() {
  const me = await requireAdmin();
  if (me.role !== "owner") {
    return (
      <div>
        <h1 className="m-0 font-display text-2xl font-bold">Сотрудники</h1>
        <p className="mt-4 text-sm text-black/50">Только owner</p>
      </div>
    );
  }

  type Row = {
    user_id: string;
    email: string;
    display_name: string;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
  };

  let rows: Row[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client
      .from("epos_admin_users")
      .select("user_id, email, display_name, role, is_active, last_login_at")
      .order("created_at", { ascending: true });
    rows = (data ?? []) as Row[];
  }

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Сотрудники</h1>
      <form
        action={inviteStaffAction}
        className="mt-6 grid max-w-md gap-3 rounded-xl border border-black/8 bg-white p-4"
      >
        <p className="m-0 text-sm font-semibold">Добавить</p>
        <input
          name="display_name"
          placeholder="Имя"
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Пароль"
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <select
          name="role"
          defaultValue="editor"
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        >
          <option value="editor">editor</option>
          <option value="viewer">viewer</option>
          <option value="owner">owner</option>
        </select>
        <button type="submit" className="btn btn-primary w-fit">
          Создать
        </button>
      </form>

      <ul className="mt-6 grid gap-2">
        {rows.map((row) => (
          <li
            key={row.user_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm"
          >
            <div>
              <p className="m-0 font-medium">
                {row.display_name || row.email}{" "}
                <span className="text-xs text-black/40">({row.role})</span>
              </p>
              <p className="m-0 text-xs text-black/45">{row.email}</p>
            </div>
            <form action={setStaffActiveAction} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={row.user_id} />
              <input
                type="hidden"
                name="is_active"
                value={row.is_active ? "false" : "true"}
              />
              <button type="submit" className="text-xs font-semibold text-primary">
                {row.is_active ? "Деактивировать" : "Активировать"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
