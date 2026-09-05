# EPOS POCHTA — agent notes

This is a Next.js 16 App Router project. Prefer docs under `node_modules/next/dist/docs/` when APIs differ from training data.

## Scope (current)

- Public corporate site + CMS at `/dashboard` (Supabase project **epos** / `khlororwqcpiccylqdze`)
- Content: static TS seed (`src/data`, `src/i18n`) with CMS overlays (news, site settings, delivery hub copy)
- Locales: `uz` (default, unprefixed) and `ru` (`/ru/`)
- Tracking page stays a stub until tracking API — `TODO(tracking-api)`; dashboard can set shipment `track_number` manually
- Env: server-only `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (+ `CMS_BOOTSTRAP_SECRET` for first owner). Never `NEXT_PUBLIC_SUPABASE_*`.

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
