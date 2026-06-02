// ============================================================
// LiveTicker.tsx — Continuous scrolling activity feed
// CSS marquee, no JS library, mobile-friendly
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { complaintsService } from '../services/complaints';
import { membersService } from '../services/members';
import { leadershipService } from '../services/leadership';

export default function LiveTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const dbComplaints = complaintsService.getAll();
      const dbMembers = membersService.getAll();
      const dbVolunteers = leadershipService.getAll();

      const items: string[] = [];

      // Add actual complaints
      dbComplaints.forEach((c) => {
        items.push(`Complaint ${c.id || 'N/A'} submitted in ${c.workDistrict || 'Other'} (${c.complaintType || 'General'}) - Status: ${(c.status || 'submitted').toUpperCase().replace('_', ' ')}`);
      });

      // Add actual members
      dbMembers.forEach((m) => {
        items.push(`Member joined from ${m.workDistrict} · Industry: ${m.industryType} · Welcome!`);
      });

      // Add actual volunteers
      dbVolunteers.forEach((v) => {
        items.push(`Volunteer registered in ${v.district}, ${v.state} · Active support desk`);
      });

      if (items.length === 0) {
        setIsDemo(true);
        setTickerItems([
          '[Demo Activity Feed] ✓ Pune — Salary complaint #JK-PUN-0047 resolved in 3 days',
          '[Demo Activity Feed] ✓ Nashik — Worker received ₹18,000 unpaid overtime',
          '[Demo Activity Feed] ✓ Chakan — PF complaint registered · JK-PUN-0049',
          '[Demo Activity Feed] ✓ Nagpur — Women safety complaint submitted successfully',
          '[Demo Activity Feed] ✓ Thane — New member joined JanKam · Welcome!',
          '[Demo Activity Feed] ✓ Aurangabad — PF default complaint filed · JK-AUR-0021',
          '[Demo Activity Feed] ✓ Pimpri-Chinchwad — Overtime dispute resolved',
          '[Demo Activity Feed] ✓ Mumbai — ESIC card issued after 2-week follow-up',
          '[Demo Activity Feed] ✓ Solapur — Illegal termination complaint submitted',
          '[Demo Activity Feed] ✓ Kolhapur — Minimum wage violation reported · JK-KOL-0012',
        ]);
      } else {
        setIsDemo(false);
        setTickerItems(items.map(item => `✓ ${item}`));
      }
    };

    refresh();
    window.addEventListener('jankam-data-update', refresh);
    return () => window.removeEventListener('jankam-data-update', refresh);
  }, []);

  // Ensure enough items to fill the marquee seamlessly
  let displayItems = [...tickerItems];
  if (displayItems.length > 0) {
    while (displayItems.length < 12) {
      displayItems = [...displayItems, ...tickerItems];
    }
  }
  const items = [...displayItems, ...displayItems];

  return (
    <div
      id="ticker"
      style={{
        background: 'rgba(10,25,49,0.98)',
        borderBottom: '1px solid rgba(245,166,35,0.2)',
        borderTop: '1px solid rgba(245,166,35,0.12)',
        height: '40px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
      aria-label="Live activity feed"
    >
      {/* Left fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          background: 'linear-gradient(to right, rgba(10,25,49,1), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* LIVE / DEMO badge */}
      <div
        style={{
          position: 'absolute',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 3,
          flexShrink: 0,
          background: 'rgba(10,25,49,0.9)',
          paddingRight: '8px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isDemo ? '#60A5FA' : '#ef4444',
            display: 'inline-block',
            animation: 'tickerPulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: isDemo ? '#60A5FA' : '#F5A623',
            fontFamily: 'Outfit, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {isDemo ? 'DEMO' : 'LIVE'}
        </span>
      </div>

      {/* Scrolling Track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          animation: 'tickerScroll 90s linear infinite',
          whiteSpace: 'nowrap',
          paddingLeft: '110px',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: '0.78rem',
              fontFamily: 'Inter, sans-serif',
              color: i % 10 < 5 ? 'rgba(255,255,255,0.75)' : 'rgba(245,166,35,0.85)',
              paddingRight: '0',
            }}
          >
            {item}
            <span
              style={{
                margin: '0 28px',
                color: 'rgba(245,166,35,0.3)',
                fontWeight: 700,
              }}
            >
              ·
            </span>
          </span>
        ))}
      </div>

      {/* Right fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          background: 'linear-gradient(to left, rgba(10,25,49,1), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
