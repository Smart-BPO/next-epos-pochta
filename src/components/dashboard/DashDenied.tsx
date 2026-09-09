import { getDashT } from "@/i18n/dashboard";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";

type Section =
  | "leads"
  | "contacts"
  | "shipments"
  | "news"
  | "categories"
  | "media"
  | "users"
  | "delivery"
  | "settings"
  | "telegram";

export async function DashDenied({ section }: { section: Section }) {
  const { t } = await getDashT();
  const map: Record<Section, { title: string; lead: string }> = {
    leads: { title: t.leads.title, lead: t.leads.denied },
    contacts: { title: t.contacts.title, lead: t.common.accessDenied },
    shipments: { title: t.shipments.title, lead: t.common.accessDenied },
    news: { title: t.news.title, lead: t.common.accessDenied },
    categories: { title: t.categories.title, lead: t.common.accessDenied },
    media: { title: t.media.title, lead: t.common.accessDenied },
    users: { title: t.users.title, lead: t.users.denied },
    delivery: { title: t.delivery.title, lead: t.common.accessDenied },
    settings: { title: t.settings.title, lead: t.common.accessDenied },
    telegram: { title: t.telegram.title, lead: t.common.accessDenied },
  };
  const props = map[section];
  return <DashAccessDenied title={props.title} lead={props.lead} />;
}
