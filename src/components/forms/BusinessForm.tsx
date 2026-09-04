"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return value.trim();
}

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$/;

export function BusinessForm({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `biz-${Math.random().toString(36).slice(2)}`,
  );

  if (successId) {
    return (
      <div className="alert alert-success">
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
        needApi: false,
        comment: "",
        consent: false,
        website: "",
      }}
      validationSchema={Yup.object({
        company: Yup.string().required(),
        name: Yup.string().required(),
        phone: Yup.string()
          .required()
          .test("phone", "phone", (v) => Boolean(v && phoneRegex.test(normalizePhone(v)))),
        email: Yup.string().email(),
        consent: Yup.boolean().oneOf([true]).required(),
      })}
      onSubmit={async (values) => {
        setError(null);
        trackEvent("business_form_submit_attempt");
        try {
          const res = await fetch("/api/leads/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "business",
              locale,
              pageUrl: window.location.href,
              requestId,
              website: values.website,
              data: {
                ...values,
                phone: normalizePhone(values.phone),
                monthlyVolume: values.monthlyVolume
                  ? Number(values.monthlyVolume)
                  : null,
              },
            }),
          });
          const json = (await res.json()) as { id?: string };
          if (!res.ok || !json.id) throw new Error("fail");
          trackEvent("business_form_submit_success");
          setSuccessId(json.id);
        } catch {
          trackEvent("business_form_submit_error");
          setError(
            locale === "uz"
              ? "Yuborishda xato. Qayta urinib koʻring."
              : "Ошибка отправки. Попробуйте ещё раз.",
          );
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="card form-shell" noValidate>
          {error ? <div className="alert alert-warning">{error}</div> : null}
          <div className="field">
            <label htmlFor="company">{content.formCommon.company}</label>
            <Field id="company" name="company" />
            <ErrorMessage name="company" component="div" className="error" />
          </div>
          <div className="field">
            <label htmlFor="name">{content.formCommon.name}</label>
            <Field id="name" name="name" />
            <ErrorMessage name="name" component="div" className="error" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="phone">{content.formCommon.phone}</label>
              <Field id="phone" name="phone" placeholder="+998 XX XXX XX XX" />
              <ErrorMessage name="phone" component="div" className="error" />
            </div>
            <div className="field">
              <label htmlFor="email">{content.formCommon.email}</label>
              <Field id="email" name="email" type="email" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="monthlyVolume">
                {content.requestPrice.fields.monthlyVolume}
              </label>
              <Field id="monthlyVolume" name="monthlyVolume" type="number" min={1} />
            </div>
            <div className="field">
              <label htmlFor="needApi">{content.requestPrice.fields.needApi}</label>
              <Field as="select" id="needApi" name="needApi">
                <option value="false">{content.requestPrice.fields.no}</option>
                <option value="true">{content.requestPrice.fields.yes}</option>
              </Field>
            </div>
          </div>
          <div className="field">
            <label htmlFor="comment">{content.requestPrice.fields.comment}</label>
            <Field as="textarea" id="comment" name="comment" />
          </div>
          <label className="check-row">
            <Field type="checkbox" name="consent" />
            <span>{content.formCommon.consent}</span>
          </label>
          <ErrorMessage name="consent" component="div" className="error" />
          <div className="field" style={{ position: "absolute", left: "-9999px" }} aria-hidden>
            <Field name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {content.ui.getOffer}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
