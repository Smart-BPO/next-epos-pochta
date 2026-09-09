import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SkeletonRoot({
  children,
  className,
  label = "Loading",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(className)}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {children}
    </div>
  );
}
