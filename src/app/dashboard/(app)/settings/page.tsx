import { getSiteSettings } from "@/lib/cms/site-settings";
import { saveSettingsAction } from "./actions";

export default async function DashboardSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div>
      <h1 className="m-0 font-display text-2xl font-bold">Настройки сайта</h1>
      <p className="mt-1 text-sm text-black/50">
        NAP, часы, мессенджеры. Тарифы здесь не публикуются.
      </p>
      <form action={saveSettingsAction} className="mt-6 grid max-w-xl gap-3">
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
            className="grid gap-1 text-xs font-semibold uppercase text-black/45"
          >
            {label}
            <input
              name={name}
              defaultValue={value}
              className="rounded-lg border border-black/12 px-3 py-2 text-sm font-normal normal-case"
            />
          </label>
        ))}
        <button type="submit" className="btn btn-primary mt-2 w-fit">
          Сохранить
        </button>
      </form>
    </div>
  );
}
