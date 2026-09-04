"use client";

import type { ChangeEvent, ReactNode } from "react";
import { Field } from "formik";

type CommonProps = {
  name: string;
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number | string;
  step?: number | string;
  tabIndex?: number;
  autoComplete?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
};

export function FormInput({ id, name, ...props }: CommonProps) {
  return <Field id={id ?? name} name={name} {...props} />;
}

export function FormTextarea({ id, name, ...props }: CommonProps) {
  return <Field as="textarea" id={id ?? name} name={name} {...props} />;
}

export function FormSelect({ id, name, children, ...props }: CommonProps) {
  return (
    <Field as="select" id={id ?? name} name={name} {...props}>
      {children}
    </Field>
  );
}

export function FormCheckbox({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <label className="check-row">
      <Field type="checkbox" name={name} />
      <span>{label}</span>
    </label>
  );
}
