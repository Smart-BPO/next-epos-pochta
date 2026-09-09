"use client";

import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { DashConfirmDialog } from "@/components/dashboard/ds/DashConfirmDialog";
import { dashBtnGhost, dashBtnSecondary } from "@/styles/dashboard";

export function DashRowActions({
  onEdit,
  onDelete,
  editLabel = "Изменить",
  deleteLabel = "Удалить",
  confirmTitle = "Удалить?",
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="inline-flex flex-wrap items-center justify-end gap-1">
      {extra}
      {onEdit ? (
        <button type="button" className={dashBtnGhost} onClick={onEdit}>
          {editLabel}
        </button>
      ) : null}
      {onDelete ? (
        <>
          <button
            type="button"
            className={dashBtnSecondary}
            onClick={() => setConfirmOpen(true)}
          >
            {deleteLabel}
          </button>
          <DashConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={confirmTitle}
            lead={confirmLead}
            confirmLabel={deleteLabel}
            onConfirm={async () => {
              try {
                await onDelete();
                toast.success("Удалено");
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Не удалось удалить",
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
