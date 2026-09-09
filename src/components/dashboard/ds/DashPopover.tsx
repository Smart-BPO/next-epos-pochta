"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type PanelPos = { top: number; left: number };

export function DashPopover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
  panelWidth = "16rem",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: {
    ref: React.RefCallback<HTMLElement>;
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
  panelWidth?: string;
}) {
  const panelId = useId();
  const isClient = useIsClient();
  const triggerEl = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<PanelPos>({ top: 0, left: 0 });

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerEl.current = node;
  }, []);

  const updatePos = useCallback(() => {
    const el = triggerEl.current;
    const panel = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const widthPx = panel?.offsetWidth
      ? panel.offsetWidth
      : Math.min(320, typeof window !== "undefined" ? window.innerWidth - 16 : 320);
    let left = align === "end" ? rect.right - widthPx : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - widthPx - 8));
    let top = rect.bottom + gap;
    const panelH = panel?.offsetHeight ?? 280;
    if (top + panelH > window.innerHeight - 8 && rect.top > panelH + gap) {
      top = rect.top - panelH - gap;
    }
    setPos({ top, left });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open, updatePos, children]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const onScroll = () => updatePos();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onOpenChange, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerEl.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, onOpenChange]);

  return (
    <span className={cn("relative inline-flex", className)}>
      {trigger({
        ref: setTriggerRef,
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: () => onOpenChange(!open),
      })}
      {isClient && open
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              className={cn(
                "fixed z-[50] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgb(15_18_24/0.18)]",
                panelClassName,
              )}
              style={{
                top: pos.top,
                left: pos.left,
                width: panelWidth,
                maxWidth: "calc(100vw - 1rem)",
              }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
