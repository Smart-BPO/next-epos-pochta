import { Chip } from "@/components/atoms/Chip";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { cityDisplayName, cityEtaHint, cityPath } from "@/data/delivery-cities";
import { loc } from "@/i18n/loc";
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
  const title = loc(
    locale,
    "Yetkazib berish yoʻnalishlari",
    "Маршруты доставки",
    "配送线路",
  );

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
            {loc(
              locale,
              "Asosiy shaharlar orasidagi yoʻnalishlar (masalan, Toshkent → Samarqand). Shahar sahifasi, kalkulyatorda orientir, yakuniy narx — menejer tasdigʻi.",
              "Направления между ключевыми городами (например Ташкент → Самарканд). Страница города, ориентир в калькуляторе, финальную цену подтверждает менеджер.",
              "主要城市之间的线路（例如塔什干 → 撒马尔罕）。城市页面、计算器参考价，最终价格由经理确认。",
            )}
          </p>
        </PageContainer>
      </section>
      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-10">
          {cities.map((city) => {
            const name = cityDisplayName(city, locale);
            const outbound = routesFrom(city.code, cities);
            const landing = localePath(locale, cityPath(city.slug));
            return (
              <div
                key={city.code}
                id={city.code}
                className="scroll-mt-[var(--header-height)]"
              >
                <h2 className={sectionTitle}>
                  <Chip
                    href={landing}
                    className="mr-2 text-inherit underline-offset-2 hover:text-primary hover:underline"
                  >
                    {name}
                  </Chip>
                  <span className="text-sm font-medium uppercase tracking-wide text-black/55">
                    {city.code}
                  </span>
                </h2>
                <p className="m-0 mb-2 max-w-2xl text-sm text-black/55">
                  {cityEtaHint(city, locale)}
                </p>
                <p className="m-0 mb-3 text-sm">
                  <Link
                    href={landing}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {loc(
                      locale,
                      `${name}ga yetkazib berish →`,
                      `Доставка в ${name} →`,
                      `${name}配送 →`,
                    )}
                  </Link>
                </p>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {outbound.map((r) => (
                    <li key={r.to.code}>
                      <Link
                        href={localePath(
                          locale,
                          routePath(r.from.code, r.to.code),
                        )}>
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
