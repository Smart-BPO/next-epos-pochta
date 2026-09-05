import { redirect } from "next/navigation";
import Link from "next/link";
import { getBootstrapStatus } from "./actions";
import { SetupForm } from "./setup-form";

export default async function DashboardSetupPage() {
  const status = await getBootstrapStatus();
  if (!status.ok) {
    redirect(`/dashboard/login/?error=${status.reason}`);
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f6f6f7] px-4 py-10">
      <div className="w-full max-w-sm">
        <SetupForm />
        <p className="mt-4 text-center text-sm text-black/50">
          <Link
            href="/dashboard/login/"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Ко входу
          </Link>
        </p>
      </div>
    </div>
  );
}
