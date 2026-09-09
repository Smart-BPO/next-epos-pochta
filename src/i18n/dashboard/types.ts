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

  nav: {
    groups: { ops: string; content: string; system: string };
    overview: string;
    leads: string;
    contacts: string;
    contactsShort: string;
    shipments: string;
    shipmentsShort: string;
    news: string;
    delivery: string;
    deliveryShort: string;
    media: string;
    settings: string;
    telegram: string;
    users: string;
  };

  common: {
    search: string;
    searchPlaceholder: string;
    perPage: string;
    view: string;
    table: string;
    cards: string;
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
    source: { telegram_contact: string; manual: string };
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
    typePrice: string;
    typeBusiness: string;
    typeContact: string;
  };

  contacts: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
  };

  shipments: {
    title: string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    trackPlaceholder: string;
    saved: string;
    saveFailed: string;
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

  telegram: {
    title: string;
    lead: string;
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
  };

  form: {
    successDefault: string;
  };
};
