// ============================================
// JANKAM — DISTRICT SERVICE (Supabase-backed)
// All metrics sourced exclusively from liveStatsService (Supabase).
// Zero localStorage. Zero hardcoded numbers.
// ============================================
import { liveStatsService } from './liveStats';

export interface DistrictRecord {
  id: string;
  name: string;
  division: string;
  status: 'active' | 'growing' | 'pending';
  activeComplaints: number;
  resolvedComplaints: number;
  members: number;
  volunteers: number;
  // Complaint Stages counts (Requirement 3)
  casesNew: number;
  casesUnderReview: number;
  casesResolved: number;
  casesClosed: number;
  casesEscalated: number;
}

const DEFAULT_DISTRICTS: DistrictRecord[] = [
  { id: 'mumbai-city', name: 'Mumbai City', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'mumbai-suburban', name: 'Mumbai Suburban', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'thane', name: 'Thane', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'palghar', name: 'Palghar', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'raigad', name: 'Raigad', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'ratnagiri', name: 'Ratnagiri', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'sindhudurg', name: 'Sindhudurg', division: 'Mumbai', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'pune', name: 'Pune', division: 'Pune', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'satara', name: 'Satara', division: 'Pune', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'sangli', name: 'Sangli', division: 'Pune', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'solapur', name: 'Solapur', division: 'Pune', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'kolhapur', name: 'Kolhapur', division: 'Pune', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'nashik', name: 'Nashik', division: 'Nashik', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'dhule', name: 'Dhule', division: 'Nashik', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'nandurbar', name: 'Nandurbar', division: 'Nashik', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'jalgaon', name: 'Jalgaon', division: 'Nashik', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'ahmednagar', name: 'Ahmednagar', division: 'Nashik', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'jalna', name: 'Jalna', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'beed', name: 'Beed', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'latur', name: 'Latur', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'osmanabad', name: 'Dharashiv', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'nanded', name: 'Nanded', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'hingoli', name: 'Hingoli', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'parbhani', name: 'Parbhani', division: 'Aurangabad', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'amravati', name: 'Amravati', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'yavatmal', name: 'Yavatmal', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'wardha', name: 'Wardha', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'washim', name: 'Washim', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'akola', name: 'Akola', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'buldhana', name: 'Buldhana', division: 'Amravati', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'nagpur', name: 'Nagpur', division: 'Nagpur', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'chandrapur', name: 'Chandrapur', division: 'Nagpur', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'gadchiroli', name: 'Gadchiroli', division: 'Nagpur', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'bhandara', name: 'Bhandara', division: 'Nagpur', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
  { id: 'gondia', name: 'Gondia', division: 'Nagpur', status: 'pending', activeComplaints: 0, resolvedComplaints: 0, members: 0, volunteers: 0, casesNew: 0, casesUnderReview: 0, casesResolved: 0, casesClosed: 0, casesEscalated: 0 },
];

export const districtsService = {
  /**
   * Synchronously reads list of districts, preferring live cached data.
   * If cache is cold, fires async fetch in the background to warm the cache.
   */
  getAll: (): DistrictRecord[] => {
    const cached = liveStatsService.getCachedStats();
    if (cached && cached.districtBreakdown && cached.districtBreakdown.length > 0) {
      return cached.districtBreakdown.map(d => ({
        id: d.id,
        name: d.name,
        division: d.division,
        status: d.status,
        activeComplaints: d.activeComplaints,
        resolvedComplaints: d.resolvedComplaints,
        members: d.members,
        volunteers: d.volunteers,
        casesNew: d.casesNew,
        casesUnderReview: d.casesUnderReview,
        casesResolved: d.casesResolved,
        casesClosed: d.casesClosed,
        casesEscalated: d.casesEscalated,
      }));
    }

    // Cache is cold, warm it up asynchronously
    liveStatsService.getStats().then(() => {
      window.dispatchEvent(new Event('jankam-districts-update'));
      window.dispatchEvent(new Event('jankam-data-update'));
    });

    return DEFAULT_DISTRICTS;
  },

  /**
   * Stub set to preserve backward compatibility.
   */
  set: (data: DistrictRecord[]): void => {
    console.warn('[DistrictsService] set() ignored — stats are dynamically fetched from Supabase');
  },

  /**
   * Stub update to preserve backward compatibility.
   * Logs administrative change requests.
   */
  update: (id: string, updated: Partial<DistrictRecord>): void => {
    console.log(`[DistrictsService] Update requested for district ${id}:`, updated);
    // Since metrics are 100% computed from complaints/members/volunteers database rows,
    // updates to statistics are fully automatic!
    window.dispatchEvent(new Event('jankam-districts-update'));
    window.dispatchEvent(new Event('jankam-data-update'));
  },
};
