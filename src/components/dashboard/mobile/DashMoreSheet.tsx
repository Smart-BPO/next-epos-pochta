"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/cms/auth-shared";
import {
  NAV_GROUP_IDS,
  type DashboardNavItem,
} from "@/components/dashboard/nav";
import { resolveNavLabel } from "@/components/dashboard/DashboardNav";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashBottomSheet } from "@/components/dashboard/mobile/DashBottomSheet";
import { DashNavIcon } from "@/components/dashboard/mobile/DashNavIcon";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { IconLogout } from "@/components/dashboard/icons";
import { logoutAction } from "@/app/dashboard/(auth)/logout/actions";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
}

function initials(admin: AdminUser) {
  const raw = (admin.displayName || admin.email || "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}

export function DashMoreSheet({
  open,
  onOpenChange,
  rest,
  admin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rest: DashboardNavItem[];
  admin: AdminUser;
}) {
  const pathname = usePathname() || "/dashboard/";
  const t = useDashT();
  const name = admin.displayName || admin.email.split("@")[0] || "Admin";

  return (
    <DashBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.common.moreMenu}
      doneLabel={t.common.close}
    >
      <div className="space-y-6 px-1 pb-2">
        {NAV_GROUP_IDS.map((groupId) => {
          const groupItems = rest.filter((item) => item.group === groupId);
          if (groupItems.length === 0) return null;
          return (
            <div key={groupId}>
              <p className="m-0 mb-2.5 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-black/35">
                {t.nav.groups[groupId]}
              </p>
              <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0">
                {groupItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "flex min-h-[5.25rem] flex-col items-start justify-between gap-3 rounded-2xl border px-3.5 py-3.5 transition-colors",
                          active
                            ? "border-primary/25 bg-primary-soft text-primary shadow-[0_4px_14px_rgb(211_2_3/0.1)]"
                            : "border-black/[0.06] bg-[#f7f8fa] text-ink active:bg-black/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-11 place-items-center rounded-2xl",
                            active
                              ? "bg-white text-primary"
                              : "bg-white text-black/45 shadow-[0_1px_2px_rgb(15_18_24/0.04)]",
                          )}
                        >
                          <DashNavIcon href={item.href} className="size-6" />
                        </span>
                        <span className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em]">
                          {resolveNavLabel(item, t.nav)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="border-t border-black/[0.06] pt-5">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-[#f7f8fa] px-3.5 py-3">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-sm font-bold text-white">
              {initials(admin)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="block truncate text-[0.95rem] font-semibold text-ink">
                  {name}
                </span>
                <DashStatusBadge kind="role" value={admin.role} />
              </span>
              <span className="mt-0.5 block truncate text-xs text-black/40">
                {admin.email}
              </span>
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-black/[0.08] bg-white px-3 py-3.5 text-[0.95rem] font-semibold text-black/65 transition active:bg-black/[0.03]"
            >
              <IconLogout className="size-5" />
              {t.logout}
            </button>
          </form>
        </div>
      </div>
    </DashBottomSheet>
  );
}
