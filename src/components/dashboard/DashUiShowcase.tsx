"use client";

import { useState } from "react";
import * as Yup from "yup";
import {
  DashCheckbox,
  DashCodeInput,
  DashConfirmDialog,
  DashCrudCard,
  DashCrudPage,
  DashDateTimeInput,
  DashForm,
  DashListView,
  DashModal,
  DashOtpInput,
  DashPhoneInput,
  DashRowActions,
  DashSelect,
  DashTextarea,
  DashTextInput,
  DashTrackCodeInput,
} from "@/components/dashboard/ds";
import {
  otpSchema,
  phoneRequired,
  slugCodeSchema,
  trackCodeSchema,
} from "@/lib/dashboard/schemas";
import { toast } from "react-toastify";
import {
  DashAuthSkeleton,
  DashDetailSkeleton,
  DashEditorSkeleton,
  DashFormSkeleton,
  DashListSkeleton,
  DashMessagingHubSkeleton,
  DashOverviewSkeleton,
} from "@/components/skeleton/dashboard";
import {
  PublicArticleSkeleton,
  PublicCardGridSkeleton,
  PublicContactsSkeleton,
  PublicFormPageSkeleton,
} from "@/components/skeleton/public";
import {
  dashBtnDanger,
  dashBtnGhost,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCard,
  dashSectionTitle,
} from "@/styles/dashboard";

const demoSchema = Yup.object({
  name: Yup.string().trim().required("Обязательно"),
  email: Yup.string().email("Некорректный email").required(),
  phone: phoneRequired(),
  role: Yup.string().required(),
  notes: Yup.string(),
  code: slugCodeSchema(),
  track: trackCodeSchema(),
  otp: otpSchema(6),
  when: Yup.string(),
  active: Yup.boolean(),
});

type DemoValues = {
  name: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
  code: string;
  track: string;
  otp: string;
  when: string;
  active: boolean;
};

const SAMPLE_ROWS = [
  { id: "a", title: "Alpha", status: "active" },
  { id: "b", title: "Beta", status: "draft" },
  { id: "c", title: "Gamma", status: "active" },
];

export function DashUiShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rows, setRows] = useState(SAMPLE_ROWS);

  return (
    <DashCrudPage
      title="Dashboard UI kit"
      lead="Owner-only showcase · Formik + Yup + toast · не в навигации"
      primaryAction={
        <button
          type="button"
          className={dashBtnPrimary}
          onClick={() => setModalOpen(true)}
        >
          Open modal
        </button>
      }
      secondaryActions={
        <button
          type="button"
          className={dashBtnSecondary}
          onClick={() => setConfirmOpen(true)}
        >
          Confirm
        </button>
      }
    >
      <div className="grid gap-5">
        <DashCrudCard
          title="Buttons"
          actions={<span className="text-xs text-black/40">tokens</span>}
        >
          <div className="flex flex-wrap gap-2">
            <button type="button" className={dashBtnPrimary}>
              Primary
            </button>
            <button type="button" className={dashBtnSecondary}>
              Secondary
            </button>
            <button type="button" className={dashBtnDanger}>
              Danger
            </button>
            <button type="button" className={dashBtnGhost}>
              Ghost
            </button>
          </div>
        </DashCrudCard>

        <DashCrudCard title="Formik fields">
          <DashForm<DemoValues>
            initialValues={{
              name: "",
              email: "",
              phone: "",
              role: "crm",
              notes: "",
              code: "",
              track: "",
              otp: "",
              when: "",
              active: true,
            }}
            schema={demoSchema}
            successMessage="Demo OK"
            onSubmit={async () => {
              await new Promise((r) => setTimeout(r, 400));
            }}
          >
            {({ isSubmitting }) => (
              <div className="grid max-w-xl gap-3">
                <DashTextInput name="name" label="Name" />
                <DashTextInput name="email" label="Email" type="email" />
                <DashPhoneInput name="phone" />
                <DashSelect name="role" label="Role">
                  <option value="crm">crm</option>
                  <option value="editor">editor</option>
                </DashSelect>
                <DashTextarea name="notes" label="Notes" rows={3} />
                <DashCodeInput name="code" label="Slug code" />
                <DashTrackCodeInput name="track" />
                <DashOtpInput name="otp" />
                <DashDateTimeInput name="when" label="Datetime" />
                <DashCheckbox name="active" label="Active" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${dashBtnPrimary} w-fit`}
                >
                  {isSubmitting ? "…" : "Submit"}
                </button>
              </div>
            )}
          </DashForm>
        </DashCrudCard>

        <DashCrudCard
          title="Skeleton loaders"
          actions={
            <span className="text-xs text-black/40">
              375 / 768 / 1280 — responsive QA
            </span>
          }
        >
          <div className="grid gap-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
                Dashboard
              </p>
              <div className="grid gap-4 xl:grid-cols-2">
                {(
                  [
                    ["Overview", <DashOverviewSkeleton key="o" />],
                    ["List", <DashListSkeleton key="l" />],
                    [
                      "Form",
                      <DashFormSkeleton key="f" columns={2} sections={1} />,
                    ],
                    ["Detail", <DashDetailSkeleton key="d" />],
                    ["Editor", <DashEditorSkeleton key="e" />],
                    [
                      "Messaging",
                      <DashMessagingHubSkeleton key="m" />,
                    ],
                  ] as const
                ).map(([label, skeleton]) => (
                  <div key={label} className={`${dashCard} overflow-hidden p-0`}>
                    <p className="border-b border-black/[0.06] px-4 py-2 text-xs font-semibold text-black/50">
                      {label}
                    </p>
                    <div className="max-h-[28rem] overflow-auto p-4">
                      {skeleton}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
                Public
              </p>
              <div className="grid gap-4 xl:grid-cols-2">
                {(
                  [
                    ["Form page", <PublicFormPageSkeleton key="pf" />],
                    ["Card grid", <PublicCardGridSkeleton key="pg" />],
                    ["Article", <PublicArticleSkeleton key="pa" />],
                    ["Contacts", <PublicContactsSkeleton key="pc" />],
                  ] as const
                ).map(([label, skeleton]) => (
                  <div key={label} className={`${dashCard} overflow-hidden p-0`}>
                    <p className="border-b border-black/[0.06] px-4 py-2 text-xs font-semibold text-black/50">
                      {label}
                    </p>
                    <div className="max-h-[28rem] overflow-auto">
                      {skeleton}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
                Auth (full viewport)
              </p>
              <div className={`${dashCard} overflow-hidden p-0`}>
                <div className="max-h-[24rem] overflow-auto">
                  <DashAuthSkeleton />
                </div>
              </div>
            </div>
          </div>
        </DashCrudCard>

        <div>
          <h2 className={`${dashSectionTitle} mb-3`}>List view</h2>
          <DashListView
            storageKey="showcase"
            rows={rows}
            rowKey={(r) => r.id}
            emptyTitle="No rows"
            defaultSortId="title"
            columns={[
              {
                id: "title",
                header: "Title",
                searchText: true,
                sortValue: (r) => r.title,
                cell: (r) => r.title,
              },
              {
                id: "status",
                header: "Status",
                sortValue: (r) => r.status,
                cell: (r) => r.status,
              },
            ]}
            filters={[
              {
                id: "status",
                label: "Status",
                options: [
                  { value: "active", label: "active" },
                  { value: "draft", label: "draft" },
                ],
                getValue: (r) => r.status,
              },
            ]}
            actions={(row) => (
              <DashRowActions
                onEdit={() => toast.info(`Edit ${row.id}`)}
                confirmTitle={`Delete ${row.title}?`}
                onDelete={async () => {
                  setRows((prev) => prev.filter((r) => r.id !== row.id));
                }}
              />
            )}
          />
        </div>
      </div>

      <DashModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Sample modal"
        size="md"
        footer={
          <button
            type="button"
            className={dashBtnPrimary}
            onClick={() => {
              toast.success("Modal action");
              setModalOpen(false);
            }}
          >
            Done
          </button>
        }
      >
        <p className="m-0 text-sm text-black/55">
          Portal modal with Escape, scroll lock, and mobile bottom sheet.
        </p>
      </DashModal>

      <DashConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Destructive action?"
        lead="This is a confirm dialog demo."
        onConfirm={async () => {
          toast.success("Confirmed");
        }}
      />
    </DashCrudPage>
  );
}
