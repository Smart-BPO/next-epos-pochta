"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export function CopyButton({
  value,
  label = "Копировать",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  return (
    <button
      type="button"
      className="text-[0.7rem] font-semibold text-primary hover:underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Скопировано");
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Не удалось скопировать");
        }
      }}
    >
      {copied ? "Скопировано" : label}
    </button>
  );
}
