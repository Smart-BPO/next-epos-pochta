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
    aboutTitle: string;
    aboutDescription: string;
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
    callCourier: string;
    track: string;
    forBusiness: string;
    getOffer: string;
    learnApi: string;
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
    floatingPhone: string;
    floatingTelegram: string;
  };
  nav: NavItem[];
  footer: {
    blurb: string;
    legal: string;
    privacy: string;
    terms: string;
    contacts: string;
  };
  home: {
    heroTitle: string;
    heroLead: string;
    heroNote: string;
    trackTitle: string;
    trackPlaceholder: string;
    trackHint: string;
    needsTitle: string;
    needs: Array<{ id: ShipmentCategory; title: string; description: string }>;
    modesTitle: string;
    modes: Array<{ id: DeliveryMode; title: string; description: string }>;
    benefitsTitle: string;
    benefits: string[];
    howTitle: string;
    howSteps: Array<{ title: string; text: string }>;
    businessTitle: string;
    businessLead: string;
    businessItems: string[];
    geoTitle: string;
    geoLead: string;
    geoSearchPlaceholder: string;
    geoEmpty: string;
    geoAvailable: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
    finalTitle: string;
    finalLead: string;
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
  };
  tracking: {
    title: string;
    lead: string;
    placeholder: string;
    emptyHint: string;
    unavailableTitle: string;
    unavailableText: string;
    errorTitle: string;
    errorText: string;
  };
  requestPrice: {
    title: string;
    lead: string;
    steps: [string, string, string];
    successTitle: string;
    successText: string;
    fields: Record<string, string>;
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
  contacts: {
    title: string;
    lead: string;
    formTitle: string;
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
  { id: "andijan", regionId: "andijan", ru: "Андижан", uz: "Andijon" },
  { id: "bukhara", regionId: "bukhara", ru: "Бухара", uz: "Buxoro" },
  { id: "fergana", regionId: "fergana", ru: "Фергана", uz: "Fargʻona" },
  { id: "kokand", regionId: "fergana", ru: "Коканд", uz: "Qoʻqon" },
  { id: "jizzakh", regionId: "jizzakh", ru: "Джизак", uz: "Jizzax" },
  { id: "karshi", regionId: "kashkadarya", ru: "Карши", uz: "Qarshi" },
  { id: "urgench", regionId: "khorezm", ru: "Ургенч", uz: "Urganch" },
  { id: "namangan", regionId: "namangan", ru: "Наманган", uz: "Namangan" },
  { id: "navoi", regionId: "navoi", ru: "Навои", uz: "Navoiy" },
  { id: "samarkand", regionId: "samarkand", ru: "Самарканд", uz: "Samarqand" },
  { id: "gulistan", regionId: "sirdarya", ru: "Гулистан", uz: "Guliston" },
  { id: "termez", regionId: "surkhandarya", ru: "Термез", uz: "Termiz" },
  { id: "nukus", regionId: "karakalpakstan", ru: "Нукус", uz: "Nukus" },
] as const;
