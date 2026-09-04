"use client";

import { Form, Formik, useFormikContext } from "formik";
import { useState } from "react";
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
import { cn } from "@/lib/cn";
import {
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
}

const stepSchemas = [
  Yup.object({
    fromRegion: requiredString(),
    fromCity: requiredString(),
    toRegion: requiredString(),
    toCity: requiredString(),
    pickup: yesNoRequired(),
    doorDelivery: yesNoRequired(),
  }),
  Yup.object({
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
  }),
  Yup.object({
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
  }),
];

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

function PriceSteps({
  step,
  setStep,
  locale,
  content,
}: {
  step: number;
  setStep: (updater: (s: number) => number) => void;
  locale: Locale;
  content: SiteCopy;
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
        </>
      ) : null}

      {step === 1 ? (
        <>
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

      {step === 2 ? (
        <>
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
        submitLabel={step < 2 ? content.ui.next : content.ui.getQuote}
        showBack={step > 0}
        backLabel={content.ui.back}
        onBack={() => setStep((s) => s - 1)}
      />
    </>
  );
}

export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialPickup = false,
}: PriceFormProps) {
  const [step, setStep] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("req"));

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
          fromRegion: "",
          fromCity: "",
          toRegion: "",
          toCity: "",
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
          comment: "",
          consent: false,
          website: "",
        }}
        validationSchema={stepSchemas[step]}
        onSubmit={async (values, helpers) => {
          if (step < 2) {
            trackEvent("price_form_step_complete", { step });
            setStep((s) => s + 1);
            helpers.setTouched({});
            helpers.setSubmitting(false);
            return;
          }

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
          />
        </Form>
      </Formik>
    </div>
  );
}
