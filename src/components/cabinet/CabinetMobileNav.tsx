"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  MapPinned,
  Package,
  PackagePlus,
  UserRound,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { useIsClient } from "@/hooks/useIsClient";
import {
  getCabinetNav,
  isCabinetNavActive,
  type CabinetNavId,
} from "@/components/cabinet/nav";
import { cn } from "@/lib/cn";

const ICONS: Record<CabinetNavId, typeof Package> = {
  shipments: Package,
  new: PackagePlus,
  tracking: MapPinned,
  profile: UserRound,
};

export function CabinetMobileNav({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/cabinet/";
  const isClient = useIsClient();
  const items = getCabinetNav(locale);

  if (!isClient) return null;

  return createPortal(
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Cabinet"
    >
      <div
        className="pointer-events-auto mx-auto grid h-[var(--dash-tabbar-h)] w-[min(100%-1.5rem,28rem)] grid-flow-col overflow-hidden rounded-[1.35rem] border border-black/[0.08] bg-white/95 shadow-[0_8px_32px_rgb(15_18_24/0.14),0_2px_8px_rgb(15_18_24/0.06)] backdrop-blur-xl"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = isCabinetNavActive(pathname, item, locale);
          const Icon = ICONS[item.id];
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1.5 py-2 transition-colors",
                active ? "text-primary" : "text-black/45 active:text-black/70",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-2xl transition-colors",
                  active
                    ? "bg-primary-soft text-primary shadow-[inset_0_0_0_1px_rgb(211_2_3/0.12)]"
                    : "bg-transparent text-black/40",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="max-w-full truncate px-0.5 text-center text-[0.6875rem] font-semibold leading-tight tracking-[-0.01em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body,
  );
}
