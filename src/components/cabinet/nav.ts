import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";

export type CabinetNavId =
  | "home"
  | "outgoing"
  | "incoming"
  | "returns"
  | "calculator"
  | "finance"
  | "reports"
  | "tracking"
  | "settings"
  | "help"
  | "new";

export type CabinetShipmentDir = "out" | "in";

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

export function cabinetOrdersHref(
  locale: Locale,
  dir: CabinetShipmentDir = "out",
) {
  const base = cabinetHref(locale, "orders/");
  return dir === "in" ? `${base}?dir=in` : base;
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
      id: "outgoing",
      href: cabinetOrdersHref(locale, "out"),
      label: c.navOutgoing,
      badgeKey: "orders",
      mobile: true,
    },
    {
      id: "incoming",
      href: cabinetOrdersHref(locale, "in"),
      label: c.navIncoming,
      mobile: true,
    },
    {
      id: "returns",
      href: cabinetHref(locale, "returns/"),
      label: c.navReturns,
      badgeKey: "returns",
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
  dir?: string | null,
) {
  const path = stripSlash(pathname);
  const root = stripSlash(cabinetHref(locale));
  if (item.id === "home") {
    return path === root;
  }
  if (item.id === "outgoing") {
    if (path.startsWith(`${root}/shipments`)) return true;
    if (path.startsWith(`${root}/orders`)) return dir !== "in";
    return false;
  }
  if (item.id === "incoming") {
    return path.startsWith(`${root}/orders`) && dir === "in";
  }
  return path === stripSlash(item.href) || path.startsWith(`${stripSlash(item.href)}/`);
}
