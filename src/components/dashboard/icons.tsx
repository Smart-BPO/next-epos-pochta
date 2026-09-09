import { cn } from "@/lib/cn";

type IconProps = { className?: string };

function base({ className }: IconProps) {
  return cn("size-[1.125rem] shrink-0", className);
}

export function IconOverview(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLeads(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M8 7h11M8 12h11M8 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 7h.01M5 12h.01M5 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 19v-1a3.5 3.5 0 0 0-2.5-3.35M15.5 5.2a3 3 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12 4.2 7.5M12 12l7.8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconNews(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconTelegram(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M20.5 4.5 3.8 11.2c-.7.3-.7 1.3 0 1.5l4.1 1.3 1.6 4.8c.2.7 1.1.9 1.6.3l2.3-2.5 4.3 3.2c.6.4 1.4.1 1.6-.6L21.4 5.4c.2-.8-.6-1.4-1.3-1.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m9.8 13.9 7.4-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconMedia(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m3.5 15 4.5-3.5L12 15l3-2.5 5.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconStaff(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.5c.8-3.2 3.4-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8l4 4-4 4M18 12H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <circle cx="6.5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="17.5" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <path d="M4 13h4l1.5 2h5L16 13h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 13 6.5 5h11L20 13" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconProgress(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMoney(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(props)} aria-hidden>
      <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9.5h.01M17 14.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
