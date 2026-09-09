/** Shared dashboard chrome / surface tokens (EPOS CMS mock style). */
export const dashShell =
  "min-h-dvh bg-[#f5f6f8] text-ink [--dash-tabbar-h:4.25rem]";

export const dashAside =
  "hidden w-[15.5rem] shrink-0 flex-col border-r border-black/[0.06] bg-white lg:flex";

/** Main content bottom clearance for fixed mobile tab bar. */
export const dashMainMobilePad =
  "pb-[calc(var(--dash-tabbar-h)+env(safe-area-inset-bottom,0px)+1rem)] lg:pb-6";

/** Sticky form actions above mobile tab bar (portal, mobile only). */
export const dashMobileActionBar =
  "fixed inset-x-3 z-[45] flex flex-wrap gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3 shadow-[0_8px_24px_rgb(15_18_24/0.12)] backdrop-blur bottom-[calc(var(--dash-tabbar-h)+env(safe-area-inset-bottom,0px)+0.75rem)]";

export const dashCard =
  "rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgb(15_18_24/0.04),0_8px_24px_rgb(15_18_24/0.04)]";

export const dashCardPad = `${dashCard} p-5`;

export const dashPageTitle =
  "m-0 font-display text-[1.65rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.85rem]";

export const dashPageLead = "m-0 mt-1 text-sm text-black/45";

export const dashSectionTitle =
  "m-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-ink";

export const dashBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgb(211_2_3/0.22)] transition hover:bg-primary-hover";

export const dashBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-black/[0.03]";

export const dashInput =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export const dashBadgeBase =
  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold";
