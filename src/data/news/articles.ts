import type { NewsArticle } from "@/data/news/types";

/** Static news seed — TODO(cms): replace with CMS / Supabase. */
export const newsArticles: NewsArticle[] = [
  {
    id: "launch",
    slug: "epos-pochta-launch",
    status: "published",
    publishedAt: "2026-03-01T09:00:00.000Z",
    coverImage: "/images/og/default.png",
    tags: ["company"],
    locales: {
      uz: {
        title: "EPOS POCHTA ishga tushdi",
        excerpt:
          "Oʻzbekiston boʻylab zamonaviy kuryerlik yetkazib berish — shaxsiy mijozlar, internet-doʻkonlar va kompaniyalar uchun.",
        body: [
          "EPOS POCHTA Oʻzbekiston Respublikasi hududida kuryerlik yetkazib berish xizmatini yoʻlga qoʻydi.",
          "Biz joʻnatmani olib ketamiz, qabul qiluvchiga yetkazamiz va har bosqichda statusni xabar qilamiz — shaxsiy mijozlar, internet-doʻkonlar va kompaniyalar uchun.",
          "Narx ochiq tariflar orqali eʼlon qilinmaydi: parametrlarni qoldiring, menejer individual hisobni tayyorlaydi.",
        ],
      },
      ru: {
        title: "EPOS POCHTA начала работу",
        excerpt:
          "Современная курьерская доставка по Узбекистану — для частных клиентов, интернет-магазинов и компаний.",
        body: [
          "EPOS POCHTA запустила курьерскую доставку по территории Республики Узбекистан.",
          "Мы забираем отправление, доставляем получателю и сообщаем статус на каждом этапе — для частных клиентов, интернет-магазинов и компаний.",
          "Стоимость не публикуется в открытых тарифах: оставьте параметры отправления — менеджер подготовит индивидуальный расчёт.",
        ],
      },
    },
  },
  {
    id: "geography",
    slug: "delivery-across-uzbekistan",
    status: "published",
    publishedAt: "2026-04-15T09:00:00.000Z",
    coverImage: "/images/og/default.png",
    tags: ["geography"],
    locales: {
      uz: {
        title: "Yetkazib berish geografiyasi kengaymoqda",
        excerpt:
          "Asosiy shaharlar va viloyatlar boʻylab yoʻnalishlar — manzilingizni saytda tekshirib koʻring.",
        body: [
          "Biz Oʻzbekistonning asosiy shaharlari va viloyatlari boʻylab yetkazib berishni rivojlantiramiz.",
          "Ombor—ombor, ombor—eshik, eshik—ombor va eshik—eshik rejimlari mavjud. Aniq manzil boʻyicha mavjudlikni bosh sahifadagi geografiya blokida tekshirishingiz mumkin.",
          "Biznes mijozlar uchun muntazam yoʻnalishlar va individual shartlar boʻyicha alohida taklif tayyorlaymiz.",
        ],
      },
      ru: {
        title: "Расширяем географию доставки",
        excerpt:
          "Маршруты по ключевым городам и областям — проверьте ваш адрес на сайте.",
        body: [
          "Мы развиваем доставку по ключевым городам и областям Узбекистана.",
          "Доступны режимы склад—склад, склад—дверь, дверь—склад и дверь—дверь. Проверить доступность по адресу можно в блоке географии на главной странице.",
          "Для бизнес-клиентов готовим отдельные предложения по регулярным направлениям и индивидуальным условиям.",
        ],
      },
    },
  },
  {
    id: "business-api",
    slug: "business-and-api",
    status: "published",
    publishedAt: "2026-05-20T09:00:00.000Z",
    coverImage: "/images/og/default.png",
    tags: ["business"],
    locales: {
      uz: {
        title: "Biznes uchun: ommaviy joʻnatmalar va API",
        excerpt:
          "Internet-doʻkonlar va kompaniyalar uchun muntazam olib ketish, hisobotlar va integratsiya imkoniyatlari.",
        body: [
          "EPOS POCHTA internet-doʻkonlar va kompaniyalar uchun yechimlarni taklif etadi: muntazam olib ketish, ommaviy joʻnatmalar, qaytarishlar va yetkazib berishda toʻlov.",
          "Hisobotlar va API orqali jarayonlarni avtomatlashtirish mumkin — batafsilni «Biznes uchun» sahifasida yoki ariza orqali bilib oling.",
          "Taklif va shartlar individual kelishiladi: ochiq tarif jadvali yoʻq.",
        ],
      },
      ru: {
        title: "Для бизнеса: массовые отправления и API",
        excerpt:
          "Регулярный забор, отчётность и интеграция для интернет-магазинов и компаний.",
        body: [
          "EPOS POCHTA предлагает решения для интернет-магазинов и компаний: регулярный забор, массовые отправления, возвраты и наложенный платёж.",
          "Отчётность и API помогают автоматизировать процессы — подробности на странице «Для бизнеса» или через заявку.",
          "Предложение и условия согласовываются индивидуально: открытого тарифного прайса нет.",
        ],
      },
    },
  },
];
