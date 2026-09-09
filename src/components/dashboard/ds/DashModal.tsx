"use client";

import {
  useCallback,
  useEffect,
  useId,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import {
  dashBtnGhost,
  dashModalOverlay,
  dashModalPanel,
} from "@/styles/dashboard";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function useIsMobileLg() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 1023px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 1023px)").matches
        : false,
    () => false,
  );
}

export type DashModalSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<DashModalSize, string> = {
  sm: "w-[min(calc(100%-1.5rem),22rem)]",
  md: "w-[min(calc(100%-1.5rem),28rem)]",
  lg: "w-[min(calc(100%-1.5rem),40rem)]",
};

export function DashModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "md",
  mobileAsSheet = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: DashModalSize;
  mobileAsSheet?: boolean;
}) {
  const titleId = useId();
  const isClient = useIsClient();
  const isMobile = useIsMobileLg();
  const asSheet = mobileAsSheet && isMobile;

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!isClient || !open) return null;

  return createPortal(
    <div className="lg:contents">
      <button
        type="button"
        aria-label="Закрыть"
        className={cn(dashModalOverlay, open ? "opacity-100" : "opacity-0")}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          dashModalPanel,
          SIZE_CLASS[size],
          asSheet
            ? "inset-x-0 bottom-0 max-h-[88dvh] w-full max-w-none rounded-b-none pb-[env(safe-area-inset-bottom,0px)]"
            : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-3.5">
          {asSheet ? (
            <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-black/15" />
          ) : null}
          <h2
            id={titleId}
            className="m-0 text-[1.05rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {title}
          </h2>
          <button type="button" className={dashBtnGhost} onClick={close}>
            Закрыть
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
        {footer ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-black/[0.06] px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
