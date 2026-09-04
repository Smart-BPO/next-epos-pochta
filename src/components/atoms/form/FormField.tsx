"use client";

import { ErrorMessage } from "formik";

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
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
      <ErrorMessage name={name} component="div" className="error" />
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="field-row">{children}</div>;
}
