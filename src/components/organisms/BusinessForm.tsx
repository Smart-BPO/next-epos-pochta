"use client";

import { Form, Formik } from "formik";
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
import {
  consentRequired,
  optionalEmail,
  phoneRequired,
  requiredString,
  withNormalizedPhone,
  yesNo,
} from "@/lib/form/schemas";
import { submitLead } from "@/lib/form/submitLead";
import { createRequestId, yesNoOptions } from "@/lib/form/utils";

const schema = Yup.object({
  company: requiredString(),
  name: requiredString(),
  phone: phoneRequired(),
  email: optionalEmail(),
  monthlyVolume: Yup.number().integer().min(1).nullable(),
  needApi: yesNo(),
  comment: Yup.string(),
  consent: consentRequired(),
  website: Yup.string(),
});

export function BusinessForm({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("biz"));
  const c = content.formCommon;
  const f = content.requestPrice.fields;

  if (successId) {
    return (
      <div className="alert alert-success" role="status">
        <strong>
          {content.requestPrice.successTitle}. ID: {successId}
        </strong>
        <p style={{ marginBottom: 0 }}>{content.requestPrice.successText}</p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        company: "",
        name: "",
        phone: "",
        email: "",
        monthlyVolume: "",
        needApi: "false",
        comment: "",
        consent: false,
        website: "",
      }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await submitLead({
          type: "business",
          locale,
          requestId,
          website: values.website,
          data: {
            ...withNormalizedPhone(values),
            needApi: values.needApi === "true",
            monthlyVolume: values.monthlyVolume
              ? Number(values.monthlyVolume)
              : null,
          },
          successTitle: content.requestPrice.successTitle,
          successText: content.requestPrice.successText,
          eventPrefix: "business_form",
        });
        if (result) setSuccessId(result.id);
        setSubmitting(false);
      }}
    >
      <Form className="card form-shell" noValidate>
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
        <FormRow>
          <FormInputField
            name="monthlyVolume"
            label={f.monthlyVolume}
            type="number"
            min={1}
          />
          <SelectField
            name="needApi"
            label={f.needApi}
            options={yesNoOptions(f.yes, f.no)}
            includeEmpty={false}
          />
        </FormRow>
        <FormAreaField name="comment" label={f.comment} />
        <ConsentField label={c.consent} />
        <HoneypotField label={c.honeypot} />
        <FormActions submitLabel={content.ui.getOffer} />
      </Form>
    </Formik>
  );
}
