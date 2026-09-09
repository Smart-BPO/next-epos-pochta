"use client";

import { useLeadStatusLabels } from "@/components/dashboard/DashStatusBadge";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
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
  const t = useDashT();
  const labels = useLeadStatusLabels();

  if (disabled) {
    return (
      <span className="text-xs text-black/45">
        {labels[status] ?? status}
      </span>
    );
  }

  return (
    <form
      action={async (fd) => {
        try {
          await action(fd);
          toast.success(t.form.successDefault);
        } catch {
          toast.error(t.errors.saveFailed);
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
            {labels[s] ?? s}
          </option>
        ))}
      </select>
    </form>
  );
}
