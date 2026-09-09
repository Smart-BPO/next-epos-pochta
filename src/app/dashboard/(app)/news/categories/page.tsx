import Link from "next/link";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsCategories } from "@/lib/cms/news-categories";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  DashFormField,
  DashPageHeader,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/components/dashboard/ui";
import {
  deleteNewsCategoryAction,
  saveNewsCategoryAction,
} from "./actions";

export default async function NewsCategoriesPage() {
  const admin = await requireAccess("news");
  if (!admin) {
    return (
      <DashAccessDenied title="Категории новостей" lead="Нет доступа." />
    );
  }

  const rows = await listNewsCategories({ includeInactive: true });
  const canWrite = canMutate(admin.role, "news");

  return (
    <div className="space-y-5">
      <DashPageHeader
        title="Категории новостей"
        lead="Таксономия для фильтров и редактора. Seed: company / product / business / geography."
        actions={
          <Link href="/dashboard/news/" className={dashBtnSecondary}>
            ← Статьи
          </Link>
        }
      />

      {canWrite ? (
        <form
          action={saveNewsCategoryAction}
          className={`${dashCardPad} grid max-w-lg gap-3`}
        >
          <p className="m-0 text-sm font-semibold text-ink">Добавить / обновить</p>
          <DashFormField label="ID (slug)">
            <input name="id" required placeholder="company" className={dashInput} />
          </DashFormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <DashFormField label="Label UZ">
              <input name="label_uz" className={dashInput} />
            </DashFormField>
            <DashFormField label="Label RU">
              <input name="label_ru" className={dashInput} />
            </DashFormField>
          </div>
          <DashFormField label="Sort">
            <input
              name="sort_order"
              type="number"
              defaultValue={50}
              className={dashInput}
            />
          </DashFormField>
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
            Сохранить
          </button>
        </form>
      ) : null}

      <ul className="grid gap-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`${dashCardPad} flex flex-wrap items-center justify-between gap-3 !py-3`}
          >
            <div className="min-w-0">
              <p className="m-0 font-mono text-sm font-semibold text-ink">
                {row.id}
              </p>
              <p className="m-0 mt-0.5 text-xs text-black/50">
                {row.labelUz} · {row.labelRu} · sort {row.sortOrder}
                {!row.isActive ? " · inactive" : ""}
              </p>
            </div>
            {canWrite ? (
              <div className="flex flex-wrap gap-2">
                <form action={saveNewsCategoryAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    type="hidden"
                    name="label_uz"
                    value={row.labelUz}
                  />
                  <input
                    type="hidden"
                    name="label_ru"
                    value={row.labelRu}
                  />
                  <input
                    type="hidden"
                    name="sort_order"
                    value={row.sortOrder}
                  />
                  {!row.isActive ? (
                    <input type="hidden" name="is_active" value="on" />
                  ) : null}
                  <button type="submit" className={`${dashBtnSecondary} text-xs`}>
                    {row.isActive ? "Выкл." : "Вкл."}
                  </button>
                </form>
                <form action={deleteNewsCategoryAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className={`${dashBtnSecondary} text-xs`}>
                    Удалить
                  </button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
