"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/styles/dashboard";
import {
  publishDraftAction,
  restoreRevisionAction,
  saveManualRevisionAction,
  savePricingAction,
} from "@/app/dashboard/(app)/pricing/actions";
import type { PricingConfig } from "@/lib/pricing/types";

type RevisionRow = {
  id: number;
  created_at: string;
  label: string;
  kind: string;
  snapshot?: {
    routes?: unknown[];
    formulaVersion?: string;
  };
};

export function PricingRevisionsPanel({
  revisions,
  draftEnabled,
  draftConfig,
  canWrite,
}: {
  revisions: RevisionRow[];
  draftEnabled: boolean;
  draftConfig: PricingConfig;
  canWrite: boolean;
}) {
  const t = useDashT();
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();

  const snapshot = () => {
    startTransition(async () => {
      try {
        await saveManualRevisionAction(label);
        toast.success("Снимок сохранён");
        window.location.reload();
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const saveDraft = () => {
    startTransition(async () => {
      try {
        await savePricingAction({
          enabled: draftEnabled,
          config: draftConfig,
          target: "draft",
        });
        toast.success("Draft сохранён");
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const publish = () => {
    if (!confirm("Опубликовать draft в live?")) return;
    startTransition(async () => {
      try {
        await publishDraftAction();
        toast.success("Опубликовано");
        window.location.reload();
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const restore = (id: number) => {
    if (!confirm("Восстановить снимок в draft (и матрицу)?")) return;
    startTransition(async () => {
      try {
        await restoreRevisionAction(id);
        toast.success("Восстановлено");
        window.location.reload();
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  return (
    <div className="space-y-5">
      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          Draft / Live
        </h2>
        <p className="m-0 text-sm text-black/50">
          Live = id 1 (публичный API). Draft = id 2. Publish копирует draft →
          live.
        </p>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={pending}
              onClick={saveDraft}
            >
              Сохранить текущие зоны в draft
            </button>
            <button
              type="button"
              className={dashBtnPrimary}
              disabled={pending}
              onClick={publish}
            >
              Publish draft → live
            </button>
          </div>
        ) : null}
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">Ревизии</h2>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <input
              className={`${dashInput} max-w-xs font-normal normal-case`}
              placeholder="Подпись снимка"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={pending}
              onClick={snapshot}
            >
              Снимок сейчас
            </button>
          </div>
        ) : null}
        {revisions.length === 0 ? (
          <p className="m-0 text-sm text-black/45">Пока нет снимков.</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {revisions.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/8 px-3 py-2 text-sm"
              >
                <div>
                  <p className="m-0 font-medium text-ink">
                    #{r.id} · {r.kind}
                    {r.label ? ` · ${r.label}` : ""}
                  </p>
                  <p className="m-0 text-xs text-black/40">
                    {new Date(r.created_at).toLocaleString("ru-RU")}
                    {r.snapshot?.formulaVersion
                      ? ` · ${r.snapshot.formulaVersion}`
                      : ""}
                    {Array.isArray(r.snapshot?.routes)
                      ? ` · routes ${r.snapshot.routes.length}`
                      : ""}
                  </p>
                </div>
                {canWrite ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary"
                    disabled={pending}
                    onClick={() => restore(r.id)}
                  >
                    Restore → draft
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
