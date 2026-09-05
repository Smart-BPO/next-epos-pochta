import type { NewsArticle } from "@/data/news/types";

/**
 * Static news seed — TODO(cms): replace with CMS / Supabase.
 * Body lines starting with "## " render as section headings.
 * No public tariffs or prices in copy.
 */
export const newsArticles: NewsArticle[] = [
  {
    id: "launch",
    slug: "epos-pochta-launch",
    status: "published",
    category: "company",
    publishedAt: "2026-03-01T09:00:00.000Z",
    coverImage: "/images/home/needs/parcels.png",
    tags: ["company", "launch", "service"],
    locales: {
      uz: {
        title: "EPOS POCHTA Oʻzbekiston boʻylab ishga tushdi",
        excerpt:
          "Zamonaviy kuryerlik yetkazib berish: olib ketish, eshikgacha yetkazish, statuslar va biznes yechimlari — ochiq tariflarsiz, individual hisob bilan.",
        body: [
          "EPOS POCHTA Oʻzbekiston Respublikasi hududida kuryerlik yetkazib berish xizmatini rasmiy ishga tushirdi. Biz shaxsiy mijozlar, internet-doʻkonlar va kompaniyalar uchun tushunarli jarayonni taklif etamiz: joʻnatmani olib ketamiz, yoʻnalish boʻylab kuzatamiz va qabul qiluvchiga yetkazamiz.",
          "## Kimlar uchun",
          "Xizmat hujjatlar, pochtalar va ruxsat etilgan tovarlarni yuboruvchilar uchun moʻljallangan. Agar punktga borish noqulay boʻlsa — kuryer chaqirish va eshikgacha yetkazish rejimlaridan foydalanishingiz mumkin. Biznes mijozlar uchun muntazam olib ketish, ommaviy joʻnatmalar va hisobotlar alohida kelishiladi.",
          "## Qanday ishlaydi",
          "Soʻrov qoldirasiz yoki menejer bilan bogʻlanasiz, yoʻnalish va joʻnatma parametrlarini aniqlaysiz, keyin olib ketish yoki punkt orqali topshiruvni kelishasiz. Har bosqichda status haqida xabar beriladi — trek-raqam orqali kuzatuv sahifasi va qoʻllab-quvvatlash mavjud.",
          "## Narx qanday belgilanadi",
          "Saytda ochiq tarif jadvali va avtohisob yoʻq. Yoʻnalish, ogʻirlik, oʻlcham, yetkazish usuli va hajmga qarab menejer individual hisobni tayyorlaydi. «Narx soʻrash» formasida parametrlarni qoldiring — siz bilan bogʻlanamiz.",
          "## Keyingi qadam",
          "Bosh sahifadan geografiya tekshiruvi, xizmatlar katalogi yoki biznes arizasiga oʻting. Savollar boʻyicha telefon yoki Telegram orqali qoʻllab-quvvatlashga murojaat qilishingiz mumkin.",
        ],
      },
      ru: {
        title: "EPOS POCHTA запустила доставку по Узбекистану",
        excerpt:
          "Современная курьерская доставка: забор, до двери, статусы и бизнес-решения — без открытых тарифов, с индивидуальным расчётом.",
        body: [
          "EPOS POCHTA официально запустила курьерскую доставку по территории Республики Узбекистан. Мы предлагаем понятный процесс для частных клиентов, интернет-магазинов и компаний: забираем отправление, сопровождаем по маршруту и доставляем получателю.",
          "## Для кого сервис",
          "Услуга подходит для документов, посылок и разрешённых к перевозке товаров. Если неудобно ехать в пункт — доступны вызов курьера и доставка до двери. Для бизнеса отдельно согласуются регулярный забор, массовые отправления и отчётность.",
          "## Как это работает",
          "Оставляете запрос или связываетесь с менеджером, уточняете маршрут и параметры отправления, согласуете забор или сдачу в пункте. На каждом этапе сообщаем статус — доступны страница отслеживания по трек-номеру и поддержка.",
          "## Как формируется стоимость",
          "На сайте нет открытого тарифного прайса. Для разовой отправки доступен ориентировочный калькулятор; финальную цену подтверждает менеджер. Для бизнеса — заявка на коммерческое предложение.",
          "## Что сделать дальше",
          "На главной можно открыть калькулятор, каталог услуг, доставку по городам или бизнес-заявку. По вопросам обращайтесь в поддержку по телефону или в Telegram.",
        ],
      },
    },
  },
  {
    id: "geography",
    slug: "delivery-across-uzbekistan",
    status: "published",
    category: "geography",
    publishedAt: "2026-04-15T09:00:00.000Z",
    coverImage: "/images/home/needs/regular.png",
    tags: ["geography", "coverage", "routes"],
    locales: {
      uz: {
        title: "Yetkazib berish geografiyasi: shaharlar va rejimlar",
        excerpt:
          "Asosiy viloyatlar va shaharlar boʻylab yoʻnalishlar, toʻrtta yetkazish rejimi va manzilni saytda tekshirish imkoniyati.",
        body: [
          "EPOS POCHTA Oʻzbekistonning asosiy shaharlari va viloyatlari boʻylab yetkazib berishni rivojlantiradi. Aniq muddatlar yoʻnalishga bogʻliq — hisob soʻrovida menejer ularni tasdiqlaydi. Maqsadimiz: mijozga yaqin, tushunarli va kuzatiladigan logistika.",
          "## Yetkazish rejimlari",
          "Ombor—ombor, ombor—eshik, eshik—ombor va eshik—eshik rejimlari mavjud. Bu shaxsiy mijozlarga ham, doʻkonlarga ham moslashuvchan sxemani tanlash imkonini beradi: punkt orqali yoki toʻgʻridan-toʻgʻri manzilga.",
          "## Manzilni qanday tekshirish mumkin",
          "Bosh sahifadagi geografiya blokida shahar yoki tuman nomini qidirib, xizmat qamroviga oid maʼlumotni koʻrishingiz mumkin. Agar manzil roʻyxatda boʻlmasa, forma orqali soʻrov qoldiring — menejer imkoniyatni aniqlaydi.",
          "## Biznes yoʻnalishlari",
          "Muntazam joʻnatmalar uchun individual yoʻnalishlar va jadval kelishiladi. Internet-doʻkonlar va kompaniyalar oylik hajm, shaharlar va SLA ni «Biznes uchun» arizasida koʻrsatishi mumkin.",
          "## Muhim eslatma",
          "Geografiya bosqichma-bosqich kengayadi. Eng soʻnggi mavjudlikni sayt yoki qoʻllab-quvvatlash orqali tekshirishni tavsiya qilamiz — ochiq muddat va narx jadvallari eʼlon qilinmaydi.",
        ],
      },
      ru: {
        title: "География доставки: города и режимы",
        excerpt:
          "Маршруты по ключевым областям и городам, четыре режима доставки и проверка адреса на сайте.",
        body: [
          "EPOS POCHTA развивает доставку по ключевым городам и областям Узбекистана. Конкретные сроки зависят от направления — менеджер подтверждает их при расчёте. Наша цель — близкая, понятная и отслеживаемая логистика для клиента.",
          "## Режимы доставки",
          "Доступны режимы склад—склад, склад—дверь, дверь—склад и дверь—дверь. Это позволяет выбрать удобную схему и частным клиентам, и магазинам: через пункт или напрямую по адресу.",
          "## Как проверить адрес",
          "В блоке географии на главной можно найти город или район и увидеть информацию по покрытию. Если адреса нет в списке, оставьте запрос через форму — менеджер уточнит возможность.",
          "## Направления для бизнеса",
          "Для регулярных отправлений согласуются индивидуальные маршруты и график. Интернет-магазины и компании могут указать месячный объём, города и SLA в заявке на странице «Для бизнеса».",
          "## Важно знать",
          "География расширяется поэтапно. Актуальную доступность лучше проверять на сайте или через поддержку — открытые таблицы сроков и тарифов не публикуются.",
        ],
      },
    },
  },
  {
    id: "business-api",
    slug: "business-and-api",
    status: "published",
    category: "business",
    publishedAt: "2026-05-20T09:00:00.000Z",
    coverImage: "/images/home/needs/goods.png",
    tags: ["business", "api", "ecommerce"],
    locales: {
      uz: {
        title: "Biznes va API: ommaviy joʻnatmalar uchun yechim",
        excerpt:
          "Internet-doʻkonlar va kompaniyalar uchun muntazam olib ketish, qaytarishlar, yetkazib berishda toʻlov, hisobotlar va integratsiya.",
        body: [
          "EPOS POCHTA internet-doʻkonlar, ijtimoiy tarmoq sotuvchilari va muntazam joʻnatmali kompaniyalar uchun alohida yondashuvni taklif etadi. Maqsad — operatsiyalarni soddalashtirish: olib ketishdan hisobotgacha bitta jarayonda.",
          "## Nima kiradi",
          "Muntazam olib ketish, ommaviy joʻnatmalar, eshikgacha yetkazish, qaytarishlar va kelishilgan ssenariylarda yetkazib berishda toʻlov. Ajratilgan qoʻllab-quvvatlash va shaxsiy shartlar — shartnoma bosqichida muhokama qilinadi.",
          "## API va avtomatlashtirish",
          "Integratsiya orqali buyurtmalarni uzatish, statuslarni olish va ichki tizimlar bilan bogʻlash mumkin. Texnik tafsilotlar ulanishdan oldin menejer bilan kelishiladi — ochiq «oʻz-oʻzini ulash» hujjati bosqichma-bosqich chiqariladi.",
          "## Qanday ulanish",
          "«Biznes uchun» sahifasidagi forma orqali kompaniya, aloqa va oylik hajmni qoldiring. Keyin jarayonlarni aniqlaymiz, taklif tayyorlaymiz va ishga tushirish bosqichlarini kelishamiz. Ochiq tarif jadvali yoʻq — shartlar individual.",
          "## Kimlarga mos",
          "Kunlik yoki haftalik joʻnatmali doʻkonlar, hujjat aylanishi yuqori kompaniyalar va API orqali logistikani bogʻlamoqchi jamoalar. Savollar boʻyicha biznes arizasi yoki telefon orqali bogʻlaning.",
        ],
      },
      ru: {
        title: "Бизнес и API: решение для массовых отправлений",
        excerpt:
          "Регулярный забор, возвраты, наложенный платёж, отчётность и интеграция для интернет-магазинов и компаний.",
        body: [
          "EPOS POCHTA предлагает отдельный подход для интернет-магазинов, продавцов в соцсетях и компаний с регулярными отправлениями. Цель — упростить операции: от забора до отчётности в одном процессе.",
          "## Что входит",
          "Регулярный забор, массовые отправления, доставка до двери, возвраты и наложенный платёж в согласованных сценариях. Выделенная поддержка и персональные условия обсуждаются на этапе договора.",
          "## API и автоматизация",
          "Интеграция позволяет передавать заказы, получать статусы и связывать логистику с внутренними системами. Технические детали согласуются с менеджером до подключения — открытая документация «подключи сам» выходит поэтапно.",
          "## Как подключиться",
          "Оставьте компанию, контакты и месячный объём в форме на странице «Для бизнеса». Затем уточним процессы, подготовим предложение и согласуем этапы запуска. Открытого тарифного прайса нет — условия индивидуальные.",
          "## Кому подходит",
          "Магазины с ежедневными или еженедельными отправлениями, компании с активным документооборотом и команды, которым нужна связка логистики через API. По вопросам — бизнес-заявка или звонок.",
        ],
      },
    },
  },
  {
    id: "tracking-statuses",
    slug: "tracking-and-status-updates",
    status: "published",
    category: "product",
    publishedAt: "2026-06-10T09:00:00.000Z",
    coverImage: "/images/home/needs/documents.png",
    tags: ["tracking", "product", "support"],
    locales: {
      uz: {
        title: "Kuzatuv va statuslar: joʻnatma qayerda ekanini biling",
        excerpt:
          "Trek-raqam, statuslar zanjiri va qoʻllab-quvvatlash — mijoz har bosqichda nima boʻlayotganini tushunishi uchun.",
        body: [
          "Yetkazib berishda eng koʻp soʻraladigan savol — «pochta qayerda?». EPOS POCHTA trek-raqam va statuslar orqali jarayonni shaffof qilishga intiladi. Kuzatuv sahifasi API ulanishiga tayyor; hozircha demoni 000000 raqami bilan koʻrish mumkin.",
          "## Trek-raqam qayerdan olinadi",
          "Raqam odatda topshirish kvitansiyasida yoki SMS xabarida koʻrsatiladi. Uni saytdagi «Kuzatish» sahifasiga kiriting. Format: kamida 6 belgi — harflar, raqamlar yoki chiziqcha.",
          "## Qanday statuslar boʻladi",
          "Tipik zanjir: qabul qilindi → yoʻlda → yetkazishga chiqdi → yetkazildi. Baʼzi hollarda yetkazish urinishi yoki qaytarish statuslari ham boʻlishi mumkin — ular xizmat shartlariga mos keladi.",
          "## Agar status chiqmasa",
          "Raqamni tekshiring yoki qoʻllab-quvvatlashga qoʻngʻiroq qiling. API toʻliq ulanmaguncha baʼzi raqamlar uchun «tez orada» xabari chiqishi mumkin — bu normal stub holat.",
          "## Maslahat",
          "Demo interfeysni koʻrish uchun 000000 ni kiriting. Haqiqiy joʻnatmalar boʻyicha yordam — telefon yoki Telegram orqali.",
        ],
      },
      ru: {
        title: "Отслеживание и статусы: где ваша посылка",
        excerpt:
          "Трек-номер, цепочка статусов и поддержка — чтобы клиент понимал, что происходит на каждом этапе.",
        body: [
          "Самый частый вопрос при доставке — «где посылка?». EPOS POCHTA стремится сделать процесс прозрачным через трек-номер и статусы. Страница отслеживания готова к подключению API; демо уже можно посмотреть по номеру 000000.",
          "## Откуда взять трек-номер",
          "Номер обычно указан в квитанции при сдаче или приходит в SMS. Введите его на странице «Отследить». Формат: минимум 6 символов — буквы, цифры или дефис.",
          "## Какие бывают статусы",
          "Типичная цепочка: принято → в пути → передано курьеру → доставлено. В отдельных случаях возможны статусы попытки вручения или возврата — по условиям оказания услуг.",
          "## Если статус не отображается",
          "Проверьте номер или позвоните в поддержку. Пока API полностью не подключён, для части номеров может показываться сообщение «скоро будет доступно» — это штатный stub.",
          "## Совет",
          "Чтобы увидеть демо интерфейса, введите 000000. По реальным отправлениям поможем по телефону или в Telegram.",
        ],
      },
    },
  },
  {
    id: "door-delivery",
    slug: "door-to-door-delivery",
    status: "published",
    category: "product",
    publishedAt: "2026-07-02T09:00:00.000Z",
    coverImage: "/images/home/needs/parcels.png",
    tags: ["door", "courier", "product"],
    locales: {
      uz: {
        title: "Eshikdan eshikgacha: qulay yetkazish",
        excerpt:
          "Kuryer chaqirish va eshikgacha yetkazish — punktga bormasdan joʻnatmani yuborish va qabul qilish.",
        body: [
          "Koʻplab mijozlar uchun eng qulay variant — joʻnatmani uy yoki ofisdan topshirish va qabul qiluvchiga eshikgacha yetkazish. EPOS POCHTA eshik—eshik va aralash rejimlarni qoʻllab-quvvatlaydi.",
          "## Qachon tanlash kerak",
          "Vaqt cheklangan boʻlsa, ogʻir pochta boʻlsa yoki punkt uzoqda boʻlsa — kuryer chaqirish va eshikgacha yetkazish mos keladi.",
          "## Qanday soʻrash",
          "Kalkulyator yoki «Narx soʻrash» formasida rejimni koʻrsating. Yakuniy muddat va shartlar menejer bilan kelishiladi.",
        ],
      },
      ru: {
        title: "От двери до двери: удобная доставка",
        excerpt:
          "Вызов курьера и доставка до двери — отправить и получить посылку без поездки в пункт.",
        body: [
          "Для многих клиентов самый удобный вариант — сдать отправление из дома или офиса и доставить получателю до двери. EPOS POCHTA поддерживает режим дверь—дверь и смешанные схемы.",
          "## Когда это уместно",
          "Если мало времени, посылка тяжёлая или пункт далеко — вызов курьера и доставка до двери подходят лучше всего.",
          "## Как запросить",
          "Укажите режим в калькуляторе или форме «Запросить стоимость». Срок и условия подтверждает менеджер.",
        ],
      },
    },
  },
  {
    id: "returns-cod",
    slug: "returns-and-cash-on-delivery",
    status: "published",
    category: "business",
    publishedAt: "2026-08-12T09:00:00.000Z",
    coverImage: "/images/home/needs/goods.png",
    tags: ["returns", "cod", "business"],
    locales: {
      uz: {
        title: "Qaytarishlar va yetkazib berishda toʻlov",
        excerpt:
          "Internet-doʻkonlar uchun qaytarish sxemalari va kelishilgan hollarda yetkazib berishda toʻlov.",
        body: [
          "Elektron tijorat uchun muhim qism — muvaffaqiyatsiz yetkazishdan keyin qaytarish va baʼzi ssenariylarda yetkazib berishda toʻlov. EPOS POCHTA bu jarayonlarni shartnoma asosida kelishadi.",
          "## Nima muhokama qilinadi",
          "Qaytarish shartlari, toʻlov usullari, hisobotlar va SLA — ochiq tarif jadvali yoʻq, shartlar individual.",
          "## Keyingi qadam",
          "«Biznes uchun» sahifasida hajm va ehtiyojlarni qoldiring — menejer taklif tayyorlaydi.",
        ],
      },
      ru: {
        title: "Возвраты и наложенный платёж",
        excerpt:
          "Схемы возвратов для интернет-магазинов и наложенный платёж в согласованных сценариях.",
        body: [
          "Для e-commerce важны возвраты после неуспешной доставки и наложенный платёж в отдельных сценариях. EPOS POCHTA согласовывает эти процессы в договоре.",
          "## Что обсуждается",
          "Условия возврата, способы оплаты, отчётность и SLA — без открытого прайса, условия индивидуальные.",
          "## Что дальше",
          "Оставьте объём и потребности на странице «Для бизнеса» — менеджер подготовит предложение.",
        ],
      },
    },
  },
  {
    id: "how-to-calculate",
    slug: "how-to-estimate-delivery-cost",
    status: "published",
    category: "product",
    publishedAt: "2026-08-20T09:00:00.000Z",
    coverImage: "/images/home/needs/documents.png",
    tags: ["calculator", "pricing", "guide"],
    locales: {
      uz: {
        title: "Yetkazib berish narxini qanday taxminiy hisoblash mumkin",
        excerpt:
          "Kalkulyator orientiri, menejer tasdigʻi va biznes arizasi oʻrtasidagi farq — ochiq tarifsiz.",
        body: [
          "EPOS POCHTA saytida ochiq tarif jadvali yoʻq. Buning oʻrniga ikkita yoʻl bor: bir martalik joʻnatma uchun kalkulyator va kompaniyalar uchun tijorat taklifi arizasi.",
          "## Kalkulyator qanday ishlaydi",
          "Shaharlar juftligini, ogʻirlik va oʻlchamlarni kiriting. Tizim taxminiy narx diapazoni va muddatni koʻrsatadi. Bu oferta emas — yakuniy qiymatni menejer tasdiqlaydi.",
          "## Qachon biznes formasiga oʻtish kerak",
          "Agar oyiga koʻp joʻnatma, API, muntazam olib ketish yoki COD kerak boʻlsa — «Narx soʻrash» / tijorat taklifi sahifasidan foydalaning.",
          "## Shaharlar",
          "Toshkent, Samarqand, Buxoro va boshqa shaharlar boʻyicha alohida sahifalar «Yetkazib berish shaharlari» boʻlimida. Kerakli shaharni tanlab, kalkulyatorga oʻting.",
          "## Keyingi qadam",
          "Kalkulyatorni oching yoki savol-javoblar boʻlimidan foydalaning. Savollar boʻyicha — aloqa sahifasi.",
        ],
      },
      ru: {
        title: "Как ориентировочно рассчитать стоимость доставки",
        excerpt:
          "Чем отличаются калькулятор, подтверждение менеджера и B2B-заявка — без публичных тарифов.",
        body: [
          "На сайте EPOS POCHTA нет открытой тарифной таблицы. Есть два пути: калькулятор для разовой отправки и заявка на коммерческое предложение для компаний.",
          "## Как работает калькулятор",
          "Укажите пару городов, вес и габариты. Система покажет ориентировочный диапазон цены и срока. Это не оферта — итог подтверждает менеджер.",
          "## Когда нужна бизнес-форма",
          "Если нужен объём, API, регулярный забор или COD — используйте страницу коммерческого предложения.",
          "## Города",
          "Отдельные страницы по Ташкенту, Самарканду, Бухаре и другим городам — в разделе «Доставка по городам». Выберите город и перейдите в калькулятор.",
          "## Что дальше",
          "Откройте калькулятор или FAQ. По вопросам — страница контактов.",
        ],
      },
    },
  },
  {
    id: "city-network",
    slug: "delivery-cities-uzbekistan",
    status: "published",
    category: "geography",
    publishedAt: "2026-09-01T09:00:00.000Z",
    coverImage: "/images/home/needs/goods.png",
    tags: ["geography", "cities", "routes"],
    locales: {
      uz: {
        title: "Oʻzbekiston shaharlari boʻylab yetkazib berish tarmogʻi",
        excerpt:
          "Toshkent, Samarqand, Andijon va boshqa shaharlar: orientir muddatlar va kalkulyator orqali hisob.",
        body: [
          "EPOS POCHTA asosiy shaharlar boʻylab kuryerlik yoʻnalishlarini rivojlantiradi. Har bir shahar uchun alohida sahifa ochildi: qisqa tavsif, FAQ va kalkulyatorga havola.",
          "## Nima uchun alohida sahifalar",
          "Mijozlar tez-tez «Samarqandga yetkazib berish» yoki «Buxoroga kuryer» deb qidiradi. Shahar sahifasi yoʻnalishni tushuntiradi va hisobga olib boradi — ochiq praysiz.",
          "## Qanday foydalanish",
          "«Yetkazib berish shaharlari» roʻyxatidan shaharni tanlang, taxminiy muddatni oʻqing va kalkulyatorda «qayerga» maydonini toʻldiring.",
          "## Biznes",
          "Doimiy oqimlar uchun tijorat taklifi formasida shaharlar va oylik hajmni koʻrsating.",
        ],
      },
      ru: {
        title: "Сеть доставки по городам Узбекистана",
        excerpt:
          "Ташкент, Самарканд, Андижан и другие города: ориентиры по срокам и расчёт через калькулятор.",
        body: [
          "EPOS POCHTA развивает курьерские направления по ключевым городам. Для каждого города открыта отдельная страница: краткое описание, FAQ и ссылка на калькулятор.",
          "## Зачем отдельные страницы",
          "Клиенты часто ищут «доставка в Самарканд» или «курьер в Бухару». Городская страница объясняет направление и ведёт к расчёту — без публичного прайса.",
          "## Как пользоваться",
          "Выберите город в разделе «Доставка по городам», прочитайте ориентир по сроку и укажите город в калькуляторе.",
          "## Для бизнеса",
          "Для регулярных потоков укажите города и месячный объём в форме коммерческого предложения.",
        ],
      },
    },
  },
];
