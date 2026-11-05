import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";

export type CabinetNavId =
  | "home"
  | "orders"
  | "returns"
  | "calculator"
  | "finance"
  | "reports"
  | "tracking"
  | "settings"
  | "help"
  | "new";

export type CabinetNavItem = {
  id: CabinetNavId;
  href: string;
  label: string;
  badgeKey?: "orders" | "returns" | "attention";
  /** Primary tabs on mobile. */
  mobile?: boolean;
};

export function cabinetHref(locale: Locale, sub = "") {
  return localePath(locale, `/cabinet/${sub}`);
}

export function cabinetShipmentHref(locale: Locale, tracking: string) {
  return cabinetHref(
    locale,
    `shipments/${encodeURIComponent(tracking)}/`,
  );
}

export function getCabinetNav(locale: Locale): CabinetNavItem[] {
  const c = cabinetCopy(locale);
  return [
    {
      id: "home",
      href: cabinetHref(locale),
      label: c.navHome,
      mobile: true,
    },
    {
      id: "orders",
      href: cabinetHref(locale, "orders/"),
      label: c.navOrders,
      badgeKey: "orders",
      mobile: true,
    },
    {
      id: "returns",
      href: cabinetHref(locale, "returns/"),
      label: c.navReturns,
      badgeKey: "returns",
      mobile: true,
    },
    {
      id: "calculator",
      href: cabinetHref(locale, "calculator/"),
      label: c.navCalculator,
      mobile: true,
    },
    {
      id: "finance",
      href: cabinetHref(locale, "finance/"),
      label: c.navFinance,
    },
    {
      id: "reports",
      href: cabinetHref(locale, "reports/"),
      label: c.navReports,
    },
    {
      id: "tracking",
      href: cabinetHref(locale, "tracking/"),
      label: c.navTrack,
    },
  ];
}

function stripSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function isCabinetNavActive(
  pathname: string,
  item: CabinetNavItem,
  locale: Locale,
) {
  const path = stripSlash(pathname);
  const root = stripSlash(cabinetHref(locale));
  if (item.id === "home") {
    return path === root;
  }
  if (item.id === "orders") {
    return (
      path === stripSlash(item.href) ||
      path.startsWith(`${root}/shipments`) ||
      path.startsWith(`${root}/orders`)
    );
  }
  return path === stripSlash(item.href) || path.startsWith(`${stripSlash(item.href)}/`);
}
