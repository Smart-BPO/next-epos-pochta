import { DashboardLoginForm } from "@/components/dashboard/DashboardLoginForm";
import { countAdmins } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import {
  hasSupabaseAdminConfig,
  hasSupabaseSessionConfig,
} from "@/lib/supabase/env";
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

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getDashT();
  const adminCount = await countAdmins();
  const canOfferSetup =
    hasSupabaseSessionConfig() &&
    Boolean(getEnv("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET")) &&
    (hasSupabaseAdminConfig() ? adminCount === 0 : true);

  const errorMap: Record<string, string> = {
    "not-admin": t.login.errNotAdmin,
    forbidden: t.login.errForbidden,
    already_bootstrapped: t.login.errSetupLocked,
    "setup-locked": t.login.errSetupLocked,
  };
  const initialError = params.error
    ? (errorMap[params.error] ?? t.login.errGeneric)
    : "";

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f6f6f7] px-4 py-10">
      <div className="w-full max-w-sm">
        <DashboardLoginForm
          initialError={initialError}
          nextPath={safeNextPath(params.next)}
        />
        {canOfferSetup && adminCount === 0 ? (
          <p className="mt-4 text-center text-sm text-black/50">
            <Link
              href="/dashboard/setup/"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t.login.setupLink}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
