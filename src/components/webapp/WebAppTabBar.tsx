"use client";

import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import {
  useWebAppNav,
  type WebAppTabId,
} from "@/components/webapp/WebAppNav";
import { cn } from "@/lib/cn";

function IconCalc({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShip({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16.5 12 20l8-3.5V9L12 5.5 4 9v7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M12 5.5V20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrack({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="9"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS: Array<{
  id: WebAppTabId;
  Icon: (p: { active: boolean }) => React.ReactNode;
  labelKey: "tabCalc" | "tabShip" | "tabTrack" | "tabProfile";
}> = [
  { id: "calc", Icon: IconCalc, labelKey: "tabCalc" },
  { id: "ship", Icon: IconShip, labelKey: "tabShip" },
  { id: "track", Icon: IconTrack, labelKey: "tabTrack" },
  { id: "profile", Icon: IconProfile, labelKey: "tabProfile" },
];

export function WebAppTabBar() {
  const { locale, webApp } = useTelegram();
  const { tab, setTab } = useWebAppNav();
  const copy = getWebAppCopy(locale);

  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-black/8 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="Tabs"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1 pt-1">
        {TABS.map(({ id, Icon, labelKey }) => {
          const active = tab === id;
          return (
            <li key={id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  setTab(id);
                  webApp?.HapticFeedback?.impactOccurred("light");
                }}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[0.65rem] font-semibold transition-colors",
                  active ? "text-primary" : "text-black/40",
                )}
              >
                <Icon active={active} />
                <span className="truncate">{copy[labelKey]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
