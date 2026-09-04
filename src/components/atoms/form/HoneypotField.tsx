"use client";

import { Field } from "formik";
import { field, fieldControl, fieldLabel } from "@/styles/ui";

export function HoneypotField({ label }: { label: string }) {
  return (
    <div className={`${field} absolute -left-[9999px]`} aria-hidden>
      <label htmlFor="website" className={fieldLabel}>
        {label}
      </label>
      <Field
        id="website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className={fieldControl}
      />
    </div>
  );
}
