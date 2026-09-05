"use client";

import { ErrorMessage, Field } from "formik";
import { checkRow, fieldError } from "@/styles/ui";

export function ConsentField({ label }: { label: string }) {
  return (
    <>
      <label className={checkRow}>
        <Field
          type="checkbox"
          name="consent"
          className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 accent-[var(--color-primary)]"
        />
        <span>{label}</span>
      </label>
      <ErrorMessage name="consent" component="div" className={fieldError} />
    </>
  );
}
