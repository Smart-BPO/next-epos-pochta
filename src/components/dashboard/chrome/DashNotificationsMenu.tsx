"use client";

import Link from "next/link";
import { DashPopover } from "@/components/dashboard/ds/DashPopover";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { IconBell } from "@/components/dashboard/icons";
import { dashIntlLocale } from "@/i18n/dashboard";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import { cn } from "@/lib/cn";

function formatWhen(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DashNotificationsMenu({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: DashNotificationsSnapshot;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intl = dashIntlLocale(locale);
  const badge = notifications.badge;

  return (
    <DashPopover
      open={open}
      onOpenChange={onOpenChange}
      panelWidth="20rem"
      trigger={({ ref, onClick, ...a11y }) => (
        <button
          type="button"
          ref={ref as React.RefCallback<HTMLButtonElement>}
          onClick={onClick}
          {...a11y}
          className="relative inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/55 transition hover:bg-black/[0.03] hover:text-ink"
          aria-label={t.chrome.notifications}
        >
          <IconBell className="size-4" />
          {badge > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </button>
      )}
    >
      <div className="border-b border-black/[0.06] px-3.5 py-2.5">
        <p className="m-0 text-sm font-semibold text-ink">
          {t.chrome.notifications}
        </p>
      </div>
      <ul className="m-0 max-h-[min(22rem,50dvh)] list-none overflow-y-auto p-0">
        {notifications.items.length === 0 ? (
          <li className="px-3.5 py-6 text-center text-sm text-black/40">
            {t.chrome.noNotifications}
          </li>
        ) : (
          notifications.items.map((item) => (
            <li key={item.id} className="border-b border-black/[0.04] last:border-0">
              <Link
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="block px-3.5 py-2.5 transition hover:bg-black/[0.03]"
              >
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-[0.65rem] font-semibold uppercase tracking-wide",
                      item.kind === "lead"
                        ? "text-primary"
                        : "text-[#b91c1c]",
                    )}
                  >
                    {item.kind === "lead"
                      ? t.chrome.newLead
                      : t.chrome.messageFailed}
                  </span>
                  <span className="shrink-0 text-[0.65rem] text-black/35">
                    {formatWhen(item.createdAt, intl)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-ink">
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className="mt-0.5 block truncate text-xs text-black/40">
                    {item.subtitle}
                  </span>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
      {notifications.showLeadsLink || notifications.showLogLink ? (
        <div className="flex flex-wrap gap-2 border-t border-black/[0.06] px-3 py-2">
          {notifications.showLeadsLink ? (
            <Link
              href="/dashboard/leads/"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t.chrome.viewAllLeads}
            </Link>
          ) : null}
          {notifications.showLeadsLink && notifications.showLogLink ? (
            <span className="text-xs text-black/20">·</span>
          ) : null}
          {notifications.showLogLink ? (
            <Link
              href="/dashboard/messaging/log/"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t.chrome.viewAllLog}
            </Link>
          ) : null}
        </div>
      ) : null}
    </DashPopover>
  );
}
