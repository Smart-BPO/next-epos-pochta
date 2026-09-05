import { DashboardLoginForm } from "@/components/dashboard/DashboardLoginForm";
import { countAdmins } from "@/lib/cms/auth";
import Link from "next/link";

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value.startsWith("/dashboard/")) return undefined;
  if (value.startsWith("//") || value.includes("://")) return undefined;
  if (
    value.startsWith("/dashboard/login") ||
    value.startsWith("/dashboard/setup")
  ) {
    return undefined;
  }
  return value;
}

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const adminCount = await countAdmins();
  const initialError =
    params.error === "not-admin"
      ? "Нет доступа сотрудника"
      : params.error === "forbidden"
        ? "Доступ запрещён"
        : params.error === "setup-locked"
          ? "Setup уже закрыт — войдите существующим аккаунтом"
          : "";

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f6f6f7] px-4 py-10">
      <div className="w-full max-w-sm">
        <DashboardLoginForm
          initialError={initialError}
          nextPath={safeNextPath(params.next)}
        />
        {adminCount === 0 ? (
          <p className="mt-4 text-center text-sm text-black/50">
            Первый вход?{" "}
            <Link
              href="/dashboard/setup/"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Создать владельца
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
