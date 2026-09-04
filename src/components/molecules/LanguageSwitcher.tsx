"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeLabels, locales } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-[var(--tap-min)] items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-3 text-base font-medium text-black"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {localeLabels[locale]}
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={cn(
            "shrink-0 text-black/50 transition-transform duration-150",
            open && "rotate-180",
          )}
        >
          <path
            d="M2.5 4.25 6 7.75l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-50 mt-2 min-w-[4.5rem] max-w-[calc(100vw-2*var(--page-padding))] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-[0_12px_32px_rgb(0_0_0/0.12)]"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <Link
                  href={switchLocalePath(pathname, code)}
                  className={cn(
                    "flex min-h-[var(--tap-min)] items-center px-3 py-2 text-base font-medium",
                    active
                      ? "bg-black/5 text-black"
                      : "text-black/60 hover:bg-black/[0.03] hover:text-black",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {localeLabels[code]}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
