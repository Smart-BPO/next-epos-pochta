"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard/settings/fcargo/", key: "navConfig" as const },
  { href: "/dashboard/settings/fcargo/test/", key: "navTest" as const },
  { href: "/dashboard/settings/fcargo/logs/", key: "navLogs" as const },
  { href: "/dashboard/settings/fcargo/webhooks/", key: "navWebhooks" as const },
];

export function FcargoSubnav() {
  const t = useDashT();
  const pathname = usePathname() || "";
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard/settings/fcargo/"
            ? path === "/dashboard/settings/fcargo/"
            : path.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "border-primary/25 bg-primary-soft text-primary"
                : "border-black/10 bg-white text-black/55 hover:bg-black/[0.03]",
            )}
          >
            {t.fcargo[link.key]}
          </Link>
        );
      })}
    </nav>
  );
}
