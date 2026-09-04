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

/** Home hero — Figma: mobile stacked (copy → CTAs → map); desktop copy + map/tracker. */
export const homeHero =
  "relative isolate overflow-hidden bg-white max-lg:min-h-0 lg:min-h-[min(100dvh-var(--header-height),52rem)]";

export const homeHeroGrid =
  "relative grid items-start gap-6 py-6 max-lg:grid-cols-1 md:gap-8 md:py-8 lg:min-h-[min(100dvh-var(--header-height),52rem)] lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:py-12";

export const homeHeroCopy =
  "relative z-10 flex max-w-[32rem] flex-col items-stretch gap-5 lg:items-start lg:gap-9";

export const homeHeroTitle =
  "m-0 animate-hero-rise font-display text-[clamp(1.75rem,4.2vw,3rem)] font-black uppercase leading-[1.05] tracking-[-0.02em] text-black max-lg:text-[2rem]";

export const homeHeroLead =
  "m-0 animate-hero-rise text-[clamp(1.05rem,2vw,1.5rem)] leading-normal text-black [animation-delay:80ms]";

export const homeHeroNote =
  "m-0 animate-hero-rise text-base text-black/60 [animation-delay:140ms]";

export const homeHeroActions =
  "flex w-full flex-col gap-3 animate-hero-rise [animation-delay:180ms] sm:flex-row sm:flex-wrap lg:w-auto";

export const homeHeroVisual =
  "relative z-0 order-last w-full min-h-[12.5rem] sm:min-h-[16rem] lg:order-none lg:min-h-[28rem] lg:justify-self-end";

export const homeHeroMap =
  "pointer-events-none relative mx-auto block h-auto w-full max-w-[22rem] select-none object-contain opacity-90 sm:max-w-[28rem] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:h-full lg:w-[min(110%,46rem)] lg:max-w-none lg:object-right lg:opacity-100";

export const homeHeroTracker =
  "relative z-10 hidden w-full max-w-[29.5rem] rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] lg:absolute lg:bottom-8 lg:right-0 lg:ml-auto lg:mt-0 lg:block";

export const homeTrackCard =
  "rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] lg:hidden";

export const homeQuoteCard =
  "rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]";

export const homeQuoteRow =
  "flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3";

export const homeQuoteField =
  "min-h-[var(--tap-min)] min-w-0 flex-1 rounded-xl border border-black/20 bg-white px-4 py-4 text-base placeholder:text-black/40";

export const homeQuoteSelect =
  `${homeQuoteField} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`;

export const homeHeroTrackerTitle =
  "m-0 mb-4 font-display text-xl font-semibold uppercase leading-normal text-black sm:text-2xl";

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
export const formStepPill =
  "min-w-0 flex-1 rounded-[0.55rem] bg-surface-muted px-[0.55rem] py-[0.55rem] text-center text-[0.85rem] font-semibold text-ink-muted transition-[background,color,transform] duration-[160ms]";
export const formStepActive = "translate-y-[-1px] bg-primary text-white";
export const formStepDone = "bg-primary-soft text-primary";

export const field = "mb-4 grid gap-1.5";
export const fieldLabel = "text-[0.92rem] font-semibold text-ink";
export const fieldHint = "text-[0.85rem] text-ink-muted";
export const fieldError = "text-[0.85rem] text-danger";
export const fieldControl =
  "min-h-[var(--tap-min)] rounded-xl border border-black/20 bg-white px-4 py-4 text-base";
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
  "relative overflow-hidden rounded-3xl border border-black/20 bg-black p-6 text-white sm:p-8 md:p-12";

export const trackShell =
  "grid max-w-[40rem] gap-6 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]";
export const trackTimeline =
  "grid gap-[1.1rem] border-l-2 border-black/10 pl-5";
export const trackTimelineMuted = `${trackTimeline} pointer-events-none opacity-55`;
export const trackTimelineItem =
  "relative before:absolute before:left-[-1.55rem] before:top-[0.35rem] before:h-[0.65rem] before:w-[0.65rem] before:rounded-full before:border-2 before:border-white before:bg-black/20";
export const trackTimelineItemActive =
  "relative before:absolute before:left-[-1.55rem] before:top-[0.35rem] before:h-[0.65rem] before:w-[0.65rem] before:rounded-full before:border-2 before:border-white before:bg-primary";

export const mapPlaceholder =
  "grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/20 bg-[linear-gradient(135deg,var(--color-surface-muted),white),repeating-linear-gradient(-45deg,transparent,transparent_8px,rgb(211_2_3/0.04)_8px,rgb(211_2_3/0.04)_16px)] p-6 text-center text-ink-muted";

export const legalContent =
  "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:uppercase [&_li]:text-black/60 [&_p]:text-black/60";
