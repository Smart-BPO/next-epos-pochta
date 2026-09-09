"use client";

import { useState } from "react";
import { ContactGate } from "@/components/webapp/ContactGate";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import type { WebAppContactSession } from "@/lib/webapp/session";
import { Button } from "@/components/atoms/Button";
import { SITE_CONFIG } from "@/utils/consts";

export function ProfileTab({
  contact,
  onContactLinked,
}: {
  contact: WebAppContactSession | null;
  onContactLinked: (session: WebAppContactSession) => void;
  onContactCleared?: () => void;
}) {
  const { locale, setLocale, user, webApp } = useTelegram();
  const copy = getWebAppCopy(locale);
  const [editing, setEditing] = useState(false);

  useTelegramBackButton(Boolean(editing && contact), () => setEditing(false));

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    contact?.firstName ||
    "—";

  if (editing || !contact) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
        <ContactGate
          onLinked={(session) => {
            onContactLinked(session);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.profileTitle}
        </h1>
        <p className="m-0 mt-1 text-sm text-black/55">{copy.profileLead}</p>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-sm font-bold text-white">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-semibold text-ink">{displayName}</p>
            {user?.username ? (
              <p className="m-0 text-sm text-black/45">@{user.username}</p>
            ) : null}
          </div>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-2 border-t border-black/[0.06] pt-2">
            <dt className="text-black/45">{copy.phoneLabel}</dt>
            <dd className="m-0 font-medium">{contact.phone}</dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-black/[0.06] pt-2">
            <dt className="text-black/45">{copy.profileLang}</dt>
            <dd className="m-0 flex gap-1">
              <button
                type="button"
                className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${locale === "uz" ? "bg-primary text-white" : "bg-black/[0.05] text-black/50"}`}
                onClick={() => setLocale("uz")}
              >
                UZ
              </button>
              <button
                type="button"
                className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${locale === "ru" ? "bg-primary text-white" : "bg-black/[0.05] text-black/50"}`}
                onClick={() => setLocale("ru")}
              >
                RU
              </button>
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="secondary"
          width="full"
          className="mt-4"
          onClick={() => setEditing(true)}
        >
          {copy.changeContact}
        </Button>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-4">
        <p className="m-0 text-sm text-black/55">{copy.profileAbout}</p>
        <Button
          type="button"
          variant="telegram"
          width="full"
          className="mt-4"
          onClick={() => {
            const url = SITE_CONFIG.telegramUrl;
            if (webApp?.openTelegramLink) webApp.openTelegramLink(url);
            else window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          {copy.profileSupport}
        </Button>
      </div>
    </section>
  );
}
