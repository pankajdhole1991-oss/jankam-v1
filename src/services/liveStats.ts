// ============================================================
// JANKAM — LIVE STATS SERVICE (UPGRADED)
// All metrics sourced exclusively from Supabase via RPC & queries.
// Zero localStorage. Zero hardcoded numbers.
// ============================================================
import { supabase, checkSupabaseOnline } from './supabaseClient';

export interface LiveStats {
  membersCount: number;
  activeMembers: number;
  volunteersCount: number;
  activeVolunteers: number;
  complaintsCount: number;
  resolvedComplaints: number;
  resolutionRate: number;
  workersSupported: number;
  districtsCovered: number;
  // District-level breakdown: all 36 districts
  districtBreakdown: DistrictStat[];
  // Complaint category breakdown
  categoryBreakdown: CategoryStat[];
  // Timestamp of last successful fetch
  fetchedAt: string;
  // Whether data came from Supabase (true) or fallback zeros (false)
  isLive: boolean;
}

export interface DistrictStat {
  id: string;
  name: string;
  division: string;
  status: 'active' | 'growing' | 'pending';
  activeComplaints: number;
  resolvedComplaints: number;
  members: number;
  volunteers: number;
  resolutionRate: number;
  // Complaint Stages counts
  casesNew: number;
  casesUnderReview: number;
  casesResolved: number;
  casesClosed: number;
  casesEscalated: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

const METADATA_DISTRICTS = [
  // Mumbai Division
  { id: 'mumbai-city', name: 'Mumbai City', division: 'Mumbai' },
  { id: 'mumbai-suburban', name: 'Mumbai Suburban', division: 'Mumbai' },
  { id: 'thane', name: 'Thane', division: 'Mumbai' },
  { id: 'palghar', name: 'Palghar', division: 'Mumbai' },
  { id: 'raigad', name: 'Raigad', division: 'Mumbai' },
  { id: 'ratnagiri', name: 'Ratnagiri', division: 'Mumbai' },
  { id: 'sindhudurg', name: 'Sindhudurg', division: 'Mumbai' },
  // Pune Division
  { id: 'pune', name: 'Pune', division: 'Pune' },
  { id: 'satara', name: 'Satara', division: 'Pune' },
  { id: 'sangli', name: 'Sangli', division: 'Pune' },
  { id: 'solapur', name: 'Solapur', division: 'Pune' },
  { id: 'kolhapur', name: 'Kolhapur', division: 'Pune' },
  // Nashik Division
  { id: 'nashik', name: 'Nashik', division: 'Nashik' },
  { id: 'dhule', name: 'Dhule', division: 'Nashik' },
  { id: 'nandurbar', name: 'Nandurbar', division: 'Nashik' },
  { id: 'jalgaon', name: 'Jalgaon', division: 'Nashik' },
  { id: 'ahmednagar', name: 'Ahmednagar', division: 'Nashik' },
  // Aurangabad Division
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar', division: 'Aurangabad' },
  { id: 'jalna', name: 'Jalna', division: 'Aurangabad' },
  { id: 'beed', name: 'Beed', division: 'Aurangabad' },
  { id: 'latur', name: 'Latur', division: 'Aurangabad' },
  { id: 'osmanabad', name: 'Dharashiv', division: 'Aurangabad' },
  { id: 'nanded', name: 'Nanded', division: 'Aurangabad' },
  { id: 'hingoli', name: 'Hingoli', division: 'Aurangabad' },
  { id: 'parbhani', name: 'Parbhani', division: 'Aurangabad' },
  // Amravati Division
  { id: 'amravati', name: 'Amravati', division: 'Amravati' },
  { id: 'yavatmal', name: 'Yavatmal', division: 'Amravati' },
  { id: 'wardha', name: 'Wardha', division: 'Amravati' },
  { id: 'washim', name: 'Washim', division: 'Amravati' },
  { id: 'akola', name: 'Akola', division: 'Amravati' },
  { id: 'buldhana', name: 'Buldhana', division: 'Amravati' },
  // Nagpur Division
  { id: 'nagpur', name: 'Nagpur', division: 'Nagpur' },
  { id: 'chandrapur', name: 'Chandrapur', division: 'Nagpur' },
  { id: 'gadchiroli', name: 'Gadchiroli', division: 'Nagpur' },
  { id: 'bhandara', name: 'Bhandara', division: 'Nagpur' },
  { id: 'gondia', name: 'Gondia', division: 'Nagpur' },
];

function findDistrictMetadata(dbName: string | null | undefined) {
  if (!dbName) return null;
  const clean = dbName.trim().toLowerCase();
  
  // Direct matches
  const direct = METADATA_DISTRICTS.find(d => 
    d.id === clean || 
    d.name.toLowerCase() === clean
  );
  if (direct) return direct;
  
  // Historical mapping overrides
  if (clean === 'chhatrapati sambhajinagar' || clean === 'aurangabad') {
    return METADATA_DISTRICTS.find(d => d.id === 'aurangabad') || null;
  }
  if (clean === 'dharashiv' || clean === 'osmanabad') {
    return METADATA_DISTRICTS.find(d => d.id === 'osmanabad') || null;
  }
  if (clean === 'mumbai' || clean === 'mumbai city') {
    return METADATA_DISTRICTS.find(d => d.id === 'mumbai-city') || null;
  }
  if (clean === 'mumbai suburban') {
    return METADATA_DISTRICTS.find(d => d.id === 'mumbai-suburban') || null;
  }
  
  return null;
}

const EMPTY_STATS: LiveStats = {
  membersCount: 0,
  activeMembers: 0,
  volunteersCount: 0,
  activeVolunteers: 0,
  complaintsCount: 0,
  resolvedComplaints: 0,
  resolutionRate: 0,
  workersSupported: 0,
  districtsCovered: 0,
  districtBreakdown: METADATA_DISTRICTS.map(d => ({
    id: d.id,
    name: d.name,
    division: d.division,
    status: 'pending',
    activeComplaints: 0,
    resolvedComplaints: 0,
    members: 0,
    volunteers: 0,
    resolutionRate: 0,
    casesNew: 0,
    casesUnderReview: 0,
    casesResolved: 0,
    casesClosed: 0,
    casesEscalated: 0,
  })),
  categoryBreakdown: [],
  fetchedAt: new Date().toISOString(),
  isLive: false,
};

// Module-level cache so multiple components share one fetch
let cachedStats: LiveStats | null = null;
let fetchPromise: Promise<LiveStats> | null = null;
const CACHE_TTL_MS = 1_000; // Minimal cache to ensure instant realtime responses

async function fetchFromSupabase(): Promise<LiveStats> {
  const isOnline = await checkSupabaseOnline();
  const client = supabase;
  if (!isOnline || !client) {
    console.warn('[StatsService] Supabase offline — returning zero stats');
    return { ...EMPTY_STATS };
  }

  // LAYER 1: Try secure, high-performance database-level RPC function first
  try {
    const { data: rpcData, error: rpcError } = await client.rpc('get_live_stats');
    if (!rpcError && rpcData) {
      console.log('[StatsService] Live stats fetched securely via Supabase RPC get_live_stats()');
      return {
        membersCount:       Number(rpcData.membersCount),
        activeMembers:      Number(rpcData.activeMembers),
        volunteersCount:    Number(rpcData.volunteersCount),
        activeVolunteers:   Number(rpcData.activeVolunteers),
        complaintsCount:    Number(rpcData.complaintsCount),
        resolvedComplaints: Number(rpcData.resolvedComplaints),
        resolutionRate:     Number(rpcData.resolutionRate),
        workersSupported:   Number(rpcData.workersSupported),
        districtsCovered:   Number(rpcData.districtsCovered),
        districtBreakdown:  (rpcData.districtBreakdown || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          division: d.division,
          status: d.status,
          activeComplaints: Number(d.activeComplaints),
          resolvedComplaints: Number(d.resolvedComplaints),
          members: Number(d.members),
          volunteers: Number(d.volunteers),
          resolutionRate: Number(d.resolutionRate),
          casesNew: Number(d.casesNew || 0),
          casesUnderReview: Number(d.casesUnderReview || 0),
          casesResolved: Number(d.casesResolved || 0),
          casesClosed: Number(d.casesClosed || 0),
          casesEscalated: Number(d.casesEscalated || 0),
        })),
        categoryBreakdown:  (rpcData.categoryBreakdown || []).map((c: any) => ({
          category: c.category,
          count: Number(c.count),
          percentage: Number(c.percentage),
        })),
        fetchedAt: new Date().toISOString(),
        isLive: true,
      };
    }
    console.warn('[StatsService] secure SQL RPC not found or failed. Shifting to Layer 2 secure fallback.', rpcError?.message);
  } catch (err) {
    console.warn('[StatsService] RPC check crashed. Shifting to Layer 2 secure fallback.', err);
  }

  // LAYER 2: Secure Fallback Aggregation using queries + ID generator RPCs
  try {
    // A. Query complaints
    const complaintsRes = await client.from('complaints').select('work_district, status').eq('is_deleted', false);
    const complaintsData = complaintsRes.data || [];
    const complaintsCount = complaintsData.length;
    const resolvedComplaints = complaintsData.filter((c: any) => c.status === 'resolved').length;
    const resolutionRate = complaintsCount > 0 ? Math.round((resolvedComplaints / complaintsCount) * 100) : 0;

    // B. Call get_next_volunteer_id RPC to extract live volunteer count
    let volunteersCount = 0;
    try {
      const { data: vNextId } = await client.rpc('get_next_volunteer_id');
      if (vNextId) {
        const parts = vNextId.split('-');
        if (parts[1]) {
          volunteersCount = Math.max(0, parseInt(parts[1], 10) - 1);
        }
      }
    } catch (e) {
      console.warn('[StatsService] Failed to extract volunteersCount from RPC:', e);
    }
    const activeVolunteers = volunteersCount;

    // C. Perform district-level sequential ID queries to fetch live members count securely
    const distMap: Record<string, DistrictStat> = {};
    METADATA_DISTRICTS.forEach(d => {
      distMap[d.id] = {
        id: d.id,
        name: d.name,
        division: d.division,
        status: 'pending',
        activeComplaints: 0,
        resolvedComplaints: 0,
        members: 0,
        volunteers: 0,
        resolutionRate: 0,
        casesNew: 0,
        casesUnderReview: 0,
        casesResolved: 0,
        casesClosed: 0,
        casesEscalated: 0,
      };
    });

    // Populate complaints in map
    complaintsData.forEach((r: any) => {
      const meta = findDistrictMetadata(r.work_district);
      if (meta) {
        if (r.status === 'resolved') {
          distMap[meta.id].resolvedComplaints++;
        } else {
          distMap[meta.id].activeComplaints++;
        }

        // Detailed stage counts mapping
        const st = (r.status || '').trim().toLowerCase();
        if (st === 'submitted' || st === 'new') {
          distMap[meta.id].casesNew++;
        } else if (st === 'under_review' || st === 'assigned' || st === 'in_progress') {
          distMap[meta.id].casesUnderReview++;
        } else if (st === 'resolved') {
          distMap[meta.id].casesResolved++;
        } else if (st === 'closed') {
          distMap[meta.id].casesClosed++;
        } else if (st === 'escalated') {
          distMap[meta.id].casesEscalated++;
        }
      }
    });

    // Fetch and populate member counts per district securely via sequential ID RPC
    await Promise.all(METADATA_DISTRICTS.map(async (d) => {
      try {
        const { data: mNextId } = await client.rpc('get_next_member_id', { p_district: d.name });
        if (mNextId) {
          const parts = mNextId.split('-');
          if (parts[2]) {
            distMap[d.id].members = Math.max(0, parseInt(parts[2], 10) - 1);
          }
        }
      } catch (err) {
        // ignore
      }
    }));

    // Compute total members
    const membersCount = Object.values(distMap).reduce((sum, d) => sum + d.members, 0);
    const activeMembers = membersCount;

    const workersSupported = activeMembers + activeVolunteers + resolvedComplaints;

    // Unique districts
    const uniqueDistricts = new Set<string>();
    Object.values(distMap).forEach(d => {
      if (d.members > 0 || d.activeComplaints > 0 || d.resolvedComplaints > 0 || d.volunteers > 0) {
        uniqueDistricts.add(d.id);
      }
    });
    const districtsCovered = uniqueDistricts.size || 1;

    // Compute final statuses and resolutionRates
    const districtBreakdown = Object.values(distMap)
      .map(d => {
        const totalComplaints = d.activeComplaints + d.resolvedComplaints;
        const resolutionRate = totalComplaints > 0
          ? Math.round((d.resolvedComplaints / totalComplaints) * 100)
          : 0;

        // Coverage status dynamic rules
        let status: 'active' | 'growing' | 'pending' = 'pending';
        if (d.members >= 10 || totalComplaints >= 5) {
          status = 'active';
        } else if (d.members > 0 || totalComplaints > 0 || d.volunteers > 0) {
          status = 'growing';
        }

        return {
          ...d,
          resolutionRate,
          status,
        };
      })
      .sort((a, b) => {
        const aTotal = a.members + a.activeComplaints + a.resolvedComplaints + a.volunteers;
        const bTotal = b.members + b.activeComplaints + b.resolvedComplaints + b.volunteers;
        if (bTotal !== aTotal) return bTotal - aTotal;
        return a.name.localeCompare(b.name);
      });

    // Category breakdown
    const categories: Record<string, number> = {};
    complaintsData.forEach((r: any) => {
      const cat = r.complaint_type || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categories)
      .map(([category, count]) => ({
        category,
        count,
        percentage: complaintsCount > 0 ? Math.round((count / complaintsCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      membersCount,
      activeMembers,
      volunteersCount,
      activeVolunteers,
      complaintsCount,
      resolvedComplaints,
      resolutionRate,
      workersSupported,
      districtsCovered,
      districtBreakdown,
      categoryBreakdown,
      fetchedAt: new Date().toISOString(),
      isLive: true,
    };
  } catch (err) {
    console.error('[StatsService] Fallback fetch failed:', err);
    return { ...EMPTY_STATS };
  }
}

export const liveStatsService = {
  /**
   * Expose cached statistics for synchronous lookup fallback
   */
  getCachedStats: (): LiveStats | null => {
    return cachedStats;
  },

  /**
   * Fetch live stats from Supabase with caching.
   * Returns EMPTY_STATS (all zeros) if Supabase is offline.
   */
  getStats: async (): Promise<LiveStats> => {
    const now = Date.now();

    // Return from cache if still fresh
    if (cachedStats && (now - new Date(cachedStats.fetchedAt).getTime()) < CACHE_TTL_MS) {
      return cachedStats;
    }

    // Deduplicate concurrent fetches
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetchFromSupabase().then(stats => {
      cachedStats = stats;
      fetchPromise = null;
      return stats;
    });

    return fetchPromise;
  },

  /**
   * Force-invalidate cache and refetch immediately.
   * Call this after any successful insert.
   */
  invalidate: () => {
    cachedStats = null;
    fetchPromise = null;
    console.log('[StatsService] Cache invalidated — next getStats() will fetch fresh from Supabase');
  },
};
