import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { DeliveryCity } from "@/data/delivery-cities";
import { DELIVERY_CITIES, cityDisplayName } from "@/data/delivery-cities";
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
  return `${localePath(locale, "/calculator/")}?${params.toString()}`;
}

function chipClassName() {
  return "inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary";
}

export function DeliveryCityPageView({
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
  const eta = locale === "uz" ? city.etaHintUz : city.etaHintRu;
  const title =
    locale === "uz"
      ? `${name}: yetkazib berish va joʻnatish`
      : `Доставка в ${name} и из ${name}`;
  const homePath = localePath(locale, "/");
  const listPath = localePath(locale, "/delivery/");
  const cityPath = localePath(locale, `/delivery/${city.slug}/`);
  const outbound = routesFrom(city.code);
  const inbound = routesTo(city.code);

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          {
            name: copy.calculator.breadcrumbHome,
            path: homePath,
          },
          {
            name: locale === "uz" ? "Yetkazib berish" : "Доставка",
            path: listPath,
          },
          { name, path: cityPath },
        ])}
      />
      <JsonLd data={getDeliveryCitySchema(locale, city)} />
      <JsonLd data={getFaqSchema(faq)} />

      <section className={pageIntro}>
        <PageContainer>
          <nav
            className="mb-4 text-sm text-ink-muted"
            aria-label="Breadcrumb"
          >
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
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-3xl">
          <p className="m-0 text-base text-black/70">{eta}</p>
          <div className="mt-6 grid gap-4 text-base leading-relaxed text-black/70">
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

      <section className={section}>
        <PageContainer className="flex flex-col gap-8">
          <div>
            <h2 className={sectionTitle}>
              {locale === "uz"
                ? `${name}dan mashhur yoʻnalishlar`
                : `Популярные направления из ${name}`}
            </h2>
            <p className="m-0 mb-4 max-w-2xl text-sm text-black/55">
              {locale === "uz"
                ? "Yoʻnalish sahifasida masofa va muddat orientiri, kalkulyator va qaytarish marshruti."
                : "На странице маршрута — ориентир по расстоянию и сроку, калькулятор и обратное направление."}
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {outbound.map((r) => (
                <li key={r.to.code}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className={chipClassName()}
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
                ? `${name}ga yetkazib berish`
                : `Доставка в ${name} из…`}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {inbound.map((r) => (
                <li key={r.from.code}>
                  <Link
                    href={localePath(
                      locale,
                      routePath(r.from.code, r.to.code),
                    )}
                    className={chipClassName()}
                  >
                    {cityDisplayName(r.from, locale)} → {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
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

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>
            {locale === "uz" ? "Boshqa shaharlar" : "Другие города"}
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {DELIVERY_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(locale, `/delivery/${c.slug}/`)}
                  className={chipClassName()}
                >
                  {cityDisplayName(c, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>
    </>
  );
}

export function DeliveryIndexPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const title =
    locale === "uz"
      ? "Yetkazib berish shaharlari"
      : "Доставка по городам";
  const lead =
    locale === "uz"
      ? "Oʻzbekistonning asosiy shaharlari boʻylab kuryerlik yetkazib berish. Shaharni oching — mashhur yoʻnalishlar (masalan, Toshkent → Samarqand) va kalkulyator."
      : "Курьерская доставка по ключевым городам Узбекистана. Откройте город — популярные маршруты (например Ташкент → Самарканд) и калькулятор.";

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          {
            name: copy.calculator.breadcrumbHome,
            path: localePath(locale, "/"),
          },
          {
            name: title,
            path: localePath(locale, "/delivery/"),
          },
        ])}
      />
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{title}</h1>
          <p className={sectionLead}>{lead}</p>
        </PageContainer>
      </section>
      <section className={sectionMuted}>
        <PageContainer>
          <div className="grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-3">
            {DELIVERY_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={localePath(locale, `/delivery/${city.slug}/`)}
                className="rounded-2xl border border-black/15 bg-white p-3 transition-transform hover:-translate-y-0.5 sm:rounded-3xl sm:p-5"
              >
                <h2 className="m-0 font-display text-[0.8125rem] font-semibold uppercase leading-snug text-black sm:text-lg">
                  {cityDisplayName(city, locale)}
                </h2>
                <p className="m-0 mt-1 text-[0.65rem] uppercase tracking-wide text-black/35 sm:text-xs">
                  {city.code}
                </p>
                <p className="m-0 mt-1.5 text-xs leading-snug text-black/60 sm:mt-2 sm:text-sm">
                  {locale === "uz" ? city.etaHintUz : city.etaHintRu}
                </p>
              </Link>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
