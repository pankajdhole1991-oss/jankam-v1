// ============================================
// JANKAM — AI ENGINE
// Modular: swap LLM (OpenAI/Gemini/Claude) without redesign
// Currently: rule-based + template engine with context memory
// ============================================

import knowledgeBase, { type Language, type KBEntry } from '../data/knowledgeBase';

export type AgentType =
  | 'labour_rights'
  | 'complaint_draft'
  | 'salary_verification'
  | 'pf_esic'
  | 'women_safety'
  | 'legal_guidance'
  | 'sahayak'; // Unified intent-aware assistant

// ── 10 SAHAYAK INTENT TYPES ──
type SahayakIntent =
  | 'pf'
  | 'esic'
  | 'salary'
  | 'overtime'
  | 'labour_law'
  | 'complaint'
  | 'termination'
  | 'gratuity'
  | 'leave'
  | 'women_safety'
  | 'unknown';

const SAHAYAK_INTENT_KEYWORDS: Record<Exclude<SahayakIntent, 'unknown'>, string[]> = {
  pf: ['pf', 'provident', 'epf', 'uan', 'pension', 'pf balance', 'pf nahi', 'pf kaise', 'pf kuta', 'provident fund', 'epfo', 'पीएफ', 'भविष्य निर्वाह निधी'],
  esic: ['esic', 'esi', 'medical', 'health card', 'pehchan card', 'bimar', 'dawai', 'hospital', 'sickness', 'insurance', 'ईएसआईसी', 'आरोग्य विमा'],
  salary: ['salary', 'salary nahi', 'wage', 'kitna milega', 'ctc', 'pagar', 'pagar nahi', 'वेतन', 'पगार', 'pay slip', 'takehome', 'net salary'],
  overtime: ['overtime', 'ot', 'extra hours', 'double pay', 'ओवरटाइम', 'ओव्हरटाइम', 'extra time', 'additional hours', 'night shift', 'saturday', 'sunday work'],
  labour_law: ['labour law', 'worker rights', 'minimum wage', 'rights', 'nyuntam vetan', 'adhikar', 'कामगार कायदा', 'majdoor', 'kyadon', 'worker protection', 'shops act', 'factories act'],
  complaint: ['complaint', 'file complaint', 'register', 'complain', 'shikayat', 'तक्रार', 'शिकायत', 'file karna', 'case', 'report karna'],
  termination: ['fired', 'dismissed', 'terminated', 'resign', 'notice', 'job gaya', 'naukri gayi', 'nikala', 'बडतर्फी', 'राजीनामा', 'removed', 'layoff', 'retrench', 'ff settlement', 'full final'],
  gratuity: ['gratuity', 'retirement', 'service benefit', 'years service', 'gratuity kab', 'उपदान', 'gratuity kitni', 'payment of gratuity'],
  leave: ['leave', 'छुट्टी', 'casual leave', 'sick leave', 'annual leave', 'earned leave', 'pl', 'cl', 'sl', 'रजा', 'maternity leave', 'holiday', 'dayoff', 'day off'],
  women_safety: ['posh', 'harassment', 'maternity', 'women safety', 'sexual', 'महिला', 'abuse', 'unsafe', 'icc', 'internal complaints', 'she box', 'shebox'],
};

function detectSahayakIntent(message: string): SahayakIntent {
  const lower = message.toLowerCase();
  const scores: Record<Exclude<SahayakIntent, 'unknown'>, number> = {
    pf: 0, esic: 0, salary: 0, overtime: 0, labour_law: 0,
    complaint: 0, termination: 0, gratuity: 0, leave: 0, women_safety: 0,
  };
  for (const [intent, keywords] of Object.entries(SAHAYAK_INTENT_KEYWORDS) as [Exclude<SahayakIntent, 'unknown'>, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[intent] += kw.length > 4 ? 3 : 1;
    }
  }
  // Also detect salary by number pattern
  if (/\d{4,6}/.test(message) && !scores.pf && !scores.gratuity) scores.salary += 2;
  const best = (Object.entries(scores) as [Exclude<SahayakIntent, 'unknown'>, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a), ['labour_law', 0] as [Exclude<SahayakIntent, 'unknown'>, number]
  );
  return best[1] > 0 ? best[0] : 'unknown';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  followUps?: string[];
  language?: Language;
  draftContent?: ComplaintDraft;
  calculationResult?: SalaryCalcResult;
}

export interface ComplaintDraft {
  english: string;
  hindi: string;
  marathi: string;
  workerName: string;
  companyName: string;
  district: string;
  issueType: string;
  description: string;
}

export interface SalaryCalcResult {
  basicSalary: number;
  da: number;
  hra: number;
  gross: number;
  pfEmployee: number;
  pfEmployer: number;
  esicEmployee: number;
  esicEmployer: number;
  totalDeductions: number;
  netTakeHome: number;
  overtimePay?: number;
  overtimeHours?: number;
}

// ── LANGUAGE DETECTION ──
const HINDI_PATTERN = /[\u0900-\u097F]/;
const MARATHI_WORDS = ['माझा', 'माझी', 'आहे', 'आणि', 'नाही', 'कसे', 'काय', 'केले', 'मिळाले', 'करा', 'सांगा', 'तुम्ही', 'मला'];
const HINDI_WORDS = ['मेरा', 'मेरी', 'है', 'और', 'नहीं', 'कैसे', 'क्या', 'बताओ', 'करो', 'तुम', 'मुझे', 'हमें', 'नौकरी', 'वेतन'];

export function detectLanguage(text: string): Language {
  if (!HINDI_PATTERN.test(text)) return 'en';
  const lower = text;
  let marathiScore = 0;
  let hindiScore = 0;
  MARATHI_WORDS.forEach(w => { if (lower.includes(w)) marathiScore++; });
  HINDI_WORDS.forEach(w => { if (lower.includes(w)) hindiScore++; });
  if (marathiScore > hindiScore) return 'mr';
  return 'hi';
}

// ── KEYWORD MATCHING ──
function findRelevantEntry(query: string, agentType: AgentType): KBEntry | null {
  const lowerQuery = query.toLowerCase();

  // Agent-specific bias
  const agentBias: Record<AgentType, string[]> = {
    labour_rights: ['minimum_wage', 'overtime', 'leave', 'bonus', 'termination', 'salary_delay'],
    complaint_draft: ['salary_delay', 'termination', 'minimum_wage', 'overtime'],
    salary_verification: ['overtime', 'minimum_wage', 'salary_delay'],
    pf_esic: ['pf', 'esic', 'maternity'],
    women_safety: ['women_safety', 'maternity'],
    legal_guidance: ['termination', 'resignation', 'gratuity', 'bonus'],
    sahayak: ['minimum_wage', 'pf', 'esic', 'overtime', 'termination', 'women_safety'],
  };

  const biasedIds = agentBias[agentType];

  // Try keywords first
  let bestMatch: KBEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lowerQuery.includes(kw.toLowerCase())) score += 2;
    }
    // Boost for agent-biased topics
    if (biasedIds.includes(entry.id)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Fallback to agent's primary topic
  if (bestScore === 0) {
    const primaryId = biasedIds[0];
    return knowledgeBase.find(e => e.id === primaryId) || null;
  }

  return bestMatch;
}

// ── NUMBER EXTRACTION ──
function extractNumbers(text: string): number[] {
  const matches = text.match(/[\d,]+(\.\d+)?/g) || [];
  return matches.map(m => parseFloat(m.replace(/,/g, ''))).filter(n => !isNaN(n) && n > 0);
}

// ── SALARY CALCULATION ──
function calculateSalary(basicSalary: number, overtimeHours = 0): SalaryCalcResult {
  const da = Math.round(basicSalary * 0.12);
  const hra = Math.round(basicSalary * 0.15);
  const gross = basicSalary + da + hra;
  const pfBase = basicSalary + da;
  const pfEmployee = Math.round(pfBase * 0.12);
  const pfEmployer = Math.round(pfBase * 0.12);
  const esicEmployee = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  const esicEmployer = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
  const totalDeductions = pfEmployee + esicEmployee;
  const netTakeHome = gross - totalDeductions;
  const overtimePay = overtimeHours > 0
    ? Math.round((pfBase / 26 / 8) * 2 * overtimeHours)
    : undefined;
  return { basicSalary, da, hra, gross, pfEmployee, pfEmployer, esicEmployee, esicEmployer, totalDeductions, netTakeHome, overtimePay, overtimeHours: overtimeHours || undefined };
}

// ── CONTEXT MEMORY INTERFACE ──
export interface ConversationContext {
  messages: ChatMessage[];
  collectedData: Record<string, string | number>;
  currentFlow?: string;
  language: Language;
}

// ── COMPLAINT DRAFT GENERATION ──
function generateComplaintDraft(data: Record<string, string | number>): ComplaintDraft {
  const { workerName = '[Worker Name]', companyName = '[Company]', district = '[District]', issueType = 'Labour Violation', description = '[Description of issue]' } = data;
  const date = new Date().toLocaleDateString('en-IN');

  const english = `TO,
The District Labour Officer,
${district} District Labour Office,
Maharashtra.

SUBJECT: Complaint Against ${companyName} — ${issueType}

Respected Sir/Madam,

I, ${workerName}, am a worker employed at ${companyName}, ${district}, Maharashtra. I am writing to bring to your urgent attention the following violation of my labour rights:

DETAILS OF COMPLAINT:
${description}

This situation is a clear violation of Indian Labour Laws including the Payment of Wages Act, 1936 / Factories Act, 1948 / Industrial Disputes Act, 1947 (as applicable).

I humbly request your office to:
1. Investigate this matter immediately
2. Direct the employer to comply with applicable laws
3. Ensure I receive all dues and protections under the law

I am willing to cooperate fully with any inquiry or proceedings.

Date: ${date}

Yours faithfully,
${workerName}
Contact: [Your Mobile Number]
Address: [Your Address], ${district}, Maharashtra`;

  const hindi = `सेवा में,
जिला श्रम अधिकारी,
${district} जिला श्रम कार्यालय,
महाराष्ट्र।

विषय: ${companyName} के विरुद्ध शिकायत — ${issueType}

मान्यवर,

मैं, ${workerName}, ${companyName}, ${district}, महाराष्ट्र में कार्यरत हूं। मैं आपके संज्ञान में निम्नलिखित श्रम अधिकारों का उल्लंघन लाना चाहता/चाहती हूं:

शिकायत का विवरण:
${description}

यह स्थिति भारतीय श्रम कानूनों का स्पष्ट उल्लंघन है।

मैं विनम्र निवेदन करता/करती हूं कि:
1. इस मामले की तत्काल जांच की जाए
2. नियोक्ता को कानूनों का पालन करने का निर्देश दिया जाए
3. मुझे कानून के तहत सभी देय राशि और सुरक्षा सुनिश्चित की जाए

दिनांक: ${date}

भवदीय,
${workerName}
संपर्क: [आपका मोबाइल नंबर]
पता: ${district}, महाराष्ट्र`;

  const marathi = `सेवेत,
जिल्हा कामगार अधिकारी,
${district} जिल्हा कामगार कार्यालय,
महाराष्ट्र.

विषय: ${companyName} विरुद्ध तक्रार — ${issueType}

मान्यवर,

मी, ${workerName}, ${companyName}, ${district}, महाराष्ट्र येथे कामगार म्हणून कार्यरत आहे. माझ्या श्रम अधिकारांचे खालीलप्रमाणे उल्लंघन झाल्याचे आपल्या निदर्शनास आणून देत आहे:

तक्रारीचे तपशील:
${description}

ही परिस्थिती भारतीय कामगार कायद्यांचे स्पष्ट उल्लंघन आहे.

मी नम्रपणे विनंती करतो/करते की:
1. या प्रकरणाची त्वरित चौकशी करावी
2. नियोक्त्याला कायद्यांचे पालन करण्यास निर्देश द्यावेत
3. माझे सर्व हक्क सुनिश्चित करावेत

दिनांक: ${date}

आपला विश्वासू,
${workerName}
संपर्क: [तुमचा मोबाइल क्रमांक]
पत्ता: ${district}, महाराष्ट्र`;

  return {
    english, hindi, marathi,
    workerName: String(workerName),
    companyName: String(companyName),
    district: String(district),
    issueType: String(issueType),
    description: String(description),
  };
}

// ── COMPLAINT FLOW STATE MACHINE ──
const COMPLAINT_FLOW_STEPS = ['worker_name', 'company_name', 'district', 'issue_type', 'description'];

const COMPLAINT_PROMPTS: Record<string, { en: string; hi: string; mr: string }> = {
  worker_name: {
    en: "Let's create your complaint draft. First, please tell me your **full name**.",
    hi: 'आपकी शिकायत का मसौदा तैयार करते हैं। सबसे पहले, अपना **पूरा नाम** बताएं।',
    mr: 'तुमचा तक्रार मसुदा तयार करूया. प्रथम, तुमचे **पूर्ण नाव** सांगा.',
  },
  company_name: {
    en: 'Got it! Now, what is the **company or employer name** you want to complain against?',
    hi: 'समझ गया! अब बताएं, किस **कंपनी या नियोक्ता** के खिलाफ शिकायत करनी है?',
    mr: 'समजले! आता सांगा, कोणत्या **कंपनी किंवा नियोक्त्या**विरुद्ध तक्रार करायची आहे?',
  },
  district: {
    en: 'Which **district** in Maharashtra are you working in?',
    hi: 'आप महाराष्ट्र के किस **जिले** में काम करते हैं?',
    mr: 'तुम्ही महाराष्ट्रातील कोणत्या **जिल्ह्यात** काम करता?',
  },
  issue_type: {
    en: 'What is the **type of issue**? (e.g., Salary not paid, Overtime not given, Wrongful termination, PF not deposited, Harassment)',
    hi: '**समस्या का प्रकार** क्या है? (उदाहरण: वेतन नहीं मिला, ओवरटाइम नहीं दिया, गलत बर्खास्तगी, PF जमा नहीं, उत्पीड़न)',
    mr: '**समस्येचा प्रकार** काय आहे? (उदा: पगार मिळाला नाही, ओव्हरटाइम दिला नाही, चुकीची बडतर्फी, PF जमा नाही)',
  },
  description: {
    en: 'Please describe your complaint in detail — **what happened, when, and how it affected you**. The more detail, the stronger your complaint.',
    hi: 'कृपया अपनी शिकायत विस्तार से बताएं — **क्या हुआ, कब हुआ और इसने आपको कैसे प्रभावित किया**। जितना अधिक विवरण, उतनी मजबूत शिकायत।',
    mr: 'कृपया तुमची तक्रार तपशीलवार सांगा — **काय झाले, केव्हा झाले आणि त्याचा तुमच्यावर काय परिणाम झाला**.',
  },
};

// ── AGENT GREETING TEMPLATES ──
export const GREETINGS: Record<AgentType, { en: string; hi: string; mr: string }> = {
  labour_rights: {
    en: "Hello! I'm your **Labour Rights Agent**. I can help you understand your rights regarding minimum wage, overtime, working hours, leave entitlements, and more. What would you like to know?",
    hi: 'नमस्ते! मैं आपका **श्रम अधिकार एजेंट** हूं। न्यूनतम वेतन, ओवरटाइम, कार्य घंटे, छुट्टी के अधिकारों में मैं आपकी मदद कर सकता हूं। क्या जानना चाहते हैं?',
    mr: 'नमस्कार! मी तुमचा **कामगार अधिकार एजंट** आहे. किमान वेतन, ओव्हरटाइम, कामाचे तास, रजा अधिकार यात मी मदत करतो. काय जाणून घ्यायचे आहे?',
  },
  complaint_draft: {
    en: "Hello! I'm your **Complaint Draft Agent**. I'll help you create a professional complaint letter in English, Hindi, and Marathi. Type **'start'** to begin, or ask me anything about the complaint process.",
    hi: "नमस्ते! मैं आपका **शिकायत मसौदा एजेंट** हूं। मैं आपको अंग्रेजी, हिंदी और मराठी में पेशेवर शिकायत पत्र बनाने में मदद करूंगा। शुरू करने के लिए **'start'** टाइप करें।",
    mr: "नमस्कार! मी तुमचा **तक्रार मसुदा एजंट** आहे. इंग्रजी, हिंदी आणि मराठीत व्यावसायिक तक्रार पत्र तयार करण्यात मी मदत करतो. सुरू करण्यासाठी **'start'** टाइप करा.",
  },
  salary_verification: {
    en: "Hello! I'm your **Salary Verification Agent**. Tell me your **basic salary** and I'll calculate your correct take-home pay, PF, ESIC, and overtime entitlements.",
    hi: 'नमस्ते! मैं आपका **वेतन सत्यापन एजेंट** हूं। अपनी **बेसिक सैलरी** बताएं और मैं आपका सही टेक-होम, PF, ESIC और ओवरटाइम की गणना करूंगा।',
    mr: 'नमस्कार! मी तुमचा **वेतन सत्यापन एजंट** आहे. तुमचा **मूळ पगार** सांगा आणि मी योग्य take-home, PF, ESIC आणि ओव्हरटाइम मोजतो.',
  },
  pf_esic: {
    en: "Hello! I'm your **PF & ESIC Agent**. I can help you with Provident Fund balance, withdrawal, UAN activation, ESIC card, and benefits. What do you need help with?",
    hi: 'नमस्ते! मैं आपका **PF और ESIC एजेंट** हूं। PF बैलेंस, निकासी, UAN सक्रियण, ESIC कार्ड में मदद करूंगा। क्या जानना है?',
    mr: 'नमस्कार! मी तुमचा **PF आणि ESIC एजंट** आहे. PF शिल्लक, काढणे, UAN सक्रियीकरण, ESIC कार्डबद्दल मदत करतो. काय जाणून घ्यायचे?',
  },
  women_safety: {
    en: "Hello! I'm your **Women Safety Agent**. This is a safe, confidential space. I can help you understand POSH rights, workplace harassment reporting, and safety resources. How can I help you today?",
    hi: 'नमस्ते! मैं आपकी **महिला सुरक्षा एजेंट** हूं। यह एक सुरक्षित, गोपनीय जगह है। POSH अधिकार, कार्यस्थल उत्पीड़न रिपोर्टिंग में मदद कर सकती हूं।',
    mr: 'नमस्कार! मी तुमची **महिला सुरक्षा एजंट** आहे. हे एक सुरक्षित, गोपनीय ठिकाण आहे. POSH अधिकार, कामगार सुरक्षेबद्दल मदत करतो.',
  },
  legal_guidance: {
    en: "Hello! I'm your **Legal Guidance Agent**. I can help you understand resignation rights, termination laws, labour court procedures, and full & final settlement. What legal issue can I help with?",
    hi: 'नमस्ते! मैं आपका **कानूनी मार्गदर्शन एजेंट** हूं। इस्तीफे के अधिकार, बर्खास्तगी कानून, श्रम न्यायालय प्रक्रिया में मदद करूंगा।',
    mr: 'नमस्कार! मी तुमचा **कायदेशीर मार्गदर्शन एजंट** आहे. राजीनामा अधिकार, बडतर्फी कायदे, कामगार न्यायालय प्रक्रियेबद्दल मदत करतो.',
  },
  sahayak: {
    en: "Hello! I'm your **JanKam Labour Assistant**. How can I help you today?",
    hi: 'नमस्ते! मैं आपका **JanKam Labour Assistant** हूं। आज मैं आपकी क्या मदद कर सकता हूं?',
    mr: 'नमस्कार! मी तुमचा **JanKam Labour Assistant** आहे. आज मी तुम्हाला कशी मदत करू शकतो?',
  },
};

// ── FALLBACK RESPONSES ──
export const FALLBACKS: Record<Language, string> = {
  en: "I understand your question. Based on Maharashtra labour law, workers have strong protections. Could you provide more details about your specific situation? For example — are you asking about salary, PF, leave, or a workplace issue? I'll give you precise guidance.",
  hi: 'मैं आपका प्रश्न समझता/समझती हूं। महाराष्ट्र श्रम कानून के अनुसार श्रमिकों को मजबूत सुरक्षा मिली है। क्या आप अपनी विशेष स्थिति के बारे में अधिक जानकारी दे सकते हैं? उदाहरण — वेतन, PF, छुट्टी, या कार्यस्थल समस्या?',
  mr: 'मला तुमचा प्रश्न समजतो. महाराष्ट्र कामगार कायद्यानुसार कामगारांना मजबूत संरक्षण आहे. तुमच्या विशिष्ट परिस्थितीबद्दल अधिक माहिती देऊ शकता का? उदाहरण — पगार, PF, रजा किंवा कामाच्या ठिकाणची समस्या?',
};

// ── FORMAT KNOWLEDGE BASE RESPONSE ──
export function formatKBResponse(entry: KBEntry, lang: Language): string {
  const data = entry[lang];
  const stepsLabel = lang === 'hi' ? 'आपको क्या करना चाहिए' : lang === 'mr' ? 'तुम्ही काय करावे' : 'What You Should Do';
  const steps = data.steps.map((s, i) => `**${i + 1}.** ${s}`).join('\n');
  return `**${entry.topic}**\n\n${data.summary}\n\n${data.detail}\n\n---\n**${stepsLabel}:**\n${steps}`;
}

// ── FORMAT SALARY RESULT ──
export function formatSalaryResult(result: SalaryCalcResult, lang: Language): string {
  const r = result;
  if (lang === 'hi') {
    return `**आपकी वेतन गणना:**

| विवरण | राशि |
|---|---|
| मूल वेतन | ₹${r.basicSalary.toLocaleString('en-IN')} |
| DA (12%) | ₹${r.da.toLocaleString('en-IN')} |
| HRA (15%) | ₹${r.hra.toLocaleString('en-IN')} |
| **कुल (Gross)** | **₹${r.gross.toLocaleString('en-IN')}** |
| PF कटौती (कर्मचारी 12%) | -₹${r.pfEmployee.toLocaleString('en-IN')} |
| ESIC कटौती (0.75%) | -₹${r.esicEmployee.toLocaleString('en-IN')} |
| **नेट टेक-होम** | **₹${r.netTakeHome.toLocaleString('en-IN')}** |

नियोक्ता का PF योगदान: ₹${r.pfEmployer.toLocaleString('en-IN')} (आपके PF खाते में जाता है)
${r.overtimePay ? `\n**ओवरटाइम (${r.overtimeHours} घंटे): ₹${r.overtimePay.toLocaleString('en-IN')}**` : ''}`;
  }
  if (lang === 'mr') {
    return `**तुमची वेतन गणना:**

| तपशील | रक्कम |
|---|---|
| मूळ पगार | ₹${r.basicSalary.toLocaleString('en-IN')} |
| DA (12%) | ₹${r.da.toLocaleString('en-IN')} |
| HRA (15%) | ₹${r.hra.toLocaleString('en-IN')} |
| **एकूण (Gross)** | **₹${r.gross.toLocaleString('en-IN')}** |
| PF कपात (कर्मचारी 12%) | -₹${r.pfEmployee.toLocaleString('en-IN')} |
| ESIC कपात (0.75%) | -₹${r.esicEmployee.toLocaleString('en-IN')} |
| **निव्वळ Take-Home** | **₹${r.netTakeHome.toLocaleString('en-IN')}** |

नियोक्त्याचे PF योगदान: ₹${r.pfEmployer.toLocaleString('en-IN')}
${r.overtimePay ? `\n**ओव्हरटाइम (${r.overtimeHours} तास): ₹${r.overtimePay.toLocaleString('en-IN')}**` : ''}`;
  }
  return `**Your Salary Breakdown:**

| Item | Amount |
|---|---|
| Basic Salary | ₹${r.basicSalary.toLocaleString('en-IN')} |
| DA (12%) | ₹${r.da.toLocaleString('en-IN')} |
| HRA (15%) | ₹${r.hra.toLocaleString('en-IN')} |
| **Gross Salary** | **₹${r.gross.toLocaleString('en-IN')}** |
| PF Deduction (Employee 12%) | -₹${r.pfEmployee.toLocaleString('en-IN')} |
| ESIC Deduction (0.75%) | -₹${r.esicEmployee.toLocaleString('en-IN')} |
| **Net Take-Home** | **₹${r.netTakeHome.toLocaleString('en-IN')}** |

Employer PF contribution: ₹${r.pfEmployer.toLocaleString('en-IN')} (goes to your PF account)
${r.overtimePay ? `\n**Overtime Pay (${r.overtimeHours} hours): ₹${r.overtimePay.toLocaleString('en-IN')}**` : ''}`;
}

// ── 10 SAHAYAK INTENT RESPONSE TEMPLATES ──
export const SAHAYAK_RESPONSES: Record<Exclude<SahayakIntent, 'unknown'>, Record<Language, { content: string; followUps: string[] }>> = {
  pf: {
    en: {
      content: `**Provident Fund (PF/EPF) — Your Rights**

Every employer with 20+ employees MUST register under EPFO and deduct 12% PF from your basic salary. They must also contribute 12% from their side.

**Key Facts:**
- Your UAN (Universal Account Number) is linked to your PF account
- You can check balance at **epfindia.gov.in** or via UMANG app
- PF becomes fully withdrawable after 2 months of unemployment
- If employer is not depositing PF → file complaint at EPFO Regional Office

**If your employer is not deducting PF:**
This is a criminal offence under the EPF & MP Act, 1952. File a complaint at your nearest EPFO office or at **epfindia.gov.in/site_en/Grievance.php**`,
      followUps: ['How to check PF balance online?', 'How to withdraw PF after leaving job?', 'Can employer stop PF deduction?', 'What is UAN and how to activate it?', 'PF not deposited — where to complain?'],
    },
    hi: {
      content: `**प्रोविडेंट फंड (PF/EPF) — आपके अधिकार**

20+ कर्मचारियों वाले हर नियोक्ता को EPFO में रजिस्टर करना और आपकी बेसिक सैलरी का 12% PF काटना अनिवार्य है। नियोक्ता को भी 12% अपनी ओर से देना होता है।

**मुख्य जानकारी:**
- आपका UAN नंबर आपके PF खाते से जुड़ा है
- **epfindia.gov.in** या UMANG ऐप से बैलेंस देखें
- नौकरी छोड़ने के 2 महीने बाद PF निकाल सकते हैं
- अगर नियोक्ता PF जमा नहीं कर रहा → EPFO में शिकायत करें

**PF नहीं काटा जा रहा तो:**
यह EPF & MP Act, 1952 के तहत अपराध है। EPFO क्षेत्रीय कार्यालय में या **epfindia.gov.in** पर शिकायत दर्ज करें।`,
      followUps: ['PF बैलेंस ऑनलाइन कैसे देखें?', 'नौकरी छोड़ने के बाद PF कैसे निकालें?', 'क्या नियोक्ता PF कटौती रोक सकता है?', 'UAN क्या है और कैसे एक्टिवेट करें?'],
    },
    mr: {
      content: `**भविष्य निर्वाह निधी (PF/EPF) — तुमचे हक्क**

20+ कर्मचारी असलेल्या प्रत्येक नियोक्त्याने EPFO मध्ये नोंदणी करणे आणि तुमच्या मूळ पगाराच्या 12% PF कापणे बंधनकारक आहे.

**महत्वाची माहिती:**
- तुमचा UAN नंबर तुमच्या PF खात्याशी जोडलेला आहे
- **epfindia.gov.in** किंवा UMANG ऐपवर शिल्लक तपासा
- नोकरी सोडल्यानंतर 2 महिन्यांनी PF काढता येतो
- नियोक्ता PF जमा करत नसेल → EPFO कार्यालयात तक्रार करा`,
      followUps: ['PF शिल्लक ऑनलाइन कशी तपासायची?', 'नोकरी सोडल्यानंतर PF कसे काढायचे?', 'नियोक्ता PF कपात थांबवू शकतो का?', 'UAN म्हणजे काय आणि ते कसे सक्रिय करायचे?'],
    },
  },
  esic: {
    en: {
      content: `**ESIC — Employee State Insurance Corporation**

All employees earning ≤ ₹21,000/month are covered under ESIC. Your employer must register you and contribute to ESIC.

**Benefits covered:**
- Medical treatment for you AND your family
- Cash benefit during sickness (70% of wages for up to 91 days)
- Maternity benefit (100% wages for 26 weeks)
- Disability benefit if injured at work
- Funeral expenses

**How to access:**
- Get your ESIC IP number and Pehchan Card from your employer
- Visit any ESIC dispensary with your Pehchan Card
- ESIC helpline: **1800-11-2526** (toll free)`,
      followUps: ['How to get ESIC card?', 'Which hospitals accept ESIC?', 'How to claim sickness benefit?', 'What is maternity benefit under ESIC?', 'Employer not enrolled in ESIC — what to do?'],
    },
    hi: {
      content: `**ESIC — कर्मचारी राज्य बीमा निगम**

₹21,000/माह तक कमाने वाले सभी कर्मचारी ESIC के अंतर्गत आते हैं। नियोक्ता को आपको रजिस्टर करना अनिवार्य है।

**लाभ:**
- आप और परिवार का मुफ्त इलाज
- बीमारी में 91 दिन तक 70% वेतन नकद
- मातृत्व लाभ — 26 सप्ताह 100% वेतन
- कार्यस्थल दुर्घटना में विकलांगता लाभ

**कैसे उपयोग करें:**
- नियोक्ता से ESIC IP नंबर और पहचान कार्ड लें
- पहचान कार्ड के साथ ESIC डिस्पेंसरी जाएं
- ESIC हेल्पलाइन: **1800-11-2526**`,
      followUps: ['ESIC कार्ड कैसे मिलेगा?', 'ESIC में कौन से हॉस्पिटल शामिल हैं?', 'बीमारी का दावा कैसे करें?', 'नियोक्ता ESIC में रजिस्टर न करे तो क्या करें?'],
    },
    mr: {
      content: `**ESIC — कर्मचारी राज्य विमा महामंडळ**

₹21,000/महिन्यापर्यंत कमाई करणारे सर्व कर्मचारी ESIC अंतर्गत येतात. नियोक्त्याने तुम्हाला नोंदणी करणे बंधनकारक आहे.

**लाभ:**
- तुम्ही आणि कुटुंबासाठी मोफत उपचार
- आजारपणात 91 दिवसांपर्यंत 70% वेतन
- मातृत्व लाभ — 26 आठवडे 100% वेतन

**ESIC हेल्पलाइन: 1800-11-2526**`,
      followUps: ['ESIC कार्ड कसे मिळवायचे?', 'ESIC मध्ये कोणते रुग्णालय समाविष्ट आहेत?', 'नियोक्ता ESIC नोंदणी न करता तर काय करायचे?'],
    },
  },
  salary: {
    en: {
      content: `**Salary Rights — What You're Entitled To**

Your employer MUST pay your full salary on time every month. Illegal deductions or delayed payment is a violation.

**Legal protections:**
- Salary must be paid by 7th of every month (factories/establishments with 1000+ workers: by 10th)
- Deductions can only be for: PF, ESIC, advance loan, tax (TDS) — nothing else without written consent
- Minimum wage must be paid as per Maharashtra Government notification
- Salary slip is mandatory — you have the right to demand it

**If salary is withheld or delayed:**
1. Give written notice to employer
2. File complaint at **Labour Commissioner's Office**
3. File at Payment of Wages Authority (Section 15, POW Act 1936)

You can also use our **Worker Tools** section to calculate exactly what you should receive.`,
      followUps: ['What is current minimum wage in Maharashtra?', 'Employer not giving salary slip — what to do?', 'Salary deducted without reason — is it legal?', 'How to calculate overtime pay?', 'Where to complain about salary delay?'],
    },
    hi: {
      content: `**वेतन अधिकार — आपको क्या मिलना चाहिए**

नियोक्ता को हर महीने समय पर पूरा वेतन देना अनिवार्य है।

**कानूनी सुरक्षा:**
- वेतन हर महीने 7 तारीख तक देना होगा
- केवल PF, ESIC, अग्रिम ऋण, TDS — और कुछ नहीं काट सकते (लिखित सहमति के बिना)
- महाराष्ट्र सरकार द्वारा निर्धारित न्यूनतम वेतन देना अनिवार्य
- वेतन पर्ची (Salary Slip) देना जरूरी है

**अगर वेतन रोका या देरी हो:**
1. नियोक्ता को लिखित नोटिस दें
2. श्रम आयुक्त कार्यालय में शिकायत करें
3. मजदूरी भुगतान अधिनियम की धारा 15 के तहत शिकायत करें`,
      followUps: ['महाराष्ट्र में न्यूनतम वेतन क्या है?', 'वेतन पर्ची न दे तो क्या करें?', 'बिना कारण वेतन काटा — क्या यह कानूनी है?', 'वेतन देरी के बारे में कहां शिकायत करें?'],
    },
    mr: {
      content: `**वेतन हक्क — तुम्हाला काय मिळायला हवे**

नियोक्त्याने दरमहा वेळेवर पूर्ण वेतन देणे बंधनकारक आहे.

**कायदेशीर संरक्षण:**
- वेतन दर महिन्याच्या 7 तारखेपर्यंत द्यावे
- फक्त PF, ESIC, आगाऊ कर्ज, TDS — लेखी संमतीशिवाय इतर काही कापता येत नाही
- महाराष्ट्र शासनाने निश्चित केलेले किमान वेतन द्यावेच लागते
- वेतन चिठ्ठी (Salary Slip) देणे बंधनकारक आहे`,
      followUps: ['महाराष्ट्रात किमान वेतन किती आहे?', 'वेतन चिठ्ठी न दिल्यास काय करावे?', 'वेतन विलंबाबद्दल कुठे तक्रार करावी?'],
    },
  },
  overtime: {
    en: {
      content: `**Overtime Rights — You Deserve Double Pay**

Under the Factories Act, 1948 and Maharashtra Shops & Establishments Act, 2017:

**The Law:**
- Normal working hours: 9 hours/day, 48 hours/week
- Work beyond 9 hours/day OR 48 hours/week = OVERTIME
- Overtime must be paid at **DOUBLE the normal wage rate**
- Maximum overtime: 50 hours per quarter
- Overtime register must be maintained by employer

**Calculation:**
Overtime Pay = (Basic + DA) ÷ 26 days ÷ 8 hours × 2 × overtime hours

**If overtime not paid:**
1. Give written notice to employer
2. File complaint at District Labour Office
3. Use our Worker Tools calculator to compute exact amount

You can also use the **Overtime Calculator** in our Worker Tools section.`,
      followUps: ['How to calculate overtime pay?', 'Can employer force overtime?', 'Overtime not paid — where to complain?', 'Is Sunday work considered overtime?', 'Night shift allowance rules?'],
    },
    hi: {
      content: `**ओवरटाइम अधिकार — आपको दोगुना वेतन मिलना चाहिए**

फैक्ट्रीज अधिनियम, 1948 और महाराष्ट्र दुकान एवं प्रतिष्ठान अधिनियम के अनुसार:

**कानून:**
- सामान्य काम के घंटे: दिन में 9 घंटे, सप्ताह में 48 घंटे
- 9 घंटे/दिन या 48 घंटे/सप्ताह से अधिक काम = ओवरटाइम
- ओवरटाइम का भुगतान **सामान्य दर का दोगुना** होना चाहिए

**गणना:**
ओवरटाइम वेतन = (बेसिक + DA) ÷ 26 ÷ 8 × 2 × ओवरटाइम घंटे`,
      followUps: ['ओवरटाइम वेतन कैसे गणना करें?', 'क्या नियोक्ता जबरदस्ती ओवरटाइम करवा सकता है?', 'ओवरटाइम न दे तो कहां शिकायत करें?'],
    },
    mr: {
      content: `**ओव्हरटाइम हक्क — तुम्हाला दुप्पट पगार मिळायला हवा**

कारखाने अधिनियम, 1948 नुसार:
- सामान्य कामाचे तास: दिवसाला 9 तास, आठवड्याला 48 तास
- यापेक्षा जास्त काम = ओव्हरटाइम
- ओव्हरटाइमसाठी **दुप्पट वेतन दर** मिळणे बंधनकारक आहे

**गणना:**
ओव्हरटाइम = (मूळ + DA) ÷ 26 ÷ 8 × 2 × ओव्हरटाइम तास`,
      followUps: ['ओव्हरटाइम वेतन कसे मोजायचे?', 'नियोक्ता जबरदस्तीने ओव्हरटाइम करवू शकतो का?', 'ओव्हरटाइम न दिल्यास कुठे तक्रार करावी?'],
    },
  },
  labour_law: {
    en: {
      content: `**Labour Law — Your Core Worker Rights in Maharashtra**

**Key Acts protecting you:**
1. **Payment of Wages Act, 1936** — Timely, full salary payment
2. **Minimum Wages Act, 1948** — Minimum wage as notified by government
3. **Factories Act, 1948** — Safety, health, working hours
4. **Industrial Disputes Act, 1947** — Job security, retrenchment rules
5. **Shops & Establishments Act (Maharashtra)** — For shop/office workers
6. **POSH Act, 2013** — Women's protection against harassment
7. **Maternity Benefit Act, 1961** — 26 weeks paid maternity leave
8. **Payment of Gratuity Act, 1972** — Gratuity after 5 years of service

**Know Your Rights:**
- Right to work in safe conditions
- Right to minimum wage
- Right to PF and ESIC contributions
- Right to leave
- Right to complain without fear of retaliation`,
      followUps: ['What is minimum wage in Maharashtra?', 'What are my leave entitlements?', 'Can I be fired without notice?', 'What is the Shops and Establishments Act?', 'How to file a labour complaint?'],
    },
    hi: {
      content: `**श्रम कानून — महाराष्ट्र में आपके मुख्य अधिकार**

**मुख्य कानून:**
1. मजदूरी भुगतान अधिनियम, 1936 — समय पर पूरी सैलरी
2. न्यूनतम मजदूरी अधिनियम, 1948 — सरकार द्वारा तय न्यूनतम वेतन
3. फैक्ट्रीज अधिनियम, 1948 — सुरक्षा, स्वास्थ्य, काम के घंटे
4. औद्योगिक विवाद अधिनियम, 1947 — नौकरी की सुरक्षा
5. POSH अधिनियम, 2013 — महिला उत्पीड़न से सुरक्षा
6. प्रसूति लाभ अधिनियम — 26 सप्ताह का मातृत्व अवकाश`,
      followUps: ['महाराष्ट्र में न्यूनतम वेतन क्या है?', 'कितने दिन छुट्टी मिलनी चाहिए?', 'बिना नोटिस निकाल सकते हैं?', 'PF कटौती न हो तो क्या करें?'],
    },
    mr: {
      content: `**कामगार कायदा — महाराष्ट्रातील तुमचे मुख्य हक्क**

**प्रमुख कायदे:**
1. मजुरी देण्याचा कायदा, 1936 — वेळेवर पूर्ण पगार
2. किमान वेतन कायदा, 1948 — सरकारी किमान वेतन
3. कारखाने कायदा, 1948 — सुरक्षा, आरोग्य, कामाचे तास
4. औद्योगिक विवाद कायदा, 1947 — नोकरीची सुरक्षा
5. POSH कायदा, 2013 — महिला छळ संरक्षण
6. प्रसूती लाभ कायदा — 26 आठवडे सशुल्क रजा`,
      followUps: ['महाराष्ट्रात किमान वेतन किती आहे?', 'मला किती रजा मिळावी?', 'नोटिसशिवाय काढता येते का?'],
    },
  },
  complaint: {
    en: {
      content: `**Filing a Labour Complaint — Step by Step**

**Option 1: JanKam Online (Fastest)**
- Use our **Complaint Form** on this website
- Get Complaint ID instantly (JK-DISTRICT-0001 format)
- Track your complaint status online

**Option 2: District Labour Office**
1. Visit your District Labour Office
2. Carry: ID proof, offer letter, salary slips (3 months), evidence of violation
3. Submit written complaint with your signature

**Option 3: Labour Commissioner Online**
- Visit **mahalabour.gov.in** → Online Complaint
- File under MLWB / Shops Act / Factories Act

**Option 4: Labour Court**
- For disputes involving termination, unpaid dues above ₹50,000
- Strongly recommend: get a labour lawyer

**Use our Complaint Form** to file right now — it's free, online, and takes 5 minutes.`,
      followUps: ['What documents are needed for a labour complaint?', 'How long does a labour complaint take?', 'Do I need a lawyer to file a complaint?', 'Can I complain anonymously?', 'What is the complaint process at JanKam?'],
    },
    hi: {
      content: `**श्रम शिकायत कैसे दर्ज करें — चरण दर चरण**

**विकल्प 1: JanKam ऑनलाइन (सबसे तेज़)**
- इस वेबसाइट पर **शिकायत फॉर्म** का उपयोग करें
- तुरंत Complaint ID मिलेगी (JK-DISTRICT-0001 प्रारूप)

**विकल्प 2: जिला श्रम कार्यालय**
1. जिला श्रम कार्यालय जाएं
2. साथ लाएं: ID प्रमाण, नियुक्ति पत्र, वेतन पर्चियां (3 महीने)
3. हस्ताक्षर के साथ लिखित शिकायत जमा करें

**विकल्प 3: ऑनलाइन**
- **mahalabour.gov.in** पर जाएं → ऑनलाइन शिकायत`,
      followUps: ['शिकायत के लिए क्या दस्तावेज चाहिए?', 'श्रम शिकायत में कितना समय लगता है?', 'क्या मुझे वकील की जरूरत है?', 'क्या गुमनाम शिकायत कर सकते हैं?'],
    },
    mr: {
      content: `**कामगार तक्रार कशी दाखल करावी — पायरी पायरी**

**पर्याय 1: JanKam ऑनलाइन (सर्वात जलद)**
- या वेबसाइटवरील **तक्रार फॉर्म** वापरा
- लगेच Complaint ID मिळेल (JK-DISTRICT-0001 स्वरूप)

**पर्याय 2: जिल्हा कामगार कार्यालय**
1. जिल्हा कामगार कार्यालयात जा
2. सोबत आणा: ओळखपत्र, नियुक्ती पत्र, वेतन चिठ्ठ्या (3 महिने)

**पर्याय 3: ऑनलाइन**
- **mahalabour.gov.in** वर जा → ऑनलाइन तक्रार`,
      followUps: ['तक्रारीसाठी कोणते कागदपत्र हवेत?', 'कामगार तक्रार किती दिवसांत सुटते?', 'मला वकिलाची गरज आहे का?'],
    },
  },
  termination: {
    en: {
      content: `**Termination & Resignation Rights**

**If you were FIRED:**
- Employer must give written notice (1 month for most workers)
- OR pay salary in lieu of notice period
- Reason must be given in writing
- Termination without cause or notice is ILLEGAL → file complaint at Labour Court
- You are entitled to full & final settlement within 2 months

**If you RESIGNED:**
- Your notice period is governed by your appointment letter
- Typical: 1 month (shops/offices) or 2 months (senior roles)
- You can buy out your notice period by paying salary equivalent
- Employer cannot withhold your salary or experience letter

**Gratuity:** Payable if you worked for 5+ years (see Gratuity calculator)

**F&F Settlement must include:**
Pending salary + Leave encashment + Bonus + PF settlement + Gratuity`,
      followUps: ['What is legal notice period in India?', 'Can employer terminate without notice?', 'What documents to take while leaving a job?', 'How long for F&F settlement?', 'Can employer hold salary after resignation?'],
    },
    hi: {
      content: `**बर्खास्तगी और इस्तीफे के अधिकार**

**अगर आपको निकाला गया:**
- नियोक्ता को लिखित नोटिस देना होगा (आमतौर पर 1 महीना)
- या नोटिस अवधि के बदले वेतन देना होगा
- लिखित में कारण बताना जरूरी है
- बिना कारण या नोटिस बर्खास्तगी गैरकानूनी है
- 2 महीने में F&F सेटलमेंट करना होगा

**अगर आपने इस्तीफा दिया:**
- नोटिस पीरियड नियुक्ति पत्र पर निर्भर है
- नियोक्ता वेतन या अनुभव प्रमाण पत्र नहीं रोक सकता`,
      followUps: ['नोटिस पीरियड कितना होना चाहिए?', 'बिना नोटिस निकाल सकते हैं?', 'नौकरी छोड़ते वक्त कौन से दस्तावेज लें?', 'F&F सेटलमेंट में कितना समय लगता है?'],
    },
    mr: {
      content: `**बडतर्फी आणि राजीनाम्याचे हक्क**

**जर तुम्हाला काढले असेल:**
- नियोक्त्याने लेखी नोटीस देणे आवश्यक आहे (सामान्यतः 1 महिना)
- किंवा नोटीस कालावधीचे वेतन द्यावे लागेल
- लेखी कारण सांगणे बंधनकारक आहे
- कारणाशिवाय बडतर्फी बेकायदेशीर आहे

**जर तुम्ही राजीनामा दिला असेल:**
- नोटीस कालावधी नियुक्ती पत्रावर अवलंबून आहे
- नियोक्ता पगार किंवा अनुभव प्रमाणपत्र रोखू शकत नाही`,
      followUps: ['नोटीस कालावधी किती असावा?', 'नोटिसशिवाय बडतर्फ करता येते का?', 'नोकरी सोडताना कोणते कागदपत्र घ्यावेत?', 'F&F Settlement किती दिवसांत मिळते?'],
    },
  },
  gratuity: {
    en: {
      content: `**Gratuity — Your Long-Service Reward**

Under the Payment of Gratuity Act, 1972:

**Eligibility:** Minimum 5 years of continuous service with the same employer

**Formula:**
Gratuity = (Basic + DA) × 15 ÷ 26 × Years of Service

**Example:**
If Basic + DA = ₹20,000 and you worked 7 years:
Gratuity = ₹20,000 × 15 ÷ 26 × 7 = **₹80,769**

**Important rules:**
- Payable on: resignation, retirement, death, or permanent disability
- Must be paid within **30 days** of last working day
- Maximum gratuity (tax-free): ₹20 lakhs
- If employer delays → interest penalty applies

**Not receiving gratuity?**
File complaint with **Controlling Authority (Gratuity)** at your District Labour Office.`,
      followUps: ['How to calculate my gratuity?', 'Is gratuity taxable?', 'What if employer refuses to pay gratuity?', 'Am I eligible for gratuity if fired?', 'How to claim gratuity after leaving job?'],
    },
    hi: {
      content: `**ग्रेच्युटी — आपकी दीर्घकालीन सेवा का पुरस्कार**

ग्रेच्युटी भुगतान अधिनियम, 1972 के अनुसार:

**पात्रता:** एक ही नियोक्ता के साथ न्यूनतम 5 साल की निरंतर सेवा

**फॉर्मूला:**
ग्रेच्युटी = (बेसिक + DA) × 15 ÷ 26 × सेवा वर्ष

**उदाहरण:**
बेसिक + DA = ₹20,000 और 7 साल सेवा:
ग्रेच्युटी = ₹20,000 × 15 ÷ 26 × 7 = **₹80,769**

- अंतिम कार्य दिवस के 30 दिन के भीतर भुगतान करना होगा
- अधिकतम कर-मुक्त ग्रेच्युटी: ₹20 लाख`,
      followUps: ['ग्रेच्युटी की गणना कैसे करें?', 'क्या ग्रेच्युटी पर टैक्स लगता है?', 'नियोक्ता ग्रेच्युटी न दे तो क्या करें?', 'क्या निकाले जाने पर ग्रेच्युटी मिलती है?'],
    },
    mr: {
      content: `**उपदान (Gratuity) — दीर्घ सेवेचे बक्षीस**

उपदान देण्याचा कायदा, 1972 नुसार:

**पात्रता:** एकाच नियोक्त्याकडे किमान 5 वर्षांची सतत सेवा

**सूत्र:**
उपदान = (मूळ + DA) × 15 ÷ 26 × सेवा वर्षे

**उदाहरण:**
मूळ + DA = ₹20,000 आणि 7 वर्षे सेवा:
उपदान = ₹20,000 × 15 ÷ 26 × 7 = **₹80,769**

- शेवटच्या कामाच्या दिवसापासून 30 दिवसांत द्यावे लागते
- कमाल कर-मुक्त उपदान: ₹20 लाख`,
      followUps: ['माझे उपदान कसे मोजायचे?', 'उपदानावर कर लागतो का?', 'नियोक्ता उपदान न दिल्यास काय करायचे?', 'बडतर्फ केल्यावर उपदान मिळते का?'],
    },
  },
  leave: {
    en: {
      content: `**Leave Entitlements — Your Right to Rest**

Under Maharashtra Shops & Establishments Act and Factories Act:

**Types of Leave:**
| Type | Entitlement |
|---|---|
| Casual Leave (CL) | 8 days/year |
| Sick Leave (SL) | 7 days/year |
| Earned/Privileged Leave (PL/EL) | 1 day per 20 days worked (~15 days/year) |
| Public Holidays | As per Maharashtra Government notification |
| Maternity Leave | 26 weeks (first 2 children) |
| Paternity Leave | 15 days (government servants) |

**Key rules:**
- Employer cannot deny earned leave without reason
- Unused earned leave can be encashed at end of employment
- Leave without pay (LWP) is only if all leaves are exhausted
- Employer cannot deduct salary for taking sanctioned leave`,
      followUps: ['How many leave days am I entitled to per year?', 'Can employer refuse leave?', 'How to claim leave encashment?', 'What is maternity leave under law?', 'Can employer fire me for taking leave?'],
    },
    hi: {
      content: `**छुट्टी के अधिकार — आराम का हक**

महाराष्ट्र दुकान एवं प्रतिष्ठान अधिनियम के अनुसार:

**छुट्टी के प्रकार:**
| प्रकार | अधिकार |
|---|---|
| आकस्मिक छुट्टी (CL) | 8 दिन/वर्ष |
| बीमारी छुट्टी (SL) | 7 दिन/वर्ष |
| अर्जित छुट्टी (PL/EL) | 20 दिन काम पर 1 दिन (~15 दिन/वर्ष) |
| मातृत्व छुट्टी | 26 सप्ताह (पहले 2 बच्चे) |

- नियोक्ता बिना कारण अर्जित छुट्टी से मना नहीं कर सकता
- नौकरी छोड़ते समय बची हुई अर्जित छुट्टी का नकद भुगतान होता है`,
      followUps: ['साल में कितने दिन छुट्टी मिलती है?', 'क्या नियोक्ता छुट्टी देने से मना कर सकता है?', 'छुट्टी नकदी कैसे मांगें?', 'मातृत्व छुट्टी कितने दिनों की होती है?'],
    },
    mr: {
      content: `**रजेचे हक्क — विश्रांतीचा अधिकार**

महाराष्ट्र दुकान व आस्थापना अधिनियमानुसार:

**रजेचे प्रकार:**
| प्रकार | अधिकार |
|---|---|
| आकस्मिक रजा (CL) | 8 दिवस/वर्ष |
| आजारपण रजा (SL) | 7 दिवस/वर्ष |
| अर्जित रजा (PL/EL) | 20 दिवस कामावर 1 दिवस (~15 दिवस/वर्ष) |
| मातृत्व रजा | 26 आठवडे (पहिल्या 2 मुलांसाठी) |

- नियोक्ता कारणाशिवाय अर्जित रजा नाकारू शकत नाही
- नोकरी सोडताना उरलेल्या रजेचे रोख पैसे मिळतात`,
      followUps: ['वर्षाला किती दिवस रजा मिळते?', 'नियोक्ता रजा नाकारू शकतो का?', 'रजा रोखीकरण कसे मागायचे?', 'मातृत्व रजा किती आठवड्यांची असते?'],
    },
  },
  women_safety: {
    en: {
      content: `**Women Safety at Workplace — Your Rights**

**POSH Act, 2013 (Prevention of Sexual Harassment):**
- Every workplace with 10+ employees MUST have an Internal Complaints Committee (ICC)
- Sexual harassment includes: unwelcome physical contact, verbal abuse, showing pornographic material, demands for sexual favours
- You have the right to file a complaint WITHOUT fear of retaliation
- Your complaint will be kept **confidential**

**How to file a harassment complaint:**
1. Report to your company's Internal Complaints Committee (ICC)
2. If no ICC → file at **Local Complaints Committee (LCC)** at District Collectorate
3. SHe-Box portal: **shebox.nic.in** (for government employees)
4. Call **Women Helpline: 1091** (24×7)
5. Call **Childline/Police: 112**

**Maternity Rights:**
- 26 weeks paid maternity leave (first 2 children)
- Cannot be fired for being pregnant or taking maternity leave`,
      followUps: ['What is the POSH Act?', 'How to file a POSH complaint?', 'What if my company has no ICC?', 'Women helpline number in Maharashtra?', 'Can I be fired for maternity leave?'],
    },
    hi: {
      content: `**कार्यस्थल पर महिला सुरक्षा — आपके अधिकार**

**POSH अधिनियम, 2013 (यौन उत्पीड़न निवारण):**
- 10+ कर्मचारियों वाले हर कार्यस्थल में आंतरिक शिकायत समिति (ICC) होनी चाहिए
- यौन उत्पीड़न में शामिल है: अनुचित स्पर्श, मौखिक दुर्व्यवहार, यौन इशारे
- आप बिना किसी डर के शिकायत कर सकती हैं — गोपनीयता सुनिश्चित है

**शिकायत कैसे दर्ज करें:**
1. कंपनी की ICC में शिकायत दर्ज करें
2. अगर ICC नहीं है → जिला LCC में जाएं
3. **महिला हेल्पलाइन: 1091** (24×7)
4. पुलिस/आपातकाल: 112`,
      followUps: ['POSH अधिनियम क्या है?', 'POSH शिकायत कैसे दर्ज करें?', 'ICC नहीं है तो क्या करें?', 'महाराष्ट्र में महिला हेल्पलाइन नंबर?', 'क्या गर्भावस्था में निकाला जा सकता है?'],
    },
    mr: {
      content: `**कामाच्या ठिकाणी महिला सुरक्षा — तुमचे हक्क**

**POSH कायदा, 2013 (लैंगिक छळ प्रतिबंध):**
- 10+ कर्मचारी असलेल्या प्रत्येक कामाच्या ठिकाणी अंतर्गत तक्रार समिती (ICC) असणे बंधनकारक आहे
- लैंगिक छळात: अनुचित स्पर्श, तोंडी शिवीगाळ, लैंगिक इशारे यांचा समावेश आहे
- तुम्ही भीतीशिवाय तक्रार करू शकता — गोपनीयता सुनिश्चित

**तक्रार कशी करावी:**
1. कंपनीच्या ICC मध्ये तक्रार द्या
2. ICC नसल्यास → जिल्हा LCC मध्ये जा
3. **महिला हेल्पलाइन: 1091** (24×7)
4. पोलीस/आणीबाणी: 112`,
      followUps: ['POSH कायदा काय आहे?', 'POSH तक्रार कशी करावी?', 'ICC नसल्यास काय करावे?', 'महाराष्ट्रात महिला हेल्पलाइन नंबर?', 'गर्भवती असताना बडतर्फ करता येते का?'],
    },
  },
};

// ── SAHAYAK GREETING ──
const SAHAYAK_GREETING: Record<Language, string> = {
  en: `**Namaste! I'm JanKam Labour Assistant** 🤝

I'm your personal labour rights assistant — I understand **Hindi, English, and Marathi** automatically.

I can help you with:
**PF · ESIC · Salary · Overtime · Labour Law · Complaints · Termination · Gratuity · Leave · Women Safety**

Just ask your question — I'll detect the topic and give you the right answer.`,
  hi: `**नमस्ते! मैं JanKam Labour Assistant हूं** 🤝

मैं आपका व्यक्तिगत श्रम अधिकार सहायक हूं — मैं **हिंदी, अंग्रेजी और मराठी** स्वचालित रूप से समझता हूं।

मैं इनमें मदद कर सकता हूं:
**PF · ESIC · वेतन · ओवरटाइम · श्रम कानून · शिकायत · बर्खास्तगी · ग्रेच्युटी · छुट्टी · महिला सुरक्षा**

बस अपना सवाल पूछें — मैं विषय पहचान कर सही जवाब दूंगा।`,
  mr: `**नमस्कार! मी JanKam Labour Assistant आहे** 🤝

मी तुमचा वैयक्तिक कामगार हक्क सहाय्यक आहे — मी **हिंदी, इंग्रजी आणि मराठी** आपोआप समजतो.

मी यात मदत करतो:
**PF · ESIC · पगार · ओव्हरटाइम · कामगार कायदा · तक्रार · बडतर्फी · उपदान · रजा · महिला सुरक्षा**

फक्त तुमचा प्रश्न विचारा — मी विषय ओळखून योग्य उत्तर देतो.`,
};

// ── MAIN AI RESPONSE FUNCTION ──
export async function generateResponse(
  userMessage: string,
  agentType: AgentType,
  context: ConversationContext,
): Promise<{
  content: string;
  followUps: string[];
  language: Language;
  draftContent?: ComplaintDraft;
  calculationResult?: SalaryCalcResult;
  intent?: string;
  kbId?: string;
  isFallback?: boolean;
}> {

  const lang = detectLanguage(userMessage) || context.language || 'en';
  const lowerMsg = userMessage.toLowerCase().trim();
  const numbers = extractNumbers(userMessage);

  // ── COMPLAINT DRAFT FLOW ──
  if (agentType === 'complaint_draft') {
    const flow = context.currentFlow;
    const collected = context.collectedData;
    const startTriggers = ['start', 'शुरू', 'सुरू', 'begin', 'draft', 'create', 'takat', 'draft banao', 'complaint draft'];
    const isStarting = startTriggers.some(t => lowerMsg.includes(t)) || Object.keys(collected).length === 0;

    if (isStarting && !collected.worker_name) {
      context.currentFlow = 'worker_name';
      context.collectedData = {};
      return {
        content: COMPLAINT_PROMPTS.worker_name[lang],
        followUps: [],
        language: lang,
      };
    }

    const currentStep = context.currentFlow;
    if (currentStep && COMPLAINT_FLOW_STEPS.includes(currentStep)) {
      const stepIdx = COMPLAINT_FLOW_STEPS.indexOf(currentStep);
      collected[currentStep] = userMessage.trim();
      const nextStep = COMPLAINT_FLOW_STEPS[stepIdx + 1];
      if (nextStep) {
        context.currentFlow = nextStep;
        return {
          content: COMPLAINT_PROMPTS[nextStep][lang],
          followUps: [],
          language: lang,
        };
      } else {
        // All collected — generate draft
        context.currentFlow = undefined;
        const draft = generateComplaintDraft(collected);
        const successMsg = lang === 'hi'
          ? '✅ आपकी शिकायत का मसौदा तैयार है! नीचे तीनों भाषाओं में देखें, कॉपी करें, डाउनलोड करें या प्रिंट करें।'
          : lang === 'mr'
          ? '✅ तुमचा तक्रार मसुदा तयार आहे! खाली तिन्ही भाषांमध्ये पाहा, कॉपी करा, डाउनलोड करा किंवा प्रिंट करा.'
          : '✅ Your complaint draft is ready! Review it below in all three languages, then copy, download, or print.';
        return {
          content: successMsg,
          followUps: lang === 'hi'
            ? ['क्या मैं इसे सीधे श्रम कार्यालय को भेज सकता हूं?', 'क्या मुझे वकील की जरूरत है?', 'इस शिकायत के लिए क्या दस्तावेज चाहिए?']
            : lang === 'mr'
            ? ['मी हे थेट कामगार कार्यालयात पाठवू शकतो का?', 'मला वकिलाची गरज आहे का?', 'या तक्रारीसाठी कोणते कागदपत्र हवे?']
            : ['Can I file this directly at the Labour Office?', 'Do I need a lawyer for this?', 'What documents do I need with this complaint?', 'How long will it take to resolve?'],
          language: lang,
          draftContent: draft,
        };
      }
    }
  }

  // ── SALARY VERIFICATION FLOW ──
  if (agentType === 'salary_verification') {
    const prevMessages = context.messages;
    // Extract salary context from history
    let contextualSalary = context.collectedData.salary as number || 0;
    let contextualOT = context.collectedData.overtime as number || 0;

    if (numbers.length > 0) {
      const isOTContext = lowerMsg.includes('overtime') || lowerMsg.includes('ot') || lowerMsg.includes('extra hour') || lowerMsg.includes('ओवरटाइम') || lowerMsg.includes('ओव्हरटाइम');
      if (isOTContext && contextualSalary > 0) {
        contextualOT = numbers[0];
        context.collectedData.overtime = contextualOT;
      } else if (numbers[0] > 1000) {
        contextualSalary = numbers[0];
        context.collectedData.salary = contextualSalary;
        if (numbers[1] && numbers[1] < 200) {
          contextualOT = numbers[1];
          context.collectedData.overtime = contextualOT;
        }
      }
    }

    // "how much should I receive" type — use context
    const calcTriggers = ['how much', 'calculate', 'kitna', 'kitni', 'mujhe kitna', 'kiती', 'मुझे कितना', 'कितना मिलेगा', 'कितना होगा'];
    const isCalcQuery = calcTriggers.some(t => lowerMsg.includes(t));

    if (contextualSalary > 1000 || (isCalcQuery && contextualSalary > 0)) {
      const result = calculateSalary(contextualSalary, contextualOT);
      const formatted = formatSalaryResult(result, lang);
      const followUpsMap = {
        en: ['Is this deduction amount correct?', 'How to check if PF is being deposited?', 'What if my employer pays less than minimum wage?', 'How to calculate overtime pay?'],
        hi: ['क्या यह कटौती राशि सही है?', 'PF जमा हो रहा है या नहीं, कैसे जांचें?', 'ओवरटाइम का भुगतान न हो तो क्या करें?'],
        mr: ['ही कपात रक्कम बरोबर आहे का?', 'PF जमा होत आहे का ते कसे तपासायचे?', 'ओव्हरटाइम न दिल्यास काय करावे?'],
      };
      return { content: formatted, followUps: followUpsMap[lang], language: lang, calculationResult: result };
    }

    if (numbers.length === 0 || contextualSalary === 0) {
      const prompt = lang === 'hi'
        ? 'कृपया अपना **बेसिक सैलरी** बताएं (जैसे: 18000)। अगर ओवरटाइम घंटे भी जानना हो तो वो भी बताएं।'
        : lang === 'mr'
        ? 'कृपया तुमचा **मूळ पगार** सांगा (उदा: 18000). ओव्हरटाइम तास असल्यास तेही सांगा.'
        : 'Please share your **basic salary amount** (e.g. 18000). If you also worked overtime, share the number of overtime hours.';
      return { content: prompt, followUps: [], language: lang };
    }
  }

  // ── SAHAYAK UNIFIED INTENT ROUTING ──
  if (agentType === 'sahayak') {
    const intent = detectSahayakIntent(userMessage);
    // If salary intent + number, run real calculation
    if (intent === 'salary' || (intent === 'overtime')) {
      const numbers = extractNumbers(userMessage);
      if (numbers.length > 0 && numbers[0] > 1000) {
        const isOT = intent === 'overtime' && numbers.length > 1;
        const result = calculateSalary(numbers[0], isOT ? numbers[1] : 0);
        return {
          content: formatSalaryResult(result, lang),
          followUps: SAHAYAK_RESPONSES.salary[lang].followUps,
          language: lang,
          calculationResult: result,
          intent: 'salary',
        };
      }
    }
    const intentToUse: Exclude<SahayakIntent, 'unknown'> = intent === 'unknown' ? 'labour_law' : intent;
    const resp = SAHAYAK_RESPONSES[intentToUse][lang];
    return { content: resp.content, followUps: resp.followUps, language: lang, intent: intentToUse };
  }

  // ── KNOWLEDGE BASE LOOKUP ──
  const entry = findRelevantEntry(userMessage, agentType);
  if (entry) {
    const response = formatKBResponse(entry, lang);
    const followUps = entry.followUps[lang] || entry.followUps.en;
    return { content: response, followUps, language: lang, kbId: entry.id };
  }

  // ── FALLBACK ──
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
    content: FALLBACKS[lang],
    followUps: agentFollowUps[agentType][lang],
    language: lang,
    isFallback: true,
  };
}

export function getGreeting(agentType: AgentType, lang: Language): ChatMessage {
  if (agentType === 'sahayak') {
    return {
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: SAHAYAK_GREETING[lang],
      timestamp: new Date(),
      followUps: [
        lang === 'hi' ? 'मेरा PF क्यों नहीं काटा जा रहा?' : lang === 'mr' ? 'माझा PF का कापला जात नाही?' : 'Why is my PF not being deducted?',
        lang === 'hi' ? 'ओवरटाइम का पैसा कैसे मिलेगा?' : lang === 'mr' ? 'ओव्हरटाइम पैसे कसे मिळतील?' : 'How to claim overtime pay?',
        lang === 'hi' ? 'वेतन न मिले तो क्या करें?' : lang === 'mr' ? 'पगार न मिळाल्यास काय करावे?' : 'What to do if salary is not paid?',
        lang === 'hi' ? 'बिना कारण निकाला — अधिकार क्या हैं?' : lang === 'mr' ? 'कारणाशिवाय काढले — हक्क काय?' : 'Fired without reason — what are my rights?',
      ],
      language: lang,
    };
  }
  const greetings = GREETINGS[agentType];
  return {
    id: `greeting-${Date.now()}`,
    role: 'assistant',
    content: greetings[lang],
    timestamp: new Date(),
    followUps: [],
    language: lang,
  };
}
