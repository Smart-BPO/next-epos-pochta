"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { RangeSlider } from "@/components/atoms/RangeSlider";
import { trackEvent } from "@/lib/analytics/events";
import { estimateQuote, formatUzs } from "@/lib/pricing/estimate";
import { matchCityQuery } from "@/lib/pricing/matchCity";
import { CALC_LIMITS, CALC_QUICK_CITIES } from "@/lib/pricing/limits";
import { cn } from "@/lib/cn";
import {
  alertInfo,
  card,
  fieldControl,
  fieldLabel,
  quizChip,
  quizChipActive,
  quizChipIdle,
  quizChips,
} from "@/styles/ui";

function cityLabel(locale: Locale, id: string) {
  const city = uzbekistanCities.find((c) => c.id === id);
  if (!city) return id;
  return locale === "uz" ? city.uz : city.ru;
}

function SwapIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7h10.5M12 4.5 14.5 7 12 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H5.5M8 10.5 5.5 13 8 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CityField({
  id,
  label,
  value,
  onChange,
  locale,
  content,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (cityId: string) => void;
  locale: Locale;
  content: SiteCopy;
  error?: string;
}) {
  const cities = uzbekistanCities;
  const quick = CALC_QUICK_CITIES;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldControl}
      >
        <option value="">{content.calculator.cityPlaceholder}</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {locale === "uz" ? city.uz : city.ru}
          </option>
        ))}
      </select>
      <div className={quizChips}>
        {quick.map((cityId) => (
          <button
            key={cityId}
            type="button"
            className={cn(
              quizChip,
              value === cityId ? quizChipActive : quizChipIdle,
            )}
            onClick={() => onChange(cityId)}
          >
            {cityLabel(locale, cityId)}
          </button>
        ))}
      </div>
      {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function CalculatorForm({
  locale,
  content,
  initialFromQuery = "",
  initialToQuery = "",
}: {
  locale: Locale;
  content: SiteCopy;
  initialFromQuery?: string;
  initialToQuery?: string;
}) {
  const c = content.calculator;
  const fromSeed = matchCityQuery(initialFromQuery, locale);
  const toSeed = matchCityQuery(initialToQuery, locale);

  const [fromCity, setFromCity] = useState(fromSeed?.id ?? "");
  const [toCity, setToCity] = useState(toSeed?.id ?? "");
  const [weight, setWeight] = useState<number>(CALC_LIMITS.weightKg.default);
  const [length, setLength] = useState<number>(CALC_LIMITS.lengthCm.default);
  const [width, setWidth] = useState<number>(CALC_LIMITS.widthCm.default);
  const [height, setHeight] = useState<number>(CALC_LIMITS.heightCm.default);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const fromMeta = uzbekistanCities.find((city) => city.id === fromCity);
  const toMeta = uzbekistanCities.find((city) => city.id === toCity);

  const estimate = useMemo(() => {
    if (!fromMeta || !toMeta) return null;
    return estimateQuote({
      fromRegionId: fromMeta.regionId,
      fromCityId: fromMeta.id,
      toRegionId: toMeta.regionId,
      toCityId: toMeta.id,
      weightKg: weight > 0 ? weight : null,
      lengthCm: length > 0 ? length : null,
      widthCm: width > 0 ? width : null,
      heightCm: height > 0 ? height : null,
      unknownDims: weight <= 0,
      pickup: false,
      doorDelivery: false,
      places: 1,
      urgent: false,
      category: "parcel",
    });
  }, [fromMeta, toMeta, weight, length, width, height]);

  const fromError =
    submitted && !fromCity ? c.errors.fromCity : undefined;
  const toError = submitted && !toCity ? c.errors.toCity : undefined;

  const daysLabel =
    estimate &&
    (locale === "uz"
      ? `${estimate.etaDaysMin}–${estimate.etaDaysMax} kun`
      : `${estimate.etaDaysMin}–${estimate.etaDaysMax} дн.`);

  const confirmHref = (() => {
    const params = new URLSearchParams();
    if (fromMeta) {
      params.set("from", locale === "uz" ? fromMeta.uz : fromMeta.ru);
    }
    if (toMeta) {
      params.set("to", locale === "uz" ? toMeta.uz : toMeta.ru);
    }
    const qs = params.toString();
    return `${localePath(locale, "/request-price/")}${qs ? `?${qs}` : ""}`;
  })();

  const reset = () => {
    setFromCity("");
    setToCity("");
    setWeight(CALC_LIMITS.weightKg.default);
    setLength(CALC_LIMITS.lengthCm.default);
    setWidth(CALC_LIMITS.widthCm.default);
    setHeight(CALC_LIMITS.heightCm.default);
    setSubmitted(false);
    setShowResult(false);
  };

  const calculate = () => {
    setSubmitted(true);
    if (!fromCity || !toCity) return;
    setShowResult(true);
    trackEvent("price_estimate_shown", {
      source: "calculator",
      zone: estimate?.zone ?? "",
      formulaVersion: estimate?.formulaVersion ?? "",
    });
  };

  return (
    <div className={cn(card, "grid gap-6")}>
      <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <CityField
          id="calc-from"
          label={c.fromLabel}
          value={fromCity}
          onChange={setFromCity}
          locale={locale}
          content={content}
          error={fromError}
        />

        <div className="flex items-center justify-center lg:pt-10">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 text-black/60 transition-colors hover:border-primary/40 hover:text-primary"
            aria-label={c.swap}
            onClick={() => {
              setFromCity(toCity);
              setToCity(fromCity);
            }}
          >
            <SwapIcon />
          </button>
        </div>

        <CityField
          id="calc-to"
          label={c.toLabel}
          value={toCity}
          onChange={setToCity}
          locale={locale}
          content={content}
          error={toError}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <RangeSlider
          id="calc-weight"
          label={c.weightLabel}
          value={weight}
          min={CALC_LIMITS.weightKg.min}
          max={CALC_LIMITS.weightKg.max}
          step={CALC_LIMITS.weightKg.step}
          unit={c.unitKg}
          onChange={setWeight}
        />
        <RangeSlider
          id="calc-length"
          label={c.lengthLabel}
          value={length}
          min={CALC_LIMITS.lengthCm.min}
          max={CALC_LIMITS.lengthCm.max}
          step={CALC_LIMITS.lengthCm.step}
          unit={c.unitCm}
          onChange={setLength}
        />
        <RangeSlider
          id="calc-width"
          label={c.widthLabel}
          value={width}
          min={CALC_LIMITS.widthCm.min}
          max={CALC_LIMITS.widthCm.max}
          step={CALC_LIMITS.widthCm.step}
          unit={c.unitCm}
          onChange={setWidth}
        />
        <RangeSlider
          id="calc-height"
          label={c.heightLabel}
          value={height}
          min={CALC_LIMITS.heightCm.min}
          max={CALC_LIMITS.heightCm.max}
          step={CALC_LIMITS.heightCm.step}
          unit={c.unitCm}
          onChange={setHeight}
        />
      </div>

      <p className="m-0 text-xs text-ink-muted">{c.limitsNote}</p>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" onClick={calculate}>
          {c.calculateCta}
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          {c.resetCta}
        </Button>
      </div>

      {showResult && estimate ? (
        <div className="grid gap-4 rounded-2xl border border-black/10 bg-surface-muted p-5">
          <h2 className="m-0 font-display text-xl font-semibold uppercase text-black">
            {c.resultTitle}
          </h2>
          <div>
            <p className="m-0 text-sm text-ink-muted">{c.resultRangeLabel}</p>
            <p className="m-0 mt-1 font-display text-2xl font-semibold text-black">
              {formatUzs(estimate.min, locale)} –{" "}
              {formatUzs(estimate.max, locale)} {estimate.currency}
            </p>
          </div>
          <div>
            <p className="m-0 text-sm text-ink-muted">{c.resultEtaLabel}</p>
            <p className="m-0 mt-1 text-lg font-medium text-black">{daysLabel}</p>
          </div>
          <p className="m-0 text-sm text-ink-muted">
            {c.billableLabel}: {estimate.billableKg} {c.unitKg}
          </p>
          <div className={`${alertInfo} mb-0 rounded-xl`}>{c.disclaimer}</div>
          <Link
            href={confirmHref}
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() =>
              trackEvent("request_price_start", { source: "calculator" })
            }
          >
            {c.confirmCta}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
