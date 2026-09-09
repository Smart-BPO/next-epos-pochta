import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { dashCard, dashSectionTitle } from "@/styles/dashboard";

export function DashCrudCard({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(dashCard, "overflow-hidden", className)}>
      {title || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-5 py-3.5">
          {title ? <h2 className={dashSectionTitle}>{title}</h2> : <span />}
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
