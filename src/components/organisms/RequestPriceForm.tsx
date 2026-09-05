"use client";

import { Form, Formik, useFormikContext } from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import {
  ConsentField,
  FormActions,
  FormAreaField,
  FormInputField,
  FormRow,
  HoneypotField,
} from "@/components/molecules/form/fields";
import { trackEvent } from "@/lib/analytics/events";
import {
  consentRequired,
  optionalEmail,
  phoneRequired,
  requiredString,
  withNormalizedPhone,
} from "@/lib/form/schemas";
import { submitLead } from "@/lib/form/submitLead";
import { createRequestId } from "@/lib/form/utils";
import { cn } from "@/lib/cn";
import {
  alertSuccess,
  card,
  formActions,
  formStepActive,
  formStepDone,
  formStepIdle,
  formStepPill,
  formSteps,
  quizChip,
  quizChipActive,
  quizChipIdle,
  quizChips,
  quizHint,
  quizOption,
  quizOptionActive,
  quizOptionIdle,
  quizOptionDesc,
  quizOptionTitle,
  quizOptions,
  quizProgressFill,
  quizProgressLabel,
  quizProgressTrack,
  quizProgressWrap,
  quizQuestion,
} from "@/styles/ui";

const TOTAL_STEPS = 4;

interface PriceFormProps {
  locale: Locale;
  content: SiteCopy;
  initialCategory?: string;
  initialFromQuery?: string;
  initialToQuery?: string;
}

type QuizValues = {
  cargoType: string;
  volumeBand: string;
  services: string[];
  company: string;
  name: string;
  phone: string;
  email: string;
  routes: string;
  comment: string;
  consent: boolean;
  website: string;
};

const stepSchemas = [
  Yup.object({ cargoType: requiredString() }),
  Yup.object({ volumeBand: requiredString() }),
  Yup.object({
    services: Yup.array().of(Yup.string().required()).min(1).required(),
  }),
  Yup.object({
    company: requiredString(),
    name: requiredString(),
    phone: phoneRequired(),
    email: optionalEmail(),
    routes: Yup.string(),
    comment: Yup.string(),
    consent: consentRequired(),
    website: Yup.string(),
  }),
];

function mapCategoryToCargo(category: string) {
  if (category === "documents") return "documents";
  if (category === "parcel" || category === "parcels") return "parcels";
  if (category === "goods") return "goods";
  if (category === "regular" || category === "mixed" || category === "other") {
    return "mixed";
  }
  return "";
}

function QuizOptionButton({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        quizOption,
        selected ? quizOptionActive : quizOptionIdle,
      )}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={quizOptionTitle}>{title}</span>
      {description ? <span className={quizOptionDesc}>{description}</span> : null}
    </button>
  );
}

function QuizSteps({
  step,
  setStep,
  content,
}: {
  step: number;
  setStep: (updater: (s: number) => number) => void;
  content: SiteCopy;
}) {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<QuizValues>();
  const rp = content.requestPrice;
  const c = content.formCommon;

  const selectAndAdvance = async (
    field: "cargoType" | "volumeBand",
    value: string,
  ) => {
    await setFieldValue(field, value, true);
    trackEvent("price_form_step_complete", { step, answer: value });
    setStep((s) => s + 1);
  };

  const toggleService = async (id: string) => {
    const next = values.services.includes(id)
      ? values.services.filter((s) => s !== id)
      : [...values.services, id];
    await setFieldValue("services", next, true);
  };

  return (
    <>
      {step === 0 ? (
        <>
          <h2 className={quizQuestion}>{rp.questionCargo}</h2>
          <div className={quizOptions} role="group" aria-label={rp.questionCargo}>
            {rp.cargoOptions.map((opt) => (
              <QuizOptionButton
                key={opt.id}
                title={opt.title}
                description={opt.description}
                selected={values.cargoType === opt.id}
                onSelect={() => {
                  void selectAndAdvance("cargoType", opt.id);
                }}
              />
            ))}
          </div>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <h2 className={quizQuestion}>{rp.questionVolume}</h2>
          <div className={quizOptions} role="group" aria-label={rp.questionVolume}>
            {rp.volumeOptions.map((opt) => (
              <QuizOptionButton
                key={opt.id}
                title={opt.title}
                description={opt.description}
                selected={values.volumeBand === opt.id}
                onSelect={() => {
                  void selectAndAdvance("volumeBand", opt.id);
                }}
              />
            ))}
          </div>
          <div className={formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              {content.ui.back}
            </Button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h2 className={quizQuestion}>{rp.questionServices}</h2>
          <p className={quizHint}>{rp.questionServicesHint}</p>
          <div className={quizChips} role="group" aria-label={rp.questionServices}>
            {rp.serviceOptions.map((opt) => {
              const active = values.services.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    quizChip,
                    active ? quizChipActive : quizChipIdle,
                  )}
                  aria-pressed={active}
                  onClick={() => {
                    void toggleService(opt.id);
                  }}
                >
                  {opt.title}
                </button>
              );
            })}
          </div>
          {touched.services && errors.services ? (
            <p className="mt-2 m-0 text-sm text-danger">{rp.questionServicesHint}</p>
          ) : null}
          <FormActions
            submitLabel={content.ui.next}
            showBack
            backLabel={content.ui.back}
            onBack={() => setStep((s) => s - 1)}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h2 className={quizQuestion}>{rp.questionContact}</h2>
          <p className={quizHint}>{rp.questionContactLead}</p>
          <FormInputField name="company" label={c.company} required />
          <FormInputField name="name" label={c.name} required />
          <FormRow>
            <FormInputField
              name="phone"
              label={c.phone}
              required
              placeholder="+998 XX XXX XX XX"
            />
            <FormInputField name="email" label={c.email} type="email" />
          </FormRow>
          <FormAreaField name="routes" label={rp.fields.routes} />
          <FormAreaField name="comment" label={rp.fields.comment} />
          <ConsentField label={c.consent} />
          <HoneypotField label={c.honeypot} />
          <FormActions
            submitLabel={content.ui.getQuote}
            showBack
            backLabel={content.ui.back}
            onBack={() => setStep((s) => s - 1)}
          />
        </>
      ) : null}
    </>
  );
}

/** B2B landing quiz — qualifies traffic, then captures company contacts. */
export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialFromQuery = "",
  initialToQuery = "",
}: PriceFormProps) {
  const [step, setStep] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("req"));
  const rp = content.requestPrice;

  const routeNote = useMemo(() => {
    return [initialFromQuery, initialToQuery]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(" → ");
  }, [initialFromQuery, initialToQuery]);

  const progressLabel = rp.progressTemplate
    .replace("{current}", String(step + 1))
    .replace("{total}", String(TOTAL_STEPS));

  if (successId) {
    return (
      <div className={alertSuccess} role="status">
        <strong>
          {rp.successTitle}. ID: {successId}
        </strong>
        <p className="mb-0">{rp.successText}</p>
      </div>
    );
  }

  return (
    <div className={cn(card, "w-full")}>
      <div className={quizProgressWrap}>
        <p className={quizProgressLabel}>{progressLabel}</p>
        <div className={quizProgressTrack} aria-hidden>
          <div
            className={quizProgressFill}
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className={formSteps} aria-hidden>
        {rp.steps.map((label, index) => (
          <div
            key={label}
            className={cn(
              formStepPill,
              index === step
                ? formStepActive
                : index < step
                  ? formStepDone
                  : formStepIdle,
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <Formik<QuizValues>
        initialValues={{
          cargoType: mapCategoryToCargo(initialCategory),
          volumeBand: "",
          services: [],
          company: "",
          name: "",
          phone: "",
          email: "",
          routes: routeNote,
          comment: "",
          consent: false,
          website: "",
        }}
        validationSchema={stepSchemas[step]}
        onSubmit={async (values, helpers) => {
          if (step < TOTAL_STEPS - 1) {
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
              clientType: "company",
              source: "b2b_quiz",
              cargoType: values.cargoType,
              volumeBand: values.volumeBand,
              services: values.services,
              needApi: values.services.includes("api"),
              regularPickup: values.services.includes("pickup"),
              needCod: values.services.includes("cod"),
              doorDelivery: values.services.includes("door"),
              returns: values.services.includes("returns"),
            },
            successTitle: rp.successTitle,
            successText: rp.successText,
            eventPrefix: "price_form",
          });
          if (result) setSuccessId(result.id);
          helpers.setSubmitting(false);
        }}
      >
        <Form noValidate>
          <QuizSteps step={step} setStep={setStep} content={content} />
        </Form>
      </Formik>
    </div>
  );
}
