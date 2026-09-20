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
import { getDashT } from "@/i18n/dashboard/server";
import { dashFormat } from "@/i18n/dashboard";

export default async function PricingBookPage() {
  const admin = await requireAccess("settings");
  if (!admin) {
    return <DashDenied section="settings" />;
  }

  const { t, locale } = await getDashT();
  const p = t.pricing;
  const labelLocale = locale === "uz" ? "uz" : "ru";

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
          <h1 className={dashPageTitle}>{p.bookTitle}</h1>
          <p className={dashPageLead}>{p.bookLead}</p>
        </div>
        <Link href="/dashboard/pricing/" className={dashBtnSecondary}>
          {p.bookBack}
        </Link>
      </div>

      <section className={`${dashCardPad} space-y-2`}>
        <h2 className="m-0 text-sm font-semibold text-ink">{p.bookZonesLive}</h2>
        <ul className="m-0 grid list-none gap-1 p-0 text-sm text-black/70">
          {(
            [
              ["same_city", p.zoneSameCity],
              ["same_region", p.zoneSameRegion],
              ["inter_region", p.zoneInterRegion],
            ] as const
          ).map(([key, label]) => {
            const z = loaded.config.zones[key];
            return (
              <li key={key}>
                {label}: {p.base.replace(" (UZS)", "")}{" "}
                {formatUzs(z.base, labelLocale)} +{" "}
                {formatUzs(z.perKg, labelLocale)}/{labelLocale === "uz" ? "kg" : "кг"} ·{" "}
                {z.etaMin}–{z.etaMax}{" "}
                {labelLocale === "uz" ? "kun" : "дн."}
              </li>
            );
          })}
        </ul>
        <p className="m-0 text-xs text-black/40">
          {dashFormat(p.bookZonesMeta, {
            version: loaded.formulaVersion,
            n: routes.length,
          })}
        </p>
      </section>

      <section className={`${dashCardPad} overflow-x-auto`}>
        <h2 className="m-0 mb-3 text-sm font-semibold text-ink">
          {p.bookMatrixTitle}
        </h2>
        <table className="w-full min-w-[48rem] border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-1.5 font-semibold text-black/40">
                {p.bookFromTo}
              </th>
              {hubs.map((h) => (
                <th key={h.id} className="p-1.5 font-semibold text-black/40">
                  {settlementLabel(h, labelLocale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hubs.map((from) => (
              <tr key={from.id} className="border-t border-black/5">
                <th className="sticky left-0 bg-white p-1.5 text-left font-semibold text-ink">
                  {settlementLabel(from, labelLocale)}
                </th>
                {hubs.map((to) => {
                  const special = routeMap.get(`${from.id}|${to.id}`);
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
                        special
                          ? "bg-primary-soft/40 font-semibold text-primary"
                          : "text-black/65"
                      }`}
                      title={`${quote.rateSource} · ${quote.etaDays} ${labelLocale === "uz" ? "kun" : "дн."}`}
                    >
                      {formatUzs(quote.amount, labelLocale)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="m-0 mt-3 text-xs text-black/40">{p.bookMatrixHint}</p>
      </section>
    </div>
  );
}
