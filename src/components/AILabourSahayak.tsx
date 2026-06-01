import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, ChevronRight, Zap } from 'lucide-react';
import ChatModal, { type AgentConfig } from './ChatModal';
import { useTranslation } from '../translations/context';

const TOPICS = [
  { label: 'PF / EPF',      color: '#60A5FA' },
  { label: 'ESIC',          color: '#34D399' },
  { label: 'Salary',        color: '#F5A623' },
  { label: 'Overtime',      color: '#FB923C' },
  { label: 'Labour Law',    color: '#A78BFA' },
  { label: 'Complaints',    color: '#F87171' },
  { label: 'Termination',   color: '#FBBF24' },
  { label: 'Gratuity',      color: '#38BDF8' },
  { label: 'Leave Policy',  color: '#4ADE80' },
  { label: 'Women Safety',  color: '#C084FC' },
];

export default function AILabourSahayak() {
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [contextTopic, setContextTopic] = useState<string | undefined>(undefined);

  const SAHAYAK_CONFIG: AgentConfig = {
    type: 'sahayak',
    name: t('ai.titleGold') || 'JanKam Labour Assistant',
    emoji: '🤝',
    color: '#F5A623',
    description: t('ai.subtitle') || 'Your personal labour rights assistant — PF, ESIC, Salary, Overtime, Complaints & more',
  };

  const SAMPLE_QUESTIONS = [
    t('ai.suggestSalary') || 'Why is my PF not being deducted?',
    t('ai.suggestPf') || 'How to calculate overtime pay?',
    t('ai.suggestTermination') || 'मेरा पगार नहीं मिला — क्या करूं?',
    t('ai.suggestPosh') || 'माझी नोकरी कारणाशिवाय गेली',
    t('ai.suggestLeave') || 'What are my leave entitlements?',
  ];

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ contextTopic?: string; initialMessage?: string }>;
      const topic = customEvent.detail?.contextTopic;
      const initialMsg = customEvent.detail?.initialMessage;
      setContextTopic(topic);
      setInitialMessage(initialMsg || '');
      setChatOpen(true);
    };
    window.addEventListener('jankam-open-ai-chat', handleOpenChat);
    return () => {
      window.removeEventListener('jankam-open-ai-chat', handleOpenChat);
    };
  }, []);

  const openChat = (q = '') => {
    setContextTopic(undefined);
    setInitialMessage(q);
    setChatOpen(true);
  };

  return (
    <section id="ai-sahayak" className="section-pad" style={{ background: '#0A1931' }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom: '36px', textAlign: 'left' }}>
          <div className="section-label">{t('ai.badge')}</div>
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
            {t('ai.title')}{' '}
            <span className="text-gradient-gold">{t('ai.titleGold')}</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', marginTop: '10px', fontFamily: 'Inter, sans-serif', maxWidth: '520px' }}>
            {t('ai.subtitle')}
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(10,25,49,0.8) 100%)',
            border: '1.5px solid rgba(245,166,35,0.2)',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 48px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
            className="lg:flex-row lg:items-start"
          >
            {/* Left — Branding */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #F5A623, #D4890A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(245,166,35,0.3)',
                  }}
                >
                  🤝
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      color: 'white',
                      lineHeight: 1.1,
                    }}
                  >
                    {t('ai.titleGold')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#F5A623', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginTop: '2px' }}>
                    हिंदी · English · मराठी
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#34D399',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>ONLINE</span>
                </div>
              </div>

              <p
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                  fontFamily: 'Inter, sans-serif',
                  maxWidth: '480px',
                  margin: '0 0 24px 0',
                }}
              >
                {t('ai.welcomeMessage')}
              </p>

              {/* Topic Chips */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>
                  {t('ai.canHelpWith') || 'I can help with'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {TOPICS.map(t => (
                    <button
                      key={t.label}
                      onClick={() => openChat(`Tell me about ${t.label}`)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        fontFamily: 'Outfit, sans-serif',
                        cursor: 'pointer',
                        border: `1px solid ${t.color}35`,
                        background: `${t.color}0d`,
                        color: t.color,
                        transition: 'all 0.15s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${t.color}20`;
                        e.currentTarget.style.borderColor = `${t.color}60`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = `${t.color}0d`;
                        e.currentTarget.style.borderColor = `${t.color}35`;
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main CTA */}
              <button
                id="sahayak-open-chat"
                onClick={() => openChat('')}
                className="btn-primary"
                style={{ fontSize: '1rem', padding: '14px 32px' }}
              >
                <MessageSquare size={18} />
                {t('ai.btnSend') || 'Chat with Labour Assistant'}
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Right — Sample Questions */}
            <div
              style={{
                flexShrink: 0,
                width: '100%',
                maxWidth: '340px',
              }}
            >
              <div
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={14} style={{ color: '#F5A623' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px' }}>
                    {t('ai.tryAsking') || 'Try asking'}
                  </span>
                </div>

                <div style={{ padding: '8px' }}>
                  {SAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => openChat(q)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Zap size={12} style={{ color: '#F5A623', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                        {q}
                      </span>
                      <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 'auto', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
                    🔒 {t('ai.btnClearing') || 'Your queries are never stored or shared'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <ChatModal
          agent={SAHAYAK_CONFIG}
          initialMessage={initialMessage}
          contextTopic={contextTopic}
          onClose={() => {
            setChatOpen(false);
            setContextTopic(undefined);
          }}
        />
      )}
    </section>
  );
}
