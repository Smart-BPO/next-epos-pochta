"use client";

import { useEffect, useState } from "react";
import { ContactGate } from "@/components/webapp/ContactGate";
import { ShipmentForm } from "@/components/webapp/ShipmentForm";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { useWebAppNav } from "@/components/webapp/WebAppNav";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import type { WebAppContactSession } from "@/lib/webapp/session";
import { Button } from "@/components/atoms/Button";

export function ShipTab({
  contact,
  onContactLinked,
}: {
  contact: WebAppContactSession | null;
  onContactLinked: (session: WebAppContactSession) => void;
  onContactCleared?: () => void;
}) {
  const { locale } = useTelegram();
  const { setTab, setHighlightShipmentId, draft, setDraft } = useWebAppNav();
  const copy = getWebAppCopy(locale);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState(false);

  useEffect(() => {
    setSuccessId(null);
  }, [draft]);

  const showContactGate = !contact || editingContact;
  useTelegramBackButton(
    Boolean(editingContact && contact),
    () => setEditingContact(false),
  );

  if (showContactGate) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
        {!contact ? (
          <p className="m-0 mb-4 text-sm text-black/55">{copy.contactRequired}</p>
        ) : null}
        <ContactGate
          onLinked={(session) => {
            onContactLinked(session);
            setEditingContact(false);
          }}
        />
      </div>
    );
  }

  if (successId) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
        <p className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.successTitle}
        </p>
        <p className="m-0 mt-3 text-sm leading-relaxed text-black/60">
          {copy.successText}{" "}
          <strong className="text-black">{successId}</strong>
        </p>
        <p className="m-0 mt-2 text-xs text-black/45">{copy.disclaimer}</p>
        <Button
          type="button"
          variant="primary"
          width="full"
          className="mt-6"
          onClick={() => {
            setHighlightShipmentId(successId);
            setSuccessId(null);
            setDraft(null);
            setTab("track");
          }}
        >
          {copy.tabTrack}
        </Button>
        <Button
          type="button"
          variant="secondary"
          width="full"
          className="mt-2"
          onClick={() => {
            setSuccessId(null);
            setDraft(null);
          }}
        >
          {copy.newShipment}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
      <ShipmentForm
        contact={contact}
        initialDraft={draft}
        onSuccess={(id) => {
          setSuccessId(id);
          setDraft(null);
        }}
        onChangeContact={() => setEditingContact(true)}
      />
    </div>
  );
}
