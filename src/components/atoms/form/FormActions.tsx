"use client";

import { useFormikContext } from "formik";
import { Button } from "@/components/atoms/Button";

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
    <div className="form-actions">
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
