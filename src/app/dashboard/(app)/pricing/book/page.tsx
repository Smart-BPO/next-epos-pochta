import Link from "next/link";
import { requireAccess } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { listPricingRoutes } from "@/lib/pricing/routes";
import { loadPricingConfig } from "@/lib/pricing/settings";
import {
  settlementLabel,
  uzbekistanHubSettlements,
} from "@/data/settlements";
import {
  dashBtnSecondary,
  dashCardPad,
  dashPageLead,
  dashPageTitle,
} from "@/styles/dashboard";
import { formatUzs } from "@/lib/pricing/estimate";
import { estimateQuote } from "@/lib/pricing/estimate";

export default async function PricingBookPage() {
  const admin = await requireAccess("settings");
  if (!admin) {
    return <DashDenied section="settings" />;
  }

  const [loaded, routes] = await Promise.all([
    loadPricingConfig({ bypassCache: true }),
    listPricingRoutes({ activeOnly: false }),
  ]);

  const hubs = uzbekistanHubSettlements;
  const routeMap = new Map(
    routes.map((r) => [`${r.fromSettlementId}|${r.toSettlementId}`, r]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={dashPageTitle}>Тарифный справочник</h1>
          <p className={dashPageLead}>
            Внутренний ориентир для менеджеров. Не публиковать как оферту.
          </p>
        </div>
        <Link href="/dashboard/pricing/" className={dashBtnSecondary}>
          ← К настройкам
        </Link>
      </div>

      <section className={`${dashCardPad} space-y-2`}>
        <h2 className="m-0 text-sm font-semibold text-ink">Зоны (live)</h2>
        <ul className="m-0 grid list-none gap-1 p-0 text-sm text-black/70">
          {(
            [
              ["same_city", "Тот же город"],
              ["same_region", "Та же область"],
              ["inter_region", "Межобластной"],
            ] as const
          ).map(([key, label]) => {
            const z = loaded.config.zones[key];
            return (
              <li key={key}>
                {label}: база {formatUzs(z.base, "ru")} +{" "}
                {formatUzs(z.perKg, "ru")}/кг · ETA {z.etaMin}–{z.etaMax} дн.
              </li>
            );
          })}
        </ul>
        <p className="m-0 text-xs text-black/40">
          formula {loaded.formulaVersion} · overrides {routes.length}
        </p>
      </section>

      <section className={`${dashCardPad} overflow-x-auto`}>
        <h2 className="m-0 mb-3 text-sm font-semibold text-ink">
          Матрица хабов (1 кг, без доплат)
        </h2>
        <table className="w-full min-w-[48rem] border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-1.5 font-semibold text-black/40">
                From \ To
              </th>
              {hubs.map((h) => (
                <th key={h.id} className="p-1.5 font-semibold text-black/40">
                  {settlementLabel(h, "ru")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hubs.map((from) => (
              <tr key={from.id} className="border-t border-black/5">
                <th className="sticky left-0 bg-white p-1.5 text-left font-semibold text-ink">
                  {settlementLabel(from, "ru")}
                </th>
                {hubs.map((to) => {
                  const override = routeMap.get(`${from.id}|${to.id}`);
                  const quote = estimateQuote(
                    {
                      fromRegionId: from.regionId,
                      fromCityId: from.id,
                      toRegionId: to.regionId,
                      toCityId: to.id,
                      weightKg: 1,
                      lengthCm: 20,
                      widthCm: 15,
                      heightCm: 10,
                      unknownDims: false,
                      pickup: false,
                      doorDelivery: false,
                      places: 1,
                      urgent: false,
                      category: "parcel",
                    },
                    loaded.config,
                    loaded.formulaVersion,
                    routes,
                  );
                  return (
                    <td
                      key={to.id}
                      className={`p-1.5 tabular-nums ${
                        override ? "bg-primary-soft/40 font-semibold text-primary" : "text-black/65"
                      }`}
                      title={`${quote.rateSource} · ${quote.etaDays} дн.`}
                    >
                      {formatUzs(quote.amount, "ru")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="m-0 mt-3 text-xs text-black/40">
          Подсветка — пара из матрицы (route). Остальное — зональный fallback.
        </p>
      </section>
    </div>
  );
}
