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
    <div className="min-w-0 max-w-full space-y-4">
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
          coverAlt: article.coverAlt ?? "",
          ogImage: article.ogImage ?? "",
          tags: article.tags ?? [],
          noindex: Boolean(article.noindex),
          publishedAt: article.publishedAt,
          titleUz: article.locales.uz.title,
          excerptUz: article.locales.uz.excerpt,
          bodyHtmlUz: article.locales.uz.bodyHtml,
          seoTitleUz: article.locales.uz.seoTitle ?? "",
          seoDescriptionUz: article.locales.uz.seoDescription ?? "",
          ogTitleUz: article.locales.uz.ogTitle ?? "",
          ogDescriptionUz: article.locales.uz.ogDescription ?? "",
          titleRu: article.locales.ru.title,
          excerptRu: article.locales.ru.excerpt,
          bodyHtmlRu: article.locales.ru.bodyHtml,
          seoTitleRu: article.locales.ru.seoTitle ?? "",
          seoDescriptionRu: article.locales.ru.seoDescription ?? "",
          ogTitleRu: article.locales.ru.ogTitle ?? "",
          ogDescriptionRu: article.locales.ru.ogDescription ?? "",
        }}
      />
    </div>
  );
}
