"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, Globe, LogOut, Settings } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { accountCopy } from "@/data/account-copy";
import { cabinetCopy } from "@/data/cabinet";
import { CabinetMenu } from "@/components/cabinet/CabinetMenu";
import {
  cabinetHref,
  cabinetShipmentHref,
} from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import { cn } from "@/lib/cn";

function UserAvatar({
  name,
  phone,
  avatarUrl,
}: {
  name: string;
  phone: string;
  avatarUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const src = avatarUrl?.trim() || "";
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote FCargo avatar URL
      <img
        src={src}
        alt=""
        width={36}
        height={36}
        onError={() => setFailed(true)}
        className="size-9 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
      {initials(name, phone)}
    </span>
  );
}

type MenuId = "locale" | "attention" | "profile" | null;

const LOCALES: Locale[] = ["uz", "ru", "zh"];

function barePath(pathname: string): string {
  const stripped = pathname.replace(/^\/(ru|zh)(?=\/|$)/, "");
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

function initials(name: string, phone: string) {
  const raw = name.trim();
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  }
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-2) || "?";
}

export function CabinetHeaderActions({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/cabinet/";
  const { linked, logout, loggingOut } = useCabinetSession();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const [open, setOpen] = useState<MenuId>(null);

  const bind = (id: Exclude<MenuId, null>) => ({
    open: open === id,
    onOpenChange: (next: boolean) => setOpen(next ? id : null),
  });

  const attention = stats.attention.slice(0, 6);
  const attentionCount = stats.attention.length;
  const name = linked.displayName || linked.phone;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <CabinetMenu
        {...bind("locale")}
        panelWidth="9rem"
        trigger={({ ref, onClick, ...a11y }) => (
          <button
            type="button"
            ref={ref as React.RefCallback<HTMLButtonElement>}
            onClick={onClick}
            {...a11y}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-2.5 text-xs font-bold text-ink transition hover:bg-black/[0.03]"
            aria-label="Language"
          >
            <Globe className="size-3.5 text-black/45" strokeWidth={1.75} aria-hidden />
            {locale.toUpperCase()}
          </button>
        )}
      >
        <div className="p-1.5" role="group" aria-label="Language">
          {LOCALES.map((code) => (
            <Link
              key={code}
              href={localePath(code, barePath(pathname))}
              onClick={() => setOpen(null)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold no-underline transition",
                locale === code
                  ? "bg-primary-soft text-primary"
                  : "text-ink hover:bg-black/[0.03]",
              )}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </div>
      </CabinetMenu>

      <CabinetMenu
        {...bind("attention")}
        panelWidth="18rem"
        trigger={({ ref, onClick, ...a11y }) => (
          <button
            type="button"
            ref={ref as React.RefCallback<HTMLButtonElement>}
            onClick={onClick}
            {...a11y}
            className="relative inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-ink transition hover:bg-black/[0.03]"
            aria-label={c.attentionTitle}
          >
            <Bell className="size-4" strokeWidth={1.75} aria-hidden />
            {attentionCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-white">
                {attentionCount > 9 ? "9+" : attentionCount}
              </span>
            ) : null}
          </button>
        )}
      >
        <div className="border-b border-black/[0.06] px-3.5 py-2.5">
          <p className="m-0 text-sm font-semibold text-ink">{c.attentionTitle}</p>
        </div>
        {attention.length === 0 ? (
          <p className="m-0 px-3.5 py-3 text-sm text-black/45">{c.noAttention}</p>
        ) : (
          <ul className="m-0 max-h-64 list-none overflow-y-auto p-1.5">
            {attention.map((row) => (
              <li key={row.trackingNumber}>
                <Link
                  href={cabinetShipmentHref(locale, row.trackingNumber)}
                  onClick={() => setOpen(null)}
                  className="flex flex-col gap-0.5 rounded-lg px-3 py-2 no-underline hover:bg-black/[0.03]"
                >
                  <span className="font-mono text-xs font-semibold text-ink">
                    {row.trackingNumber}
                  </span>
                  <span className="text-xs text-black/45">{row.statusLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {attentionCount > 0 ? (
          <div className="border-t border-black/[0.06] p-1.5">
            <Link
              href={cabinetHref(locale, "returns/")}
              onClick={() => setOpen(null)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-primary no-underline hover:bg-primary-soft"
            >
              {c.navReturns}
            </Link>
          </div>
        ) : null}
      </CabinetMenu>

      <CabinetMenu
        {...bind("profile")}
        panelWidth="16rem"
        trigger={({ ref, onClick, ...a11y }) => (
          <button
            type="button"
            ref={ref as React.RefCallback<HTMLButtonElement>}
            onClick={onClick}
            {...a11y}
            className="inline-flex size-9 items-center justify-center overflow-hidden rounded-full transition hover:opacity-90"
            aria-label={name}
          >
            <UserAvatar
              name={linked.displayName || ""}
              phone={linked.phone}
              avatarUrl={linked.avatarUrl}
            />
          </button>
        )}
      >
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-3.5 py-3">
          <UserAvatar
            name={linked.displayName || ""}
            phone={linked.phone}
            avatarUrl={linked.avatarUrl}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-semibold text-ink">{name}</p>
            <p className="m-0 mt-0.5 truncate text-xs text-black/40">
              {linked.phone}
            </p>
          </div>
        </div>
        <div className="space-y-0.5 p-1.5">
          <Link
            href={cabinetHref(locale, "settings/")}
            onClick={() => setOpen(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink no-underline transition hover:bg-black/[0.03]"
          >
            <Settings className="size-4 text-black/40" aria-hidden />
            {c.navSettings}
          </Link>
          <Link
            href={cabinetHref(locale, "help/")}
            onClick={() => setOpen(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink no-underline transition hover:bg-black/[0.03]"
          >
            <CircleHelp className="size-4 text-black/40" aria-hidden />
            {c.navHelp}
          </Link>
          <button
            type="button"
            disabled={loggingOut}
            onClick={() => {
              setOpen(null);
              void logout();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-black/55 transition hover:bg-black/[0.03] hover:text-ink disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden />
            {a.logout}
          </button>
        </div>
      </CabinetMenu>
    </div>
  );
}
