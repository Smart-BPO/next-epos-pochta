"use client";

import { useFormikContext } from "formik";
import { Button } from "@/components/atoms/Button";
import { formActions } from "@/styles/ui";

interface FormActionsProps {
  submitLabel: string;
  backLabel?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function FormActions({
  submitLabel,
  backLabel,
  onBack,
  showBack,
}: FormActionsProps) {
  const { isSubmitting } = useFormikContext();

  return (
    <div className={formActions}>
      {showBack && onBack && backLabel ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
