import { requireAccess } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  listFcargoRequestLog,
  type FcargoLogSource,
} from "@/lib/fcargo/log";
import { FcargoLogList } from "../FcargoLogList";

const API_SOURCES: FcargoLogSource[] = ["out_api", "in_sync", "in_drain"];

function parseSource(
  raw: string | string[] | undefined,
): FcargoLogSource {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && (API_SOURCES as string[]).includes(v)) {
    return v as FcargoLogSource;
  }
  return "out_api";
}

export default async function DashboardFcargoLogsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const sp = (await searchParams) ?? {};
  const source = parseSource(sp.source);

  const { t } = await getDashT();
  const rows = await listFcargoRequestLog({
    limit: 50,
    source,
    includeBodies: true,
  });

  return (
    <FcargoLogList
      rows={rows}
      variant="api"
      title={t.fcargo.logsTitle}
      lead={t.fcargo.logsLead}
      sourceFilter={source}
      filterHrefBase="/dashboard/settings/fcargo/logs"
    />
  );
}
