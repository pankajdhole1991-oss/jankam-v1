import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Mail, AlertCircle, MapPin } from 'lucide-react';
import { settingsService } from '../services/settings';
import { useTranslation } from '../translations/context';

export default function Contact() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(() => settingsService.getAll());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(settingsService.getAll());
    };
    window.addEventListener('jankam-settings-update', handleUpdate);
    return () => window.removeEventListener('jankam-settings-update', handleUpdate);
  }, []);

  const whatsappCleanNumber = settings.contact.whatsAppNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
    "Hello JanKam Team,\n\nMy Name:\nDistrict:\nIndustry:\n\nI would like assistance regarding labour rights."
  )}`;

  const contactsList = [
    {
      id: 'contact-founder-call',
      icon: Phone,
      label: t('contact.cardCallTitle'),
      value: settings.contact.phoneNumber,
      subtext: settings.general.founderName,
      href: `tel:${settings.contact.phoneNumber.replace(/\D/g, '')}`,
      color: '#F5A623',
      bg: 'rgba(245,166,35,0.08)',
      border: 'rgba(245,166,35,0.2)',
      cta: t('contact.btnCallNow'),
    },
    {
      id: 'contact-whatsapp',
      icon: MessageCircle,
      label: t('contact.cardWhatsappTitle'),
      value: settings.contact.whatsAppNumber,
      subtext: t('contact.cardWhatsappSub'),
      href: whatsappUrl,
      color: '#25D366',
      bg: 'rgba(37,211,102,0.07)',
      border: 'rgba(37,211,102,0.2)',
      cta: t('contact.btnChatWhatsapp'),
    },
    {
      id: 'contact-email',
      icon: Mail,
      label: t('contact.cardEmailTitle'),
      value: settings.contact.emailAddress,
      subtext: t('contact.cardEmailSub'),
      href: `mailto:${settings.contact.emailAddress}`,
      color: '#60A5FA',
      bg: 'rgba(96,165,250,0.07)',
      border: 'rgba(96,165,250,0.2)',
      cta: t('contact.btnSendEmail'),
    },
    {
      id: 'contact-emergency',
      icon: AlertCircle,
      label: t('contact.cardEmergencyTitle'),
      value: `Dial ${settings.contact.emergencyHelpline}`,
      subtext: t('contact.cardEmergencySub'),
      href: `tel:${settings.contact.emergencyHelpline.replace(/\D/g, '')}`,
      color: '#F87171',
      bg: 'rgba(248,113,113,0.07)',
      border: 'rgba(248,113,113,0.2)',
      cta: t('contact.btnCallEmergency'),
    },
  ];

  const officesList = [
    { city: `${settings.general.officeCity} Main Office`, address: `${settings.general.officeAddress}, ${settings.general.officeCity}, ${settings.general.officeState} - ${settings.general.officePinCode}`, phone: settings.contact.phoneNumber },
    { city: 'Pimple Gurav Center', address: `Pimple Gurav Welfare Desk, ${settings.general.officeCity}, ${settings.general.officeState}`, phone: settings.contact.phoneNumber },
    { city: 'Devkar Nagar Desk', address: `Kai Devkar Nagar Support Desk, ${settings.general.officeCity}, ${settings.general.officeState}`, phone: settings.contact.phoneNumber },
  ];

  return (
    <section id="contact" className="section-pad" style={{ background: '#070F1D' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ marginBottom: '44px', textAlign: 'left' }}>
          <div className="section-label">{t('contact.badge')}</div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.2,
              marginTop: '10px',
              maxWidth: '600px',
            }}
          >
            {t('contact.title')}{' '}
            <span className="text-gradient-gold">{t('contact.titleGold')}</span>
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginTop: '10px',
              maxWidth: '500px',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '18px',
            }}
          >
            {t('contact.subtitle')}
          </p>
          
          <button
            onClick={() => window.dispatchEvent(new Event('jankam-open-tracker'))}
            className="btn-outline text-xs"
            style={{ padding: '8px 16px', border: '1px solid #F5A623', color: '#F5A623', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🔍 {t('nav.trackComplaint')}
          </button>
        </div>

        {/* Contact Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          {contactsList.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.id}
                id={c.id}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '22px 20px',
                  borderRadius: '18px',
                  background: c.bg,
                  border: `1.5px solid ${c.border}`,
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${c.color}18`,
                    border: `1px solid ${c.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: c.color }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '4px',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: c.color,
                      marginBottom: '4px',
                    }}
                  >
                    {c.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {c.subtext}
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: c.color,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {c.cta} →
                </div>
              </a>
            );
          })}
        </div>

        {/* District Offices */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: 'clamp(20px, 5vw, 36px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <MapPin size={18} style={{ color: '#F5A623' }} />
            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'white',
              }}
            >
              {t('contact.officeTitle')}
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {officesList.map((o) => (
              <div key={o.city} style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#F5A623',
                    marginBottom: '4px',
                  }}
                >
                  {o.city}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.5,
                    marginBottom: '4px',
                  }}
                >
                  {o.address}
                </div>
                <a
                  href={`tel:${o.phone.replace(/\D/g, '')}`}
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Inter, sans-serif',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  {o.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
