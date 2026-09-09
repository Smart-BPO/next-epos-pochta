"use client";

import { useState } from "react";
import { DashModal } from "@/components/dashboard/ds/DashModal";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  dashBtnDanger,
  dashBtnSecondary,
  dashPageLead,
} from "@/styles/dashboard";

export function DashConfirmDialog({
  open,
  onOpenChange,
  title,
  lead,
  confirmLabel,
  cancelLabel,
  danger = true,
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  lead?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useDashT();
  const [busy, setBusy] = useState(false);
  const pending = loading || busy;
  const confirm = confirmLabel ?? t.common.confirm;
  const cancel = cancelLabel ?? t.common.cancel;

  return (
    <DashModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      closeLabel={t.common.close}
      footer={
        <>
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancel}
          </button>
          <button
            type="button"
            className={danger ? dashBtnDanger : dashBtnSecondary}
            disabled={pending}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {pending ? t.common.saving : confirm}
          </button>
        </>
      }
    >
      {lead ? <p className={dashPageLead}>{lead}</p> : null}
    </DashModal>
  );
}
