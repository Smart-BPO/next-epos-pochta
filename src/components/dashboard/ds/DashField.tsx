"use client";

import { ErrorMessage, useField } from "formik";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  dashFieldError,
  dashHint,
  dashLabel,
} from "@/styles/dashboard";

export function DashField({
  name,
  label,
  hint,
  children,
  className,
}: {
  name: string;
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? (
        <label htmlFor={name} className={dashLabel}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className={dashHint}>{hint}</p> : null}
      <ErrorMessage name={name}>
        {(msg) => <p className={dashFieldError}>{msg}</p>}
      </ErrorMessage>
    </div>
  );
}

export function useDashFieldMeta(name: string) {
  const [field, meta] = useField(name);
  const invalid = Boolean(meta.touched && meta.error);
  return { field, meta, invalid };
}
