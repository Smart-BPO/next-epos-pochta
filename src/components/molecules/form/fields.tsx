"use client";

import type { ChangeEvent } from "react";
import { useFormikContext } from "formik";
import { FormField, FormRow } from "@/components/atoms/form/FormField";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/atoms/form/FormControls";
import { ConsentField, ConsentLabel } from "@/components/atoms/form/ConsentField";
import { HoneypotField } from "@/components/atoms/form/HoneypotField";
import { FormActions } from "@/components/atoms/form/FormActions";

export { FormField, FormRow, ConsentField, ConsentLabel, HoneypotField, FormActions };

type Option = { value: string; label: string };

export function SelectField(props: {
  name: string;
  label: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
  clearFieldsOnChange?: string[];
  includeEmpty?: boolean;
  disabled?: boolean;
}) {
  const {
    name,
    label,
    required,
    options,
    placeholder = "—",
    clearFieldsOnChange = [],
    includeEmpty = true,
    disabled,
  } = props;
  const { setFieldValue } = useFormikContext();

  return (
    <FormField name={name} label={label} required={required}>
      <FormSelect
        name={name}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          void setFieldValue(name, e.target.value);
          for (const field of clearFieldsOnChange) {
            void setFieldValue(field, "");
          }
        }}
      >
        {includeEmpty ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
}

export function FormInputField(props: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number | string;
  step?: number | string;
}) {
  const {
    name,
    label,
    required,
    type = "text",
    placeholder,
    disabled,
    min,
    step,
  } = props;

  return (
    <FormField name={name} label={label} required={required}>
      <FormInput
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
      />
    </FormField>
  );
}

export function FormAreaField(props: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const { name, label, required } = props;
  return (
    <FormField name={name} label={label} required={required}>
      <FormTextarea name={name} />
    </FormField>
  );
}
