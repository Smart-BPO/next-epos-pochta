"use client";

import { useState } from "react";
import * as Yup from "yup";
import {
  DashCrudPage,
  DashForm,
  DashListView,
  DashModal,
  DashSelect,
  DashTextInput,
  valuesToFormData,
} from "@/components/dashboard/ds";
import {
  emailRequired,
  passwordMin,
} from "@/lib/dashboard/schemas";
import { toast } from "react-toastify";
import { dashBtnPrimary, dashBtnSecondary, dashInput } from "@/styles/dashboard";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";

const inviteSchema = Yup.object({
  display_name: Yup.string().trim().default(""),
  email: emailRequired(),
  password: passwordMin(8),
  role: Yup.string()
    .oneOf(["crm", "editor", "viewer", "owner"])
    .required(),
});

type InviteValues = {
  display_name: string;
  email: string;
  password: string;
  role: string;
};

export type StaffRow = {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
};

export function UsersInviteClient({
  meId,
  rows,
  inviteAction,
  setRoleAction,
  setActiveAction,
}: {
  meId: string;
  rows: StaffRow[];
  inviteAction: (formData: FormData) => Promise<void>;
  setRoleAction: (formData: FormData) => Promise<void>;
  setActiveAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DashCrudPage
      title="Сотрудники"
      lead="Owner · editor · CRM · viewer. CRM — заявки и WebApp; editor — контент; viewer — только чтение."
      primaryAction={
        <button
          type="button"
          className={dashBtnPrimary}
          onClick={() => setOpen(true)}
        >
          Добавить
        </button>
      }
    >
      <DashListView
        storageKey="users"
        rows={rows}
        rowKey={(r) => r.user_id}
        emptyTitle="Нет сотрудников"
        defaultSortId="name"
        defaultSortDir="asc"
        filters={[
          {
            id: "role",
            label: "Роль",
            options: [
              { value: "owner", label: "owner" },
              { value: "editor", label: "editor" },
              { value: "crm", label: "crm" },
              { value: "viewer", label: "viewer" },
            ],
            getValue: (r) => r.role,
          },
          {
            id: "active",
            label: "Статус",
            options: [
              { value: "1", label: "Активен" },
              { value: "0", label: "Неактивен" },
            ],
            getValue: (r) => (r.is_active ? "1" : "0"),
          },
        ]}
        columns={[
          {
            id: "name",
            header: "Сотрудник",
            searchText: (r) =>
              `${r.display_name} ${r.email} ${r.role}`,
            sortValue: (r) => r.display_name || r.email,
            cell: (row) => (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">
                    {row.display_name || row.email}
                  </span>
                  <DashStatusBadge kind="role" value={row.role} />
                  {!row.is_active ? (
                    <span className="text-xs font-semibold text-black/40">
                      неактивен
                    </span>
                  ) : null}
                </div>
                <p className="m-0 mt-0.5 text-xs text-black/45">{row.email}</p>
              </div>
            ),
          },
          {
            id: "role",
            header: "Роль",
            sortValue: (r) => r.role,
            hideInCard: true,
            cell: (row) => (
              <DashStatusBadge kind="role" value={row.role} />
            ),
          },
        ]}
        actions={(row) =>
          row.user_id === meId ? (
            <span className="text-xs font-semibold text-black/35">Вы</span>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <form
                action={async (fd) => {
                  try {
                    await setRoleAction(fd);
                    toast.success("Роль обновлена");
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Не удалось сменить роль",
                    );
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input type="hidden" name="user_id" value={row.user_id} />
                <select
                  name="role"
                  defaultValue={row.role}
                  className={`${dashInput} py-1.5 text-xs`}
                >
                  <option value="crm">crm</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                  <option value="owner">owner</option>
                </select>
                <button
                  type="submit"
                  className={`${dashBtnSecondary} py-1.5 text-xs`}
                >
                  Роль
                </button>
              </form>
              <form
                action={async (fd) => {
                  try {
                    await setActiveAction(fd);
                    toast.success(
                      row.is_active ? "Деактивирован" : "Активирован",
                    );
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Не удалось обновить",
                    );
                  }
                }}
              >
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
            </div>
          )
        }
      />

      <DashModal
        open={open}
        onOpenChange={setOpen}
        title="Добавить сотрудника"
        size="md"
      >
        <DashForm<InviteValues>
          initialValues={{
            display_name: "",
            email: "",
            password: "",
            role: "crm",
          }}
          schema={inviteSchema}
          successMessage="Сотрудник создан"
          onSubmit={async (values) => {
            await inviteAction(valuesToFormData(values));
            setOpen(false);
          }}
        >
          {({ isSubmitting }) => (
            <>
              <DashTextInput
                name="display_name"
                label="Имя"
                placeholder="Имя"
              />
              <DashTextInput
                name="email"
                label="Email"
                type="email"
                autoComplete="off"
                placeholder="Email"
              />
              <DashTextInput
                name="password"
                label="Пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 8 символов"
              />
              <DashSelect name="role" label="Роль">
                <option value="crm">crm — заявки / WebApp</option>
                <option value="editor">editor — контент</option>
                <option value="viewer">viewer — только чтение</option>
                <option value="owner">owner</option>
              </DashSelect>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${dashBtnPrimary} w-fit`}
              >
                {isSubmitting ? "…" : "Создать"}
              </button>
            </>
          )}
        </DashForm>
      </DashModal>
    </DashCrudPage>
  );
}
