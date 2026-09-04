"use client";

import { ErrorMessage } from "formik";
import {
  field,
  fieldError,
  fieldHint,
  fieldLabel,
  fieldRow,
} from "@/styles/ui";

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({
  name,
  label,
  required,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className={field}>
      <label htmlFor={name} className={fieldLabel}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {hint ? <span className={fieldHint}>{hint}</span> : null}
      <ErrorMessage name={name} component="div" className={fieldError} />
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className={fieldRow}>{children}</div>;
}
