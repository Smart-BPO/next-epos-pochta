"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import {
  uzbekistanSettlements,
  settlementLabel,
} from "@/data/settlements";
import {
  MAP_REGION_BY_ISO,
  MAP_REGION_BY_SLUG,
  mapRegionLabel,
  type MapRegionIso,
} from "@/data/uzbekistan-map";
import { Button } from "@/components/atoms/Button";
import { UzbekistanMap } from "@/components/molecules/UzbekistanMap";
import { fieldControl, homeSectionLead, homeSectionTitle } from "@/styles/ui";

export function GeoSection({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const [query, setQuery] = useState("");
  const [activeIso, setActiveIso] = useState<MapRegionIso | null>("UZTK");

  const activeRegion = activeIso ? MAP_REGION_BY_ISO[activeIso] : null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return uzbekistanSettlements
      .filter((item) => {
        const label = settlementLabel(item, locale).toLowerCase();
        const region =
          locale === "uz" ? item.regionUz.toLowerCase() : item.regionRu.toLowerCase();
        return label.includes(q) || region.includes(q) || item.id.includes(q);
      })
      .slice(0, 4);
  }, [query, locale]);

  const regionSettlements = useMemo(() => {
    if (!activeRegion) return [];
    return uzbekistanSettlements
      .filter(
        (item) =>
          item.regionId === activeRegion.slug && item.level !== "region",
      )
      .slice(0, 6);
  }, [activeRegion]);

  const selectIso = (iso: MapRegionIso) => {
    setActiveIso(iso);
  };

  const applyMatch = (regionId: string) => {
    const region = MAP_REGION_BY_SLUG[regionId];
    if (region) setActiveIso(region.iso);
  };

  const mapHint =
    locale === "uz"
      ? "Xaritada viloyatni bosing yoki shahar nomini qidiring"
      : "Нажмите область на карте или найдите город";

  const openCityLabel =
    locale === "uz" ? "Shahar sahifasi" : "Страница города";

  return (
    <section
      id="geo"
      className="relative isolate scroll-mt-[var(--header-height)] overflow-hidden py-[var(--section-y)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgb(211_2_3/0.06),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-[min(calc(100%-2*var(--page-padding)),var(--page-max))] flex-col gap-6 md:gap-9">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 className={homeSectionTitle}>{copy.home.geoTitle}</h2>
              <p className={homeSectionLead}>{copy.home.geoLead}</p>
              <p className="m-0 text-sm text-black/50">{mapHint}</p>
            </div>

            <div className="rounded-3xl border border-black/12 bg-white p-4 shadow-[0_4px_20px_rgb(15_18_24/0.05)] sm:p-5">
              <label className="grid gap-2">
                <span className="sr-only">{copy.home.geoSearchPlaceholder}</span>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
                  <input
                    value={query}
                    onChange={(e) => {
                      const next = e.target.value;
                      setQuery(next);
                      const q = next.trim().toLowerCase();
                      if (!q) return;
                      const hit = uzbekistanSettlements.find((item) => {
                        const label = settlementLabel(item, locale).toLowerCase();
                        return (
                          label.includes(q) ||
                          item.regionUz.toLowerCase().includes(q) ||
                          item.regionRu.toLowerCase().includes(q)
                        );
                      });
                      if (hit) applyMatch(hit.regionId);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && matches[0]) {
                        e.preventDefault();
                        applyMatch(matches[0].regionId);
                        setQuery(settlementLabel(matches[0], locale));
                      }
                    }}
                    placeholder={copy.home.geoSearchPlaceholder}
                    className={`${fieldControl} min-w-0 flex-1`}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full shrink-0 !min-h-11 sm:w-auto sm:self-stretch"
                    onClick={() => {
                      if (matches[0]) {
                        applyMatch(matches[0].regionId);
                        setQuery(settlementLabel(matches[0], locale));
                      }
                    }}
                  >
                    {copy.ui.geoCheck}
                  </Button>
                </div>
              </label>

              {query.trim() && matches.length === 0 ? (
                <p className="mt-3 m-0 text-sm text-black/55">
                  {copy.home.geoEmpty}
                </p>
              ) : null}

              {matches.length > 0 ? (
                <ul className="mt-3 m-0 grid list-none gap-1 p-0">
                  {matches.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-black/10 hover:bg-surface-muted"
                        onClick={() => {
                          applyMatch(item.regionId);
                          setQuery(settlementLabel(item, locale));
                        }}
                      >
                        <span className="min-w-0">
                          <strong className="block truncate text-sm font-semibold text-black">
                            {settlementLabel(item, locale)}
                          </strong>
                          <span className="text-xs text-black/50">
                            {locale === "uz" ? item.regionUz : item.regionRu}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-medium text-primary">
                          {locale === "uz" ? "Tanlash" : "Выбрать"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {activeRegion ? (
                <div className="mt-4 rounded-2xl border border-primary/15 bg-primary-soft/60 p-3.5 sm:p-4">
                  <p className="m-0 font-display text-base font-semibold uppercase tracking-[-0.02em] text-black">
                    {mapRegionLabel(activeRegion, locale)}
                  </p>
                  <p className="mt-1.5 m-0 text-sm leading-snug text-black/60">
                    {copy.home.geoAvailable}
                  </p>

                  {regionSettlements.length > 0 ? (
                    <p className="mt-2 m-0 text-xs leading-relaxed text-black/50">
                      {regionSettlements
                        .map((item) => settlementLabel(item, locale))
                        .join(" · ")}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeRegion.deliverySlug ? (
                      <Link
                        href={localePath(
                          locale,
                          `/delivery/${activeRegion.deliverySlug}/`,
                        )}
                        className="inline-flex min-h-10 items-center rounded-full border border-primary bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                      >
                        {openCityLabel}
                      </Link>
                    ) : null}
                    <Button
                      href={localePath(locale, "/calculator/")}
                      variant="primary"
                      className="!min-h-10 !px-4 !py-2 text-sm"
                    >
                      {copy.ui.calculate}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 m-0 text-sm text-black/55">
                  {copy.home.geoEmpty}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-3 shadow-[0_4px_20px_rgb(15_18_24/0.04)] sm:p-5 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
            <UzbekistanMap
              locale={locale}
              activeIso={activeIso}
              onSelect={(iso) => {
                selectIso(iso);
                setQuery("");
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
