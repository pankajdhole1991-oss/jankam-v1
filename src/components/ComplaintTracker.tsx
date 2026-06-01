import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../translations/context';
import { complaintsService } from '../services/complaints';
import type { ComplaintData, ComplaintStage } from '../types/complaint';

interface ComplaintTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
  initialMobile?: string;
}

const STAGES: { key: ComplaintStage; labelKey: string }[] = [
  { key: 'submitted', labelKey: 'tracker.stageSubmitted' },
  { key: 'under_review', labelKey: 'tracker.stageUnderReview' },
  { key: 'employer_verification', labelKey: 'tracker.stageVerification' },
  { key: 'conciliation', labelKey: 'tracker.stageConciliation' },
  { key: 'resolved', labelKey: 'tracker.stageResolved' },
];

export default function ComplaintTracker({ isOpen, onClose, initialId = '', initialMobile = '' }: ComplaintTrackerProps) {
  const { t } = useTranslation();
  const [complaintId, setComplaintId] = useState(initialId);
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<ComplaintData | null>(null);

  useEffect(() => {
    if (initialId) setComplaintId(initialId);
    if (initialMobile) setMobile(initialMobile);
    
    // Auto-search if parameters are pre-filled
    if (initialId && initialMobile) {
      handleTrack(undefined, initialId, initialMobile);
    }
  }, [initialId, initialMobile, isOpen]);

  const handleTrack = async (e?: React.FormEvent, searchId?: string, searchMobile?: string) => {
    if (e) e.preventDefault();
    setError('');
    setRecord(null);

    const checkId = (searchId || complaintId).trim().toUpperCase();
    const checkMobile = (searchMobile || mobile).trim();

    if (!checkId || !checkMobile) {
      setError(t('tracker.errNotFound'));
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Simulate brief network round-trip

    const list = complaintsService.getAll();
    const match = list.find(
      (c) =>
        c.id?.toUpperCase() === checkId &&
        c.mobile.replace(/\s+/g, '') === checkMobile.replace(/\s+/g, '')
    );

    setLoading(false);

    if (match) {
      setRecord(match);
    } else {
      setError(t('tracker.errNotFound'));
    }
  };

  // Listen to external tracking triggers
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        setComplaintId(customEvent.detail.id || '');
        setMobile(customEvent.detail.mobile || '');
        if (customEvent.detail.id && customEvent.detail.mobile) {
          handleTrack(undefined, customEvent.detail.id, customEvent.detail.mobile);
        }
      }
    };
    window.addEventListener('jankam-track-complaint-trigger', handleTrigger);
    return () => window.removeEventListener('jankam-track-complaint-trigger', handleTrigger);
  }, []);

  if (!isOpen) return null;

  const currentStageIndex = record ? STAGES.findIndex((s) => s.key === (record.currentStage || 'submitted')) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5, 15, 35, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          background: 'linear-gradient(145deg, #0A1931, #081225)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '28px',
          color: 'white',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px', right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'rgba(245, 166, 35, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle size={24} style={{ color: '#F5A623' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800 }}>
              {t('tracker.modalTitle')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              {t('tracker.modalSub')}
            </p>
          </div>
        </div>

        {/* Search Panel */}
        {!record && (
          <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('tracker.fieldId')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    placeholder={t('tracker.placeholderId')}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1.5px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('tracker.fieldMobile')}
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t('tracker.placeholderMobile')}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#F87171',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                justifyContent: 'center',
                fontSize: '0.95rem',
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '16px', height: '16px', border: '2px solid rgba(10,25,49,0.3)', borderTopColor: '#0A1931', borderRadius: '50%', marginRight: '8px' }} />
                  {t('tracker.btnTracking')}
                </>
              ) : (
                <>
                  <Search size={16} />
                  {t('tracker.btnTrack')}
                </>
              )}
            </button>
          </form>
        )}

        {/* Tracking Result View */}
        {record && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Header info */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('tracker.headerResult')}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F5A623', fontFamily: 'monospace', marginTop: '2px' }}>
                  {record.id}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('tracker.lblStatus')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: record.status === 'resolved' ? '#10B981' : '#F5A623',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: record.status === 'resolved' ? '#10B981' : '#F5A623' }}>
                    {t(`complaint.status${record.status}`) || (record.status || '').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('tracker.lblFiledDate')}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px' }}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', color: '#F5A623' }}>
                {t('tracker.timelineTitle')}
              </h4>
              
              {/* Stepper visuals */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                  paddingBottom: '30px',
                  width: '100%',
                }}
              >
                {/* Connector line background */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px', left: '20px', right: '20px',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    zIndex: 1,
                  }}
                />
                
                {/* Active connector line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px', left: '20px',
                    width: `${(currentStageIndex / (STAGES.length - 1)) * 94}%`,
                    height: '3px',
                    background: '#F5A623',
                    zIndex: 2,
                    transition: 'width 0.4s ease',
                  }}
                />

                {STAGES.map((s, idx) => {
                  const isActive = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div
                      key={s.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 3,
                        width: '70px',
                        position: 'relative',
                      }}
                    >
                      {/* Step Circle */}
                      <div
                        style={{
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: isCurrent
                            ? '#0A1931'
                            : isActive
                              ? '#F5A623'
                              : 'rgba(255, 255, 255, 0.08)',
                          border: `2px solid ${isActive ? '#F5A623' : 'rgba(255, 255, 255, 0.15)'}`,
                          color: isActive ? (isCurrent ? '#F5A623' : '#0A1931') : 'rgba(255, 255, 255, 0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 850,
                          fontSize: '0.85rem',
                          fontFamily: 'Outfit, sans-serif',
                          boxShadow: isCurrent ? '0 0 15px rgba(245, 166, 35, 0.3)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isActive && !isCurrent ? '✓' : idx + 1}
                      </div>

                      {/* Label */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '44px',
                          fontSize: '0.66rem',
                          width: '100px',
                          textAlign: 'center',
                          fontWeight: isCurrent ? 800 : 500,
                          color: isCurrent
                            ? '#F5A623'
                            : isActive
                              ? 'rgba(255,255,255,0.9)'
                              : 'rgba(255,255,255,0.3)',
                          fontFamily: 'Inter, sans-serif',
                          lineHeight: '1.2',
                        }}
                      >
                        {t(s.labelKey)}
                        {isCurrent && (
                          <div style={{ fontSize: '0.55rem', color: '#10B981', fontWeight: 800, marginTop: '2px' }}>
                            ({t('tracker.badgeActive')})
                          </div>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public updates & logistics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              
              {/* Latest Action Updates */}
              <div
                style={{
                  background: 'rgba(245, 166, 35, 0.05)',
                  border: '1.5px solid rgba(245, 166, 35, 0.15)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5A623', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  <ShieldCheck size={16} />
                  {t('tracker.lblPublicUpdate')}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.95)', fontFamily: 'Inter, sans-serif' }}>
                  {record.publicUpdate || 'Case registered. Advocate verification in progress.'}
                </p>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                  {t('tracker.lblLastUpdated')}: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : new Date(record.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Assignments Logistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {t('tracker.lblTeam')}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                    {record.assignedDistrictTeam || `${record.workDistrict} District Desk`}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {t('tracker.lblVolunteer')}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                    {record.assignedVolunteer || 'Suresh Mane (Advocate Staff)'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {t('tracker.lblOfficer')}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                    {record.assignedOfficer || 'Pankaj Dhole (Lead Advocate)'}
                  </div>
                </div>
              </div>

              {/* Notification Ready verification cues */}
              <div
                style={{
                  display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', marginTop: '6px'
                }}
              >
                <span>Mobile Verified: <strong style={{ color: '#10B981' }}>✓ YES</strong></span>
                <span>•</span>
                <span>Auto-WhatsApp Ready: <strong style={{ color: '#10B981' }}>✓ YES</strong></span>
                <span>•</span>
                <span>Notification Method: <strong style={{ color: '#F5A623' }}>{record.notificationType || 'WhatsApp'}</strong></span>
              </div>
            </div>

            {/* Back button */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setRecord(null);
                  setError('');
                }}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: '0.88rem' }}
              >
                Track Another Case
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: '0.88rem' }}
              >
                {t('tracker.btnClose')}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
