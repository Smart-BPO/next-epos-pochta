"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLeadStatusLabels } from "@/components/dashboard/DashStatusBadge";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashSelectSm } from "@/styles/dashboard";
import { toast } from "react-toastify";

const STATUSES = ["draft", "new", "in_progress", "done", "spam"] as const;

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
  const router = useRouter();
  const labels = useLeadStatusLabels();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [, startTransition] = useTransition();

  if (disabled) {
    return (
      <span className="text-xs text-[var(--dash-muted)]">
        {labels[optimisticStatus] ?? optimisticStatus}
      </span>
    );
  }

  return (
    <select
      name="status"
      value={optimisticStatus}
      disabled={disabled}
      onChange={(e) => {
        const next = e.target.value;
        const fd = new FormData();
        fd.set("id", id);
        fd.set("status", next);
        startTransition(async () => {
          setOptimisticStatus(next);
          try {
            await action(fd);
            toast.success(t.form.successDefault);
            router.refresh();
          } catch {
            toast.error(t.errors.saveFailed);
            router.refresh();
          }
        });
      }}
      className={`${dashSelectSm} max-w-[11rem]`}
      aria-label={t.list.status}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {labels[s] ?? s}
        </option>
      ))}
    </select>
  );
}
