/** Shared Tailwind class recipes — no separate CSS modules. */

export const pageContainer =
  "mx-auto w-[min(calc(100%-2*var(--page-padding)),var(--page-max))]";

export const section = "py-[var(--section-y)]";
export const sectionMuted = `${section} bg-surface-muted`;
export const sectionTitle =
  "m-0 mb-4 font-display text-[length:var(--home-title)] font-semibold uppercase leading-tight tracking-[-0.02em] text-black";
export const sectionLead = "mb-6 max-w-xl text-[length:var(--home-lead)] text-black/60";

export const pageIntro = "py-[var(--section-y)]";
export const pageIntroTitle =
  "m-0 mb-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold uppercase leading-[1.15] tracking-[-0.02em] text-black";

export const anchorSection = "scroll-mt-[var(--header-height)]";

/** Home hero — title + map; actions live in the primary dual bar below. */
export const homeHero =
  "relative isolate overflow-hidden bg-white";

export const homeHeroGrid =
  "relative grid items-start gap-4 py-6 max-lg:grid-cols-1 sm:gap-5 sm:py-8 md:py-10 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:pb-12 lg:pt-10 xl:pb-14";

export const homeHeroCopy =
  "relative z-10 flex max-w-[32rem] flex-col items-stretch gap-3 lg:items-start lg:gap-4";

export const homeHeroTitle =
  "m-0 animate-hero-rise font-display text-[1.625rem] font-black uppercase leading-[1.08] tracking-[-0.02em] text-black sm:text-[1.85rem] lg:text-[clamp(1.75rem,3.8vw,2.85rem)]";

export const homeHeroLead =
  "m-0 animate-hero-rise text-[0.95rem] leading-snug text-black/80 [animation-delay:80ms] sm:text-base lg:text-[clamp(1rem,1.8vw,1.25rem)] lg:text-black";

export const homeHeroNote =
  "m-0 animate-hero-rise text-sm text-black/55 [animation-delay:140ms]";

export const homeHeroVisual =
  "pointer-events-none absolute inset-x-0 bottom-0 top-10 -z-0 opacity-[0.2] max-lg:max-h-[16rem] lg:relative lg:inset-auto lg:z-0 lg:min-h-[20rem] lg:w-full lg:opacity-100";

export const homeHeroMap =
  "pointer-events-none relative mx-auto block h-auto w-full max-w-[18rem] select-none object-contain object-bottom sm:max-w-[22rem] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:h-full lg:w-[min(110%,42rem)] lg:max-w-none lg:object-right";

/** Dual action bar: track | calculator init on primary. */
export const homeActionBar =
  "bg-primary text-white";

export const homeActionGrid =
  "grid gap-5 py-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] lg:items-center lg:gap-0 lg:py-5";

export const homeActionPane =
  "flex min-w-0 items-center gap-3 sm:gap-3.5";

export const homeActionIcon =
  "hidden h-9 w-9 shrink-0 text-white sm:block lg:h-10 lg:w-10";

export const homeActionBody =
  "flex min-w-0 flex-1 flex-col gap-1.5";

export const homeActionLabel =
  "m-0 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-white/95 sm:text-[0.7rem]";

export const homeActionRow =
  "flex min-w-0 flex-row flex-wrap items-center gap-2 sm:flex-nowrap";

export const homeActionField =
  "min-h-10 min-w-0 flex-1 rounded-xl border border-white/75 bg-white/12 px-3.5 py-2 text-[0.95rem] text-white outline-none placeholder:text-white/65 focus:border-white focus:bg-white/18";

export const homeActionBtn =
  "inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-primary transition-opacity hover:opacity-92 sm:px-5";

export const homeActionSwap =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-white/55 text-white transition-colors hover:border-white hover:bg-white/10 sm:h-10 sm:w-10";

export const homeActionDivider =
  "hidden w-px self-stretch bg-white/35 lg:mx-5 lg:block xl:mx-7";

export const homeActionNote =
  "m-0 text-[0.65rem] leading-snug text-white/75 sm:text-[0.7rem]";

export const homeNeedsSection =
  "bg-gradient-to-b from-primary to-primary-hover pb-10 pt-8 sm:pb-12 sm:pt-10 md:pb-[var(--section-y)] md:pt-14 lg:pt-16";
export const homeNeedsGrid =
  "grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5";

export const homeNeedsCard =
  "flex h-full flex-col gap-2 rounded-2xl border border-black/10 bg-white p-3 sm:gap-3 sm:rounded-3xl sm:p-5 lg:p-[var(--card-pad)]";

/** Business / secondary light hero */
export const hero =
  "relative isolate flex min-h-[min(70dvh,36rem)] flex-col justify-end overflow-hidden bg-white pt-[calc(var(--header-height)+1.5rem)] pb-12";

export const heroBrand =
  "mb-4 block animate-hero-rise font-display text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] text-primary";

export const heroTitle =
  "mb-3.5 max-w-[28ch] animate-hero-rise font-display text-[clamp(1.35rem,3.2vw,1.85rem)] font-semibold leading-snug tracking-[-0.015em] text-black [animation-delay:80ms]";

export const heroLead =
  "mb-2.5 max-w-xl animate-hero-rise text-[1.05rem] text-black/80 [animation-delay:140ms]";

export const heroNote =
  "mb-6 animate-hero-rise text-[0.95rem] text-black/60 [animation-delay:180ms]";

export const heroActions =
  "flex flex-wrap gap-3 sm:gap-4 animate-hero-rise [animation-delay:220ms]";

export const btnBase =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center gap-2 rounded-[48px] border border-transparent px-5 py-3.5 text-base font-medium leading-5 transition-[background,color,border-color,transform,box-shadow,opacity] duration-[160ms] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-4";

export const btnPrimary =
  `${btnBase} border-[#ff3539] bg-[linear-gradient(86deg,#310102_21.5%,#aa2628_99%)] text-white shadow-[inset_0_0_8px_#fff] hover:opacity-95`;

export const btnSecondary =
  `${btnBase} border-primary bg-transparent text-primary hover:bg-primary-soft`;

export const btnGhost = `${btnBase} bg-transparent text-ink`;

export const btnOnDark =
  `${btnBase} border-[#ff3539] bg-[linear-gradient(86deg,#310102_21.5%,#aa2628_99%)] text-white shadow-[inset_0_0_8px_#fff] hover:opacity-95`;

export const btnHeroPrimary = btnPrimary;

export const btnHeroSecondary = btnSecondary;

/** Home section titles — Figma uppercase display. */
export const homeSectionTitle =
  "m-0 font-display text-[length:var(--home-title)] font-semibold uppercase leading-normal tracking-[-0.02em] text-black";

export const homeSectionLead =
  "m-0 max-w-[30rem] text-[length:var(--home-lead)] text-black/60";

export const card =
  "rounded-3xl border border-black/20 bg-surface p-[var(--card-pad)] shadow-none";

export const featureList = "m-0 grid list-none gap-0 border-t border-border p-0";
export const featureItem =
  "grid min-w-0 gap-1.5 border-b border-border py-[1.1rem]";
export const featureItemTitle = "m-0 text-[1.05rem] font-semibold text-ink";
export const featureItemText = "m-0 min-w-0 break-words text-[0.95rem] text-ink-muted";

export const trustGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-6";
export const trustItem = "grid content-start gap-3";

export const actionTile =
  "grid gap-3.5 border-b border-border py-5 first:border-t md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4";

export const steps =
  "grid gap-4 [counter-reset:step] sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))]";
export const step =
  "relative min-w-0 pl-12 md:pl-0 md:pt-[3.25rem] before:absolute before:left-0 before:top-0 before:grid before:h-9 before:w-9 before:place-items-center before:rounded-full before:bg-primary-soft before:font-bold before:text-primary before:content-[counter(step)] before:[counter-increment:step] before:transition-transform before:duration-[var(--motion-base)] before:ease-[var(--ease-out)] hover:before:scale-105 md:before:top-0";

export const faqDetails =
  "border-b border-border bg-transparent py-[0.95rem]";
export const faqSummary =
  "cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden";

export const formShell = "mx-auto max-w-[42rem]";
export const formSteps = "mb-6 flex flex-wrap gap-2";
/** Shared layout only — apply exactly one of idle / active / done (no bg/text conflicts). */
export const formStepPill =
  "min-w-0 flex-1 rounded-[0.55rem] border px-[0.55rem] py-[0.55rem] text-center text-[0.85rem] font-semibold transition-[background,color,border-color,transform,box-shadow] duration-[160ms]";
export const formStepIdle =
  "border-black/20 bg-[#dde1e7] text-ink";
export const formStepActive =
  "translate-y-[-1px] border-primary bg-primary text-white shadow-[0_4px_14px_rgb(211_2_3/0.28)]";
export const formStepDone =
  "border-primary/30 bg-primary-soft text-primary";

export const quizProgressWrap = "mb-5 grid gap-2";
export const quizProgressTrack = "h-1.5 overflow-hidden rounded-full bg-black/10";
export const quizProgressFill =
  "h-full rounded-full bg-primary transition-[width] duration-300 ease-out";
export const quizProgressLabel = "m-0 text-sm font-medium text-ink-muted";
export const quizQuestion =
  "m-0 mb-1 font-display text-xl font-semibold uppercase leading-tight tracking-[-0.02em] text-black sm:text-2xl";
export const quizHint = "m-0 mb-4 text-sm text-ink-muted";
export const quizOptions =
  "grid gap-2.5 sm:grid-cols-2 sm:gap-3";
export const quizOption =
  "flex w-full cursor-pointer flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left transition-[border-color,background,box-shadow,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
export const quizOptionIdle =
  "border-black/15 bg-white hover:border-primary/40 hover:shadow-[0_8px_24px_rgb(15_18_24/0.06)]";
export const quizOptionActive =
  "border-primary bg-primary-soft shadow-[0_8px_24px_rgb(211_2_3/0.12)]";
export const quizOptionTitle =
  "font-display text-base font-semibold uppercase tracking-[-0.01em] text-black";
export const quizOptionDesc = "text-sm leading-snug text-ink-muted";
export const quizChips = "flex flex-wrap gap-2";
export const quizChip =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors";
export const quizChipIdle =
  "border-black/15 bg-white text-ink hover:border-primary/40";
export const quizChipActive =
  "border-primary bg-primary text-white hover:border-primary";

export const field = "mb-4 grid gap-1.5";
export const fieldLabel = "text-[0.92rem] font-semibold text-ink";
export const fieldHint = "text-[0.85rem] text-ink-muted";
export const fieldError = "text-[0.85rem] text-danger";
export const fieldControl =
  "min-h-[var(--tap-min)] w-full rounded-xl border border-black/30 bg-white px-4 py-3.5 text-base text-ink outline-none placeholder:text-black/45 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted";
export const fieldTextarea = `${fieldControl} min-h-28 resize-y`;
export const fieldRow =
  "grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4";
export const checkRow =
  "mb-4 flex items-start gap-2.5 text-[0.92rem] leading-snug text-ink";
export const formActions = "mt-5 flex flex-wrap gap-3";

export const alert = "mb-4 rounded-md px-[1.1rem] py-4";
export const alertSuccess = `${alert} bg-[#e8f7ee] text-success`;
export const alertWarning = `${alert} bg-[#fff7ed] text-warning`;
export const alertInfo = `${alert} bg-primary-soft text-primary`;

export const pageCta =
  "relative overflow-hidden rounded-3xl border border-black/20 bg-black p-6 text-white sm:p-8 md:p-12";

export const trackShell =
  "grid max-w-[40rem] gap-6 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]";
export const trackTimeline =
  "relative grid gap-[1.1rem] pl-5 before:absolute before:bottom-[0.55rem] before:left-[0.18rem] before:top-[0.55rem] before:w-0.5 before:bg-black/10";
export const trackTimelineItem =
  "relative before:absolute before:left-[-1.55rem] before:top-[0.35rem] before:z-[1] before:h-[0.65rem] before:w-[0.65rem] before:rounded-full before:border-2 before:border-white before:bg-black/20";
export const trackTimelineItemActive =
  "relative before:absolute before:left-[-1.55rem] before:top-[0.35rem] before:z-[1] before:h-[0.65rem] before:w-[0.65rem] before:rounded-full before:border-2 before:border-white before:bg-primary";

export const mapPlaceholder =
  "grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/20 bg-[linear-gradient(135deg,var(--color-surface-muted),white),repeating-linear-gradient(-45deg,transparent,transparent_8px,rgb(211_2_3/0.04)_8px,rgb(211_2_3/0.04)_16px)] p-6 text-center text-ink-muted";

export const legalContent =
  "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:uppercase [&_li]:text-black/60 [&_p]:text-black/60";
