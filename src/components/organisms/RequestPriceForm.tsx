"use client";

import { Form, Formik, useFormikContext } from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities, uzbekistanRegions } from "@/data/types";
import { FormCheckbox } from "@/components/atoms/form/FormControls";
import {
  ConsentField,
  FormActions,
  FormAreaField,
  FormInputField,
  FormRow,
  HoneypotField,
  SelectField,
} from "@/components/molecules/form/fields";
import { trackEvent } from "@/lib/analytics/events";
import {
  consentRequired,
  optionalEmail,
  phoneRequired,
  requiredString,
  withNormalizedPhone,
  yesNo,
  yesNoRequired,
} from "@/lib/form/schemas";
import { submitLead } from "@/lib/form/submitLead";
import { createRequestId, yesNoOptions } from "@/lib/form/utils";
import {
  estimateQuote,
  formatUzs,
  type QuoteEstimate,
} from "@/lib/pricing/estimate";
import { matchCityQuery } from "@/lib/pricing/matchCity";
import { cn } from "@/lib/cn";
import {
  alertInfo,
  alertSuccess,
  card,
  formShell,
  formStepActive,
  formStepDone,
  formStepPill,
  formSteps,
} from "@/styles/ui";

interface PriceFormProps {
  locale: Locale;
  content: SiteCopy;
  initialCategory?: string;
  initialPickup?: boolean;
  initialFromQuery?: string;
  initialToQuery?: string;
}

const routeParcelSchema = Yup.object({
  fromRegion: requiredString(),
  fromCity: requiredString(),
  toRegion: requiredString(),
  toCity: requiredString(),
  pickup: yesNoRequired(),
  doorDelivery: yesNoRequired(),
  category: requiredString(),
  description: requiredString().min(2),
  places: Yup.number().integer().min(1).required(),
  unknownDims: Yup.boolean(),
  weight: Yup.number().when("unknownDims", {
    is: false,
    then: (s) => s.positive().required(),
    otherwise: (s) => s.notRequired(),
  }),
  length: Yup.number().positive().nullable(),
  width: Yup.number().positive().nullable(),
  height: Yup.number().positive().nullable(),
  urgent: yesNo(),
  cod: yesNo(),
  declaredValue: Yup.number().when("cod", {
    is: "true",
    then: (s) => s.positive().required(),
    otherwise: (s) => s.notRequired(),
  }),
  preferredDate: Yup.string(),
});

const contactsSchema = Yup.object({
  clientType: Yup.string().oneOf(["person", "company"]).required(),
  name: requiredString(),
  phone: phoneRequired(),
  email: optionalEmail(),
  contactMethod: Yup.string()
    .oneOf(["call", "telegram", "email"])
    .required(),
  company: Yup.string().when("clientType", {
    is: "company",
    then: (s) => s.required(),
    otherwise: (s) => s.notRequired(),
  }),
  inn: Yup.string(),
  monthlyVolume: Yup.number().integer().min(1),
  needApi: yesNo(),
  comment: Yup.string(),
  consent: consentRequired(),
  website: Yup.string(),
});

const stepSchemas = [routeParcelSchema, Yup.object({}), contactsSchema];

type PriceValues = {
  fromRegion: string;
  fromCity: string;
  toRegion: string;
  toCity: string;
  pickup: string;
  doorDelivery: string;
  category: string;
  description: string;
  places: number;
  weight: string | number;
  length: string | number;
  width: string | number;
  height: string | number;
  unknownDims: boolean;
  urgent: string;
  cod: string;
  declaredValue: string | number;
  preferredDate: string;
  clientType: string;
  name: string;
  phone: string;
  email: string;
  contactMethod: string;
  company: string;
  inn: string;
  monthlyVolume: string | number;
  needApi: string;
  comment: string;
  consent: boolean;
  website: string;
};

function localeOptions(
  locale: Locale,
  items: ReadonlyArray<{ id: string; ru: string; uz: string }>,
) {
  return items.map((item) => ({
    value: item.id,
    label: locale === "uz" ? item.uz : item.ru,
  }));
}

function numOrNull(value: string | number) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildEstimate(values: PriceValues): QuoteEstimate {
  return estimateQuote({
    fromRegionId: values.fromRegion,
    fromCityId: values.fromCity,
    toRegionId: values.toRegion,
    toCityId: values.toCity,
    weightKg: values.unknownDims ? null : numOrNull(values.weight),
    lengthCm: values.unknownDims ? null : numOrNull(values.length),
    widthCm: values.unknownDims ? null : numOrNull(values.width),
    heightCm: values.unknownDims ? null : numOrNull(values.height),
    unknownDims: values.unknownDims,
    pickup: values.pickup === "true",
    doorDelivery: values.doorDelivery === "true",
    places: Number(values.places) || 1,
    urgent: values.urgent === "true",
    category: values.category,
  });
}

function EstimatePanel({
  locale,
  content,
  estimate,
  unknownDims,
}: {
  locale: Locale;
  content: SiteCopy;
  estimate: QuoteEstimate;
  unknownDims: boolean;
}) {
  const rp = content.requestPrice;
  const daysLabel =
    locale === "uz"
      ? `${estimate.etaDaysMin}–${estimate.etaDaysMax} kun`
      : `${estimate.etaDaysMin}–${estimate.etaDaysMax} дн.`;

  return (
    <div className="grid gap-4 rounded-2xl border border-black/10 bg-surface-muted p-5">
      <h3 className="m-0 font-display text-xl font-semibold uppercase text-black">
        {rp.estimateTitle}
      </h3>
      <div>
        <p className="m-0 text-sm text-black/50">{rp.estimateRangeLabel}</p>
        <p className="m-0 mt-1 font-display text-2xl font-semibold text-black">
          {formatUzs(estimate.min, locale)} – {formatUzs(estimate.max, locale)}{" "}
          {estimate.currency}
        </p>
      </div>
      <div>
        <p className="m-0 text-sm text-black/50">{rp.estimateEtaLabel}</p>
        <p className="m-0 mt-1 text-lg font-medium text-black">{daysLabel}</p>
      </div>
      {unknownDims ? (
        <p className="m-0 text-sm text-black/60">{rp.estimateUnknownDimsNote}</p>
      ) : null}
      <div className={`${alertInfo} mb-0 rounded-xl`}>{rp.estimateDisclaimer}</div>
    </div>
  );
}

function PriceSteps({
  step,
  setStep,
  locale,
  content,
  estimate,
}: {
  step: number;
  setStep: (updater: (s: number) => number) => void;
  locale: Locale;
  content: SiteCopy;
  estimate: QuoteEstimate | null;
}) {
  const { values } = useFormikContext<PriceValues>();
  const f = content.requestPrice.fields;
  const c = content.formCommon;
  const yn = yesNoOptions(f.yes, f.no);
  const regions = localeOptions(locale, uzbekistanRegions);
  const citiesFor = (regionId: string) =>
    localeOptions(
      locale,
      uzbekistanCities.filter((city) => city.regionId === regionId),
    );

  return (
    <>
      {step === 0 ? (
        <>
          <SelectField
            name="fromRegion"
            label={f.fromRegion}
            required
            options={regions}
            clearFieldsOnChange={["fromCity"]}
          />
          <SelectField
            name="fromCity"
            label={f.fromCity}
            required
            options={citiesFor(values.fromRegion)}
          />
          <SelectField
            name="toRegion"
            label={f.toRegion}
            required
            options={regions}
            clearFieldsOnChange={["toCity"]}
          />
          <SelectField
            name="toCity"
            label={f.toCity}
            required
            options={citiesFor(values.toRegion)}
          />
          <FormRow>
            <SelectField
              name="pickup"
              label={f.pickup}
              options={yn}
              includeEmpty={false}
            />
            <SelectField
              name="doorDelivery"
              label={f.doorDelivery}
              options={yn}
              includeEmpty={false}
            />
          </FormRow>
          <SelectField
            name="category"
            label={f.category}
            required
            options={[
              { value: "documents", label: f.catDocuments },
              { value: "parcel", label: f.catParcel },
              { value: "goods", label: f.catGoods },
              { value: "other", label: f.catOther },
            ]}
          />
          <FormAreaField name="description" label={f.description} required />
          <FormRow>
            <FormInputField
              name="places"
              label={f.places}
              required
              type="number"
              min={1}
              step={1}
            />
            <FormInputField
              name="weight"
              label={f.weight}
              type="number"
              min={0.1}
              step="0.1"
              disabled={values.unknownDims}
            />
          </FormRow>
          <FormCheckbox name="unknownDims" label={f.unknownDims} />
          <FormRow>
            <FormInputField
              name="length"
              label={f.length}
              type="number"
              min={1}
              disabled={values.unknownDims}
            />
            <FormInputField
              name="width"
              label={f.width}
              type="number"
              min={1}
              disabled={values.unknownDims}
            />
            <FormInputField
              name="height"
              label={f.height}
              type="number"
              min={1}
              disabled={values.unknownDims}
            />
          </FormRow>
          <FormRow>
            <SelectField
              name="urgent"
              label={f.urgent}
              options={yn}
              includeEmpty={false}
            />
            <SelectField
              name="cod"
              label={f.cod}
              options={yn}
              includeEmpty={false}
            />
          </FormRow>
          {values.cod === "true" ? (
            <FormInputField
              name="declaredValue"
              label={f.declaredValue}
              type="number"
              min={1}
              required
            />
          ) : null}
          <FormInputField
            name="preferredDate"
            label={f.preferredDate}
            type="date"
          />
        </>
      ) : null}

      {step === 1 && estimate ? (
        <EstimatePanel
          locale={locale}
          content={content}
          estimate={estimate}
          unknownDims={values.unknownDims}
        />
      ) : null}

      {step === 2 ? (
        <>
          {estimate ? (
            <EstimatePanel
              locale={locale}
              content={content}
              estimate={estimate}
              unknownDims={values.unknownDims}
            />
          ) : null}
          <SelectField
            name="clientType"
            label={f.clientType}
            options={[
              { value: "person", label: c.clientTypePerson },
              { value: "company", label: c.clientTypeCompany },
            ]}
            includeEmpty={false}
          />
          <FormInputField name="name" label={c.name} required />
          <FormInputField
            name="phone"
            label={c.phone}
            required
            placeholder="+998 XX XXX XX XX"
          />
          <FormInputField name="email" label={c.email} type="email" />
          <SelectField
            name="contactMethod"
            label={f.contactMethod}
            options={[
              { value: "call", label: c.preferCall },
              { value: "telegram", label: c.preferTelegram },
              { value: "email", label: c.preferEmail },
            ]}
            includeEmpty={false}
          />
          {values.clientType === "company" ? (
            <>
              <FormInputField name="company" label={c.company} required />
              <FormInputField name="inn" label={c.inn} />
              <FormInputField
                name="monthlyVolume"
                label={f.monthlyVolume}
                type="number"
                min={1}
              />
              <SelectField
                name="needApi"
                label={f.needApi}
                options={yn}
                includeEmpty={false}
              />
            </>
          ) : null}
          <FormAreaField name="comment" label={f.comment} />
          <ConsentField label={`${c.consent}`} />
          <HoneypotField label={c.honeypot} />
        </>
      ) : null}

      <FormActions
        submitLabel={
          step === 0
            ? content.ui.calculate
            : step === 1
              ? content.ui.next
              : content.ui.getQuote
        }
        showBack={step > 0}
        backLabel={content.ui.back}
        onBack={() => setStep((s) => s - 1)}
      />
    </>
  );
}

function resolveInitialRoute(
  locale: Locale,
  fromQuery?: string,
  toQuery?: string,
) {
  const from = matchCityQuery(fromQuery ?? "", locale);
  const to = matchCityQuery(toQuery ?? "", locale);
  return {
    fromRegion: from?.regionId ?? "",
    fromCity: from?.id ?? "",
    toRegion: to?.regionId ?? "",
    toCity: to?.id ?? "",
    routeNote: [fromQuery, toQuery]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(" → "),
  };
}

export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialPickup = false,
  initialFromQuery = "",
  initialToQuery = "",
}: PriceFormProps) {
  const [step, setStep] = useState(0);
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("req"));
  const routeSeed = useMemo(
    () => resolveInitialRoute(locale, initialFromQuery, initialToQuery),
    [locale, initialFromQuery, initialToQuery],
  );

  if (successId) {
    return (
      <div className={alertSuccess} role="status">
        <strong>
          {content.requestPrice.successTitle}. ID: {successId}
        </strong>
        <p className="mb-0">{content.requestPrice.successText}</p>
      </div>
    );
  }

  return (
    <div className={cn(formShell, card)}>
      <div className={formSteps} aria-hidden>
        {content.requestPrice.steps.map((label, index) => (
          <div
            key={label}
            className={cn(
              formStepPill,
              index === step && formStepActive,
              index < step && formStepDone,
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <Formik<PriceValues>
        initialValues={{
          fromRegion: routeSeed.fromRegion,
          fromCity: routeSeed.fromCity,
          toRegion: routeSeed.toRegion,
          toCity: routeSeed.toCity,
          pickup: initialPickup ? "true" : "false",
          doorDelivery: "false",
          category: initialCategory || "",
          description: "",
          places: 1,
          weight: "",
          length: "",
          width: "",
          height: "",
          unknownDims: false,
          urgent: "false",
          cod: "false",
          declaredValue: "",
          preferredDate: "",
          clientType: "person",
          name: "",
          phone: "",
          email: "",
          contactMethod: "call",
          company: "",
          inn: "",
          monthlyVolume: "",
          needApi: "false",
          comment: routeSeed.routeNote
            ? locale === "uz"
              ? `Home quote: ${routeSeed.routeNote}`
              : `Маршрут с главной: ${routeSeed.routeNote}`
            : "",
          consent: false,
          website: "",
        }}
        validationSchema={stepSchemas[step]}
        onSubmit={async (values, helpers) => {
          if (step === 0) {
            const nextEstimate = buildEstimate(values);
            setEstimate(nextEstimate);
            trackEvent("price_form_step_complete", { step: 0 });
            trackEvent("price_estimate_shown", {
              zone: nextEstimate.zone,
              formulaVersion: nextEstimate.formulaVersion,
            });
            setStep(1);
            helpers.setTouched({});
            helpers.setSubmitting(false);
            return;
          }

          if (step === 1) {
            trackEvent("price_form_step_complete", { step: 1 });
            setStep(2);
            helpers.setTouched({});
            helpers.setSubmitting(false);
            return;
          }

          const finalEstimate = estimate ?? buildEstimate(values);
          const result = await submitLead({
            type: "price",
            locale,
            requestId,
            website: values.website,
            data: {
              ...withNormalizedPhone(values),
              pickup: values.pickup === "true",
              doorDelivery: values.doorDelivery === "true",
              urgent: values.urgent === "true",
              cod: values.cod === "true",
              needApi: values.needApi === "true",
              weight: values.unknownDims ? null : Number(values.weight),
              places: Number(values.places),
              declaredValue:
                values.cod === "true" ? Number(values.declaredValue) : null,
              monthlyVolume: values.monthlyVolume
                ? Number(values.monthlyVolume)
                : null,
              estimate: finalEstimate,
            },
            successTitle: content.requestPrice.successTitle,
            successText: content.requestPrice.successText,
            eventPrefix: "price_form",
          });
          if (result) setSuccessId(result.id);
          helpers.setSubmitting(false);
        }}
      >
        <Form noValidate>
          <PriceSteps
            step={step}
            setStep={setStep}
            locale={locale}
            content={content}
            estimate={estimate}
          />
        </Form>
      </Formik>
    </div>
  );
}
