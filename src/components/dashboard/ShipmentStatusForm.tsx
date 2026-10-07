"use client";

import { useState, useTransition } from "react";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { FcargoStatusChip } from "@/components/dashboard/FcargoStatusChip";
import { dashBtnSecondary } from "@/styles/dashboard";

export function ShipmentStatusForm({
  id,
  trackNumber,
  fcargoStatus,
  fcargoUpdatedAt,
  attachAction,
  refreshAction,
  disabled = false,
}: {
  id: string;
  trackNumber: string;
  fcargoStatus?: string | null;
  fcargoUpdatedAt?: string | null;
  attachAction: (formData: FormData) => Promise<void>;
  refreshAction: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  const t = useDashT();
  const [pending, startTransition] = useTransition();
  const [track, setTrack] = useState("");
  const [error, setError] = useState("");

  if (trackNumber) {
    return (
      <div className="flex flex-col gap-1.5">
        <FcargoStatusChip
          code={fcargoStatus}
          updatedAt={fcargoUpdatedAt}
          trackingNumber={trackNumber}
        />
        {!disabled ? (
          <form
            action={(fd) => {
              startTransition(async () => {
                await refreshAction(fd);
              });
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              disabled={pending}
              className={`${dashBtnSecondary} py-1.5 text-xs`}
            >
              {pending ? t.common.saving : "Обновить из FCargo"}
            </button>
          </form>
        ) : null}
      </div>
    );
  }

  if (disabled) {
    return <span className="text-xs text-black/40">нет трека</span>;
  }

  return (
    <form
      className="flex min-w-[10rem] flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData();
        fd.set("id", id);
        fd.set("track_number", track.trim());
        startTransition(async () => {
          try {
            await attachAction(fd);
            setTrack("");
          } catch {
            setError(t.shipments.saveFailed);
          }
        });
      }}
    >
      <input
        value={track}
        onChange={(e) => setTrack(e.target.value)}
        placeholder={t.shipments.trackPlaceholder}
        className="w-full rounded-lg border border-black/10 px-2 py-1.5 font-mono text-xs"
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending || !track.trim()}
        className={`${dashBtnSecondary} py-1.5 text-xs`}
      >
        {pending ? t.common.saving : "Привязать трек FCargo"}
      </button>
      {error ? <p className="m-0 text-[0.65rem] text-red-600">{error}</p> : null}
    </form>
  );
}
