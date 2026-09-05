"use client";

import { Form, Formik } from "formik";
import { useMemo, useState } from "react";
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
import { cn } from "@/lib/cn";
import { alertSuccess, card } from "@/styles/ui";

interface PriceFormProps {
  locale: Locale;
  content: SiteCopy;
  initialCategory?: string;
  initialFromQuery?: string;
  initialToQuery?: string;
}

const schema = Yup.object({
  company: requiredString(),
  inn: Yup.string(),
  name: requiredString(),
  phone: phoneRequired(),
  email: optionalEmail(),
  monthlyVolume: Yup.number().integer().min(1).nullable(),
  needApi: yesNo(),
  regularPickup: yesNo(),
  needCod: yesNo(),
  routes: Yup.string(),
  comment: Yup.string(),
  consent: consentRequired(),
  website: Yup.string(),
});

/** B2B commercial lead — no live estimate; manager confirms terms. */
export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialFromQuery = "",
  initialToQuery = "",
}: PriceFormProps) {
  const [successId, setSuccessId] = useState<string | null>(null);
  const [requestId] = useState(() => createRequestId("req"));
  const rp = content.requestPrice;
  const c = content.formCommon;
  const f = rp.fields;
  const yn = yesNoOptions(f.yes, f.no);

  const routeNote = useMemo(() => {
    return [initialFromQuery, initialToQuery]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(" → ");
  }, [initialFromQuery, initialToQuery]);

  const commentSeed = useMemo(() => {
    if (!initialCategory.trim()) return "";
    return locale === "uz"
      ? `Kategoriya / xizmat: ${initialCategory}`
      : `Категория / услуга: ${initialCategory}`;
  }, [initialCategory, locale]);

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
    <Formik
      initialValues={{
        company: "",
        inn: "",
        name: "",
        phone: "",
        email: "",
        monthlyVolume: "",
        needApi: "false",
        regularPickup: "false",
        needCod: "false",
        routes: routeNote,
        comment: commentSeed,
        consent: false,
        website: "",
      }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await submitLead({
          type: "price",
          locale,
          requestId,
          website: values.website,
          data: {
            ...withNormalizedPhone(values),
            clientType: "company",
            source: "b2b_request_price",
            needApi: values.needApi === "true",
            regularPickup: values.regularPickup === "true",
            needCod: values.needCod === "true",
            monthlyVolume: values.monthlyVolume
              ? Number(values.monthlyVolume)
              : null,
            category: initialCategory || undefined,
          },
          successTitle: rp.successTitle,
          successText: rp.successText,
          eventPrefix: "price_form",
        });
        if (result) setSuccessId(result.id);
        setSubmitting(false);
      }}
    >
      <Form className={cn(card, "grid gap-4")} noValidate>
        <FormInputField name="company" label={c.company} required />
        <FormInputField name="inn" label={c.inn} />
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
        <FormInputField
          name="monthlyVolume"
          label={f.monthlyVolume}
          type="number"
          min={1}
        />
        <FormRow>
          <SelectField
            name="needApi"
            label={f.needApi}
            options={yn}
            includeEmpty={false}
          />
          <SelectField
            name="regularPickup"
            label={f.regularPickup}
            options={yn}
            includeEmpty={false}
          />
        </FormRow>
        <SelectField
          name="needCod"
          label={f.needCod}
          options={yn}
          includeEmpty={false}
        />
        <FormAreaField name="routes" label={f.routes} />
        <FormAreaField name="comment" label={f.comment} />
        <ConsentField label={c.consent} />
        <HoneypotField label={c.honeypot} />
        <FormActions submitLabel={content.ui.getQuote} />
      </Form>
    </Formik>
  );
}
