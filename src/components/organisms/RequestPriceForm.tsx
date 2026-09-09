"use client";

import { Form, Formik, type FormikHelpers } from "formik";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { toast } from "react-toastify";
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
import {
  clearPriceDraftLocal,
  finalizePriceLead,
  loadPriceDraft,
  readPriceDraftLocal,
  savePriceDraft,
  writePriceDraftLocal,
} from "@/lib/form/submitLead";
import { createRequestId, yesNoOptions } from "@/lib/form/utils";
import { cn } from "@/lib/cn";
import { alertInfo, alertSuccess, card } from "@/styles/ui";

type FormValues = {
  company: string;
  inn: string;
  name: string;
  phone: string;
  email: string;
  monthlyVolume: string;
  needApi: string;
  regularPickup: string;
  needCod: string;
  routes: string;
  comment: string;
  consent: boolean;
  website: string;
};

const TOTAL_STEPS = 4;

const stepSchemas = [
  Yup.object({
    company: requiredString(),
    inn: Yup.string(),
    name: requiredString(),
    phone: phoneRequired(),
    email: optionalEmail(),
  }),
  Yup.object({
    monthlyVolume: Yup.number()
      .transform((value, original) =>
        original === "" || original == null ? null : value,
      )
      .nullable()
      .integer()
      .min(1),
    routes: Yup.string(),
  }),
  Yup.object({
    needApi: yesNo(),
    regularPickup: yesNo(),
    needCod: yesNo(),
    comment: Yup.string(),
  }),
  Yup.object({
    consent: consentRequired(),
    website: Yup.string(),
  }),
];

function toFormValues(
  data: Record<string, unknown>,
  defaults: FormValues,
): FormValues {
  const boolStr = (v: unknown, fallback: string) => {
    if (typeof v === "boolean") return v ? "true" : "false";
    if (v === "true" || v === "false") return v;
    return fallback;
  };
  return {
    company: typeof data.company === "string" ? data.company : defaults.company,
    inn: typeof data.inn === "string" ? data.inn : defaults.inn,
    name: typeof data.name === "string" ? data.name : defaults.name,
    phone: typeof data.phone === "string" ? data.phone : defaults.phone,
    email: typeof data.email === "string" ? data.email : defaults.email,
    monthlyVolume:
      data.monthlyVolume == null || data.monthlyVolume === ""
        ? ""
        : String(data.monthlyVolume),
    needApi: boolStr(data.needApi, defaults.needApi),
    regularPickup: boolStr(data.regularPickup, defaults.regularPickup),
    needCod: boolStr(data.needCod, defaults.needCod),
    routes: typeof data.routes === "string" ? data.routes : defaults.routes,
    comment:
      typeof data.comment === "string" ? data.comment : defaults.comment,
    consent: data.consent === true,
    website: "",
  };
}

function payloadFromValues(
  values: FormValues,
  initialCategory: string,
  opts?: { includeConsent?: boolean },
): Record<string, unknown> {
  const phone = withNormalizedPhone({ phone: values.phone }).phone;
  const base: Record<string, unknown> = {
    company: values.company,
    inn: values.inn,
    name: values.name,
    phone,
    email: values.email,
    routes: values.routes,
    comment: values.comment,
    clientType: "company",
    source: "b2b_request_price",
    needApi: values.needApi === "true",
    regularPickup: values.regularPickup === "true",
    needCod: values.needCod === "true",
    monthlyVolume: values.monthlyVolume ? Number(values.monthlyVolume) : null,
    category: initialCategory || undefined,
  };
  if (opts?.includeConsent) {
    base.consent = values.consent === true;
  }
  return base;
}

interface PriceFormProps {
  locale: Locale;
  content: SiteCopy;
  initialCategory?: string;
  initialFromQuery?: string;
  initialToQuery?: string;
  resumeUid?: string;
}

/** B2B commercial lead — multi-step draft in CRM, manager confirms terms. */
export function RequestPriceForm({
  locale,
  content,
  initialCategory = "",
  initialFromQuery = "",
  initialToQuery = "",
  resumeUid = "",
}: PriceFormProps) {
  const router = useRouter();
  const pathname = usePathname() || "/request-price/";
  const searchParams = useSearchParams();
  const rp = content.requestPrice;
  const c = content.formCommon;
  const f = rp.fields;
  const yn = yesNoOptions(f.yes, f.no);

  const [successId, setSuccessId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [uid, setUid] = useState<string>("");
  const [leadId, setLeadId] = useState<string>("");
  const [requestId] = useState(() => {
    const local = readPriceDraftLocal();
    return local?.requestId || createRequestId("req");
  });
  const [hydrated, setHydrated] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);

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

  const defaults = useMemo<FormValues>(
    () => ({
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
    }),
    [routeNote, commentSeed],
  );

  const syncUrlUid = useCallback(
    (nextUid: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("uid", nextUid);
      // Keep category/from/to if present
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const persistLocal = useCallback(
    (next: { uid: string; leadId: string; step: number }) => {
      writePriceDraftLocal({
        uid: next.uid,
        leadId: next.leadId,
        step: next.step,
        locale,
        requestId,
      });
    },
    [locale, requestId],
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const fromQuery = resumeUid.trim();
      const local = readPriceDraftLocal();
      const token = fromQuery || local?.uid || "";

      if (!token) {
        if (!cancelled) {
          setInitialValues(defaults);
          setHydrated(true);
        }
        return;
      }

      const draft = await loadPriceDraft(token);
      if (cancelled) return;

      if (!draft) {
        clearPriceDraftLocal();
        setResumeError(rp.resumeMissing);
        setInitialValues(defaults);
        setHydrated(true);
        return;
      }

      if (draft.complete || draft.status !== "draft") {
        clearPriceDraftLocal();
        setResumeError(rp.resumeComplete);
        if (draft.status !== "draft" && draft.id) {
          setSuccessId(draft.id);
        }
        setInitialValues(defaults);
        setHydrated(true);
        return;
      }

      setUid(draft.uid);
      setLeadId(draft.id);
      setStep(Math.min(TOTAL_STEPS, Math.max(1, draft.step || 1)));
      setInitialValues(toFormValues(draft.data, defaults));
      persistLocal({
        uid: draft.uid,
        leadId: draft.id,
        step: draft.step || 1,
      });
      if (!fromQuery) syncUrlUid(draft.uid);
      setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount / uid
  }, [resumeUid]);

  const stepLabels = [
    rp.steps.contact,
    rp.steps.volume,
    rp.steps.needs,
    rp.steps.confirm,
  ];

  const copyResumeLink = async () => {
    if (!uid || typeof window === "undefined") return;
    const url = `${window.location.origin}${pathname}?uid=${encodeURIComponent(uid)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(rp.linkCopied);
    } catch {
      toast.info(url);
    }
  };

  const onStepSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    const schema = stepSchemas[step - 1];
    try {
      await schema.validate(values, { abortEarly: false });
    } catch {
      helpers.setSubmitting(false);
      return;
    }

    if (step < TOTAL_STEPS) {
      const nextStep = step + 1;
      const saved = await savePriceDraft({
        locale,
        requestId,
        uid: uid || undefined,
        step: nextStep,
        website: values.website,
        data: payloadFromValues(values, initialCategory),
      });
      helpers.setSubmitting(false);
      if (!saved?.uid || !saved.id) return;

      setUid(saved.uid);
      setLeadId(saved.id);
      setStep(nextStep);
      persistLocal({ uid: saved.uid, leadId: saved.id, step: nextStep });
      syncUrlUid(saved.uid);
      if (step === 1) toast.success(rp.draftSaved);
      return;
    }

    const result = await finalizePriceLead({
      locale,
      requestId,
      uid: uid || undefined,
      website: values.website,
      data: payloadFromValues(values, initialCategory, {
        includeConsent: true,
      }),
      successTitle: rp.successTitle,
      successText: rp.successText,
    });
    helpers.setSubmitting(false);
    if (!result) return;
    clearPriceDraftLocal();
    setSuccessId(result.id);
  };

  if (!hydrated || !initialValues) {
    return (
      <div className={cn(card, "grid min-h-[12rem] place-items-center text-sm text-black/45")}>
        …
      </div>
    );
  }

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
    <div className="grid gap-4">
      {resumeError ? (
        <div className={`${alertInfo} rounded-2xl`} role="status">
          {resumeError}
        </div>
      ) : null}
      {uid ? (
        <div className={`${alertInfo} rounded-2xl`} role="status">
          <p className="m-0 mb-2 text-sm">{rp.resumeHint}</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-white/70 px-2 py-1 text-xs text-ink">
              {leadId || "—"}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void copyResumeLink()}
            >
              {rp.copyLink}
            </Button>
          </div>
        </div>
      ) : null}

      <nav aria-label="steps" className="grid gap-2 sm:grid-cols-4">
        {stepLabels.map((label, index) => {
          const n = index + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div
              key={label}
              className={cn(
                "rounded-xl border px-3 py-2 text-left",
                active
                  ? "border-primary/30 bg-primary-soft text-primary"
                  : done
                    ? "border-black/10 bg-white text-ink"
                    : "border-black/8 bg-white/60 text-black/40",
              )}
            >
              <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide opacity-70">
                {rp.stepOf
                  .replace("{step}", String(n))
                  .replace("{total}", String(TOTAL_STEPS))}
              </p>
              <p className="m-0 mt-0.5 text-sm font-semibold leading-snug">
                {label}
              </p>
            </div>
          );
        })}
      </nav>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={stepSchemas[step - 1]}
        onSubmit={onStepSubmit}
      >
        {({ values }) => (
          <Form className={cn(card, "grid gap-4")} noValidate>
            {step === 1 ? (
              <>
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
              </>
            ) : null}

            {step === 2 ? (
              <>
                <FormInputField
                  name="monthlyVolume"
                  label={f.monthlyVolume}
                  type="number"
                  min={1}
                />
                <FormAreaField name="routes" label={f.routes} />
              </>
            ) : null}

            {step === 3 ? (
              <>
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
                <FormAreaField name="comment" label={f.comment} />
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="rounded-2xl border border-black/8 bg-[#f7f8fa] p-4">
                  <h3 className="m-0 text-sm font-semibold text-ink">
                    {rp.reviewTitle}
                  </h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {(
                      [
                        [c.company, values.company],
                        [c.name, values.name],
                        [c.phone, values.phone],
                        [c.email, values.email],
                        [f.monthlyVolume, values.monthlyVolume],
                        [f.routes, values.routes],
                        [f.needApi, values.needApi === "true" ? f.yes : f.no],
                        [
                          f.regularPickup,
                          values.regularPickup === "true" ? f.yes : f.no,
                        ],
                        [f.needCod, values.needCod === "true" ? f.yes : f.no],
                        [f.comment, values.comment],
                      ] as const
                    )
                      .filter(([, v]) => Boolean(String(v || "").trim()))
                      .map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-black/35">
                            {label}
                          </dt>
                          <dd className="m-0 mt-0.5 whitespace-pre-wrap text-ink">
                            {value}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
                <ConsentField label={c.consent} />
                <HoneypotField label={c.honeypot} />
              </>
            ) : null}

            <FormActions
              submitLabel={
                step === TOTAL_STEPS ? content.ui.getQuote : rp.next
              }
              showBack={step > 1}
              backLabel={rp.back}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}
