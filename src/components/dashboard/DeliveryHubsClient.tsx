"use client";

import { useMemo, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  DashCheckbox,
  DashCodeInput,
  DashCrudPage,
  DashForm,
  DashListView,
  DashModal,
  DashRowActions,
  DashTextarea,
  DashTextInput,
  valuesToFormData,
} from "@/components/dashboard/ds";
import { dashFormat } from "@/i18n/dashboard";
import { slugCodeSchema } from "@/lib/dashboard/schemas";
import type { DeliveryHubAdminRow } from "@/lib/cms/delivery-hubs";
import { cn } from "@/lib/cn";
import { dashBtnPrimary, dashBtnRowSecondary, dashBtnSecondary } from "@/styles/dashboard";

type HubValues = {
  code: string;
  slug: string;
  settlement_id: string;
  name_en: string;
  name_ru: string;
  name_uz: string;
  lead_ru: string;
  lead_uz: string;
  eta_hint_ru: string;
  eta_hint_uz: string;
  body_ru: string;
  body_uz: string;
  faq_ru: string;
  faq_uz: string;
  meta_title_ru: string;
  meta_title_uz: string;
  meta_description_ru: string;
  meta_description_uz: string;
  is_active: boolean;
};

function bodyToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.filter((x): x is string => typeof x === "string").join("\n\n");
}

function faqToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const q = (item as { question?: string }).question ?? "";
      const a = (item as { answer?: string }).answer ?? "";
      return `${q}\n${a}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function rowToValues(row: DeliveryHubAdminRow): HubValues {
  return {
    code: row.code,
    slug: row.slug,
    settlement_id: row.settlement_id ?? "",
    name_en: row.name_en ?? "",
    name_ru: row.name_ru ?? "",
    name_uz: row.name_uz ?? "",
    lead_ru: row.lead_ru ?? "",
    lead_uz: row.lead_uz ?? "",
    eta_hint_ru: row.eta_hint_ru ?? "",
    eta_hint_uz: row.eta_hint_uz ?? "",
    body_ru: bodyToText(row.body_ru),
    body_uz: bodyToText(row.body_uz),
    faq_ru: faqToText(row.faq_ru),
    faq_uz: faqToText(row.faq_uz),
    meta_title_ru: row.meta_title_ru ?? "",
    meta_title_uz: row.meta_title_uz ?? "",
    meta_description_ru: row.meta_description_ru ?? "",
    meta_description_uz: row.meta_description_uz ?? "",
    is_active: Boolean(row.is_active),
  };
}

const emptyValues: HubValues = {
  code: "",
  slug: "",
  settlement_id: "",
  name_en: "",
  name_ru: "",
  name_uz: "",
  lead_ru: "",
  lead_uz: "",
  eta_hint_ru: "",
  eta_hint_uz: "",
  body_ru: "",
  body_uz: "",
  faq_ru: "",
  faq_uz: "",
  meta_title_ru: "",
  meta_title_uz: "",
  meta_description_ru: "",
  meta_description_uz: "",
  is_active: true,
};

export function DeliveryHubsClient({
  rows,
  canWrite,
  saveAction,
  deleteAction,
  seedAction,
}: {
  rows: DeliveryHubAdminRow[];
  canWrite: boolean;
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  seedAction: () => Promise<void>;
}) {
  const t = useDashT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryHubAdminRow | null>(null);
  const [localeTab, setLocaleTab] = useState<"uz" | "ru">("uz");
  const [seeding, setSeeding] = useState(false);

  const hubSchema = useMemo(
    () =>
      Yup.object({
        code: Yup.string()
          .transform((v) =>
            String(v ?? "")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, ""),
          )
          .required(t.errors.codeRequired)
          .min(2, t.errors.codeRequired)
          .max(16, t.errors.codeRequired)
          .matches(/^[a-z0-9]+$/, t.errors.codeRequired),
        slug: slugCodeSchema(t),
        settlement_id: Yup.string().trim(),
        name_en: Yup.string().trim(),
        name_ru: Yup.string().trim().required(t.errors.required),
        name_uz: Yup.string().trim().required(t.errors.required),
        lead_ru: Yup.string(),
        lead_uz: Yup.string(),
        eta_hint_ru: Yup.string(),
        eta_hint_uz: Yup.string(),
        body_ru: Yup.string(),
        body_uz: Yup.string(),
        faq_ru: Yup.string(),
        faq_uz: Yup.string(),
        meta_title_ru: Yup.string(),
        meta_title_uz: Yup.string(),
        meta_description_ru: Yup.string(),
        meta_description_uz: Yup.string(),
        is_active: Yup.boolean().required(),
      }),
    [t],
  );

  const initial = editing ? rowToValues(editing) : emptyValues;

  function openCreate() {
    setEditing(null);
    setLocaleTab("uz");
    setOpen(true);
  }

  function openEdit(row: DeliveryHubAdminRow) {
    setEditing(row);
    setLocaleTab("uz");
    setOpen(true);
  }

  async function runSeed() {
    setSeeding(true);
    try {
      await seedAction();
      toast.success(t.delivery.saved);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t.errors.saveFailed,
      );
    } finally {
      setSeeding(false);
    }
  }

  return (
    <DashCrudPage
      title={t.delivery.title}
      lead={t.delivery.lead}
      secondaryActions={
        canWrite ? (
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={seeding}
            onClick={() => void runSeed()}
          >
            {seeding ? t.common.saving : t.delivery.seed}
          </button>
        ) : undefined
      }
      primaryAction={
        canWrite ? (
          <button type="button" className={dashBtnPrimary} onClick={openCreate}>
            {t.delivery.add}
          </button>
        ) : undefined
      }
    >
      <DashListView
        storageKey="delivery-hubs"
        rows={rows}
        rowKey={(r) => r.code}
        emptyTitle={t.delivery.emptyTitle}
        emptyLead={t.delivery.emptyLead}
        defaultSortId="name"
        defaultSortDir="asc"
        defaultView="table"
        filters={[
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
            header: t.list.name,
            searchText: (r) =>
              `${r.code} ${r.slug} ${r.name_uz} ${r.name_ru} ${r.name_en} ${r.settlement_id ?? ""}`,
            sortValue: (r) => r.name_uz || r.name_ru || r.code,
            cell: (row) => (
              <div className="min-w-0">
                <p className="m-0 font-medium text-ink">
                  {row.name_uz || row.name_ru}
                </p>
                <p className="m-0 mt-0.5 text-xs text-black/45">
                  {row.name_ru}
                  {row.name_en ? ` · ${row.name_en}` : ""}
                </p>
              </div>
            ),
          },
          {
            id: "code",
            header: t.delivery.code,
            sortValue: (r) => r.code,
            cell: (row) => (
              <span className="font-mono text-sm font-semibold text-ink">
                {row.code}
              </span>
            ),
          },
          {
            id: "slug",
            header: t.delivery.slug,
            sortValue: (r) => r.slug,
            cell: (row) => (
              <span className="font-mono text-xs text-black/55">{row.slug}</span>
            ),
          },
          {
            id: "active",
            header: t.list.status,
            sortValue: (r) => (r.is_active ? 1 : 0),
            cell: (row) => (
              <span
                className={
                  row.is_active
                    ? "text-xs font-semibold text-emerald-700"
                    : "text-xs font-semibold text-black/40"
                }
              >
                {row.is_active ? t.list.active : t.list.inactive}
              </span>
            ),
          },
        ]}
        actions={
          canWrite
            ? (row) => (
                <DashRowActions
                  onEdit={() => openEdit(row)}
                  confirmTitle={t.delivery.deleteConfirm}
                  confirmLead={dashFormat(t.delivery.deleteLead, {
                    code: row.code,
                  })}
                  onDelete={async () => {
                    await deleteAction(
                      valuesToFormData({ code: row.code }),
                    );
                  }}
                  extra={
                    <button
                      type="button"
                      className={dashBtnRowSecondary}
                      onClick={async () => {
                        try {
                          await saveAction(
                            valuesToFormData({
                              ...rowToValues(row),
                              is_active: !row.is_active,
                            }),
                          );
                          toast.success(t.delivery.saved);
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : t.errors.saveFailed,
                          );
                        }
                      }}
                    >
                      {row.is_active ? t.delivery.off : t.delivery.on}
                    </button>
                  }
                />
              )
            : undefined
        }
        renderCard={(row, actionsNode) => (
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="m-0 font-display text-lg font-bold text-ink">
                  {row.name_uz || row.name_ru}
                </p>
                <p className="m-0 mt-0.5 font-mono text-xs text-black/45">
                  {row.code} · {row.slug}
                </p>
              </div>
              <span
                className={
                  row.is_active
                    ? "text-xs font-semibold text-emerald-700"
                    : "text-xs font-semibold text-black/40"
                }
              >
                {row.is_active ? t.list.active : t.list.inactive}
              </span>
            </div>
            {row.lead_uz || row.lead_ru ? (
              <p className="m-0 line-clamp-3 text-sm text-black/55">
                {row.lead_uz || row.lead_ru}
              </p>
            ) : null}
            {actionsNode}
          </div>
        )}
      />

      {canWrite ? (
        <DashModal
          open={open}
          onOpenChange={setOpen}
          title={editing ? t.delivery.edit : t.delivery.add}
          size="lg"
          closeLabel={t.common.close}
        >
          <DashForm<HubValues>
            key={editing?.code ?? "new"}
            enableReinitialize
            initialValues={initial}
            schema={hubSchema}
            successMessage={t.delivery.saved}
            onSubmit={async (values) => {
              await saveAction(valuesToFormData(values));
              setOpen(false);
              setEditing(null);
            }}
          >
            {({ isSubmitting }) => (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <DashCodeInput
                    name="code"
                    label={t.delivery.code}
                    disabled={Boolean(editing)}
                  />
                  <DashTextInput name="slug" label={t.delivery.slug} />
                  <DashTextInput
                    name="settlement_id"
                    label={t.delivery.settlement}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <DashTextInput name="name_uz" label={t.delivery.nameUz} />
                  <DashTextInput name="name_ru" label={t.delivery.nameRu} />
                  <DashTextInput name="name_en" label={t.delivery.nameEn} />
                </div>

                <DashCheckbox name="is_active" label={t.delivery.active} />

                <div className="flex gap-2">
                  {(["uz", "ru"] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocaleTab(loc)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm font-semibold",
                        localeTab === loc
                          ? "bg-primary text-white"
                          : "border border-black/10 bg-white text-black/55",
                      )}
                    >
                      {loc.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className={cn(localeTab !== "uz" && "hidden", "space-y-3")}>
                  <DashTextarea
                    name="lead_uz"
                    label={t.delivery.leadUz}
                    rows={2}
                  />
                  <DashTextInput name="eta_hint_uz" label={t.delivery.etaUz} />
                  <DashTextarea
                    name="body_uz"
                    label={t.delivery.bodyUz}
                    hint={t.delivery.bodyHint}
                    rows={4}
                    className="[&_textarea]:font-mono [&_textarea]:text-xs"
                  />
                  <DashTextarea
                    name="faq_uz"
                    label={t.delivery.faqUz}
                    hint={t.delivery.faqHint}
                    rows={4}
                    className="[&_textarea]:font-mono [&_textarea]:text-xs"
                  />
                  <DashTextInput
                    name="meta_title_uz"
                    label={t.delivery.metaTitleUz}
                  />
                  <DashTextarea
                    name="meta_description_uz"
                    label={t.delivery.metaDescUz}
                    rows={2}
                  />
                </div>

                <div className={cn(localeTab !== "ru" && "hidden", "space-y-3")}>
                  <DashTextarea
                    name="lead_ru"
                    label={t.delivery.leadRu}
                    rows={2}
                  />
                  <DashTextInput name="eta_hint_ru" label={t.delivery.etaRu} />
                  <DashTextarea
                    name="body_ru"
                    label={t.delivery.bodyRu}
                    hint={t.delivery.bodyHint}
                    rows={4}
                    className="[&_textarea]:font-mono [&_textarea]:text-xs"
                  />
                  <DashTextarea
                    name="faq_ru"
                    label={t.delivery.faqRu}
                    hint={t.delivery.faqHint}
                    rows={4}
                    className="[&_textarea]:font-mono [&_textarea]:text-xs"
                  />
                  <DashTextInput
                    name="meta_title_ru"
                    label={t.delivery.metaTitleRu}
                  />
                  <DashTextarea
                    name="meta_description_ru"
                    label={t.delivery.metaDescRu}
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${dashBtnPrimary} w-fit`}
                >
                  {isSubmitting ? t.common.saving : t.common.save}
                </button>
              </div>
            )}
          </DashForm>
        </DashModal>
      ) : null}
    </DashCrudPage>
  );
}
