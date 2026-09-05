import {
  getSettlementById,
  uzbekistanSettlements,
  type Settlement,
} from "@/data/settlements";
import type { Locale } from "@/i18n/config";

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[ʼ'`‘’ʻʾ]/g, "")
    .replace(/\s+/g, " ");
}

/** Match free-text or settlement id against regions / districts / cities. */
export function matchCityQuery(
  query: string,
  locale: Locale,
): Settlement | null {
  const q = normalize(query);
  if (!q) return null;

  const byId = getSettlementById(query.trim());
  if (byId) return byId;

  const exact = uzbekistanSettlements.find((item) => {
    const label = normalize(locale === "uz" ? item.uz : item.ru);
    const other = normalize(locale === "uz" ? item.ru : item.uz);
    return label === q || other === q || item.id === q;
  });
  if (exact) return exact;

  return (
    uzbekistanSettlements.find((item) => {
      const label = normalize(locale === "uz" ? item.uz : item.ru);
      const other = normalize(locale === "uz" ? item.ru : item.uz);
      return (
        label.includes(q) ||
        other.includes(q) ||
        q.includes(label) ||
        item.id.includes(q.replace(/\s+/g, "_"))
      );
    }) ?? null
  );
}
