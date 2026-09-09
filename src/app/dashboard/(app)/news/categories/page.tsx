import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsCategories } from "@/lib/cms/news-categories";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { NewsCategoriesClient } from "@/components/dashboard/NewsCategoriesClient";
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
    <NewsCategoriesClient
      rows={rows}
      canWrite={canWrite}
      saveAction={saveNewsCategoryAction}
      deleteAction={deleteNewsCategoryAction}
    />
  );
}
