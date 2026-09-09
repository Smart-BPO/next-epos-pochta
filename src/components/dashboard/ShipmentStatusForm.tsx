"use client";

import { SHIPMENT_STATUS_LABELS } from "@/components/dashboard/DashStatusBadge";
import { dashBtnSecondary, dashInput } from "@/styles/dashboard";
import { toast } from "react-toastify";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

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
    <form
      action={async (fd) => {
        try {
          await action(fd);
          toast.success("Отправление сохранено");
        } catch {
          toast.error("Не удалось сохранить");
        }
      }}
      className="flex w-full min-w-0 flex-col gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className={`${dashInput} py-1.5 text-xs`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {SHIPMENT_STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </select>
      <input
        name="track_number"
        defaultValue={trackNumber}
        placeholder="Трек-номер"
        className={`${dashInput} py-1.5 font-mono text-xs`}
      />
      <button type="submit" className={`${dashBtnSecondary} py-1.5 text-xs`}>
        Сохранить
      </button>
    </form>
  );
}
