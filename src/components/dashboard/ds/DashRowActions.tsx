"use client";

import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { DashConfirmDialog } from "@/components/dashboard/ds/DashConfirmDialog";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashBtnGhost, dashBtnSecondary } from "@/styles/dashboard";

export function DashRowActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  confirmTitle,
  confirmLead,
  extra,
}: {
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  editLabel?: string;
  deleteLabel?: string;
  confirmTitle?: string;
  confirmLead?: string;
  extra?: ReactNode;
}) {
  const t = useDashT();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const edit = editLabel ?? t.common.edit;
  const del = deleteLabel ?? t.common.delete;

  return (
    <div className="inline-flex flex-wrap items-center justify-end gap-1">
      {extra}
      {onEdit ? (
        <button type="button" className={dashBtnGhost} onClick={onEdit}>
          {edit}
        </button>
      ) : null}
      {onDelete ? (
        <>
          <button
            type="button"
            className={dashBtnSecondary}
            onClick={() => setConfirmOpen(true)}
          >
            {del}
          </button>
          <DashConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={confirmTitle ?? `${del}?`}
            lead={confirmLead}
            confirmLabel={del}
            onConfirm={async () => {
              try {
                await onDelete();
                toast.success(t.common.deleted);
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : t.errors.deleteFailed,
                );
                throw err;
              }
            }}
          />
        </>
      ) : null}
    </div>
  );
}
