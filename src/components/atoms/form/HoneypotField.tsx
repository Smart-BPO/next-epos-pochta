"use client";

import { Field } from "formik";

export function HoneypotField({ label }: { label: string }) {
  return (
    <div
      className="field"
      aria-hidden
      style={{ position: "absolute", left: "-9999px" }}
    >
      <label htmlFor="website">{label}</label>
      <Field id="website" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
