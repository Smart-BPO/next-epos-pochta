import type { ReactNode } from "react";
import { DashPageHeader } from "@/components/dashboard/ui";

export function DashCrudPage({
  title,
  lead,
  primaryAction,
  secondaryActions,
  children,
}: {
  title: string;
  lead?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <DashPageHeader
        title={title}
        lead={lead}
        actions={
          primaryAction || secondaryActions ? (
            <>
              {secondaryActions}
              {primaryAction}
            </>
          ) : undefined
        }
      />
      {children}
    </div>
  );
}
