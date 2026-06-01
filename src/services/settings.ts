// ============================================
// JANKAM — CENTRAL SETTINGS SERVICE
// Reusable service layer for future Supabase sync
// ============================================

export interface GeneralSettings {
  organizationName: string;
  founderName: string;
  founderDesignation: string;
  founderDescription: string;
  founderPhoto: string;
  missionStatement: string;
  visionStatement: string;
  officeAddress: string;
  officeCity: string;
  officeState: string;
  officePinCode: string;
}

export interface ContactSettings {
  phoneNumber: string;
  whatsAppNumber: string;
  emergencyHelpline: string;
  emailAddress: string;
  supportEmail: string;
}

export interface SocialSettings {
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  telegramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  whatsAppCommunityUrl: string;
}

export interface LegalContent {
  aboutJanKam: string;
  privacyPolicy: string;
  termsConditions: string;
  faq: { q: string; a: string }[];
}

export interface OrganizationSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  social: SocialSettings;
  legal: LegalContent;
}

const STORAGE_KEY = 'jankam_org_settings';

const DEFAULT_SETTINGS: OrganizationSettings = {
  general: {
    organizationName: 'JanKam',
    founderName: 'Pankaj Tulshiram Dhole',
    founderDesignation: 'Founder & Legal Advocate',
    founderDescription: 'Adv. Pankaj Tulshiram Dhole is a dedicated labour rights activist and legal advocate. His career is committed to representing underrepresented workforces, resolving wage disputes, and ensuring statutory compliance of PF & ESIC across manufacturing hubs.',
    founderPhoto: '👤',
    missionStatement: 'To empower every worker in Maharashtra with legal literacy, secure minimum wages, protect workplace safety, and deliver rapid grievance resolution through collective bargaining and advanced AI-assisted advocacy.',
    visionStatement: 'A fair, unified, and exploitation-free industrial environment across Maharashtra where worker dignity is respected and constitutional rights are legally enforced.',
    officeAddress: 'Pimpri Chinchwad Office Area, Pune',
    officeCity: 'Pune',
    officeState: 'Maharashtra',
    officePinCode: '411018',
  },
  contact: {
    phoneNumber: '1800-123-4567',
    whatsAppNumber: '+91 72180 28783',
    emergencyHelpline: '112',
    emailAddress: 'Pankajdhole1991@gmail.com',
    supportEmail: 'Pankajdhole1991@gmail.com',
  },
  social: {
    facebookUrl: '#',
    instagramUrl: '#',
    youtubeUrl: '#',
    telegramUrl: '#',
    twitterUrl: '#',
    linkedinUrl: '#',
    websiteUrl: 'https://jankam.org',
    whatsAppCommunityUrl: 'https://chat.whatsapp.com/IBR4USUYbfdDsXeqnbvpWm?s=cl&p=a&mlu=2',
  },
  legal: {
    aboutJanKam: 'JanKam is Maharashtras premier digital labour welfare platform, dedicated to protecting the rights, dignity, and livelihood of industrial, commercial, and informal workers. Founded by Adv. Pankaj Tulshiram Dhole, a passionate labour rights advocate, JanKam serves as a bridging mechanism between workers, trade unions, legal experts, and the State Labour Department. Our core mission is to eliminate worker exploitation, ensure minimum wage enforcement, secure statutory Provident Fund (EPF) and State Insurance (ESIC) dues, protect pregnant female employees under the Maternity Benefit Act, and guarantee safe, harassment-free workplace environments under the POSH Act.',
    privacyPolicy: 'At JanKam, worker safety and data confidentiality are our highest priorities. We recognize that reporting workplace violations, underpayment, or harassment can carry severe risks of employer retaliation or wrongful dismissal. 1. Anonymous Reporting: Workers can file grievances and draft legal complaints without disclosing their identity to the employer. Your data is protected. 2. Data Minimization: We only collect the minimal personal data required to register your union membership or prepare official complaints. 3. No Commercial Sharing: JanKam is a non-profit labour support platform. We do not sell, rent, share, or trade worker information with any commercial entities, advertisers, or corporate managers. 4. Secure Storage: All complaint databases and volunteer logs are encrypted and stored in secure, locally-contained environments.',
    termsConditions: 'Welcome to JanKam. By accessing this platform, checking your labour rights, utilizing our calculators, or creating complaints, you agree to the following terms: 1. Guidance Disclaimer: JanKam AI Copilot and our rights libraries provide general information, acts, and draft documents. While drafted by legal advocates, the automated drafts do not constitute official binding attorney-client relationships until reviewed and officially signed by a legal coordinator. 2. Truthful Representation: Users agree to provide accurate, honest, and truthful information regarding their employment, salary, and grievances when filing complaints. 3. Non-Profit Mandate: All JanKam support, union registrations, volunteer enrollments, and legal assistance are 100% free. No coordinator or volunteer is authorized to solicit fees, donations, or cash rewards.',
    faq: [
      { q: 'Is JanKam an official government portal?', a: 'No, JanKam is a non-profit digital labour rights desk and advocacy organization led by Adv. Pankaj Tulshiram Dhole. We help workers draft complaints for submission to official government offices.' },
      { q: 'Are JanKam legal aid and AI assistant free?', a: 'Yes! All features on JanKam, including AI consultations, complaint draft generations, calculations, and legal advice, are 100% free of charge.' },
      { q: 'Can I file a complaint anonymously?', a: 'Yes. You can choose to hide your identity in our records to protect yourself from employer retaliation, and our team will guide you on how to handle the process safely.' },
      { q: 'What is the double overtime pay rule?', a: 'Under the Factories Act and Shops Act, any work done beyond 9 hours in a day or 48 hours in a week must be paid at double (2x) your regular hourly wage rate.' },
    ],
  },
};

export const settingsService = {
  getAll: (): OrganizationSettings => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as OrganizationSettings;
      
      // Seed if missing
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  update: (updated: OrganizationSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('jankam-settings-update'));
      window.dispatchEvent(new Event('jankam-data-update')); // trigger metrics refresh too
    } catch {
      console.warn('Settings write failed');
    }
  },

  reset: (): void => {
    settingsService.update(DEFAULT_SETTINGS);
  },
};
