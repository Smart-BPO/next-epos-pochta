import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { LeadStatusSelect } from "@/components/dashboard/LeadStatusSelect";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashEmptyState,
  DashFilterPills,
  DashPageHeader,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
  dashBtnSecondary,
} from "@/components/dashboard/ui";
import {
  formatDashDate,
  leadClientLabel,
  leadRouteLabel,
  leadTypeLabel,
} from "@/lib/cms/lead-display";
import { updateLeadStatusAction } from "./actions";

const STATUSES = ["new", "in_progress", "done", "spam"] as const;
const TYPES = ["price", "business", "contact"] as const;
const PAGE_SIZE = 50;

function hrefWith(
  base: Record<string, string>,
  patch: Record<string, string | undefined>,
) {
  const next = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (!v) delete next[k];
    else next[k] = v;
  }
  const qs = new URLSearchParams(next).toString();
  return qs ? `/dashboard/leads/?${qs}` : "/dashboard/leads/";
}

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; offset?: string }>;
}) {
  const admin = await requireAccess("leads");
  if (!admin) {
    return (
      <DashAccessDenied
        title="Заявки"
        lead="Раздел для ролей CRM / owner / viewer."
      />
    );
  }
  const readOnly = !canMutate(admin.role, "leads");
  const params = await searchParams;
  const statusFilter =
    params.status && (STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : "";
  const typeFilter =
    params.type && (TYPES as readonly string[]).includes(params.type)
      ? params.type
      : "";
  const offset = Math.max(0, Number(params.offset) || 0);

  type LeadRow = {
    id: string;
    type: string;
    locale: string;
    status: string;
    payload: { pageUrl?: string; data?: Record<string, unknown> };
    created_at: string;
  };

  let rows: LeadRow[] = [];
  let total = 0;
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    let q = client
      .from("epos_leads")
      .select("id, type, locale, status, payload, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (typeFilter) q = q.eq("type", typeFilter);
    const { data, count } = await q;
    rows = (data ?? []) as LeadRow[];
    total = count ?? rows.length;
  }

  const filterBase: Record<string, string> = {};
  if (statusFilter) filterBase.status = statusFilter;
  if (typeFilter) filterBase.type = typeFilter;

  const statusPills = [
    { href: hrefWith(filterBase, { status: undefined, offset: undefined }), label: "Все статусы", active: !statusFilter },
    ...STATUSES.map((s) => ({
      href: hrefWith(filterBase, { status: s, offset: undefined }),
      label:
        s === "new"
          ? "Новые"
          : s === "in_progress"
            ? "В работе"
            : s === "done"
              ? "Готово"
              : "Спам",
      active: statusFilter === s,
    })),
  ];

  const typePills = [
    { href: hrefWith(filterBase, { type: undefined, offset: undefined }), label: "Все типы", active: !typeFilter },
    ...TYPES.map((t) => ({
      href: hrefWith(filterBase, { type: t, offset: undefined }),
      label: leadTypeLabel(t),
      active: typeFilter === t,
    })),
  ];

  const nextOffset = offset + PAGE_SIZE;
  const hasMore = nextOffset < total;

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Заявки"
        lead="Сайт → epos_leads. Финальная цена только после подтверждения менеджером."
      />

      <div className="space-y-2">
        <DashFilterPills items={statusPills} />
        <DashFilterPills items={typePills} />
      </div>

      <DashTableShell
        title={`Список${total ? ` · ${total}` : ""}`}
        action={
          hasMore ? (
            <Link
              href={hrefWith(filterBase, { offset: String(nextOffset) })}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ещё →
            </Link>
          ) : null
        }
      >
        {rows.length === 0 ? (
          <DashEmptyState
            title="Нет заявок"
            lead="Новые лиды появятся здесь после отправки форм на сайте."
          />
        ) : (
          <DashTable>
            <thead>
              <tr>
                <DashTh>ID</DashTh>
                <DashTh>Клиент</DashTh>
                <DashTh>Направление</DashTh>
                <DashTh>Тип</DashTh>
                <DashTh>Статус</DashTh>
                <DashTh>Дата</DashTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.015]">
                  <DashTd>
                    <Link
                      href={`/dashboard/leads/${row.id}/`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      {row.id}
                    </Link>
                  </DashTd>
                  <DashTd className="font-medium text-ink">
                    {leadClientLabel(row.payload)}
                  </DashTd>
                  <DashTd className="text-black/60">
                    {leadRouteLabel(row.type, row.payload)}
                  </DashTd>
                  <DashTd>
                    <span className="text-xs font-medium text-black/55">
                      {leadTypeLabel(row.type)}
                      <span className="text-black/35"> /{row.locale}</span>
                    </span>
                  </DashTd>
                  <DashTd>
                    <div className="flex flex-col gap-2">
                      <DashStatusBadge kind="lead" value={row.status} />
                      <LeadStatusSelect
                        id={row.id}
                        status={row.status}
                        action={updateLeadStatusAction}
                        disabled={readOnly}
                      />
                    </div>
                  </DashTd>
                  <DashTd className="text-xs text-black/45">
                    {formatDashDate(row.created_at)}
                  </DashTd>
                </tr>
              ))}
            </tbody>
          </DashTable>
        )}
      </DashTableShell>

      {offset > 0 || hasMore ? (
        <div className="flex flex-wrap gap-2">
          {offset > 0 ? (
            <Link
              href={hrefWith(filterBase, {
                offset: offset > PAGE_SIZE ? String(offset - PAGE_SIZE) : undefined,
              })}
              className={dashBtnSecondary}
            >
              ← Назад
            </Link>
          ) : null}
          {hasMore ? (
            <Link
              href={hrefWith(filterBase, { offset: String(nextOffset) })}
              className={dashBtnSecondary}
            >
              Показать ещё
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
