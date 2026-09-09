import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { cityDisplayName } from "@/data/delivery-cities";
import { loadDeliveryCities } from "@/lib/cms/delivery-hubs";
import { routePath, routesFrom } from "@/data/delivery-routes";
import { PageContainer } from "@/components/atoms/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/json-ld";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

export async function DeliveryIndexPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const cities = await loadDeliveryCities();
  const title =
    locale === "uz"
      ? "Yetkazib berish yoʻnalishlari"
      : "Маршруты доставки";

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
          <p className={sectionLead}>
            {locale === "uz"
              ? "Asosiy shaharlar orasidagi yoʻnalishlar (masalan, Toshkent → Samarqand). Kalkulyatorda orientir, yakuniy narx — menejer tasdigʻi."
              : "Направления между ключевыми городами (например Ташкент → Самарканд). Ориентир в калькуляторе, финальную цену подтверждает менеджер."}
          </p>
        </PageContainer>
      </section>
      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-10">
          {cities.map((city) => {
            const name = cityDisplayName(city, locale);
            const outbound = routesFrom(city.code, cities);
            return (
              <div
                key={city.code}
                id={city.code}
                className="scroll-mt-[var(--header-height)]"
              >
                <h2 className={sectionTitle}>
                  <span className="mr-2">{name}</span>
                  <span className="text-sm font-medium uppercase tracking-wide text-black/35">
                    {city.code}
                  </span>
                </h2>
                <p className="m-0 mb-3 max-w-2xl text-sm text-black/55">
                  {locale === "uz" ? city.etaHintUz : city.etaHintRu}
                </p>
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
            );
          })}
        </PageContainer>
      </section>
    </>
  );
}
