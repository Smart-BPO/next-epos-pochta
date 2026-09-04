"use client";

import { ErrorMessage, Field } from "formik";

export function ConsentField({ label }: { label: string }) {
  return (
    <>
      <label className="check-row">
        <Field type="checkbox" name="consent" />
        <span>{label}</span>
      </label>
      <ErrorMessage name="consent" component="div" className="error" />
    </>
  );
}
