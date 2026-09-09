import { NewsEditorForm } from "@/components/dashboard/NewsEditorForm";
import {
  DashBreadcrumbs,
  DashPageHeader,
} from "@/components/dashboard/ui";

export default function NewNewsPage() {
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
        values={{
          slug: "",
          status: "draft",
          category: "company",
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
