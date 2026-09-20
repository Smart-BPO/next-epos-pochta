# Google.uz SERP baseline

Шаблон позиций по `SEO_SERP_MATRIX` для **Google.uz** (uz + ru).

## Как обновлять

1. Incognito / GSC Performance — записать `position` и `serp_url` (наш URL в выдаче, если есть).
2. `top_competitors` — домены из топ-10 (emu, bts, delivery.yandex, dpd, pony…).
3. `checked_at` — ISO date.
4. Раз в месяц по `SEO_GOOGLE_BEHAVIOR.monthlyCadence`.

Не менять `target_path` / кластер → URL без 4+ недель GSC и проверки каннибализации с Яндексом.

Опционально: `googleVolumeHint` в `SEO_SERP_MATRIX` после Keyword Planner (`google-keyword-layer.md`).
