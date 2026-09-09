"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard/messaging/", key: "title" as const },
  { href: "/dashboard/messaging/providers/", key: "navProviders" as const },
  { href: "/dashboard/messaging/templates/", key: "navTemplates" as const },
  { href: "/dashboard/messaging/rules/", key: "navRules" as const },
  { href: "/dashboard/messaging/log/", key: "navLog" as const },
];

export function MessagingSubnav() {
  const t = useDashT();
  const pathname = usePathname() || "";
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard/messaging/"
            ? path === "/dashboard/messaging/"
            : path.startsWith(link.href);
        const label =
          link.key === "title" ? t.messaging.title : t.messaging[link.key];
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
