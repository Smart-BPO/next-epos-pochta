"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Calculator,
  ClipboardList,
  Home,
  Inbox,
  PackagePlus,
} from "lucide-react";
import { cabinetCopy } from "@/data/cabinet";
import type { Locale } from "@/i18n/config";
import { useIsClient } from "@/hooks/useIsClient";
import {
  cabinetHref,
  getCabinetNav,
  isCabinetNavActive,
  type CabinetNavId,
} from "@/components/cabinet/nav";
import { cn } from "@/lib/cn";

const ICONS: Partial<Record<CabinetNavId, typeof Home>> = {
  home: Home,
  outgoing: ClipboardList,
  incoming: Inbox,
  calculator: Calculator,
  new: PackagePlus,
};

export function CabinetMobileNav({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/cabinet/";
  const searchParams = useSearchParams();
  const dir = searchParams.get("dir");
  const isClient = useIsClient();
  const c = cabinetCopy(locale);
  const primary = [
    ...getCabinetNav(locale).filter((i) => i.mobile),
    {
      id: "new" as const,
      href: cabinetHref(locale, "new/"),
      label: c.navNew,
      mobile: true,
    },
  ];

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
        style={{
          gridTemplateColumns: `repeat(${primary.length}, minmax(0, 1fr))`,
        }}
      >
        {primary.map((item) => {
          const active = isCabinetNavActive(pathname, item, locale, dir);
          const Icon = ICONS[item.id] ?? Home;
          const isNew = item.id === "new";
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors",
                active ? "text-primary" : "text-black/45",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-2xl transition-colors",
                  isNew
                    ? "bg-primary text-white shadow-[0_4px_12px_rgb(211_2_3/0.3)]"
                    : active
                      ? "bg-primary-soft text-primary"
                      : "bg-transparent text-black/40",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="max-w-full truncate px-0.5 text-center text-[0.65rem] font-semibold leading-tight">
                {isNew ? c.navNew.split(" ")[0] : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body,
  );
}
