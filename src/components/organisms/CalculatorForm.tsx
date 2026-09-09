"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import {
  getSettlementById,
  settlementLabel,
} from "@/data/settlements";
import { Button } from "@/components/atoms/Button";
import { RangeSlider } from "@/components/atoms/RangeSlider";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { trackEvent } from "@/lib/analytics/events";
import { submitLead } from "@/lib/form/submitLead";
import {
  createRequestId,
  isValidUzPhone,
  normalizePhone,
} from "@/lib/form/utils";
import { fetchEstimate } from "@/lib/pricing/client";
import type { QuoteEstimate } from "@/lib/pricing/estimate";
import { formatUzs } from "@/lib/pricing/estimate";
import { matchCityQuery } from "@/lib/pricing/matchCity";
import { CALC_LIMITS, CALC_QUICK_CITIES } from "@/lib/pricing/limits";
import type { PublicPricingUiConfig } from "@/lib/pricing/types";
import { cn } from "@/lib/cn";
import {
  checkRow,
  fieldControl,
  fieldError,
  fieldLabel,
} from "@/styles/ui";

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
  quickCityIds,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (cityId: string) => void;
  locale: Locale;
  content: SiteCopy;
  quickCityIds: string[];
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
          {quickCityIds.map((cityId) => {
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
  publicUi,
}: {
  locale: Locale;
  content: SiteCopy;
  initialFromQuery?: string;
  initialToQuery?: string;
  initialCategory?: string;
  publicUi?: PublicPricingUiConfig | null;
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

  const limits = publicUi?.limits ?? CALC_LIMITS;
  const quickCityIds = publicUi?.quickCityIds?.length
    ? publicUi.quickCityIds
    : [...CALC_QUICK_CITIES];
  const calculatorEnabled = publicUi?.enabled !== false;

  const [fromCity, setFromCity] = useState(fromSeed?.id ?? "");
  const [toCity, setToCity] = useState(toSeed?.id ?? "");
  const [weight, setWeight] = useState<number>(limits.weightKg.default);
  const [length, setLength] = useState<number>(limits.lengthCm.default);
  const [width, setWidth] = useState<number>(limits.widthCm.default);
  const [height, setHeight] = useState<number>(limits.heightCm.default);
  const [submitted, setSubmitted] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [leadAttempted, setLeadAttempted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("calc"));

  useEffect(() => {
    setWeight(limits.weightKg.default);
    setLength(limits.lengthCm.default);
    setWidth(limits.widthCm.default);
    setHeight(limits.heightCm.default);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when SSR limits arrive
  }, [publicUi?.formulaVersion]);

  const fromMeta = getSettlementById(fromCity);
  const toMeta = getSettlementById(toCity);
  const fc = content.formCommon;

  const fromError =
    submitted && !fromCity ? c.errors.fromCity : undefined;
  const toError = submitted && !toCity ? c.errors.toCity : undefined;

  const daysLabel =
    estimate &&
    (locale === "uz" ? `${estimate.etaDays} kun` : `${estimate.etaDays} дн.`);

  const phoneError =
    leadAttempted && !isValidUzPhone(phone) ? c.errors.phone : undefined;
  const consentError =
    leadAttempted && !consent ? c.errors.consent : undefined;

  const reset = () => {
    setFromCity("");
    setToCity("");
    setWeight(limits.weightKg.default);
    setLength(limits.lengthCm.default);
    setWidth(limits.widthCm.default);
    setHeight(limits.heightCm.default);
    setSubmitted(false);
    setEstimating(false);
    setEstimate(null);
    setEstimateError(null);
    setPhone("");
    setName("");
    setConsent(false);
    setWebsite("");
    setLeadAttempted(false);
    setLeadSubmitting(false);
    setLeadId(null);
  };

  const submitLeadRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!estimate || !fromMeta || !toMeta || leadSubmitting) return;
    setLeadAttempted(true);
    if (!isValidUzPhone(phone) || !consent) return;

    setLeadSubmitting(true);
    const result = await submitLead({
      type: "price",
      locale,
      requestId,
      website,
      data: {
        name: name.trim(),
        phone: normalizePhone(phone),
        from: locale === "uz" ? fromMeta.uz : fromMeta.ru,
        to: locale === "uz" ? toMeta.uz : toMeta.ru,
        fromCityId: fromMeta.id,
        toCityId: toMeta.id,
        weightKg: weight,
        lengthCm: length,
        widthCm: width,
        heightCm: height,
        estimateAmount: estimate.amount,
        estimateEtaDays: estimate.etaDays,
        estimateCurrency: estimate.currency,
        formulaVersion: estimate.formulaVersion,
        rateSource: estimate.rateSource,
        category,
        source: "calculator",
        clientType: "person",
        consent: true,
      },
      successTitle: c.leadSuccessTitle,
      successText: c.leadSuccessText,
      eventPrefix: "calculator_lead",
    });
    setLeadSubmitting(false);
    if (result) setLeadId(result.id);
  };

  const calculate = async () => {
    setSubmitted(true);
    setEstimateError(null);
    setLeadId(null);
    if (!fromCity || !toCity || !fromMeta || !toMeta) return;
    if (!calculatorEnabled) {
      setEstimate(null);
      setEstimateError("calculator_disabled");
      return;
    }

    setEstimating(true);
    const next = await fetchEstimate({
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
    setEstimating(false);

    if (!next) {
      setEstimate(null);
      setEstimateError("estimate_failed");
      return;
    }

    setEstimate(next);
    trackEvent("price_estimate_shown", {
      source: "calculator",
      zone: next.zone,
      formulaVersion: next.formulaVersion,
      rateSource: next.rateSource,
    });
  };

  return (
    <div className="grid gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white">
      {!calculatorEnabled ? (
        <div className="border-b border-black/[0.06] bg-[#fafafa] px-4 py-3 text-sm text-black/55 sm:px-6">
          {locale === "uz"
            ? "Kalkulyator vaqtincha o‘chirilgan. Menejerga ariza qoldiring."
            : "Калькулятор временно отключён. Оставьте заявку менеджеру."}
        </div>
      ) : null}

      <div className="grid gap-4 border-b border-black/[0.06] p-4 sm:gap-5 sm:p-6 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-3">
          <CityField
            id="calc-from"
            label={c.fromLabel}
            value={fromCity}
            onChange={setFromCity}
            locale={locale}
            content={content}
            quickCityIds={quickCityIds}
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
            quickCityIds={quickCityIds}
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
            min={limits.weightKg.min}
            max={limits.weightKg.max}
            step={limits.weightKg.step}
            unit={c.unitKg}
            onChange={setWeight}
          />
          <RangeSlider
            id="calc-length"
            label={c.lengthLabel}
            value={length}
            min={limits.lengthCm.min}
            max={limits.lengthCm.max}
            step={limits.lengthCm.step}
            unit={c.unitCm}
            onChange={setLength}
          />
          <RangeSlider
            id="calc-width"
            label={c.widthLabel}
            value={width}
            min={limits.widthCm.min}
            max={limits.widthCm.max}
            step={limits.widthCm.step}
            unit={c.unitCm}
            onChange={setWidth}
          />
          <RangeSlider
            id="calc-height"
            label={c.heightLabel}
            value={height}
            min={limits.heightCm.min}
            max={limits.heightCm.max}
            step={limits.heightCm.step}
            unit={c.unitCm}
            onChange={setHeight}
          />
        </div>
        <p className="m-0 text-xs leading-relaxed text-black/45">{c.limitsNote}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.06] bg-white p-4 sm:p-6 lg:px-7 lg:py-5">
        <Button
          type="button"
          variant="primary"
          onClick={() => void calculate()}
          disabled={estimating || !calculatorEnabled}
        >
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

      {estimateError ? (
        <div className="border-t border-black/[0.06] px-4 py-3 text-sm text-danger sm:px-6">
          {estimateError === "calculator_disabled"
            ? locale === "uz"
              ? "Kalkulyator o‘chirilgan."
              : "Калькулятор отключён."
            : locale === "uz"
              ? "Hisoblab bo‘lmadi. Qayta urinib ko‘ring."
              : "Не удалось рассчитать. Попробуйте ещё раз."}
        </div>
      ) : null}

      {estimate ? (
        <div className="grid gap-4 border-t border-black/[0.06] bg-white p-4 sm:gap-5 sm:p-6 lg:p-7">
          <h2 className="m-0 font-display text-lg font-semibold uppercase tracking-wide text-black sm:text-xl">
            {c.resultTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-black/40">
                {c.resultRangeLabel}
              </p>
              <p className="m-0 mt-1 font-display text-xl font-semibold text-black sm:text-2xl">
                {formatUzs(estimate.amount, locale)} {estimate.currency}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-black/40">
                {c.resultEtaLabel}
              </p>
              <p className="m-0 mt-1 text-lg font-medium text-black">{daysLabel}</p>
            </div>
          </div>

          {leadId ? (
            <div
              className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              <strong>
                {c.leadSuccessTitle}. ID: {leadId}
              </strong>
              <p className="mb-0 mt-1 opacity-90">{c.leadSuccessText}</p>
            </div>
          ) : (
            <form
              className="grid gap-3 border-t border-black/[0.06] pt-4"
              onSubmit={(e) => void submitLeadRequest(e)}
              noValidate
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="calc-phone" className={fieldLabel}>
                    {fc.phone} *
                  </label>
                  <input
                    id="calc-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+998 XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={cn(fieldControl, "!min-h-10 !py-2 sm:!min-h-11")}
                    aria-invalid={Boolean(phoneError)}
                  />
                  {phoneError ? (
                    <p className={cn(fieldError, "m-0")}>{phoneError}</p>
                  ) : null}
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="calc-name" className={fieldLabel}>
                    {fc.name}
                  </label>
                  <input
                    id="calc-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(fieldControl, "!min-h-10 !py-2 sm:!min-h-11")}
                  />
                </div>
              </div>

              <label className={cn(checkRow, "!mb-0 text-[0.85rem]")}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
                />
                <span>{fc.consent}</span>
              </label>
              {consentError ? (
                <p className={cn(fieldError, "m-0")}>{consentError}</p>
              ) : null}

              <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden>
                <label htmlFor="calc-website">{fc.honeypot}</label>
                <input
                  id="calc-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={leadSubmitting}
                >
                  {c.confirmCta}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
