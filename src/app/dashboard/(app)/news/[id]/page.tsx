import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/cms/auth";
import { listNewsCategories } from "@/lib/cms/news-categories";
import { getNewsAdminById } from "@/lib/cms/news";
import { NewsEditorForm } from "@/components/dashboard/NewsEditorForm";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  DashAlert,
  DashBreadcrumbs,
  DashPageHeader,
} from "@/components/dashboard/ui";

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const admin = await requireAccess("news");
  if (!admin) {
    return <DashAccessDenied title="Новости" lead="Нет доступа." />;
  }

  const { id } = await params;
  const { saved } = await searchParams;
  const article = await getNewsAdminById(id);
  if (!article) notFound();

  const cats = await listNewsCategories({ includeInactive: true });

  return (
    <div className="space-y-4">
      <DashBreadcrumbs
        items={[
          { href: "/dashboard/news/", label: "Новости" },
          { label: article.slug },
        ]}
      />
      <DashPageHeader title="Редактирование" lead={article.slug} />
      {saved ? <DashAlert tone="success">Статья сохранена</DashAlert> : null}
      <NewsEditorForm
        categories={cats.map((c) => ({
          id: c.id,
          label: `${c.labelRu} (${c.id})`,
        }))}
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
  );
}
