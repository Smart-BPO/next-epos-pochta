"use client";

import { useCallback, useEffect, useState } from "react";
import { WebAppAccessBlocked } from "@/components/webapp/WebAppAccessBlocked";
import { WebAppShell } from "@/components/webapp/WebAppShell";
import {
  WebAppNavProvider,
  parseWebAppTab,
  useWebAppNav,
} from "@/components/webapp/WebAppNav";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { CalcTab } from "@/views/webapp/tabs/CalcTab";
import { ShipTab } from "@/views/webapp/tabs/ShipTab";
import { TrackTab } from "@/views/webapp/tabs/TrackTab";
import { ProfileTab } from "@/views/webapp/tabs/ProfileTab";
import {
  readContactSession,
  writeContactSession,
  type WebAppContactSession,
} from "@/lib/webapp/session";
import type { Locale } from "@/i18n/config";

function sessionFromApi(
  raw: WebAppContactSession & { locale?: string },
): WebAppContactSession {
  return {
    sessionId: raw.sessionId,
    phone: raw.phone,
    firstName: raw.firstName,
    lastName: raw.lastName,
    telegramUserId: raw.telegramUserId,
    telegramUsername: raw.telegramUsername,
    linkedAt: raw.linkedAt,
    source: raw.source,
  };
}

function WebAppTabs({
  contact,
  onContactLinked,
}: {
  contact: WebAppContactSession | null;
  onContactLinked: (session: WebAppContactSession) => void;
}) {
  const { tab } = useWebAppNav();

  return (
    <WebAppShell>
      {tab === "calc" ? <CalcTab /> : null}
      {tab === "ship" ? (
        <ShipTab contact={contact} onContactLinked={onContactLinked} />
      ) : null}
      {tab === "track" ? <TrackTab /> : null}
      {tab === "profile" ? (
        <ProfileTab contact={contact} onContactLinked={onContactLinked} />
      ) : null}
    </WebAppShell>
  );
}

export function WebAppView() {
  const { ready, isTelegram, initData, setLocale } = useTelegram();
  const [phase, setPhase] = useState<"boot" | "ready">("boot");
  const [contact, setContact] = useState<WebAppContactSession | null>(null);
  const [initialTab] = useState(() => {
    if (typeof window === "undefined") return parseWebAppTab(null);
    return parseWebAppTab(
      new URLSearchParams(window.location.search).get("tab"),
    );
  });

  const applyRemoteSession = useCallback(
    async (opts?: { skipIfLocal?: boolean }) => {
      if (!initData) return null;

      if (opts?.skipIfLocal) {
        const existing = readContactSession();
        if (existing) return existing;
      }

      const res = await fetch("/api/webapp/session/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const json = (await res.json()) as {
        found?: boolean;
        session?: WebAppContactSession & { locale?: string };
      };
      if (!json.found || !json.session?.sessionId || !json.session.phone) {
        return null;
      }

      const session = sessionFromApi(json.session);
      writeContactSession(session);
      if (json.session.locale === "ru" || json.session.locale === "uz") {
        setLocale(json.session.locale as Locale);
      }
      return session;
    },
    [initData, setLocale],
  );

  useEffect(() => {
    if (!ready) return;
    if (!isTelegram || !initData) {
      setPhase("ready");
      return;
    }

    let cancelled = false;

    const boot = async () => {
      const local = readContactSession();
      if (local) {
        if (!cancelled) {
          setContact(local);
          setPhase("ready");
        }
        return;
      }

      try {
        const session = await applyRemoteSession();
        if (!cancelled && session) setContact(session);
      } catch {
        // ContactGate inside tabs if needed
      }

      if (!cancelled) setPhase("ready");
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [ready, isTelegram, initData, applyRemoteSession]);

  // Race: Mini App opened before bot contact commit — re-fetch on focus.
  useEffect(() => {
    if (!ready || !isTelegram || !initData || phase !== "ready") return;
    if (contact) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const session = await applyRemoteSession();
        if (!cancelled && session) setContact(session);
      } catch {
        // stay on ContactGate
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, isTelegram, initData, phase, contact, applyRemoteSession]);

  if (!ready || phase === "boot") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-4">
        <p className="m-0 text-sm text-black/45">…</p>
      </div>
    );
  }

  if (!isTelegram || !initData) {
    return <WebAppAccessBlocked />;
  }

  return (
    <WebAppNavProvider initialTab={initialTab}>
      <WebAppTabs
        contact={contact}
        onContactLinked={(session) => setContact(session)}
      />
    </WebAppNavProvider>
  );
}
