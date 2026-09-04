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
    requestPriceTitle: "Narx soʻrash",
    requestPriceDescription:
      "Joʻnatma parametrlarini qoldiring — menejer narx va taxminiy muddatni aytadi.",
    aboutTitle: "Kompaniya haqida",
    aboutDescription:
      "EPOS POCHTA — Oʻzbekiston Respublikasi hududida yetkazib berish xizmatlarini taqdim etuvchi zamonaviy kuryerlik kompaniyasi.",
    contactsTitle: "Aloqa",
    contactsDescription: "EPOS POCHTA telefoni, manzili va aloqa shakli.",
    privacyTitle: "Maxfiylik siyosati",
    privacyDescription: "EPOS POCHTA shaxsiy maʼlumotlarni qanday qayta ishlaydi.",
    termsTitle: "Xizmat koʻrsatish shartlari",
    termsDescription: "Yetkazib berish shartlari va cheklovlar.",
    notFoundTitle: "Sahifa topilmadi",
  },
  ui: {
    requestPrice: "Narx soʻrash",
    callCourier: "Kuryer chaqirish",
    track: "Kuzatish",
    forBusiness: "Biznes uchun",
    getOffer: "Taklif olish",
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
    floatingPhone: "Qoʻngʻiroq",
    floatingTelegram: "Telegram",
  },
  nav: [
    { label: "Xizmatlar", href: "/services/" },
    { label: "Biznes uchun", href: "/business/" },
    { label: "Kuzatish", href: "/tracking/" },
    { label: "Kompaniya", href: "/about/" },
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
    businessLead: "Internet-doʻkon va kompaniyalarni muntazam yetkazib berishga ulaymiz.",
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
    faqTitle: "Koʻp soʻraladigan savollar",
    faq: [
      {
        question: "Qanday joʻnatmalar qabul qilinadi?",
        answer:
          "Hujjatlar, pochtalar va xaridorlarga tovarlar — kelishilgan cheklovlar doirasida. Taqiqlangan toifalar roʻyxati shartlarda eʼlon qilinadi.",
      },
      {
        question: "Narxni qanday bilaman?",
        answer:
          "Forma orqali soʻrov qoldiring. Saytda tarif jadvallari va avtomatik yakuniy narx yoʻq.",
      },
      {
        question: "Yetkazib berish qancha vaqt oladi?",
        answer:
          "Muddat yoʻnalish va usulga bogʻliq. Menejer narx bilan birga taxminiy muddatni aytadi.",
      },
      {
        question: "Kuryer chaqirish mumkinmi?",
        answer:
          "Ha. «Kuryer chaqirish» ni tanlang yoki narx soʻrash formasida kuryer olib ketishini belgilang.",
      },
      {
        question: "Trek-raqamni qayerdan topaman?",
        answer: "Topshirish kvitansiyasida yoki SMS xabarnomada.",
      },
      {
        question: "Qabul qiluvchi joyida boʻlmasa?",
        answer:
          "Uchtagacha bepul topshirish urinishi nazarda tutilgan. Qaytarish shartlari rasmiylashtirishda aniqlanadi.",
      },
      {
        question: "Yetkazib berishda toʻlov bormi?",
        answer:
          "Ha, kelishilgan ssenariylar uchun. Formada belgilang — menejer shartlarni tasdiqlaydi.",
      },
      {
        question: "Biznes va API qanday ulanadi?",
        answer:
          "«Biznes uchun» sahifasida korporativ ariza qoldiring. Jarayonlarni aniqlab, ulanish shartlarini taklif qilamiz.",
      },
    ],
    finalTitle: "Pochta yuborish kerakmi?",
    finalLead: "Maʼlumot qoldiring — yetkazib berish narxini hisoblaymiz",
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
  },
  tracking: {
    title: "Joʻnatmani kuzatish",
    lead: "Kvitansiya yoki SMS dagi trek-raqamni kiriting.",
    placeholder: "Trek-raqam",
    emptyHint:
      "Trek-raqam odatda topshirish kvitansiyasida yoki SMS da koʻrsatiladi.",
    unavailableTitle: "Kuzatuv tez orada ochiladi",
    unavailableText:
      "Sahifa EPOS POCHTA status tizimiga ulashga tayyor. API ulanmaguncha joriy statusni telefon orqali aniqlashingiz mumkin.",
    formatErrorTitle: "Trek-raqam formati notoʻgʻri",
    formatErrorText:
      "Kamida 6 belgi, harflar, raqamlar yoki chiziqcha. Boʻshliqlar avtomatik olib tashlanadi.",
    errorTitle: "Joʻnatma topilmadi",
    errorText:
      "Raqamni tekshirib qayta urinib koʻring. Xato takrorlansa, qoʻllab-quvvatlashga murojaat qiling.",
    supportCta: "Qoʻllab-quvvatlashga qoʻngʻiroq",
    timelinePreviewTitle: "Statuslar qanday koʻrinadi",
    timelinePreviewNote:
      "Bu faqat interfeys namunasi. Haqiqiy statuslar faqat API ulanganidan keyin chiqadi.",
    sampleStatuses: [
      "Qabul qilindi",
      "Yoʻlda",
      "Yetkazishga chiqdi",
      "Yetkazildi",
    ],
  },
  requestPrice: {
    title: "Narx soʻrash",
    lead: "Menejer narx va taxminiy muddatni hisoblaydi. Saytda avtomatik narx koʻrsatilmaydi.",
    steps: ["Yoʻnalish", "Joʻnatma", "Aloqa"],
    successTitle: "Soʻrov qabul qilindi",
    successText:
      "EPOS POCHTA menejeri siz bilan bogʻlanib, narx va muddatni xabar qiladi.",
    fields: {
      fromRegion: "Yuborish viloyati",
      fromCity: "Yuborish shahri yoki tumani",
      toRegion: "Qabul qilish viloyati",
      toCity: "Qabul qilish shahri yoki tumani",
      pickup: "Kuryer olib ketishi",
      doorDelivery: "Eshikgacha yetkazish",
      category: "Toifa",
      description: "Tarkibning qisqa tavsifi",
      places: "Joylar soni",
      weight: "Taxminiy ogʻirlik, kg",
      length: "Uzunlik, sm",
      width: "Kenglik, sm",
      height: "Balandlik, sm",
      unknownDims: "Aniq ogʻirlik va oʻlchamlarni bilmayman",
      urgent: "Shoshilinch yetkazish",
      cod: "Yetkazib berishda toʻlov",
      declaredValue: "Eʼlon qilingan qiymat",
      preferredDate: "Olib ketish sanasi",
      clientType: "Mijoz turi",
      contactMethod: "Aloqa usuli",
      monthlyVolume: "Oyiga joʻnatmalar soni",
      needApi: "API kerakligi",
      comment: "Izoh",
      yes: "Ha",
      no: "Yoʻq",
      catDocuments: "Hujjatlar",
      catParcel: "Pochta",
      catGoods: "Tovar",
      catOther: "Boshqa",
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
  contacts: {
    title: "Aloqa",
    lead: "Telefon orqali bogʻlaning yoki qisqa xabar qoldiring.",
    formTitle: "Aloqa shakli",
    mapNote:
      "Xarita xizmati va koordinatalar kelishilgandan keyin ulanadi.",
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
