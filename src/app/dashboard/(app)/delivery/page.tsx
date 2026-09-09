import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listDeliveryHubAdminRows } from "@/lib/cms/delivery-hubs";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  DashEmptyState,
  DashFormField,
  DashPageHeader,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/components/dashboard/ui";
import {
  deleteDeliveryHubAction,
  seedDeliveryHubsAction,
  upsertDeliveryHubAction,
} from "./actions";

function bodyToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.filter((x): x is string => typeof x === "string").join("\n\n");
}

function faqToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const q = (item as { question?: string }).question ?? "";
      const a = (item as { answer?: string }).answer ?? "";
      return `${q}\n${a}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export default async function DashboardDeliveryPage() {
  const admin = await requireAccess("delivery");
  if (!admin) {
    return (
      <DashAccessDenied title="Хабы доставки" lead="Нет доступа к разделу." />
    );
  }

  const rows = await listDeliveryHubAdminRows();
  const canWrite = canMutate(admin.role, "delivery");

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Хабы доставки"
        lead="CMS — источник для публичных /delivery маршрутов (fallback: TS seed)."
        actions={
          canWrite ? (
            <form action={seedDeliveryHubsAction}>
              <button type="submit" className={dashBtnSecondary}>
                Seed из delivery-cities.ts
              </button>
            </form>
          ) : null
        }
      />

      {canWrite ? (
        <form
          action={upsertDeliveryHubAction}
          className={`${dashCardPad} grid max-w-3xl gap-3`}
        >
          <p className="m-0 text-sm font-semibold text-ink">Новый хаб</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <DashFormField label="Code">
              <input name="code" required placeholder="tas" className={dashInput} />
            </DashFormField>
            <DashFormField label="Slug">
              <input
                name="slug"
                required
                placeholder="tashkent"
                className={dashInput}
              />
            </DashFormField>
            <DashFormField label="Settlement id">
              <input name="settlement_id" className={dashInput} />
            </DashFormField>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <DashFormField label="Name EN">
              <input name="name_en" className={dashInput} />
            </DashFormField>
            <DashFormField label="Name RU">
              <input name="name_ru" className={dashInput} />
            </DashFormField>
            <DashFormField label="Name UZ">
              <input name="name_uz" className={dashInput} />
            </DashFormField>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-black/50">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="size-4 rounded border-black/20"
            />
            Active
          </label>
          <button type="submit" className={`${dashBtnPrimary} w-fit`}>
            Создать
          </button>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <DashEmptyState
          title="Таблица пуста"
          lead="Нажмите Seed, чтобы заполнить хабы из кода."
          action={
            canWrite ? (
              <form action={seedDeliveryHubsAction}>
                <button type="submit" className={dashBtnPrimary}>
                  Seed сейчас
                </button>
              </form>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((row) => (
            <li key={row.code} className={dashCardPad}>
              <form action={upsertDeliveryHubAction} className="grid gap-3">
                <input type="hidden" name="code" value={row.code} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 font-display text-lg font-bold">
                    {row.name_ru}{" "}
                    <span className="font-mono text-xs font-normal text-black/40">
                      {row.code}
                    </span>
                  </p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-black/50">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={row.is_active}
                      className="size-4 rounded border-black/20"
                      disabled={!canWrite}
                    />
                    Active
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DashFormField label="Slug">
                    <input
                      name="slug"
                      defaultValue={row.slug}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Settlement id">
                    <input
                      name="settlement_id"
                      defaultValue={row.settlement_id ?? ""}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Name EN">
                    <input
                      name="name_en"
                      defaultValue={row.name_en}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Name RU">
                    <input
                      name="name_ru"
                      defaultValue={row.name_ru}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Name UZ">
                    <input
                      name="name_uz"
                      defaultValue={row.name_uz}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Lead RU">
                    <textarea
                      name="lead_ru"
                      rows={2}
                      defaultValue={row.lead_ru}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Lead UZ">
                    <textarea
                      name="lead_uz"
                      rows={2}
                      defaultValue={row.lead_uz}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="ETA RU">
                    <input
                      name="eta_hint_ru"
                      defaultValue={row.eta_hint_ru}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="ETA UZ">
                    <input
                      name="eta_hint_uz"
                      defaultValue={row.eta_hint_uz}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Body RU (абзацы через пустую строку)">
                    <textarea
                      name="body_ru"
                      rows={4}
                      defaultValue={bodyToText(row.body_ru)}
                      className={`${dashInput} font-mono text-xs`}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Body UZ">
                    <textarea
                      name="body_uz"
                      rows={4}
                      defaultValue={bodyToText(row.body_uz)}
                      className={`${dashInput} font-mono text-xs`}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="FAQ RU (вопрос\\nответ, блоки через пустую строку)">
                    <textarea
                      name="faq_ru"
                      rows={4}
                      defaultValue={faqToText(row.faq_ru)}
                      className={`${dashInput} font-mono text-xs`}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="FAQ UZ">
                    <textarea
                      name="faq_uz"
                      rows={4}
                      defaultValue={faqToText(row.faq_uz)}
                      className={`${dashInput} font-mono text-xs`}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Meta title RU">
                    <input
                      name="meta_title_ru"
                      defaultValue={row.meta_title_ru}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Meta title UZ">
                    <input
                      name="meta_title_uz"
                      defaultValue={row.meta_title_uz}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Meta description RU">
                    <textarea
                      name="meta_description_ru"
                      rows={2}
                      defaultValue={row.meta_description_ru}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                  <DashFormField label="Meta description UZ">
                    <textarea
                      name="meta_description_uz"
                      rows={2}
                      defaultValue={row.meta_description_uz}
                      className={dashInput}
                      disabled={!canWrite}
                    />
                  </DashFormField>
                </div>
                {canWrite ? (
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className={dashBtnPrimary}>
                      Сохранить
                    </button>
                    <button
                      formAction={deleteDeliveryHubAction}
                      type="submit"
                      className={dashBtnSecondary}
                    >
                      Удалить
                    </button>
                  </div>
                ) : null}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
