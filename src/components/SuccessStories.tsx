import { useState, useEffect } from 'react';
import { CheckCircle, Award, Shield, MapPin } from 'lucide-react';
import { successStoriesService } from '../services/successStories';
import { useTranslation } from '../translations/context';

export default function SuccessStories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState(() => successStoriesService.getAll());

  useEffect(() => {
    const refresh = () => {
      setStories(successStoriesService.getAll());
    };
    refresh();
    window.addEventListener('jankam-stories-update', refresh);
    return () => window.removeEventListener('jankam-stories-update', refresh);
  }, []);

  return (
    <section id="success-stories" className="section-pad" style={{ background: '#070F1D', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Award size={12} /> {t('stories.badge')}
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
              fontWeight: 900,
              color: 'white',
              marginTop: '4px',
            }}
          >
            {t('stories.title')} <span className="text-gradient-gold">{t('stories.titleGold')}</span>
          </h2>
          <p
            style={{
              marginTop: '12px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
            }}
          >
            {t('stories.subtitle')}
          </p>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            No success stories registered yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              alignItems: 'stretch',
            }}
          >
            {stories.map((story) => (
              <div
                key={story.caseId}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  padding: '24px 20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'left',
                }}
                className="group hover:border-[#F5A623]/20 hover:-translate-y-1"
              >
                {/* Badge Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #F5A623, #34D399)',
                  }}
                />

                {/* Status Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      color: '#F5A623',
                      fontWeight: 700,
                    }}
                  >
                    {t('stories.lblCaseId')}: {story.caseId}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: story.status === 'resolved' ? '#34D399' : story.status === 'active' ? '#60A5FA' : '#94A3B8',
                      background: story.status === 'resolved' ? 'rgba(52,211,153,0.12)' : story.status === 'active' ? 'rgba(96,165,250,0.12)' : 'rgba(148,163,184,0.12)',
                      border: story.status === 'resolved' ? '1px solid rgba(52,211,153,0.25)' : story.status === 'active' ? '1px solid rgba(96,165,250,0.25)' : '1px solid rgba(148,163,184,0.25)',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'uppercase',
                    }}
                  >
                    <CheckCircle size={10} />
                    {story.status === 'resolved' ? t('stories.badgeResolved') : story.status}
                  </span>
                </div>

                {/* Title & Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                    <MapPin size={11} style={{ color: '#F5A623' }} />
                    <span>{story.district}</span>
                    <span>·</span>
                    <span>{story.workerName}</span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'white',
                      marginTop: '6px',
                      margin: '6px 0 0 0',
                    }}
                  >
                    {story.issue}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                    fontFamily: 'Inter, sans-serif',
                    flex: 1,
                    margin: 0,
                  }}
                >
                  "{story.description}"
                </p>

                {/* Outcomes Box */}
                <div
                  style={{
                    background: 'rgba(52,211,153,0.05)',
                    border: '1.5px solid rgba(52,211,153,0.15)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                    <Shield size={12} /> {story.recovery}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                    {story.outcome}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
