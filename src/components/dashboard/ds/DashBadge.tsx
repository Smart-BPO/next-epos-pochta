import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DashBadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warn"
  | "danger"
  | "info";

const TONE: Record<DashBadgeTone, string> = {
  neutral: "border-black/8 bg-black/[0.04] text-black/55",
  primary: "border-primary/20 bg-primary-soft text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

export function DashBadge({
  children,
  tone = "neutral",
  size = "sm",
  className,
}: {
  children: ReactNode;
  tone?: DashBadgeTone;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border font-semibold",
        size === "sm"
          ? "px-2 py-0.5 text-[0.65rem] uppercase tracking-wide"
          : "px-2.5 py-1 text-xs",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
