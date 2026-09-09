"use client";

import * as Yup from "yup";
import { SHIPMENT_STATUS_LABELS } from "@/components/dashboard/DashStatusBadge";
import {
  DashForm,
  DashSelect,
  DashTrackCodeInput,
} from "@/components/dashboard/ds";
import { trackCodeOptionalSchema } from "@/lib/dashboard/schemas";
import { valuesToFormData } from "@/components/dashboard/ds/useDashFormSubmit";
import { dashBtnSecondary } from "@/styles/dashboard";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

const schema = Yup.object({
  status: Yup.string().oneOf([...STATUSES]).required(),
  track_number: trackCodeOptionalSchema(),
});

type Values = {
  status: string;
  track_number: string;
};

export function ShipmentStatusForm({
  id,
  status,
  trackNumber,
  action,
  disabled = false,
}: {
  id: string;
  status: string;
  trackNumber: string;
  action: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="text-xs text-black/55">
        <div>{SHIPMENT_STATUS_LABELS[status] ?? status}</div>
        {trackNumber ? (
          <div className="mt-1 font-mono text-black/40">{trackNumber}</div>
        ) : null}
      </div>
    );
  }

  return (
    <DashForm<Values>
      initialValues={{
        status: STATUSES.includes(status as (typeof STATUSES)[number])
          ? status
          : "draft",
        track_number: trackNumber ?? "",
      }}
      schema={schema}
      successMessage="Отправление сохранено"
      errorMessage="Не удалось сохранить"
      className="flex w-full min-w-0 flex-col gap-2"
      onSubmit={async (values) => {
        const fd = valuesToFormData({ id, ...values });
        await action(fd);
      }}
    >
      {({ isSubmitting }) => (
        <>
          <DashSelect name="status" className="!gap-0">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </DashSelect>
          <DashTrackCodeInput
            name="track_number"
            label={undefined}
            placeholder="Трек-номер"
            className="!gap-0 [&_input]:py-1.5 [&_input]:text-xs"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${dashBtnSecondary} py-1.5 text-xs`}
          >
            {isSubmitting ? "…" : "Сохранить"}
          </button>
        </>
      )}
    </DashForm>
  );
}
