"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "ghost" | "secondary" | "danger";

const TONE: Record<Tone, string> = {
  ghost:
    "text-black/45 hover:bg-black/[0.05] hover:text-ink focus-visible:ring-primary/25",
  secondary:
    "border border-[var(--dash-border)] bg-[var(--dash-surface)] text-ink hover:bg-black/[0.03] focus-visible:ring-primary/25",
  danger:
    "text-[#b91c1c] hover:bg-[#fef2f2] focus-visible:ring-[#fecaca]",
};

export function DashIconButton({
  label,
  tone = "ghost",
  size = "md",
  className,
  children,
  ...rest
}: {
  label: string;
  tone?: Tone;
  size?: "sm" | "md";
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md transition",
        "focus-visible:outline-none focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "size-7" : "size-8",
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
