import { requireAccess } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { listFcargoRequestLog } from "@/lib/fcargo/log";
import { FcargoLogList } from "../FcargoLogList";

export default async function DashboardFcargoLogsPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const { t } = await getDashT();
  const rows = await listFcargoRequestLog({
    limit: 50,
    direction: "out",
    includeBodies: true,
  });

  return (
    <FcargoLogList
      rows={rows}
      variant="api"
      title={t.fcargo.logsTitle}
      lead={t.fcargo.logsLead}
    />
  );
}
