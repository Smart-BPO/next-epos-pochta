import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listDeliveryHubAdminRows } from "@/lib/cms/delivery-hubs";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { DeliveryHubsClient } from "@/components/dashboard/DeliveryHubsClient";
import {
  deleteDeliveryHubAction,
  seedDeliveryHubsAction,
  upsertDeliveryHubAction,
} from "./actions";

export default async function DashboardDeliveryPage() {
  const admin = await requireAccess("delivery");
  if (!admin) {
    return <DashDenied section="delivery" />;
  }

  const rows = await listDeliveryHubAdminRows();
  const canWrite = canMutate(admin.role, "delivery");

  return (
    <DeliveryHubsClient
      rows={rows}
      canWrite={canWrite}
      saveAction={upsertDeliveryHubAction}
      deleteAction={deleteDeliveryHubAction}
      seedAction={seedDeliveryHubsAction}
    />
  );
}
