"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Lightweight hover/focus tooltip. Prefer native `title` for simple cases;
 * use this when the tip needs richer layout.
 */
export function DashTooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--dash-ink)] px-2 py-1 text-[0.65rem] font-medium text-white shadow-md",
            side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
