export type ShipmentCategory = "documents" | "parcel" | "goods" | "regular" | "other";

export type DeliveryMode =
  | "warehouse-warehouse"
  | "warehouse-door"
  | "door-warehouse"
  | "door-door";

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  audience: string;
  howItWorks: string;
  includes: string[];
  accepted: string;
  neededForQuote: string;
  limitations: string;
  faqs: Array<{ question: string; answer: string }>;
}

export interface SiteCopy {
  meta: {
    homeTitle: string;
    homeDescription: string;
    servicesTitle: string;
    servicesDescription: string;
    businessTitle: string;
    businessDescription: string;
    trackingTitle: string;
    trackingDescription: string;
    requestPriceTitle: string;
    requestPriceDescription: string;
    calculatorTitle: string;
    calculatorDescription: string;
    faqTitle: string;
    faqDescription: string;
    businessConnectTitle: string;
    businessConnectDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    newsTitle: string;
    newsDescription: string;
    contactsTitle: string;
    contactsDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
    notFoundTitle: string;
  };
  ui: {
    requestPrice: string;
    calculate: string;
    callCourier: string;
    track: string;
    forBusiness: string;
    getOffer: string;
    startConnect: string;
    learnApi: string;
    geoCheck: string;
    call: string;
    write: string;
    send: string;
    next: string;
    back: string;
    getQuote: string;
    menu: string;
    close: string;
    cookieText: string;
    cookieAccept: string;
    cookieDecline: string;
    required: string;
    placeholderEmail: string;
    placeholderHours: string;
    placeholderTelegram: string;
  };
  nav: NavItem[];
  footer: {
    blurb: string;
    legal: string;
    privacy: string;
    terms: string;
    contacts: string;
    support: string;
    faqLink: string;
  };
  home: {
    heroTitle: string;
    heroLead: string;
    heroNote: string;
    trackTitle: string;
    trackPlaceholder: string;
    trackHint: string;
    quoteTitle: string;
    quoteFrom: string;
    quoteTo: string;
    quoteCategory: string;
    quoteSwap: string;
    quoteCta: string;
    quoteNote: string;
    needsTitle: string;
    needs: Array<{ id: ShipmentCategory; title: string; description: string }>;
    modesTitle: string;
    chainSteps: [string, string, string, string, string];
    modes: Array<{ id: DeliveryMode; title: string; description: string }>;
    benefitsTitle: string;
    benefits: string[];
    howTitle: string;
    howSteps: Array<{ title: string; text: string }>;
    businessTitle: string;
    businessEyebrow: string;
    businessLead: string;
    businessItems: string[];
    geoTitle: string;
    geoLead: string;
    geoSearchPlaceholder: string;
    geoEmpty: string;
    geoAvailable: string;
    newsTitle: string;
    newsLead: string;
    newsAll: string;
    finalTitle: string;
    finalLead: string;
  };
  faq: {
    title: string;
    lead: string;
    searchPlaceholder: string;
    allCategories: string;
    emptySearch: string;
    resultsLabel: string;
    topicsTitle: string;
    categories: Array<{ id: string; title: string; description: string }>;
    items: Array<{
      id: string;
      categoryId: string;
      question: string;
      answer: string;
    }>;
    supportTitle: string;
    supportLead: string;
    companyTitle: string;
    contactsTitle: string;
    legalTitle: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    messengersTitle: string;
    ctaCalculate: string;
    ctaBusiness: string;
    ctaTrack: string;
    ctaContacts: string;
  };
  services: {
    intro: string;
    priceNote: string;
    items: ServiceItem[];
  };
  business: {
    heroTitle: string;
    heroLead: string;
    segmentsTitle: string;
    segments: Array<{ title: string; text: string }>;
    capabilitiesTitle: string;
    capabilities: string[];
    connectTitle: string;
    connectSteps: string[];
    apiTitle: string;
    apiLead: string;
    formTitle: string;
    connectCtaTitle: string;
    connectCtaLead: string;
  };
  businessConnect: {
    title: string;
    lead: string;
    steps: [string, string, string];
    successTitle: string;
    successText: string;
    fields: {
      regularPickup: string;
      needCod: string;
    };
  };
  tracking: {
    title: string;
    lead: string;
    placeholder: string;
    loadingText: string;
    formatErrorTitle: string;
    formatErrorText: string;
    errorTitle: string;
    errorText: string;
    supportCta: string;
    resultTitle: string;
  };
  requestPrice: {
    title: string;
    lead: string;
    priceNote: string;
    trustTitle: string;
    trustItems: string[];
    steps: [string, string, string, string];
    progressTemplate: string;
    questionCargo: string;
    questionVolume: string;
    questionServices: string;
    questionServicesHint: string;
    questionContact: string;
    questionContactLead: string;
    cargoOptions: Array<{ id: string; title: string; description: string }>;
    volumeOptions: Array<{ id: string; title: string; description: string }>;
    serviceOptions: Array<{ id: string; title: string }>;
    successTitle: string;
    successText: string;
    fields: {
      monthlyVolume: string;
      needApi: string;
      comment: string;
      routes: string;
      yes: string;
      no: string;
    };
  };
  calculator: {
    title: string;
    lead: string;
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    disclaimer: string;
    fromLabel: string;
    toLabel: string;
    cityPlaceholder: string;
    swap: string;
    weightLabel: string;
    lengthLabel: string;
    widthLabel: string;
    heightLabel: string;
    unitKg: string;
    unitCm: string;
    limitsNote: string;
    calculateCta: string;
    resetCta: string;
    resultTitle: string;
    resultRangeLabel: string;
    resultEtaLabel: string;
    billableLabel: string;
    confirmCta: string;
    errors: {
      fromCity: string;
      toCity: string;
    };
  };
  about: {
    title: string;
    lead: string;
    missionTitle: string;
    mission: string;
    geoTitle: string;
    geo: string;
    benefitsTitle: string;
    legalTitle: string;
  };
  news: {
    title: string;
    lead: string;
    readMore: string;
    backToNews: string;
    empty: string;
    otherNews: string;
  };
  contacts: {
    title: string;
    lead: string;
    formTitle: string;
    channelsTitle: string;
    addressTitle: string;
    socialTitle: string;
    telegramLabel: string;
    mapNote: string;
  };
  privacy: {
    title: string;
    body: string[];
  };
  terms: {
    title: string;
    body: string[];
    prohibitedTitle: string;
    prohibitedNote: string;
  };
  notFound: {
    title: string;
    lead: string;
  };
  cta: {
    title: string;
    lead: string;
  };
  formCommon: {
    name: string;
    phone: string;
    email: string;
    company: string;
    inn: string;
    message: string;
    topic: string;
    trackNumber: string;
    consent: string;
    clientTypePerson: string;
    clientTypeCompany: string;
    preferCall: string;
    preferTelegram: string;
    preferEmail: string;
    honeypot: string;
  };
}

export const uzbekistanRegions = [
  { id: "tashkent-city", ru: "г. Ташкент", uz: "Toshkent shahri" },
  { id: "tashkent-region", ru: "Ташкентская область", uz: "Toshkent viloyati" },
  { id: "andijan", ru: "Андижанская область", uz: "Andijon viloyati" },
  { id: "bukhara", ru: "Бухарская область", uz: "Buxoro viloyati" },
  { id: "fergana", ru: "Ферганская область", uz: "Fargʻona viloyati" },
  { id: "jizzakh", ru: "Джизакская область", uz: "Jizzax viloyati" },
  { id: "kashkadarya", ru: "Кашкадарьинская область", uz: "Qashqadaryo viloyati" },
  { id: "khorezm", ru: "Хорезмская область", uz: "Xorazm viloyati" },
  { id: "namangan", ru: "Наманганская область", uz: "Namangan viloyati" },
  { id: "navoi", ru: "Навоийская область", uz: "Navoiy viloyati" },
  { id: "samarkand", ru: "Самаркандская область", uz: "Samarqand viloyati" },
  { id: "sirdarya", ru: "Сырдарьинская область", uz: "Sirdaryo viloyati" },
  { id: "surkhandarya", ru: "Сурхандарьинская область", uz: "Surxondaryo viloyati" },
  { id: "karakalpakstan", ru: "Республика Каракалпакстан", uz: "Qoraqalpogʻiston Respublikasi" },
] as const;

export const uzbekistanCities = [
  { id: "tashkent", regionId: "tashkent-city", ru: "Ташкент", uz: "Toshkent" },
  { id: "chirchik", regionId: "tashkent-region", ru: "Чирчик", uz: "Chirchiq" },
  { id: "angren", regionId: "tashkent-region", ru: "Ангрен", uz: "Angren" },
  { id: "nurafshon", regionId: "tashkent-region", ru: "Нурафшон", uz: "Nurafshon" },
  { id: "yangiyul", regionId: "tashkent-region", ru: "Янгиюль", uz: "Yangiyoʻl" },
  { id: "andijan", regionId: "andijan", ru: "Андижан", uz: "Andijon" },
  { id: "asaka", regionId: "andijan", ru: "Асака", uz: "Asaka" },
  { id: "bukhara", regionId: "bukhara", ru: "Бухара", uz: "Buxoro" },
  { id: "kagan", regionId: "bukhara", ru: "Каган", uz: "Kogon" },
  { id: "fergana", regionId: "fergana", ru: "Фергана", uz: "Fargʻona" },
  { id: "kokand", regionId: "fergana", ru: "Коканд", uz: "Qoʻqon" },
  { id: "margilan", regionId: "fergana", ru: "Маргилан", uz: "Margʻilon" },
  { id: "jizzakh", regionId: "jizzakh", ru: "Джизак", uz: "Jizzax" },
  { id: "karshi", regionId: "kashkadarya", ru: "Карши", uz: "Qarshi" },
  { id: "shahrisabz", regionId: "kashkadarya", ru: "Шахрисабз", uz: "Shahrisabz" },
  { id: "urgench", regionId: "khorezm", ru: "Ургенч", uz: "Urganch" },
  { id: "khiva", regionId: "khorezm", ru: "Хива", uz: "Xiva" },
  { id: "namangan", regionId: "namangan", ru: "Наманган", uz: "Namangan" },
  { id: "chust", regionId: "namangan", ru: "Чуст", uz: "Chust" },
  { id: "navoi", regionId: "navoi", ru: "Навои", uz: "Navoiy" },
  { id: "zarafshan", regionId: "navoi", ru: "Зарафшан", uz: "Zarafshon" },
  { id: "samarkand", regionId: "samarkand", ru: "Самарканд", uz: "Samarqand" },
  { id: "kattaqorgon", regionId: "samarkand", ru: "Каттакурган", uz: "Kattaqoʻrgʻon" },
  { id: "gulistan", regionId: "sirdarya", ru: "Гулистан", uz: "Guliston" },
  { id: "yangiyer", regionId: "sirdarya", ru: "Янгиер", uz: "Yangiyer" },
  { id: "termez", regionId: "surkhandarya", ru: "Термез", uz: "Termiz" },
  { id: "denov", regionId: "surkhandarya", ru: "Денау", uz: "Denov" },
  { id: "nukus", regionId: "karakalpakstan", ru: "Нукус", uz: "Nukus" },
  { id: "khujayli", regionId: "karakalpakstan", ru: "Ходжейли", uz: "Xoʻjayli" },
] as const;
