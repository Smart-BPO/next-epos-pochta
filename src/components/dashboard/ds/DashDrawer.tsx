"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DashIconButton } from "@/components/dashboard/ds/DashIconButton";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashDrawerPanel, dashModalOverlay } from "@/styles/dashboard";

export function DashDrawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const t = useDashT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        className={cn(dashModalOverlay, "cursor-default border-0 p-0")}
        aria-label={t.common.close}
        onClick={onClose}
      />
      <aside
        className={dashDrawerPanel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--dash-border)] px-4">
          <h2 className="m-0 truncate font-display text-base font-semibold text-[var(--dash-ink)]">
            {title}
          </h2>
          <DashIconButton label={t.common.close} onClick={onClose}>
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </DashIconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-[var(--dash-border)] p-4">
            {footer}
          </div>
        ) : null}
      </aside>
    </>,
    document.body,
  );
}
