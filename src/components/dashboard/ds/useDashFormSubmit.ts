"use client";

import { toast } from "react-toastify";

/**
 * Wrap a server action / async mutation with toast feedback.
 * Use inside Formik onSubmit or standalone handlers.
 */
export function useDashFormSubmit() {
  return async function run<T>(
    fn: () => Promise<T>,
    opts?: {
      success?: string;
      error?: string;
      onSuccess?: (result: T) => void;
    },
  ): Promise<T | undefined> {
    try {
      const result = await fn();
      if (opts?.success) toast.success(opts.success);
      opts?.onSuccess?.(result);
      return result;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : (opts?.error ?? "Не удалось сохранить"),
      );
      return undefined;
    }
  };
}

/** Build FormData from a plain object (skips undefined/null). */
export function valuesToFormData(
  values: Record<string, unknown>,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") {
      if (value) fd.set(key, "on");
      continue;
    }
    fd.set(key, String(value));
  }
  return fd;
}
