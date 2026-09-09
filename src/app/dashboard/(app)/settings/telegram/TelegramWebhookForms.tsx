"use client";

import { useActionState } from "react";
import type { TelegramActionState } from "./actions";
import {
  deleteTelegramWebhookAction,
  refreshTelegramWebhookAction,
  sendTelegramTestAction,
  setTelegramWebhookAction,
} from "./actions";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
  dashSectionTitle,
} from "@/styles/dashboard";

function ActionResult({ state }: { state: TelegramActionState | null }) {
  if (!state) return null;
  if (state.error) {
    return (
      <p className="m-0 rounded-xl bg-primary-soft px-3 py-2.5 text-sm text-primary">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="m-0 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
        {state.message}
      </p>
    );
  }
  return null;
}

export function TelegramWebhookForms({
  defaultWebhookUrl,
  isOwner,
}: {
  defaultWebhookUrl: string;
  isOwner: boolean;
}) {
  const [setState, setAction, setPending] = useActionState(
    setTelegramWebhookAction,
    null,
  );
  const [delState, delAction, delPending] = useActionState(
    deleteTelegramWebhookAction,
    null,
  );
  const [refreshState, refreshAction, refreshPending] = useActionState(
    refreshTelegramWebhookAction,
    null,
  );
  const [testState, testAction, testPending] = useActionState(
    sendTelegramTestAction,
    null,
  );

  const busy = setPending || delPending || refreshPending || testPending;

  return (
    <div className="grid max-w-3xl gap-4">
      <ActionResult state={setState} />
      <ActionResult state={delState} />
      <ActionResult state={refreshState} />
      <ActionResult state={testState} />

      {isOwner ? (
        <form action={setAction} className={`${dashCardPad} grid gap-3`}>
          <h2 className={dashSectionTitle}>Установить webhook</h2>
          <p className="m-0 text-sm text-black/45">
            URL должен быть публичным HTTPS. Локальный localhost Telegram не
            примет. Только owner.
          </p>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            Webhook URL
            <input
              name="webhook_url"
              defaultValue={defaultWebhookUrl}
              disabled={busy}
              className={`${dashInput} font-normal normal-case`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-normal normal-case text-black/65">
            <input
              name="drop_pending"
              type="checkbox"
              defaultChecked
              disabled={busy}
              className="size-4 rounded border-black/20"
            />
            Сбросить pending updates
          </label>
          <button
            type="submit"
            disabled={busy}
            className={`${dashBtnPrimary} w-fit disabled:opacity-60`}
          >
            {setPending ? "Установка…" : "Set webhook"}
          </button>
        </form>
      ) : (
        <p className={`${dashCardPad} text-sm text-black/55`}>
          Установка и удаление webhook доступны только owner. Вы можете
          обновить статус и отправить тест.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={refreshAction}>
          <button
            type="submit"
            disabled={busy}
            className={`${dashBtnSecondary} disabled:opacity-60`}
          >
            {refreshPending ? "…" : "Обновить статус"}
          </button>
        </form>
        <form action={testAction}>
          <button
            type="submit"
            disabled={busy}
            className={`${dashBtnSecondary} disabled:opacity-60`}
          >
            {testPending ? "…" : "Тест в TELEGRAM_CHAT_ID"}
          </button>
        </form>
        {isOwner ? (
          <form action={delAction}>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black/55 transition hover:bg-black/[0.03] disabled:opacity-60"
            >
              {delPending ? "…" : "Удалить webhook"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
