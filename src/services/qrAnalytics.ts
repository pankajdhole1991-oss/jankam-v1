// ============================================
// JANKAM — INDUSTRIAL QR OUTREACH & ANALYTICS SERVICE
// ============================================

export interface QRAnalyticsData {
  totalScans: number;
  scansByDistrict: Record<string, number>;
  scansByPosterType: Record<string, number>;
  complaintsFromQR: number;
  membersFromQR: number;
  volunteersFromQR: number;
}

const STORAGE_KEY = 'jankam_qr_analytics';
const ACQUIRED_SESSION_KEY = 'jankam_acquired_via_qr';
const CAMPAIGN_METRICS_KEY = 'jankam_qr_campaign_params';

const DEFAULT_DATA: QRAnalyticsData = {
  totalScans: 0,
  scansByDistrict: {
    pune: 0,
    mumbai: 0,
    thane: 0,
    nashik: 0,
    nagpur: 0,
    kolhapur: 0,
    aurangabad: 0,
    general: 0
  },
  scansByPosterType: {
    factory: 0,
    construction: 0,
    general: 0,
    whatsapp: 0,
    rights: 0,
    safety: 0
  },
  complaintsFromQR: 0,
  membersFromQR: 0,
  volunteersFromQR: 0
};

export const qrAnalyticsService = {
  get: (): QRAnalyticsData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure all properties exist
        return {
          ...DEFAULT_DATA,
          ...parsed,
          scansByDistrict: { ...DEFAULT_DATA.scansByDistrict, ...parsed.scansByDistrict },
          scansByPosterType: { ...DEFAULT_DATA.scansByPosterType, ...parsed.scansByPosterType }
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  },

  set: (data: QRAnalyticsData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('jankam-qr-analytics-update'));
    } catch {
      console.warn('Failed to write QR analytics');
    }
  },

  // Record a hit from a scanned QR URL
  recordScan: (district: string, posterType: string): void => {
    const data = qrAnalyticsService.get();
    
    // Normalize keys
    const dKey = (district || 'general').trim().toLowerCase();
    const pKey = (posterType || 'general').trim().toLowerCase();

    // Increment overall scans
    data.totalScans += 1;

    // Increment district scans
    data.scansByDistrict[dKey] = (data.scansByDistrict[dKey] || 0) + 1;

    // Increment poster type scans
    data.scansByPosterType[pKey] = (data.scansByPosterType[pKey] || 0) + 1;

    qrAnalyticsService.set(data);

    // Save session flags for conversion tracking
    sessionStorage.setItem(ACQUIRED_SESSION_KEY, 'true');
    sessionStorage.setItem(CAMPAIGN_METRICS_KEY, JSON.stringify({ district: dKey, poster: pKey }));
  },

  // Record complaint submission conversion
  recordComplaintConversion: (): void => {
    if (sessionStorage.getItem(ACQUIRED_SESSION_KEY) === 'true') {
      const data = qrAnalyticsService.get();
      data.complaintsFromQR += 1;
      qrAnalyticsService.set(data);
      // Consume the session flag so we do not double count
      sessionStorage.removeItem(ACQUIRED_SESSION_KEY);
    }
  },

  // Record union member join conversion
  recordMemberConversion: (): void => {
    if (sessionStorage.getItem(ACQUIRED_SESSION_KEY) === 'true') {
      const data = qrAnalyticsService.get();
      data.membersFromQR += 1;
      qrAnalyticsService.set(data);
      // Consume the session flag
      sessionStorage.removeItem(ACQUIRED_SESSION_KEY);
    }
  },

  // Record volunteer onboarding conversion
  recordVolunteerConversion: (): void => {
    if (sessionStorage.getItem(ACQUIRED_SESSION_KEY) === 'true') {
      const data = qrAnalyticsService.get();
      data.volunteersFromQR += 1;
      qrAnalyticsService.set(data);
      // Consume the session flag
      sessionStorage.removeItem(ACQUIRED_SESSION_KEY);
    }
  }
};
