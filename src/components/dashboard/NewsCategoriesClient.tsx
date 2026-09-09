"use client";

import { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
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
import { slugCodeSchema } from "@/lib/dashboard/schemas";
import { toast } from "react-toastify";
import { dashBtnPrimary, dashBtnSecondary } from "@/styles/dashboard";
import type { NewsCategoryRow } from "@/lib/cms/news-categories";

const categorySchema = Yup.object({
  id: slugCodeSchema(),
  label_uz: Yup.string().trim().required("Label UZ обязателен"),
  label_ru: Yup.string().trim().required("Label RU обязателен"),
  sort_order: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue ?? "").trim() === "" ? 0 : Number(originalValue),
    )
    .min(0)
    .required(),
  is_active: Yup.boolean().required(),
});

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsCategoryRow | null>(null);

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
      title="Категории новостей"
      lead="Таксономия для фильтров и редактора. Seed: company / product / business / geography."
      secondaryActions={
        <Link href="/dashboard/news/" className={dashBtnSecondary}>
          ← Статьи
        </Link>
      }
      primaryAction={
        canWrite ? (
          <button type="button" className={dashBtnPrimary} onClick={openCreate}>
            Добавить
          </button>
        ) : undefined
      }
    >
      <DashListView
        storageKey="news-categories"
        rows={rows}
        rowKey={(r) => r.id}
        emptyTitle="Нет категорий"
        defaultSortId="sort"
        defaultSortDir="asc"
        filters={[
          {
            id: "active",
            label: "Статус",
            options: [
              { value: "1", label: "active" },
              { value: "0", label: "inactive" },
            ],
            getValue: (r) => (r.isActive ? "1" : "0"),
          },
        ]}
        columns={[
          {
            id: "id",
            header: "ID",
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
            header: "Labels",
            sortValue: (r) => r.labelUz,
            cell: (row) => (
              <span className="text-sm text-black/65">
                {row.labelUz} · {row.labelRu}
              </span>
            ),
          },
          {
            id: "sort",
            header: "Sort",
            sortValue: (r) => r.sortOrder,
            cell: (row) => (
              <span className="text-sm text-black/55">{row.sortOrder}</span>
            ),
          },
          {
            id: "active",
            header: "Статус",
            sortValue: (r) => (r.isActive ? 1 : 0),
            cell: (row) => (
              <span
                className={
                  row.isActive
                    ? "text-xs font-semibold text-emerald-700"
                    : "text-xs font-semibold text-black/40"
                }
              >
                {row.isActive ? "active" : "inactive"}
              </span>
            ),
          },
        ]}
        actions={
          canWrite
            ? (row) => (
                <DashRowActions
                  onEdit={() => openEdit(row)}
                  confirmTitle="Удалить категорию?"
                  confirmLead={`«${row.id}» будет удалена.`}
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
                          toast.success(
                            row.isActive ? "Выключено" : "Включено",
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
                      {row.isActive ? "Выкл." : "Вкл."}
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
          title={editing ? "Изменить категорию" : "Новая категория"}
          size="md"
        >
          <DashForm<CategoryValues>
            key={editing?.id ?? "new"}
            enableReinitialize
            initialValues={initial}
            schema={categorySchema}
            successMessage="Категория сохранена"
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
                  label="ID (slug)"
                  hint="Латиница, цифры, _ и -"
                  disabled={Boolean(editing)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashTextInput name="label_uz" label="Label UZ" />
                  <DashTextInput name="label_ru" label="Label RU" />
                </div>
                <DashTextInput
                  name="sort_order"
                  label="Sort"
                  type="number"
                />
                <DashCheckbox name="is_active" label="Active" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${dashBtnPrimary} w-fit`}
                >
                  {isSubmitting ? "…" : "Сохранить"}
                </button>
              </>
            )}
          </DashForm>
        </DashModal>
      ) : null}
    </DashCrudPage>
  );
}
