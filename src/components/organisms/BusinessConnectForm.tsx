"use client";

import { Form, Formik, useFormikContext } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
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
  formStepIdle,
  formStepPill,
  formSteps,
} from "@/styles/ui";

const stepSchemas = [
  Yup.object({
    company: requiredString(),
    name: requiredString(),
    phone: phoneRequired(),
    email: optionalEmail(),
  }),
  Yup.object({
    monthlyVolume: Yup.number().integer().min(1).nullable(),
    needApi: yesNoRequired(),
    regularPickup: yesNoRequired(),
    needCod: yesNoRequired(),
  }),
  Yup.object({
    comment: Yup.string(),
    consent: consentRequired(),
    website: Yup.string(),
  }),
];

type ConnectValues = {
  company: string;
  name: string;
  phone: string;
  email: string;
  monthlyVolume: string | number;
  needApi: string;
  regularPickup: string;
  needCod: string;
  comment: string;
  consent: boolean;
  website: string;
};

function ConnectSteps({
  step,
  setStep,
  content,
}: {
  step: number;
  setStep: (updater: (s: number) => number) => void;
  content: SiteCopy;
}) {
  useFormikContext<ConnectValues>();
  const c = content.formCommon;
  const f = content.requestPrice.fields;
  const bf = content.businessConnect.fields;
  const yn = yesNoOptions(f.yes, f.no);

  return (
    <>
      {step === 0 ? (
        <>
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
        </>
      ) : null}

      {step === 1 ? (
        <>
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
          <SelectField
            name="regularPickup"
            label={bf.regularPickup}
            options={yn}
            includeEmpty={false}
          />
          <SelectField
            name="needCod"
            label={bf.needCod}
            options={yn}
            includeEmpty={false}
          />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <FormAreaField name="comment" label={f.comment} />
          <ConsentField label={`${c.consent}`} />
          <HoneypotField label={c.honeypot} />
        </>
      ) : null}

      <FormActions
        submitLabel={
          step < 2 ? content.ui.next : content.ui.startConnect
        }
        showBack={step > 0}
        backLabel={content.ui.back}
        onBack={() => setStep((s) => s - 1)}
      />
    </>
  );
}

export function BusinessConnectForm({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  const [step, setStep] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("biz"));

  if (successId) {
    return (
      <div className={alertSuccess} role="status">
        <strong>
          {content.businessConnect.successTitle}. ID: {successId}
        </strong>
        <p className="mb-0">{content.businessConnect.successText}</p>
      </div>
    );
  }

  return (
    <div className={cn(formShell, card)}>
      <div className={formSteps} aria-hidden>
        {content.businessConnect.steps.map((label, index) => (
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

      <Formik<ConnectValues>
        initialValues={{
          company: "",
          name: "",
          phone: "",
          email: "",
          monthlyVolume: "",
          needApi: "false",
          regularPickup: "false",
          needCod: "false",
          comment: "",
          consent: false,
          website: "",
        }}
        validationSchema={stepSchemas[step]}
        onSubmit={async (values, helpers) => {
          if (step < 2) {
            trackEvent("business_connect_step_complete", { step });
            setStep((s) => s + 1);
            helpers.setTouched({});
            helpers.setSubmitting(false);
            return;
          }

          const result = await submitLead({
            type: "business",
            locale,
            requestId,
            website: values.website,
            data: {
              ...withNormalizedPhone(values),
              needApi: values.needApi === "true",
              regularPickup: values.regularPickup === "true",
              needCod: values.needCod === "true",
              monthlyVolume: values.monthlyVolume
                ? Number(values.monthlyVolume)
                : null,
              source: "business_connect",
            },
            successTitle: content.businessConnect.successTitle,
            successText: content.businessConnect.successText,
            eventPrefix: "business_connect",
          });
          if (result) setSuccessId(result.id);
          helpers.setSubmitting(false);
        }}
      >
        <Form noValidate>
          <ConnectSteps step={step} setStep={setStep} content={content} />
        </Form>
      </Formik>
    </div>
  );
}
