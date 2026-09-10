/**
 * Delivery hubs for Aviasales-style route pages.
 * Public URLs: /delivery/{fromCode}/{toCode}/ (e.g. /delivery/tas/skd/)
 * Index: /delivery/ — lists outbound routes per hub.
 */
export interface DeliveryCity {
  slug: string;
  /** Short route code (Aviasales-style), e.g. tas, skd */
  code: string;
  nameEn: string;
  nameRu: string;
  nameUz: string;
  /** Settlement id for calculator `to=` prefill when available */
  settlementId?: string;
  etaHintRu: string;
  etaHintUz: string;
  leadRu: string;
  leadUz: string;
  bodyRu: string[];
  bodyUz: string[];
  faqRu: Array<{ question: string; answer: string }>;
  faqUz: Array<{ question: string; answer: string }>;
  metaTitleRu: string;
  metaTitleUz: string;
  metaDescriptionRu: string;
  metaDescriptionUz: string;
}

export const DELIVERY_CITIES: DeliveryCity[] = [
  {
    slug: "tashkent",
    code: "tas",
    nameEn: "Tashkent",
    nameRu: "Ташкент",
    nameUz: "Toshkent",
    settlementId: "tashkent_city",
    etaHintRu: "По городу ориентир чаще всего в пределах 1–2 рабочих дней после забора.",
    etaHintUz: "Shahar ichida odatda olib ketishdan keyin 1–2 ish kuni ichida yetkaziladi.",
    leadRu:
      "Курьер в Ташкенте и доставка из столицы по Узбекистану: документы, посылки, забор курьером. Ориентир в калькуляторе — итог подтверждает менеджер.",
    leadUz:
      "Toshkentda kuryer va poytaxtdan Oʻzbekiston boʻylab yetkazib berish: hujjatlar, pochta, kuryer chaqirish. Kalkulyatorda orientir — yakuniy narxni menejer tasdiqlaydi.",
    bodyRu: [
      "Ташкент — основной хаб сети EPOS POCHTA. Здесь удобно вызвать курьера, сдать отправление в согласованной точке или заказать доставку до двери.",
      "Для частных клиентов — разовые документы и посылки. Для интернет-магазинов и компаний — регулярный забор, статусы и индивидуальные условия без публичного прайса.",
      "Рассчитайте ориентир в калькуляторе (Ташкент как пункт отправления или назначения) или откройте маршруты вроде Ташкент — Самарканд. Это не оферта: менеджер подтвердит итог.",
    ],
    bodyUz: [
      "Toshkent — EPOS POCHTA tarmogʻining asosiy markazi. Bu yerda kuryer chaqirish, kelishilgan nuqtada topshirish yoki eshikgacha yetkazish qulay.",
      "Jismoniy shaxslar uchun bir martalik hujjat va pochta. Internet-doʻkonlar va kompaniyalar uchun muntazam olib ketish, statuslar va ochiq praysiz individual shartlar.",
      "Kalkulyatorda Toshkentni tanlab orientir oling yoki Toshkent — Samarqand kabi yoʻnalish sahifalariga oʻting. Bu oferta emas: menejer yakuniy natijani tasdiqlaydi.",
    ],
    faqRu: [
      {
        question: "Есть курьер по Ташкенту?",
        answer:
          "Да. Доступны вызов курьера и доставка по городу в согласованных районах. Адрес уточните при расчёте.",
      },
      {
        question: "Можно ли забрать отправление из офиса в Ташкенте?",
        answer:
          "Да, доступен вызов курьера. Для регулярных заборов оставьте бизнес-заявку.",
      },
      {
        question: "Как узнать ориентир по цене?",
        answer:
          "Откройте калькулятор, укажите Ташкент как пункт отправления или назначения, вес и габариты. Или перейдите на страницу нужного маршрута.",
      },
      {
        question: "Доставляете из Ташкента в регионы?",
        answer:
          "Да. Выберите направление (например, в Самарканд, Бухару, Фергану) на сайте или в калькуляторе.",
      },
    ],
    faqUz: [
      {
        question: "Toshkentda kuryer bormi?",
        answer:
          "Ha. Kuryer chaqirish va shahar ichida kelishilgan tumanlarda yetkazish mumkin. Manzilni hisobda aniqlang.",
      },
      {
        question: "Toshkentdagi ofisdan joʻnatmani olib ketish mumkinmi?",
        answer:
          "Ha, kuryer chaqirish mumkin. Muntazam olib ketish uchun biznes arizasini qoldiring.",
      },
      {
        question: "Narx orientirini qanday bilaman?",
        answer:
          "Kalkulyatorda Toshkentni joʻnatish yoki qabul punkti sifatida tanlang. Yoki kerakli yoʻnalish sahifasiga oʻting.",
      },
      {
        question: "Toshkentdan viloyatlarga yetkazasizmi?",
        answer:
          "Ha. Samarqand, Buxoro, Fargʻona kabi yoʻnalishlarni saytda yoki kalkulyatorda tanlang.",
      },
    ],
    metaTitleRu: "Курьер Ташкент — доставка посылок и документов",
    metaTitleUz: "Toshkent pochta — kuryer va yetkazib berish",
    metaDescriptionRu:
      "Курьер в Ташкенте и доставка из столицы по Узбекистану. Калькулятор ориентира, забор курьером, статусы. Без публичных тарифов.",
    metaDescriptionUz:
      "Toshkentda kuryer va poytaxtdan Oʻzbekiston boʻylab yetkazib berish. Kalkulyator, kuryer chaqirish, statuslar. Ochiq tarifsiz.",
  },
  {
    slug: "samarkand",
    code: "skd",
    nameEn: "Samarkand",
    nameRu: "Самарканд",
    nameUz: "Samarqand",
    settlementId: "samarkand_city",
    etaHintRu: "Межрегиональные отправления в Самарканд обычно занимают несколько рабочих дней — точный срок подтвердит менеджер.",
    etaHintUz: "Samarqandga viloyatlararo joʻnatmalar odatda bir necha ish kunini oladi — aniq muddatni menejer tasdiqlaydi.",
    leadRu:
      "Доставка в Самарканд: посылки, документы и курьер из Ташкента и других городов. Ориентир в калькуляторе — итог подтверждает менеджер.",
    leadUz:
      "Samarqandga yetkazib berish: pochta, hujjatlar va Toshkentdan kuryer. Kalkulyatorda orientir — yakuniy narxni menejer tasdiqlaydi.",
    bodyRu: [
      "Самарканд — ключевое направление сети. Отправьте посылку или документы в город либо заберите груз для других регионов.",
      "Из Ташкента удобен коридор Ташкент — Самарканд (~280 км): отдельная страница маршрута и тот же калькулятор. Для магазинов — регулярные отправки без публичного прайса.",
      "Укажите «Самарканд» в калькуляторе или откройте /delivery/tas/skd/ — это ориентир, не оферта. Финал — после менеджера.",
    ],
    bodyUz: [
      "Samarqand — tarmoqning asosiy yoʻnalishlaridan. Shaharga pochta yoki hujjat yuboring yoki boshqa hududlarga yukni olib keting.",
      "Toshkentdan Toshkent — Samarqand (~280 km) yoʻlagi qulay: alohida yoʻnalish sahifasi va kalkulyator. Doʻkonlar uchun — ochiq praysiz muntazam joʻnatmalar.",
      "Kalkulyatorda «Samarqand»ni tanlang yoki /delivery/tas/skd/ ni oching — bu orientir, oferta emas. Yakun — menejerdan keyin.",
    ],
    faqRu: [
      {
        question: "Доставляете ли до двери в Самарканде?",
        answer:
          "Да, режим до двери доступен при согласовании адреса. Уточните при расчёте.",
      },
      {
        question: "Как отправить из Ташкента в Самарканд?",
        answer:
          "Откройте страницу маршрута Ташкент — Самарканд или калькулятор с этими пунктами. Ориентир не является офертой.",
      },
      {
        question: "Как рассчитать отправку в Самарканд?",
        answer:
          "В калькуляторе укажите Самарканд как город получения, вес и габариты — увидите ориентир.",
      },
      {
        question: "Есть ли пункт приёма в Самарканде?",
        answer:
          "Схема сдачи и выдачи согласуется менеджером по направлению. Оставьте заявку с маршрутом.",
      },
    ],
    faqUz: [
      {
        question: "Samarqandda eshikgacha yetkazasizmi?",
        answer:
          "Ha, manzil kelishilganda eshikgacha rejim mavjud. Hisobda aniqlang.",
      },
      {
        question: "Toshkentdan Samarqandga qanday yuboraman?",
        answer:
          "Toshkent — Samarqand yoʻnalish sahifasini yoki shu punktlar bilan kalkulyatorni oching. Orientir oferta emas.",
      },
      {
        question: "Samarqandga joʻnatmani qanday hisoblayman?",
        answer:
          "Kalkulyatorda Samarqandni qabul shahri, ogʻirlik va oʻlchamlarni kiriting — orientir chiqadi.",
      },
      {
        question: "Samarqandda qabul punkti bormi?",
        answer:
          "Topshirish va berish sxemasi yoʻnalish boʻyicha menejer bilan kelishiladi. Yoʻnalish bilan ariza qoldiring.",
      },
    ],
    metaTitleRu: "Доставка в Самарканд — посылки и курьер",
    metaTitleUz: "Samarqandga yetkazib berish — pochta va kuryer",
    metaDescriptionRu:
      "Доставка в Самарканд: посылки, документы, курьер из Ташкента. Калькулятор ориентира и маршрут tas/skd. Без публичных тарифов.",
    metaDescriptionUz:
      "Samarqandga yetkazib berish: pochta, hujjatlar, Toshkentdan kuryer. Kalkulyator va tas/skd yoʻnalishi. Ochiq tarifsiz.",
  },
  {
    slug: "bukhara",
    code: "bhk",
    nameEn: "Bukhara",
    nameRu: "Бухара",
    nameUz: "Buxoro",
    settlementId: "bukhara_city",
    etaHintRu: "Срок до Бухары зависит от пункта отправления — ориентир в калькуляторе, подтверждение у менеджера.",
    etaHintUz: "Buxorogacha muddat joʻnatish punktiga bogʻliq — orientir kalkulyatorda, tasdiq menejerda.",
    leadRu:
      "Доставка в Бухару: посылки, документы и курьер из Ташкента. Ориентир онлайн — финал после менеджера.",
    leadUz:
      "Buxoroga yetkazib berish: pochta, hujjatlar va Toshkentdan kuryer. Onlayn orientir — yakun menejerdan keyin.",
    bodyRu: [
      "Бухара — межрегиональное направление EPOS POCHTA. Сопровождаем статусами, согласуем забор и выдачу.",
      "Коридор Ташкент — Бухара (~560 км) на отдельной странице /delivery/tas/bhk/. Для бизнеса — объём, регулярность и API без таблицы тарифов.",
      "Укажите Бухару в калькуляторе «куда» или «откуда». Показанная сумма — ориентир, не оферта.",
    ],
    bodyUz: [
      "Buxoro — EPOS POCHTA viloyatlararo yoʻnalishi. Statuslar, olib ketish va berishni kelishamiz.",
      "Toshkent — Buxoro (~560 km) yoʻlagi /delivery/tas/bhk/ sahifasida. Biznes uchun — tarifsiz hajm, muntazamlilik va API.",
      "Kalkulyatorda Buxoroni «qayerga» yoki «qayerdan» deb kiriting. Koʻrsatilgan summa — orientir, oferta emas.",
    ],
    faqRu: [
      {
        question: "Можно ли отправить документы в Бухару?",
        answer:
          "Да, документы принимаем в рамках ограничений сервиса. Уточните упаковку при оформлении.",
      },
      {
        question: "Как отправить из Ташкента в Бухару?",
        answer:
          "Откройте маршрут Ташкент — Бухара или калькулятор с этими пунктами. Ориентир не оферта.",
      },
      {
        question: "Есть ли наложенный платёж в Бухару?",
        answer:
          "COD доступен для бизнеса после согласования. Оставьте коммерческую заявку.",
      },
      {
        question: "Как подтвердить финальную цену?",
        answer:
          "После ориентира в калькуляторе запросите стоимость у менеджера или оставьте B2B-заявку.",
      },
    ],
    faqUz: [
      {
        question: "Buxoroga hujjat yuborish mumkinmi?",
        answer:
          "Ha, xizmat cheklovlari doirasida hujjatlar qabul qilinadi. Rasmiylashtirishda qadoqlashni aniqlang.",
      },
      {
        question: "Toshkentdan Buxoroga qanday yuboraman?",
        answer:
          "Toshkent — Buxoro yoʻnalishini yoki shu punktlar bilan kalkulyatorni oching. Orientir oferta emas.",
      },
      {
        question: "Buxoroga yetkazib berishda toʻlov bormi?",
        answer:
          "COD biznes uchun kelishuvdan keyin mavjud. Tijorat arizasini qoldiring.",
      },
      {
        question: "Yakuniy narxni qanday tasdiqlayman?",
        answer:
          "Kalkulyator orientiridan keyin menejerdan narx soʻrang yoki B2B ariza qoldiring.",
      },
    ],
    metaTitleRu: "Доставка в Бухару — посылки и курьер",
    metaTitleUz: "Buxoroga yetkazib berish — pochta va kuryer",
    metaDescriptionRu:
      "Доставка в Бухару: посылки, документы, курьер из Ташкента. Калькулятор и маршрут tas/bhk. Без публичных тарифов.",
    metaDescriptionUz:
      "Buxoroga yetkazib berish: pochta, hujjatlar, Toshkentdan kuryer. Kalkulyator va tas/bhk. Ochiq tarifsiz.",
  },
  {
    slug: "namangan",
    code: "nma",
    nameEn: "Namangan",
    nameRu: "Наманган",
    nameUz: "Namangan",
    settlementId: "namangan_city",
    etaHintRu: "Доставка в Наманган — межрегиональный маршрут; срок уточняется при расчёте.",
    etaHintUz: "Namanganga yetkazib berish — viloyatlararo yoʻnalish; muddat hisobda aniqlanadi.",
    leadRu:
      "Доставка в Наманган: посылки и документы по Ферганской долине. Ориентир в калькуляторе EPOS POCHTA.",
    leadUz:
      "Namanganga yetkazib berish: Fargʻona vodiysida pochta va hujjatlar. EPOS POCHTA kalkulyatorida orientir.",
    bodyRu: [
      "Наманган связан межрегиональными направлениями. Подходят документы, посылки и согласованные товарные отправления.",
      "Из Ташкента — коридор /delivery/tas/nma/ (~300 км). Магазины долины могут запросить регулярный забор без публичного прайса.",
      "Разовая отправка — калькулятор; объём — бизнес-заявка. Ориентир на сайте не оферта.",
    ],
    bodyUz: [
      "Namangan viloyatlararo yoʻnalishlar bilan bogʻlangan. Hujjatlar, pochta va kelishilgan tovar joʻnatmalari mos.",
      "Toshkentdan — /delivery/tas/nma/ (~300 km). Vodiy doʻkonlari ochiq praysiz muntazam olib ketishni soʻrashi mumkin.",
      "Bir martalik — kalkulyator; hajm — biznes ariza. Saytdagi orientir oferta emas.",
    ],
    faqRu: [
      {
        question: "Доставляете ли в районы Наманганской области?",
        answer:
          "Возможность по конкретному населённому пункту уточняет менеджер при заявке.",
      },
      {
        question: "Как отправить из Ташкента в Наманган?",
        answer:
          "Откройте маршрут Ташкент — Наманган или калькулятор с этими пунктами.",
      },
      {
        question: "Можно ли отследить посылку в Наманган?",
        answer:
          "После оформления вы получите трек-номер для страницы отслеживания.",
      },
      {
        question: "Нужна ли жёсткая упаковка?",
        answer:
          "Да, упаковка должна защищать вложение. Требования зависят от типа груза.",
      },
    ],
    faqUz: [
      {
        question: "Namangan viloyati tumanlariga yetkazasizmi?",
        answer:
          "Aniq aholi punkti boʻyicha imkoniyatni menejer arizada aniqlaydi.",
      },
      {
        question: "Toshkentdan Namanganga qanday yuboraman?",
        answer:
          "Toshkent — Namangan yoʻnalishini yoki shu punktlar bilan kalkulyatorni oching.",
      },
      {
        question: "Namanganga pochtani kuzatish mumkinmi?",
        answer:
          "Rasmiylashtirishdan keyin kuzatuv sahifasi uchun trek-raqam beriladi.",
      },
      {
        question: "Qattiq qadoqlash kerakmi?",
        answer:
          "Ha, qadoq ichidagini himoya qilishi kerak. Talablar yuk turiga bogʻliq.",
      },
    ],
    metaTitleRu: "Доставка в Наманган — посылки и курьер",
    metaTitleUz: "Namanganga yetkazib berish — pochta va kuryer",
    metaDescriptionRu:
      "Доставка в Наманган: посылки, документы, курьер из Ташкента. Калькулятор и маршрут tas/nma.",
    metaDescriptionUz:
      "Namanganga yetkazib berish: pochta, hujjatlar, Toshkentdan kuryer. Kalkulyator va tas/nma.",
  },
  {
    slug: "andijan",
    code: "azn",
    nameEn: "Andijan",
    nameRu: "Андижан",
    nameUz: "Andijon",
    settlementId: "andijan_city",
    etaHintRu: "Андижан — направление Ферганской долины; ориентировочный срок смотрите в калькуляторе.",
    etaHintUz: "Andijon — Fargʻona vodiysi yoʻnalishi; taxminiy muddatni kalkulyatorda koʻring.",
    leadRu:
      "Доставка в Андижан: посылки, документы и курьер по долине. Ориентир по весу — в калькуляторе.",
    leadUz:
      "Andijonga yetkazib berish: vodiyda pochta, hujjatlar va kuryer. Ogʻirlik boʻyicha orientir — kalkulyatorda.",
    bodyRu: [
      "Андижан — ключевой город покрытия. Доставляем документы и посылки, поддерживаем статусы на маршруте.",
      "Из Ташкента — /delivery/tas/azn/ (~350 км). Для e-commerce: COD, возвраты и регулярный забор через коммерческую заявку.",
      "Выберите Андижан в калькуляторе — диапазон стоимости без оферты. Финал подтверждает менеджер.",
    ],
    bodyUz: [
      "Andijon — qamrovning asosiy shahri. Hujjat va pochtani yetkazamiz, yoʻnalishda statuslarni qoʻllab-quvvatlaymiz.",
      "Toshkentdan — /delivery/tas/azn/ (~350 km). E-commerce uchun: COD, qaytarishlar va muntazam olib ketish — tijorat arizasi orqali.",
      "Kalkulyatorda Andijonni tanlang — ofertasiz narx diapazoni. Yakunni menejer tasdiqlaydi.",
    ],
    faqRu: [
      {
        question: "Есть ли экспресс в Андижан?",
        answer:
          "Срочность обсуждается индивидуально. Базовый ориентир — в калькуляторе.",
      },
      {
        question: "Как отправить из Ташкента в Андижан?",
        answer:
          "Откройте маршрут Ташкент — Андижан или калькулятор с этими пунктами.",
      },
      {
        question: "Можно ли отправить товар покупателю в Андижан?",
        answer:
          "Да, при соблюдении ограничений по вложению. Для магазинов — бизнес-условия.",
      },
      {
        question: "Как связаться по Андижану?",
        answer:
          "Телефон и Telegram поддержки указаны в контактах; для B2B — форма коммерческого предложения.",
      },
    ],
    faqUz: [
      {
        question: "Andijonga ekspress bormi?",
        answer:
          "Shoshilinchlik individual muhokama qilinadi. Asosiy orientir — kalkulyatorda.",
      },
      {
        question: "Toshkentdan Andijonga qanday yuboraman?",
        answer:
          "Toshkent — Andijon yoʻnalishini yoki shu punktlar bilan kalkulyatorni oching.",
      },
      {
        question: "Andijondagi xaridorga tovar yuborish mumkinmi?",
        answer:
          "Ha, ichidagi narsa cheklovlariga rioya qilinganda. Doʻkonlar uchun — biznes shartlari.",
      },
      {
        question: "Andijon boʻyicha qanday bogʻlanaman?",
        answer:
          "Telefon va Telegram qoʻllab-quvvatlash kontaktlarda; B2B uchun — tijorat taklifi formasi.",
      },
    ],
    metaTitleRu: "Доставка в Андижан — посылки и курьер",
    metaTitleUz: "Andijonga yetkazib berish — pochta va kuryer",
    metaDescriptionRu:
      "Доставка в Андижан: посылки, документы, курьер из Ташкента. Калькулятор и маршрут tas/azn.",
    metaDescriptionUz:
      "Andijonga yetkazib berish: pochta, hujjatlar, Toshkentdan kuryer. Kalkulyator va tas/azn.",
  },
  {
    slug: "fergana",
    code: "feg",
    nameEn: "Fergana",
    nameRu: "Фергана",
    nameUz: "Fargʻona",
    settlementId: "fergana_city",
    etaHintRu: "Фергана связана межрегиональными рейсами; точный ETA подтверждает менеджер.",
    etaHintUz: "Fargʻona viloyatlararo reyslar bilan bogʻlangan; aniq ETA ni menejer tasdiqlaydi.",
    leadRu:
      "Доставка в Фергану: посылки, документы и курьер по долине. Ориентир в калькуляторе — без оферты.",
    leadUz:
      "Fargʻonaga yetkazib berish: vodiyda pochta, hujjatlar va kuryer. Kalkulyatorda orientir — ofertasiz.",
    bodyRu: [
      "Фергана — важное направление долины. Частные и корпоративные сценарии без публикации тарифов.",
      "Из Ташкента — /delivery/tas/feg/ (~320 км). Согласуйте забор, «до двери» и отчётность через менеджера.",
      "Город в быстром выборе калькулятора вместе с Ташкентом, Самаркандом и Андижаном. Ориентир не оферта.",
    ],
    bodyUz: [
      "Fargʻona — vodiy uchun muhim yoʻnalish. Tariflarni eʼlon qilmasdan shaxsiy va korporativ ssenariylar.",
      "Toshkentdan — /delivery/tas/feg/ (~320 km). Olib ketish, «eshikgacha» va hisobotni menejer orqali kelishing.",
      "Shahar kalkulyator tez tanlovida Toshkent, Samarqand va Andijon bilan. Orientir oferta emas.",
    ],
    faqRu: [
      {
        question: "Доставляете ли в Маргилан / Коканд?",
        answer:
          "Населённые пункты рядом уточняются при заявке. Укажите точный город в калькуляторе или форме.",
      },
      {
        question: "Как отправить из Ташкента в Фергану?",
        answer:
          "Откройте маршрут Ташкент — Фергана или калькулятор с этими пунктами.",
      },
      {
        question: "Работаете ли с возвратами из Ферганы?",
        answer:
          "Возвраты доступны в рамках бизнес-условий после подключения.",
      },
      {
        question: "Где посмотреть ориентир цены?",
        answer:
          "На странице калькулятора стоимости доставки.",
      },
    ],
    faqUz: [
      {
        question: "Margʻilon / Qoʻqonga yetkazasizmi?",
        answer:
          "Yaqin aholi punktlari arizada aniqlanadi. Aniq shaharni kalkulyator yoki formada kiriting.",
      },
      {
        question: "Toshkentdan Fargʻonaga qanday yuboraman?",
        answer:
          "Toshkent — Fargʻona yoʻnalishini yoki shu punktlar bilan kalkulyatorni oching.",
      },
      {
        question: "Fargʻonadan qaytarishlar bilan ishlaysizmi?",
        answer:
          "Qaytarishlar ulanishdan keyin biznes shartlari doirasida mavjud.",
      },
      {
        question: "Narx orientirini qayerda koʻraman?",
        answer:
          "Yetkazib berish narxi kalkulyatori sahifasida.",
      },
    ],
    metaTitleRu: "Доставка в Фергану — посылки и курьер",
    metaTitleUz: "Fargʻonaga yetkazib berish — pochta va kuryer",
    metaDescriptionRu:
      "Доставка в Фергану: посылки, документы, курьер из Ташкента. Калькулятор и маршрут tas/feg.",
    metaDescriptionUz:
      "Fargʻonaga yetkazib berish: pochta, hujjatlar, Toshkentdan kuryer. Kalkulyator va tas/feg.",
  },
  {
    slug: "nukus",
    code: "ncu",
    nameEn: "Nukus",
    nameRu: "Нукус",
    nameUz: "Nukus",
    settlementId: "nukus_city",
    etaHintRu: "Нукус — дальнее направление; заложите запас по сроку и уточните у менеджера.",
    etaHintUz: "Nukus — uzoq yoʻnalish; muddatga zaxira qoʻying va menejer bilan aniqlang.",
    leadRu:
      "Доставка в Нукус с EPOS POCHTA. Межрегиональные отправления документов и посылок с подтверждением срока менеджером.",
    leadUz:
      "EPOS POCHTA bilan Nukusga yetkazib berish. Hujjat va pochtalarning viloyatlararo joʻnatmalari — muddatni menejer tasdiqlaydi.",
    bodyRu: [
      "Нукус входит в географию сервиса. Из-за удалённости срок и стоимость сильнее зависят от маршрута и режима доставки.",
      "Рекомендуем всегда сверять ориентир в калькуляторе и фиксировать финальные условия с менеджером до сдачи груза.",
      "Для регулярных поставок в Каракалпакстан обсудите график на странице для бизнеса.",
    ],
    bodyUz: [
      "Nukus xizmat geografiyasiga kiradi. Uzoqlik tufayli muddat va narx yoʻnalish va yetkazish rejimiga koʻproq bogʻliq.",
      "Har doim kalkulyatordagi orientirni tekshirib, yukni topshirishdan oldin yakuniy shartlarni menejer bilan belgilashni tavsiya qilamiz.",
      "Qoraqalpogʻistonga muntazam yetkazishlar uchun jadvalni biznes sahifasida muhokama qiling.",
    ],
    faqRu: [
      {
        question: "Долго ли идёт посылка в Нукус?",
        answer:
          "Дольше, чем по близким регионам. Ориентир — в калькуляторе, точный срок — у менеджера.",
      },
      {
        question: "Можно ли отправить хрупкое?",
        answer:
          "При правильной упаковке и согласовании вложений. Запрещённые категории — в условиях сервиса.",
      },
      {
        question: "Есть ли забор в Нукусе?",
        answer:
          "Возможность регулярного забора уточняется при бизнес-подключении.",
      },
    ],
    faqUz: [
      {
        question: "Nukusga pochta uzoq ketadimi?",
        answer:
          "Yaqin hududlarga qaraganda uzoqroq. Orientir — kalkulyatorda, aniq muddat — menejerda.",
      },
      {
        question: "Moʻrt narsani yuborish mumkinmi?",
        answer:
          "Toʻgʻri qadoqlash va ichidagini kelishish bilan. Taqiqlangan turlar — xizmat shartlarida.",
      },
      {
        question: "Nukusda olib ketish bormi?",
        answer:
          "Muntazam olib ketish imkoniyati biznes ulanishida aniqlanadi.",
      },
    ],
    metaTitleRu: "Доставка в Нукус — EPOS POCHTA",
    metaTitleUz: "Nukusga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Курьерская доставка в Нукус. Ориентир срока и стоимости в калькуляторе, подтверждение менеджера.",
    metaDescriptionUz:
      "Nukusga kuryerlik yetkazib berish. Muddat va narx orientiri kalkulyatorda, menejer tasdigʻi.",
  },
  {
    slug: "karshi",
    code: "ksq",
    nameEn: "Karshi",
    nameRu: "Карши",
    nameUz: "Qarshi",
    settlementId: "karshi_city",
    etaHintRu: "Карши обслуживается межрегионально; срок зависит от города отправления.",
    etaHintUz: "Qarshi viloyatlararo xizmat qilinadi; muddat joʻnatish shahriga bogʻliq.",
    leadRu:
      "Доставка в Карши (Қарши) с EPOS POCHTA — документы, посылки и бизнес-отправления по согласованию.",
    leadUz:
      "EPOS POCHTA bilan Qarshiga yetkazib berish — hujjatlar, pochta va kelishuv boʻyicha biznes joʻnatmalari.",
    bodyRu: [
      "Карши — областной центр с доступом к сети EPOS POCHTA. Мы помогаем организовать доставку без публикации открытых тарифов.",
      "Частным клиентам удобен калькулятор и заявка менеджеру. Компаниям — коммерческое предложение под объём.",
      "Укажите Карши в калькуляторе, чтобы увидеть ориентировочный диапазон в сумах.",
    ],
    bodyUz: [
      "Qarshi — EPOS POCHTA tarmogʻiga kirish mumkin boʻlgan viloyat markazi. Ochiq tariflarni eʼlon qilmasdan yetkazib berishni tashkil etishga yordam beramiz.",
      "Jismoniy shaxslarga kalkulyator va menejer arizasi qulay. Kompaniyalarga — hajmga mos tijorat taklifi.",
      "Soʻmda taxminiy diapazonni koʻrish uchun kalkulyatorda Qarshini kiriting.",
    ],
    faqRu: [
      {
        question: "Доставляете ли по Кашкадарьинской области?",
        answer:
          "Конкретные пункты уточняются менеджером. Назовите населённый пункт в заявке.",
      },
      {
        question: "Как упаковать документы в Карши?",
        answer:
          "Твёрдый конверт или папка; детали — при оформлении.",
      },
      {
        question: "Есть ли калькулятор для Карши?",
        answer:
          "Да, выберите город в калькуляторе стоимости на сайте.",
      },
    ],
    faqUz: [
      {
        question: "Qashqadaryo viloyati boʻylab yetkazasizmi?",
        answer:
          "Aniq punktlar menejer bilan aniqlanadi. Arizada aholi punktini yozing.",
      },
      {
        question: "Qarshiga hujjatlarni qanday qadoqlash kerak?",
        answer:
          "Qattiq konvert yoki papka; tafsilotlar — rasmiylashtirishda.",
      },
      {
        question: "Qarshi uchun kalkulyator bormi?",
        answer:
          "Ha, saytdagi narx kalkulyatorida shaharni tanlang.",
      },
    ],
    metaTitleRu: "Доставка в Карши — EPOS POCHTA",
    metaTitleUz: "Qarshiga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Карши: курьер, ориентир в калькуляторе, статусы. Без публичных тарифов.",
    metaDescriptionUz:
      "Qarshiga yetkazib berish: kuryer, kalkulyator orientiri, statuslar. Ochiq tarifsiz.",
  },
  {
    slug: "termez",
    code: "tmj",
    nameEn: "Termez",
    nameRu: "Термез",
    nameUz: "Termiz",
    settlementId: "termiz_city",
    etaHintRu: "Термез — южное направление; срок согласуйте заранее с менеджером.",
    etaHintUz: "Termiz — janubiy yoʻnalish; muddatni oldindan menejer bilan kelishing.",
    leadRu:
      "Доставка в Термез с EPOS POCHTA. Межрегиональная логистика документов и посылок по Узбекистану.",
    leadUz:
      "EPOS POCHTA bilan Termizga yetkazib berish. Oʻzbekiston boʻylab hujjat va pochta viloyatlararo logistikasi.",
    bodyRu: [
      "Термез входит в покрываемые города. Планируйте отправку с запасом по сроку и уточняйте режим доставки.",
      "Калькулятор даёт ориентир; финальные условия — только после подтверждения менеджера. Публичной оферты нет.",
      "Для корпоративных потоков оставьте заявку на коммерческое предложение.",
    ],
    bodyUz: [
      "Termiz qamrov shaharlari qatorida. Joʻnatmani muddat zaxirasi bilan rejalashtiring va yetkazish rejimini aniqlang.",
      "Kalkulyator orientir beradi; yakuniy shartlar — faqat menejer tasdigʻidan keyin. Ochiq oferta yoʻq.",
      "Korporativ oqimlar uchun tijorat taklifi arizasini qoldiring.",
    ],
    faqRu: [
      {
        question: "Работаете ли с южными районами?",
        answer:
          "Возможность по адресу уточняется при расчёте. Укажите населённый пункт.",
      },
      {
        question: "Можно ли вызвать курьера в Термезе?",
        answer:
          "Вызов курьера согласуется менеджером в зависимости от зоны.",
      },
      {
        question: "Как получить ориентир цены в Термез?",
        answer:
          "Калькулятор → город Термез → вес и габариты → «Рассчитать».",
      },
    ],
    faqUz: [
      {
        question: "Janubiy tumanlar bilan ishlaysizmi?",
        answer:
          "Manzil boʻyicha imkoniyat hisobda aniqlanadi. Aholi punktini koʻrsating.",
      },
      {
        question: "Termizda kuryer chaqirish mumkinmi?",
        answer:
          "Kuryer chaqirish zona boʻyicha menejer bilan kelishiladi.",
      },
      {
        question: "Termizga narx orientirini qanday olaman?",
        answer:
          "Kalkulyator → Termiz shahri → ogʻirlik va oʻlchamlar → «Hisoblash».",
      },
    ],
    metaTitleRu: "Доставка в Термез — EPOS POCHTA",
    metaTitleUz: "Termizga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Термез: документы и посылки. Калькулятор ориентира, менеджер подтверждает срок и цену.",
    metaDescriptionUz:
      "Termizga yetkazib berish: hujjatlar va pochta. Kalkulyator orientiri, muddat va narxni menejer tasdiqlaydi.",
  },
  {
    slug: "navoi",
    code: "nvi",
    nameEn: "Navoi",
    nameRu: "Навои",
    nameUz: "Navoiy",
    settlementId: "navoi_city",
    etaHintRu: "Навои обслуживается в межрегиональной сети; ETA зависит от пары городов.",
    etaHintUz: "Navoiy viloyatlararo tarmoqda xizmat qilinadi; ETA shaharlar juftligiga bogʻliq.",
    leadRu:
      "Доставка в Навои с EPOS POCHTA — для частных клиентов и компаний. Ориентир онлайн, итог с менеджером.",
    leadUz:
      "EPOS POCHTA bilan Navoiyga yetkazib berish — jismoniy shaxslar va kompaniyalar uchun. Onlayn orientir, yakun menejer bilan.",
    bodyRu: [
      "Навои связан с маршрутной сетью сервиса. Мы принимаем документы и посылки в рамках правил перевозки.",
      "Бизнес-клиенты могут запросить регулярный забор и отчётность. Тарифы не публикуются на сайте.",
      "Сравните ориентир в калькуляторе перед сдачей отправления.",
    ],
    bodyUz: [
      "Navoiy xizmat marshrut tarmogʻiga bogʻlangan. Tashish qoidalari doirasida hujjat va pochtani qabul qilamiz.",
      "Biznes mijozlar muntazam olib ketish va hisobotni soʻrashi mumkin. Tariflar saytda eʼlon qilinmaydi.",
      "Joʻnatmani topshirishdan oldin kalkulyatordagi orientirni solishtiring.",
    ],
    faqRu: [
      {
        question: "Доставка на промышленные объекты Навои?",
        answer:
          "Адрес и пропускной режим согласовываются отдельно с менеджером.",
      },
      {
        question: "Есть ли статусы по пути в Навои?",
        answer:
          "Да, сообщаем ключевые статусы; трек доступен после оформления.",
      },
      {
        question: "Чем отличается калькулятор от финальной цены?",
        answer:
          "Калькулятор — ориентир. Финальная цена — после проверки параметров менеджером.",
      },
    ],
    faqUz: [
      {
        question: "Navoiy sanoat obyektlariga yetkazish?",
        answer:
          "Manzil va ruxsat tartibi menejer bilan alohida kelishiladi.",
      },
      {
        question: "Navoiyga yoʻlda statuslar bormi?",
        answer:
          "Ha, asosiy statuslarni xabar qilamiz; trek rasmiylashtirishdan keyin mavjud.",
      },
      {
        question: "Kalkulyator yakuniy narxdan nimasi bilan farq qiladi?",
        answer:
          "Kalkulyator — orientir. Yakuniy narx — menejer parametrlarni tekshirgach.",
      },
    ],
    metaTitleRu: "Доставка в Навои — EPOS POCHTA",
    metaTitleUz: "Navoiyga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Курьерская доставка в Навои. Калькулятор ориентира, статусы, B2B-условия по запросу.",
    metaDescriptionUz:
      "Navoiyga kuryerlik yetkazib berish. Kalkulyator, statuslar, soʻrov boʻyicha B2B shartlari.",
  },
  {
    slug: "jizzakh",
    code: "jiz",
    nameEn: "Jizzakh",
    nameRu: "Джизак",
    nameUz: "Jizzax",
    settlementId: "jizzakh_city",
    etaHintRu: "Джизак — межрегиональное направление с ориентиром срока в калькуляторе.",
    etaHintUz: "Jizzax — kalkulyatorda muddat orientiri boʻlgan viloyatlararo yoʻnalish.",
    leadRu:
      "Доставка в Джизак с EPOS POCHTA. Документы и посылки по Узбекистану с прозрачными статусами.",
    leadUz:
      "EPOS POCHTA bilan Jizzaxga yetkazib berish. Oʻzbekiston boʻylab hujjat va pochta — shaffof statuslar bilan.",
    bodyRu: [
      "Джизак входит в список городов для посадочных маршрутов сервиса. Мы помогаем частным и бизнес-отправителям.",
      "Не публикуем прайс: стоимость зависит от направления, веса, габаритов и способа доставки.",
      "Начните с калькулятора, затем подтвердите условия с менеджером при необходимости.",
    ],
    bodyUz: [
      "Jizzax xizmatning yoʻnalish shaharlari roʻyxatiga kiradi. Jismoniy va biznes yuboruvchilarga yordam beramiz.",
      "Prays eʼlon qilmaymiz: narx yoʻnalish, ogʻirlik, oʻlcham va yetkazish usuliga bogʻliq.",
      "Kalkulyatordan boshlang, soʻng kerak boʻlsa shartlarni menejer bilan tasdiqlang.",
    ],
    faqRu: [
      {
        question: "Доставка в районы Джизакской области?",
        answer:
          "Уточняется по населённому пункту. Напишите точное название в заявке.",
      },
      {
        question: "Можно ли отправить из Джизака в Ташкент?",
        answer:
          "Да, выберите пару городов в калькуляторе.",
      },
      {
        question: "Где условия перевозки?",
        answer:
          "В разделе «Условия оказания услуг» и FAQ на сайте.",
      },
    ],
    faqUz: [
      {
        question: "Jizzax viloyati tumanlariga yetkazish?",
        answer:
          "Aholi punkti boʻyicha aniqlanadi. Arizada aniq nomini yozing.",
      },
      {
        question: "Jizzaxdan Toshkentga yuborish mumkinmi?",
        answer:
          "Ha, kalkulyatorda shaharlar juftligini tanlang.",
      },
      {
        question: "Tashish shartlari qayerda?",
        answer:
          "Saytdagi «Xizmat koʻrsatish shartlari» va FAQ boʻlimida.",
      },
    ],
    metaTitleRu: "Доставка в Джизак — EPOS POCHTA",
    metaTitleUz: "Jizzaxga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Джизак: курьерская служба EPOS POCHTA, калькулятор ориентира, без оферты.",
    metaDescriptionUz:
      "Jizzaxga yetkazib berish: EPOS POCHTA kuryerligi, kalkulyator orientiri, ofertasiz.",
  },
  {
    slug: "urgench",
    code: "ugc",
    nameEn: "Urgench",
    nameRu: "Ургенч",
    nameUz: "Urganch",
    settlementId: "urgench_city",
    etaHintRu: "Ургенч — западное направление; срок подтверждается при индивидуальном расчёте.",
    etaHintUz: "Urganch — gʻarbiy yoʻnalish; muddat individual hisobda tasdiqlanadi.",
    leadRu:
      "Доставка в Ургенч с EPOS POCHTA. Межрегиональные отправления с ориентиром в калькуляторе.",
    leadUz:
      "EPOS POCHTA bilan Urganchga yetkazib berish. Kalkulyatorda orientirli viloyatlararo joʻnatmalar.",
    bodyRu: [
      "Ургенч входит в географию доставки. Планируйте логистику заранее и сверяйте параметры груза с менеджером.",
      "Калькулятор помогает оценить порядок стоимости. Итог не является офертой до подтверждения.",
      "Для Хорезма и регулярных поставок обсудите график на странице для бизнеса.",
    ],
    bodyUz: [
      "Urganch yetkazib berish geografiyasiga kiradi. Logistikani oldindan rejalashtiring va yuk parametrlarini menejer bilan solishtiring.",
      "Kalkulyator narx tartibini baholashga yordam beradi. Yakun tasdiqlanguncha oferta hisoblanmaydi.",
      "Xorazm va muntazam yetkazishlar uchun jadvalni biznes sahifasida muhokama qiling.",
    ],
    faqRu: [
      {
        question: "Доставляете ли в Хиву?",
        answer:
          "Возможность по Хиве и другим пунктам Хорезма уточняйте у менеджера или в калькуляторе, если город есть в списке.",
      },
      {
        question: "Нужен ли ИНН для отправки в Ургенч?",
        answer:
          "Для частных отправлений — нет. Для B2B-заявки ИНН компании желателен.",
      },
      {
        question: "Как начать?",
        answer:
          "Калькулятор → Ургенч → расчёт → при необходимости заявка менеджеру.",
      },
    ],
    faqUz: [
      {
        question: "Xivaga yetkazasizmi?",
        answer:
          "Xiva va Xorazmning boshqa punktlari boʻyicha imkoniyatni menejer yoki roʻyxatda boʻlsa kalkulyator orqali aniqlang.",
      },
      {
        question: "Urganchga yuborish uchun STIR kerakmi?",
        answer:
          "Shaxsiy joʻnatmalar uchun — yoʻq. B2B ariza uchun kompaniya STIRi tavsiya etiladi.",
      },
      {
        question: "Qanday boshlash mumkin?",
        answer:
          "Kalkulyator → Urganch → hisob → zarurat boʻlsa menejerga ariza.",
      },
    ],
    metaTitleRu: "Доставка в Ургенч — EPOS POCHTA",
    metaTitleUz: "Urganchga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Ургенч: документы и посылки. Калькулятор EPOS POCHTA и подтверждение менеджера.",
    metaDescriptionUz:
      "Urganchga yetkazib berish: hujjatlar va pochta. EPOS POCHTA kalkulyatori va menejer tasdigʻi.",
  },
];

export function getDeliveryCityBySlug(slug: string): DeliveryCity | undefined {
  return DELIVERY_CITIES.find((city) => city.slug === slug);
}

export function getDeliveryCityByCode(code: string): DeliveryCity | undefined {
  const normalized = code.trim().toLowerCase();
  return DELIVERY_CITIES.find((city) => city.code === normalized);
}

export function listDeliveryCitySlugs(): string[] {
  return DELIVERY_CITIES.map((city) => city.slug);
}

export function listDeliveryCityCodes(): string[] {
  return DELIVERY_CITIES.map((city) => city.code);
}

export function cityDisplayName(city: DeliveryCity, locale: "uz" | "ru"): string {
  return locale === "uz" ? city.nameUz : city.nameRu;
}

/** Public city landing path (slug, not route code). */
export function cityPath(slug: string) {
  return `/delivery/${slug}/`;
}
