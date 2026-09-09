"use client";

import { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  DashCheckbox,
  DashCodeInput,
  DashCrudPage,
  DashForm,
  DashListView,
  DashModal,
  DashRowActions,
  DashTextInput,
  valuesToFormData,
} from "@/components/dashboard/ds";
import { dashFormat } from "@/i18n/dashboard";
import { slugCodeSchema } from "@/lib/dashboard/schemas";
import { toast } from "react-toastify";
import { dashBtnPrimary, dashBtnSecondary } from "@/styles/dashboard";
import type { NewsCategoryRow } from "@/lib/cms/news-categories";

type CategoryValues = {
  id: string;
  label_uz: string;
  label_ru: string;
  sort_order: number;
  is_active: boolean;
};

export function NewsCategoriesClient({
  rows,
  canWrite,
  saveAction,
  deleteAction,
}: {
  rows: NewsCategoryRow[];
  canWrite: boolean;
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsCategoryRow | null>(null);

  const categorySchema = Yup.object({
    id: slugCodeSchema(t),
    label_uz: Yup.string().trim().required(t.errors.required),
    label_ru: Yup.string().trim().required(t.errors.required),
    sort_order: Yup.number()
      .transform((value, originalValue) =>
        String(originalValue ?? "").trim() === "" ? 0 : Number(originalValue),
      )
      .min(0)
      .required(t.errors.required),
    is_active: Yup.boolean().required(),
  });

  const initial: CategoryValues = editing
    ? {
        id: editing.id,
        label_uz: editing.labelUz,
        label_ru: editing.labelRu,
        sort_order: editing.sortOrder,
        is_active: editing.isActive,
      }
    : {
        id: "",
        label_uz: "",
        label_ru: "",
        sort_order: 50,
        is_active: true,
      };

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: NewsCategoryRow) {
    setEditing(row);
    setOpen(true);
  }

  return (
    <DashCrudPage
      title={t.categories.title}
      lead={t.categories.lead}
      secondaryActions={
        <Link href="/dashboard/news/" className={dashBtnSecondary}>
          {t.categories.backToArticles}
        </Link>
      }
      primaryAction={
        canWrite ? (
          <button type="button" className={dashBtnPrimary} onClick={openCreate}>
            {t.categories.add}
          </button>
        ) : undefined
      }
    >
      <DashListView
        storageKey="news-categories"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle={t.categories.emptyTitle}
        defaultSortId="sort"
        defaultSortDir="asc"
        filters={[
          {
            id: "active",
            label: t.list.status,
            options: [
              { value: "1", label: t.list.active },
              { value: "0", label: t.list.inactive },
            ],
            getValue: (r) => (r.isActive ? "1" : "0"),
          },
        ]}
        columns={[
          {
            id: "id",
            header: t.list.pageAddress,
            searchText: (r) =>
              `${r.id} ${r.labelUz} ${r.labelRu}`,
            sortValue: (r) => r.id,
            cell: (row) => (
              <span className="font-mono text-sm font-semibold text-ink">
                {row.id}
              </span>
            ),
          },
          {
            id: "labels",
            header: t.list.labels,
            sortValue: (r) => r.labelUz,
            cell: (row) => (
              <span className="text-sm text-black/65">
                {row.labelUz} · {row.labelRu}
              </span>
            ),
          },
          {
            id: "sort",
            header: t.list.sort,
            sortValue: (r) => r.sortOrder,
            cell: (row) => (
              <span className="text-sm text-black/55">{row.sortOrder}</span>
            ),
          },
          {
            id: "active",
            header: t.list.status,
            sortValue: (r) => (r.isActive ? 1 : 0),
            cell: (row) => (
              <span
                className={
                  row.isActive
                    ? "text-xs font-semibold text-emerald-700"
                    : "text-xs font-semibold text-black/40"
                }
              >
                {row.isActive ? t.list.active : t.list.inactive}
              </span>
            ),
          },
        ]}
        actions={
          canWrite
            ? (row) => (
                <DashRowActions
                  onEdit={() => openEdit(row)}
                  confirmTitle={t.categories.deleteConfirm}
                  confirmLead={dashFormat(t.categories.deleteLead, {
                    id: row.id,
                  })}
                  onDelete={async () => {
                    await deleteAction(valuesToFormData({ id: row.id }));
                  }}
                  extra={
                    <button
                      type="button"
                      className={dashBtnSecondary}
                      onClick={async () => {
                        try {
                          await saveAction(
                            valuesToFormData({
                              id: row.id,
                              label_uz: row.labelUz,
                              label_ru: row.labelRu,
                              sort_order: row.sortOrder,
                              is_active: !row.isActive,
                            }),
                          );
                          toast.success(t.categories.saved);
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : t.errors.saveFailed,
                          );
                        }
                      }}
                    >
                      {row.isActive ? t.categories.off : t.categories.on}
                    </button>
                  }
                />
              )
            : undefined
        }
      />

      {canWrite ? (
        <DashModal
          open={open}
          onOpenChange={setOpen}
          title={editing ? t.categories.edit : t.categories.add}
          size="md"
        >
          <DashForm<CategoryValues>
            key={editing?.id ?? "new"}
            enableReinitialize
            initialValues={initial}
            schema={categorySchema}
            successMessage={t.categories.saved}
            onSubmit={async (values) => {
              await saveAction(valuesToFormData(values));
              setOpen(false);
              setEditing(null);
            }}
          >
            {({ isSubmitting }) => (
              <>
                <DashCodeInput
                  name="id"
                  label={t.list.pageAddress}
                  disabled={Boolean(editing)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashTextInput
                    name="label_uz"
                    label={t.categories.labelUz}
                  />
                  <DashTextInput
                    name="label_ru"
                    label={t.categories.labelRu}
                  />
                </div>
                <DashTextInput
                  name="sort_order"
                  label={t.list.sort}
                  type="number"
                />
                <DashCheckbox
                  name="is_active"
                  label={t.categories.active}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${dashBtnPrimary} w-fit`}
                >
                  {isSubmitting ? t.common.saving : t.common.save}
                </button>
              </>
            )}
          </DashForm>
        </DashModal>
      ) : null}
    </DashCrudPage>
  );
}
