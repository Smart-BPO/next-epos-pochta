"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import {
  getSettlementById,
  settlementLabel,
} from "@/data/settlements";
import { Button } from "@/components/atoms/Button";
import { RangeSlider } from "@/components/atoms/RangeSlider";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { trackEvent } from "@/lib/analytics/events";
import { estimateQuote, formatUzs } from "@/lib/pricing/estimate";
import { matchCityQuery } from "@/lib/pricing/matchCity";
import { CALC_LIMITS, CALC_QUICK_CITIES } from "@/lib/pricing/limits";
import { fieldLabel } from "@/styles/ui";

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
  const showHints = !value;

  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <SettlementSelect
        id={id}
        instanceId={id}
        locale={locale}
        value={value}
        onChange={onChange}
        placeholder={content.calculator.cityPlaceholder}
      />
      {showHints ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {CALC_QUICK_CITIES.map((cityId) => {
            const settlement = getSettlementById(cityId);
            if (!settlement) return null;
            return (
              <button
                key={cityId}
                type="button"
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/55 transition-colors hover:border-primary/35 hover:text-primary"
                onClick={() => onChange(cityId)}
              >
                {settlementLabel(settlement, locale)}
              </button>
            );
          })}
        </div>
      ) : null}
      {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function CalculatorForm({
  locale,
  content,
  initialFromQuery = "",
  initialToQuery = "",
  initialCategory = "",
}: {
  locale: Locale;
  content: SiteCopy;
  initialFromQuery?: string;
  initialToQuery?: string;
  initialCategory?: string;
}) {
  const c = content.calculator;
  const fromSeed = matchCityQuery(initialFromQuery, locale);
  const toSeed = matchCityQuery(initialToQuery, locale);
  const category =
    initialCategory === "documents" ||
    initialCategory === "parcel" ||
    initialCategory === "goods"
      ? initialCategory
      : "parcel";

  const [fromCity, setFromCity] = useState(fromSeed?.id ?? "");
  const [toCity, setToCity] = useState(toSeed?.id ?? "");
  const [weight, setWeight] = useState<number>(CALC_LIMITS.weightKg.default);
  const [length, setLength] = useState<number>(CALC_LIMITS.lengthCm.default);
  const [width, setWidth] = useState<number>(CALC_LIMITS.widthCm.default);
  const [height, setHeight] = useState<number>(CALC_LIMITS.heightCm.default);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const fromMeta = getSettlementById(fromCity);
  const toMeta = getSettlementById(toCity);

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
      category,
    });
  }, [fromMeta, toMeta, weight, length, width, height, category]);

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
    if (initialCategory) params.set("category", initialCategory);
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
    <div className="grid gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white">
      <div className="grid gap-4 border-b border-black/[0.06] p-4 sm:gap-5 sm:p-6 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-3">
          <CityField
            id="calc-from"
            label={c.fromLabel}
            value={fromCity}
            onChange={setFromCity}
            locale={locale}
            content={content}
            error={fromError}
          />

          <div className="flex items-center justify-center lg:pt-9">
            <button
              type="button"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/45 transition-colors hover:border-primary/30 hover:text-primary"
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
      </div>

      <div className="grid gap-4 bg-[#fafafa] p-4 sm:gap-5 sm:p-6 lg:p-7">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
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
        <p className="m-0 text-xs leading-relaxed text-black/45">{c.limitsNote}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.06] bg-white p-4 sm:p-6 lg:px-7 lg:py-5">
        <Button type="button" variant="primary" onClick={calculate}>
          {c.calculateCta}
        </Button>
        <button
          type="button"
          onClick={reset}
          className="px-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {c.resetCta}
        </button>
      </div>

      {showResult && estimate ? (
        <div className="grid gap-4 border-t border-black/[0.06] bg-white p-4 sm:p-6 lg:p-7">
          <h2 className="m-0 font-display text-lg font-semibold uppercase tracking-wide text-black sm:text-xl">
            {c.resultTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-black/40">
                {c.resultRangeLabel}
              </p>
              <p className="m-0 mt-1 font-display text-xl font-semibold text-black sm:text-2xl">
                {formatUzs(estimate.min, locale)} –{" "}
                {formatUzs(estimate.max, locale)} {estimate.currency}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-black/40">
                {c.resultEtaLabel}
              </p>
              <p className="m-0 mt-1 text-lg font-medium text-black">{daysLabel}</p>
            </div>
          </div>
          <Link
            href={confirmHref}
            className="w-fit font-medium text-primary underline-offset-2 hover:underline"
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
