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
      "Курьерская доставка по Ташкенту и в другие регионы Узбекистана: документы, посылки и заказы для бизнеса. Ориентировочный расчёт — в калькуляторе, финальную цену подтверждает менеджер.",
    leadUz:
      "Toshkent boʻylab va Oʻzbekistonning boshqa hududlariga kuryerlik yetkazib berish: hujjatlar, pochta va biznes buyurtmalari. Taxminiy hisob — kalkulyatorda, yakuniy narxni menejer tasdiqlaydi.",
    bodyRu: [
      "Ташкент — основной хаб сети EPOS POCHTA. Здесь удобно организовать забор курьером, сдачу в согласованной точке и доставку до двери получателя.",
      "Для частных клиентов подойдут разовые отправления документов и посылок. Для интернет-магазинов и компаний доступны регулярный забор, статусы и индивидуальные условия без публичного прайса.",
      "Перед отправкой укажите город назначения в калькуляторе — получите ориентир по стоимости и сроку. Это не оферта: менеджер уточнит параметры и подтвердит итог.",
    ],
    bodyUz: [
      "Toshkent — EPOS POCHTA tarmogʻining asosiy markazi. Bu yerda kuryer orqali olib ketish, kelishilgan nuqtada topshirish va eshikgacha yetkazishni qulay tashkil etish mumkin.",
      "Jismoniy shaxslar uchun hujjat va pochtalarning bir martalik joʻnatmalari mos. Internet-doʻkonlar va kompaniyalar uchun muntazam olib ketish, statuslar va ochiq praysiz individual shartlar mavjud.",
      "Yuborishdan oldin kalkulyatorda manzil shahrini kiriting — narx va muddat boʻyicha orientir olasiz. Bu oferta emas: menejer parametrlarni aniqlab, yakuniy natijani tasdiqlaydi.",
    ],
    faqRu: [
      {
        question: "Доставляете ли по всему Ташкенту?",
        answer:
          "Работаем по городу в согласованных районах. Конкретный адрес уточните при расчёте или у менеджера.",
      },
      {
        question: "Можно ли забрать отправление из офиса в Ташкенте?",
        answer:
          "Да, доступен вызов курьера. Для регулярных заборов оставьте бизнес-заявку.",
      },
      {
        question: "Как быстро узнать ориентир по цене?",
        answer:
          "Откройте калькулятор, укажите Ташкент как пункт отправления или назначения, вес и габариты.",
      },
    ],
    faqUz: [
      {
        question: "Butun Toshkent boʻylab yetkazasizmi?",
        answer:
          "Kelishilgan tumanlarda ishlaymiz. Aniq manzilni hisobda yoki menejer bilan aniqlang.",
      },
      {
        question: "Toshkentdagi ofisdan joʻnatmani olib ketish mumkinmi?",
        answer:
          "Ha, kuryer chaqirish mumkin. Muntazam olib ketish uchun biznes arizasini qoldiring.",
      },
      {
        question: "Narx orientirini qanday tez bilaman?",
        answer:
          "Kalkulyatorni oching, Toshkentni joʻnatish yoki qabul punkti sifatida, ogʻirlik va oʻlchamlarni kiriting.",
      },
    ],
    metaTitleRu: "Доставка в Ташкент — курьер EPOS POCHTA",
    metaTitleUz: "Toshkentga yetkazib berish — EPOS POCHTA kuryeri",
    metaDescriptionRu:
      "Курьерская доставка по Ташкенту и из столицы по Узбекистану. Калькулятор ориентира, забор курьером, статусы. Без публичных тарифов.",
    metaDescriptionUz:
      "Toshkent boʻylab va poytaxtdan Oʻzbekiston boʻylab kuryerlik yetkazib berish. Kalkulyator, kuryer, statuslar. Ochiq tarifsiz.",
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
      "Доставка в Самарканд и из Самарканда по Узбекистану с EPOS POCHTA. Документы, посылки и B2B-потоки — с ориентиром в калькуляторе и подтверждением менеджера.",
    leadUz:
      "EPOS POCHTA bilan Samarqandga va Samarqanddan Oʻzbekiston boʻylab yetkazib berish. Hujjatlar, pochta va B2B oqimlar — kalkulyatorda orientir va menejer tasdigʻi bilan.",
    bodyRu: [
      "Самарканд — один из ключевых направлений межрегиональной сети. Мы помогаем отправить документы и посылки в город и забрать груз для доставки в другие регионы.",
      "Интернет-магазины могут согласовать регулярные отправки покупателям в Самарканде. Публичных тарифов нет: стоимость зависит от маршрута, веса, габаритов и режима доставки.",
      "Используйте калькулятор с городом «Самарканд», затем при необходимости оставьте заявку менеджеру для финального расчёта.",
    ],
    bodyUz: [
      "Samarqand — viloyatlararo tarmoqning asosiy yoʻnalishlaridan biri. Shaharga hujjat va pochta yuborishga, shuningdek boshqa hududlarga yetkazish uchun yukni olib ketishga yordam beramiz.",
      "Internet-doʻkonlar Samarqanddagi xaridorlarga muntazam joʻnatmalarni kelishishi mumkin. Ochiq tarif yoʻq: narx yoʻnalish, ogʻirlik, oʻlcham va yetkazish rejimiga bogʻliq.",
      "«Samarqand» shahri bilan kalkulyatordan foydalaning, soʻng zarurat boʻlsa yakuniy hisob uchun menejerga ariza qoldiring.",
    ],
    faqRu: [
      {
        question: "Доставляете ли до двери в Самарканде?",
        answer:
          "Да, режим до двери доступен при согласовании адреса. Уточните при расчёте.",
      },
      {
        question: "Есть ли пункт приёма в Самарканде?",
        answer:
          "Схема сдачи и выдачи согласуется менеджером по направлению. Оставьте заявку с маршрутом.",
      },
      {
        question: "Как рассчитать отправку в Самарканд?",
        answer:
          "В калькуляторе укажите Самарканд как город получения, вес и габариты — увидите ориентир.",
      },
    ],
    faqUz: [
      {
        question: "Samarqandda eshikgacha yetkazasizmi?",
        answer:
          "Ha, manzil kelishilganda eshikgacha rejim mavjud. Hisobda aniqlang.",
      },
      {
        question: "Samarqandda qabul punkti bormi?",
        answer:
          "Topshirish va berish sxemasi yoʻnalish boʻyicha menejer bilan kelishiladi. Yoʻnalish bilan ariza qoldiring.",
      },
      {
        question: "Samarqandga joʻnatmani qanday hisoblayman?",
        answer:
          "Kalkulyatorda Samarqandni qabul shahri, ogʻirlik va oʻlchamlarni kiriting — orientir chiqadi.",
      },
    ],
    metaTitleRu: "Доставка в Самарканд — EPOS POCHTA",
    metaTitleUz: "Samarqandga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Курьерская доставка в Самарканд и из города по Узбекистану. Ориентир в калькуляторе, статусы, без публичных тарифов.",
    metaDescriptionUz:
      "Samarqandga va shahardan Oʻzbekiston boʻylab kuryerlik yetkazib berish. Kalkulyator orientiri, statuslar, ochiq tarifsiz.",
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
      "Доставка в Бухару с EPOS POCHTA: документы, посылки и корпоративные отправления. Рассчитайте ориентир онлайн и подтвердите условия с менеджером.",
    leadUz:
      "EPOS POCHTA bilan Buxoroga yetkazib berish: hujjatlar, pochta va korporativ joʻnatmalar. Onlayn orientir hisoblang va shartlarni menejer bilan tasdiqlang.",
    bodyRu: [
      "Бухара входит в географию межрегиональных маршрутов EPOS POCHTA. Мы сопровождаем отправления статусами и помогаем согласовать забор или выдачу.",
      "Для бизнеса доступны обсуждение объёма, регулярности и API. На сайте нет оферты и таблицы тарифов — только ориентировочный калькулятор и заявка.",
      "Укажите Бухару в калькуляторе как город «куда» или «откуда», чтобы получить диапазон стоимости и срока.",
    ],
    bodyUz: [
      "Buxoro EPOS POCHTA viloyatlararo yoʻnalishlar geografiyasiga kiradi. Joʻnatmalarni statuslar bilan kuzatamiz, olib ketish yoki berishni kelishishga yordam beramiz.",
      "Biznes uchun hajm, muntazamlilik va API muhokamasi mavjud. Saytda oferta va tarif jadvali yoʻq — faqat taxminiy kalkulyator va ariza.",
      "Narx va muddat diapazonini olish uchun kalkulyatorda Buxoroni «qayerga» yoki «qayerdan» shahri sifatida kiriting.",
    ],
    faqRu: [
      {
        question: "Можно ли отправить документы в Бухару?",
        answer:
          "Да, документы принимаем в рамках ограничений сервиса. Уточните упаковку при оформлении.",
      },
      {
        question: "Есть ли наложенный платёж в Бухару?",
        answer:
          "COD доступен для бизнеса после согласования. Оставьте коммерческую заявку.",
      },
      {
        question: "Как подтвердить финальную цену?",
        answer:
          "После ориентира в калькуляторе нажмите «Подтвердить с менеджером» или оставьте B2B-заявку.",
      },
    ],
    faqUz: [
      {
        question: "Buxoroga hujjat yuborish mumkinmi?",
        answer:
          "Ha, xizmat cheklovlari doirasida hujjatlar qabul qilinadi. Rasmiylashtirishda qadoqlashni aniqlang.",
      },
      {
        question: "Buxoroga yetkazib berishda toʻlov bormi?",
        answer:
          "COD biznes uchun kelishuvdan keyin mavjud. Tijorat arizasini qoldiring.",
      },
      {
        question: "Yakuniy narxni qanday tasdiqlayman?",
        answer:
          "Kalkulyator orientiridan keyin «Menejer bilan tasdiqlash» ni bosing yoki B2B ariza qoldiring.",
      },
    ],
    metaTitleRu: "Доставка в Бухару — курьер EPOS POCHTA",
    metaTitleUz: "Buxoroga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка документов и посылок в Бухару. Калькулятор ориентира, статусы, коммерческие условия для бизнеса.",
    metaDescriptionUz:
      "Buxoroga hujjat va pochta yetkazib berish. Kalkulyator, statuslar, biznes uchun tijorat shartlari.",
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
      "Курьерская доставка в Наманган и из Намангана по Узбекистану. Ориентир стоимости в калькуляторе EPOS POCHTA.",
    leadUz:
      "Namanganga va Namangandan Oʻzbekiston boʻylab kuryerlik yetkazib berish. EPOS POCHTA kalkulyatorida narx orientiri.",
    bodyRu: [
      "Наманган связан с сетью EPOS POCHTA межрегиональными направлениями. Подходят документы, посылки и согласованные товарные отправления.",
      "Магазины Ферганской долины могут запросить регулярный забор и доставку покупателям. Условия — индивидуально, без публичного прайса.",
      "Для разовой отправки откройте калькулятор; для объёма — страницу коммерческого предложения для бизнеса.",
    ],
    bodyUz: [
      "Namangan EPOS POCHTA tarmogʻiga viloyatlararo yoʻnalishlar orqali bogʻlangan. Hujjatlar, pochta va kelishilgan tovar joʻnatmalari mos.",
      "Fargʻona vodiysi doʻkonlari muntazam olib ketish va xaridorlarga yetkazishni soʻrashi mumkin. Shartlar — individual, ochiq praysiz.",
      "Bir martalik joʻnatma uchun kalkulyatorni oching; hajm uchun — biznes tijorat taklifi sahifasini.",
    ],
    faqRu: [
      {
        question: "Доставляете ли в районы Наманганской области?",
        answer:
          "Возможность по конкретному населённому пункту уточняет менеджер при заявке.",
      },
      {
        question: "Нужна ли жёсткая упаковка?",
        answer:
          "Да, упаковка должна защищать вложение. Требования зависят от типа груза.",
      },
      {
        question: "Можно ли отследить посылку в Наманган?",
        answer:
          "После оформления вы получите трек-номер для страницы отслеживания.",
      },
    ],
    faqUz: [
      {
        question: "Namangan viloyati tumanlariga yetkazasizmi?",
        answer:
          "Aniq aholi punkti boʻyicha imkoniyatni menejer arizada aniqlaydi.",
      },
      {
        question: "Qattiq qadoqlash kerakmi?",
        answer:
          "Ha, qadoq ichidagini himoya qilishi kerak. Talablar yuk turiga bogʻliq.",
      },
      {
        question: "Namanganga pochtani kuzatish mumkinmi?",
        answer:
          "Rasmiylashtirishdan keyin kuzatuv sahifasi uchun trek-raqam beriladi.",
      },
    ],
    metaTitleRu: "Доставка в Наманган — EPOS POCHTA",
    metaTitleUz: "Namanganga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Наманган: документы, посылки, B2B. Калькулятор ориентира и подтверждение менеджера.",
    metaDescriptionUz:
      "Namanganga yetkazib berish: hujjatlar, pochta, B2B. Kalkulyator orientiri va menejer tasdigʻi.",
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
      "Доставка в Андижан с EPOS POCHTA. Рассчитайте ориентир по весу и маршруту, подтвердите цену с менеджером.",
    leadUz:
      "EPOS POCHTA bilan Andijonga yetkazib berish. Ogʻirlik va yoʻnalish boʻyicha orientir hisoblang, narxni menejer bilan tasdiqlang.",
    bodyRu: [
      "Андижан входит в ключевые города покрытия. Мы доставляем документы и посылки, поддерживаем статусы на маршруте.",
      "Для e-commerce доступны обсуждение COD, возвратов и регулярного забора через коммерческую заявку.",
      "Выберите Андижан в калькуляторе — получите диапазон стоимости без обязательства оферты.",
    ],
    bodyUz: [
      "Andijon qamrovning asosiy shaharlari qatoriga kiradi. Hujjat va pochtani yetkazamiz, yoʻnalishda statuslarni qoʻllab-quvvatlaymiz.",
      "E-commerce uchun COD, qaytarishlar va muntazam olib ketishni tijorat arizasi orqali muhokama qilish mumkin.",
      "Kalkulyatorda Andijonni tanlang — oferta majburiyatisiz narx diapazonini oling.",
    ],
    faqRu: [
      {
        question: "Есть ли экспресс в Андижан?",
        answer:
          "Срочность обсуждается индивидуально. Базовый ориентир — в калькуляторе.",
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
    metaTitleRu: "Доставка в Андижан — EPOS POCHTA",
    metaTitleUz: "Andijonga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Курьерская доставка в Андижан. Калькулятор, статусы, условия для интернет-магазинов.",
    metaDescriptionUz:
      "Andijonga kuryerlik yetkazib berish. Kalkulyator, statuslar, internet-doʻkonlar uchun shartlar.",
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
      "Доставка в Фергану и из Ферганы по стране. EPOS POCHTA — ориентир в калькуляторе и работа с бизнесом.",
    leadUz:
      "Fargʻonaga va Fargʻonadan mamlakat boʻylab yetkazib berish. EPOS POCHTA — kalkulyator orientiri va biznes bilan ishlash.",
    bodyRu: [
      "Фергана — важное направление долины. Мы закрываем частные и корпоративные сценарии доставки без публикации тарифов.",
      "Согласуйте забор, режим «до двери» и отчётность через менеджера. Для разовых отправок достаточно калькулятора и заявки.",
      "Город доступен в быстром выборе калькулятора вместе с Ташкентом, Самаркандом и Андижаном.",
    ],
    bodyUz: [
      "Fargʻona — vodiy uchun muhim yoʻnalish. Tariflarni eʼlon qilmasdan shaxsiy va korporativ yetkazib berish ssenariylarini yopamiz.",
      "Olib ketish, «eshikgacha» rejim va hisobotni menejer orqali kelishing. Bir martalik joʻnatmalar uchun kalkulyator va ariza yetarli.",
      "Shahar kalkulyatorning tez tanlovida Toshkent, Samarqand va Andijon bilan birga mavjud.",
    ],
    faqRu: [
      {
        question: "Доставляете ли в Маргилан / Коканд?",
        answer:
          "Населённые пункты рядом уточняются при заявке. Укажите точный город в калькуляторе или форме.",
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
    metaTitleRu: "Доставка в Фергану — EPOS POCHTA",
    metaTitleUz: "Fargʻonaga yetkazib berish — EPOS POCHTA",
    metaDescriptionRu:
      "Доставка в Фергану: посылки, документы, e-commerce. Калькулятор ориентира без оферты.",
    metaDescriptionUz:
      "Fargʻonaga yetkazib berish: pochta, hujjatlar, e-commerce. Ofertasiz kalkulyator orientiri.",
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
