import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";

export type CabinetNavId = "shipments" | "new" | "tracking" | "profile";

export type CabinetNavItem = {
  id: CabinetNavId;
  href: string;
  label: string;
};

export function cabinetHref(locale: Locale, sub = "") {
  return localePath(locale, `/cabinet/${sub}`);
}

export function cabinetShipmentHref(locale: Locale, tracking: string) {
  return cabinetHref(locale, `shipments/${encodeURIComponent(tracking)}/`);
}

export function getCabinetNav(locale: Locale): CabinetNavItem[] {
  const c = cabinetCopy(locale);
  return [
    { id: "shipments", href: cabinetHref(locale), label: c.navShipments },
    { id: "new", href: cabinetHref(locale, "new/"), label: c.navNew },
    {
      id: "tracking",
      href: cabinetHref(locale, "tracking/"),
      label: c.navTrack,
    },
    {
      id: "profile",
      href: cabinetHref(locale, "profile/"),
      label: c.navProfile,
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
  if (item.id === "shipments") {
    return path === root || path.startsWith(`${root}/shipments`);
  }
  return path === stripSlash(item.href);
}
