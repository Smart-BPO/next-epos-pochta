import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import {
  cityDisplayName,
  cityPath,
  type DeliveryCity,
} from "@/data/delivery-cities";
import { routePath, routesFrom, routesTo } from "@/data/delivery-routes";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getDeliveryCitySchema,
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

function calcHref(locale: Locale, city: DeliveryCity) {
  const params = new URLSearchParams();
  params.set("to", cityDisplayName(city, locale));
  if (city.settlementId) params.set("toId", city.settlementId);
  return `${localePath(locale, "/calculator/")}?${params.toString()}`;
}

export function DeliveryCityLandingPageView({
  locale,
  city,
}: {
  locale: Locale;
  city: DeliveryCity;
}) {
  const copy = getContent(locale);
  const name = cityDisplayName(city, locale);
  const lead = locale === "uz" ? city.leadUz : city.leadRu;
  const body = locale === "uz" ? city.bodyUz : city.bodyRu;
  const faq = locale === "uz" ? city.faqUz : city.faqRu;
  const homePath = localePath(locale, "/");
  const listPath = localePath(locale, "/delivery/");
  const thisPath = localePath(locale, cityPath(city.slug));
  const title =
    locale === "uz"
      ? `${name}ga yetkazib berish`
      : `Доставка в ${name}`;

  const outbound = routesFrom(city.code).slice(0, 8);
  const inbound = routesTo(city.code).slice(0, 8);

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: copy.calculator.breadcrumbHome, path: homePath },
          {
            name: locale === "uz" ? "Yetkazib berish" : "Доставка",
            path: listPath,
          },
          { name, path: thisPath },
        ])}
      />
      <JsonLd data={getDeliveryCitySchema(locale, city)} />
      {faq.length > 0 ? <JsonLd data={getFaqSchema(faq)} /> : null}

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
              <li className="text-black" aria-current="page">
                {name}
              </li>
            </ol>
          </nav>
          <h1 className={pageIntroTitle}>{title}</h1>
          <p className={sectionLead}>{lead}</p>
          <p className="m-0 mt-3 text-sm text-black/45">
            {locale === "uz" ? city.etaHintUz : city.etaHintRu}
          </p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-3xl">
          <div className="flex flex-col gap-4 text-base leading-relaxed text-black/70">
            {body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={calcHref(locale, city)} variant="primary">
              {copy.ui.calculate}
            </Button>
            <Button
              href={localePath(locale, "/request-price/")}
              variant="secondary"
            >
              {copy.ui.requestPrice}
            </Button>
            <Button href={localePath(locale, "/services/")} variant="secondary">
              {locale === "uz" ? "Xizmatlar" : "Услуги"}
            </Button>
          </div>
        </PageContainer>
      </section>

      {faq.length > 0 ? (
        <section className={section}>
          <PageContainer className="max-w-3xl">
            <h2 className={sectionTitle}>
              {locale === "uz" ? "Savol-javoblar" : "Вопросы и ответы"}
            </h2>
            {faq.map((item) => (
              <details key={item.question} className={faqDetails}>
                <summary className={faqSummary}>{item.question}</summary>
                <p className="text-black/60">{item.answer}</p>
              </details>
            ))}
          </PageContainer>
        </section>
      ) : null}

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-8">
          <div>
            <h2 className={sectionTitle}>
              {locale === "uz"
                ? `${name}dan yoʻnalishlar`
                : `Направления из ${name}`}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {outbound.map((r) => (
                <li key={r.to.code}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className="inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
                  >
                    {name} → {cityDisplayName(r.to, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={sectionTitle}>
              {locale === "uz"
                ? `${name}ga yoʻnalishlar`
                : `Направления в ${name}`}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {inbound.map((r) => (
                <li key={r.from.code}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className="inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
                  >
                    {cityDisplayName(r.from, locale)} → {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
