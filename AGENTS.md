# EPOS POCHTA — agent notes

This is a Next.js 16 App Router project. Prefer docs under `node_modules/next/dist/docs/` when APIs differ from training data.

## Surfaces (do not mix)

- **Dashboard** (`/dashboard`, `/api/dashboard`, server actions under `src/app/dashboard`): platform admins only. Auth = Supabase Auth + `epos_admin_users`. CRM leads, package catalog, Telegram contacts, messaging/FCargo settings, staff users. May show FCargo prices/IDs to staff. UI under `src/components/dashboard/**`.
- **Cabinet / Mini App** (`/cabinet`, `/webapp`, `/api/account`, `/api/webapp`): end customers. Auth = httpOnly `epos_acct` or Telegram `initData` + `epos_fcargo_client_links`. OTP link, list/create/track own shipments. Tracking + status only — never tariffs as оферта, never API keys/bearers. Cabinet chrome (sidebar / top bar / mobile tabs, same shell pattern as dashboard) under `src/components/cabinet/**`; shipment widgets under `src/components/account/**` (+ webapp shell). Routes: `/cabinet/`, `/cabinet/new/`, `/cabinet/tracking/`, `/cabinet/profile/`, `/cabinet/shipments/[tracking]/` (uz/ru/zh).
- **Import rule:** `src/components/dashboard/**` must not import `@/components/account` or `@/components/cabinet`; cabinet/account/webapp must not import `@/components/dashboard` (shared class recipes via `src/styles/cabinet.ts` / `dashboard.ts` only). Customer routes must not import CMS mutation helpers; dashboard must not set `epos_acct`. Browser never holds FCargo `X-API-Key` or customer bearer — S2S only via server modules (`server-only`). Check: `npm run check:boundaries`.

## Scope (current)

- Public corporate site + CMS at `/dashboard` (Supabase project **epos** / `yxvnsmqwwtgwnrozrvtc`)
- Content: static TS seed (`src/data`, `src/i18n`) with CMS overlays (news, site settings, delivery hub copy)
- Locales: `uz` (default, unprefixed) and `ru` (`/ru/`)
- Tracking: public `/tracking/?number=` → `GET /api/tracking/` → FCargo `packages:track` (rate-limited, cached 60s, no PII). Status labels uz/ru in `src/lib/tracking/fcargo-status.ts`. Mini App list shows FCargo status from `epos_fcargo_packages`; dashboard track number entry ingests into that catalog
- Env:
  - Public defaults: `.env.development` (local) / `.env.production` (epos-pochta.uz)
  - Secrets: `.env.local` or Hostinger panel — see `.env.example` / `.env.production.example`
  - Server-only: `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) + `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` / `SUPABASE_API_KEY` (+ `CMS_BOOTSTRAP_SECRET` only for first owner). Never `NEXT_PUBLIC_SUPABASE_*`.
 - Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, optional `TELEGRAM_WEBHOOK_SECRET` — manage webhook in `/dashboard/settings/telegram/`
 - Messaging secrets master key: `MESSAGING_SECRETS_KEY` — encrypts Playmobile / Eskiz / Resend credentials stored in CMS (`/dashboard/messaging/`) and FCargo API key + webhook secret (`/dashboard/settings/fcargo/`)
 - FCargo is the **source of truth** for orders, track numbers (`PKG…`), statuses, prices, and district SOATO. Our DB only mirrors (`epos_fcargo_packages`) + Telegram↔trek links (`epos_webapp_shipments`) + CRM funnel for leads without an order. Settlement IDs in API/UI are FCargo SOATO (`src/data/fcargo-locations.json`, regenerate via `npm run sync:geo` / `npm run check:geo`); legacy uzbgeo slugs still resolve via `legacySlugToSoato`.
 - FCargo Client API: configure in `/dashboard/settings/fcargo/` (owner). **Tenant domain** = FCargo `X-Tenant-Domain`. Pricing/orders send `*_region_soato` / `*_district_soato` strings (not internal integer region ids). Quotes cached 10 min. When FCargo is enabled, `/api/estimate` uses Client API only.
 - Lead → order: `/api/leads` creates FCargo order before staff notify; Mini App `/api/webapp/shipment` also creates FCargo orders (needs receiver name+phone; Telegram-verified contact only). Idempotent by `external_order_id`. Public/customer payloads expose tracking only, never FCargo price. Key has no `orders:cancel` — cancel in FCargo cabinet. Dashboard shipments are read-only for FCargo status («Привязать трек FCargo» verifies via track API; «Обновить из FCargo»). CRM lead status is **not** auto-overwritten by FCargo codes.
 - Customer account linking (legacy EPOS OTP on `api.fcargo.uz/api/v1`, tenant `X-Tenant-Domain`): site `/cabinet/` (tabs: shipments / new / profile) + Mini App. FCargo verify returns a long-lived `token` + `profile` (no refresh_token). Server stores encrypted bearer in `epos_fcargo_client_links` (`MESSAGING_SECRETS_KEY`); browser gets httpOnly `epos_acct` (`session_token`, 30d idle via `session_expires_at`) or Telegram `initData`. OTP challenges are server-bound in `epos_fcargo_otp_challenges` (hashed). Account shipments: `GET/POST /api/account/shipments/` + `/api/account/shipments/[tracking]/` via `account-shipments.ts` — primary list is EPOS `/web/clients/epos/packages` (CRM+API, all packages); Client API `/packages`+timeline by `customer_id` is api-only fallback/detail; catalog phone fallback last. Create: `/api/account/shipment` (source `cabinet`|`webapp`, Client API key + sender from link; no customer price in response). Cancel out of scope (`orders:cancel`). Local `epos_acct` (30d idle) is the cabinet login source of truth — OTP is not required on every visit. `POST /api/account/refresh/` and `/api/account/me/` slide the idle cookie; FCargo bearer is probed at most every ~6h and a dead bearer does **not** revoke the local session (list falls back to Client API / catalog). Decrypt failure / explicit logout / idle expiry still clear the session. Client API OpenAPI has **no** auth/refresh (API-key only). Drain cron probes hot links for `last_validated_at` only (no revoke on profile 401). Shared UI in `src/components/account/`. OTP attempts in `epos_fcargo_otp_attempts`. Dashboard FCargo settings shows linked count + recent OTP errors; contacts show «FCargo linked» badge.
 - FCargo status sync: inbound `POST /api/fcargo/webhook/` HMAC → inbox → `after()` + `POST /api/fcargo/drain/` (also prunes request log + validates hot client links); pull via `POST /api/fcargo/sync/`. Phone link only for **Telegram-verified** contacts. Request log in `epos_fcargo_request_log` (30d prune on drain).
 - SMS (Play Mobile / Eskiz) + Resend: configure in `/dashboard/messaging/providers/` (env `PLAYMOBILE_*` / `RESEND_*` still work as one-time import)
 - Remotes: keep **in sync** on `main` — `diasbek/next-epos-pochta` → **epos.nocode.uz**, `Smart-BPO/next-epos-pochta` → **epos-pochta.uz**. Local `origin` dual-pushes both; always `git push origin` (or push both explicitly). Never leave either remote behind after a requested push. Legacy `epos.nocode.uz` 301s to canonical `epos-pochta.uz` in proxy.

## Product rules

- Client-side **non-binding estimates** are allowed (A→B + weight/dims) with a clear “not final / manager confirms” disclaimer
- Never publish official tariffs or present estimates as final prices / оферта
- Final price only via manager confirmation after a lead («Запросить стоимость» / contacts on estimate)

## React / hooks (dashboard)

- `useSyncExternalStore` `getSnapshot` must return a **stable** value (primitive or cached reference). Returning a fresh `[]` / `{}` / `JSON.parse(...)` every call causes React #185 (max update depth) — see `DashListView` hidden-cols cache.
- Prefer shared [`src/hooks/useIsClient.ts`](src/hooks/useIsClient.ts) (`useIsClient`, `useMediaQuery`) over local `emptySubscribe` copies.
- When adjusting state during render from props, compare by **fingerprint/key**, not object identity (`shipmentDraftKey` for Mini App drafts).
- Smoke: `npm run smoke` / `npm run smoke -- https://epos-pochta.uz`; import boundaries: `npm run check:boundaries`
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
