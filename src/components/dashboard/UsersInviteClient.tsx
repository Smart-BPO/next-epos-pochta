"use client";

import { useState } from "react";
import * as Yup from "yup";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashCrudPage,
  DashForm,
  DashListView,
  DashModal,
  DashSelect,
  DashTextInput,
  valuesToFormData,
} from "@/components/dashboard/ds";
import { dashFormat } from "@/i18n/dashboard";
import {
  emailRequired,
  passwordMin,
} from "@/lib/dashboard/schemas";
import { toast } from "react-toastify";
import { dashBtnPrimary, dashBtnSecondary, dashSelect } from "@/styles/dashboard";

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
  const t = useDashT();
  const [open, setOpen] = useState(false);

  const inviteSchema = Yup.object({
    display_name: Yup.string().trim().default(""),
    email: emailRequired(t),
    password: passwordMin(8, t),
    role: Yup.string()
      .oneOf(["crm", "editor", "viewer", "owner"])
      .required(t.errors.required),
  });

  return (
    <DashCrudPage
      title={t.users.title}
      lead={t.users.lead}
      primaryAction={
        <button
          type="button"
          className={dashBtnPrimary}
          onClick={() => setOpen(true)}
        >
          {t.users.add}
        </button>
      }
    >
      <DashListView
        storageKey="users"
        rows={rows}
        rowKey={(r) => r.user_id}
        emptyTitle={t.users.emptyTitle}
        defaultSortId="name"
        defaultSortDir="asc"
        filters={[
          {
            id: "role",
            label: t.list.role,
            options: [
              { value: "owner", label: t.badge.role.owner },
              { value: "editor", label: t.badge.role.editor },
              { value: "crm", label: t.badge.role.crm },
              { value: "viewer", label: t.badge.role.viewer },
            ],
            getValue: (r) => r.role,
          },
          {
            id: "active",
            label: t.list.status,
            options: [
              { value: "1", label: t.list.active },
              { value: "0", label: t.list.inactive },
            ],
            getValue: (r) => (r.is_active ? "1" : "0"),
          },
        ]}
        columns={[
          {
            id: "name",
            header: t.users.title,
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
                      {t.list.inactive}
                    </span>
                  ) : null}
                </div>
                <p className="m-0 mt-0.5 text-xs text-black/45">{row.email}</p>
              </div>
            ),
          },
          {
            id: "role",
            header: t.list.role,
            sortValue: (r) => r.role,
            hideInCard: true,
            cell: (row) => (
              <DashStatusBadge kind="role" value={row.role} />
            ),
          },
        ]}
        actions={(row) =>
          row.user_id === meId ? (
            <span className="text-xs font-semibold text-black/35">{t.you}</span>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <form
                action={async (fd) => {
                  try {
                    await setRoleAction(fd);
                    toast.success(t.users.roleUpdated);
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : t.errors.saveFailed,
                    );
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input type="hidden" name="user_id" value={row.user_id} />
                <select
                  name="role"
                  defaultValue={row.role}
                  className={`${dashSelect} py-1.5 text-xs`}
                >
                  <option value="crm">{t.badge.role.crm}</option>
                  <option value="editor">{t.badge.role.editor}</option>
                  <option value="viewer">{t.badge.role.viewer}</option>
                  <option value="owner">{t.badge.role.owner}</option>
                </select>
                <button
                  type="submit"
                  className={`${dashBtnSecondary} py-1.5 text-xs`}
                >
                  {t.users.role}
                </button>
              </form>
              <form
                action={async (fd) => {
                  try {
                    await setActiveAction(fd);
                    toast.success(
                      row.is_active ? t.users.deactivated : t.users.activated,
                    );
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : t.errors.saveFailed,
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
                  {row.is_active ? t.users.deactivate : t.users.activate}
                </button>
              </form>
            </div>
          )
        }
      />

      <DashModal
        open={open}
        onOpenChange={setOpen}
        title={t.users.inviteTitle}
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
          successMessage={t.users.created}
          onSubmit={async (values) => {
            await inviteAction(valuesToFormData(values));
            setOpen(false);
          }}
        >
          {({ isSubmitting }) => (
            <>
              <DashTextInput
                name="display_name"
                label={t.users.displayName}
                placeholder={t.users.displayName}
              />
              <DashTextInput
                name="email"
                label={t.users.email}
                type="email"
                autoComplete="off"
                placeholder={t.users.email}
              />
              <DashTextInput
                name="password"
                label={t.users.password}
                type="password"
                autoComplete="new-password"
                placeholder={dashFormat(t.errors.passwordMin, { n: 8 })}
              />
              <DashSelect name="role" label={t.users.role}>
                <option value="crm">{t.users.roleCrm}</option>
                <option value="editor">{t.users.roleEditor}</option>
                <option value="viewer">{t.users.roleViewer}</option>
                <option value="owner">{t.users.roleOwner}</option>
              </DashSelect>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${dashBtnPrimary} w-fit`}
              >
                {isSubmitting ? t.common.saving : t.common.create}
              </button>
            </>
          )}
        </DashForm>
      </DashModal>
    </DashCrudPage>
  );
}
