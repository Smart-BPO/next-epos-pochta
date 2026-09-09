import { NEWS_CATEGORIES } from "@/data/news/types";
import {
  deleteNewsAction,
  saveNewsAction,
} from "@/app/dashboard/(app)/news/actions";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import {
  DashFormField,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCard,
  dashInput,
} from "@/components/dashboard/ui";

type NewsFormValues = {
  id?: string;
  slug: string;
  status: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  titleUz: string;
  excerptUz: string;
  bodyUz: string;
  titleRu: string;
  excerptRu: string;
  bodyRu: string;
};

export function NewsEditorForm({
  values,
  categories = NEWS_CATEGORIES.map((id) => ({ id, label: id })),
}: {
  values: NewsFormValues;
  categories?: Array<{ id: string; label: string }>;
}) {
  return (
    <>
      <form action={saveNewsAction} className="relative grid max-w-3xl gap-4 pb-24">
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

        <DashFormField label="Slug">
          <input
            name="slug"
            required
            defaultValue={values.slug}
            className={dashInput}
          />
        </DashFormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <DashFormField label="Статус">
            <select
              name="status"
              defaultValue={values.status}
              className={dashInput}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
            </select>
          </DashFormField>
          <DashFormField label="Категория">
            <select
              name="category"
              defaultValue={values.category}
              className={dashInput}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </DashFormField>
          <DashFormField label="Published at (ISO)">
            <input
              name="published_at"
              defaultValue={values.publishedAt}
              className={dashInput}
            />
          </DashFormField>
        </div>

        <DashFormField label="Cover">
          <MediaUploader name="cover_image" defaultUrl={values.coverImage} />
        </DashFormField>

        <fieldset className={`${dashCard} grid gap-3 p-4`}>
          <legend className="px-1 text-sm font-semibold">UZ</legend>
          <input
            name="title_uz"
            required
            placeholder="Title"
            defaultValue={values.titleUz}
            className={dashInput}
          />
          <textarea
            name="excerpt_uz"
            required
            rows={2}
            placeholder="Excerpt"
            defaultValue={values.excerptUz}
            className={dashInput}
          />
          <textarea
            name="body_uz"
            required
            rows={8}
            placeholder="Body (абзацы через пустую строку; ## заголовок)"
            defaultValue={values.bodyUz}
            className={`${dashInput} font-mono text-xs`}
          />
        </fieldset>

        <fieldset className={`${dashCard} grid gap-3 p-4`}>
          <legend className="px-1 text-sm font-semibold">RU</legend>
          <input
            name="title_ru"
            required
            placeholder="Title"
            defaultValue={values.titleRu}
            className={dashInput}
          />
          <textarea
            name="excerpt_ru"
            required
            rows={2}
            placeholder="Excerpt"
            defaultValue={values.excerptRu}
            className={dashInput}
          />
          <textarea
            name="body_ru"
            required
            rows={8}
            placeholder="Body (абзацы через пустую строку)"
            defaultValue={values.bodyRu}
            className={`${dashInput} font-mono text-xs`}
          />
        </fieldset>

        <div className="sticky bottom-4 z-[1] flex flex-wrap gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3 shadow-[0_8px_24px_rgb(15_18_24/0.08)] backdrop-blur">
          <button type="submit" className={dashBtnPrimary}>
            Сохранить
          </button>
          <a href="/dashboard/news/" className={dashBtnSecondary}>
            К списку
          </a>
        </div>
      </form>

      {values.id ? (
        <form action={deleteNewsAction} className="mt-2 max-w-3xl">
          <input type="hidden" name="id" value={values.id} />
          <button
            type="submit"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Удалить статью
          </button>
        </form>
      ) : null}
    </>
  );
}
