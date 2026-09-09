import * as Yup from "yup";
import { isValidUzPhone } from "@/lib/form/utils";
import { requiredString } from "@/lib/form/schemas";

export { requiredString };

export const phoneRequired = () =>
  Yup.string()
    .required("Телефон обязателен")
    .test("uz-phone", "Формат +998 XX XXX XX XX", (v) => isValidUzPhone(v));

export const otpSchema = (length = 6) =>
  Yup.string()
    .required("Код обязателен")
    .matches(new RegExp(`^\\d{${length}}$`), `Код из ${length} цифр`);

export const trackCodeSchema = () =>
  Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
    )
    .required("Трек-номер обязателен")
    .min(6, "Минимум 6 символов")
    .matches(/^[A-Z0-9-]+$/, "Только латиница, цифры и дефис");

export const trackCodeOptionalSchema = () =>
  Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
    )
    .test(
      "track-optional",
      "Только латиница, цифры и дефис (мин. 6)",
      (v) => !v || (/^[A-Z0-9-]+$/.test(v) && v.length >= 6),
    );

export const slugCodeSchema = () =>
  Yup.string()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, ""),
    )
    .required("Код обязателен")
    .min(2, "Минимум 2 символа")
    .max(64, "Максимум 64")
    .matches(/^[a-z0-9][a-z0-9_-]*$/, "Латиница, цифры, _ и -");

export const emailRequired = () =>
  Yup.string().trim().email("Некорректный email").required("Email обязателен");

export const passwordMin = (min = 8) =>
  Yup.string()
    .required("Пароль обязателен")
    .min(min, `Минимум ${min} символов`);
