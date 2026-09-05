import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  seedDeliveryHubsAction,
  updateDeliveryHubAction,
} from "./actions";

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
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-display text-2xl font-bold">Хабы доставки</h1>
          <p className="mt-1 text-sm text-black/50">
            SEO-тексты хабов. Публичные маршруты пока из TS seed; CMS — редактор
            copy.
          </p>
        </div>
        <form action={seedDeliveryHubsAction}>
          <button type="submit" className="btn btn-secondary">
            Seed из delivery-cities.ts
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-black/40">
          Таблица пуста — нажмите Seed.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {rows.map((row) => (
            <li
              key={row.code}
              className="rounded-xl border border-black/8 bg-white p-4"
            >
              <form action={updateDeliveryHubAction} className="grid gap-2">
                <input type="hidden" name="code" value={row.code} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 font-display text-lg font-bold">
                    {row.name_ru}{" "}
                    <span className="font-mono text-xs font-normal text-black/40">
                      {row.code}
                    </span>
                  </p>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={row.is_active}
                    />
                    active
                  </label>
                </div>
                <textarea
                  name="lead_ru"
                  rows={2}
                  defaultValue={row.lead_ru}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                  placeholder="Lead RU"
                />
                <textarea
                  name="lead_uz"
                  rows={2}
                  defaultValue={row.lead_uz}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                  placeholder="Lead UZ"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    name="eta_hint_ru"
                    defaultValue={row.eta_hint_ru}
                    className="rounded border border-black/12 px-2 py-1 text-sm"
                    placeholder="ETA RU"
                  />
                  <input
                    name="eta_hint_uz"
                    defaultValue={row.eta_hint_uz}
                    className="rounded border border-black/12 px-2 py-1 text-sm"
                    placeholder="ETA UZ"
                  />
                </div>
                <input
                  name="meta_title_ru"
                  defaultValue={row.meta_title_ru}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                  placeholder="Meta title RU"
                />
                <input
                  name="meta_title_uz"
                  defaultValue={row.meta_title_uz}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                  placeholder="Meta title UZ"
                />
                <textarea
                  name="meta_description_ru"
                  rows={2}
                  defaultValue={row.meta_description_ru}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                />
                <textarea
                  name="meta_description_uz"
                  rows={2}
                  defaultValue={row.meta_description_uz}
                  className="rounded border border-black/12 px-2 py-1 text-sm"
                />
                <button type="submit" className="btn btn-primary w-fit text-sm">
                  Сохранить
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
