import { Shield, Sparkles, Scale, Heart, Users, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../translations/context';

export default function Movement() {
  const { t } = useTranslation();

  const IMAGES = [
    {
      url: '/union_movement.jpg',
      caption: 'Strong workers stand together in our official union movement',
    },
    {
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&fit=crop',
      caption: 'Assembly line staff representing the industrial workforce',
    },
    {
      url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80&fit=crop',
      caption: 'Technician monitoring mechanical components in Chakan factory',
    },
    {
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&fit=crop',
      caption: 'Labour awareness workshop session and worker support assembly',
    },
    {
      url: '/environmental.jpg',
      caption: 'Green Initiative — advocating for eco-sustainability & safe environmental health for industrial workforces',
    }
  ];

  const GRIEVANCES = [
    t('movement.g1') || 'Unpaid wages',
    t('movement.g2') || 'Salary delays',
    t('movement.g3') || 'Illegal deductions',
    t('movement.g4') || 'PF violations',
    t('movement.g5') || 'ESIC issues',
    t('movement.g6') || 'Workplace harassment',
    t('movement.g7') || 'Illegal termination',
    t('movement.g8') || 'Unsafe working conditions'
  ];

  return (
    <section id="movement" className="section-pad" style={{ background: '#0A1931', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left — Mission Text */}
          <div className="lg:col-span-6" style={{ textAlign: 'left' }}>
            <div className="section-label">{t('movement.badge')}</div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                marginTop: '10px',
                marginBottom: '16px',
              }}
            >
              {t('movement.title')}{' '}
              <span className="text-gradient-gold">{t('movement.titleGold')}</span>
              <br />{t('movement.titleEnd') || '& Labour Justice'}
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.98rem',
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px',
              }}
            >
              {t('movement.subtitle')}
            </p>

            {/* Grievance list */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
                {t('movement.grievancesHeader')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {GRIEVANCES.map((g) => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} style={{ color: '#F5A623', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {g}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Grid for Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
                  <Scale size={16} />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'white', margin: '0 0 2px 0' }}>{t('movement.cardLegalTitle')}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>{t('movement.cardLegalSub')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
                  <Users size={16} />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'white', margin: '0 0 2px 0' }}>{t('movement.cardSolidarityTitle')}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>{t('movement.cardSolidaritySub')}</span>
                </div>
              </div>
            </div>

            {/* Founder Message Section */}
            <div
              style={{
                background: 'rgba(245,166,35,0.06)',
                border: '1.5px solid rgba(245,166,35,0.18)',
                borderRadius: '16px',
                padding: '18px 20px',
                textAlign: 'left',
              }}
            >
              <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛡️ JanKam Movement Solidarity
              </h4>
              <p
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  color: 'white',
                  fontFamily: 'Outfit, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                "{t('movement.trustMessage')}"
              </p>
            </div>

          </div>
 
          {/* Right — Media Grid */}
          <div className="lg:col-span-6">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '12px',
              }}
            >
              {/* Image 1: Top-Left Big */}
              <div style={{ gridColumn: 'span 7', height: '170px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={IMAGES[0].url} alt={IMAGES[0].caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,25,49,0.85) 0%, transparent 60%)' }} />
              </div>

              {/* Image 2: Top-Right Small */}
              <div style={{ gridColumn: 'span 5', height: '170px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={IMAGES[1].url} alt={IMAGES[1].caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,25,49,0.85) 0%, transparent 60%)' }} />
              </div>

              {/* Image 3: Mid-Left Small */}
              <div style={{ gridColumn: 'span 4', height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={IMAGES[2].url} alt={IMAGES[2].caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,25,49,0.85) 0%, transparent 60%)' }} />
              </div>

              {/* Image 4: Mid-Right Big */}
              <div style={{ gridColumn: 'span 8', height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={IMAGES[3].url} alt={IMAGES[3].caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,25,49,0.85) 0%, transparent 60%)' }} />
              </div>

              {/* Image 5: Bottom Span */}
              <div style={{ gridColumn: 'span 12', height: '130px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={IMAGES[4].url} alt={IMAGES[4].caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,25,49,0.92) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={11} style={{ color: '#F5A623' }} />
                  <span style={{ fontSize: '0.72rem', color: 'white', fontWeight: 600, fontFamily: 'Outfit, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                    Statewide grassroots network organizing support sessions and union desks
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
