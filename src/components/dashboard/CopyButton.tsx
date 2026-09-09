"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";

export function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const t = useDashT();
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const shown = label ?? t.common.copy;

  return (
    <button
      type="button"
      className="text-[0.7rem] font-semibold text-primary hover:underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(t.common.copied);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(t.errors.generic);
        }
      }}
    >
      {copied ? t.common.copied : shown}
    </button>
  );
}
