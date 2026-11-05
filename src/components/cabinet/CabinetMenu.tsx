"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/cn";

type PanelPos = { top: number; left: number };

/** Lightweight popover for cabinet chrome (mirrors dashboard header menus). */
export function CabinetMenu({
  open,
  onOpenChange,
  trigger,
  children,
  align = "end",
  panelWidth = "16rem",
  panelClassName,
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
  panelWidth?: string;
  panelClassName?: string;
}) {
  const panelId = useId();
  const isClient = useIsClient();
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<PanelPos>({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    const el = triggerNode;
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
  }, [align, triggerNode]);

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
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerNode?.contains(t) || panelRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, onOpenChange, triggerNode]);

  const setRef = useCallback((node: HTMLElement | null) => {
    setTriggerNode(node);
  }, []);

  return (
    <>
      {trigger({
        ref: setRef,
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: () => onOpenChange(!open),
      })}
      {isClient && open
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              role="menu"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: panelWidth,
                zIndex: 60,
              }}
              className={cn(
                "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_12px_40px_rgb(15_18_24/0.12)]",
                panelClassName,
              )}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
