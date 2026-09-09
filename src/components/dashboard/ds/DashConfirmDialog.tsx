"use client";

import { useState } from "react";
import { DashModal } from "@/components/dashboard/ds/DashModal";
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
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
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
  const [busy, setBusy] = useState(false);
  const pending = loading || busy;

  return (
    <DashModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
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
            {pending ? "…" : confirmLabel}
          </button>
        </>
      }
    >
      {lead ? <p className={dashPageLead}>{lead}</p> : null}
    </DashModal>
  );
}
