import Link from "next/link";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { saveSettingsAction } from "./actions";
import {
  dashBtnPrimary,
  dashCardPad,
  dashInput,
  dashPageLead,
  dashPageTitle,
} from "@/styles/dashboard";

export default async function DashboardSettingsPage() {
  const admin = await requireAccess("settings");
  if (!admin) {
    return <DashDenied section="settings" />;
  }

  const { t } = await getDashT();
  const s = await getSiteSettings();
  const canWrite = canMutate(admin.role, "settings");

  const fields = [
    ["phone", t.settings.phone, s.phone],
    ["phone_display", t.settings.phoneDisplay, s.phoneDisplay],
    ["email", t.settings.email, s.email],
    ["telegram_url", t.settings.telegramUrl, s.telegramUrl],
    ["instagram_url", t.settings.instagramUrl, s.instagramUrl],
    ["facebook_url", t.settings.facebookUrl, s.facebookUrl],
    ["hours", t.settings.hours, s.hours],
    ["address_line", t.settings.addressRu, s.addressLine],
    ["address_line_uz", t.settings.addressUz, s.addressLineUz],
    ["map_lat", t.settings.mapLat, String(s.mapLat ?? "")],
    ["map_lng", t.settings.mapLng, String(s.mapLng ?? "")],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={dashPageTitle}>{t.settings.title}</h1>
        <p className={dashPageLead}>{t.settings.lead}</p>
      </div>

      <p>
        <Link
          href="/dashboard/settings/telegram/"
          className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgb(15_18_24/0.04)] transition hover:border-primary/30"
        >
          {t.settings.linkTelegram}
        </Link>
      </p>
      <p>
        <Link
          href="/dashboard/settings/fcargo/"
          className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgb(15_18_24/0.04)] transition hover:border-primary/30"
        >
          {t.settings.linkDelivery}
        </Link>
      </p>
      <p>
        <Link
          href="/dashboard/pricing/"
          className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgb(15_18_24/0.04)] transition hover:border-primary/30"
        >
          {t.settings.linkPricing}
        </Link>
      </p>

      <form
        action={saveSettingsAction}
        className={`${dashCardPad} grid max-w-xl gap-3`}
      >
        {fields.map(([name, label, value]) => (
          <label
            key={name}
            className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40"
          >
            {label}
            <input
              name={name}
              defaultValue={value}
              disabled={!canWrite}
              className={`${dashInput} font-normal normal-case`}
            />
          </label>
        ))}
        {canWrite ? (
          <button type="submit" className={`${dashBtnPrimary} mt-1 w-fit`}>
            {t.settings.save}
          </button>
        ) : null}
      </form>
    </div>
  );
}
