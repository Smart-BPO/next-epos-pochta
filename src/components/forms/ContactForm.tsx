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

export function ContactForm({
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
      : `contact-${Math.random().toString(36).slice(2)}`,
  );

  if (successId) {
    return (
      <div className="alert alert-success">
        <strong>ID: {successId}</strong>
        <p style={{ marginBottom: 0 }}>
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
      validationSchema={Yup.object({
        name: Yup.string().required(),
        phone: Yup.string().test(
          "contact",
          "required",
          (v, ctx) => Boolean(v && phoneRegex.test(normalizePhone(v))) || Boolean(ctx.parent.email),
        ),
        email: Yup.string().email(),
        topic: Yup.string().required(),
        message: Yup.string().required(),
        consent: Yup.boolean().oneOf([true]).required(),
      })}
      onSubmit={async (values) => {
        setError(null);
        trackEvent("contact_form_submit_attempt");
        try {
          const res = await fetch("/api/leads/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "contact",
              locale,
              pageUrl: window.location.href,
              requestId,
              website: values.website,
              data: { ...values, phone: values.phone ? normalizePhone(values.phone) : "" },
            }),
          });
          const json = (await res.json()) as { id?: string };
          if (!res.ok || !json.id) throw new Error("fail");
          trackEvent("contact_form_submit_success");
          setSuccessId(json.id);
        } catch {
          trackEvent("contact_form_submit_error");
          setError(
            locale === "uz"
              ? "Yuborishda xato. Qayta urinib koʻring."
              : "Ошибка отправки. Попробуйте ещё раз.",
          );
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="card" noValidate>
          {error ? <div className="alert alert-warning">{error}</div> : null}
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
          <div className="field">
            <label htmlFor="topic">{content.formCommon.topic}</label>
            <Field id="topic" name="topic" />
            <ErrorMessage name="topic" component="div" className="error" />
          </div>
          <div className="field">
            <label htmlFor="trackNumber">{content.formCommon.trackNumber}</label>
            <Field id="trackNumber" name="trackNumber" />
          </div>
          <div className="field">
            <label htmlFor="message">{content.formCommon.message}</label>
            <Field as="textarea" id="message" name="message" />
            <ErrorMessage name="message" component="div" className="error" />
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
              {content.ui.send}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
