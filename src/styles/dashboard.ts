/** Shared dashboard chrome / surface tokens (EPOS CMS). Prefer CSS vars. */
export const dashShell =
  "h-dvh overflow-hidden bg-[var(--dash-bg)] text-[var(--dash-ink)] text-ink [--dash-tabbar-h:4.75rem]";

export const dashAside =
  "hidden h-dvh w-[15.5rem] shrink-0 flex-col border-r border-[var(--dash-border)] bg-[var(--dash-surface)] transition-[width] duration-200 lg:flex data-[collapsed=true]:w-[4.25rem]";

/** Sticky app header (desktop + mobile) with profile / notifications / locale. */
export const dashTopBar =
  "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-surface)_95%,transparent)] px-4 backdrop-blur sm:px-5 lg:px-6";

/** Scrollable main column next to the fixed sidebar. */
export const dashMainColumn =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto";

/** Main content bottom clearance for floating mobile tab bar. */
export const dashMainMobilePad =
  "pb-[calc(var(--dash-tabbar-h)+max(0.75rem,env(safe-area-inset-bottom,0px))+1.25rem)] lg:pb-6";

/** Sticky form actions above mobile tab bar (portal, mobile only). */
export const dashMobileActionBar =
  "fixed inset-x-3 z-[45] flex flex-wrap gap-3 rounded-2xl border border-[var(--dash-border-strong)] bg-[color-mix(in_srgb,var(--dash-surface)_95%,transparent)] p-3 shadow-[var(--dash-shadow)] backdrop-blur bottom-[calc(var(--dash-tabbar-h)+max(0.75rem,env(safe-area-inset-bottom,0px))+0.75rem)]";

export const dashCard =
  "rounded-[var(--dash-radius)] border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow)]";

export const dashCardPad = `${dashCard} p-5`;

export const dashPageTitle =
  "m-0 font-display text-[1.65rem] font-bold tracking-[-0.02em] text-[var(--dash-ink)] sm:text-[1.85rem]";

export const dashPageLead = "m-0 mt-1 text-sm text-[var(--dash-muted)]";

export const dashSectionTitle =
  "m-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--dash-ink)]";

export const dashBtnPrimary =
  "inline-flex h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] items-center justify-center gap-2 rounded-[var(--control-radius)] bg-primary px-[var(--btn-px-sm)] text-[length:var(--btn-text-sm)] font-semibold text-white shadow-[0_4px_14px_rgb(211_2_3/0.22)] transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnSecondary =
  "inline-flex h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] items-center justify-center gap-2 rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--dash-surface)] px-[var(--btn-px-sm)] text-[length:var(--btn-text-sm)] font-semibold text-[var(--dash-ink)] transition hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnDanger =
  "inline-flex h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] items-center justify-center gap-2 rounded-[var(--control-radius)] bg-[#dc2626] px-[var(--btn-px-sm)] text-[length:var(--btn-text-sm)] font-semibold text-white transition hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnGhost =
  "inline-flex h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] items-center justify-center gap-2 rounded-[var(--control-radius)] px-3 text-[length:var(--btn-text-sm)] font-semibold text-[var(--dash-muted-strong)] transition hover:bg-black/[0.04] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

/** Compact controls for table / list row actions. */
export const dashBtnRowGhost =
  "inline-flex h-[var(--btn-height-xs)] min-h-[var(--btn-height-xs)] items-center justify-center rounded-[var(--radius-sm)] px-2 text-[length:var(--btn-text-xs)] font-semibold text-[var(--dash-muted-strong)] transition hover:bg-black/[0.04] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnRowSecondary =
  "inline-flex h-[var(--btn-height-xs)] min-h-[var(--btn-height-xs)] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--control-border)] bg-[var(--dash-surface)] px-2 text-[length:var(--btn-text-xs)] font-semibold text-[var(--dash-ink)] transition hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashBtnRowDanger =
  "inline-flex h-[var(--btn-height-xs)] min-h-[var(--btn-height-xs)] items-center justify-center rounded-[var(--radius-sm)] border border-[#fecaca] bg-[var(--dash-surface)] px-2 text-[length:var(--btn-text-xs)] font-semibold text-[#b91c1c] transition hover:bg-[#fef2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-focus-ring)] disabled:cursor-not-allowed disabled:opacity-55";

export const dashInput =
  "box-border h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] w-full rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--dash-surface)] px-[var(--control-px-sm)] text-[length:var(--control-text-sm)] leading-none text-[var(--dash-ink)] outline-none transition focus:border-[var(--control-border-focus)] focus:ring-2 focus:ring-[var(--control-ring)] disabled:bg-black/[0.03]";

/** Compact table / toolbar field. */
export const dashInputSm =
  "box-border h-[var(--btn-height-xs)] min-h-[var(--btn-height-xs)] w-full rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--dash-surface)] px-2.5 text-[length:var(--btn-text-xs)] leading-none text-[var(--dash-ink)] outline-none transition focus:border-[var(--control-border-focus)] focus:ring-2 focus:ring-[var(--control-ring)] disabled:bg-black/[0.03]";

/** Native select with a centered custom chevron (avoids OS caret misalignment). */
export const dashSelect =
  "dash-select box-border h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] w-full appearance-none rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--dash-surface)] py-0 pl-[var(--control-px-sm)] pr-9 text-[length:var(--control-text-sm)] leading-none text-[var(--dash-ink)] outline-none transition focus:border-[var(--control-border-focus)] focus:ring-2 focus:ring-[var(--control-ring)] disabled:bg-black/[0.03]";

export const dashSelectSm =
  "dash-select box-border h-[var(--btn-height-xs)] min-h-[var(--btn-height-xs)] w-full appearance-none rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--dash-surface)] py-0 pl-2.5 pr-8 text-[length:var(--btn-text-xs)] leading-none text-[var(--dash-ink)] outline-none transition focus:border-[var(--control-border-focus)] focus:ring-2 focus:ring-[var(--control-ring)] disabled:bg-black/[0.03]";

export const dashInputError =
  "box-border h-[var(--btn-height-sm)] min-h-[var(--btn-height-sm)] w-full rounded-[var(--control-radius)] border border-primary/40 bg-[var(--dash-surface)] px-[var(--control-px-sm)] text-[length:var(--control-text-sm)] leading-none text-[var(--dash-ink)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export const dashLabel =
  "m-0 text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]";

export const dashHint = "m-0 text-xs text-[var(--dash-muted)]";

export const dashFieldError = "m-0 text-xs font-medium text-primary";

export const dashModalOverlay =
  "fixed inset-0 z-[60] bg-black/45 transition-opacity";

export const dashModalPanel =
  "fixed z-[61] flex max-h-[min(90dvh,40rem)] w-[min(calc(100%-1.5rem),28rem)] flex-col overflow-hidden rounded-2xl border border-[var(--dash-border-strong)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow-modal)]";

export const dashBadgeBase =
  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold";

export const dashDrawerPanel =
  "fixed inset-y-0 right-0 z-[62] flex w-[min(100%,26rem)] flex-col border-l border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow-modal)]";
