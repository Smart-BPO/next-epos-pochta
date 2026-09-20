# EPOS POCHTA — agent notes

This is a Next.js 16 App Router project. Prefer docs under `node_modules/next/dist/docs/` when APIs differ from training data.

## Scope (current)

- Public corporate site + CMS at `/dashboard` (Supabase project **epos** / `iituklcscawinftbyzxc`, Central EU Frankfurt)
- Content: static TS seed (`src/data`, `src/i18n`) with CMS overlays (news, site settings, delivery hub copy)
- Locales: `uz` (default, unprefixed) and `ru` (`/ru/`)
- Tracking page stays a stub until tracking API — `TODO(tracking-api)`; dashboard can set shipment `track_number` manually
- Env:
  - Public defaults: `.env.development` (local) / `.env.production` (epos-pochta.uz)
  - Secrets: `.env.local` or Hostinger panel — see `.env.example` / `.env.production.example`
  - Server-only: `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) + `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` / `SUPABASE_API_KEY` (+ `CMS_BOOTSTRAP_SECRET` only for first owner). Never `NEXT_PUBLIC_SUPABASE_*`.
 - Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, optional `TELEGRAM_WEBHOOK_SECRET` — manage webhook in `/dashboard/settings/telegram/`
 - Messaging secrets master key: `MESSAGING_SECRETS_KEY` — encrypts Playmobile / Eskiz / Resend credentials stored in CMS (`/dashboard/messaging/`) and FCargo API key + webhook secret (`/dashboard/settings/fcargo/`)
 - FCargo Client API: configure in `/dashboard/settings/fcargo/` (owner). **Tenant domain** = FCargo `X-Tenant-Domain` (playground header / tenant slug), not the public site host. Optional one-shot `FCARGO_*` env import if CMS has no key yet.
 - FCargo status sync: inbound `POST /api/fcargo/webhook/` verifies HMAC then **enqueues** to `epos_fcargo_webhook_inbox` and returns `{ received: true }` immediately; heavy ingest runs via Next.js `after()` plus safety-net `POST /api/fcargo/drain/` (same shared secret as sync / `FCARGO_SYNC_SECRET`). Pull statuses: `POST /api/fcargo/sync/`. Calculator leads stay in `epos_fcargo_orders`; catalog in `epos_fcargo_packages`; Mini App links by phone → `epos_webapp_shipments`. Traffic in `epos_fcargo_request_log`.
 - SMS (Play Mobile / Eskiz) + Resend: configure in `/dashboard/messaging/providers/` (env `PLAYMOBILE_*` / `RESEND_*` still work as one-time import)
 - Remotes: keep **in sync** on `main` — `diasbek/next-epos-pochta` → **epos.nocode.uz**, `Smart-BPO/next-epos-pochta` → **epos-pochta.uz**. Local `origin` dual-pushes both; always `git push origin` (or push both explicitly). Never leave either remote behind after a requested push. Legacy `epos.nocode.uz` 301s to canonical `epos-pochta.uz` in proxy.

## Product rules

- Client-side **non-binding estimates** are allowed (A→B + weight/dims) with a clear “not final / manager confirms” disclaimer
- Never publish official tariffs or present estimates as final prices / оферта
- Final price only via manager confirmation after a lead («Запросить стоимость» / contacts on estimate)
- Tracking page stays a stub until tracking API is connected (`TODO(tracking-api)`)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
