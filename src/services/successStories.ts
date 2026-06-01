// ============================================
// JANKAM — SUCCESS STORY SERVICE
// Reusable service layer for dynamic case outcomes
// ============================================

export interface SuccessStory {
  caseId: string;
  workerName: string;
  district: string;
  issue: string;
  outcome: string;
  description: string;
  recovery: string;
  status: 'resolved' | 'active' | 'closed';
  amountRecovered?: string;
  image?: string;
}

const STORAGE_KEY = 'jankam_success_stories';

const SEED_STORIES: SuccessStory[] = [
  {
    caseId: 'JK-PUN-0021',
    workerName: 'Rahul S.',
    district: 'Pune',
    issue: 'Overtime Non-Payment',
    outcome: 'Arrears cleared & overtime policy corrected',
    recovery: '₹18,000 Dues Recovered',
    description: 'Rahul, an industrial assembler, was forced to work 10-hour shifts daily for 6 months without any overtime compensation. JanKam verified his log cards and drafted a formal legal inquiry, leading to immediate settlement.',
    status: 'resolved',
    amountRecovered: '18000',
  },
  {
    caseId: 'JK-NAS-0045',
    workerName: 'Amit P.',
    district: 'Nashik',
    issue: 'PF Deduction Mismatch',
    outcome: 'PF arrears deposited with interest',
    recovery: 'PF Account Corrected',
    description: 'Amit found that 12% was regularly deducted from his wage slips, but the EPFO database showed zero deposits for 8 months. JanKam filed a non-deposit complaint, compelling the company to clear all outstanding PF arrears.',
    status: 'resolved',
    amountRecovered: '',
  },
  {
    caseId: 'JK-THA-0089',
    workerName: 'Suman K.',
    district: 'Thane',
    issue: 'Maternity Leave Denial',
    outcome: 'Paid leave approved & job secured',
    recovery: '26 Weeks Paid Leave',
    description: 'Suman was threatened with immediate termination after requesting maternity leave. JanKam intervened, presenting statutory warnings under the Maternity Benefit Act, securing both her position and full salary benefits.',
    status: 'resolved',
    amountRecovered: '',
  },
  {
    caseId: 'JK-MUM-0112',
    workerName: 'Meera D.',
    district: 'Mumbai',
    issue: 'Workplace Harassment (POSH)',
    outcome: 'Safety policy enforced & ICC established',
    recovery: 'Safe Workplace Enforced',
    description: 'Meera faced a hostile working environment with no safety officer on site. JanKam filed an official POSH non-compliance action, forcing the establishment to set up a fully functional Internal Complaints Committee.',
    status: 'resolved',
    amountRecovered: '',
  },
  {
    caseId: 'JK-KOL-0067',
    workerName: 'Ganesh G.',
    district: 'Kolhapur',
    issue: 'Below Minimum Wage',
    outcome: 'Monthly salary corrected & back-pay paid',
    recovery: '₹34,000 Arrears Recovered',
    description: 'Ganesh was paid ₹8,500 monthly instead of the statutory unskilled minimum wage of ₹13,200. JanKam filed a wage recovery petition, securing the legal wage correction and clearance of past underpaid arrears.',
    status: 'resolved',
    amountRecovered: '34000',
  }
];

export const successStoriesService = {
  getAll: (): SuccessStory[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SuccessStory[];
      
      // Seed if missing
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STORIES));
      return SEED_STORIES;
    } catch {
      return SEED_STORIES;
    }
  },

  set: (data: SuccessStory[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('jankam-stories-update'));
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {
      console.warn('Stories write failed');
    }
  },

  add: (story: SuccessStory): void => {
    const list = successStoriesService.getAll();
    list.unshift(story); // prepends new story
    successStoriesService.set(list);
  },

  update: (caseId: string, updated: SuccessStory): void => {
    const list = successStoriesService.getAll();
    const index = list.findIndex(s => s.caseId === caseId);
    if (index !== -1) {
      list[index] = updated;
      successStoriesService.set(list);
    }
  },

  delete: (caseId: string): void => {
    const list = successStoriesService.getAll();
    const filtered = list.filter(s => s.caseId !== caseId);
    successStoriesService.set(filtered);
  },
};
