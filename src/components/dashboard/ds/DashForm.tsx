"use client";

import {
  Form,
  Formik,
  type FormikHelpers,
  type FormikValues,
} from "formik";
import type { ReactNode } from "react";
import type { AnyObjectSchema } from "yup";
import { toast } from "react-toastify";
import { cn } from "@/lib/cn";

export type DashFormProps<T extends FormikValues> = {
  initialValues: T;
  schema?: AnyObjectSchema;
  onSubmit: (values: T, helpers: FormikHelpers<T>) => void | Promise<void>;
  children: ReactNode | ((ctx: { isSubmitting: boolean }) => ReactNode);
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  id?: string;
  enableReinitialize?: boolean;
};

export function DashForm<T extends FormikValues>({
  initialValues,
  schema,
  onSubmit,
  children,
  className,
  successMessage,
  errorMessage = "Не удалось сохранить",
  id,
  enableReinitialize,
}: DashFormProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      enableReinitialize={enableReinitialize}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(values, helpers);
          if (successMessage) toast.success(successMessage);
        } catch (err) {
          const msg = err instanceof Error ? err.message : errorMessage;
          toast.error(msg || errorMessage);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form id={id} className={cn("grid gap-3", className)}>
          {typeof children === "function"
            ? children({ isSubmitting })
            : children}
        </Form>
      )}
    </Formik>
  );
}
