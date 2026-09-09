import * as Yup from "yup";
import { isValidUzPhone } from "@/lib/form/utils";
import { requiredString } from "@/lib/form/schemas";
import type { DashCopy } from "@/i18n/dashboard";
import { dashFormat, getDashCopy, defaultDashLocale } from "@/i18n/dashboard";

export { requiredString };

type Msg = Pick<DashCopy, "errors">;

function msgs(copy?: Msg): DashCopy["errors"] {
  return copy?.errors ?? getDashCopy(defaultDashLocale).errors;
}

export const phoneRequired = (copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .required(e.required)
    .test("uz-phone", e.invalidPhone, (v) => isValidUzPhone(v));
};

export const otpSchema = (length = 6, copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .required(e.otpRequired)
    .matches(new RegExp(`^\\d{${length}}$`), e.otpRequired);
};

export const trackCodeSchema = (copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
    )
    .required(e.trackRequired)
    .min(6, e.trackInvalid)
    .matches(/^[A-Z0-9-]+$/, e.trackInvalid);
};

export const trackCodeOptionalSchema = (copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
    )
    .test("track-optional", e.trackInvalid, (v) => {
      if (!v) return true;
      return /^[A-Z0-9-]+$/.test(v) && v.length >= 6;
    });
};

export const slugCodeSchema = (copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, ""),
    )
    .required(e.codeRequired)
    .min(2, e.codeRequired)
    .max(64, e.codeRequired)
    .matches(/^[a-z0-9][a-z0-9_-]*$/, e.codeRequired);
};

export const emailRequired = (copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string().trim().email(e.invalidEmail).required(e.required);
};

export const passwordMin = (min = 8, copy?: Msg) => {
  const e = msgs(copy);
  return Yup.string()
    .required(e.required)
    .min(min, dashFormat(e.passwordMin, { n: min }));
};
