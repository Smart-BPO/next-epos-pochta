import * as Yup from "yup";
import { isValidUzPhone, normalizePhone } from "./utils";

export const requiredString = () => Yup.string().trim().required();

export const optionalEmail = () => Yup.string().trim().email();

export const phoneRequired = () =>
  Yup.string()
    .required()
    .test("uz-phone", "invalid_phone", (v) => isValidUzPhone(v));

export const phoneOrEmail = () =>
  Yup.string().test(
    "phone-or-email",
    "phone_or_email",
    (v, ctx) => isValidUzPhone(v) || Boolean(ctx.parent.email),
  );

export const consentRequired = () =>
  Yup.boolean().oneOf([true]).required();

export const yesNo = () => Yup.string().oneOf(["true", "false"]);

export const yesNoRequired = () => yesNo().required();

export function withNormalizedPhone<T extends { phone?: string }>(data: T) {
  return {
    ...data,
    phone: data.phone ? normalizePhone(data.phone) : "",
  };
}
