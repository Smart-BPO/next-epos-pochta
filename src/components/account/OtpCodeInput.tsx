"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function OtpCodeInput({
  value,
  onChange,
  length = 6,
  busy = false,
  invalid = false,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  busy?: boolean;
  invalid?: boolean;
  label: string;
}) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          if (busy) return;
          onChange(e.target.value.replace(/\D/g, "").slice(0, length));
        }}
        onFocus={(e) => {
          setFocused(true);
          const end = e.currentTarget.value.length;
          e.currentTarget.setSelectionRange(end, end);
        }}
        onBlur={() => setFocused(false)}
        readOnly={busy}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        autoFocus
        maxLength={length}
        aria-label={label}
        aria-invalid={invalid || undefined}
        className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none"
      />
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length }, (_, i) => {
          const ch = value[i];
          const active = focused && !busy && i === activeIndex;
          return (
            <div
              key={i}
              className={cn(
                "flex h-14 items-center justify-center rounded-xl border bg-white font-mono text-2xl font-semibold text-ink transition-[border-color,box-shadow] duration-100",
                invalid
                  ? "border-primary/60 bg-primary-soft/40"
                  : active
                    ? "border-primary shadow-[0_0_0_3px_rgb(211_2_3/0.12)]"
                    : ch
                      ? "border-black/25"
                      : "border-black/10",
                busy && "opacity-60",
              )}
            >
              {ch ?? (active ? (
                <span className="h-6 w-px animate-pulse bg-ink" />
              ) : null)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
