import { uzbekistanCities } from "@/data/types";
import type { Locale } from "@/i18n/config";

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[ʼ'`‘’]/g, "")
    .replace(/\s+/g, " ");
}

/** Match free-text "from/to" against known cities (ru/uz labels). */
export function matchCityQuery(query: string, locale: Locale) {
  const q = normalize(query);
  if (!q) return null;

  const exact = uzbekistanCities.find((city) => {
    const label = normalize(locale === "uz" ? city.uz : city.ru);
    const other = normalize(locale === "uz" ? city.ru : city.uz);
    return label === q || other === q || city.id === q;
  });
  if (exact) return exact;

  return (
    uzbekistanCities.find((city) => {
      const label = normalize(locale === "uz" ? city.uz : city.ru);
      const other = normalize(locale === "uz" ? city.ru : city.uz);
      return label.includes(q) || other.includes(q) || q.includes(label);
    }) ?? null
  );
}
