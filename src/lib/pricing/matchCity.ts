import {
  getSettlementById,
  regionLabel,
  settlementLabel,
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

  const namesOf = (item: Settlement) =>
    [
      settlementLabel(item, locale),
      item.uz,
      item.ru,
      regionLabel(item, locale),
    ].map(normalize);

  const exact = uzbekistanSettlements.find((item) => {
    const names = namesOf(item);
    return names.some((name) => name === q) || item.id === q;
  });
  if (exact) return exact;

  return (
    uzbekistanSettlements.find((item) => {
      const names = namesOf(item);
      return (
        names.some((name) => name.includes(q) || (name && q.includes(name))) ||
        item.id.includes(q.replace(/\s+/g, "_"))
      );
    }) ?? null
  );
}
