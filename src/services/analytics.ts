// ============================================================
// JANKAM — ANALYTICS SERVICE (Supabase-backed)
// All values sourced from liveStatsService which queries Supabase.
// getLiveStats() preserved for backward compatibility with components
// that call it synchronously (returns cached snapshot or zeros).
// ============================================================
import { liveStatsService } from './liveStats';

export interface AnalyticsData {
  complaintsFiled: number;
  membersJoined: number;
  volunteersRegistered: number;
  workersSupported: number;
  districtsCovered: number;
  resolutionRate: number;
  // Backwards compatibility
  complaintsRegistered: number;
  activeVolunteers: number;
}

const EMPTY: AnalyticsData = {
  complaintsFiled: 0,
  membersJoined: 0,
  volunteersRegistered: 0,
  workersSupported: 0,
  districtsCovered: 0,
  resolutionRate: 0,
  complaintsRegistered: 0,
  activeVolunteers: 0,
};

export const analyticsService = {
  /**
   * Async fetch — preferred for components that can await.
   * Returns live data from Supabase via liveStatsService cache.
   */
  getStats: async (): Promise<AnalyticsData> => {
    const s = await liveStatsService.getStats();
    return {
      complaintsFiled:      s.complaintsCount,
      membersJoined:        s.activeMembers,
      volunteersRegistered: s.activeVolunteers,
      workersSupported:     s.workersSupported,
      districtsCovered:     s.districtsCovered,
      resolutionRate:       s.resolutionRate,
      complaintsRegistered: s.complaintsCount,
      activeVolunteers:     s.activeVolunteers,
    };
  },

  /**
   * Synchronous fallback — returns zeros until first async fetch completes.
   * Preserved for backward compatibility with LiveImpact.tsx which calls
   * getLiveStats() synchronously. Components should migrate to getStats().
   * @deprecated Use getStats() instead.
   */
  getLiveStats: (): AnalyticsData => {
    return { ...EMPTY };
  },
};
