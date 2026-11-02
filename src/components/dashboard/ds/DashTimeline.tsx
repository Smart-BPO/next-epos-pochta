import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DashTimelineItem = {
  id: string;
  title: string;
  meta?: string;
  tone?: "neutral" | "success" | "warn" | "danger" | "info";
  icon?: ReactNode;
};

const DOT: Record<NonNullable<DashTimelineItem["tone"]>, string> = {
  neutral: "bg-black/30",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
  danger: "bg-primary",
  info: "bg-sky-500",
};

export function DashTimeline({
  items,
  className,
}: {
  items: DashTimelineItem[];
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--dash-muted)]">—</p>
    );
  }

  return (
    <ol className={cn("m-0 grid list-none gap-0 p-0", className)}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 ? (
            <span
              className="absolute left-[0.4375rem] top-3 h-[calc(100%-0.25rem)] w-px bg-[var(--dash-border-strong)]"
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              "relative z-[1] mt-1.5 size-2.5 shrink-0 rounded-full",
              DOT[item.tone ?? "neutral"],
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold text-[var(--dash-ink)]">
              {item.title}
            </p>
            {item.meta ? (
              <p className="m-0 mt-0.5 text-xs text-[var(--dash-muted)]">
                {item.meta}
              </p>
            ) : null}
          </div>
          {item.icon}
        </li>
      ))}
    </ol>
  );
}
