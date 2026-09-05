import type { SiteCopy } from "@/data/types";

export const uzCopy: SiteCopy = {
  meta: {
    homeTitle: "Oʻzbekiston boʻylab pochta yetkazib berish",
    homeDescription:
      "EPOS POCHTA — Oʻzbekiston boʻylab kuryerlik yetkazib berish. Narx soʻrang, joʻnatmani kuzating yoki biznes uchun ariza qoldiring.",
    servicesTitle: "Yetkazib berish xizmatlari",
    servicesDescription:
      "Hujjatlar, pochta, eshikgacha yetkazish, kuryer chaqirish va internet-doʻkonlar uchun yechimlar — ochiq tariflar yoʻq, faqat soʻrov boʻyicha hisob.",
    businessTitle: "Biznes uchun",
    businessDescription:
      "Muntazam olib ketish, ommaviy joʻnatmalar, qaytarishlar, yetkazib berishda toʻlov, API va hisobotlar.",
    trackingTitle: "Joʻnatmani kuzatish",
    trackingDescription: "EPOS POCHTA trek-raqami boʻyicha statusni tekshiring.",
    requestPriceTitle: "Biznes uchun tijorat taklifi",
    requestPriceDescription:
      "Internet-doʻkonlar va kompaniyalar uchun qisqa soʻrovnoma: hajm, xizmatlar va aloqa. Menejer individual shartlarni tayyorlaydi.",
    calculatorTitle: "Narx kalkulyatori",
    calculatorDescription:
      "Yoʻnalish, ogʻirlik va oʻlchamlar boʻyicha taxminiy hisob. Oferta emas — yakuniy narxni menejer tasdiqlaydi.",
    faqTitle: "Savol-javoblar",
    faqDescription:
      "EPOS POCHTA yetkazib berish, narx, muddatlar va qoʻllab-quvvatlash boʻyicha javoblar.",
    businessConnectTitle: "Biznes uchun ulanish",
    businessConnectDescription:
      "Muntazam yetkazib berish, API va korporativ shartlarni ulash uchun bosqichma-bosqich ariza.",
    aboutTitle: "Kompaniya haqida",
    aboutDescription:
      "EPOS POCHTA — Oʻzbekiston Respublikasi hududida yetkazib berish xizmatlarini taqdim etuvchi zamonaviy kuryerlik kompaniyasi.",
    newsTitle: "Yangiliklar",
    newsDescription:
      "EPOS POCHTA yangiliklari va eʼlonlari — xizmat ishga tushishi, yetkazib berish geografiyasi va biznes yechimlari.",
    contactsTitle: "Aloqa",
    contactsDescription: "EPOS POCHTA telefoni, manzili va xarita.",
    privacyTitle: "Maxfiylik siyosati",
    privacyDescription: "EPOS POCHTA shaxsiy maʼlumotlarni qanday qayta ishlaydi.",
    termsTitle: "Xizmat koʻrsatish shartlari",
    termsDescription: "Yetkazib berish shartlari va cheklovlar.",
    notFoundTitle: "Sahifa topilmadi",
  },
  ui: {
    requestPrice: "Narx soʻrash",
    calculate: "Hisoblash",
    callCourier: "Kuryer chaqirish",
    track: "Kuzatish",
    forBusiness: "Biznes uchun",
    getOffer: "Taklif olish",
    startConnect: "Ulanishni boshlash",
    learnApi: "API haqida",
    geoCheck: "Tekshirish",
    call: "Qoʻngʻiroq",
    write: "Yozish",
    send: "Yuborish",
    next: "Keyingi",
    back: "Orqaga",
    getQuote: "Hisob olish",
    menu: "Menyu",
    close: "Yopish",
    cookieText:
      "Roziligingizdan soʻng tahlil uchun cookie ishlatamiz. Forma shaxsiy maʼlumotlari tahlilga yuborilmaydi.",
    cookieAccept: "Qabul qilish",
    cookieDecline: "Rad etish",
    required: "majburiy",
    placeholderEmail: "Email kelishuvdan keyin eʼlon qilinadi",
    placeholderHours: "Ish vaqti kelishuvdan keyin eʼlon qilinadi",
    placeholderTelegram: "Telegram havolasi kelishuvdan keyin qoʻshiladi",
  },
  nav: [
    { label: "Xizmatlar", href: "/services/" },
    { label: "Biznes uchun", href: "/business/" },
    { label: "Kompaniya", href: "/about/" },
    { label: "Yangiliklar", href: "/news/" },
    { label: "Aloqa", href: "/contacts/" },
  ],
  footer: {
    blurb:
      "Jismoniy shaxslar, internet-doʻkonlar va kompaniyalar uchun Oʻzbekiston boʻylab kuryerlik yetkazib berish.",
    legal: "«EPOS POCHTA» MCHJ · STIR 312949361 · OKED 53200",
    privacy: "Maxfiylik siyosati",
    terms: "Xizmat koʻrsatish shartlari",
    contacts: "Aloqa",
    support: "Qoʻllab-quvvatlash",
    faqLink: "Savol-javoblar",
  },
  home: {
    heroTitle: "Oʻzbekiston boʻylab pochtalarni yetkazamiz",
    heroLead:
      "Joʻnatmani sizdan olamiz, qabul qiluvchiga yetkazamiz va har bosqichda statusni xabar qilamiz",
    heroNote: "Jismoniy shaxslar, internet-doʻkonlar va kompaniyalar uchun",
    trackTitle: "Pochta qayerda?",
    trackPlaceholder: "Trek-raqamni kiriting",
    trackHint: "Trek-raqam kvitansiyada yoki SMS da koʻrsatiladi",
    quoteTitle: "Yetkazib berish narxi va muddatini hisoblang",
    quoteFrom: "Qayerdan",
    quoteTo: "Qayerga",
    quoteCategory: "Nima yuboramiz",
    quoteSwap: "Manzillarni almashtirish",
    quoteCta: "Hisoblash",
    quoteNote:
      "Keyingi qadamda taxminiy hisob. Yakuniy narxni menejer tasdiqlaydi.",
    needsTitle: "Nima yetkazish kerak?",
    needs: [
      {
        id: "documents",
        title: "Hujjatlar",
        description: "Shartnomalar, aktlar va muhim qogʻozlar — status nazorati bilan.",
      },
      {
        id: "parcel",
        title: "Pochtalar",
        description: "Oʻzbekiston shaharlari oʻrtasida shaxsiy joʻnatmalar.",
      },
      {
        id: "goods",
        title: "Xaridorlarga tovarlar",
        description: "Internet-doʻkon va sotuvchilar buyurtmalarini yetkazish.",
      },
      {
        id: "regular",
        title: "Muntazam joʻnatmalar",
        description: "Biznes uchun doimiy yoʻnalishlar va individual shartlar.",
      },
    ],
    modesTitle: "Yetkazib berish usullari",
    chainSteps: [
      "Buyurtma",
      "Ombor",
      "Yoʻlda",
      "EPOS punkti",
      "Eshikgacha",
    ],
    modes: [
      {
        id: "warehouse-warehouse",
        title: "Punkt → punkt",
        description: "Yuboruvchi punktga topshiradi, qabul qiluvchi punktidan oladi.",
      },
      {
        id: "warehouse-door",
        title: "Punkt → eshik",
        description: "Yuboruvchi punktga topshiradi, kuryer qabul qiluvchiga yetkazadi.",
      },
      {
        id: "door-warehouse",
        title: "Eshik → punkt",
        description: "Kuryer olib ketadi, qabul qiluvchi punktidan oladi.",
      },
      {
        id: "door-door",
        title: "Eshik → eshik",
        description: "Kuryer olib ketadi va qabul qiluvchiga yetkazadi.",
      },
    ],
    benefitsTitle: "Afzalliklar",
    benefits: [
      "Oʻzbekiston hududi boʻylab yetkazib berish",
      "Uchtagacha bepul topshirish urinishi",
      "Yetkazilmagan joʻnatmani bepul qaytarish",
      "SMS xabarnomalar",
      "Onlayn kuzatuv",
      "Mijozlarni qoʻllab-quvvatlash",
      "Biznes uchun API va hisobotlar",
      "Muntazam joʻnatmalar uchun individual shartlar",
    ],
    howTitle: "Yetkazib berish qanday ishlaydi",
    howSteps: [
      { title: "Soʻrov qoldiring", text: "Yoʻnalish va joʻnatma parametrlarini koʻrsating." },
      { title: "Hisob oling", text: "Menejer narx va muddatni aytadi." },
      { title: "Joʻnatmani topshiring", text: "Punktga olib keling yoki kuryer chaqiring." },
      { title: "Kuzating", text: "Trek-raqam boʻyicha statusni tekshiring." },
    ],
    businessTitle: "Oʻz kuryer xizmatisiz buyurtmalarni yetkazing",
    businessEyebrow: "E-commerce va biznes uchun",
    businessLead:
      "Internet-doʻkon va kompaniyalarni muntazam yetkazib berishga ulaymiz.",
    businessItems: [
      "Muntazam olib ketish",
      "Ommaviy joʻnatmalar",
      "Eshikgacha yetkazish",
      "Qaytarishlar",
      "Yetkazib berishda toʻlov",
      "API, statuslar va hisobotlar",
    ],
    geoTitle: "Geografiya",
    geoLead:
      "Oʻzbekiston hududida ishlaymiz. Muddatlar yoʻnalishga bogʻliq va hisobda tasdiqlanadi.",
    geoSearchPlaceholder: "Shahar yoki tuman",
    geoEmpty: "Mavjudlikni tekshirish uchun shahar nomini kiriting.",
    geoAvailable:
      "Ushbu aholi punktiga yetkazib berish mavjud. Taxminiy muddatni menejer hisobda aniqlaydi.",
    newsTitle: "Yangiliklar",
    newsLead: "Xizmat eʼlonlari, geografiya va biznes yechimlari",
    newsAll: "Barcha yangiliklar",
    finalTitle: "Pochta yuborish kerakmi?",
    finalLead: "Maʼlumot qoldiring — yetkazib berish narxini hisoblaymiz",
  },
  faq: {
    title: "Savol-javoblar",
    lead: "Mavzular boʻyicha qidiruv, toifalar va EPOS POCHTA yetkazib berish haqida batafsil javoblar. Topa olmasangiz — qoʻllab-quvvatlashga yozing.",
    searchPlaceholder: "Savol yoki javob boʻyicha qidirish…",
    allCategories: "Barcha mavzular",
    emptySearch: "Hech narsa topilmadi. Boshqa soʻrov yozing yoki qoʻllab-quvvatlashga murojaat qiling.",
    resultsLabel: "Topildi: {count}",
    topicsTitle: "Mavzular",
    categories: [
      {
        id: "shipments",
        title: "Joʻnatmalar",
        description: "Nima qabul qilamiz va qadoqlash",
      },
      {
        id: "pricing",
        title: "Narx",
        description: "Kalkulyator va narx tasdiqi",
      },
      {
        id: "delivery",
        title: "Yetkazib berish",
        description: "Muddat, kuryer va topshirish",
      },
      {
        id: "tracking",
        title: "Kuzatish",
        description: "Trek-raqam va statuslar",
      },
      {
        id: "business",
        title: "Biznes",
        description: "API, hajm va korporativ shartlar",
      },
    ],
    items: [
      {
        id: "accept",
        categoryId: "shipments",
        question: "Qanday joʻnatmalar qabul qilinadi?",
        answer:
          "Hujjatlar, pochtalar va xaridorlarga tovarlar — kelishilgan cheklovlar doirasida. Taqiqlangan toifalar xizmat shartlarida. Tarkibga shubha boʻlsa, topshirishdan oldin menejerdan soʻrang.",
      },
      {
        id: "packaging",
        categoryId: "shipments",
        question: "Maxsus qadoq kerakmi?",
        answer:
          "Ha: qadoq yoʻlda shikastlanishdan himoya qilishi kerak. Hujjatlar uchun qattiq konvert yoki papka, tovarlar uchun mahkamlangan quti. Talablar rasmiylashtirishda aniqlanadi.",
      },
      {
        id: "price",
        categoryId: "pricing",
        question: "Narxni qanday bilaman?",
        answer:
          "Yoʻnalish, ogʻirlik va oʻlchamlar boʻyicha kalkulyatordan taxminiy hisob oling. Bu oferta emas. Yakuniy narxni menejer ariza yoki biznes soʻrovnomasidan keyin tasdiqlaydi.",
      },
      {
        id: "tariffs",
        categoryId: "pricing",
        question: "Nega saytda tarif jadvali yoʻq?",
        answer:
          "Narx yoʻnalish, ogʻirlik, oʻlcham, olib ketish/yetkazish usuli va hajmga bogʻliq. Ochiq narxnomalar joylamaymiz — kalkulyatorda orientir va menejer orqali individual hisob beramiz.",
      },
      {
        id: "eta",
        categoryId: "delivery",
        question: "Yetkazib berish qancha vaqt oladi?",
        answer:
          "Muddat yoʻnalish va rejimga bogʻliq. Kalkulyatorda orientir koʻrsatiladi, menejer yakuniy narx bilan muddatni tasdiqlaydi.",
      },
      {
        id: "courier",
        categoryId: "delivery",
        question: "Kuryer chaqirish mumkinmi?",
        answer:
          "Ha. Arizada kuryer olib ketishini belgilang yoki qoʻllab-quvvatlashga yozing — vaqt va manzilni kelishamiz. Muntazam olib ketish uchun biznes ariza qoldiring.",
      },
      {
        id: "attempts",
        categoryId: "delivery",
        question: "Qabul qiluvchi joyida boʻlmasa?",
        answer:
          "Uchtagacha bepul topshirish urinishi nazarda tutilgan. Qaytarish va qayta yetkazish shartlari rasmiylashtirishda aniqlanadi.",
      },
      {
        id: "cod",
        categoryId: "delivery",
        question: "Yetkazib berishda toʻlov bormi?",
        answer:
          "Ha, kelishilgan ssenariylar uchun — koʻpincha e-commerce. Arizada COD ni belgilang: menejer yoʻnalish boʻyicha imkoniyatni tasdiqlaydi.",
      },
      {
        id: "track-number",
        categoryId: "tracking",
        question: "Trek-raqamni qayerdan topaman?",
        answer:
          "Topshirish kvitansiyasida yoki SMS da. Statuslarni koʻrish uchun «Kuzatish» sahifasiga raqamni kiriting.",
      },
      {
        id: "track-delay",
        categoryId: "tracking",
        question: "Status yangilanmasa nima qilaman?",
        answer:
          "Raqamni tekshiring va bosqichlar orasidagi yangilanishni kuting. Uzoq oʻzgarmasa — trek-raqam bilan qoʻllab-quvvatlash yoki Telegramga yozing.",
      },
      {
        id: "api",
        categoryId: "business",
        question: "Biznes va API qanday ulanadi?",
        answer:
          "«Biznes uchun» sahifasida yoki tijorat taklifi soʻrovnomasida korporativ ariza qoldiring. Hajm va jarayonlarni aniqlab, API va hisobot ulanishini taklif qilamiz.",
      },
      {
        id: "volume",
        categoryId: "business",
        question: "Muntazam joʻnatmalar uchun shartlar bormi?",
        answer:
          "Ha. Doimiy oqimli doʻkon va kompaniyalar uchun muntazam olib ketish, qaytarish, COD va hisobotlarni kelishamiz. Soʻrovnoma yoki ulanish formasidan boshlang.",
      },
    ],
    supportTitle: "Qoʻllab-quvvatlash",
    supportLead:
      "Trek-raqam, status, hisob arizasi va biznes ulanishi boʻyicha yordam beramiz.",
    companyTitle: "Kompaniya haqida",
    contactsTitle: "Sayt boʻlimlari",
    legalTitle: "Rekvizitlar",
    addressLabel: "Manzil",
    phoneLabel: "Telefon",
    emailLabel: "Email",
    messengersTitle: "Messenger va ijtimoiy tarmoqlar",
    ctaCalculate: "Kalkulyatorni ochish",
    ctaBusiness: "Biznes uchun ariza",
    ctaTrack: "Joʻnatmani kuzatish",
    ctaContacts: "Bizga yozish",
  },
  services: {
    intro:
      "Xizmatni vazifa boʻyicha tanlang: nima yuborish, qayerdan olish va qayerga yetkazish. Saytda narx eʼlon qilinmaydi.",
    priceNote:
      "Narx yoʻnalish, ogʻirlik, oʻlcham, yetkazish usuli va joʻnatmalar soniga bogʻliq. Hisob olish uchun soʻrov qoldiring.",
    items: [
      {
        id: "documents",
        title: "Hujjatlarni yetkazish",
        audience: "Hujjat aylanishiga ega jismoniy shaxslar va kompaniyalar",
        howItWorks: "Hujjatlarni punktga yoki kuryerga topshirasiz — qabul qiluvchiga yetkazamiz.",
        includes: ["Hujjatlarni qabul qilish", "Yoʻnalish statuslari", "Topshirish tasdiqi"],
        accepted: "Shikastlanishni oldini oluvchi qadoqdagi hujjatlar.",
        neededForQuote: "Yoʻnalish, shoshilinchlik, olib ketish va yetkazish usuli.",
        limitations: "Xizmat shartlaridagi taqiqlangan qoʻshimchalar.",
        faqs: [
          {
            question: "Shoshilinch mumkinmi?",
            answer: "Formada shoshilinch yetkazishni belgilang — menejer imkoniyatni tasdiqlaydi.",
          },
        ],
      },
      {
        id: "parcels",
        title: "Pochta yetkazish",
        audience: "Jismoniy yuboruvchi va qabul qiluvchilar",
        howItWorks: "Soʻrov qoldirasiz, pochtani topshirasiz, statusni kuzatasiz.",
        includes: ["Qabul", "Tashish", "Topshirish yoki punkt orqali berish"],
        accepted: "Kelishilgan ogʻirlik va oʻlchamdagi pochtalar.",
        neededForQuote: "Yoʻnalish, ogʻirlik, oʻlcham yoki «aniq parametrlarni bilmayman».",
        limitations: "Taqiqlangan toifalar va xavfli yuklar qabul qilinmaydi.",
        faqs: [
          {
            question: "Qadoqlash kerakmi?",
            answer: "Ha, tarkib tashish uchun xavfsiz qadoqlanishi kerak.",
          },
        ],
      },
      {
        id: "door",
        title: "Eshikgacha yetkazish",
        audience: "Punktga bormasdan yetkazishni xohlovchilar",
        howItWorks: "Kuryer joʻnatmani qabul qiluvchi manziliga yetkazadi.",
        includes: ["Manzilli yetkazish", "Topshirish urinishlari", "Statuslar"],
        accepted: "Xizmat qoidalariga mos hujjatlar va pochtalar.",
        neededForQuote: "Yetkazish manzili, yoʻnalish, joʻnatma parametrlari.",
        limitations: "Mavjudlik aholi punktiga bogʻliq.",
        faqs: [
          {
            question: "Necha marta uriniladi?",
            answer: "Uchtagacha bepul urinish — tasdiqlangan xizmat shartlariga koʻra.",
          },
        ],
      },
      {
        id: "courier",
        title: "Kuryer chaqirish",
        audience: "Punktga bormasdan topshirishni xohlovchilar",
        howItWorks: "Kuryer kelishilgan vaqtda manzildan joʻnatmani oladi.",
        includes: ["Olib ketish", "Rasmiylashtirish", "Yoʻnalishga topshirish"],
        accepted: "Xizmat qoidalariga mos hujjatlar va pochtalar.",
        neededForQuote: "Olib ketish manzili, sana, joʻnatma parametrlari.",
        limitations: "Olib ketish vaqtlari menejer tomonidan aniqlanadi.",
        faqs: [
          {
            question: "Kuryer qachon keladi?",
            answer: "Formada sanani koʻrsatish mumkin; aniq oynani menejer tasdiqlaydi.",
          },
        ],
      },
      {
        id: "ecommerce",
        title: "Internet-doʻkonlar uchun yetkazish",
        audience: "Internet-doʻkonlar va ijtimoiy tarmoq sotuvchilari",
        howItWorks: "Buyurtmalarni olib, xaridorlarga yetkazamiz va status beramiz.",
        includes: ["Muntazam olib ketish", "Eshikgacha yetkazish", "Qaytarishlar", "Hisobot"],
        accepted: "Tashishga ruxsat etilgan tovarlar.",
        neededForQuote: "Oylik hajm, shaharlar, toʻlov va API kerakligi.",
        limitations: "Ulanish shartlari individual kelishiladi.",
        faqs: [
          {
            question: "Ommaviy qayta ishlash bormi?",
            answer: "Ha, korporativ taklif bosqichida muhokama qilinadi.",
          },
        ],
      },
      {
        id: "corporate",
        title: "Korporativ yetkazib berish",
        audience: "Muntazam joʻnatmali kompaniyalar",
        howItWorks: "Shartnoma tuzamiz, jarayon va hisobotlarni sozlaymiz.",
        includes: ["Shaxsiy shartlar", "Hisobot", "Ajratilgan qoʻllab-quvvatlash"],
        accepted: "Shartnoma boʻyicha hujjatlar va pochtalar.",
        neededForQuote: "Hajm, yoʻnalishlar, SLA va API zarurati.",
        limitations: "Ishga tushirish jarayonlar kelishilgandan keyin.",
        faqs: [
          {
            question: "Shartnoma kerakmi?",
            answer: "Ha, muntazam hamkorlik uchun shartnoma tuziladi.",
          },
        ],
      },
      {
        id: "cod",
        title: "Yetkazib berishda toʻlov",
        audience: "Topshirishda toʻlov olishni xohlovchi sotuvchilar",
        howItWorks: "Buyurtmani yetkazamiz va kelishilgan qoidalar boʻyicha toʻlov qabul qilamiz.",
        includes: ["Topshirish", "Toʻlov qabul qilish", "Status hisobotlari"],
        accepted: "Yetkazib berishda toʻlov qoidalariga mos tovarlar.",
        neededForQuote: "Eʼlon qilingan qiymat, yoʻnalish, hajm.",
        limitations: "Aniq qoidalar alohida kelishiladi.",
        faqs: [
          {
            question: "Pul qachon keladi?",
            answer: "Oʻtkazma muddati xizmat ulanishida tasdiqlanadi.",
          },
        ],
      },
      {
        id: "returns",
        title: "Joʻnatmalarni qaytarish",
        audience: "Topshirish imkonsiz boʻlganda yoki rad etilganda",
        howItWorks: "Qaytarishni rasmiylashtiramiz va joʻnatmani yuboruvchiga qaytaramiz.",
        includes: ["Qaytarishni rasmiylashtirish", "Qayta yetkazish", "Statuslar"],
        accepted: "Avval yetkazishga qabul qilingan joʻnatmalar.",
        neededForQuote: "Trek-raqam va qaytarish sababi.",
        limitations: "Yetkazilmagan joʻnatmani bepul qaytarish — xizmat shartlariga koʻra.",
        faqs: [
          {
            question: "Qaytarish doim bepulmi?",
            answer:
              "Yetkazilmagan joʻnatmani bepul qaytarish xizmat shartlarida tasdiqlangan; boshqa holatlar menejer bilan aniqlanadi.",
          },
        ],
      },
    ],
  },
  business: {
    heroTitle: "Internet-doʻkonlar va kompaniyalar uchun yetkazib berish",
    heroLead:
      "Oʻz kuryer xizmatisiz muntazam olib ketish, statuslar, qaytarishlar va API.",
    segmentsTitle: "Kimlar uchun",
    segments: [
      {
        title: "Internet-doʻkonlar",
        text: "Buyurtmalarni kuzatuv va qaytarishlar bilan yetkazish.",
      },
      {
        title: "Marketplace sotuvchilari",
        text: "Ommaviy joʻnatmalar va status nazorati.",
      },
      {
        title: "Hujjat aylanishli kompaniyalar",
        text: "Ofislar va hamkorlar oʻrtasida ishonchli hujjat yetkazish.",
      },
      {
        title: "Muntazam joʻnatmalar",
        text: "Barqaror hajmda individual shartlar.",
      },
    ],
    capabilitiesTitle: "Imkoniyatlar",
    capabilities: [
      "Ommaviy joʻnatma yaratish",
      "Muntazam olib ketish",
      "Yetkazish statuslari",
      "Qaytarishlar",
      "Yetkazib berishda toʻlov",
      "Hisobotlar",
      "API va shaxsiy shartlar",
    ],
    connectTitle: "Ulanish sxemasi",
    connectSteps: [
      "Ariza",
      "Jarayonlarni aniqlash",
      "Taklif",
      "Shartnoma",
      "Integratsiya yoki ishga tushirish",
    ],
    apiTitle: "Biznes uchun API",
    apiLead:
      "API orqali joʻnatma yaratish, status olish va hisobot yuritish mumkin. Yopiq texnik tafsilotlar kelishuvdan keyin beriladi.",
    formTitle: "Korporativ ariza",
    connectCtaTitle: "Yetkazib berishni ulashga tayyormisiz?",
    connectCtaLead:
      "Qisqa ariza toʻldiring — jarayonlarni aniqlaymiz va taklif tayyorlaymiz.",
  },
  businessConnect: {
    title: "Biznes uchun ulanish",
    lead: "Uch qadam: kompaniya, hajmlar va tafsilotlar — menejer onboarding uchun bogʻlanadi.",
    steps: ["Kompaniya", "Hajmlar", "Tafsilotlar"],
    successTitle: "Ulanish arizasi qabul qilindi",
    successText:
      "EPOS POCHTA menejeri siz bilan bogʻlanib, jarayonlarni aniqlaydi va shartlarni taklif qiladi.",
    fields: {
      regularPickup: "Muntazam olib ketish kerak",
      needCod: "Yetkazib berishda toʻlov kerak",
    },
  },
  tracking: {
    title: "Joʻnatmani kuzatish",
    lead: "Kvitansiya yoki SMS dagi trek-raqamni kiriting.",
    placeholder: "Trek-raqam",
    loadingText: "Joʻnatma qidirilmoqda…",
    formatErrorTitle: "Trek-raqam formati notoʻgʻri",
    formatErrorText:
      "Kamida 6 belgi, harflar, raqamlar yoki chiziqcha. Boʻshliqlar avtomatik olib tashlanadi.",
    errorTitle: "Joʻnatma topilmadi",
    errorText:
      "Raqamni tekshirib qayta urinib koʻring. Xato takrorlansa, qoʻllab-quvvatlashga murojaat qiling.",
    supportCta: "Qoʻllab-quvvatlashga qoʻngʻiroq",
    resultTitle: "Joʻnatma statusi",
  },
  requestPrice: {
    title: "Biznes uchun tijorat taklifi",
    lead: "4 ta qisqa savolga javob bering — menejer hajmingiz va yoʻnalishlaringiz uchun shartlarni tayyorlaydi. Saytda ochiq tarif va oferta yoʻq.",
    priceNote:
      "Bu individual hisob uchun ariza. Yakuniy narx va muddatni menejer kelishuvdan keyin tasdiqlaydi.",
    steps: ["Yuk", "Hajm", "Xizmatlar", "Aloqa"],
    progressTemplate: "{current}-qadam / {total}",
    questionCargo: "Asosan nima yuborasiz?",
    questionVolume: "Oyiga nechta joʻnatma?",
    questionServices: "Qaysi xizmatlar kerak?",
    questionServicesHint: "Bir nechtasini tanlash mumkin",
    questionContact: "Taklifni qayerga yuboraylik?",
    questionContactLead:
      "Kompaniya aloqasini qoldiring — menejer tijorat taklifi bilan bogʻlanadi.",
    cargoOptions: [
      {
        id: "documents",
        title: "Hujjatlar",
        description: "Shartnomalar, aktlar, yozishmalar",
      },
      {
        id: "parcels",
        title: "Pochta",
        description: "Shaxsiy va korporativ joʻnatmalar",
      },
      {
        id: "goods",
        title: "Xaridorlarga tovarlar",
        description: "Internet-doʻkon buyurtmalari",
      },
      {
        id: "mixed",
        title: "Aralash oqim",
        description: "Bir necha turdagi joʻnatmalar",
      },
    ],
    volumeOptions: [
      {
        id: "1-50",
        title: "50 gacha",
        description: "Start yoki pilot hajm",
      },
      {
        id: "51-200",
        title: "51–200",
        description: "Muntazam joʻnatmalar",
      },
      {
        id: "201-1000",
        title: "201–1000",
        description: "Oʻsib borayotgan e-commerce",
      },
      {
        id: "1000+",
        title: "1000+",
        description: "Ommaviy joʻnatmalar",
      },
    ],
    serviceOptions: [
      { id: "pickup", title: "Muntazam olib ketish" },
      { id: "door", title: "Eshikgacha yetkazish" },
      { id: "cod", title: "Yetkazib berishda toʻlov" },
      { id: "api", title: "API va statuslar" },
      { id: "returns", title: "Qaytarishlar" },
    ],
    successTitle: "Ariza qabul qilindi",
    successText:
      "EPOS POCHTA menejeri siz bilan bogʻlanib, hajmingiz uchun tijorat taklifini tayyorlaydi.",
    fields: {
      monthlyVolume: "Oyiga joʻnatmalar soni",
      needApi: "API kerakligi",
      comment: "Izoh",
      routes: "Asosiy yoʻnalishlar yoki shaharlar",
      yes: "Ha",
      no: "Yoʻq",
    },
  },
  calculator: {
    title: "Narx kalkulyatori",
    lead: "Shaharlar, ogʻirlik va oʻlchamlarni kiriting — taxminiy narx va muddatni koʻrsatamiz. Bu yakuniy tarif emas.",
    breadcrumbHome: "Bosh sahifa",
    breadcrumbCurrent: "Kalkulyator",
    disclaimer:
      "Hisob taxminiydir va oferta emas. Yakuniy narx va muddatni menejer tasdiqlaydi.",
    fromLabel: "Qayerdan",
    toLabel: "Qayerga",
    cityPlaceholder: "Shahar, tuman yoki viloyat",
    swap: "Manzillarni almashtirish",
    weightLabel: "Ogʻirlik",
    lengthLabel: "Uzunlik",
    widthLabel: "Kenglik",
    heightLabel: "Balandlik",
    unitKg: "kg",
    unitCm: "sm",
    limitsNote:
      "Kalkulyator limitlari: ogʻirlik 0–30 kg, har bir tomon 0–100 sm. Katta yuk uchun menejerga ariza qoldiring.",
    calculateCta: "Narxni hisoblash",
    resetCta: "Tozalash",
    resultTitle: "Taxminiy smeta",
    resultRangeLabel: "Narx boʻyicha orientir",
    resultEtaLabel: "Taxminiy muddat",
    billableLabel: "Hisobiy ogʻirlik",
    confirmCta: "Menejer bilan tasdiqlash",
    errors: {
      fromCity: "Yuboruvchi shahrini tanlang",
      toCity: "Qabul qiluvchi shahrini tanlang",
    },
  },
  about: {
    title: "Kompaniya haqida",
    lead: "EPOS POCHTA — Oʻzbekiston Respublikasi hududida yetkazib berish xizmatlarini taqdim etuvchi zamonaviy kuryerlik kompaniyasi.",
    missionTitle: "Missiya va yondashuv",
    mission:
      "Jismoniy shaxslar va biznesga yetkazib berishni tez va tushunarli tashkil etishda yordam beramiz: shaffof jarayon, har bosqichda status va oddiy qoʻllab-quvvatlash.",
    geoTitle: "Geografiya",
    geo: "Oʻzbekiston hududi boʻylab yetkazamiz. Aniq muddatlar hisobda tasdiqlanadi.",
    benefitsTitle: "Operatsion imkoniyatlar",
    legalTitle: "Yuridik maʼlumotlar",
  },
  news: {
    title: "Yangiliklar",
    lead: "Xizmat eʼlonlari, yetkazib berish geografiyasi va biznes yechimlari.",
    readMore: "Oʻqish",
    backToNews: "Barcha yangiliklar",
    empty: "Hozircha eʼlon qilingan yangiliklar yoʻq.",
    emptyFiltered: "Tanlangan filtrlar boʻyicha hech narsa topilmadi.",
    otherNews: "Boshqa yangiliklar",
    searchPlaceholder: "Yangiliklar boʻyicha qidirish",
    allCategories: "Barcha mavzular",
    categoriesTitle: "Mavzular",
    categories: {
      company: "Kompaniya",
      product: "Xizmat",
      business: "Biznes",
      geography: "Geografiya",
    },
    sortLabel: "Saralash",
    sortNewest: "Avval yangilari",
    sortOldest: "Avval eskilari",
    sortTitleAsc: "Nom boʻyicha A–Z",
    sortTitleDesc: "Nom boʻyicha Z–A",
    resultsLabel: "{from}–{to} / {total}",
    resetFilters: "Filtrlarni tozalash",
    prevPage: "Orqaga",
    nextPage: "Oldinga",
    pageLabel: "{page}-sahifa / {pages}",
  },
  contacts: {
    title: "Aloqa",
    lead: "Telefon yoki Telegram orqali bogʻlaning.",
    channelsTitle: "Qanday bogʻlanish",
    addressTitle: "Manzil",
    socialTitle: "Ijtimoiy tarmoqlar",
    telegramLabel: "Telegramda yozish",
    mapNote: "Ofis Toshkentda — tashrifni oldindan telefon yoki Telegram orqali kelishing.",
    openInMaps: "Xaritada ochish",
  },
  privacy: {
    title: "Maxfiylik siyosati",
    body: [
      "Bu matn ishchi asos boʻlib, yuridik hujjat sifatida EPOS POCHTA bilan kelishilishi kerak.",
      "Biz faqat murojaatni qayta ishlash uchun kerakli maʼlumotlarni yigʻamiz: aloqa, joʻnatma parametrlari va ariza texnik maʼlumotlari (sana, til, URL, UTM).",
      "Maʼlumotlar HTTPS orqali uzatiladi va mijoz bilan bogʻlanish, narx hisoblash va yetkazish shartnomasini bajarish uchun ishlatiladi.",
      "Ochiq kuzatuv F.I.Sh., telefon, toʻliq manzil yoki joʻnatma narxini koʻrsatmaydi.",
      "Arizalarni saqlash muddati va oʻchirish tartibi buyurtmachi bilan kelishilgandan keyin aks ettiriladi.",
    ],
  },
  terms: {
    title: "Xizmat koʻrsatish shartlari",
    body: [
      "Bu boʻlim shartlarning ishchi asosi boʻlib, EPOS POCHTA kelishilgan tahriri bilan almashtiriladi.",
      "Yetkazib berish narxi soʻrov boʻyicha individual hisoblanadi va saytda tarif jadvali sifatida eʼlon qilinmaydi.",
      "Yuboruvchi maʼlumotlarning toʻgʻriligi va tarkibning ruxsat etilganligi uchun javobgardir.",
      "Muddatlar yoʻnalishga bogʻliq va hisobda tasdiqlanadi.",
    ],
    prohibitedTitle: "Taqiqlangan joʻnatmalar",
    prohibitedNote:
      "Taqiqlangan toifalarning toʻliq roʻyxati buyurtmachi roʻyxatini taqdim etgach eʼlon qilinadi. Shu paytgacha menejer arizani koʻrib chiqishda cheklovlarni aniqlaydi.",
  },
  notFound: {
    title: "Sahifa topilmadi",
    lead: "Manzilni tekshiring yoki kerakli amalga oʻting.",
  },
  cta: {
    title: "Yetkazib berish kerakmi?",
    lead: "Soʻrov qoldiring — narx va muddatni hisoblaymiz.",
  },
  formCommon: {
    name: "Aloqa shaxsi ismi",
    phone: "Telefon",
    email: "Email",
    company: "Kompaniya nomi",
    inn: "STIR",
    message: "Xabar",
    topic: "Mavzu",
    trackNumber: "Trek-raqam (agar bor)",
    consent: "Shaxsiy maʼlumotlarni qayta ishlashga roziman",
    clientTypePerson: "Jismoniy shaxs",
    clientTypeCompany: "Kompaniya",
    preferCall: "Qoʻngʻiroq",
    preferTelegram: "Telegram",
    preferEmail: "Email",
    honeypot: "Bu maydonni toʻldirmang",
  },
};
