import { notFound } from "next/navigation";
import { NewsEditorForm } from "@/components/dashboard/NewsEditorForm";
import { getNewsAdminById } from "@/lib/cms/news";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getNewsAdminById(id);
  if (!article) notFound();

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Редактирование</h1>
      <p className="mt-1 font-mono text-xs text-black/40">{article.slug}</p>
      <div className="mt-6">
        <NewsEditorForm
          values={{
            id: article.id,
            slug: article.slug,
            status: article.status,
            category: article.category,
            coverImage: article.coverImage ?? "",
            publishedAt: article.publishedAt,
            titleUz: article.locales.uz.title,
            excerptUz: article.locales.uz.excerpt,
            bodyUz: article.locales.uz.body.join("\n\n"),
            titleRu: article.locales.ru.title,
            excerptRu: article.locales.ru.excerpt,
            bodyRu: article.locales.ru.body.join("\n\n"),
          }}
        />
      </div>
    </div>
  );
}
