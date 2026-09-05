import { NEWS_CATEGORIES } from "@/data/news/types";
import {
  deleteNewsAction,
  saveNewsAction,
} from "@/app/dashboard/(app)/news/actions";

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

export function NewsEditorForm({ values }: { values: NewsFormValues }) {
  return (
    <>
    <form action={saveNewsAction} className="grid max-w-3xl gap-4">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
        Slug
        <input
          name="slug"
          required
          defaultValue={values.slug}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
          Статус
          <select
            name="status"
            defaultValue={values.status}
            className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
          Категория
          <select
            name="category"
            defaultValue={values.category}
            className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
          Published at (ISO)
          <input
            name="published_at"
            defaultValue={values.publishedAt}
            className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
          />
        </label>
      </div>
      <label className="grid gap-1 text-xs font-semibold uppercase text-black/45">
        Cover URL
        <input
          name="cover_image"
          defaultValue={values.coverImage}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
        />
      </label>

      <fieldset className="grid gap-3 rounded-xl border border-black/8 p-4">
        <legend className="px-1 text-sm font-semibold">UZ</legend>
        <input
          name="title_uz"
          required
          placeholder="Title"
          defaultValue={values.titleUz}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <textarea
          name="excerpt_uz"
          required
          rows={2}
          placeholder="Excerpt"
          defaultValue={values.excerptUz}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <textarea
          name="body_uz"
          required
          rows={8}
          placeholder="Body (абзацы через пустую строку; ## заголовок)"
          defaultValue={values.bodyUz}
          className="rounded-lg border border-black/12 px-3 py-2 font-mono text-xs"
        />
      </fieldset>

      <fieldset className="grid gap-3 rounded-xl border border-black/8 p-4">
        <legend className="px-1 text-sm font-semibold">RU</legend>
        <input
          name="title_ru"
          required
          placeholder="Title"
          defaultValue={values.titleRu}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <textarea
          name="excerpt_ru"
          required
          rows={2}
          placeholder="Excerpt"
          defaultValue={values.excerptRu}
          className="rounded-lg border border-black/12 px-3 py-2 text-sm"
        />
        <textarea
          name="body_ru"
          required
          rows={8}
          placeholder="Body (абзацы через пустую строку)"
          defaultValue={values.bodyRu}
          className="rounded-lg border border-black/12 px-3 py-2 font-mono text-xs"
        />
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary">
          Сохранить
        </button>
      </div>
    </form>
    {values.id ? (
      <form action={deleteNewsAction} className="mt-4 max-w-3xl">
        <input type="hidden" name="id" value={values.id} />
        <button type="submit" className="btn btn-ghost text-primary">
          Удалить
        </button>
      </form>
    ) : null}
    </>
  );
}
