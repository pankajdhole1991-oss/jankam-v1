import { useState, useEffect } from 'react';
import { Award, Shield, Target, Users, Scale, Eye } from 'lucide-react';
import { settingsService } from '../services/settings';

export default function TeamLeadership() {
  const [settings, setSettings] = useState(() => settingsService.getAll());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(settingsService.getAll());
    };
    window.addEventListener('jankam-settings-update', handleUpdate);
    return () => window.removeEventListener('jankam-settings-update', handleUpdate);
  }, []);

  const structureList = [
    { 
      role: settings.general.founderDesignation || 'Founder & Legal Lead', 
      name: settings.general.founderName || 'Pankaj Tulshiram Dhole', 
      desc: settings.general.founderDescription ? (settings.general.founderDescription.length > 70 ? settings.general.founderDescription.substring(0, 68) + '...' : settings.general.founderDescription) : 'Advocate specializing in labour rights & trade disputes' 
    },
    { role: 'President', name: 'Shrikant Pandhare', desc: 'Strategic operations and collective bargaining coordinator' },
    { role: 'Vice President', name: 'Ananya Deshmukh', desc: 'Public relations and industrial outreach lead' },
    { role: 'General Secretary', name: 'Milind Kamble', desc: 'Union registrations, documentation & official relations' },
    { role: 'Legal Advisory Cell', name: 'Adv. Ramesh Shinde', desc: 'Court conciliation and statutory compliance support' },
    { role: 'Women Safety & POSH', name: 'Dr. Sunita Rao', desc: 'POSH compliance audits & female worker helpline support' },
    { role: 'District Operations', name: 'Ganesh Gaikwad', desc: 'Coordination across Maharashtra industrial desks' },
    { role: 'Outreach & Mobilization', name: 'Sachin Sawant', desc: 'Mobilizing ground operations & volunteer networks' },
    { role: 'Digital Systems Desk', name: 'Rohan Dhole', desc: 'JanKam digital portal, AI backend & support database' },
  ];

  return (
    <section id="leadership" className="section-pad" style={{ background: '#0F2347', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="section-label" style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
            <Award size={12} />
            About {settings.general.organizationName || 'JanKam'} & Leadership
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.2,
              marginTop: '8px',
            }}
          >
            Empowering the <span className="text-gradient-gold">Workforce of Maharashtra</span>
          </h2>
        </div>

        {/* Compact About Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Mission, Vision, and Founder */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Mission & Vision Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* Mission */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5A623', marginBottom: '8px' }}>
                  <Target size={18} />
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Our Mission</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  {settings.general.missionStatement}
                </p>
              </div>

              {/* Vision */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', marginBottom: '8px' }}>
                  <Eye size={18} />
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Our Vision</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  {settings.general.visionStatement}
                </p>
              </div>
            </div>

            {/* Scope / Geographic Vision banner */}
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1.5px solid rgba(245,166,35,0.22)',
                position: 'relative',
                height: '160px',
                marginBottom: '10px',
              }}
            >
              <img
                src="/vision_mission.jpg"
                alt="Pune to Universe vision timeline"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,35,71,0.96) 0%, rgba(15,35,71,0.3) 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'white', fontSize: '0.9rem', margin: '0 0 2px' }}>
                    🌐 Expanding Reach & Geographic Vision
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    From Pune (Our Roots) and Maharashtra (Our State) to a global & universal labour rights mission.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Spot */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1.5px solid rgba(245,166,35,0.3)',
                borderRadius: '24px',
                padding: '24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F5A623 0%, #D4890A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: '0 4px 15px rgba(245,166,35,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                  }}
                >
                  {settings.general.founderPhoto || '👤'}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.15rem', color: 'white', lineHeight: 1.2 }}>
                    {settings.general.founderName}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#F5A623', fontWeight: 700, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                    {settings.general.founderDesignation}
                  </div>
                </div>
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  fontFamily: 'Inter, sans-serif',
                  fontStyle: 'italic',
                  position: 'relative',
                }}
              >
                "{settings.general.founderDescription}"
              </p>
            </div>

          </div>

          {/* Right Column: Organization Structure */}
          <div className="lg:col-span-6 flex flex-col">
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Users size={16} style={{ color: '#F5A623' }} /> Organization Structure
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '12px',
                  overflowY: 'auto',
                  flex: 1,
                  maxHeight: '300px',
                  paddingRight: '4px',
                }}
              >
                {structureList.map((member, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '2.5px',
                        background: idx === 0 ? '#F5A623' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: idx === 0 ? '#F5A623' : 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {member.role}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: 'white',
                      }}
                    >
                      {member.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.3,
                        fontFamily: 'Inter, sans-serif',
                        marginTop: '2px',
                      }}
                    >
                      {member.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
