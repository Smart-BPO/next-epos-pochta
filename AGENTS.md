# EPOS POCHTA — agent notes

This is a Next.js 16 App Router project. Prefer docs under `node_modules/next/dist/docs/` when APIs differ from training data.

## Scope (current)

- Public corporate site + CMS at `/dashboard` (Supabase project **epos** / `iituklcscawinftbyzxc`, Central EU Frankfurt)
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
 - FCargo status sync: inbound `POST /api/fcargo/webhook/` HMAC → inbox → `after()` + `POST /api/fcargo/drain/`; pull via `POST /api/fcargo/sync/`. Phone link only for **Telegram-verified** contacts. Request log in `epos_fcargo_request_log` (30d prune on drain).
 - SMS (Play Mobile / Eskiz) + Resend: configure in `/dashboard/messaging/providers/` (env `PLAYMOBILE_*` / `RESEND_*` still work as one-time import)
 - Remotes: keep **in sync** on `main` — `diasbek/next-epos-pochta` → **epos.nocode.uz**, `Smart-BPO/next-epos-pochta` → **epos-pochta.uz**. Local `origin` dual-pushes both; always `git push origin` (or push both explicitly). Never leave either remote behind after a requested push. Legacy `epos.nocode.uz` 301s to canonical `epos-pochta.uz` in proxy.

## Product rules

- Client-side **non-binding estimates** are allowed (A→B + weight/dims) with a clear “not final / manager confirms” disclaimer
- Never publish official tariffs or present estimates as final prices / оферта
- Final price only via manager confirmation after a lead («Запросить стоимость» / contacts on estimate)
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
