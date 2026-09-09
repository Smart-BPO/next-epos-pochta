import { requireAdmin } from "@/lib/cms/auth";
import { ProfileClient } from "@/components/dashboard/ProfileClient";

export default async function DashboardProfilePage() {
  const admin = await requireAdmin();
  return (
    <ProfileClient
      email={admin.email}
      displayName={admin.displayName}
      role={admin.role}
      phone={admin.phone}
      phoneVerifiedAt={admin.phoneVerifiedAt}
      bio={admin.bio}
      emailVerifiedAt={admin.emailVerifiedAt}
    />
  );
}
