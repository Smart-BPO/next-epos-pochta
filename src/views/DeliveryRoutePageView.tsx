import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { cityDisplayName, cityPath } from "@/data/delivery-cities";
import {
  etaLabel,
  routeFaq,
  routeLead,
  routePath,
  routeTitle,
  routesFrom,
  routesTo,
  type DeliveryRoute,
} from "@/data/delivery-routes";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSettlementById } from "@/data/settlements";
import { formatUzs } from "@/lib/pricing/estimate";
import { runEstimate } from "@/lib/pricing/settings";
import {
  getBreadcrumbSchema,
  getDeliveryRouteSchema,
  getFaqSchema,
} from "@/utils/seo/json-ld";
import {
  faqDetails,
  faqSummary,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

function calcHref(locale: Locale, route: DeliveryRoute) {
  const params = new URLSearchParams();
  params.set("from", cityDisplayName(route.from, locale));
  params.set("to", cityDisplayName(route.to, locale));
  return `${localePath(locale, "/calculator/")}?${params.toString()}`;
}

function routeChipLabel(locale: Locale, route: DeliveryRoute) {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  return `${from} → ${to}`;
}

export async function DeliveryRoutePageView({
  locale,
  route,
}: {
  locale: Locale;
  route: DeliveryRoute;
}) {
  const copy = getContent(locale);
  const fromName = cityDisplayName(route.from, locale);
  const toName = cityDisplayName(route.to, locale);
  const title = routeTitle(locale, route);
  const lead = routeLead(locale, route);
  const faq = routeFaq(locale, route);
  const eta = etaLabel(locale, route.etaBand);
  const homePath = localePath(locale, "/");
  const listPath = localePath(locale, "/delivery/");
  const fromHubPath = localePath(locale, cityPath(route.from.slug));
  const toHubPath = localePath(locale, cityPath(route.to.slug));
  const thisPath = localePath(locale, routePath(route.from.code, route.to.code));
  const reversePath = localePath(
    locale,
    routePath(route.to.code, route.from.code),
  );
  const fromBody =
    (locale === "uz" ? route.from.bodyUz[0] : route.from.bodyRu[0]) ?? "";
  const toBody =
    (locale === "uz" ? route.to.bodyUz[0] : route.to.bodyRu[0]) ?? "";

  const outbound = routesFrom(route.from.code).filter(
    (r) => r.to.code !== route.to.code,
  );
  const inbound = routesTo(route.to.code).filter(
    (r) => r.from.code !== route.from.code,
  );

  const fromSettlement = route.from.settlementId
    ? getSettlementById(route.from.settlementId)
    : null;
  const toSettlement = route.to.settlementId
    ? getSettlementById(route.to.settlementId)
    : null;

  let routeEstimate: Awaited<ReturnType<typeof runEstimate>> | null = null;
  if (fromSettlement && toSettlement) {
    routeEstimate = await runEstimate({
      fromRegionId: fromSettlement.regionId,
      fromCityId: fromSettlement.id,
      toRegionId: toSettlement.regionId,
      toCityId: toSettlement.id,
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
    });
  }

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: copy.calculator.breadcrumbHome, path: homePath },
          {
            name: locale === "uz" ? "Yetkazib berish" : "Доставка",
            path: listPath,
          },
          { name: fromName, path: fromHubPath },
          { name: `${fromName} → ${toName}`, path: thisPath },
        ])}
      />
      <JsonLd data={getDeliveryRouteSchema(locale, route)} />
      <JsonLd data={getFaqSchema(faq)} />

      <section className={pageIntro}>
        <PageContainer>
          <nav className="mb-4 text-sm text-ink-muted" aria-label="Breadcrumb">
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
              <li>
                <Link
                  href={homePath}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {copy.calculator.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li>
                <Link
                  href={listPath}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {locale === "uz" ? "Yetkazib berish" : "Доставка"}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li>
                <Link
                  href={fromHubPath}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {fromName}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li className="text-black" aria-current="page">
                {toName}
              </li>
            </ol>
          </nav>
          <h1 className={pageIntroTitle}>{title}</h1>
          <p className={sectionLead}>{lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-3xl">
          <dl className="m-0 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <dt className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
                {locale === "uz" ? "Masofa" : "Расстояние"}
              </dt>
              <dd className="m-0 mt-1 font-display text-xl font-semibold text-black">
                ~{route.distanceKm} km
              </dd>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <dt className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
                {locale === "uz" ? "Muddat" : "Срок"}
              </dt>
              <dd className="m-0 mt-1 text-sm font-medium leading-snug text-black">
                {eta}
              </dd>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <dt className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
                {locale === "uz" ? "Nima yuboriladi" : "Что отправляем"}
              </dt>
              <dd className="m-0 mt-1 text-sm font-medium leading-snug text-black">
                {locale === "uz"
                  ? "Hujjatlar, pochta, B2B"
                  : "Документы, посылки, B2B"}
              </dd>
            </div>
          </dl>

          {routeEstimate?.ok ? (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
                {locale === "uz" ? "Taxminiy smeta (1 kg)" : "Ориентировочная смета (1 кг)"}
              </p>
              <p className="m-0 mt-1 font-display text-2xl font-semibold text-black">
                {formatUzs(routeEstimate.estimate.amount, locale)}{" "}
                {routeEstimate.estimate.currency}
              </p>
              <p className="m-0 mt-1 text-sm text-black/55">
                {locale === "uz"
                  ? `Muddat orientiri: ~${routeEstimate.estimate.etaDays} kun`
                  : `Ориентир по сроку: ~${routeEstimate.estimate.etaDays} дн.`}
              </p>
              <p className="m-0 mt-3 text-xs leading-relaxed text-black/45">
                {copy.calculator.disclaimer}
              </p>
            </div>
          ) : null}

          <p className="m-0 mt-5 text-sm text-black/55">
            {locale === "uz"
              ? "Saytda faqat orientir. Yakuniy narx va shartlar — menejer tasdigʻidan keyin."
              : "На сайте только ориентир. Финальная цена и условия — после подтверждения менеджера."}
          </p>

          {(fromBody || toBody) && (
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-black/65">
              {fromBody ? (
                <p className="m-0">
                  <Link
                    href={fromHubPath}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {fromName}
                  </Link>
                  {" — "}
                  {fromBody}
                </p>
              ) : null}
              {toBody ? (
                <p className="m-0">
                  <Link
                    href={toHubPath}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {toName}
                  </Link>
                  {" — "}
                  {toBody}
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={calcHref(locale, route)} variant="primary">
              {copy.ui.calculate}
            </Button>
            <Button
              href={localePath(locale, "/request-price/")}
              variant="secondary"
            >
              {copy.ui.requestPrice}
            </Button>
            <Button href={reversePath} variant="secondary">
              {locale === "uz"
                ? `${toName} → ${fromName}`
                : `${toName} → ${fromName}`}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="max-w-3xl">
          <h2 className={sectionTitle}>
            {locale === "uz"
              ? `${fromName} — ${toName}: savol-javoblar`
              : `${fromName} — ${toName}: вопросы и ответы`}
          </h2>
          {faq.map((item) => (
            <details key={item.question} className={faqDetails}>
              <summary className={faqSummary}>{item.question}</summary>
              <p className="text-black/60">{item.answer}</p>
            </details>
          ))}
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-8">
          <div>
            <h2 className={sectionTitle}>
              {locale === "uz"
                ? `${fromName}dan boshqa yoʻnalishlar`
                : `Другие направления из ${fromName}`}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {outbound.map((r) => (
                <li key={`${r.from.code}-${r.to.code}`}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className="inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
                  >
                    {routeChipLabel(locale, r)}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-3 text-sm text-black/50">
              <Link
                href={fromHubPath}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {locale === "uz"
                  ? `${fromName} yoʻnalishlari`
                  : `Направления из ${fromName}`}
              </Link>
            </p>
          </div>

          <div>
            <h2 className={sectionTitle}>
              {locale === "uz"
                ? `${toName}ga boshqa yoʻnalishlar`
                : `Другие направления в ${toName}`}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {inbound.map((r) => (
                <li key={`${r.from.code}-${r.to.code}`}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className="inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
                  >
                    {routeChipLabel(locale, r)}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-3 text-sm text-black/50">
              <Link
                href={toHubPath}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {locale === "uz"
                  ? `${toName} yoʻnalishlari`
                  : `Направления в ${toName}`}
              </Link>
            </p>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
