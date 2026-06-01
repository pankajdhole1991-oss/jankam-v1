import { useRef, useState } from 'react';
import type { ComplaintData } from '../types/complaint';
import { COMPLAINT_TYPE_LABELS, COMPLAINT_STATUS_LABELS } from '../types/complaint';
import { CheckCircle, Download, Printer, Share2, PlusCircle, X, Copy, MessageSquare } from 'lucide-react';

function VectorQRCode({ complaintId }: { complaintId?: string }) {
  const siteUrl = window.location.origin;
  const qrTargetUrl = `${siteUrl}?track=${encodeURIComponent(complaintId || '')}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&ecc=H&data=${encodeURIComponent(qrTargetUrl)}`;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '16px',
      background: 'white',
      borderRadius: '12px',
      border: '1.5px solid rgba(245,166,35,0.2)',
      maxWidth: '180px',
      margin: '16px auto 0',
    }}>
      <div style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={qrImageUrl} alt="Track Complaint QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <span style={{ fontSize: '0.62rem', color: '#0A1931', fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px' }}>
        SCAN TO TRACK STATUS
      </span>
    </div>
  );
}

interface ComplaintReceiptProps {
  complaint: ComplaintData;
  onNewComplaint: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function copyToClipboard(text: string): boolean {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export default function ComplaintReceipt({ complaint, onNewComplaint }: ComplaintReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `✅ JanKam Complaint Registered

Complaint ID: ${complaint.id}
Priority: ${complaint.priorityLevel}
Name: ${complaint.name}
Employer: ${complaint.companyName}
Industry: ${complaint.industryType}
Worker Type: ${complaint.workerType}
Work District: ${complaint.workDistrict}, ${complaint.workState}
Home District: ${complaint.homeDistrict}, ${complaint.homeState}
Type: ${COMPLAINT_TYPE_LABELS[complaint.complaintType]}
Filed: ${formatDate(complaint.createdAt)}
Status: ${COMPLAINT_STATUS_LABELS[complaint.status]}

📞 JanKam Helpline: 1800-123-4567
✉️ help@jankam.org`;

  const handleDownloadPDF = () => {
    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;600&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: white; color: #111; padding: 32px; max-width: 750px; margin: 0 auto; }
      .header { background: #0A1931; color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
      .logo { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1.4rem; color: #F5A623; }
      .tagline { font-size: 0.72rem; color: rgba(255,255,255,0.55); margin-top: 2px; }
      .badge-ok { background: #F5A623; color: #0A1931; font-weight: 700; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; white-space: nowrap; }
      .id-block { text-align: center; padding: 20px 0; border-bottom: 2px dashed #eee; margin-bottom: 20px; }
      .id-label { font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
      .complaint-id { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 2.2rem; color: #0A1931; letter-spacing: 3px; }
      .status-chip { display: inline-block; background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; padding: 3px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; margin-top: 8px; }
      .priority-chip { display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; margin-left: 8px; margin-top: 8px; }
      .priority-High { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
      .priority-Medium { background: #ffedd5; border: 1px solid #fdba74; color: #9a3412; }
      .priority-Low { background: #ecfeff; border: 1px solid #67e8f9; color: #155e75; }
      .section-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #999; margin: 20px 0 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .field { border: 1px solid #eee; border-radius: 8px; padding: 10px 12px; }
      .field-label { font-size: 0.65rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
      .field-value { font-size: 0.88rem; font-weight: 600; color: #111; word-break: break-word; }
      .desc-box { border: 1px solid #eee; border-radius: 8px; padding: 14px; margin-top: 4px; font-size: 0.88rem; line-height: 1.6; color: #333; }
      .footer-note { margin-top: 24px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 0.78rem; color: #78350f; }
      .footer-bar { margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 0.7rem; color: #bbb; }
      @media print { body { padding: 16px; } .header { border-radius: 8px; } }
    `;
    const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Complaint Receipt — ${complaint.id}</title>
<style>${css}</style>
</head><body>
<div class="header">
  <div><div class="logo">JanKam</div><div class="tagline">Digital Labour Rights Desk · Maharashtra</div></div>
  <div class="badge-ok">✓ FILED</div>
</div>
<div class="id-block">
  <div class="id-label">Complaint ID</div>
  <div class="complaint-id">${complaint.id}</div>
  <div class="status-chip">${COMPLAINT_STATUS_LABELS[complaint.status]}</div>
  <div class="priority-chip priority-${complaint.priorityLevel}">${complaint.priorityLevel} Priority</div>
  
  <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border: 1.5px solid #F5A623; border-radius: 12px; max-width: 140px; margin: 16px auto 0; background: white;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&ecc=H&data=${encodeURIComponent(window.location.origin + '?track=' + complaint.id)}" style="width: 100px; height: 100px; object-fit: contain;" />
    <span style="font-size: 0.45rem; color: #0A1931; font-weight: 800; font-family: sans-serif; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px;">SCAN TO TRACK STATUS</span>
  </div>
</div>
<div class="section-title">1. Complainant Personal Profile</div>
<div class="grid">
  <div class="field"><div class="field-label">Full Name</div><div class="field-value">${complaint.name}</div></div>
  <div class="field"><div class="field-label">Mobile</div><div class="field-value">${complaint.mobile}</div></div>
  <div class="field"><div class="field-label">Email</div><div class="field-value">${complaint.email || 'N/A'}</div></div>
  <div class="field"><div class="field-label">Gender / Age</div><div class="field-value">${complaint.gender} / ${complaint.age} Years</div></div>
  <div class="field"><div class="field-label">Preferred Language</div><div class="field-value">${complaint.preferredLanguage}</div></div>
  <div class="field"><div class="field-label">Education Level</div><div class="field-value">${complaint.educationLevel}</div></div>
</div>

<div class="section-title">2. State/District Coordinates</div>
<div class="grid">
  <div class="field"><div class="field-label">Home State</div><div class="field-value">${complaint.homeState}</div></div>
  <div class="field"><div class="field-label">Home District</div><div class="field-value">${complaint.homeDistrict}</div></div>
  <div class="field"><div class="field-label">Work State (Current)</div><div class="field-value">${complaint.workState}</div></div>
  <div class="field"><div class="field-label">Work District (Current)</div><div class="field-value">${complaint.workDistrict}</div></div>
</div>

<div class="section-title">3. Employment & Company Particulars</div>
<div class="grid">
  <div class="field"><div class="field-label">Company Name</div><div class="field-value">${complaint.companyName}</div></div>
  <div class="field"><div class="field-label">Employee ID</div><div class="field-value">${complaint.employeeId || 'N/A'}</div></div>
  <div class="field"><div class="field-label">Industry Sector</div><div class="field-value">${complaint.industryType}</div></div>
  <div class="field"><div class="field-label">Worker Type</div><div class="field-value">${complaint.workerType}</div></div>
</div>

<div class="section-title">4. Case Grievance Specifics</div>
<div class="grid">
  <div class="field"><div class="field-label">Complaint Category</div><div class="field-value">${COMPLAINT_TYPE_LABELS[complaint.complaintType]}</div></div>
  <div class="field"><div class="field-label">Filed On</div><div class="field-value">${formatDate(complaint.createdAt)}</div></div>
  <div class="field"><div class="field-label">Priority Level</div><div class="field-value">${complaint.priorityLevel}</div></div>
  <div class="field"><div class="field-label">Attached Document Type</div><div class="field-value">${complaint.documentType || 'No document uploaded'}</div></div>
</div>

<div class="section-title">Complaint Case Description</div>
<div class="desc-box">${complaint.description}</div>

<div class="footer-note">⚠️ Keep your Complaint ID <strong>${complaint.id}</strong> safe. Under the statutory priority system, this case is flagged as <strong>${complaint.priorityLevel} priority</strong>. The JanKam grievance cell will initiate review within 48 hours.</div>
<div class="footer-bar">
  <span>JanKam — Digital Labour Rights Welfare Association</span>
  <span>📞 1800-123-4567 | help@jankam.org</span>
</div>
</body></html>`;
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups to download receipt.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups to print.'); return; }
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>JanKam Receipt</title>
<style>body{font-family:sans-serif;padding:20px;background:white;color:#111}*{box-sizing:border-box}</style>
</head><body onload="window.print()">
<h2 style="font-size:1.4rem;margin-bottom:16px">JanKam — Case Intake Receipt</h2>
<p><strong>Complaint ID:</strong> ${complaint.id} (${complaint.priorityLevel} Priority)</p>
<p><strong>Complainant:</strong> ${complaint.name} (${complaint.gender}, Age ${complaint.age})</p>
<p><strong>Preferred Language:</strong> ${complaint.preferredLanguage} | Education: ${complaint.educationLevel}</p>
<p><strong>Home Location:</strong> ${complaint.homeDistrict}, ${complaint.homeState}</p>
<p><strong>Work Location:</strong> ${complaint.workDistrict}, ${complaint.workState}</p>
<p><strong>Employer / Company:</strong> ${complaint.companyName} (Employee ID: ${complaint.employeeId || 'N/A'})</p>
<p><strong>Worker Type:</strong> ${complaint.workerType} | Industry: ${complaint.industryType}</p>
<p><strong>Category:</strong> ${COMPLAINT_TYPE_LABELS[complaint.complaintType]}</p>
<p><strong>Attached Document:</strong> ${complaint.documentType || 'None'}</p>
<p><strong>Filed On:</strong> ${formatDate(complaint.createdAt)}</p>
<p><strong>Status:</strong> ${COMPLAINT_STATUS_LABELS[complaint.status]}</p>
<hr style="margin:16px 0"/>
<p><strong>Description:</strong><br/>${complaint.description}</p>
<hr style="margin:16px 0"/>
<p style="font-size:0.8rem;color:#666">JanKam Helpline: 1800-123-4567 | help@jankam.org</p>
</body></html>`);
    win.document.close();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JanKam Complaint — ${complaint.id}`,
          text: shareText,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    setShareModalOpen(true);
  };

  const handleCopyFromModal = () => {
    const ok = copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (!ok) {
      const el = document.getElementById('share-textarea') as HTMLTextAreaElement;
      el?.select();
    }
  };

  // Pass complaint context automatically to ChatModal / AI Labour Assistant
  const handleDiscussWithAI = () => {
    const aiContext = `I have just filed a labor complaint with JanKam. Here are my registered details:
- **Complaint ID**: ${complaint.id}
- **Category**: ${complaint.complaintType} (${complaint.priorityLevel} Priority)
- **Complainant Name**: ${complaint.name} (${complaint.gender}, Age ${complaint.age})
- **Preferred Language**: ${complaint.preferredLanguage}
- **Address Coordinates**: Home: ${complaint.homeDistrict}, ${complaint.homeState} | Work: ${complaint.workDistrict}, ${complaint.workState}
- **Company Name**: ${complaint.companyName} (${complaint.workerType}, ${complaint.industryType})
- **Employee ID**: ${complaint.employeeId || 'Not provided'}
- **Complaint Details**: ${complaint.description}
- **Supporting Document**: ${complaint.documentType || 'None'}

Please review my case details, explain my statutory rights in this situation, and outline what legal steps and inspections JanKam will perform.`;

    const event = new CustomEvent('jankam-open-ai-chat', {
      detail: { initialMessage: aiContext }
    });
    window.dispatchEvent(event);
    
    // Smooth scroll to AI section
    setTimeout(() => {
      const el = document.getElementById('ai-sahayak');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const getPriorityColor = (level: string) => {
    if (level === 'High') return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', text: '#F87171' };
    if (level === 'Medium') return { bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.35)', text: '#F5A623' };
    return { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)', text: '#34D399' };
  };

  const pColor = getPriorityColor(complaint.priorityLevel);

  return (
    <>
      {/* ── Share Modal ── */}
      {shareModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            style={{
              background: '#0F2347',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: '18px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareModalOpen(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'white', fontSize: '1.05rem', marginBottom: '6px' }}>
              Share Case Receipt
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
              Copy the text below to share on WhatsApp, SMS, or other platforms.
            </div>

            <textarea
              id="share-textarea"
              readOnly
              value={shareText}
              rows={10}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.6,
                marginBottom: '14px',
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                id="share-modal-copy"
                onClick={handleCopyFromModal}
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '11px 20px', flex: 1, justifyContent: 'center' }}
              >
                <Copy size={15} />
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{
                  fontSize: '0.9rem', padding: '10px 18px',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                  flex: 1, justifyContent: 'center',
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Card ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(52,211,153,0.35)',
          borderRadius: '20px',
          overflow: 'hidden',
          animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Success Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(16,185,129,0.06))',
            borderBottom: '1px solid rgba(52,211,153,0.2)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.18)',
              border: '2px solid rgba(52,211,153,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            <CheckCircle size={25} style={{ color: '#34D399' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#34D399', fontSize: '1rem' }}>
              Complaint Intake Registered Successfully!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
              Statutory verification and review process initiated.
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div ref={receiptRef} style={{ padding: '24px' }}>
          {/* Complaint ID */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
              marginBottom: '8px', fontFamily: 'Outfit, sans-serif',
            }}>
              Your Complaint Case ID
            </div>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(1.6rem, 6vw, 2.4rem)',
              color: '#F5A623', letterSpacing: '3px', marginBottom: '10px',
            }}>
              {complaint.id}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(52,211,153,0.14)',
                border: '1px solid rgba(52,211,153,0.35)',
                color: '#34D399', fontWeight: 700, fontSize: '0.78rem',
                padding: '4px 16px', borderRadius: '20px', fontFamily: 'Outfit, sans-serif',
              }}>
                {COMPLAINT_STATUS_LABELS[complaint.status]}
              </span>
              <span style={{
                display: 'inline-block',
                background: pColor.bg,
                border: `1px solid ${pColor.border}`,
                color: pColor.text, fontWeight: 700, fontSize: '0.78rem',
                padding: '4px 16px', borderRadius: '20px', fontFamily: 'Outfit, sans-serif',
              }}>
                {complaint.priorityLevel} Priority
              </span>
            </div>
            
            <VectorQRCode complaintId={complaint.id} />
          </div>

          {/* Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '10px', marginBottom: '16px',
          }}>
            {[
              { label: 'Full Name', value: complaint.name },
              { label: 'Mobile Number', value: complaint.mobile },
              { label: 'Email', value: complaint.email || 'Not provided' },
              { label: 'Gender / Age', value: `${complaint.gender} / ${complaint.age} Years` },
              { label: 'Preferred Language', value: complaint.preferredLanguage },
              { label: 'Education Level', value: complaint.educationLevel },
              { label: 'Home State', value: complaint.homeState },
              { label: 'Home District', value: complaint.homeDistrict },
              { label: 'Work State', value: complaint.workState },
              { label: 'Work District', value: complaint.workDistrict },
              { label: 'Company Name', value: complaint.companyName },
              { label: 'Employee ID', value: complaint.employeeId || 'Not provided' },
              { label: 'Industry Sector', value: complaint.industryType },
              { label: 'Worker Type', value: complaint.workerType },
              { label: 'Complaint Type', value: COMPLAINT_TYPE_LABELS[complaint.complaintType] },
              { label: 'Document Type', value: complaint.documentType || 'None uploaded' },
              { label: 'Filed On', value: formatDate(complaint.createdAt) },
            ].map((field) => (
              <div key={field.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '11px 13px',
              }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
                  marginBottom: '4px', fontFamily: 'Outfit, sans-serif',
                }}>
                  {field.label}
                </div>
                <div style={{
                  fontSize: '0.85rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.88)',
                  fontFamily: 'Inter, sans-serif', wordBreak: 'break-word',
                }}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', padding: '14px', marginBottom: '14px',
          }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
              marginBottom: '7px', fontFamily: 'Outfit, sans-serif',
            }}>
              Complaint Case Description
            </div>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
              {complaint.description}
            </p>
          </div>

          {/* Notice */}
          <div style={{
            background: 'rgba(245,166,35,0.06)',
            border: '1px solid rgba(245,166,35,0.18)',
            borderRadius: '10px', padding: '12px 14px',
            fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Inter, sans-serif',
          }}>
            ⚠️ Keep Complaint ID <strong style={{ color: '#F5A623' }}>{complaint.id}</strong> safe. Under the statutory priority system, this case is flagged as <strong style={{ color: pColor.text }}>{complaint.priorityLevel} priority</strong>. Our grievance cell will contact you on <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{complaint.mobile}</strong> within 48 working hours.
          </div>
        </div>

        {/* Dynamic AI Discuss CTA */}
        <div style={{ padding: '0 24px 16px' }}>
          <button
            onClick={handleDiscussWithAI}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245,166,35,0.2) 0%, rgba(245,166,35,0.05) 100%)',
              border: '1.5px solid rgba(245,166,35,0.45)',
              color: '#F5A623',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s, background-color 0.15s',
            }}
            className="hover:scale-[1.01]"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(245,166,35,0.25)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MessageSquare size={16} />
            Discuss this complaint with JanKam AI
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            id="receipt-download-pdf"
            onClick={handleDownloadPDF}
            className="btn-primary"
            style={{ fontSize: '0.87rem', padding: '11px 18px', flex: '1 1 130px' }}
          >
            <Download size={15} />
            Download PDF Summary
          </button>
          <button
            id="receipt-print"
            onClick={handlePrint}
            className="btn-outline"
            style={{ fontSize: '0.87rem', padding: '10px 18px', flex: '1 1 100px' }}
          >
            <Printer size={15} />
            Print Receipt
          </button>
          <button
            id="receipt-share"
            onClick={handleShare}
            className="btn-outline"
            style={{ fontSize: '0.87rem', padding: '10px 18px', flex: '1 1 100px' }}
          >
            <Share2 size={15} />
            Share Case
          </button>
          <button
            id="receipt-new-complaint"
            onClick={onNewComplaint}
            style={{
              fontSize: '0.87rem', padding: '10px 18px', flex: '1 1 150px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
            }}
          >
            <PlusCircle size={15} />
            Start New Submission
          </button>
        </div>
      </div>
    </>
  );
}
