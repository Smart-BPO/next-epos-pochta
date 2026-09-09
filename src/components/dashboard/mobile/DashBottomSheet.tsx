"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const OPEN_RATIO = 0.88;
const DISMISS_RATIO = 0.4;
const VELOCITY_DISMISS = 0.85;

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type DashBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function DashBottomSheet({
  open,
  onOpenChange,
  title = "Меню",
  children,
  className,
}: DashBottomSheetProps) {
  const titleId = useId();
  const isClient = useIsClient();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const sheetHeight =
    typeof window !== "undefined" ? window.innerHeight * OPEN_RATIO : 600;

  const close = useCallback(() => {
    setDragY(0);
    setDragging(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startY.current = e.clientY;
    lastY.current = e.clientY;
    lastT.current = performance.now();
    velocity.current = 0;
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging) return;
    const dy = Math.max(0, e.clientY - startY.current);
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    velocity.current = (e.clientY - lastY.current) / dt;
    lastY.current = e.clientY;
    lastT.current = now;
    setDragY(dy);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const shouldClose =
      dragY > sheetHeight * DISMISS_RATIO ||
      velocity.current > VELOCITY_DISMISS;
    if (shouldClose) {
      close();
    } else {
      setDragY(0);
    }
  };

  if (!isClient) return null;

  const translate = open ? dragY : sheetHeight + 24;
  const backdropOpacity = open
    ? Math.max(0, 0.45 * (1 - dragY / sheetHeight))
    : 0;

  return createPortal(
    <div
      className={cn(
        "lg:hidden",
        open || dragging ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Закрыть меню"
        className={cn(
          "fixed inset-0 z-[50] bg-black transition-opacity",
          dragging ? "duration-0" : "duration-200",
        )}
        style={{ opacity: backdropOpacity }}
        onClick={close}
        tabIndex={open ? 0 : -1}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[50] flex max-h-[88dvh] flex-col rounded-t-[1.25rem] border border-black/[0.08] bg-white shadow-[0_-12px_40px_rgb(15_18_24/0.16)]",
          "pb-[env(safe-area-inset-bottom,0px)]",
          dragging
            ? "transition-none"
            : "transition-transform duration-300 ease-out",
          className,
        )}
        style={{
          height: `${OPEN_RATIO * 100}dvh`,
          transform: open
            ? `translate3d(0, ${translate}px, 0)`
            : "translate3d(0, 110%, 0)",
        }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex w-full justify-center py-3">
            <span className="h-1 w-10 rounded-full bg-black/15" />
          </div>
          <div className="flex w-full items-center justify-between gap-3 px-5 pb-3">
            <h2
              id={titleId}
              className="m-0 text-[1.05rem] font-semibold tracking-[-0.01em] text-ink"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-black/45 hover:bg-black/[0.04] hover:text-black"
            >
              Готово
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
