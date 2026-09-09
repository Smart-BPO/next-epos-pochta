/**
 * Dashboard UI copy — plain language for everyday staff.
 * Nested object; keys are stable, wording can change.
 */
export type DashCopy = {
  brand: string;
  brandShort: string;
  logout: string;
  you: string;
  lang: { uz: string; ru: string; label: string };

  chrome: {
    notifications: string;
    noNotifications: string;
    viewAllLeads: string;
    viewAllLog: string;
    profile: string;
    newLead: string;
    messageFailed: string;
  };

  profile: {
    title: string;
    lead: string;
    sectionProfile: string;
    sectionPassword: string;
    sectionPhone: string;
    sectionEmail: string;
    displayName: string;
    bio: string;
    bioHint: string;
    role: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    saveProfile: string;
    changePassword: string;
    phone: string;
    email: string;
    currentPhone: string;
    currentEmail: string;
    verified: string;
    unverified: string;
    sendCode: string;
    confirmCode: string;
    otpCode: string;
    phoneSaved: string;
    emailSaved: string;
    profileSaved: string;
    passwordChanged: string;
    none: string;
    openProfile: string;
  };

  nav: {
    groups: { ops: string; content: string; system: string };
    overview: string;
    overviewShort: string;
    leads: string;
    contacts: string;
    contactsShort: string;
    shipments: string;
    shipmentsShort: string;
    news: string;
    newsShort: string;
    delivery: string;
    deliveryShort: string;
    media: string;
    settings: string;
    telegram: string;
    messaging: string;
    messagingShort: string;
    pricing: string;
    users: string;
  };

  common: {
    search: string;
    searchPlaceholder: string;
    perPage: string;
    view: string;
    table: string;
    cards: string;
    kanban: string;
    all: string;
    back: string;
    next: string;
    prev: string;
    pageOf: string; // "{page} / {pages}"
    showing: string; // "{from}–{to} of {total}"
    totalHint: string; // "(total {n})"
    nothingFound: string;
    resetFilters: string;
    emptyTitle: string;
    emptyFilteredLead: string;
    close: string;
    cancel: string;
    confirm: string;
    save: string;
    saving: string;
    create: string;
    edit: string;
    delete: string;
    deleted: string;
    copy: string;
    copied: string;
    open: string;
    add: string;
    actions: string;
    loading: string;
    more: string;
    moreMenu: string;
    accessDenied: string;
    goOverview: string;
  };

  badge: {
    lead: {
      draft: string;
      new: string;
      in_progress: string;
      done: string;
      spam: string;
    };
    shipment: {
      draft: string;
      pending_manager: string;
      confirmed: string;
      cancelled: string;
    };
    news: { draft: string; published: string };
    role: {
      owner: string;
      editor: string;
      crm: string;
      viewer: string;
    };
    source: {
      telegram_contact: string;
      manual: string;
      website: string;
      webapp: string;
    };
  };

  list: {
    status: string;
    category: string;
    source: string;
    locale: string;
    role: string;
    active: string;
    inactive: string;
    when: string;
    name: string;
    phone: string;
    telegram: string;
    verified: string;
    route: string;
    contact: string;
    type: string;
    client: string;
    title: string;
    cover: string;
    updated: string;
    file: string;
    folder: string;
    size: string;
    created: string;
    labels: string;
    sort: string;
    pageAddress: string;
  };

  overview: {
    title: string;
    lead: string;
    greetingMorning: string;
    greetingDay: string;
    greetingEvening: string;
    dateRange: string;
    dateRangeHelp: string;
    allDates: string;
    from: string;
    to: string;
    applyDates: string;
    prevMonth: string;
    nextMonth: string;
    presetMonth: string;
    preset30d: string;
    preset90d: string;
    totalRecent: string;
    totalInRange: string;
  };

  login: {
    title: string;
    lead: string;
    email: string;
    password: string;
    submit: string;
    setupLink: string;
    errNotAdmin: string;
    errForbidden: string;
    errSetupLocked: string;
    errGeneric: string;
  };

  leads: {
    title: string;
    lead: string;
    denied: string;
    emptyTitle: string;
    emptyLead: string;
    filterStatus: string;
    filterType: string;
    filterSource: string;
    typePrice: string;
    typeBusiness: string;
    typeContact: string;
    typeShipment: string;
    draftStep: string;
    resumeLink: string;
    kanbanEmpty: string;
    moved: string;
    confirmShipment: string;
    cancelShipment: string;
    openShipment: string;
    waitingInInbox: string;
  };

  contacts: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    shipmentsTotal: string;
    shipmentsPending: string;
    lastShipment: string;
    openShipments: string;
    openTelegram: string;
    verified: string;
    unverified: string;
    noShipments: string;
  };

  shipments: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    trackPlaceholder: string;
    saved: string;
    saveFailed: string;
    waitingInLeads: string;
  };

  news: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    categories: string;
    newArticle: string;
    noCover: string;
  };

  categories: {
    title: string;
    lead: string;
    emptyTitle: string;
    add: string;
    edit: string;
    deleteConfirm: string;
    deleteLead: string;
    saved: string;
    on: string;
    off: string;
    labelUz: string;
    labelRu: string;
    active: string;
    backToArticles: string;
  };

  media: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    toEditor: string;
    uploadTitle: string;
    uploadHint: string;
    uploading: string;
    uploaded: string;
    uploadFailed: string;
    chooseFile: string;
    folder: string;
    folders: {
      covers: string;
      "news/covers": string;
      "news/inline": string;
      "news/og": string;
    };
    deleteConfirm: string;
    deleteLead: string; // "{name}"
  };

  users: {
    title: string;
    lead: string;
    denied: string;
    emptyTitle: string;
    add: string;
    inviteTitle: string;
    displayName: string;
    email: string;
    password: string;
    role: string;
    created: string;
    roleUpdated: string;
    activated: string;
    deactivated: string;
    deactivate: string;
    activate: string;
    roleCrm: string;
    roleEditor: string;
    roleViewer: string;
    roleOwner: string;
  };

  delivery: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    add: string;
    edit: string;
    seed: string;
    saved: string;
    deleteConfirm: string;
    deleteLead: string; // "{code}"
    on: string;
    off: string;
    code: string;
    slug: string;
    settlement: string;
    nameEn: string;
    nameRu: string;
    nameUz: string;
    leadRu: string;
    leadUz: string;
    etaRu: string;
    etaUz: string;
    bodyRu: string;
    bodyUz: string;
    bodyHint: string;
    faqRu: string;
    faqUz: string;
    faqHint: string;
    metaTitleRu: string;
    metaTitleUz: string;
    metaDescRu: string;
    metaDescUz: string;
    active: string;
  };

  settings: {
    title: string;
    lead: string;
  };

  pricing: {
    title: string;
    lead: string;
    disclaimer: string;
    enabled: string;
    formulaVersion: string;
    zonesTitle: string;
    zoneSameCity: string;
    zoneSameRegion: string;
    zoneInterRegion: string;
    base: string;
    perKg: string;
    etaMin: string;
    etaMax: string;
    surchargesTitle: string;
    pickup: string;
    door: string;
    place: string;
    urgentMultiplier: string;
    categoriesTitle: string;
    volumetricTitle: string;
    volumetricEnabled: string;
    volumetricDivisor: string;
    limitsTitle: string;
    quickCitiesTitle: string;
    previewTitle: string;
    previewWeight: string;
    previewRun: string;
    previewResult: string;
    resetDefaults: string;
    saved: string;
  };

  telegram: {
    title: string;
    lead: string;
  };

  messaging: {
    title: string;
    lead: string;
    navProviders: string;
    navTemplates: string;
    navRules: string;
    navLog: string;
    providersTitle: string;
    providersLead: string;
    templatesTitle: string;
    templatesLead: string;
    rulesTitle: string;
    rulesLead: string;
    logTitle: string;
    logLead: string;
    emptyLog: string;
    saved: string;
    testSent: string;
    testFailed: string;
    masterKeyMissing: string;
    enabled: string;
    primarySms: string;
    secrets: string;
    secretsHint: string;
    leaveBlank: string;
    testPhone: string;
    testEmail: string;
    sendTest: string;
    playmobile: string;
    eskiz: string;
    resend: string;
    channelSms: string;
    channelEmail: string;
    channelTelegram: string;
    preview: string;
    variables: string;
    bodyText: string;
    bodyHtml: string;
    subject: string;
    segments: string;
    ruleEnabled: string;
    audience: string;
    audienceStaff: string;
    audienceCustomer: string;
    staffEmails: string;
    staffPhones: string;
    localeMode: string;
    localeCustomer: string;
    localeBoth: string;
    smsProvider: string;
    event_lead_created_staff: string;
    event_lead_created_customer: string;
    event_shipment_status: string;
    event_otp_send: string;
    event_otp_email: string;
    statusSent: string;
    statusFailed: string;
    statusSkipped: string;
  };

  errors: {
    saveFailed: string;
    deleteFailed: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    passwordMin: string;
    trackRequired: string;
    trackInvalid: string;
    codeRequired: string;
    otpRequired: string;
    generic: string;
    wrongPassword: string;
    passwordMismatch: string;
    emailTaken: string;
    phoneTaken: string;
    emailUnchanged: string;
  };

  form: {
    successDefault: string;
  };
};
