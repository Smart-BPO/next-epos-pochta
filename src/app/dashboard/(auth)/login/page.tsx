import { DashboardLoginForm } from "@/components/dashboard/DashboardLoginForm";
import { countAdmins } from "@/lib/cms/auth";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { getEnv } from "@/utils/env";
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

function loginErrorMessage(code: string | undefined): string {
  switch (code) {
    case "not-admin":
      return "Нет доступа сотрудника";
    case "forbidden":
      return "Доступ запрещён";
    case "already_bootstrapped":
    case "setup-locked":
      return "Setup уже закрыт — войдите существующим аккаунтом";
    case "missing_service_role":
      return "На Hostinger нет SUPABASE_SERVICE_ROLE_KEY (server-only). Добавьте и передеплойте.";
    case "missing_bootstrap_secret":
      return "На Hostinger нет CMS_BOOTSTRAP_SECRET. Добавьте тот же секрет, что в .env.local, и передеплойте.";
    default:
      return "";
  }
}

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const adminCount = await countAdmins();
  const canOfferSetup =
    adminCount === 0 &&
    hasSupabaseAdminConfig() &&
    Boolean(getEnv("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET"));

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f6f6f7] px-4 py-10">
      <div className="w-full max-w-sm">
        <DashboardLoginForm
          initialError={loginErrorMessage(params.error)}
          nextPath={safeNextPath(params.next)}
        />
        {canOfferSetup ? (
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
