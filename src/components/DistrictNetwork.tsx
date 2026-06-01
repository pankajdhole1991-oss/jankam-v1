// ============================================================
// DistrictNetwork.tsx — Maharashtra Districts Coverage Desk
// Reduces height by 80% on homepage, showing top 6 districts
// Summary Bar displays: Total Districts, Cases, Workers, Resolution Rate
// Opens premium lazy-rendered modal for searching & filtering all 36
// ============================================================
import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, CheckCircle, AlertCircle, Clock, X, Eye, Globe } from 'lucide-react';
import { districtsService } from '../services/districts';
import { liveStatsService } from '../services/liveStats';
import type { LiveStats } from '../services/liveStats';

export interface DistrictRecord {
  id: string;
  name: string;
  division: string;
  status: 'active' | 'growing' | 'pending';
  activeComplaints: number;
  resolvedComplaints: number;
  members: number;
  volunteers: number;
  casesNew: number;
  casesUnderReview: number;
  casesResolved: number;
  casesClosed: number;
  casesEscalated: number;
}

const DIVISIONS = ['All', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Nagpur'];

const STATUS_CONFIG = {
  active:  { label: 'Active',   icon: CheckCircle, color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
  growing: { label: 'Growing',  icon: AlertCircle, color: '#F5A623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)' },
  pending: { label: 'Pending',  icon: Clock,       color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
};

export default function DistrictNetwork() {
  const [modalOpen, setModalOpen] = useState(false);
  const [division, setDivision] = useState('All');
  const [search, setSearch] = useState('');
  const [districts, setDistricts] = useState<DistrictRecord[]>(() => districtsService.getAll());
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    const refresh = () => {
      setDistricts(districtsService.getAll());
    };
    refresh();
    window.addEventListener('jankam-districts-update', refresh);
    return () => window.removeEventListener('jankam-districts-update', refresh);
  }, []);

  // Fetch live global stats from Supabase
  useEffect(() => {
    const fetchLive = async () => {
      try {
        liveStatsService.invalidate();
        const s = await liveStatsService.getStats();
        setLiveStats(s);
        if (s.districtBreakdown && s.districtBreakdown.length > 0) {
          setDistricts(s.districtBreakdown as any);
        }
      } catch (e) {
        console.warn('[DistrictNetwork] Failed to fetch live stats:', e);
      }
    };
    fetchLive();
    const handler = () => fetchLive();
    window.addEventListener('jankam-data-update', handler);
    return () => window.removeEventListener('jankam-data-update', handler);
  }, []);

  // 1. Calculate overall global statistics across all 36 districts
  const globalStats = useMemo(() => {
    const totalDistricts = districts.length || 36;
    const activeDistricts = districts.filter(d => d.status === 'active').length;
    const totalComplaints = districts.reduce((s, d) => s + d.activeComplaints + d.resolvedComplaints, 0);
    const resolvedComplaints = districts.reduce((s, d) => s + d.resolvedComplaints, 0);
    const totalWorkers = districts.reduce((s, d) => s + d.members, 0);
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
    
    return { totalDistricts, activeDistricts, totalComplaints, totalWorkers, resolutionRate };
  }, [districts]);

  // 2. Select top 6 districts dynamically based on live database activity
  const top6Districts = useMemo(() => {
    return districts.slice(0, 6);
  }, [districts]);

  // 3. Filtered districts for the full list modal
  const filteredModalDistricts = useMemo(() => {
    return districts.filter(d =>
      (division === 'All' || d.division === division) &&
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [districts, division, search]);

  return (
    <section id="districts" className="section-pad" style={{ background: '#0F2347', padding: '60px 0' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div className="section-label">District Network</div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.2,
              marginTop: '10px',
            }}
          >
            JanKam Across{' '}
            <span className="text-gradient-gold">Maharashtra</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', marginTop: '10px', fontFamily: 'Inter, sans-serif', maxWidth: '520px' }}>
            Providing structural support across the state. Verify resolution metrics and access local offices.
          </p>
        </div>

        {/* Global Summary Bar — Homepage shows total districts covered, complaints, resolving rates */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Districts Covered', value: liveStats ? `${liveStats.districtsCovered} / 36` : `${globalStats.totalDistricts} / 36`, color: '#60A5FA' },
            { label: 'Total Complaints Filed', value: liveStats ? liveStats.complaintsCount.toLocaleString('en-IN') : globalStats.totalComplaints.toLocaleString('en-IN'), color: '#F87171' },
            { label: 'Workers Supported', value: liveStats ? liveStats.workersSupported.toLocaleString('en-IN') + '+' : globalStats.totalWorkers.toLocaleString('en-IN') + '+', color: '#F5A623' },
            { label: 'Resolution Rate', value: liveStats ? `${liveStats.resolutionRate}%` : `${globalStats.resolutionRate}%`, color: '#34D399' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                {s.label}
              </span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: s.color }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Top 6 Districts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {top6Districts.map(d => {
            const sc = STATUS_CONFIG[d.status];
            const StatusIcon = sc.icon;
            const resolvedPct = d.resolvedComplaints + d.activeComplaints > 0
              ? Math.round((d.resolvedComplaints / (d.resolvedComplaints + d.activeComplaints)) * 100)
              : 0;

            const rankIndex = districts.findIndex(x => x.id === d.id);
            const rankStr = rankIndex !== -1 ? `#${rankIndex + 1}` : '';

            return (
              <div
                key={d.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {/* District Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
                      {rankStr && (
                        <span style={{ color: '#F5A623', marginRight: '6px', fontWeight: 900 }}>
                          {rankStr}
                        </span>
                      )}
                      {d.name}
                    </span>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: sc.color,
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      fontFamily: 'Outfit, sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    <StatusIcon size={10} />
                    {sc.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', marginBottom: '14px' }}>
                  {d.division} Division
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px', textAlign: 'center' }}>
                  {[
                    { label: 'New', value: d.casesNew || 0, color: '#60A5FA' },
                    { label: 'Review', value: d.casesUnderReview || 0, color: '#F5A623' },
                    { label: 'Resolved', value: d.casesResolved || d.resolvedComplaints || 0, color: '#34D399' },
                    { label: 'Closed', value: d.casesClosed || 0, color: '#94A3B8' },
                    { label: 'Escalated', value: d.casesEscalated || 0, color: '#EF4444' },
                    { label: 'Members', value: d.members || 0, color: '#A855F7' },
                    { label: 'Volunteers', value: d.volunteers || 0, color: '#EC4899' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: stat.color }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Resolution Rate</span>
                    <span style={{ fontSize: '0.65rem', color: '#34D399', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{resolvedPct}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${resolvedPct}%`,
                        background: 'linear-gradient(90deg, #34D399, #059669)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Districts button — Triggers dedicated Modal */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.92rem', padding: '12px 28px' }}
          >
            <Globe size={16} />
            View All 36 Districts Coverage
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* ==================== ALL DISTRICTS MODAL ==================== */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            onClick={() => setModalOpen(false)}
          />

          {/* Modal content */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '900px',
                height: '85vh',
                maxHeight: '750px',
                background: '#0A1931',
                border: '1px solid rgba(245,166,35,0.22)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'all',
                boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'white', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} style={{ color: '#F5A623' }} /> All 36 Maharashtra Districts
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                    Filter by regional division or search for specific district offices
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filters Panel (Lazy Search & Filters) */}
              <div style={{
                padding: '16px 24px',
                background: 'rgba(0,0,0,0.18)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search district by name (e.g. Pune, Thane, Nagpur)..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F5A623'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>

                {/* Division Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {DIVISIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDivision(d)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        fontFamily: 'Outfit, sans-serif',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: division === d ? '#F5A623' : 'rgba(255,255,255,0.08)',
                        background: division === d ? '#F5A623' : 'rgba(255,255,255,0.03)',
                        color: division === d ? '#0A1931' : 'rgba(255,255,255,0.55)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d} {d !== 'All' ? 'Div.' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list of all 36 Districts */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {filteredModalDistricts.map(d => {
                    const sc = STATUS_CONFIG[d.status];
                    const StatusIcon = sc.icon;
                    const resolvedPct = d.resolvedComplaints + d.activeComplaints > 0
                      ? Math.round((d.resolvedComplaints / (d.resolvedComplaints + d.activeComplaints)) * 100)
                      : 0;

                    return (
                      <div
                        key={d.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'white' }}>{d.name}</span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, padding: '2px 6px', borderRadius: '10px' }}>{sc.label}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', textAlign: 'center' }}>
                          {[
                            { label: 'New', value: d.casesNew || 0, color: '#60A5FA' },
                            { label: 'Review', value: d.casesUnderReview || 0, color: '#F5A623' },
                            { label: 'Resolved', value: d.casesResolved || d.resolvedComplaints || 0, color: '#34D399' },
                            { label: 'Closed', value: d.casesClosed || 0, color: '#94A3B8' },
                            { label: 'Escalated', value: d.casesEscalated || 0, color: '#EF4444' },
                            { label: 'Members', value: d.members || 0, color: '#A855F7' },
                            { label: 'Volunteers', value: d.volunteers || 0, color: '#EC4899' },
                          ].map(stat => (
                            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.01)', padding: '4px 2px', borderRadius: '6px' }}>
                              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.88rem', color: stat.color }}>
                                {stat.value}
                              </div>
                              <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ height: '3px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: `${resolvedPct}%`, background: '#34D399' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredModalDistricts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
                    No districts found matching your current division filter & search terms.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
                  ℹ️ Total 36 District Chapters registered in Maharashtra
                </span>
                <button
                  onClick={() => setModalOpen(false)}
                  className="btn-outline"
                  style={{ fontSize: '0.78rem', padding: '6px 16px' }}
                >
                  Close Coverage
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
