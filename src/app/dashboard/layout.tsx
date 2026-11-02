import type { Metadata } from "next";
import { getDashLocale } from "@/i18n/dashboard/server";
import { DashLocaleProvider } from "@/components/dashboard/DashLocaleProvider";

export const metadata: Metadata = {
  title: "EPOS Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getDashLocale();
  return (
    <DashLocaleProvider locale={locale}>{children}</DashLocaleProvider>
  );
}
