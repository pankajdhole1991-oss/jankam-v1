import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, RotateCcw, Copy, Download, Printer, ChevronRight, Globe, Check,
} from 'lucide-react';
import {
  generateResponse,
  getGreeting,
  type AgentType,
  type ChatMessage,
  type ConversationContext,
  type ComplaintDraft,
  detectLanguage,
  GREETINGS,
  FALLBACKS,
  formatKBResponse,
  formatSalaryResult,
  SAHAYAK_RESPONSES,
} from '../utils/aiEngine';
import { knowledgeBase, type Language } from '../data/knowledgeBase';

// ─────────────────────────────────────────────
// Markdown-like renderer (bold, tables, lists)
// ─────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/---/g, '<hr style="border-color:rgba(255,255,255,0.1);margin:10px 0"/>')
    // Simple table support
    .replace(/\|(.+?)\|\n\|[-| ]+\|\n/g, '<table-header>$1</table-header>')
    .replace(/\| *(.+?) *\| *(.+?) *\|/g, (_, a, b) => `<div style="display:flex;gap:8px;padding:4px 0"><span style="flex:1;color:rgba(255,255,255,0.55);font-size:0.8rem">${a}</span><span style="font-weight:600">${b}</span></div>`);
}

// ─────────────────────────────────────────────
// Complaint Draft Display
// ─────────────────────────────────────────────
function ComplaintDraftCard({ draft }: { draft: ComplaintDraft }) {
  const [activeLang, setActiveLang] = useState<'english' | 'hindi' | 'marathi'>('english');
  const [copied, setCopied] = useState(false);

  const text = draft[activeLang];
  const langLabels = { english: 'English', hindi: 'हिंदी', marathi: 'मराठी' };

  const handleCopy = () => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JanKam_Complaint_${draft.workerName}_${activeLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>JanKam Complaint</title><style>body{font-family:sans-serif;padding:24px;max-width:700px;margin:auto;white-space:pre-wrap;line-height:1.7}</style></head><body onload="window.print()">${text}</body></html>`);
    win.document.close();
  };

  return (
    <div style={{
      background: 'rgba(245,166,35,0.06)',
      border: '1.5px solid rgba(245,166,35,0.3)',
      borderRadius: '14px',
      overflow: 'hidden',
      marginTop: '10px',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(245,166,35,0.1)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(245,166,35,0.2)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#F5A623', fontSize: '0.85rem' }}>
          📄 Complaint Draft
        </div>
        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['english', 'hindi', 'marathi'] as const).map(l => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeLang === l ? '#F5A623' : 'rgba(255,255,255,0.15)',
                background: activeLang === l ? '#F5A623' : 'transparent',
                color: activeLang === l ? '#0A1931' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {langLabels[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Text */}
      <pre style={{
        padding: '16px',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '0.8rem',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        fontFamily: 'Inter, sans-serif',
        maxHeight: '280px',
        overflowY: 'auto',
        margin: 0,
      }}>
        {text}
      </pre>

      {/* Actions */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '8px', flexWrap: 'wrap',
      }}>
        <button onClick={handleCopy} style={draftBtnStyle('#34D399')}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={handleDownload} style={draftBtnStyle('#60A5FA')}>
          <Download size={13} />Download
        </button>
        <button onClick={handlePrint} style={draftBtnStyle('#F5A623')}>
          <Printer size={13} />Print
        </button>
      </div>
    </div>
  );
}

const draftBtnStyle = (color: string) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '7px 14px',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: `1px solid ${color}60`,
  background: `${color}15`,
  color,
  fontFamily: 'Outfit, sans-serif',
} as React.CSSProperties);

// ─────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      alignItems: 'flex-end',
      gap: '8px',
    }}>
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5A623, #D4890A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '0.9rem',
        }}>
          🤖
        </div>
      )}
      <div style={{ maxWidth: '85%' }}>
        <div
          style={{
            padding: isUser ? '12px 16px' : '14px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #F5A623, #D4890A)'
              : 'rgba(255,255,255,0.07)',
            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: isUser ? '#0A1931' : 'rgba(255,255,255,0.92)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
        {msg.draftContent && <ComplaintDraftCard draft={msg.draftContent} />}
        {msg.timestamp && (
          <div style={{
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left',
          }}>
            {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      {isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '0.9rem',
        }}>
          👤
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #F5A623, #D4890A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '0.9rem',
      }}>🤖</div>
      <div style={{
        padding: '14px 18px',
        borderRadius: '18px 18px 18px 4px',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#F5A623',
            animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Follow-Up Questions
// ─────────────────────────────────────────────
function FollowUpChips({ questions, onSelect }: { questions: string[]; onSelect: (q: string) => void }) {
  if (!questions.length) return null;
  const label = detectLanguage(questions[0]) === 'hi' ? 'संबंधित प्रश्न' : detectLanguage(questions[0]) === 'mr' ? 'संबंधित प्रश्न' : 'Related Questions';
  return (
    <div style={{ marginTop: '10px', marginBottom: '16px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            style={{
              padding: '7px 13px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.25)',
              color: '#F5A623',
              fontWeight: 500,
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.08)'; }}
          >
            <ChevronRight size={11} />
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Chat Modal
// ─────────────────────────────────────────────
export interface AgentConfig {
  type: AgentType;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface ChatModalProps {
  agent: AgentConfig;
  onClose: () => void;
  initialMessage?: string;
  contextTopic?: string;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म' },
];

const MAX_MEMORY = 20;

export const TOPIC_GREETINGS: Record<string, Record<Language, { content: string; followUps: string[] }>> = {
  'r-min-wage': {
    en: {
      content: "Welcome! I see you are asking about **Minimum Wages**. Under the Minimum Wages Act, 1948, every worker in Maharashtra has the right to receive state-mandated wages based on skill level and zone. How can I help you today? You can ask me how to check your sector's minimum rate or how to report underpayment.",
      followUps: ['What if I get paid in cash?', 'Latest minimum rates in Pune', 'How to claim salary arrears?']
    },
    hi: {
      content: "स्वागत है! मैं देख रहा हूँ कि आप **न्यूनतम वेतन (Minimum Wage)** के बारे में पूछ रहे हैं। न्यूनतम मजदूरी अधिनियम, 1948 के तहत, महाराष्ट्र में हर कार्यकर्ता को कौशल स्तर और क्षेत्र के आधार पर राज्य द्वारा निर्धारित न्यूनतम वेतन पाने का अधिकार है। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      followUps: ['क्या होगा अगर नकद भुगतान मिले?', 'पुणे में नवीनतम न्यूनतम दरें', 'बकाया वेतन कैसे प्राप्त करें?']
    },
    mr: {
      content: "स्वागत आहे! मी पाहत आहे की आपण **किमान वेतन (Minimum Wage)** बद्दल विचारत आहात. किमान वेतन कायदा, 1948 अंतर्गत, महाराष्ट्रातील प्रत्येक कामगाराला कौशल्य पातळी आणि झोनच्या आधारे राज्याने ठरवून दिलेले किमान वेतन मिळण्याचा अधिकार आहे. आज मी तुम्हाला कशी मदत करू?",
      followUps: ['पैसे रोख स्वरूपात मिळाले तर काय?', 'पुण्यातील नवीन किमान दर', 'थकीत पगार कसा मिळवायचा?']
    }
  },
  'r-overtime': {
    en: {
      content: "Hello! You have opened the **Double Overtime Pay** section. Under the Factories Act / Shops Act, any work done beyond 9 hours a day or 48 hours a week must be compensated at double (2x) the regular wage rate. How can I help you check your overtime dues or file a grievance?",
      followUps: ['How is OT calculated for security guards?', 'Is weekend work overtime?', 'Employer refuses OT pay register']
    },
    hi: {
      content: "नमस्ते! आपने **डबल ओवरटाइम वेतन (Overtime Pay)** अनुभाग खोला है। फैक्ट्री एक्ट / शॉप्स एक्ट के तहत, दिन में 9 घंटे या हफ्ते में 48 घंटे से अधिक काम करने पर सामान्य दर से दोगुना (2x) भुगतान मिलना चाहिए। ओवरटाइम बकाया की गणना या शिकायत के लिए मुझसे पूछें।",
      followUps: ['सिक्योरिटी गार्ड का OT कैसे गिना जाता है?', 'क्या रविवार का काम ओवरटाइम है?', 'नियोक्ता OT रजिस्टर नहीं दिखाता']
    },
    mr: {
      content: "नमस्कार! आपण **डबल ओव्हरटाइम वेतन (Overtime Pay)** विभाग उघडला आहे. फॅक्टरी कायदा / शॉप्स कायद्यांतर्गत, दिवसाला 9 तास किंवा आठवड्याला 48 तासांपेक्षा जास्त काम केल्यास नियमित दराच्या दुप्पट (2x) वेतन मिळायला हवे. ओव्हरटाइमची गणना कशी करावी हे विचारू शकता.",
      followUps: ['सुरक्षा रक्षकाचा OT कसा मोजतात?', 'रविवारचे काम ओव्हरटाइम आहे का?', 'मालक OT रजिस्टर दाखवत नाही']
    }
  },
  'r-safety': {
    en: {
      content: "Hello! Let's talk about **Workplace Health & Safety**. Every worker is entitled to a clean, safe, and hazard-free environment with proper ventilation, drinking water, separate toilets, and free protective gear (PPE). How can I assist you with safety standards or confidential reporting?",
      followUps: ['Are clean toilets mandatory?', 'Can employer charge for safety boots?', 'Report chemical toxic fumes']
    },
    hi: {
      content: "नमस्ते! आइए **कार्यस्थल स्वास्थ्य और सुरक्षा (Workplace Safety)** के बारे में बात करें। हर कर्मचारी एक सुरक्षित, स्वच्छ और खतरा-मुक्त वातावरण पाने का हकदार है। नियोक्ताओं को मुफ्त सुरक्षा उपकरण (PPE) प्रदान करना अनिवार्य है। आप मुझसे सुरक्षा नियमों या गोपनीय रिपोर्टिंग के बारे में पूछ सकते हैं।",
      followUps: ['क्या साफ शौचालय होना अनिवार्य है?', 'क्या सुरक्षा जूतों के पैसे काटे जा सकते हैं?', 'केमिकल धुएं की शिकायत करें']
    },
    mr: {
      content: "नमस्कार! **कार्यस्थळावरील आरोग्य आणि सुरक्षा (Workplace Safety)** बद्दल बोलूया. प्रत्येक कामगाराला सुरक्षित, स्वच्छ आणि धोकेमुक्त वातावरणात काम करण्याचा अधिकार आहे. मोफत सुरक्षा उपकरणे (PPE) देणे मालकांवर बंधनकारक आहे. सुरक्षेचे नियम जाणून घेण्यासाठी विचारा.",
      followUps: ['स्वच्छ शौचालय असणे बंधनकारक आहे का?', 'सुरक्षा बुटांसाठी पगार कापू शकतात का?']
    }
  },
  'r-maternity': {
    en: {
      content: "Welcome! Under the **Maternity Benefit Act**, female employees are legally entitled to 26 weeks of fully paid maternity leave. It is a severe criminal offense to fire a woman or change her job terms due to pregnancy. How can I guide you about maternity leave, job protection, or creche facilities?",
      followUps: ['Am I eligible if contract worker?', 'Can HR reduce my pay on return?', 'Creche rule for companies']
    },
    hi: {
      content: "स्वागत है! **मातृत्व लाभ अधिनियम (Maternity Benefit Act)** के तहत, महिला कर्मचारी 26 सप्ताह के पूर्ण वेतन वाले मातृत्व अवकाश की हकदार हैं। गर्भावस्था के कारण नौकरी से निकालना एक गंभीर अपराध है। मातृत्व अवकाश और सुरक्षा नियमों की जानकारी के लिए पूछें।",
      followUps: ['क्या कॉन्ट्रैक्ट वर्कर भी हकदार हैं?', 'वापसी पर क्या सैलरी कम की जा सकती है?', 'कंपनियों के लिए क्रेश नियम']
    },
    mr: {
      content: "स्वागत आहे! **मातृत्व लाभ कायद्यांतर्गत (Maternity Benefit Act)**, महिला कामगारांना 26 आठवड्यांची पूर्ण पगारी रजा मिळण्याचा कायदेशीर अधिकार आहे. गरोदरपणामुळे कामावरून काढून टाकणे हा गंभीर गुन्हा आहे. मातृत्व रजेचे नियम विचारू शकता.",
      followUps: ['कंत्राटी कामगार पात्र आहेत का?', 'परत आल्यावर पगार कमी करू शकतात का?']
    }
  },
  'r-epf': {
    en: {
      content: "Hello! Let's discuss **Provident Fund (EPF) Security**. Companies with 20+ employees must deduct 12% of basic pay and match it. All contributions go directly to your Universal Account Number (UAN). How can I help you check your EPFO passbook, activate your UAN, or raise a non-deposit complaint?",
      followUps: ['How to check PF balance by SMS?', 'PF deducted but not deposited in passbook', 'What is UAN reactivation?']
    },
    hi: {
      content: "नमस्ते! आइए **भविष्य निधि (EPF) सुरक्षा** के बारे में बात करें। नियोक्ताओं को कर्मचारी के वेतन से 12% काटकर उतना ही हिस्सा स्वयं मिलाकर आपके UAN में जमा करना होता है। आप मुझसे PF बैलेंस चेक करने, UAN एक्टिवेट करने या डिफ़ॉल्ट की शिकायत करने के बारे में पूछ सकते हैं।",
      followUps: ['SMS से PF बैलेंस कैसे देखें?', 'PF काटा गया पर पासबुक में नहीं है', 'UAN री-एक्टिवेट कैसे करें?']
    },
    mr: {
      content: "नमस्कार! **भविष्य निर्वाह निधी (EPF) सुरक्षेबद्दल** जाणून घेऊया. मालकाने तुमच्या पगारातून 12% कापून तितकाच हिस्सा स्वतः मिळवून तुमच्या UAN मध्ये जमा करणे बंधनकारक आहे. PF शिल्लक तपासणे किंवा UAN सुरू करण्याबद्दल माहिती विचारा.",
      followUps: ['SMS द्वारे PF कसा तपासायचा?', 'PF कापला पण पासबुकमध्ये जमा नाही']
    }
  },
  'r-esic': {
    en: {
      content: "Welcome! Under the **Employees' State Insurance (ESIC) Act**, workers earning up to ₹21,000 receive complete medical treatment for themselves and dependants, plus sick leave cash benefits. How can I assist you in getting your e-Pehchaan card or checking your registration status?",
      followUps: ['How to download Pehchaan Card?', 'My ESIC number is not working', 'Free treatment for family dependants']
    },
    hi: {
      content: "स्वागत है! **कर्मचारी राज्य बीमा (ESIC) अधिनियम** के तहत, ₹21,000 तक कमाने वाले कर्मचारी अपने और अपने परिवार के लिए मुफ्त चिकित्सा उपचार और बीमारी की छुट्टी के दौरान नकद लाभ के हकदार हैं। ESIC पंजीकरण या ई-पहचान कार्ड की जानकारी के लिए पूछें।",
      followUps: ['पहचान कार्ड कैसे डाउनलोड करें?', 'मेरा ESIC नंबर काम नहीं कर रहा', 'परिवार के लिए मुफ्त इलाज']
    },
    mr: {
      content: "स्वागत आहे! **कर्मचारी राज्य विमा (ESIC) कायद्यांतर्गत**, ₹21,000 पर्यंत पगार असणारे कामगार स्वतःच्या आणि कुटुंबाच्या मोफत उपचारासाठी पात्र आहेत. ESIC नोंदणी किंवा ई-पहचान कार्डबद्दल माहिती मिळवण्यासाठी विचारा.",
      followUps: ['e-Pehchaan कार्ड कसे डाउनलोड करावे?', 'माझा ESIC नंबर चालत नाही']
    }
  },
  'r-wrongful-term': {
    en: {
      content: "Hello! You have opened the **Wrongful Dismissal Shield** guidance. Employers cannot terminate you arbitrarily without a valid written cause and statutory notice/pay in lieu of notice. How can I help you understand notice periods, retrenchment compensation, or full & final settlements?",
      followUps: ['What is retrenchment compensation?', 'Forced resignation under pressure', 'Full and Final settlement time limit']
    },
    hi: {
      content: "नमस्ते! आपने **गलत बर्खास्तगी संरक्षण (Wrongful Dismissal Shield)** अनुभाग खोला है। कोई भी नियोक्ता आपको बिना वैध लिखित कारण और नोटिस/मुआवजे के नौकरी से नहीं निकाल सकता। नोटिस पीरियड, सेवा समाप्ति हर्जाना या फुल एंड फाइनल सेटलमेंट के नियमों के लिए पूछें।",
      followUps: ['सेवा समाप्ति हर्जाना क्या है?', 'दबाव में जबरन इस्तीफा देना', 'फुल एंड फाइनल भुगतान की समय सीमा']
    },
    mr: {
      content: "नमस्कार! आपण **अयोग्य बडतर्फी संरक्षण (Wrongful Dismissal Shield)** विभागात आहात. कोणताही मालक तुम्हाला कायदेशीर कारणाशिवाय आणि नोटीस/मुआवजा न देता कामावरून काढू शकत नाही. नोटीस कालावधी किंवा हिशोबाच्या नियमांबद्दल विचारा.",
      followUps: ['छटणीची भरपाई काय असते?', 'दबावाखाली जबरदस्ती राजीनामा']
    }
  },
  'r-equal-pay': {
    en: {
      content: "Hello! Under the **Equal Remuneration Act**, paying lower wages to female workers compared to male workers performing identical tasks is strictly illegal. Gender-based wage gaps are prohibited. How can I assist you with wage parity issues or reporting discrimination?",
      followUps: ['Equal wages for sorting workers', 'Gender wage gap in factory', 'How to claim parity arrears?']
    },
    hi: {
      content: "नमस्ते! **समान पारिश्रमिक अधिनियम (Equal Remuneration Act)** के तहत, पुरुष और महिला को समान कार्य के लिए समान वेतन मिलना अनिवार्य है। लिंग के आधार पर वेतन में अंतर गैरकानूनी है। वेतन असमानता या भेदभाव की शिकायत के बारे में पूछें।",
      followUps: ['सॉर्टिंग कर्मचारियों के लिए समान वेतन', 'फैक्ट्री में महिला-पुरुष वेतन अंतर', 'असमान वेतन का दावा कैसे करें?']
    },
    mr: {
      content: "नमस्कार! **समान मानधन कायद्यांतर्गत (Equal Remuneration Act)**, पुरुष आणि महिला कामगारांना समान कामासाठी समान वेतन मिळणे बंधनकारक आहे. लिंगावर आधारित भेदभाव बेकायदेशीर आहे. वेतन असमानतेबद्दल काय करावे ते विचारा.",
      followUps: ['महिला-पुरुष वेतन तफावत', 'समान वेतनाचा दावा कसा करावा?']
    }
  },
  'r-posh': {
    en: {
      content: "Welcome! You are consulting about the **Women Safety & POSH Act**. The law guarantees women a safe, harassment-free workplace and mandates an active Internal Complaints Committee (ICC) in every establishment with 10+ employees. How can I help you report harassment safely and with absolute confidentiality?",
      followUps: ['What is Internal Complaints Committee (ICC)?', 'Can I report anonymously?', 'Harassment by direct supervisor']
    },
    hi: {
      content: "स्वागत है! आप **महिला सुरक्षा और POSH अधिनियम** के बारे में परामर्श कर रहे हैं। कानून महिलाओं को सुरक्षित, उत्पीड़न-मुक्त कार्यस्थल की गारंटी देता है और 10+ कर्मचारियों वाले हर संस्थान में एक आंतरिक शिकायत समिति (ICC) का होना अनिवार्य बनाता है। आप मुझसे पूरी गोपनीयता के साथ मदद ले सकते हैं।",
      followUps: ['आंतरिक शिकायत समिति (ICC) क्या है?', 'क्या मैं गुमनाम शिकायत कर सकती हूँ?', 'सुपरवाइजर द्वारा उत्पीड़न']
    },
    mr: {
      content: "स्वागत आहे! आपण **महिला सुरक्षा आणि POSH कायद्याबद्दल** विचारत आहात. कायदा महिलांना सुरक्षित आणि छळमुक्त कार्यस्थळाची हमी देतो आणि 10+ कामगार असणाऱ्या प्रत्येक संस्थेत अंतर्गत तक्रार समिती (ICC) अनिवार्य करतो. आपण अत्यंत गोपनीयतेने मार्गदर्शन मिळवू शकता.",
      followUps: ['अंतर्गत तक्रार समिती (ICC) काय आहे?', 'मी नाव न सांगता तक्रार करू शकते का?', 'सुपरवायझरकडून होणारा छळ']
    }
  }
};

const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    'How to calculate overtime?',
    'How to file labour complaint?',
    'What is PF eligibility?',
    'Can employer deduct salary?'
  ],
  hi: [
    'ओवरटाइम की गणना कैसे करें?',
    'श्रम शिकायत कैसे दर्ज करें?',
    'PF की पात्रता क्या है?',
    'क्या नियोक्ता सैलरी काट सकता है?'
  ],
  mr: [
    'ओव्हरटाइम कसा मोजावा?',
    'कामगार तक्रार कशी करावी?',
    'PF साठी पात्रता काय आहे?',
    'मालक पगार कापू शकतो का?'
  ]
};

export default function ChatModal({ agent, onClose, initialMessage, contextTopic }: ChatModalProps) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('jankam_session_lang') as Language) || 'en';
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = (localStorage.getItem('jankam_session_lang') as Language) || 'en';
    if (contextTopic && TOPIC_GREETINGS[contextTopic]) {
      const tg = TOPIC_GREETINGS[contextTopic][saved];
      return [{
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: tg.content,
        followUps: tg.followUps,
        timestamp: new Date(),
        language: saved,
        isGreeting: true,
        contextTopic
      } as any];
    }
    const greet = getGreeting(agent.type, saved);
    return [{ ...greet, isGreeting: true } as any];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>(() => {
    const saved = (localStorage.getItem('jankam_session_lang') as Language) || 'en';
    return {
      messages: [],
      collectedData: {},
      language: saved,
    };
  });
  const [lastFollowUps, setLastFollowUps] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input on open, and fire initialMessage if provided
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
    if (initialMessage) {
      setTimeout(() => sendMessage(initialMessage), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Language change — translate entire history instantly and persist selected language
  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('jankam_session_lang', newLang);
    setContext(prev => ({ ...prev, language: newLang }));

    // Map through the messages history and translate every assistant message dynamically!
    setMessages(prev => translateMessagesHistory(prev, newLang, agent.type));
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date(),
      language: detectLanguage(msg),
    };
    setMessages(prev => [...prev, userMsg]);
    setLastFollowUps([]);
    setTyping(true);

    // Trim memory to MAX_MEMORY
    const updatedContext: ConversationContext = {
      ...context,
      messages: [...context.messages, userMsg].slice(-MAX_MEMORY),
      language: detectLanguage(msg) || lang,
    };

    // Simulate slight delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    try {
      const result = await generateResponse(msg, agent.type, updatedContext);
      const assistantMsg: ChatMessage & { intent?: string; kbId?: string; isFallback?: boolean } = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        followUps: result.followUps,
        language: result.language,
        draftContent: result.draftContent,
        calculationResult: result.calculationResult,
        intent: (result as any).intent,
        kbId: (result as any).kbId,
        isFallback: (result as any).isFallback,
      };

      // Dynamic follow-up filtering: exclude questions that the user has already asked in this session
      let filteredFollowUps = result.followUps || [];
      const userQueries = updatedContext.messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase().trim());
      filteredFollowUps = filteredFollowUps.filter(f => !userQueries.includes(f.toLowerCase().trim()));
      assistantMsg.followUps = filteredFollowUps;

      setMessages(prev => [...prev, assistantMsg]);
      setLastFollowUps(filteredFollowUps);
      setContext({
        ...updatedContext,
        messages: [...updatedContext.messages, assistantMsg].slice(-MAX_MEMORY),
        collectedData: updatedContext.collectedData,
        currentFlow: updatedContext.currentFlow,
      });
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    }
    setTyping(false);
  }, [input, agent.type, context, lang]);

  const handleReset = () => {
    const greet = getGreeting(agent.type, lang);
    setMessages([{ ...greet, isGreeting: true } as any]);
    setContext({ messages: [], collectedData: {}, language: lang });
    setLastFollowUps([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            height: '92dvh',
            background: '#0A1931',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'all',
            boxShadow: '0 -20px 80px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0,
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `${agent.color}20`,
              border: `1.5px solid ${agent.color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
            }}>{agent.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
                {agent.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
                🟢 Online · JanKam AI Copilot
              </div>
            </div>

            {/* Language switcher */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  title={`Switch to ${l.label}`}
                  style={{
                    width: '34px', height: '34px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: lang === l.code ? '#F5A623' : 'rgba(255,255,255,0.12)',
                    background: lang === l.code ? '#F5A623' : 'rgba(255,255,255,0.05)',
                    color: lang === l.code ? '#0A1931' : 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              title="Reset conversation"
              onClick={handleReset}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><RotateCcw size={15} /></button>
            <button
              onClick={onClose}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><X size={17} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px', scrollBehavior: 'smooth' }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble msg={msg} />
                {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                  <FollowUpChips questions={msg.followUps} onSelect={(q) => sendMessage(q)} />
                )}
              </div>
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
          }}>
            {/* Quick prompts for complaint agent */}
            {agent.type === 'complaint_draft' && messages.length < 3 && (
              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => sendMessage('start')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'rgba(245,166,35,0.12)',
                    border: '1px solid rgba(245,166,35,0.35)',
                    color: '#F5A623',
                    fontFamily: 'Outfit, sans-serif',
                    width: '100%',
                  }}
                >
                  📄 Start Creating Complaint Draft
                </button>
              </div>
            )}
            {/* Suggested Questions Tray */}
            <div 
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '12px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
            >
              {SUGGESTED_QUESTIONS[lang].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#F5A623',
                    border: '1px solid rgba(245,166,35,0.2)',
                    background: 'rgba(245,166,35,0.06)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(245,166,35,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(245,166,35,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(245,166,35,0.2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'hi' ? 'अपना सवाल टाइप करें...' : lang === 'mr' ? 'तुमचा प्रश्न टाइप करा...' : 'Type your question...'}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#F5A623'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: input.trim() && !typing ? '#F5A623' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: input.trim() && !typing ? '#0A1931' : 'rgba(255,255,255,0.3)',
                  cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <Send size={18} />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
              AI Copilot · Not legal advice · For guidance only · JanKam 2024
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// Multilingual Chat History Translation Mapper
// ─────────────────────────────────────────────
const translateMessagesHistory = (msgs: ChatMessage[], targetLang: Language, agentType: AgentType): ChatMessage[] => {
  return msgs.map(msg => {
    if (msg.role === 'user') return msg;

    // 1. Greeting
    if (msg.id.startsWith('greeting-') || (msg as any).isGreeting) {
      const ctxTopic = (msg as any).contextTopic;
      if (ctxTopic && TOPIC_GREETINGS[ctxTopic]) {
        const tg = TOPIC_GREETINGS[ctxTopic][targetLang];
        return {
          ...msg,
          content: tg.content,
          followUps: tg.followUps,
          language: targetLang,
        };
      }
      const g = getGreeting(agentType, targetLang);
      return {
        ...msg,
        content: g.content,
        followUps: g.followUps,
        language: targetLang,
      };
    }

    // 2. Intent Response
    const intent = (msg as any).intent;
    if (intent && (SAHAYAK_RESPONSES as any)[intent]) {
      const resp = (SAHAYAK_RESPONSES as any)[intent][targetLang];
      return {
        ...msg,
        content: resp.content,
        followUps: resp.followUps,
        language: targetLang,
      };
    }

    // 3. KB Lookup
    const kbId = (msg as any).kbId;
    if (kbId) {
      const entry = knowledgeBase.find(e => e.id === kbId);
      if (entry) {
        const content = formatKBResponse(entry, targetLang);
        const followUps = entry.followUps[targetLang] || entry.followUps.en;
        return {
          ...msg,
          content,
          followUps,
          language: targetLang,
        };
      }
    }

    // 4. Salary calculation
    if (msg.calculationResult) {
      const content = formatSalaryResult(msg.calculationResult, targetLang);
      const followUpsMap = {
        en: ['Is this deduction amount correct?', 'How to check if PF is being deposited?', 'What if my employer pays less than minimum wage?', 'How to calculate overtime pay?'],
        hi: ['क्या यह कटौती राशि सही है?', 'PF जमा हो रहा है या नहीं, कैसे जांचें?', 'ओवरटाइम का भुगतान न हो तो क्या करें?'],
        mr: ['ही कपात रक्कम बरोबर आहे का?', 'PF जमा होत आहे का ते कसे तपासायचे?', 'ओव्हरटाइम न दिल्यास काय करावे?'],
      };
      return {
        ...msg,
        content,
        followUps: followUpsMap[targetLang],
        language: targetLang,
      };
    }

    // 5. Complaint draft success message
    if (msg.draftContent) {
      const successMsg = targetLang === 'hi'
        ? '✅ आपकी शिकायत का मसौदा तैयार है! नीचे तीनों भाषाओं में देखें, कॉपी करें, डाउनलोड करें या प्रिंट करें।'
        : targetLang === 'mr'
        ? '✅ तुमचा तक्रार मसुदा तयार आहे! खाली तिन्ही भाषांमध्ये पाहा, कॉपी करा, डाउनलोड करा किंवा प्रिंट करा.'
        : '✅ Your complaint draft is ready! Review it below in all three languages, then copy, download, or print.';
      const followUps = targetLang === 'hi'
        ? ['क्या मैं इसे सीधे श्रम कार्यालय को भेज सकता हूं?', 'क्या मुझे वकील की जरूरत है?', 'इस शिकायत के लिए क्या दस्तावेज चाहिए?']
        : targetLang === 'mr'
        ? ['मी हे थेट कामगार कार्यालयात पाठवू शकतो का?', 'मला वकिलाची गरज आहे का?', 'या तक्रारीसाठी कोणते कागदपत्र हवे?']
        : ['Can I file this directly at the Labour Office?', 'Do I need a lawyer for this?', 'What documents do I need with this complaint?', 'How long will it take to resolve?'];
      return {
        ...msg,
        content: successMsg,
        followUps,
        language: targetLang,
      };
    }

    // 6. Fallback
    if ((msg as any).isFallback) {
      const agentFollowUps: Record<AgentType, Record<Language, string[]>> = {
        labour_rights: {
          en: ['What is minimum wage in Maharashtra?', 'How many hours can I be made to work?', 'Can my employer deduct salary without reason?', 'What are my leave entitlements?'],
          hi: ['महाराष्ट्र में न्यूनतम वेतन क्या है?', 'कितने घंटे काम करवाया जा सकता है?', 'क्या बिना कारण सैलरी काटी जा सकती है?'],
          mr: ['महाराष्ट्रात किमान वेतन किती आहे?', 'मला किती तास काम करवले जाऊ शकते?'],
        },
        complaint_draft: {
          en: ["Type 'start' to create a complaint draft", 'What information is needed for a complaint?', 'Can I complain against salary delay?'],
          hi: ["'start' टाइप करके शिकायत मसौदा बनाएं", 'शिकायत के लिए क्या जानकारी चाहिए?'],
          mr: ["'start' टाइप करून तक्रार मसुदा तयार करा"],
        },
        salary_verification: {
          en: ['Tell me your basic salary to calculate', 'What deductions are legal?', 'How to calculate overtime pay?'],
          hi: ['गणना के लिए अपनी बेसिक सैलरी बताएं', 'कौन सी कटौतियां कानूनी हैं?'],
          mr: ['गणनासाठी मूळ पगार सांगा', 'कोणती कपात कायदेशीर आहे?'],
        },
        pf_esic: {
          en: ['How to check PF balance?', 'What is UAN?', 'How to get ESIC card?', 'How to withdraw PF?'],
          hi: ['PF बैलेंस कैसे जांचें?', 'UAN क्या है?', 'ESIC कार्ड कैसे मिलेगा?'],
          mr: ['PF शिल्लक कशी तपासायची?', 'UAN म्हणजे काय?'],
        },
        women_safety: {
          en: ['What is the POSH Act?', 'How to file a harassment complaint?', 'What is the women helpline number?'],
          hi: ['POSH अधिनियम क्या है?', 'उत्पीड़न शिकायत कैसे दर्ज करें?'],
          mr: ['POSH कायदा काय आहे?', 'छळाची तक्रार कशी करावी?'],
        },
        legal_guidance: {
          en: ['What is my notice period?', 'Can I resign without notice?', 'What is full and final settlement?'],
          hi: ['मेरी नोटिस अवधि क्या है?', 'क्या बिना नोटिस इस्तीफा दे सकते हैं?'],
          mr: ['माझा नोटीस कालावधी किती आहे?', 'बिना नोटीसने राजीनामा देता येतो का?'],
        },
        sahayak: {
          en: ['Why is my PF not being deducted?', 'How to claim overtime pay?', 'What to do if salary is not paid?'],
          hi: ['मेरा PF क्यों नहीं काटा जा रहा?', 'ओवरटाइम का पैसा कैसे मिलेगा?', 'वेतन न मिले तो क्या करें?'],
          mr: ['माझा PF का कापला जात नाही?', 'ओव्हरटाइम पैसे कसे मिळतील?', 'पगार न मिळाल्यास काय करावे?'],
        },
      };
      return {
        ...msg,
        content: FALLBACKS[targetLang],
        followUps: agentFollowUps[agentType][targetLang],
        language: targetLang,
      };
    }

    return msg;
  });
};
