import Link from "next/link";
import {
  DashEmptyState,
  DashPageHeader,
  dashBtnPrimary,
} from "@/components/dashboard/ui";

export function DashAccessDenied({
  title = "Нет доступа",
  lead = "У вашей роли недостаточно прав для этого раздела.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <div className="space-y-4">
      <DashPageHeader title={title} lead={lead} />
      <DashEmptyState
        title={title}
        lead={lead}
        action={
          <Link href="/dashboard/" className={dashBtnPrimary}>
            На обзор
          </Link>
        }
      />
    </div>
  );
}
