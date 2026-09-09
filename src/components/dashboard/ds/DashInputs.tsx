"use client";

import {
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { useField } from "formik";
import { cn } from "@/lib/cn";
import { normalizePhone } from "@/lib/form/utils";
import { DashField, useDashFieldMeta } from "@/components/dashboard/ds/DashField";
import { dashInput, dashInputError, dashSelect } from "@/styles/dashboard";

type FieldWrap = {
  name: string;
  label?: string;
  hint?: string;
  className?: string;
};

function inputClass(invalid: boolean, extra?: string) {
  return cn(invalid ? dashInputError : dashInput, extra);
}

function selectClass(invalid: boolean, extra?: string) {
  return cn(
    dashSelect,
    invalid && "border-primary/40 focus:border-primary",
    extra,
  );
}

export function DashTextInput({
  name,
  label,
  hint,
  className,
  ...props
}: FieldWrap &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className">) {
  const { field, invalid } = useDashFieldMeta(name);
  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <input
        id={name}
        {...field}
        {...props}
        className={inputClass(invalid)}
      />
    </DashField>
  );
}

export function DashTextarea({
  name,
  label,
  hint,
  className,
  rows = 4,
  ...props
}: FieldWrap &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className">) {
  const { field, invalid } = useDashFieldMeta(name);
  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <textarea
        id={name}
        rows={rows}
        {...field}
        {...props}
        className={inputClass(invalid)}
      />
    </DashField>
  );
}

export function DashSelect({
  name,
  label,
  hint,
  className,
  children,
  ...props
}: FieldWrap &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "className"> & {
    children: ReactNode;
  }) {
  const { field, invalid } = useDashFieldMeta(name);
  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <select id={name} {...field} {...props} className={selectClass(invalid)}>
        {children}
      </select>
    </DashField>
  );
}

export function DashCheckbox({
  name,
  label,
  hint,
  className,
}: FieldWrap & { label: string }) {
  const [field] = useField({ name, type: "checkbox" });
  return (
    <DashField name={name} hint={hint} className={className}>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          {...field}
          checked={Boolean(field.checked)}
          className="size-4 rounded border-black/20"
        />
        {label}
      </label>
    </DashField>
  );
}

/** Formats as +998 XX XXX XX XX while typing. */
export function DashPhoneInput({
  name,
  label = "Телефон",
  hint,
  className,
}: FieldWrap) {
  const { field, invalid, meta } = useDashFieldMeta(name);
  const [, , helpers] = useField(name);

  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <input
        id={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+998 __ ___ __ __"
        name={field.name}
        value={field.value ?? ""}
        onBlur={field.onBlur}
        onChange={(e) => {
          const raw = e.target.value;
          const digits = raw.replace(/\D/g, "").slice(0, 12);
          let next = raw;
          if (!digits) next = "";
          else if (digits.startsWith("998") || digits.length <= 9) {
            const d = digits.startsWith("998")
              ? digits
              : `998${digits}`.slice(0, 12);
            next = normalizePhone(`+${d}`);
          }
          void helpers.setValue(next);
        }}
        className={inputClass(invalid || Boolean(meta.error && meta.touched))}
      />
    </DashField>
  );
}

export function DashOtpInput({
  name,
  label = "Код",
  hint,
  className,
  length = 6,
}: FieldWrap & { length?: number }) {
  const { field, invalid } = useDashFieldMeta(name);
  const [, , helpers] = useField(name);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const value = String(field.value ?? "").replace(/\D/g, "").slice(0, length);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  function setCode(next: string) {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    void helpers.setValue(cleaned);
  }

  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <div className="flex gap-2" role="group" aria-label={label}>
        {cells.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Цифра ${i + 1}`}
            value={digit}
            className={cn(
              inputClass(invalid, "h-11 w-10 px-0 text-center text-base font-semibold"),
            )}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              const next = cells.map((c, j) => (j === i ? ch : c)).join("");
              setCode(next);
              if (ch && i < length - 1) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !cells[i] && i > 0) {
                refs.current[i - 1]?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              setCode(pasted);
              const focusAt = Math.min(
                pasted.replace(/\D/g, "").length,
                length - 1,
              );
              refs.current[focusAt]?.focus();
            }}
          />
        ))}
      </div>
      <input type="hidden" name={field.name} value={value} readOnly />
    </DashField>
  );
}

export function DashTrackCodeInput({
  name,
  label = "Трек-номер",
  hint,
  className,
  ...props
}: FieldWrap &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "className" | "type"
  >) {
  const { field, invalid } = useDashFieldMeta(name);
  const [, , helpers] = useField(name);

  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <input
        id={name}
        {...props}
        name={field.name}
        value={field.value ?? ""}
        onBlur={field.onBlur}
        spellCheck={false}
        autoCapitalize="characters"
        placeholder="EPOS-XXXXXX"
        className={inputClass(invalid, "font-mono uppercase tracking-wide")}
        onChange={(e) => {
          const next = e.target.value
            .toUpperCase()
            .replace(/\s+/g, "")
            .replace(/[^A-Z0-9-]/g, "");
          void helpers.setValue(next);
        }}
      />
    </DashField>
  );
}

export function DashCodeInput({
  name,
  label = "Код",
  hint,
  className,
  ...props
}: FieldWrap &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "className" | "type"
  >) {
  const { field, invalid } = useDashFieldMeta(name);
  const [, , helpers] = useField(name);

  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <input
        id={name}
        {...props}
        name={field.name}
        value={field.value ?? ""}
        onBlur={field.onBlur}
        spellCheck={false}
        className={inputClass(invalid, "font-mono")}
        onChange={(e) => {
          const next = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
          void helpers.setValue(next);
        }}
      />
    </DashField>
  );
}

export function DashDateTimeInput({
  name,
  label,
  hint,
  className,
  ...props
}: FieldWrap &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "className" | "type"
  >) {
  const { field, invalid } = useDashFieldMeta(name);
  return (
    <DashField name={name} label={label} hint={hint} className={className}>
      <input
        id={name}
        type="datetime-local"
        {...field}
        {...props}
        className={inputClass(invalid)}
      />
    </DashField>
  );
}
