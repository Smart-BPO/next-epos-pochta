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
} from "@/components/molecules/form/fields";
import {
  consentRequired,
  optionalEmail,
  phoneOrEmail,
  requiredString,
  withNormalizedPhone,
} from "@/lib/form/schemas";
import { submitLead } from "@/lib/form/submitLead";
import { createRequestId } from "@/lib/form/utils";
import { alertSuccess, card, formShell } from "@/styles/ui";
import { cn } from "@/lib/cn";

const schema = Yup.object({
  name: requiredString(),
  phone: phoneOrEmail(),
  email: optionalEmail(),
  topic: requiredString(),
  trackNumber: Yup.string(),
  message: requiredString(),
  consent: consentRequired(),
  website: Yup.string(),
});

export function ContactForm({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("contact"));
  const c = content.formCommon;

  if (successId) {
    return (
      <div className={alertSuccess} role="status">
        <strong>ID: {successId}</strong>
        <p className="mb-0">
          {locale === "uz"
            ? "Xabar qabul qilindi. Tez orada bogʻlanamiz."
            : "Сообщение принято. Мы скоро свяжемся с вами."}
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        name: "",
        phone: "",
        email: "",
        topic: "",
        trackNumber: "",
        message: "",
        consent: false,
        website: "",
      }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await submitLead({
          type: "contact",
          locale,
          requestId,
          website: values.website,
          data: withNormalizedPhone(values),
          successTitle:
            locale === "uz" ? "Xabar qabul qilindi" : "Сообщение принято",
          successText:
            locale === "uz"
              ? "Tez orada bogʻlanamiz."
              : "Мы скоро свяжемся с вами.",
          eventPrefix: "contact_form",
        });
        if (result) setSuccessId(result.id);
        setSubmitting(false);
      }}
    >
      <Form className={cn(card, formShell)} noValidate>
        <FormInputField name="name" label={c.name} required />
        <FormRow>
          <FormInputField
            name="phone"
            label={c.phone}
            placeholder="+998 XX XXX XX XX"
          />
          <FormInputField name="email" label={c.email} type="email" />
        </FormRow>
        <FormInputField name="topic" label={c.topic} required />
        <FormInputField name="trackNumber" label={c.trackNumber} />
        <FormAreaField name="message" label={c.message} required />
        <ConsentField label={c.consent} />
        <HoneypotField label={c.honeypot} />
        <FormActions submitLabel={content.ui.send} />
      </Form>
    </Formik>
  );
}
