"use client";

import Link from "next/link";
import {
  DashEmptyState,
  DashPageHeader,
  dashBtnPrimary,
} from "@/components/dashboard/ui";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";

export function DashAccessDenied({
  title,
  lead,
}: {
  title?: string;
  lead?: string;
}) {
  const t = useDashT();
  const heading = title ?? t.common.accessDenied;
  const description = lead ?? t.common.accessDenied;

  return (
    <div className="space-y-4">
      <DashPageHeader title={heading} lead={description} />
      <DashEmptyState
        title={heading}
        lead={description}
        action={
          <Link href="/dashboard/" className={dashBtnPrimary}>
            {t.common.goOverview}
          </Link>
        }
      />
    </div>
  );
}
