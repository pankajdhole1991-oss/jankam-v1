import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText, CheckCircle, ShieldCheck, Heart, Scale, Bot, Users,
} from 'lucide-react';

interface ServicesProps {
  onFileComplaint: () => void;
  onJoinJankam: () => void;
}

interface ServiceItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  action: 'file-complaint' | 'join-jankam' | string;
  actionLabel: string;
}

const services: ServiceItem[] = [
  {
    id: 'svc-file-complaint',
    icon: FileText,
    title: 'File Complaint',
    description: 'Register your workplace complaint. Get a unique Complaint ID instantly.',
    color: '#F5A623',
    bgColor: 'rgba(245,166,35,0.12)',
    action: 'file-complaint',
    actionLabel: 'File Now',
  },
  {
    id: 'svc-salary',
    icon: CheckCircle,
    title: 'Salary Verification',
    description: 'Verify salary, overtime pay, and deductions against legal standards.',
    color: '#34D399',
    bgColor: 'rgba(52,211,153,0.12)',
    action: '#tools',
    actionLabel: 'Verify Salary',
  },
  {
    id: 'svc-pf',
    icon: ShieldCheck,
    title: 'PF Help',
    description: 'Provident Fund claims, contributions, and employer default complaints.',
    color: '#60A5FA',
    bgColor: 'rgba(96,165,250,0.12)',
    action: '#tools',
    actionLabel: 'PF Calculator',
  },
  {
    id: 'svc-esic',
    icon: Heart,
    title: 'ESIC Help',
    description: 'Medical benefits under ESIC — rights and claim process explained.',
    color: '#F87171',
    bgColor: 'rgba(248,113,113,0.12)',
    action: '#ai-sahayak',
    actionLabel: 'Get Help',
  },
  {
    id: 'svc-women',
    icon: ShieldCheck,
    title: 'Women Safety',
    description: 'POSH awareness, harassment reporting, dedicated safety helpline.',
    color: '#C084FC',
    bgColor: 'rgba(192,132,252,0.12)',
    action: '#ai-sahayak',
    actionLabel: 'Learn More',
  },
  {
    id: 'svc-legal',
    icon: Scale,
    title: 'Legal Guidance',
    description: 'Labour law guidance, rights awareness, and complaint drafts.',
    color: '#FB923C',
    bgColor: 'rgba(251,146,60,0.12)',
    action: '#ai-sahayak',
    actionLabel: 'Get Guidance',
  },
  {
    id: 'svc-ai',
    icon: Bot,
    title: 'AI Labour Assistant',
    description: 'Your smart Labour Assistant available 24/7 — instant guidance on rights.',
    color: '#38BDF8',
    bgColor: 'rgba(56,189,248,0.12)',
    action: '#ai-sahayak',
    actionLabel: 'Open Assistant',
  },
  {
    id: 'svc-join',
    icon: Users,
    title: 'Join JanKam',
    description: "Become a member of Maharashtra's growing worker support network.",
    color: '#A3E635',
    bgColor: 'rgba(163,230,53,0.12)',
    action: 'join-jankam',
    actionLabel: 'Join Now',
  },
];

export default function Services({ onFileComplaint, onJoinJankam }: ServicesProps) {
  const handleAction = (action: string) => {
    if (action === 'file-complaint') { onFileComplaint(); return; }
    if (action === 'join-jankam') { onJoinJankam(); return; }
    const el = document.querySelector(action);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="services" className="section-pad" style={{ background: '#0A1931' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            Our Services
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 900,
              color: 'white',
              marginTop: '4px',
            }}
          >
            What JanKam{' '}
            <span className="text-gradient-gold">Provides</span>
          </h2>
          <p
            style={{
              marginTop: '12px',
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Eight core services designed to protect, support, and empower every worker across Maharashtra.
          </p>
        </div>

        {/* Services Grid — equal-height cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                id={service.id}
                onClick={() => handleAction(service.action)}
                className="service-card"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '18px',
                  padding: '22px 20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  /* Touch feedback */
                  WebkitTapHighlightColor: 'rgba(245,166,35,0.15)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${service.color}40`;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = 'rgba(245,166,35,0.08)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: service.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} style={{ color: service.color }} />
                </div>

                {/* Text — flex-1 so cards stretch to same height */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      color: 'white',
                      fontSize: '1rem',
                      marginBottom: '6px',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: '0.855rem',
                      lineHeight: 1.55,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: service.color,
                    fontFamily: 'Outfit, sans-serif',
                    marginTop: 'auto',
                  }}
                >
                  {service.actionLabel}
                  <ArrowRight size={13} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Industry Sectors Graphic Banner */}
        <div
          style={{
            marginTop: '48px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '24px',
            padding: 'clamp(20px, 5vw, 32px)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'white',
              marginBottom: '6px',
            }}
          >
            💼 Comprehensive Workforce Industry Coverage
          </h3>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.86rem',
              maxWidth: '600px',
              margin: '0 auto 20px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            From heavy construction, welding, and carpentry to hospitality, healthcare, education, IT, and small businesses. We represent and protect workers across 30+ industrial and service sectors in Maharashtra.
          </p>
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1.5px solid rgba(245,166,35,0.2)',
              maxWidth: '900px',
              margin: '0 auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src="/industry_sectors.jpg"
              alt="Grid of 30 industry sectors represented by JanKam"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
