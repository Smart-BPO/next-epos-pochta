"use client";

import { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashCrudPage,
  DashForm,
  DashOtpInput,
  DashPhoneInput,
  DashTextInput,
  DashTextarea,
  valuesToFormData,
} from "@/components/dashboard/ds";
import {
  changePasswordAction,
  confirmEmailAction,
  confirmPhoneAction,
  requestEmailOtpAction,
  requestPhoneOtpAction,
  updateProfileAction,
} from "@/app/dashboard/(app)/profile/actions";
import {
  emailRequired,
  otpSchema,
  passwordMin,
  phoneRequired,
} from "@/lib/dashboard/schemas";
import type { AdminRole } from "@/lib/cms/auth-shared";
import { dashBtnPrimary, dashBtnSecondary, dashCardPad } from "@/styles/dashboard";
import type { DashCopy } from "@/i18n/dashboard";

export type ProfileClientProps = {
  email: string;
  displayName: string;
  role: AdminRole;
  phone: string | null;
  phoneVerifiedAt: string | null;
  bio: string;
  emailVerifiedAt: string | null;
};

function mapErr(err: unknown, t: DashCopy): string {
  const code = err instanceof Error ? err.message : "";
  switch (code) {
    case "wrong_password":
      return t.errors.wrongPassword;
    case "password_mismatch":
    case "password_too_short":
      return code === "password_mismatch"
        ? t.errors.passwordMismatch
        : t.errors.passwordMin.replace("{n}", "8");
    case "email_taken":
      return t.errors.emailTaken;
    case "phone_taken":
      return t.errors.phoneTaken;
    case "email_unchanged":
      return t.errors.emailUnchanged;
    case "invalid_email":
      return t.errors.invalidEmail;
    case "invalid_phone":
      return t.errors.invalidPhone;
    case "display_name_required":
      return t.errors.required;
    default:
      return code || t.errors.generic;
  }
}

function VerifiedBadge({
  ok,
  t,
}: {
  ok: boolean;
  t: DashCopy;
}) {
  return (
    <span
      className={
        ok
          ? "text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700"
          : "text-[0.65rem] font-semibold uppercase tracking-wide text-black/35"
      }
    >
      {ok ? t.profile.verified : t.profile.unverified}
    </span>
  );
}

export function ProfileClient(props: ProfileClientProps) {
  const t = useDashT();
  const router = useRouter();
  const [phoneStep, setPhoneStep] = useState<"edit" | "otp">("edit");
  const [pendingPhone, setPendingPhone] = useState("");
  const [emailStep, setEmailStep] = useState<"edit" | "otp">("edit");
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <DashCrudPage title={t.profile.title} lead={t.profile.lead}>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={dashCardPad}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-sm font-semibold text-ink">
              {t.profile.sectionProfile}
            </h2>
            <DashStatusBadge kind="role" value={props.role} />
          </div>
          <DashForm
            enableReinitialize
            initialValues={{
              display_name: props.displayName,
              bio: props.bio,
            }}
            schema={Yup.object({
              display_name: Yup.string().trim().required(t.errors.required),
              bio: Yup.string().max(1000),
            })}
            successMessage={t.profile.profileSaved}
            errorMessage={t.errors.saveFailed}
            onSubmit={async (values) => {
              try {
                await updateProfileAction(valuesToFormData(values));
                router.refresh();
              } catch (err) {
                throw new Error(mapErr(err, t));
              }
            }}
          >
            {({ isSubmitting }) => (
              <div className="space-y-3">
                <DashTextInput name="display_name" label={t.profile.displayName} />
                <DashTextarea
                  name="bio"
                  label={t.profile.bio}
                  hint={t.profile.bioHint}
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={dashBtnPrimary}
                >
                  {t.profile.saveProfile}
                </button>
              </div>
            )}
          </DashForm>
        </section>

        <section className={dashCardPad}>
          <h2 className="m-0 mb-4 text-sm font-semibold text-ink">
            {t.profile.sectionPassword}
          </h2>
          <DashForm
            initialValues={{
              current_password: "",
              new_password: "",
              confirm_password: "",
            }}
            schema={Yup.object({
              current_password: Yup.string().required(t.errors.required),
              new_password: passwordMin(8, t),
              confirm_password: Yup.string()
                .required(t.errors.required)
                .oneOf(
                  [Yup.ref("new_password")],
                  t.errors.passwordMismatch,
                ),
            })}
            successMessage={t.profile.passwordChanged}
            errorMessage={t.errors.saveFailed}
            onSubmit={async (values, helpers) => {
              try {
                await changePasswordAction(valuesToFormData(values));
                helpers.resetForm();
              } catch (err) {
                throw new Error(mapErr(err, t));
              }
            }}
          >
            {({ isSubmitting }) => (
              <div className="space-y-3">
                <DashTextInput
                  name="current_password"
                  type="password"
                  autoComplete="current-password"
                  label={t.profile.currentPassword}
                />
                <DashTextInput
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  label={t.profile.newPassword}
                />
                <DashTextInput
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  label={t.profile.confirmPassword}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={dashBtnPrimary}
                >
                  {t.profile.changePassword}
                </button>
              </div>
            )}
          </DashForm>
        </section>

        <section className={dashCardPad}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-ink">
              {t.profile.sectionPhone}
            </h2>
            <VerifiedBadge ok={Boolean(props.phoneVerifiedAt)} t={t} />
          </div>
          <p className="m-0 mb-3 text-xs text-black/45">
            {t.profile.currentPhone}:{" "}
            <span className="font-mono text-ink">
              {props.phone || t.profile.none}
            </span>
          </p>
          {phoneStep === "edit" ? (
            <DashForm
              initialValues={{ phone: props.phone ?? "" }}
              schema={Yup.object({ phone: phoneRequired(t) })}
              errorMessage={t.errors.saveFailed}
              onSubmit={async (values) => {
                try {
                  const res = await requestPhoneOtpAction(
                    valuesToFormData(values),
                  );
                  setPendingPhone(res.phone);
                  setPhoneStep("otp");
                  toast.success(t.profile.sendCode);
                } catch (err) {
                  throw new Error(mapErr(err, t));
                }
              }}
            >
              {({ isSubmitting }) => (
                <div className="space-y-3">
                  <DashPhoneInput name="phone" label={t.profile.phone} />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={dashBtnSecondary}
                  >
                    {t.profile.sendCode}
                  </button>
                </div>
              )}
            </DashForm>
          ) : (
            <DashForm
              initialValues={{ phone: pendingPhone, code: "" }}
              schema={Yup.object({
                phone: phoneRequired(t),
                code: otpSchema(6, t),
              })}
              successMessage={t.profile.phoneSaved}
              errorMessage={t.errors.saveFailed}
              onSubmit={async (values) => {
                try {
                  await confirmPhoneAction(valuesToFormData(values));
                  setPhoneStep("edit");
                  setPendingPhone("");
                  router.refresh();
                } catch (err) {
                  throw new Error(mapErr(err, t));
                }
              }}
            >
              {({ isSubmitting }) => (
                <div className="space-y-3">
                  <p className="m-0 font-mono text-sm text-ink">{pendingPhone}</p>
                  <DashOtpInput name="code" label={t.profile.otpCode} />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={dashBtnPrimary}
                    >
                      {t.profile.confirmCode}
                    </button>
                    <button
                      type="button"
                      className={dashBtnSecondary}
                      onClick={() => {
                        setPhoneStep("edit");
                        setPendingPhone("");
                      }}
                    >
                      {t.common.back}
                    </button>
                  </div>
                </div>
              )}
            </DashForm>
          )}
        </section>

        <section className={dashCardPad}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-ink">
              {t.profile.sectionEmail}
            </h2>
            <VerifiedBadge ok={Boolean(props.emailVerifiedAt)} t={t} />
          </div>
          <p className="m-0 mb-3 text-xs text-black/45">
            {t.profile.currentEmail}:{" "}
            <span className="font-mono text-ink">{props.email}</span>
          </p>
          {emailStep === "edit" ? (
            <DashForm
              initialValues={{ email: "" }}
              schema={Yup.object({ email: emailRequired(t) })}
              errorMessage={t.errors.saveFailed}
              onSubmit={async (values) => {
                try {
                  const res = await requestEmailOtpAction(
                    valuesToFormData(values),
                  );
                  setPendingEmail(res.email);
                  setEmailStep("otp");
                  toast.success(t.profile.sendCode);
                } catch (err) {
                  throw new Error(mapErr(err, t));
                }
              }}
            >
              {({ isSubmitting }) => (
                <div className="space-y-3">
                  <DashTextInput
                    name="email"
                    type="email"
                    label={t.profile.email}
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={dashBtnSecondary}
                  >
                    {t.profile.sendCode}
                  </button>
                </div>
              )}
            </DashForm>
          ) : (
            <DashForm
              initialValues={{ email: pendingEmail, code: "" }}
              schema={Yup.object({
                email: emailRequired(t),
                code: otpSchema(6, t),
              })}
              successMessage={t.profile.emailSaved}
              errorMessage={t.errors.saveFailed}
              onSubmit={async (values) => {
                try {
                  await confirmEmailAction(valuesToFormData(values));
                  setEmailStep("edit");
                  setPendingEmail("");
                  router.refresh();
                } catch (err) {
                  throw new Error(mapErr(err, t));
                }
              }}
            >
              {({ isSubmitting }) => (
                <div className="space-y-3">
                  <p className="m-0 font-mono text-sm text-ink">{pendingEmail}</p>
                  <DashOtpInput name="code" label={t.profile.otpCode} />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={dashBtnPrimary}
                    >
                      {t.profile.confirmCode}
                    </button>
                    <button
                      type="button"
                      className={dashBtnSecondary}
                      onClick={() => {
                        setEmailStep("edit");
                        setPendingEmail("");
                      }}
                    >
                      {t.common.back}
                    </button>
                  </div>
                </div>
              )}
            </DashForm>
          )}
        </section>
      </div>
    </DashCrudPage>
  );
}
