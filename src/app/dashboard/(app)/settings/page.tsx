import Link from "next/link";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { saveSettingsAction } from "./actions";
import {
  dashBtnPrimary,
  dashCardPad,
  dashInput,
  dashPageLead,
  dashPageTitle,
} from "@/styles/dashboard";

export default async function DashboardSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={dashPageTitle}>Настройки сайта</h1>
        <p className={dashPageLead}>
          NAP, часы, мессенджеры. Тарифы здесь не публикуются.
        </p>
      </div>

      <p>
        <Link
          href="/dashboard/settings/telegram/"
          className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgb(15_18_24/0.04)] transition hover:border-primary/30"
        >
          Telegram webhook →
        </Link>
      </p>

      <form action={saveSettingsAction} className={`${dashCardPad} grid max-w-xl gap-3`}>
        {(
          [
            ["phone", "Телефон (E.164)", s.phone],
            ["phone_display", "Телефон (отображение)", s.phoneDisplay],
            ["email", "Email", s.email],
            ["telegram_url", "Telegram URL", s.telegramUrl],
            ["instagram_url", "Instagram URL", s.instagramUrl],
            ["facebook_url", "Facebook URL", s.facebookUrl],
            ["hours", "Часы работы", s.hours],
            ["address_line", "Адрес (RU)", s.addressLine],
            ["address_line_uz", "Адрес (UZ)", s.addressLineUz],
            ["map_lat", "Map lat", String(s.mapLat ?? "")],
            ["map_lng", "Map lng", String(s.mapLng ?? "")],
          ] as const
        ).map(([name, label, value]) => (
          <label
            key={name}
            className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40"
          >
            {label}
            <input
              name={name}
              defaultValue={value}
              className={`${dashInput} font-normal normal-case`}
            />
          </label>
        ))}
        <button type="submit" className={`${dashBtnPrimary} mt-1 w-fit`}>
          Сохранить
        </button>
      </form>
    </div>
  );
}
