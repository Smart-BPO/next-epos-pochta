import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsCategories } from "@/lib/cms/news-categories";
import { NewsEditorForm } from "@/components/dashboard/NewsEditorForm";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import {
  DashBreadcrumbs,
  DashPageHeader,
} from "@/components/dashboard/ui";

export default async function NewNewsPage() {
  const admin = await requireAccess("news");
  if (!admin || !canMutate(admin.role, "news")) {
    return <DashAccessDenied title="Новая новость" lead="Нет прав на запись." />;
  }

  const cats = await listNewsCategories();

  return (
    <div className="space-y-4">
      <DashBreadcrumbs
        items={[
          { href: "/dashboard/news/", label: "Новости" },
          { label: "Новая" },
        ]}
      />
      <DashPageHeader
        title="Новая новость"
        lead="Черновик не попадает на публичный сайт до публикации."
      />
      <NewsEditorForm
        categories={cats.map((c) => ({ id: c.id, label: `${c.labelRu} (${c.id})` }))}
        values={{
          slug: "",
          status: "draft",
          category: cats[0]?.id ?? "company",
          coverImage: "",
          publishedAt: new Date().toISOString(),
          titleUz: "",
          excerptUz: "",
          bodyUz: "",
          titleRu: "",
          excerptRu: "",
          bodyRu: "",
        }}
      />
    </div>
  );
}
