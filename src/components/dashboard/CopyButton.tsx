"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label,
  variant = "icon",
  className,
}: {
  value: string;
  label?: string;
  /** `icon` (default) — compact clipboard; `text` — legacy text link */
  variant?: "icon" | "text";
  className?: string;
}) {
  const t = useDashT();
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t.common.copied);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t.errors.generic);
    }
  };

  if (variant === "text") {
    return (
      <button
        type="button"
        className={cn(
          !className && "text-[0.7rem] font-semibold text-primary hover:underline",
          className,
        )}
        onClick={copy}
      >
        {copied ? t.common.copied : (label ?? t.common.copy)}
      </button>
    );
  }

  const tip = copied ? t.common.copied : (label ?? t.common.copy);

  return (
    <button
      type="button"
      title={tip}
      aria-label={tip}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-black/40 transition",
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        "[@media(hover:none)]:opacity-100",
        "hover:bg-black/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        copied && "opacity-100 text-emerald-600 hover:text-emerald-700",
        className,
      )}
      onClick={copy}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
