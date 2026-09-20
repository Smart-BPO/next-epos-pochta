# Google keyword layer (не замена Wordstat)

Wordstat остаётся источником кластер → URL. Этот слой — только для **Google.uz**
приоритетов и CTR, без смены посадочных.

## Как собирать

1. Автоподсказки Google.uz или Keyword Planner (регион Узбекистан) — вне репо.
2. Money-кластеры: calc, door, ecommerce, documents, cod, courier, business, Tashkent, top-6 cities, TAS-коридоры.
3. Опционально заполнить `googleVolumeHint` в `SEO_SERP_MATRIX` (`goals.ts`) после ручного сбора.
4. Фиксировать позиции в `google-serp-baseline.tsv` (колонки baseline).
5. UZ Latin: ожидать низкие объёмы; не раздувать новые URL под нулевые запросы.
6. Приоритет контента: RU money queries + бренд + навигация UZ.

## Правила

- Не менять `targetPath` кластера без 4+ недель данных GSC и проверки каннибализации с Яндексом.
- Ежемесячно сверять `google-serp-baseline.tsv` с фактической выдачей.
- При CTR низком и ≥100 показов в GSC — править title/description посадочной, не плодить дубли.
- GTM не подключаем «на всякий случай» — достаточно gtag при `NEXT_PUBLIC_GA_ID`.
