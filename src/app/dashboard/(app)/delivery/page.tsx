import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  seedDeliveryHubsAction,
  updateDeliveryHubAction,
} from "./actions";
import {
  DashEmptyState,
  DashFormField,
  DashPageHeader,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/components/dashboard/ui";

export default async function DashboardDeliveryPage() {
  type Row = {
    code: string;
    slug: string;
    name_ru: string;
    name_uz: string;
    lead_ru: string;
    lead_uz: string;
    eta_hint_ru: string;
    eta_hint_uz: string;
    meta_title_ru: string;
    meta_title_uz: string;
    meta_description_ru: string;
    meta_description_uz: string;
    is_active: boolean;
  };

  let rows: Row[] = [];
  if (hasSupabaseAdminConfig()) {
    const client = createSupabaseAdminClient();
    const { data } = await client
      .from("epos_delivery_hubs")
      .select(
        "code, slug, name_ru, name_uz, lead_ru, lead_uz, eta_hint_ru, eta_hint_uz, meta_title_ru, meta_title_uz, meta_description_ru, meta_description_uz, is_active",
      )
      .order("code");
    rows = (data ?? []) as Row[];
  }

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Хабы доставки"
        lead="SEO-тексты хабов. Публичные маршруты пока из TS seed; CMS — редактор copy."
        actions={
          <form action={seedDeliveryHubsAction}>
            <button type="submit" className={dashBtnSecondary}>
              Seed из delivery-cities.ts
            </button>
          </form>
        }
      />

      {rows.length === 0 ? (
        <DashEmptyState
          title="Таблица пуста"
          lead="Нажмите Seed, чтобы заполнить хабы из кода."
          action={
            <form action={seedDeliveryHubsAction}>
              <button type="submit" className={dashBtnPrimary}>
                Seed сейчас
              </button>
            </form>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((row) => (
            <li key={row.code} className={dashCardPad}>
              <form action={updateDeliveryHubAction} className="grid gap-3">
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
                    />
                    Active
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashFormField label="Lead RU">
                    <textarea
                      name="lead_ru"
                      rows={2}
                      defaultValue={row.lead_ru}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="Lead UZ">
                    <textarea
                      name="lead_uz"
                      rows={2}
                      defaultValue={row.lead_uz}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="ETA RU">
                    <input
                      name="eta_hint_ru"
                      defaultValue={row.eta_hint_ru}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="ETA UZ">
                    <input
                      name="eta_hint_uz"
                      defaultValue={row.eta_hint_uz}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="Meta title RU">
                    <input
                      name="meta_title_ru"
                      defaultValue={row.meta_title_ru}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="Meta title UZ">
                    <input
                      name="meta_title_uz"
                      defaultValue={row.meta_title_uz}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="Meta description RU">
                    <textarea
                      name="meta_description_ru"
                      rows={2}
                      defaultValue={row.meta_description_ru}
                      className={dashInput}
                    />
                  </DashFormField>
                  <DashFormField label="Meta description UZ">
                    <textarea
                      name="meta_description_uz"
                      rows={2}
                      defaultValue={row.meta_description_uz}
                      className={dashInput}
                    />
                  </DashFormField>
                </div>
                <button type="submit" className={`${dashBtnPrimary} w-fit`}>
                  Сохранить
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 text-sm text-black/40">
        <Link href="/dashboard/" className="font-semibold text-primary hover:underline">
          ← Обзор
        </Link>
      </p>
    </div>
  );
}
