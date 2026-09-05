import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EPOS Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
