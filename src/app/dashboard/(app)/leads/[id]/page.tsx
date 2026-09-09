import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { LeadStatusSelect } from "@/components/dashboard/LeadStatusSelect";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashBreadcrumbs,
  DashPageHeader,
  dashBtnSecondary,
  dashCardPad,
} from "@/components/dashboard/ui";
import {
  formatDashDate,
  leadClientLabel,
  leadDraftStep,
  leadRouteLabel,
  leadTypeLabel,
} from "@/lib/cms/lead-display";
import { getPublicEnv } from "@/utils/env";
import { updateLeadStatusAction } from "../actions";

type LeadRow = {
  id: string;
  type: string;
  locale: string;
  status: string;
  resume_token: string | null;
  payload: {
    pageUrl?: string;
    data?: Record<string, unknown>;
    meta?: { step?: number; complete?: boolean };
    requestId?: string;
  };
  created_at: string;
  updated_at: string | null;
};

function str(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function boolLabel(v: unknown) {
  if (v === true || v === "true") return "Да";
  if (v === false || v === "false") return "Нет";
  return "";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAccess("leads");
  if (!admin) {
    return (
      <DashAccessDenied
        title="Заявка"
        lead="Раздел для ролей CRM / owner / viewer."
      />
    );
  }
  const readOnly = !canMutate(admin.role, "leads");
  const { id } = await params;

  if (!hasSupabaseAdminConfig()) notFound();

  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("epos_leads")
    .select(
      "id, type, locale, status, resume_token, payload, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const row = data as LeadRow;
  const payloadData = row.payload?.data ?? {};
  const draftStep =
    row.status === "draft" ? leadDraftStep(row.payload) : null;
  const siteOrigin =
    getPublicEnv("NEXT_PUBLIC_SITE_URL")?.replace(/\/$/, "") ||
    "https://epos-pochta.uz";
  const resumePath =
    row.locale === "ru" ? "/ru/request-price/" : "/request-price/";
  const resumeUrl =
    row.status === "draft" && row.resume_token
      ? `${siteOrigin}${resumePath}?uid=${encodeURIComponent(row.resume_token)}`
      : "";

  const contactEntries = [
    ["Имя", str(payloadData.name) || str(payloadData.fullName) || str(payloadData.contactName)],
    ["Телефон", str(payloadData.phone) || str(payloadData.tel)],
    ["Email", str(payloadData.email)],
    ["Компания", str(payloadData.company)],
    ["ИНН", str(payloadData.inn)],
    ["Сообщение", str(payloadData.message) || str(payloadData.comment)],
    ["Маршруты", str(payloadData.routes)],
    ["Откуда", str(payloadData.from) || str(payloadData.fromCity)],
    ["Куда", str(payloadData.to) || str(payloadData.toCity)],
    [
      "Объём / мес.",
      payloadData.monthlyVolume != null && payloadData.monthlyVolume !== ""
        ? String(payloadData.monthlyVolume)
        : "",
    ],
    ["API", boolLabel(payloadData.needApi)],
    ["Регулярный забор", boolLabel(payloadData.regularPickup)],
    ["COD", boolLabel(payloadData.needCod)],
    ["Категория", str(payloadData.category)],
    [
      "Вес",
      str(payloadData.weight) ||
        (payloadData.weightKg != null ? String(payloadData.weightKg) : ""),
    ],
  ].filter(([, v]) => Boolean(v));

  return (
    <div className="space-y-5">
      <DashBreadcrumbs
        items={[
          { href: "/dashboard/leads/", label: "Заявки" },
          { label: row.id },
        ]}
      />
      <DashPageHeader
        title={`Заявка ${row.id}`}
        lead={`${leadTypeLabel(row.type)} · ${leadClientLabel(row.payload)} · ${leadRouteLabel(row.type, row.payload)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className={dashBtnSecondary}
              >
                Продолжить (клиент)
              </a>
            ) : null}
            {row.payload?.pageUrl ? (
              <a
                href={row.payload.pageUrl}
                target="_blank"
                rel="noreferrer"
                className={dashBtnSecondary}
              >
                Страница сайта
              </a>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <section className={dashCardPad}>
          <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
            Контакты и данные
          </h2>
          {contactEntries.length === 0 ? (
            <p className="mt-3 text-sm text-black/45">Нет разобранных полей</p>
          ) : (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {contactEntries.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-black/35">
                    {label}
                  </dt>
                  <dd className="m-0 mt-1 whitespace-pre-wrap text-sm text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className={`${dashCardPad} space-y-4`}>
          <div>
            <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-wide text-black/35">
              Статус
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <DashStatusBadge kind="lead" value={row.status} />
              {draftStep ? (
                <span className="text-xs font-medium text-black/45">
                  Шаг {draftStep} / 4
                </span>
              ) : null}
              <LeadStatusSelect
                id={row.id}
                status={row.status}
                action={updateLeadStatusAction}
                disabled={readOnly}
              />
            </div>
          </div>
          {resumeUrl ? (
            <div>
              <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-wide text-black/35">
                Resume (internal)
              </p>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-xs font-medium text-primary hover:underline"
              >
                {resumeUrl}
              </a>
            </div>
          ) : null}
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-black/45">Тип</dt>
              <dd className="m-0 font-medium">{leadTypeLabel(row.type)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-black/45">Locale</dt>
              <dd className="m-0 font-medium">{row.locale}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-black/45">Создано</dt>
              <dd className="m-0 font-medium">
                {formatDashDate(row.created_at)}
              </dd>
            </div>
            {row.updated_at ? (
              <div className="flex justify-between gap-2">
                <dt className="text-black/45">Обновлено</dt>
                <dd className="m-0 font-medium">
                  {formatDashDate(row.updated_at)}
                </dd>
              </div>
            ) : null}
          </dl>
          <Link
            href="/dashboard/leads/"
            className="inline-block text-sm font-semibold text-primary hover:underline"
          >
            ← К списку
          </Link>
        </section>
      </div>

      <details className={dashCardPad}>
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          Сырой payload
        </summary>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-black/[0.03] p-3 text-xs text-black/70">
          {JSON.stringify(row.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}
