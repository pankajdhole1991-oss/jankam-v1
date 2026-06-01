import { useEffect, useRef, useState } from 'react';
import { analyticsService } from '../services/analytics';
import type { AnalyticsData } from '../services/analytics';
import { TrendingUp, Users, MapPin, Heart, CheckCircle } from 'lucide-react';

// ── Reliable count-up animation helper ──
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setCount(0);
      return;
    }
    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCount(0);

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target); // ensure final value is exact
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}

const statItems = [
  {
    key: 'complaintsFiled' as keyof AnalyticsData,
    label: 'Complaints Filed',
    icon: TrendingUp,
    suffix: '',
    color: '#F5A623',
    bg: 'rgba(245,166,35,0.12)',
  },
  {
    key: 'membersJoined' as keyof AnalyticsData,
    label: 'Members Joined',
    icon: Users,
    suffix: '+',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
  },
  {
    key: 'volunteersRegistered' as keyof AnalyticsData,
    label: 'Volunteers Registered',
    icon: Heart,
    suffix: '+',
    color: '#F87171',
    bg: 'rgba(248,113,113,0.12)',
  },
  {
    key: 'workersSupported' as keyof AnalyticsData,
    label: 'Workers Supported',
    icon: Users,
    suffix: '+',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
  },
  {
    key: 'districtsCovered' as keyof AnalyticsData,
    label: 'Districts Covered',
    icon: MapPin,
    suffix: '',
    color: '#818CF8',
    bg: 'rgba(129,140,248,0.12)',
  },
  {
    key: 'resolutionRate' as keyof AnalyticsData,
    label: 'Resolution Rate',
    icon: CheckCircle,
    suffix: '%',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
  },
];

function StatCard({
  value,
  label,
  suffix,
  color,
  bg,
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix: string;
  color: string;
  bg: string;
  icon: typeof TrendingUp;
}) {
  const count = useCountUp(value, 2000);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '24px 16px',
        textAlign: 'center',
        flex: '1 1 180px',
        minWidth: '150px',
        maxWidth: '240px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)',
        transition: 'transform 0.2s',
      }}
      className="hover:scale-105"
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          lineHeight: 1,
          color,
          marginBottom: '6px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.65)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function LiveImpact() {
  const [stats, setStats] = useState<AnalyticsData>({
    complaintsFiled: 0,
    membersJoined: 0,
    volunteersRegistered: 0,
    workersSupported: 0,
    districtsCovered: 0,
    resolutionRate: 0,
    complaintsRegistered: 0,
    activeVolunteers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [displayStats, setDisplayStats] = useState<AnalyticsData>({
    complaintsFiled: 0,
    membersJoined: 0,
    volunteersRegistered: 0,
    workersSupported: 0,
    districtsCovered: 0,
    resolutionRate: 0,
    complaintsRegistered: 0,
    activeVolunteers: 0,
  });
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Fetch live stats from Supabase
    const refresh = async () => {
      setLoading(true);
      try {
        const loaded = await analyticsService.getStats();
        setStats(loaded);
        setDisplayStats(loaded);
      } catch (e) {
        console.error('[LiveImpact] Failed to fetch stats:', e);
      } finally {
        setLoading(false);
      }
    };

    refresh();

    // Re-fetch whenever any registration completes
    const handler = () => refresh();
    window.addEventListener('jankam-data-update', handler);
    // Also poll every 60s for freshness
    const interval = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('jankam-data-update', handler);
      clearInterval(interval);
    };
  }, []);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible) {
      setDisplayStats(stats);
    }
  }, [visible, stats]);

  return (
    <section
      id="impact"
      ref={sectionRef}
      style={{ background: '#0F2347', padding: '48px 0' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#F5A623',
                background: 'rgba(245,166,35,0.1)',
                padding: '5px 14px',
                borderRadius: '100px',
                border: '1px solid rgba(245,166,35,0.25)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  boxShadow: '0 0 0 0 rgba(239,68,68,0.5)',
                }}
              />
              Live Impact Tracker
            </div>
            {/* Live source badge */}
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {loading ? '⏳ Fetching from Supabase...' : '✅ Live · Supabase'}
            </div>
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
              fontWeight: 900,
              color: 'white',
              marginBottom: '8px',
            }}
          >
            JanKam in <span className="text-gradient-gold">Numbers</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
            Real-time worker support and union community metrics across Maharashtra states
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {loading ? (
            // Loading skeleton — shows while Supabase query is in-flight
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '18px',
                  padding: '24px 16px',
                  flex: '1 1 180px',
                  minWidth: '150px',
                  maxWidth: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ width: '80px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ width: '100px', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
              </div>
            ))
          ) : (
            statItems.map((item) => (
              <StatCard
                key={item.key}
                value={displayStats[item.key]}
                label={item.label}
                suffix={item.suffix}
                color={item.color}
                bg={item.bg}
                icon={item.icon}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); opacity: 1; }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); opacity: 0.7; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
