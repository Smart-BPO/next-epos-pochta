import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin, canAccess } from "@/lib/cms/auth";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import {
  defaultTelegramWebhookUrl,
  defaultTelegramWebAppUrl,
  getChatMenuButton,
  getMe,
  getTelegramChatId,
  getTelegramWebhookSecret,
  getWebhookInfo,
  hasTelegramBotToken,
} from "@/lib/telegram/bot";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import {
  dashBadgeBase,
  dashCardPad,
  dashPageLead,
  dashPageTitle,
  dashSectionTitle,
} from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { TelegramWebhookForms } from "./TelegramWebhookForms";

async function siteOriginFromRequest(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }
  return getCanonicalSiteUrl();
}

function formatTs(unix?: number) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString("ru-RU");
}

function StatusPill({
  ok,
  okLabel,
  badLabel,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
}) {
  return (
    <span
      className={cn(
        dashBadgeBase,
        ok ? "bg-emerald-50 text-emerald-700" : "bg-primary-soft text-primary",
      )}
    >
      {ok ? okLabel : badLabel}
    </span>
  );
}

export default async function DashboardTelegramSettingsPage() {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, "settings")) {
    return (
      <DashAccessDenied
        title="Telegram"
        lead="Нет доступа к настройкам Telegram."
      />
    );
  }

  const tokenOk = hasTelegramBotToken();
  const chatId = getTelegramChatId();
  const secretOk = Boolean(getTelegramWebhookSecret());
  const origin = await siteOriginFromRequest();
  const suggestedUrl = defaultTelegramWebhookUrl(origin);
  const suggestedWebAppUrl = defaultTelegramWebAppUrl(
    origin.includes("localhost") ? "https://epos-pochta.uz" : origin,
  );
  const isOwner = admin.role === "owner";

  const [me, info, menu] = tokenOk
    ? await Promise.all([getMe(), getWebhookInfo(), getChatMenuButton()])
    : [null, null, null];

  const webhookActive = Boolean(info?.ok && info.result.url);

  return (
    <div className="space-y-6">
      <div>
        <DashBreadcrumbs
          items={[
            { href: "/dashboard/settings/", label: "Настройки" },
            { label: "Telegram" },
          ]}
        />
        <h1 className={cn(dashPageTitle, "mt-1")}>Telegram webhook</h1>
        <p className={cn(dashPageLead, "max-w-2xl")}>
          Команды (/start, /id, /ping) и кнопки статуса заявок. Токен и chat_id
          — в env. Set/delete webhook — только owner.
        </p>
      </div>

      <section className={cn(dashCardPad, "max-w-3xl")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={dashSectionTitle}>Статус подключения</h2>
          <StatusPill
            ok={webhookActive}
            okLabel="Webhook активен"
            badLabel="Webhook не установлен"
          />
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          {(
            [
              [
                "TELEGRAM_BOT_TOKEN",
                <StatusPill
                  key="token"
                  ok={tokenOk}
                  okLabel="задан"
                  badLabel="не задан"
                />,
              ],
              [
                "TELEGRAM_CHAT_ID",
                chatId ? (
                  <span key="chat" className="font-medium text-ink">
                    {chatId}
                  </span>
                ) : (
                  <StatusPill
                    key="chat"
                    ok={false}
                    okLabel=""
                    badLabel="не задан"
                  />
                ),
              ],
              [
                "WEBHOOK_SECRET",
                <StatusPill
                  key="secret"
                  ok={secretOk}
                  okLabel="задан"
                  badLabel="не задан"
                />,
              ],
              [
                "Бот",
                me?.ok ? (
                  <span key="bot" className="font-medium text-ink">
                    @{me.result.username || me.result.first_name} (id{" "}
                    {me.result.id})
                  </span>
                ) : (
                  <span key="bot" className="text-black/50">
                    {me && !me.ok ? me.description : "—"}
                  </span>
                ),
              ],
              [
                "Webhook URL",
                <span key="url" className="break-all font-medium text-ink">
                  {info?.ok
                    ? info.result.url || "не установлен"
                    : info && !info.ok
                      ? info.description
                      : "—"}
                </span>,
              ],
              [
                "Pending / last error",
                <span key="err" className="text-black/65">
                  {info?.ok
                    ? `${info.result.pending_update_count} pending · ${
                        info.result.last_error_message
                          ? `${formatTs(info.result.last_error_date)} — ${info.result.last_error_message}`
                          : "ошибок нет"
                      }`
                    : "—"}
                </span>,
              ],
              [
                "Menu button",
                <span key="menu" className="break-all font-medium text-ink">
                  {menu?.ok
                    ? menu.result.type === "web_app"
                      ? `${menu.result.text} → ${menu.result.web_app.url}`
                      : menu.result.type
                    : menu && !menu.ok
                      ? menu.description
                      : "—"}
                </span>,
              ],
            ] as const
          ).map(([label, value]) => (
            <div
              key={String(label)}
              className="grid gap-1 border-t border-black/[0.05] pt-3 first:border-0 first:pt-0 sm:grid-cols-[11rem_1fr] sm:items-center"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-black/40">
                {label}
              </dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {tokenOk && admin.role !== "viewer" ? (
        <TelegramWebhookForms
          defaultWebhookUrl={suggestedUrl}
          defaultWebAppUrl={suggestedWebAppUrl}
          isOwner={isOwner}
        />
      ) : (
        <p className={cn(dashCardPad, "max-w-3xl text-sm text-black/55")}>
          Добавьте <code className="text-xs">TELEGRAM_BOT_TOKEN</code> в env
          Hostinger / <code className="text-xs">.env.local</code>, затем
          перезапустите приложение.
        </p>
      )}

      <section className={cn(dashCardPad, "max-w-3xl")}>
        <h2 className={dashSectionTitle}>Команды и кнопки</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-black/60">
          <li>
            <code className="text-xs">/start</code> — онбординг (UZ/RU) → телефон
            → кнопка Mini App
          </li>
          <li>
            <code className="text-xs">/id</code> — показать chat_id (для
            TELEGRAM_CHAT_ID)
          </li>
          <li>
            <code className="text-xs">/ping</code> — проверка
          </li>
          <li>
            Под заявкой: «В работу» / «Готово» / «Спам» → статус в CMS
          </li>
        </ul>
        <p className="m-0 mt-3 text-sm">
          <Link
            href="/dashboard/settings/"
            className="font-semibold text-primary hover:underline"
          >
            ← Настройки сайта
          </Link>
        </p>
      </section>
    </div>
  );
}
