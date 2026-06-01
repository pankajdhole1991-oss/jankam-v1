import { useState, useEffect } from 'react';
import { ArrowRight, Shield, FileText, Users } from 'lucide-react';
import { analyticsService } from '../services/analytics';
import { useTranslation } from '../translations/context';

const HERO_IMAGE = '/hero_banner.jpg';

const floatingCards = [
  {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=75&fit=crop',
    label: 'Factory Floor Assembly',
    top: '10px',
    left: '10px',
    width: '180px',
    height: '130px',
    rotate: '-6deg',
    scale: 0.95,
  },
  {
    image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=400&q=75&fit=crop',
    label: "Women's Safety Desk",
    top: '25px',
    right: '10px',
    width: '180px',
    height: '130px',
    rotate: '4deg',
    scale: 1,
  },
  {
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75&fit=crop',
    label: 'Industrial Workforce',
    top: '135px',
    left: '30px',
    width: '180px',
    height: '130px',
    rotate: '-3deg',
    scale: 0.98,
  },
  {
    image: 'https://images.unsplash.com/photo-1521791136368-1a8682707636?w=400&q=75&fit=crop',
    label: 'Labour Support Desk',
    top: '155px',
    right: '20px',
    width: '180px',
    height: '130px',
    rotate: '5deg',
    scale: 0.95,
  },
  {
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop',
    label: 'Worker Awareness Meeting',
    top: '255px',
    left: '80px',
    width: '200px',
    height: '140px',
    rotate: '-1deg',
    scale: 1.02,
  },
];

interface HeroProps {
  onFileComplaint: () => void;
  onJoinJankam: () => void;
}

export default function Hero({ onFileComplaint, onJoinJankam }: HeroProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    complaintsRegistered: 0,
    workersSupported: 0,
    districtsCovered: 0,
    activeVolunteers: 0,
  });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const loaded = await analyticsService.getStats();
        setStats({
          complaintsRegistered: loaded.complaintsFiled,
          workersSupported: loaded.workersSupported,
          districtsCovered: loaded.districtsCovered,
          activeVolunteers: loaded.volunteersRegistered,
        });
      } catch (e) {
        console.error('[Hero] Failed to fetch stats:', e);
      }
    };
    refresh();
    window.addEventListener('jankam-data-update', refresh);
    return () => window.removeEventListener('jankam-data-update', refresh);
  }, []);

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: 'min(78vh, 720px)',
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '30px',
        paddingTop: '80px',
        overflow: 'hidden',
      }}
    >
      {/* ── Background Image ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Background Overlays ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(10,25,49,0.30) 0%, rgba(10,25,49,0.65) 35%, rgba(10,25,49,0.93) 62%, rgba(10,25,49,1) 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="hidden lg:block"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(10,25,49,0.98) 0%, rgba(10,25,49,0.85) 45%, rgba(10,25,49,0.25) 75%, transparent 100%)',
        }}
      />

      {/* ── Content Container ── */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto"
        style={{ padding: '0 20px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ── Left Column: Content Desk ── */}
          <div className="lg:col-span-7" style={{ textAlign: 'left' }}>
            {/* Badge */}
            <div className="section-label" style={{ marginBottom: '12px' }}>
              <Shield size={12} />
              {t('hero.badge')}
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.8rem, 5.5vw, 3rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                marginBottom: '12px',
                textShadow: '0 2px 20px rgba(0,0,0,0.6)',
              }}
            >
              {t('hero.title')}{' '}
              <span className="text-gradient-gold">{t('hero.titleGold1')}</span>
              <br />
              {t('hero.titleGold2')}
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.02rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                marginBottom: '20px',
                maxWidth: '560px',
                fontFamily: 'Inter, sans-serif',
                textShadow: '0 1px 10px rgba(0,0,0,0.5)',
              }}
            >
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  id="hero-file-complaint"
                  onClick={onFileComplaint}
                  className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FileText size={16} />
                  {t('hero.btnComplaint')}
                </button>
                <button
                  id="hero-track-complaint"
                  onClick={() => window.dispatchEvent(new Event('jankam-open-tracker'))}
                  className="btn-outline"
                  style={{ fontSize: '0.9rem', padding: '11px 22px', border: '1.5px solid #F5A623', color: '#F5A623', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  🔍 {t('hero.btnTrack')}
                </button>
                <button
                  id="hero-join-jankam"
                  onClick={onJoinJankam}
                  className="btn-outline"
                  style={{ fontSize: '0.9rem', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Users size={16} />
                  {t('hero.btnJoin')}
                  <ArrowRight size={14} />
                </button>
                <a
                  id="hero-join-whatsapp"
                  href="https://chat.whatsapp.com/IBR4USUYbfdDsXeqnbvpWm?s=cl&p=a&mlu=2"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                  style={{ fontSize: '0.9rem', padding: '11px 22px', borderColor: '#25D366', color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,211,102,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  💬 {t('hero.btnWhatsapp') || 'Join WhatsApp Group'}
                </a>
              </div>

              {/* Mobile helper text */}
              <p
                className="lg:hidden text-xs"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}
              >
                {t('hero.trustBadge')}
              </p>
            </div>

            {/* Trust stats */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '18px 20px',
                background: 'rgba(10,25,49,0.78)',
                border: '1.5px solid rgba(245,166,35,0.22)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                maxWidth: '600px',
              }}
            >
              {[
                { value: `${stats.complaintsRegistered}+`, label: t('hero.statComplaints') },
                { value: `${stats.workersSupported}+`, label: t('hero.statMembers') },
                { value: `${stats.districtsCovered}`, label: t('hero.statDistricts') },
                { value: `${stats.activeVolunteers}+`, label: t('hero.statVolunteers') },
              ].map((stat) => (
                <div key={stat.label} style={{ flex: '1 1 110px' }}>
                  <div
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 900,
                      fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                      color: '#F5A623',
                      lineHeight: 1.1,
                      marginBottom: '3px',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Interactive Worker Image Stack (wow aesthetics) ── */}
          <div
            className="lg:col-span-5 relative hidden lg:block"
            style={{
              height: '420px',
              width: '100%',
            }}
          >
            {floatingCards.map((card, idx) => {
              const isHovered = hoveredCard === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'absolute',
                    top: card.top,
                    left: card.left || 'auto',
                    right: card.right || 'auto',
                    width: card.width,
                    height: card.height,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: isHovered ? '2px solid #F5A623' : '1.5px solid rgba(245,166,35,0.25)',
                    background: '#0F2347',
                    boxShadow: isHovered 
                      ? '0 16px 36px rgba(245,166,35,0.45)' 
                      : '0 8px 24px rgba(0,0,0,0.6)',
                    transform: isHovered 
                      ? 'scale(1.1) rotate(0deg)' 
                      : `scale(${card.scale}) rotate(${card.rotate})`,
                    zIndex: isHovered ? 100 : idx * 10 + 10,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isHovered ? 'brightness(1.05) contrast(1.02)' : 'brightness(0.85)',
                      transition: 'all 0.3s',
                    }}
                  />
                  {/* Floating Caption Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(10,25,49,0.96) 0%, rgba(10,25,49,0.5) 100%)',
                      padding: '8px 12px 6px',
                      borderTop: '1px solid rgba(245,166,35,0.2)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isHovered ? '#FFFFFF' : '#F5A623',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'color 0.2s',
                      }}
                    >
                      {card.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          opacity: 0.45,
          animation: 'bounce 2s infinite',
        }}
      >
        <div style={{ width: '2px', height: '28px', borderRadius: '2px', background: '#F5A623' }} />
        <span style={{ fontSize: '0.65rem', color: '#F5A623', letterSpacing: '1px', textTransform: 'uppercase' }}>Scroll</span>
      </div>
    </section>
  );
}
