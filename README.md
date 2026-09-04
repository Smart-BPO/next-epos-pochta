# EPOS POCHTA — корпоративный сайт

Публичный сайт курьерской компании EPOS POCHTA на Next.js 16.

## Стек

- Next.js 16 (App Router, SSR)
- React 19 + TypeScript
- Tailwind CSS v4
- Formik + Yup
- Локали: **RU** (без префикса) и **UZ** (`/uz/`)

## Что уже есть

- Карта сайта из ТЗ (главная, услуги, бизнес, трекинг, запрос стоимости, о компании, контакты, privacy, terms, 404)
- Статический контент RU/UZ
- 3-шаговая форма запроса стоимости без авторасчёта цены
- Stub `POST /api/leads` (лог + опционально Resend)
- Заглушка трекинга до подключения API

## Что отложено

- Админка / CMS / Supabase
- Реальный API отслеживания
- Личный кабинет
- Карта пунктов приёма

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Скрипты

- `npm run dev` — разработка
- `npm run build` / `npm start` — production
- `npm run typecheck` — проверка типов
- `npm run lint` — ESLint
