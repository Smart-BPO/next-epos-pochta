import { requireAdmin } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashFormField,
  DashPageHeader,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/components/dashboard/ui";
import { inviteStaffAction, setStaffActiveAction } from "./actions";

export default async function DashboardUsersPage() {
  const me = await requireAdmin();
  if (me.role !== "owner") {
    return (
      <DashAccessDenied
        title="Сотрудники"
        lead="Раздел доступен только роли owner."
      />
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
    <div className="space-y-5">
      <DashPageHeader
        title="Сотрудники"
        lead="Owner · editor · viewer. Viewer — только чтение заявок и WebApp."
      />

      <form action={inviteStaffAction} className={`${dashCardPad} grid max-w-md gap-3`}>
        <p className="m-0 text-sm font-semibold text-ink">Добавить</p>
        <DashFormField label="Имя">
          <input name="display_name" placeholder="Имя" className={dashInput} />
        </DashFormField>
        <DashFormField label="Email">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={dashInput}
          />
        </DashFormField>
        <DashFormField label="Пароль">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Минимум 8 символов"
            className={dashInput}
          />
        </DashFormField>
        <DashFormField label="Роль">
          <select name="role" defaultValue="editor" className={dashInput}>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
            <option value="owner">owner</option>
          </select>
        </DashFormField>
        <button type="submit" className={`${dashBtnPrimary} w-fit`}>
          Создать
        </button>
      </form>

      <ul className="grid gap-2">
        {rows.map((row) => (
          <li
            key={row.user_id}
            className={`${dashCardPad} flex flex-wrap items-center justify-between gap-3 !py-3.5`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 font-medium text-ink">
                  {row.display_name || row.email}
                </p>
                <DashStatusBadge kind="role" value={row.role} />
                {!row.is_active ? (
                  <span className="text-xs font-semibold text-black/40">
                    неактивен
                  </span>
                ) : null}
              </div>
              <p className="m-0 mt-0.5 text-xs text-black/45">{row.email}</p>
            </div>
            {row.user_id !== me.id ? (
              <form action={setStaffActiveAction}>
                <input type="hidden" name="user_id" value={row.user_id} />
                <input
                  type="hidden"
                  name="is_active"
                  value={row.is_active ? "false" : "true"}
                />
                <button type="submit" className={dashBtnSecondary}>
                  {row.is_active ? "Деактивировать" : "Активировать"}
                </button>
              </form>
            ) : (
              <span className="text-xs font-semibold text-black/35">Вы</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
