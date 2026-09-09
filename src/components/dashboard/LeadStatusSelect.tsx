"use client";

import { LEAD_STATUS_LABELS } from "@/components/dashboard/DashStatusBadge";
import { dashInput } from "@/styles/dashboard";
import { toast } from "react-toastify";

const STATUSES = ["new", "in_progress", "done", "spam"] as const;

export function LeadStatusSelect({
  id,
  status,
  action,
  disabled = false,
}: {
  id: string;
  status: string;
  action: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="text-xs text-black/45">
        {LEAD_STATUS_LABELS[status] ?? status}
      </span>
    );
  }

  return (
    <form
      action={async (fd) => {
        try {
          await action(fd);
          toast.success("Статус заявки обновлён");
        } catch {
          toast.error("Не удалось обновить статус");
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`${dashInput} max-w-[11rem] py-1.5 text-xs`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </select>
    </form>
  );
}
