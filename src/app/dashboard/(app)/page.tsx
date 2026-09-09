import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/cms/auth";
import { getDashT, dashIntlLocale } from "@/i18n/dashboard";
import {
  IconCheck,
  IconChevron,
  IconInbox,
  IconMoney,
  IconNews,
  IconPackage,
  IconPlus,
  IconProgress,
} from "@/components/dashboard/icons";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCard,
  dashCardPad,
  dashPageLead,
  dashPageTitle,
  dashSectionTitle,
} from "@/styles/dashboard";
import { DashTable, DashTd, DashTh } from "@/components/dashboard/ui";
import { cn } from "@/lib/cn";

type LeadRow = {
  id: string;
  type: string;
  locale: string;
  status: string;
  payload: { data?: Record<string, unknown> } | null;
  created_at: string;
};

type ShipmentRow = {
  id: string;
  status: string;
  from_label: string;
  to_label: string;
  created_at: string;
};

function greetingFor(copy: { greetingMorning: string; greetingDay: string; greetingEvening: string }, date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Tashkent",
    }).format(date),
  );
  if (hour < 12) return copy.greetingMorning;
  if (hour < 18) return copy.greetingDay;
  return copy.greetingEvening;
}

function formatLongDate(intlLocale: string, date = new Date()) {
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tashkent",
  }).format(date);
}

function formatShortDate(iso: string, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tashkent",
  }).format(new Date(iso));
}

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function todayKey() {
  return dayKey(new Date().toISOString());
}

function leadClient(row: LeadRow) {
  const data = row.payload?.data ?? {};
  const name =
    (typeof data.name === "string" && data.name) ||
    (typeof data.fullName === "string" && data.fullName) ||
    (typeof data.contactName === "string" && data.contactName) ||
    "";
  const phone =
    (typeof data.phone === "string" && data.phone) ||
    (typeof data.tel === "string" && data.tel) ||
    "";
  return name || phone || row.type;
}

function leadRoute(row: LeadRow) {
  const data = row.payload?.data ?? {};
  const from =
    (typeof data.from === "string" && data.from) ||
    (typeof data.fromCity === "string" && data.fromCity) ||
    "";
  const to =
    (typeof data.to === "string" && data.to) ||
    (typeof data.toCity === "string" && data.toCity) ||
    "";
  if (from && to) return `${from} → ${to}`;
  return row.type === "business"
    ? "Бизнес"
    : row.type === "contact"
      ? "Контакт"
      : "Расчёт";
}

const LEAD_STATUS: Record<
  string,
  { label: string; className: string; bar: string; dot: string }
> = {
  new: {
    label: "Новая",
    className: "bg-[#fee2e2] text-[#b91c1c]",
    bar: "bg-primary",
    dot: "bg-primary",
  },
  in_progress: {
    label: "В работе",
    className: "bg-[#fef3c7] text-[#b45309]",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  done: {
    label: "Готово",
    className: "bg-[#dcfce7] text-[#15803d]",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  spam: {
    label: "Спам",
    className: "bg-black/[0.06] text-black/50",
    bar: "bg-black/30",
    dot: "bg-black/30",
  },
};

async function fetchOverview() {
  if (!hasSupabaseAdminConfig()) {
    return {
      leads: [] as LeadRow[],
      shipments: [] as ShipmentRow[],
      contacts: 0,
    };
  }
  const admin = createSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [leadsRes, shipRes, contactsRes] = await Promise.all([
    admin
      .from("epos_leads")
      .select("id, type, locale, status, payload, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("epos_webapp_shipments")
      .select("id, status, from_label, to_label, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("epos_webapp_contacts")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    leads: (leadsRes.data ?? []) as LeadRow[],
    shipments: (shipRes.data ?? []) as ShipmentRow[],
    contacts: contactsRes.count ?? 0,
  };
}

function buildDaySeries(leads: LeadRow[], days: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(dayKey(d.toISOString()));
  }
  const counts = Object.fromEntries(keys.map((k) => [k, 0])) as Record<
    string,
    number
  >;
  for (const lead of leads) {
    const k = dayKey(lead.created_at);
    if (k in counts) counts[k] += 1;
  }
  return keys.map((k) => counts[k] ?? 0);
}

function Sparkline({
  current,
  previous,
}: {
  current: number[];
  previous: number[];
}) {
  const w = 520;
  const h = 180;
  const pad = 12;
  const max = Math.max(1, ...current, ...previous);

  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x =
          pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

  const area = (() => {
    if (current.length === 0) return "";
    const pts = current.map((v, i) => {
      const x =
        pad + (i * (w - pad * 2)) / Math.max(1, current.length - 1);
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y] as const;
    });
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    return [
      `M ${first[0]} ${h - pad}`,
      `L ${first[0]} ${first[1]}`,
      ...pts.slice(1).map(([x, y]) => `L ${x} ${y}`),
      `L ${last[0]} ${h - pad}`,
      "Z",
    ].join(" ");
  })();

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img">
      <defs>
        <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(211 2 3)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(211 2 3)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#leadFill)" />
      <polyline
        fill="none"
        stroke="rgb(15 18 24 / 0.22)"
        strokeWidth="2"
        strokeDasharray="5 5"
        points={toPoints(previous)}
      />
      <polyline
        fill="none"
        stroke="rgb(211 2 3)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={toPoints(current)}
      />
      {current.map((v, i) => {
        const x =
          pad + (i * (w - pad * 2)) / Math.max(1, current.length - 1);
        const y = h - pad - (v / max) * (h - pad * 2);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="white"
            stroke="rgb(211 2 3)"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

export default async function DashboardOverviewPage() {
  const admin = await requireAdmin();
  const { t, locale } = await getDashT();
  const intl = dashIntlLocale(locale);
  const name = admin.displayName || admin.email.split("@")[0] || "Owner";
  const { leads, shipments, contacts } = await fetchOverview();

  const today = todayKey();
  const leadsNew = leads.filter((l) => l.status === "new").length;
  const leadsProgress = leads.filter((l) => l.status === "in_progress").length;
  const doneToday = leads.filter(
    (l) => l.status === "done" && dayKey(l.created_at) === today,
  ).length;
  const pendingShipments = shipments.filter(
    (s) => s.status === "pending_manager",
  ).length;

  const last7 = buildDaySeries(leads, 7);
  const prev7 = buildDaySeries(leads, 14).slice(0, 7);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const curSum = sum(last7);
  const prevSum = sum(prev7);
  const deltaPct =
    prevSum === 0
      ? curSum > 0
        ? 100
        : 0
      : Math.round(((curSum - prevSum) / prevSum) * 100);

  const statusOrder = ["new", "in_progress", "done", "spam"] as const;
  const statusCounts = statusOrder.map((key) => ({
    key,
    count: leads.filter((l) => l.status === key).length,
    ...LEAD_STATUS[key]!,
  }));
  const statusTotal = Math.max(
    1,
    statusCounts.reduce((a, b) => a + b.count, 0),
  );

  const recent = leads.slice(0, 8);

  const kpis = [
    {
      label: "Новые заявки",
      value: leadsNew,
      hint: `${deltaPct >= 0 ? "+" : ""}${deltaPct}% за 7 дней`,
      hintClass: deltaPct >= 0 ? "text-emerald-600" : "text-primary",
      href: "/dashboard/leads/?status=new",
      icon: <IconInbox className="text-primary" />,
      iconBg: "bg-primary-soft",
    },
    {
      label: "В обработке",
      value: leadsProgress,
      hint: `${pendingShipments} отправлений ждут`,
      hintClass: "text-amber-700",
      href: "/dashboard/leads/?status=in_progress",
      icon: <IconProgress className="text-amber-600" />,
      iconBg: "bg-amber-50",
    },
    {
      label: "Закрыто сегодня",
      value: doneToday,
      hint: "статус done",
      hintClass: "text-emerald-600",
      href: "/dashboard/leads/?status=done",
      icon: <IconCheck className="text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
    {
      label: t.contacts.title,
      value: contacts,
      hint: "мини-приложение",
      hintClass: "text-black/45",
      href: "/dashboard/webapp/contacts/",
      icon: <IconMoney className="text-sky-600" />,
      iconBg: "bg-sky-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={dashPageTitle}>
            {greetingFor(t.overview)}, {name}
          </h1>
          <p className={dashPageLead}>
            {t.overview.lead}
          </p>
        </div>
          <div
          className={cn(
            dashCard,
            "inline-flex items-center gap-2 px-3.5 py-2 text-sm text-black/65",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 text-black/35"
            fill="none"
            aria-hidden
          >
            <rect
              x="4"
              y="5"
              width="16"
              height="15"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M8 3.5v3M16 3.5v3M4 9.5h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {formatLongDate(intl)}
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <li key={kpi.label}>
            <Link
              href={kpi.href}
              className={cn(
                dashCardPad,
                "group block transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgb(15_18_24/0.08)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl",
                    kpi.iconBg,
                  )}
                >
                  {kpi.icon}
                </span>
                <IconChevron className="text-black/20 transition group-hover:text-primary" />
              </div>
              <p className="m-0 mt-4 text-sm text-black/45">{kpi.label}</p>
              <p className="m-0 mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
                {kpi.value}
              </p>
              <p className={cn("m-0 mt-2 text-xs font-medium", kpi.hintClass)}>
                {kpi.hint}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)_minmax(14rem,0.7fr)]">
        <section className={dashCardPad}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={dashSectionTitle}>Динамика заявок</h2>
            <span className="rounded-lg border border-black/8 px-2.5 py-1 text-xs font-medium text-black/50">
              7 дней
            </span>
          </div>
          <div className="mt-2">
            <Sparkline current={last7} previous={prev7} />
          </div>
          <div className="mt-1 flex flex-wrap gap-4 text-xs text-black/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-primary" /> Текущие 7 дней (
              {curSum})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-4 border-t border-dashed border-black/35" />{" "}
              Предыдущие 7 ({prevSum})
            </span>
          </div>
        </section>

        <section className={dashCardPad}>
          <h2 className={dashSectionTitle}>Статусы заявок</h2>
          <ul className="mt-4 space-y-3">
            {statusCounts.map((row) => {
              const pct = Math.round((row.count / statusTotal) * 100);
              return (
                <li key={row.key}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-2 text-black/70">
                      <span className={cn("size-2 rounded-full", row.dot)} />
                      {row.label}
                    </span>
                    <span className="font-semibold text-ink">
                      {row.count}
                      <span className="ml-1 text-xs font-medium text-black/35">
                        {pct}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className={cn("h-full rounded-full", row.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="m-0 mt-4 border-t border-black/[0.06] pt-3 text-sm text-black/45">
            Всего за 14 дней{" "}
            <span className="font-semibold text-ink">{leads.length}</span>
          </p>
        </section>

        <section className={dashCardPad}>
          <h2 className={dashSectionTitle}>Быстрые действия</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link href="/dashboard/leads/" className={dashBtnPrimary}>
              <IconPlus className="size-4" />
              Открыть заявки
            </Link>
            <Link href="/dashboard/news/new/" className={dashBtnSecondary}>
              <IconNews className="size-4 text-black/45" />
              Добавить новость
            </Link>
            <Link href="/webapp/" className={dashBtnSecondary} target="_blank">
              <IconPackage className="size-4 text-black/45" />
              Открыть WebApp
            </Link>
            <Link
              href="/dashboard/settings/telegram/"
              className={dashBtnSecondary}
            >
              Telegram webhook
            </Link>
          </div>
        </section>
      </div>

      <section className={dashCard}>
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
          <h2 className={dashSectionTitle}>Последние заявки</h2>
          <Link
            href="/dashboard/leads/"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Все заявки →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <DashTable>
            <thead>
              <tr>
                <DashTh>№</DashTh>
                <DashTh>Клиент</DashTh>
                <DashTh className="hidden sm:table-cell">Направление</DashTh>
                <DashTh>Статус</DashTh>
                <DashTh className="hidden md:table-cell">Создано</DashTh>
                <DashTh>Действия</DashTh>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <DashTd className="py-10 text-center text-black/40" colSpan={6}>
                    Пока нет заявок
                  </DashTd>
                </tr>
              ) : (
                recent.map((row) => {
                  const st = LEAD_STATUS[row.status] ?? LEAD_STATUS.new!;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-black/[0.015]"
                    >
                      <DashTd className="font-mono text-xs text-black/70">
                        <Link
                          href={`/dashboard/leads/${row.id}/`}
                          className="truncate font-semibold text-primary hover:underline"
                        >
                          {row.id}
                        </Link>
                      </DashTd>
                      <DashTd className="truncate font-medium text-ink">
                        {leadClient(row)}
                      </DashTd>
                      <DashTd className="hidden truncate text-black/60 sm:table-cell">
                        {leadRoute(row)}
                      </DashTd>
                      <DashTd>
                        <span
                          className={cn(
                            "inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold",
                            st.className,
                          )}
                        >
                          {st.label}
                        </span>
                      </DashTd>
                      <DashTd className="hidden text-black/50 md:table-cell">
                        {formatShortDate(row.created_at, intl)}
                      </DashTd>
                      <DashTd>
                        <Link
                          href={`/dashboard/leads/${row.id}/`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Открыть
                        </Link>
                      </DashTd>
                    </tr>
                  );
                })
              )}
            </tbody>
          </DashTable>
        </div>
      </section>
    </div>
  );
}
