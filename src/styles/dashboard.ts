/** Shared dashboard chrome / surface tokens (EPOS CMS mock style). */
export const dashShell =
  "h-dvh overflow-hidden bg-[#f5f6f8] text-ink [--dash-tabbar-h:4.25rem]";

export const dashAside =
  "hidden h-dvh w-[15.5rem] shrink-0 flex-col border-r border-black/[0.06] bg-white lg:flex";

/** Scrollable main column next to the fixed sidebar. */
export const dashMainColumn =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto";

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
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgb(211_2_3/0.22)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-black/55 transition hover:bg-black/[0.04] hover:text-ink disabled:cursor-not-allowed disabled:opacity-55";

export const dashInput =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-black/[0.03]";

export const dashInputError =
  "w-full rounded-xl border border-primary/40 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export const dashLabel =
  "m-0 text-xs font-semibold uppercase tracking-wide text-black/40";

export const dashHint = "m-0 text-xs text-black/40";

export const dashFieldError = "m-0 text-xs font-medium text-primary";

export const dashModalOverlay =
  "fixed inset-0 z-[60] bg-black/45 transition-opacity";

export const dashModalPanel =
  "fixed z-[61] flex max-h-[min(90dvh,40rem)] w-[min(calc(100%-1.5rem),28rem)] flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_24px_64px_rgb(15_18_24/0.22)]";

export const dashBadgeBase =
  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold";
