import { NewsEditorForm } from "@/components/dashboard/NewsEditorForm";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Новая новость</h1>
      <div className="mt-6">
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
    </div>
  );
}
