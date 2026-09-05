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

/** Home hero — title + map; white action island bridges into needs below. */
export const homeHero =
  "relative isolate overflow-visible bg-white";

export const homeHeroGrid =
  "relative grid items-start gap-4 py-6 pb-16 max-lg:grid-cols-1 sm:gap-5 sm:py-8 sm:pb-20 md:py-10 md:pb-20 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:pb-14 lg:pt-10 xl:pb-16";

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

/** Absolute bridge on the needs section top edge (−50% = half white / half red). */
export const homeActionBar =
  "pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-1/2";

export const homeActionBridge =
  "pointer-events-auto";

export const homeActionIsland =
  "flex flex-col gap-5 rounded-3xl border border-black/20 bg-white p-5 shadow-[0_12px_40px_rgb(15_18_24/0.1)] sm:gap-6 sm:p-6 lg:flex-row lg:items-stretch lg:gap-0 lg:p-5 xl:px-6 xl:py-5";

export const homeActionPane =
  "flex min-w-0 flex-1 flex-col justify-center gap-2.5 lg:gap-3 lg:px-5 first:lg:pl-0 last:lg:pr-0";

export const homeActionLabel =
  "m-0 font-display text-base font-semibold uppercase leading-tight tracking-[-0.02em] text-black sm:text-lg lg:text-[1.05rem] xl:text-lg";

export const homeActionRow =
  "flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 lg:flex-nowrap";

export const homeActionField =
  "min-h-12 min-w-0 flex-1 rounded-xl border border-black/20 bg-white px-3.5 py-3 text-base text-ink outline-none placeholder:text-black/40 focus:border-primary focus:ring-2 focus:ring-primary/20";

export const homeActionSwap =
  "inline-flex size-6 shrink-0 items-center justify-center self-center text-black transition-opacity hover:opacity-70";

export const homeActionDivider =
  "h-px w-full shrink-0 bg-black/10 lg:mx-0 lg:h-auto lg:w-px lg:self-stretch";

export const homeActionNote =
  "m-0 text-sm leading-snug text-black/60 lg:hidden";

export const homeActionBtn =
  "!min-h-12 shrink-0 !px-5 !py-3 text-sm sm:!px-6";

export const homeNeedsSection =
  "relative bg-gradient-to-b from-primary to-primary-hover pb-10 pt-28 sm:pb-12 sm:pt-32 md:pb-[var(--section-y)] lg:pt-[5.5rem]";
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
  "grid max-w-[40rem] gap-5 rounded-3xl border border-black/20 bg-white p-5 sm:gap-6 sm:p-6";
export const trackForm =
  "grid gap-2";
export const trackFormRow =
  "grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch sm:gap-3";
export const trackResultTitle =
  "m-0 font-display text-lg font-semibold uppercase leading-tight tracking-[-0.02em] text-black sm:text-xl";
export const trackResultNumber =
  "m-0 mt-1 text-sm text-ink-muted";
export const trackTimeline =
  "relative m-0 mt-5 flex list-none flex-col p-0";
export const trackTimelineItem =
  "relative grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-3.5 pb-5 last:pb-0";
export const trackTimelineRail =
  "relative flex justify-center";
export const trackTimelineDot =
  "relative z-[1] mt-1.5 size-3 shrink-0 rounded-full border-2 border-white bg-black/25 shadow-[0_0_0_1px_rgb(0_0_0/0.06)]";
export const trackTimelineDotActive =
  "relative z-[1] mt-1.5 size-3 shrink-0 rounded-full border-2 border-white bg-primary shadow-[0_0_0_1px_rgb(211_2_3/0.2)]";
export const trackTimelineLine =
  "absolute bottom-[-1.25rem] left-1/2 top-[1.15rem] w-0.5 -translate-x-1/2 bg-black/10";
export const trackTimelineBody =
  "min-w-0 pt-0.5";
export const trackTimelineLabel =
  "m-0 text-[0.95rem] font-semibold leading-snug text-ink";
export const trackTimelineMeta =
  "m-0 mt-1 text-sm leading-snug text-ink-muted";
export const trackTimelineNote =
  "m-0 mt-1.5 text-sm leading-snug text-black/55";

export const mapPlaceholder =
  "grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/20 bg-[linear-gradient(135deg,var(--color-surface-muted),white),repeating-linear-gradient(-45deg,transparent,transparent_8px,rgb(211_2_3/0.04)_8px,rgb(211_2_3/0.04)_16px)] p-6 text-center text-ink-muted";

export const legalContent =
  "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:uppercase [&_li]:text-black/60 [&_p]:text-black/60";
