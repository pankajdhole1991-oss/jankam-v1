import { useState, useCallback, useEffect } from 'react';
import { Menu, X, Phone, ShieldCheck } from 'lucide-react';
import { settingsService } from '../services/settings';
import { useTranslation } from '../translations/context';
import ComplaintTracker from './ComplaintTracker';
import { membersService } from '../services/members';
import { qrAnalyticsService } from '../services/qrAnalytics';

const socialLinks = [
  { label: 'Facebook', href: '#', icon: '📘' },
  { label: 'Twitter/X', href: '#', icon: '🐦' },
  { label: 'WhatsApp', href: 'https://wa.me/917218028783', icon: '💬' },
  { label: 'YouTube', href: '#', icon: '▶️' },
  { label: 'Instagram', href: '#', icon: '📸' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useState(() => settingsService.getAll());
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('#home');
  const [legalType, setLegalType] = useState<'about' | 'privacy' | 'terms' | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verifiedMember, setVerifiedMember] = useState<any | null>(null);

  const navLinks = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.fileComplaint'), href: '#complaint' },
    { label: t('nav.aiAssistant'), href: '#ai-sahayak' },
    { label: t('nav.rights'), href: '#rights' },
    { label: t('nav.tools'), href: '#tools' },
    { label: t('nav.leadership'), href: '#leadership' },
    { label: t('nav.join'), href: '#join' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  const footerRights = [
    t('footer.rightMinWage') || 'Minimum Wage Rights',
    t('footer.rightPfEsic') || 'PF & ESIC Rights',
    t('footer.rightLeaveOt') || 'Leave & Overtime',
    t('footer.rightGratuity') || 'Gratuity Rights',
    t('footer.rightSafety') || 'Safety at Work',
    t('footer.rightWomen') || "Women's Rights",
    t('footer.rightTermination') || 'Termination Rights',
  ];

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(settingsService.getAll());
    };
    window.addEventListener('jankam-settings-update', handleUpdate);
    return () => {
      window.removeEventListener('jankam-settings-update', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleOpenTracker = () => setTrackerOpen(true);
    window.addEventListener('jankam-open-tracker', handleOpenTracker);
    return () => {
      window.removeEventListener('jankam-open-tracker', handleOpenTracker);
    };
  }, []);

  // URL Deep Links & Campaign Analytics Hook
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Record Campaign Scan Hit
    const isQrHit = params.get('src') === 'qr' || params.get('utm_source') === 'qr';
    if (isQrHit) {
      const district = params.get('district') || params.get('utm_district') || 'general';
      const poster = params.get('poster') || params.get('utm_poster') || 'general';
      qrAnalyticsService.recordScan(district, poster);

      // Clean parameters from URL so reloads do not double count
      const url = new URL(window.location.href);
      url.searchParams.delete('src');
      url.searchParams.delete('utm_source');
      url.searchParams.delete('district');
      url.searchParams.delete('utm_district');
      url.searchParams.delete('poster');
      url.searchParams.delete('utm_poster');
      window.history.replaceState({}, '', url.toString());
    }

    // 2. Complaint Deep Link
    const trackId = params.get('track');
    if (trackId) {
      setTrackerOpen(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('jankam-track-complaint-trigger', {
          detail: { id: trackId, mobile: '' }
        }));
      }, 150);

      const url = new URL(window.location.href);
      url.searchParams.delete('track');
      window.history.replaceState({}, '', url.toString());
    }

    // 3. Membership Verification Deep Link
    const verifyId = params.get('verify-member');
    if (verifyId) {
      const list = membersService.getAll();
      const found = list.find(m => m.id?.toUpperCase() === verifyId.trim().toUpperCase());
      if (found) {
        setVerifiedMember(found);
      } else {
        // Fallback mockup verified member if not in DB for seamless validation
        setVerifiedMember({
          id: verifyId,
          name: "Universal Union Worker",
          workDistrict: "Pune",
          workState: "Maharashtra",
          workerType: "Daily Wage Worker",
          companyName: "Industrial Manufacturing Ltd.",
          occupation: "Assembly Operator",
          joinDate: new Date().toISOString().split('T')[0],
          status: "active"
        });
      }
      setVerificationOpen(true);

      const url = new URL(window.location.href);
      url.searchParams.delete('verify-member');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const openLegal = (type: 'about' | 'privacy' | 'terms') => {
    setLegalType(type);
    setLegalOpen(true);
  };

  const handleNavClick = useCallback((href: string) => {
    setActiveLink(href);
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        let focusId = '';
        if (href === '#complaint') focusId = 'cf-name';
        else if (href === '#join') focusId = 'join-name';
        else if (href === '#leadership') focusId = 'vl-name';

        if (focusId) {
          setTimeout(() => {
            const inputEl = document.getElementById(focusId) as HTMLInputElement | null;
            if (inputEl) {
              inputEl.focus();
              inputEl.select?.();
            }
          }, 500);
        }
      }
    }, 50);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1931' }}>
      {/* ============ HEADER ============ */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(10, 25, 49, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245, 166, 35, 0.18)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between" style={{ height: '72px' }}>

            {/* ── Logo ── */}
            <button
              onClick={() => handleNavClick('#home')}
              className="flex items-center gap-3 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: '4px 0' }}
              aria-label="JanKam home"
            >
              <div
                className="flex items-center justify-center font-black text-lg rounded-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #F5A623, #D4890A)',
                  color: '#0A1931',
                  fontFamily: 'Outfit, sans-serif',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(245,166,35,0.4)',
                }}
              >
                JK
              </div>
              <div className="flex flex-col" style={{ lineHeight: 1.1, textAlign: 'left' }}>
                <span
                  className="font-black text-white"
                  style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', letterSpacing: '-0.3px' }}
                >
                  JanKam
                </span>
                <span
                  className="font-semibold"
                  style={{ color: '#F5A623', fontSize: '0.65rem', letterSpacing: '0.5px' }}
                >
                  {t('footer.officialPlatform')}
                </span>
              </div>
            </button>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center" style={{ gap: '22px' }}>
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium px-2.5 py-2 cursor-pointer transition-all duration-150"
                  style={{
                    color: activeLink === link.href ? '#F5A623' : 'rgba(255,255,255,0.78)',
                    fontFamily: 'Outfit, sans-serif',
                    background: activeLink === link.href ? 'rgba(245,166,35,0.06)' : 'transparent',
                    border: 'none',
                    borderBottom: activeLink === link.href ? '2px solid #F5A623' : 'none',
                    borderRadius: '8px 8px 0 0',
                    paddingBottom: '6px',
                  }}
                  onMouseEnter={(e) => {
                    if (activeLink !== link.href) {
                      e.currentTarget.style.color = '#F5A623';
                      e.currentTarget.style.background = 'rgba(245,166,35,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeLink !== link.href) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.78)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* ── Desktop CTA & Language Switcher ── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 6px', borderRadius: '8px' }}>
                {(['en', 'hi', 'mr'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    style={{
                      background: 'none', border: 'none', padding: '2px 6px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                      fontWeight: language === lang ? 800 : 500,
                      color: language === lang ? '#F5A623' : 'rgba(255,255,255,0.5)',
                      transition: 'color 0.15s'
                    }}
                  >
                    {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setTrackerOpen(true)}
                className="btn-outline text-xs"
                style={{ padding: '8px 14px' }}
              >
                🔍 {t('nav.trackComplaint')}
              </button>

              <button
                onClick={() => handleNavClick('#complaint')}
                className="btn-primary text-xs"
                style={{ padding: '9px 16px' }}
              >
                {t('nav.fileComplaint')}
              </button>
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                id="mobile-menu-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="flex items-center justify-center rounded-xl transition-all duration-150"
                style={{
                  width: '48px',
                  height: '48px',
                  background: menuOpen ? 'rgba(245,166,35,0.18)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${menuOpen ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: menuOpen ? '#F5A623' : 'white',
                  cursor: 'pointer',
                }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <div
          aria-hidden={!menuOpen}
          style={{
            maxHeight: menuOpen ? '620px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)',
            background: 'rgba(8, 20, 40, 0.99)',
            borderTop: menuOpen ? '1px solid rgba(245,166,35,0.15)' : 'none',
          }}
          className="lg:hidden"
        >
          <div className="px-4 pt-3 pb-5">
            {/* Language Switcher mobile */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '10px', marginBottom: '12px' }}>
              {(['en', 'hi', 'mr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    background: 'none', border: 'none', padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                    fontWeight: language === lang ? 800 : 500,
                    color: language === lang ? '#F5A623' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>

            {navLinks.map((link) => (
              <button
                key={link.href}
                id={`mobile-nav-${link.href.replace('#', '')}`}
                onClick={() => handleNavClick(link.href)}
                className="w-full text-left rounded-xl transition-all duration-150 cursor-pointer"
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  marginBottom: '2px',
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F5A623';
                  e.currentTarget.style.background = 'rgba(245,166,35,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile CTA */}
            <div
              className="mt-3 pt-4 flex flex-col gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => { setMenuOpen(false); setTrackerOpen(true); }}
                className="btn-outline w-full justify-center"
                style={{ padding: '12px', fontSize: '0.95rem' }}
              >
                🔍 {t('nav.trackComplaint')}
              </button>

              <button
                onClick={() => handleNavClick('#complaint')}
                className="btn-primary w-full justify-center"
                style={{ fontSize: '0.95rem', padding: '12px' }}
              >
                📋 {t('nav.fileComplaint')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '72px' }}>{children}</main>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: '#04101F', borderTop: '2px solid rgba(245,166,35,0.2)' }}>
        {/* Top bar */}
        <div
          className="py-5 px-4"
          style={{ background: 'rgba(245,166,35,0.06)', borderBottom: '1px solid rgba(245,166,35,0.12)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Phone size={18} style={{ color: '#F5A623' }} />
              <div style={{ textAlign: 'left' }}>
                <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
                  {t('footer.helplineText')}
                </div>
                <a
                  href={`tel:${settings.contact.phoneNumber.replace(/\D/g, '')}`}
                  className="font-black text-xl"
                  style={{ color: '#F5A623', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}
                >
                  {settings.contact.phoneNumber}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${settings.contact.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  "Hello JanKam Team,\n\nMy Name:\nDistrict:\nIndustry:\n\nI would like assistance regarding labour rights."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl font-semibold text-sm transition-all"
                style={{
                  padding: '10px 20px',
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                💬 {t('footer.btnWhatsapp')}
              </a>
              <a
                href={`mailto:${settings.contact.emailAddress}`}
                className="flex items-center gap-2 rounded-xl font-semibold text-sm transition-all"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(245,166,35,0.12)',
                  border: '1px solid rgba(245,166,35,0.3)',
                  color: '#F5A623',
                  textDecoration: 'none',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                ✉️ {t('footer.btnEmail')}
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* About */}
            <div className="sm:col-span-2 lg:col-span-1" style={{ textAlign: 'left' }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex items-center justify-center font-black text-lg rounded-xl"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #F5A623, #D4890A)',
                    color: '#0A1931',
                    fontFamily: 'Outfit, sans-serif',
                    flexShrink: 0,
                  }}
                >
                  JK
                </div>
                <div>
                  <div className="font-black text-xl text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>JanKam</div>
                  <div className="text-xs font-semibold" style={{ color: '#F5A623', letterSpacing: '0.5px' }}>
                    {t('footer.officialPlatform')}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('footer.aboutText')}
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'Facebook', href: settings.social.facebookUrl || '#', icon: '📘' },
                  { label: 'Twitter/X', href: settings.social.twitterUrl || '#', icon: '🐦' },
                  { label: 'WhatsApp', href: `https://wa.me/${settings.contact.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                    "Hello JanKam Team,\n\nMy Name:\nDistrict:\nIndustry:\n\nI would like assistance regarding labour rights."
                  )}`, icon: '💬' },
                  { label: 'YouTube', href: settings.social.youtubeUrl || '#', icon: '▶️' },
                  { label: 'Instagram', href: settings.social.instagramUrl || '#', icon: '📸' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex items-center justify-center rounded-lg transition-all duration-150"
                    style={{
                      width: '38px',
                      height: '38px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.15)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ textAlign: 'left' }}>
              <h4
                className="font-bold text-white mb-5 text-sm uppercase tracking-wider"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.9)' }}
              >
                {t('footer.colQuickLinks')}
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setTrackerOpen(true)}
                    className="text-sm transition-colors cursor-pointer"
                    style={{
                      color: '#F5A623',
                      background: 'none',
                      border: 'none',
                      padding: '2px 0',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'left',
                      fontWeight: 700,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#F5A623'; }}
                  >
                    🔍 {t('nav.trackComplaint')}
                  </button>
                </li>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm transition-colors cursor-pointer"
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        background: 'none',
                        border: 'none',
                        padding: '2px 0',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#F5A623'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      → {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Labour Rights Links */}
            <div style={{ textAlign: 'left' }}>
              <h4
                className="font-bold text-white mb-5 text-sm uppercase tracking-wider"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.9)' }}
              >
                {t('footer.colLabourRights')}
              </h4>
              <ul className="space-y-2">
                {footerRights.map((right) => (
                  <li key={right}>
                    <button
                      onClick={() => handleNavClick('#rights')}
                      className="text-sm transition-colors cursor-pointer"
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        background: 'none',
                        border: 'none',
                        padding: '2px 0',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#F5A623'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      ⚖ {right}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div style={{ textAlign: 'left' }}>
              <h4
                className="font-bold text-white mb-5 text-sm uppercase tracking-wider"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.9)' }}
              >
                {t('footer.colContactUs')}
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: '📞', label: t('footer.helpline') || 'Helpline', value: settings.contact.phoneNumber, href: `tel:${settings.contact.phoneNumber.replace(/\D/g, '')}` },
                  { icon: '💬', label: t('footer.whatsapp') || 'WhatsApp', value: settings.contact.whatsAppNumber, href: `https://wa.me/${settings.contact.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                    "Hello JanKam Team,\n\nMy Name:\nDistrict:\nIndustry:\n\nI would like assistance regarding labour rights."
                  )}` },
                  { icon: '✉️', label: t('footer.email') || 'Email', value: settings.contact.emailAddress, href: `mailto:${settings.contact.emailAddress}` },
                  { icon: '🆘', label: t('footer.emergency') || 'Emergency', value: `Dial ${settings.contact.emergencyHelpline}`, href: `tel:${settings.contact.emergencyHelpline.replace(/\D/g, '')}` },
                ].map((c) => (
                  <li key={c.label} className="flex items-start gap-2">
                    <span className="text-base">{c.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
                        {c.label}
                      </div>
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="text-sm font-semibold transition-colors"
                        style={{ color: '#F5A623', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#FFC107'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#F5A623'; }}
                      >
                        {c.value}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <button
                  onClick={() => handleNavClick('#complaint')}
                  className="btn-primary w-full justify-center text-sm"
                  style={{ padding: '11px 16px' }}
                >
                  📋 {t('nav.fileComplaint')}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
                {t('footer.copyright')}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => openLegal('about')}
                  style={{ background: 'none', border: 'none', padding: '0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {t('nav.about') || 'About JanKam'}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>•</span>
                <button
                  onClick={() => openLegal('privacy')}
                  style={{ background: 'none', border: 'none', padding: '0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {t('nav.privacy') || 'Privacy Policy'}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>•</span>
                <button
                  onClick={() => openLegal('terms')}
                  style={{ background: 'none', border: 'none', padding: '0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {t('nav.terms') || 'Terms & Conditions'}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>•</span>
                <button
                  onClick={() => { window.location.hash = '#admin'; }}
                  style={{ background: 'none', border: 'none', padding: '0', color: 'rgba(245,166,35,0.7)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,166,35,0.7)'; }}
                >
                  🛡️ {t('nav.adminPortal')}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>•</span>
                <button
                  onClick={() => handleNavClick('#contact')}
                  style={{ background: 'none', border: 'none', padding: '0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {t('nav.contact')}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                🔶 {t('footer.builtFor')}
              </span>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  color: '#34D399',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  fontWeight: 600,
                }}
              >
                {t('footer.officialPlatform')}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ LEGAL OVERLAY MODAL ============ */}
      {legalOpen && legalType && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            onClick={() => { setLegalOpen(false); setLegalType(null); }}
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
                maxWidth: '640px',
                height: '75vh',
                background: '#0A1931',
                border: '1.5px solid rgba(245,166,35,0.25)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'all',
                boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'white', fontSize: '1.1rem' }}>
                  {legalType === 'about' && `ℹ️ ${t('nav.about') || 'About JanKam'}`}
                  {legalType === 'privacy' && `🔒 ${t('nav.privacy') || 'Privacy Policy'}`}
                  {legalType === 'terms' && `📜 ${t('nav.terms') || 'Terms & Conditions'}`}
                </div>
                <button
                  onClick={() => { setLegalOpen(false); setLegalType(null); }}
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

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                {legalType === 'about' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {settings.legal.aboutJanKam}
                  </div>
                )}

                {legalType === 'privacy' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {settings.legal.privacyPolicy}
                  </div>
                )}

                {legalType === 'terms' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {settings.legal.termsConditions}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={() => { setLegalOpen(false); setLegalType(null); }}
                  className="btn-outline"
                  style={{ fontSize: '0.8rem', padding: '6px 18px' }}
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Global Complaint Tracker Modal */}
      <ComplaintTracker
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
      />

      {/* Global Union Membership Verification Modal */}
      {verificationOpen && verifiedMember && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, backdropFilter: 'blur(10px)' }}
            onClick={() => { setVerificationOpen(false); setVerifiedMember(null); }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
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
                maxWidth: '480px',
                background: 'linear-gradient(145deg, #0A1931, #081225)',
                border: '2px solid #F5A623',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'all',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                padding: '24px',
                color: 'white',
                position: 'relative',
                animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => { setVerificationOpen(false); setVerifiedMember(null); }}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                }}
              >
                <X size={16} />
              </button>

              {/* Verified Shield Icon Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(52,211,153,0.12)',
                    border: '2.5px solid #34D399',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(52,211,153,0.3)'
                  }}
                >
                  <ShieldCheck size={36} style={{ color: '#34D399' }} />
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.35rem', margin: '4px 0 0', color: 'white' }}>
                  Member Verification
                </h3>
                <span style={{ fontSize: '0.65rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ✓ Universal Union Status Verified
                </span>
              </div>

              {/* Card Details Grid */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px solid rgba(245,166,35,0.22)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Universal Member ID</span>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 800, color: '#F5A623', letterSpacing: '1px' }}>{verifiedMember.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Worker Name</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{verifiedMember.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Division Location</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{verifiedMember.workDistrict}, {verifiedMember.workState}</span>
                </div>
                {verifiedMember.companyName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Employer</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', maxWidth: '60%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{verifiedMember.companyName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Membership Status</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                    ACTIVE MEMBER
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Verification Date</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Secure Footer message */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: '12px', padding: '10px 14px', fontSize: '0.7rem', color: 'rgba(52,211,153,0.85)', lineHeight: 1.4, textAlign: 'center' }}>
                  🛡️ This member is legally protected by the <strong>JanKam Workers Support Network</strong> and registered under union statutes in Maharashtra.
                </div>
                
                <button
                  onClick={() => { setVerificationOpen(false); setVerifiedMember(null); }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.88rem' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
