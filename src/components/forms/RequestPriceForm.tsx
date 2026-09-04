"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities, uzbekistanRegions } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";

interface PriceFormProps {
  locale: Locale;
  content: SiteCopy;
  initialCategory?: string;
  initialPickup?: boolean;
}

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$/;

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return value.trim();
}

function readUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(key);
    if (v) utm[key] = v;
  }
  return utm;
}

export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialPickup = false,
}: PriceFormProps) {
  const [step, setStep] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req-${Math.random().toString(36).slice(2)}`,
  );

  const f = content.requestPrice.fields;
  const common = content.formCommon;

  const regionOptions = uzbekistanRegions.map((r) => ({
    id: r.id,
    label: locale === "uz" ? r.uz : r.ru,
  }));

  const validationSchemas = [
    Yup.object({
      fromRegion: Yup.string().required(),
      fromCity: Yup.string().required(),
      toRegion: Yup.string().required(),
      toCity: Yup.string().required(),
      pickup: Yup.string().oneOf(["true", "false"]).required(),
      doorDelivery: Yup.string().oneOf(["true", "false"]).required(),
    }),
    Yup.object({
      category: Yup.string().required(),
      description: Yup.string().required().min(2),
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
      urgent: Yup.string().oneOf(["true", "false"]),
      cod: Yup.string().oneOf(["true", "false"]),
      declaredValue: Yup.number().when("cod", {
        is: "true",
        then: (s) => s.positive().required(),
        otherwise: (s) => s.notRequired(),
      }),
      preferredDate: Yup.string(),
    }),
    Yup.object({
      clientType: Yup.string().oneOf(["person", "company"]).required(),
      name: Yup.string().required(),
      phone: Yup.string()
        .required()
        .test("phone", "phone", (v) => Boolean(v && phoneRegex.test(normalizePhone(v)))),
      email: Yup.string().email(),
      contactMethod: Yup.string().oneOf(["call", "telegram", "email"]).required(),
      company: Yup.string().when("clientType", {
        is: "company",
        then: (s) => s.required(),
        otherwise: (s) => s.notRequired(),
      }),
      inn: Yup.string(),
      monthlyVolume: Yup.number().integer().min(1),
      needApi: Yup.string().oneOf(["true", "false"]),
      comment: Yup.string(),
      consent: Yup.boolean().oneOf([true]).required(),
      website: Yup.string(),
    }),
  ];

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
    <div className="form-shell card">
      <div className="form-steps" aria-hidden>
        {content.requestPrice.steps.map((label, index) => (
          <div
            key={label}
            className={`form-step-pill ${
              index === step ? "is-active" : index < step ? "is-done" : ""
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {submitError ? (
        <div className="alert alert-warning" role="alert">
          {submitError}
        </div>
      ) : null}

      <Formik
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
        validationSchema={validationSchemas[step]}
        onSubmit={async (values, helpers) => {
          if (step < 2) {
            trackEvent("price_form_step_complete", { step });
            setStep((s) => s + 1);
            helpers.setTouched({});
            helpers.setSubmitting(false);
            return;
          }

          setSubmitError(null);
          trackEvent("price_form_submit_attempt");
          try {
            const res = await fetch("/api/leads/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "price",
                locale,
                pageUrl: typeof window !== "undefined" ? window.location.href : "",
                utm: readUtm(),
                requestId,
                website: values.website,
                data: {
                  ...values,
                  pickup: values.pickup === "true",
                  doorDelivery: values.doorDelivery === "true",
                  urgent: values.urgent === "true",
                  cod: values.cod === "true",
                  needApi: values.needApi === "true",
                  phone: normalizePhone(values.phone),
                  weight: values.unknownDims ? null : Number(values.weight),
                  places: Number(values.places),
                  declaredValue:
                    values.cod === "true" ? Number(values.declaredValue) : null,
                  monthlyVolume: values.monthlyVolume
                    ? Number(values.monthlyVolume)
                    : null,
                },
              }),
            });
            const json = (await res.json()) as { id?: string; error?: string };
            if (!res.ok || !json.id) {
              throw new Error(json.error || "submit_failed");
            }
            trackEvent("price_form_submit_success");
            setSuccessId(json.id);
          } catch {
            trackEvent("price_form_submit_error");
            setSubmitError(
              locale === "uz"
                ? "Yuborishda xato. Maʼlumotlar saqlangan — qayta urinib koʻring."
                : "Ошибка отправки. Данные сохранены — попробуйте ещё раз.",
            );
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => {
          const citiesFor = (regionId: string) =>
            uzbekistanCities
              .filter((c) => c.regionId === regionId)
              .map((c) => ({
                id: c.id,
                label: locale === "uz" ? c.uz : c.ru,
              }));

          return (
            <Form noValidate>
              {step === 0 ? (
                <>
                  <div className="field">
                    <label htmlFor="fromRegion">
                      {f.fromRegion} ({content.ui.required})
                    </label>
                    <Field
                      as="select"
                      id="fromRegion"
                      name="fromRegion"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setFieldValue("fromRegion", e.target.value);
                        setFieldValue("fromCity", "");
                      }}
                    >
                      <option value="">—</option>
                      {regionOptions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="fromRegion" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="fromCity">
                      {f.fromCity} ({content.ui.required})
                    </label>
                    <Field as="select" id="fromCity" name="fromCity">
                      <option value="">—</option>
                      {citiesFor(values.fromRegion).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="fromCity" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="toRegion">
                      {f.toRegion} ({content.ui.required})
                    </label>
                    <Field
                      as="select"
                      id="toRegion"
                      name="toRegion"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setFieldValue("toRegion", e.target.value);
                        setFieldValue("toCity", "");
                      }}
                    >
                      <option value="">—</option>
                      {regionOptions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="toRegion" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="toCity">
                      {f.toCity} ({content.ui.required})
                    </label>
                    <Field as="select" id="toCity" name="toCity">
                      <option value="">—</option>
                      {citiesFor(values.toRegion).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="toCity" component="div" className="error" />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="pickup">{f.pickup}</label>
                      <Field as="select" id="pickup" name="pickup">
                        <option value="true">{f.yes}</option>
                        <option value="false">{f.no}</option>
                      </Field>
                    </div>
                    <div className="field">
                      <label htmlFor="doorDelivery">{f.doorDelivery}</label>
                      <Field as="select" id="doorDelivery" name="doorDelivery">
                        <option value="true">{f.yes}</option>
                        <option value="false">{f.no}</option>
                      </Field>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <div className="field">
                    <label htmlFor="category">
                      {f.category} ({content.ui.required})
                    </label>
                    <Field as="select" id="category" name="category">
                      <option value="">—</option>
                      <option value="documents">{f.catDocuments}</option>
                      <option value="parcel">{f.catParcel}</option>
                      <option value="goods">{f.catGoods}</option>
                      <option value="other">{f.catOther}</option>
                    </Field>
                    <ErrorMessage name="category" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="description">
                      {f.description} ({content.ui.required})
                    </label>
                    <Field as="textarea" id="description" name="description" />
                    <ErrorMessage name="description" component="div" className="error" />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="places">
                        {f.places} ({content.ui.required})
                      </label>
                      <Field id="places" name="places" type="number" min={1} step={1} />
                      <ErrorMessage name="places" component="div" className="error" />
                    </div>
                    <div className="field">
                      <label htmlFor="weight">{f.weight}</label>
                      <Field
                        id="weight"
                        name="weight"
                        type="number"
                        min={0.1}
                        step="0.1"
                        disabled={values.unknownDims}
                      />
                      <ErrorMessage name="weight" component="div" className="error" />
                    </div>
                  </div>
                  <label className="check-row">
                    <Field type="checkbox" name="unknownDims" />
                    <span>{f.unknownDims}</span>
                  </label>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="length">{f.length}</label>
                      <Field id="length" name="length" type="number" min={1} disabled={values.unknownDims} />
                    </div>
                    <div className="field">
                      <label htmlFor="width">{f.width}</label>
                      <Field id="width" name="width" type="number" min={1} disabled={values.unknownDims} />
                    </div>
                    <div className="field">
                      <label htmlFor="height">{f.height}</label>
                      <Field id="height" name="height" type="number" min={1} disabled={values.unknownDims} />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="urgent">{f.urgent}</label>
                      <Field as="select" id="urgent" name="urgent">
                        <option value="false">{f.no}</option>
                        <option value="true">{f.yes}</option>
                      </Field>
                    </div>
                    <div className="field">
                      <label htmlFor="cod">{f.cod}</label>
                      <Field as="select" id="cod" name="cod">
                        <option value="false">{f.no}</option>
                        <option value="true">{f.yes}</option>
                      </Field>
                    </div>
                  </div>
                  {values.cod === "true" ? (
                    <div className="field">
                      <label htmlFor="declaredValue">{f.declaredValue}</label>
                      <Field id="declaredValue" name="declaredValue" type="number" min={1} />
                      <ErrorMessage name="declaredValue" component="div" className="error" />
                    </div>
                  ) : null}
                  <div className="field">
                    <label htmlFor="preferredDate">{f.preferredDate}</label>
                    <Field id="preferredDate" name="preferredDate" type="date" />
                    <span className="hint">
                      {/* TODO(cms): available dates from agreed calendar */}
                    </span>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="field">
                    <label htmlFor="clientType">{f.clientType}</label>
                    <Field as="select" id="clientType" name="clientType">
                      <option value="person">{common.clientTypePerson}</option>
                      <option value="company">{common.clientTypeCompany}</option>
                    </Field>
                  </div>
                  <div className="field">
                    <label htmlFor="name">
                      {common.name} ({content.ui.required})
                    </label>
                    <Field id="name" name="name" />
                    <ErrorMessage name="name" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">
                      {common.phone} ({content.ui.required})
                    </label>
                    <Field id="phone" name="phone" placeholder="+998 XX XXX XX XX" />
                    <ErrorMessage name="phone" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="email">{common.email}</label>
                    <Field id="email" name="email" type="email" />
                    <ErrorMessage name="email" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label htmlFor="contactMethod">{f.contactMethod}</label>
                    <Field as="select" id="contactMethod" name="contactMethod">
                      <option value="call">{common.preferCall}</option>
                      <option value="telegram">{common.preferTelegram}</option>
                      <option value="email">{common.preferEmail}</option>
                    </Field>
                  </div>
                  {values.clientType === "company" ? (
                    <>
                      <div className="field">
                        <label htmlFor="company">
                          {common.company} ({content.ui.required})
                        </label>
                        <Field id="company" name="company" />
                        <ErrorMessage name="company" component="div" className="error" />
                      </div>
                      <div className="field">
                        <label htmlFor="inn">{common.inn}</label>
                        <Field id="inn" name="inn" />
                      </div>
                      <div className="field">
                        <label htmlFor="monthlyVolume">{f.monthlyVolume}</label>
                        <Field id="monthlyVolume" name="monthlyVolume" type="number" min={1} />
                      </div>
                      <div className="field">
                        <label htmlFor="needApi">{f.needApi}</label>
                        <Field as="select" id="needApi" name="needApi">
                          <option value="false">{f.no}</option>
                          <option value="true">{f.yes}</option>
                        </Field>
                      </div>
                    </>
                  ) : null}
                  <div className="field">
                    <label htmlFor="comment">{f.comment}</label>
                    <Field as="textarea" id="comment" name="comment" />
                  </div>
                  <label className="check-row">
                    <Field type="checkbox" name="consent" />
                    <span>
                      {common.consent} ({content.ui.required})
                    </span>
                  </label>
                  <ErrorMessage name="consent" component="div" className="error" />
                  <div className="field" aria-hidden style={{ position: "absolute", left: "-9999px" }}>
                    <label htmlFor="website">{common.honeypot}</label>
                    <Field id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                </>
              ) : null}

              <div className="form-actions">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    {content.ui.back}
                  </Button>
                ) : null}
                <Button type="submit" disabled={isSubmitting}>
                  {step < 2 ? content.ui.next : content.ui.getQuote}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
