/** Shared Tailwind class recipes — no separate CSS modules. */

export const pageContainer =
  "mx-auto w-[min(calc(100%-2*var(--page-padding)),var(--page-max))]";

export const section = "py-[clamp(2.5rem,6vw,4.5rem)]";
export const sectionMuted = `${section} bg-surface-muted`;
export const sectionTitle =
  "m-0 mb-3 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-[-0.02em] text-ink";
export const sectionLead = "mb-6 max-w-xl text-ink-muted";

export const pageIntro = "py-[clamp(2rem,5vw,3.25rem)]";
export const pageIntroTitle =
  "m-0 mb-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink";

export const anchorSection = "scroll-mt-[var(--header-height)]";

export const hero =
  "relative isolate flex min-h-dvh flex-col justify-end overflow-hidden bg-[#8a0c18] bg-[linear-gradient(115deg,rgb(15_10_12/0.55)_8%,rgb(15_10_12/0.2)_48%,rgb(15_10_12/0.45)_100%),url('/images/hero-atmosphere.svg')] bg-cover bg-center pt-[calc(var(--header-height)+1.5rem)] pb-[clamp(2.5rem,6vw,4rem)] text-white after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[radial-gradient(circle_at_85%_15%,rgb(255_255_255/0.14),transparent_35%),linear-gradient(to_top,rgb(10_8_10/0.45),transparent_40%)]";

export const heroBrand =
  "mb-4 block animate-hero-rise font-display text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]";

export const heroTitle =
  "mb-3.5 max-w-[28ch] animate-hero-rise font-display text-[clamp(1.35rem,3.2vw,1.85rem)] font-semibold leading-snug tracking-[-0.015em] text-white/95 [animation-delay:80ms]";

export const heroLead =
  "mb-2.5 max-w-xl animate-hero-rise text-[1.05rem] text-white/85 [animation-delay:140ms]";

export const heroNote =
  "mb-6 animate-hero-rise text-[0.95rem] text-white/70 [animation-delay:180ms]";

export const heroActions =
  "flex flex-wrap gap-3 animate-hero-rise [animation-delay:220ms]";

export const btnBase =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center gap-2 rounded-[0.65rem] border border-transparent px-[1.15rem] py-[0.65rem] font-semibold transition-[background,color,border-color,transform,box-shadow] duration-[160ms] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary =
  `${btnBase} bg-primary text-white shadow-[0_8px_20px_rgb(208_18_36/0.22)] hover:bg-primary-hover`;

export const btnSecondary =
  `${btnBase} border-border bg-white text-ink hover:border-primary hover:text-primary`;

export const btnGhost = `${btnBase} bg-transparent text-ink`;

export const btnOnDark =
  `${btnBase} bg-white text-ink shadow-md hover:bg-neutral-100`;

export const btnHeroPrimary =
  `${btnBase} bg-white text-ink shadow-[0_10px_28px_rgb(0_0_0/0.25)] hover:bg-neutral-100`;

export const btnHeroSecondary =
  `${btnBase} border-white/45 bg-transparent text-white hover:border-white hover:bg-white/10`;

export const card =
  "rounded-lg border border-border bg-surface p-5 shadow-sm";

export const featureList = "m-0 grid list-none gap-0 border-t border-border p-0";
export const featureItem =
  "grid gap-1.5 border-b border-border py-[1.1rem]";
export const featureItemTitle = "m-0 text-[1.05rem] font-semibold text-ink";
export const featureItemText = "m-0 text-[0.95rem] text-ink-muted";

export const trustGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-6";
export const trustItem = "grid content-start gap-3";

export const actionTile =
  "grid gap-3.5 border-b border-border py-5 first:border-t md:grid-cols-[1fr_auto] md:items-center md:gap-4";

export const steps =
  "grid gap-4 [counter-reset:step] md:grid-cols-4";
export const step =
  "relative pl-12 md:pl-0 md:pt-[3.25rem] before:absolute before:left-0 before:top-0 before:grid before:h-9 before:w-9 before:place-items-center before:rounded-full before:bg-primary-soft before:font-bold before:text-primary before:content-[counter(step)] before:[counter-increment:step] before:transition-transform before:duration-[var(--motion-base)] before:ease-[var(--ease-out)] hover:before:scale-105 md:before:top-0";

export const faqDetails =
  "border-b border-border bg-transparent py-[0.95rem]";
export const faqSummary =
  "cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden";

export const formShell = "mx-auto max-w-[42rem]";
export const formSteps = "mb-6 flex gap-2";
export const formStepPill =
  "flex-1 rounded-[0.55rem] bg-surface-muted px-[0.55rem] py-[0.55rem] text-center text-[0.85rem] font-semibold text-ink-muted transition-[background,color,transform] duration-[160ms]";
export const formStepActive = "translate-y-[-1px] bg-primary text-white";
export const formStepDone = "bg-primary-soft text-primary";

export const field = "mb-4 grid gap-1.5";
export const fieldLabel = "text-[0.92rem] font-semibold text-ink";
export const fieldHint = "text-[0.85rem] text-ink-muted";
export const fieldError = "text-[0.85rem] text-danger";
export const fieldControl =
  "min-h-[var(--tap-min)] rounded-md border border-border bg-white px-[0.85rem] py-[0.65rem]";
export const fieldTextarea = `${fieldControl} min-h-28 resize-y`;
export const fieldRow =
  "grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4";
export const checkRow = "mb-4 flex items-start gap-2.5";
export const formActions = "mt-5 flex flex-wrap gap-3";

export const alert = "mb-4 rounded-md px-[1.1rem] py-4";
export const alertSuccess = `${alert} bg-[#e8f7ee] text-success`;
export const alertWarning = `${alert} bg-[#fff7ed] text-warning`;
export const alertInfo = `${alert} bg-primary-soft text-primary`;

export const pageCta =
  "rounded-lg bg-surface-deep p-[clamp(1.5rem,4vw,2.5rem)] text-white";

export const trackShell = "grid max-w-[40rem] gap-6";
export const trackTimeline =
  "pointer-events-none grid gap-[1.1rem] border-l-2 border-border pl-5 opacity-55";
export const trackTimelineItem =
  "relative before:absolute before:left-[-1.55rem] before:top-[0.35rem] before:h-[0.65rem] before:w-[0.65rem] before:rounded-full before:border-2 before:border-surface before:bg-border";

export const mapPlaceholder =
  "grid min-h-64 place-items-center rounded-lg border border-dashed border-border bg-[linear-gradient(135deg,var(--color-surface-muted),white),repeating-linear-gradient(-45deg,transparent,transparent_8px,rgb(208_18_36/0.04)_8px,rgb(208_18_36/0.04)_16px)] p-6 text-center text-ink-muted";

export const legalContent =
  "[&_h2]:mt-8 [&_li]:text-ink-muted [&_p]:text-ink-muted";
