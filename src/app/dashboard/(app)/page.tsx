import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

async function countTable(
  table: string,
  filter?: { column: string; value: string },
) {
  if (!hasSupabaseAdminConfig()) return 0;
  const admin = createSupabaseAdminClient();
  let q = admin.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count } = await q;
  return count ?? 0;
}

export default async function DashboardOverviewPage() {
  const [leadsNew, leadsAll, contacts, shipmentsPending, newsDrafts] =
    await Promise.all([
      countTable("epos_leads", { column: "status", value: "new" }),
      countTable("epos_leads"),
      countTable("epos_webapp_contacts"),
      countTable("epos_webapp_shipments", {
        column: "status",
        value: "pending_manager",
      }),
      countTable("epos_news_articles", { column: "status", value: "draft" }),
    ]);

  const cards = [
    { label: "Новые заявки", value: leadsNew, href: "/dashboard/leads/?status=new" },
    { label: "Все заявки", value: leadsAll, href: "/dashboard/leads/" },
    { label: "WebApp контакты", value: contacts, href: "/dashboard/webapp/contacts/" },
    {
      label: "Отправления (ожидают)",
      value: shipmentsPending,
      href: "/dashboard/webapp/shipments/?status=pending_manager",
    },
    { label: "Черновики новостей", value: newsDrafts, href: "/dashboard/news/" },
  ];

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold text-ink">Обзор</h1>
      <p className="mt-1 text-sm text-black/50">
        Операции сайта и Telegram WebApp
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href + card.label}>
            <Link
              href={card.href}
              className="block rounded-xl border border-black/8 bg-white p-4 transition hover:border-primary/30"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
                {card.label}
              </p>
              <p className="m-0 mt-2 font-display text-3xl font-bold text-ink">
                {card.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
