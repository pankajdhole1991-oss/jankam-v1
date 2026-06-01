// ============================================
// JANKAM — COMPREHENSIVE LABOUR LAW KNOWLEDGE BASE
// English · Hindi · Marathi
// ============================================

export type Language = 'en' | 'hi' | 'mr';

export interface KBEntry {
  id: string;
  topic: string;
  keywords: string[];
  en: { summary: string; detail: string; steps: string[] };
  hi: { summary: string; detail: string; steps: string[] };
  mr: { summary: string; detail: string; steps: string[] };
  followUps: { en: string[]; hi: string[]; mr: string[] };
}

export const knowledgeBase: KBEntry[] = [
  // ── MINIMUM WAGE ──
  {
    id: 'minimum_wage',
    topic: 'Minimum Wage',
    keywords: ['minimum wage', 'min wage', 'minimum salary', 'kam tankhah', 'न्यूनतम वेतन', 'किमान वेतन', 'न्यूनतम मजूरी', 'nyuntam'],
    en: {
      summary: 'Every worker in Maharashtra has a legal right to minimum wage. No employer can pay below this amount.',
      detail: `In Maharashtra, minimum wages are set by the state government and revised twice a year.
• Unskilled workers: ₹10,000–₹14,000/month (varies by zone/industry)
• Semi-skilled: ₹12,000–₹16,000/month
• Skilled: ₹15,000–₹20,000/month
• Agricultural workers: Separate rates apply

The Payment of Minimum Wages Act, 1948 protects all workers. Violation is a criminal offence.`,
      steps: [
        'Check the latest MW notification on Maharashtra Labour Dept website',
        'Compare with your current salary slip',
        'If underpaid — collect 3 months of salary slips',
        'File complaint at District Labour Office or through JanKam',
      ],
    },
    hi: {
      summary: 'महाराष्ट्र में हर श्रमिक को न्यूनतम वेतन का कानूनी अधिकार है। कोई भी नियोक्ता इससे कम नहीं दे सकता।',
      detail: `महाराष्ट्र में न्यूनतम वेतन राज्य सरकार द्वारा निर्धारित किया जाता है और साल में दो बार संशोधित किया जाता है।
• अकुशल श्रमिक: ₹10,000–₹14,000/माह (क्षेत्र/उद्योग के अनुसार)
• अर्ध-कुशल: ₹12,000–₹16,000/माह
• कुशल: ₹15,000–₹20,000/माह
न्यूनतम वेतन अधिनियम, 1948 सभी श्रमिकों की रक्षा करता है। उल्लंघन आपराधिक अपराध है।`,
      steps: [
        'महाराष्ट्र श्रम विभाग की वेबसाइट पर नवीनतम MW अधिसूचना जांचें',
        'अपनी वर्तमान सैलरी स्लिप से तुलना करें',
        'यदि कम भुगतान — 3 महीने की सैलरी स्लिप इकट्ठा करें',
        'जिला श्रम कार्यालय में शिकायत दर्ज करें या JanKam के माध्यम से',
      ],
    },
    mr: {
      summary: 'महाराष्ट्रात प्रत्येक कामगाराला किमान वेतनाचा कायदेशीर अधिकार आहे. कोणताही नियोक्ता यापेक्षा कमी देऊ शकत नाही.',
      detail: `महाराष्ट्रात किमान वेतन राज्य सरकारद्वारे निश्चित केले जाते आणि वर्षातून दोनदा सुधारित केले जाते.
• अकुशल कामगार: ₹10,000–₹14,000/महिना
• अर्ध-कुशल: ₹12,000–₹16,000/महिना
• कुशल: ₹15,000–₹20,000/महिना
किमान वेतन अधिनियम, 1948 सर्व कामगारांचे संरक्षण करतो.`,
      steps: [
        'महाराष्ट्र कामगार विभागाच्या वेबसाइटवर नवीनतम अधिसूचना तपासा',
        'आपल्या सध्याच्या पगार स्लिपशी तुलना करा',
        'कमी वेतन असल्यास — 3 महिन्यांच्या पगार स्लिप गोळा करा',
        'जिल्हा कामगार कार्यालयात तक्रार नोंदवा',
      ],
    },
    followUps: {
      en: ['How do I file a minimum wage complaint?', 'What proof do I need for underpayment?', 'Can my employer deduct money from my salary legally?', 'What is the overtime rate in Maharashtra?'],
      hi: ['न्यूनतम वेतन शिकायत कैसे दर्ज करें?', 'कम भुगतान के लिए मुझे क्या प्रमाण चाहिए?', 'क्या मेरा नियोक्ता मेरी सैलरी से पैसे काट सकता है?'],
      mr: ['किमान वेतन तक्रार कशी नोंदवायची?', 'कमी वेतनासाठी मला कोणते पुरावे हवे आहेत?', 'माझा नियोक्ता माझ्या पगारातून पैसे कापू शकतो का?'],
    },
  },

  // ── OVERTIME ──
  {
    id: 'overtime',
    topic: 'Overtime',
    keywords: ['overtime', 'ot', 'extra hours', 'double pay', 'overtime pay', 'ओवरटाइम', 'अधिक घंटे', 'जास्त वेळ'],
    en: {
      summary: 'Overtime must be paid at DOUBLE the normal wage rate. Working more than 9 hours/day or 48 hours/week qualifies as overtime.',
      detail: `Under the Factories Act 1948 and Maharashtra Shops & Establishments Act:
• Max working hours: 9 hrs/day, 48 hrs/week
• Overtime rate: 2x (double) the normal hourly wage
• Max overtime: 50 hours per quarter (factories)
• Overtime register must be maintained by employer
• Refusal to pay overtime is illegal

Formula:
Overtime pay = (Basic + DA) ÷ 26 ÷ 8 × 2 × overtime hours`,
      steps: [
        'Note your overtime hours in writing or WhatsApp messages',
        'Calculate your rightful overtime using the formula above',
        'Write to HR/employer in writing requesting payment',
        'If refused — file complaint at Labour Office with attendance records',
      ],
    },
    hi: {
      summary: 'ओवरटाइम का भुगतान सामान्य वेतन दर से दोगुना होना चाहिए। 9 घंटे/दिन या 48 घंटे/सप्ताह से अधिक काम ओवरटाइम है।',
      detail: `कारखाना अधिनियम 1948 के अनुसार:
• अधिकतम कार्य घंटे: 9 घंटे/दिन, 48 घंटे/सप्ताह
• ओवरटाइम दर: सामान्य प्रति घंटे वेतन का 2 गुना
• नियोक्ता के पास ओवरटाइम रजिस्टर होना जरूरी है

सूत्र: OT = (Basic + DA) ÷ 26 ÷ 8 × 2 × OT घंटे`,
      steps: [
        'लिखित रूप में या व्हाट्सएप मैसेज में ओवरटाइम घंटे नोट करें',
        'ऊपर दिए सूत्र से अपने ओवरटाइम की गणना करें',
        'HR को लिखित में भुगतान के लिए अनुरोध करें',
        'अगर मना किया — उपस्थिति रिकॉर्ड के साथ श्रम कार्यालय में शिकायत दर्ज करें',
      ],
    },
    mr: {
      summary: 'ओव्हरटाइम सामान्य वेतनाच्या दुप्पट दराने दिला जाणे आवश्यक आहे. 9 तास/दिवस किंवा 48 तास/आठवडा यापेक्षा जास्त काम ओव्हरटाइम आहे.',
      detail: `कारखाना कायदा 1948 नुसार:
• जास्तीत जास्त काम: 9 तास/दिवस, 48 तास/आठवडा
• ओव्हरटाइम दर: सामान्य प्रति तास वेतनाच्या 2 पट

सूत्र: OT = (Basic + DA) ÷ 26 ÷ 8 × 2 × OT तास`,
      steps: [
        'लेखी किंवा व्हाट्सएप संदेशात ओव्हरटाइम तास नोंदवा',
        'वरील सूत्र वापरून ओव्हरटाइम मोजा',
        'HR ला लेखी विनंती करा',
        'नकार दिल्यास — उपस्थिती नोंदींसह कामगार कार्यालयात तक्रार करा',
      ],
    },
    followUps: {
      en: ['How to calculate my overtime pay?', 'Can my employer force me to work overtime?', 'What if employer refuses to pay overtime?', 'What is maximum overtime allowed per month?'],
      hi: ['मेरे ओवरटाइम की गणना कैसे करें?', 'क्या नियोक्ता ओवरटाइम के लिए मजबूर कर सकता है?', 'अगर ओवरटाइम नहीं दिया तो क्या करें?'],
      mr: ['माझा ओव्हरटाइम कसा मोजायचा?', 'नियोक्ता ओव्हरटाइम करण्यास भाग पाडू शकतो का?'],
    },
  },

  // ── PF ──
  {
    id: 'pf',
    topic: 'Provident Fund (PF)',
    keywords: ['pf', 'provident fund', 'epf', 'epfo', 'uan', 'pf balance', 'pf withdrawal', 'pf claim', 'भविष्य निधि', 'पीएफ', 'भविष्य निर्वाह निधी'],
    en: {
      summary: 'PF (Provident Fund) is a mandatory savings scheme. Both you and your employer contribute 12% of your basic salary each month.',
      detail: `Employee Provident Fund (EPF) under EPFO:
• Employee contribution: 12% of Basic + DA
• Employer contribution: 12% (8.33% to EPS + 3.67% to EPF)
• Mandatory for companies with 20+ employees
• UAN (Universal Account Number) stays with you for life

Checking PF Balance:
• SMS "EPFOHO UAN ENG" to 7738299899
• UMANG App → EPFO → Member Services
• epfindia.gov.in with UAN login

Withdrawal allowed: After 2 months of unemployment or retirement.`,
      steps: [
        'Get your UAN from employer (must be given on joining)',
        'Activate UAN on EPFO portal: unifiedportal-mem.epfindia.gov.in',
        'Link Aadhaar and bank account to UAN',
        'Check balance via UMANG app or SMS',
        'For withdrawal: apply online on EPFO portal or through JanKam',
      ],
    },
    hi: {
      summary: 'PF अनिवार्य बचत योजना है। आप और आपका नियोक्ता दोनों हर महीने बेसिक सैलरी का 12% योगदान करते हैं।',
      detail: `EPFO के तहत EPF:
• कर्मचारी का योगदान: Basic + DA का 12%
• नियोक्ता का योगदान: 12%
• 20+ कर्मचारियों वाली कंपनियों के लिए अनिवार्य
• UAN आजीवन आपके साथ रहती है

PF बैलेंस जांचें:
• SMS: "EPFOHO UAN ENG" → 7738299899
• UMANG App → EPFO → Member Services`,
      steps: [
        'नियोक्ता से UAN लें (नियुक्ति पर देना अनिवार्य है)',
        'EPFO पोर्टल पर UAN सक्रिय करें',
        'UAN से Aadhaar और बैंक खाता लिंक करें',
        'UMANG ऐप या SMS से बैलेंस जांचें',
      ],
    },
    mr: {
      summary: 'PF ही अनिवार्य बचत योजना आहे. तुम्ही आणि तुमचा नियोक्ता दोघेही दरमहा मूळ पगाराच्या 12% योगदान देतात.',
      detail: `EPFO अंतर्गत EPF:
• कर्मचारी योगदान: Basic + DA चे 12%
• नियोक्ता योगदान: 12%
• 20+ कर्मचारी असलेल्या कंपन्यांसाठी अनिवार्य

PF शिल्लक तपासा: SMS "EPFOHO UAN ENG" → 7738299899`,
      steps: [
        'नियोक्त्याकडून UAN मिळवा',
        'EPFO पोर्टलवर UAN सक्रिय करा',
        'Aadhaar आणि बँक खाते जोडा',
        'UMANG App द्वारे शिल्लक तपासा',
      ],
    },
    followUps: {
      en: ['How to check my PF balance?', 'How to withdraw PF after leaving job?', 'What is UAN and how to get it?', 'My employer is not depositing PF — what to do?', 'How much PF will I get after 5 years?'],
      hi: ['PF बैलेंस कैसे जांचें?', 'नौकरी छोड़ने के बाद PF कैसे निकालें?', 'UAN क्या है और कैसे मिलेगा?', 'नियोक्ता PF जमा नहीं कर रहा — क्या करें?'],
      mr: ['PF शिल्लक कशी तपासायची?', 'नोकरी सोडल्यावर PF कसा काढायचा?', 'UAN म्हणजे काय आणि ते कसे मिळवायचे?'],
    },
  },

  // ── ESIC ──
  {
    id: 'esic',
    topic: 'ESIC (Medical Insurance)',
    keywords: ['esic', 'esi', 'medical', 'health insurance', 'hospital', 'esic card', 'esic benefit', 'ईएसआईसी', 'ईएसआई', 'चिकित्सा'],
    en: {
      summary: 'ESIC provides free medical treatment, sickness benefits, maternity benefits, and disability coverage to workers earning up to ₹21,000/month.',
      detail: `Employee State Insurance (ESIC) coverage:
• Eligible: Workers earning ≤ ₹21,000/month
• Employee contribution: 0.75% of gross salary
• Employer contribution: 3.25% of gross salary
• Coverage: Medical + family members
• Benefits: Free hospitalization, medicines, sickness pay (70% wage for 91 days/year), maternity (26 weeks)
• ESIC hospitals available across Maharashtra

Getting ESIC card:
Apply through employer → ESIC portal → get IP number and e-Pehchaan card`,
      steps: [
        'Confirm with HR you are registered under ESIC',
        'Get your IP (Insured Person) number from employer',
        'Download ESIC card from esic.in portal',
        'Find nearest ESIC hospital/dispensary at esic.in',
        'For claim: visit ESIC office with IP number and prescription',
      ],
    },
    hi: {
      summary: 'ESIC ₹21,000/माह तक कमाने वाले श्रमिकों को मुफ्त चिकित्सा, बीमारी लाभ, मातृत्व लाभ और विकलांगता कवरेज प्रदान करता है।',
      detail: `ESIC लाभ:
• पात्रता: ≤ ₹21,000/माह कमाने वाले
• कर्मचारी योगदान: सकल वेतन का 0.75%
• नियोक्ता योगदान: 3.25%
• लाभ: मुफ्त अस्पताल, दवाएं, बीमारी भत्ता (91 दिन/वर्ष के लिए 70% वेतन), मातृत्व (26 सप्ताह)`,
      steps: [
        'HR से पुष्टि करें कि आप ESIC के तहत पंजीकृत हैं',
        'नियोक्ता से IP नंबर लें',
        'esic.in से ESIC कार्ड डाउनलोड करें',
        'निकटतम ESIC अस्पताल खोजें',
      ],
    },
    mr: {
      summary: 'ESIC ₹21,000/महिना पर्यंत कमावणाऱ्या कामगारांना मोफत वैद्यकीय उपचार, आजारपण लाभ आणि मातृत्व लाभ देते.',
      detail: `ESIC लाभ:
• पात्रता: ≤ ₹21,000/महिना कमावणारे
• कर्मचारी योगदान: एकूण वेतनाच्या 0.75%
• नियोक्ता योगदान: 3.25%
• मोफत रुग्णालय, औषधे, आजारपण भत्ता, मातृत्व (26 आठवडे)`,
      steps: [
        'HR कडून ESIC नोंदणी पुष्टी करा',
        'नियोक्त्याकडून IP क्रमांक मिळवा',
        'esic.in वरून ESIC कार्ड डाउनलोड करा',
      ],
    },
    followUps: {
      en: ['How to get ESIC card?', 'Which hospitals accept ESIC in Maharashtra?', 'What is sickness benefit under ESIC?', 'My employer is not deducting ESIC — is that legal?'],
      hi: ['ESIC कार्ड कैसे मिलेगा?', 'महाराष्ट्र में कौन से अस्पताल ESIC स्वीकार करते हैं?', 'ESIC के तहत बीमारी लाभ क्या है?'],
      mr: ['ESIC कार्ड कसे मिळवायचे?', 'महाराष्ट्रात कोणती रुग्णालये ESIC स्वीकारतात?'],
    },
  },

  // ── GRATUITY ──
  {
    id: 'gratuity',
    topic: 'Gratuity',
    keywords: ['gratuity', 'gratuity act', 'gratuity amount', 'ग्रेच्युटी', 'सेवा निधि', 'उपदान'],
    en: {
      summary: 'Gratuity is a reward for long service. You are eligible after completing 5 years with one employer.',
      detail: `Payment of Gratuity Act, 1972:
• Eligibility: 5+ years of continuous service
• Formula: (Basic + DA) × 15 × Years of Service ÷ 26
• Example: Salary ₹20,000, 10 years → ₹20,000 × 15 × 10 ÷ 26 = ₹1,15,385
• Maximum: ₹20 lakhs
• Payment: Within 30 days of leaving
• Late payment: Interest added automatically`,
      steps: [
        'Calculate your gratuity using the formula',
        'Send written request to employer within 30 days of leaving',
        'Employer must pay within 30 days of request',
        'If delayed — file complaint under Gratuity Act at Labour Office',
      ],
    },
    hi: {
      summary: 'ग्रेच्युटी लंबी सेवा का इनाम है। एक नियोक्ता के साथ 5 साल पूरे करने के बाद आप पात्र हैं।',
      detail: `भुगतान ग्रेच्युटी अधिनियम, 1972:
• पात्रता: 5+ साल की निरंतर सेवा
• सूत्र: (Basic + DA) × 15 × सेवा वर्ष ÷ 26
• उदाहरण: वेतन ₹20,000, 10 साल → ₹1,15,385
• अधिकतम: ₹20 लाख
• भुगतान: नौकरी छोड़ने के 30 दिनों के भीतर`,
      steps: [
        'सूत्र से अपनी ग्रेच्युटी की गणना करें',
        'नौकरी छोड़ने के 30 दिनों के भीतर नियोक्ता को लिखित अनुरोध भेजें',
        'देरी होने पर श्रम कार्यालय में शिकायत दर्ज करें',
      ],
    },
    mr: {
      summary: 'ग्रॅच्युइटी दीर्घ सेवेसाठी पुरस्कार आहे. एका नियोक्त्यासोबत 5 वर्षे पूर्ण केल्यावर तुम्ही पात्र आहात.',
      detail: `ग्रॅच्युइटी अधिनियम, 1972:
• पात्रता: 5+ वर्षे सतत सेवा
• सूत्र: (Basic + DA) × 15 × सेवा वर्षे ÷ 26
• उदाहरण: पगार ₹20,000, 10 वर्षे → ₹1,15,385
• जास्तीत जास्त: ₹20 लाख`,
      steps: [
        'सूत्र वापरून ग्रॅच्युइटी मोजा',
        'नोकरी सोडल्यावर 30 दिवसांत लेखी विनंती करा',
        'उशीर झाल्यास कामगार कार्यालयात तक्रार करा',
      ],
    },
    followUps: {
      en: ['Calculate my gratuity amount', 'What if employer refuses gratuity?', 'Is gratuity taxable?', 'Do contract workers get gratuity?'],
      hi: ['मेरी ग्रेच्युटी कितनी होगी?', 'अगर नियोक्ता ग्रेच्युटी देने से मना करे?', 'क्या ग्रेच्युटी पर टैक्स लगता है?'],
      mr: ['माझी ग्रॅच्युइटी किती असेल?', 'नियोक्त्याने ग्रॅच्युइटी नाकारल्यास काय करावे?'],
    },
  },

  // ── TERMINATION ──
  {
    id: 'termination',
    topic: 'Termination & Wrongful Dismissal',
    keywords: ['termination', 'fired', 'dismissed', 'sacked', 'remove', 'layoff', 'retrenchment', 'निकाला', 'बर्खास्त', 'काढले', 'नोकरी गेली'],
    en: {
      summary: 'Wrongful termination is illegal. Employers must follow proper procedures and give notice period or pay in lieu.',
      detail: `Your rights on termination (Industrial Disputes Act 1947):
• Notice period: 30 days (1 month) written notice mandatory if 1+ year service
• Retrenchment compensation: 15 days wage per year of service
• No termination without prior notice or pay in lieu of notice
• Domestic enquiry required before dismissal for misconduct
• Standing Orders Act: must provide written reason for termination
• Illegal termination: you can claim reinstatement + back wages`,
      steps: [
        'Get termination letter in writing — always ask for it',
        'Check if notice period was served or pay in lieu given',
        'Claim unpaid salary, leave encashment, PF, gratuity (if 5+ years)',
        'File complaint at Labour Court within 3 years of termination',
        'If less than 240 days worked in a year — different rules apply',
      ],
    },
    hi: {
      summary: 'गलत तरीके से नौकरी से निकालना गैरकानूनी है। नियोक्ताओं को उचित प्रक्रिया का पालन करना होगा।',
      detail: `औद्योगिक विवाद अधिनियम 1947 के तहत आपके अधिकार:
• नोटिस अवधि: 1+ साल सेवा पर 30 दिन का लिखित नोटिस अनिवार्य
• छंटनी मुआवजा: सेवा के प्रत्येक वर्ष के लिए 15 दिन का वेतन
• बिना नोटिस या नोटिस के बदले भुगतान के बिना बर्खास्तगी नहीं
• गलत बर्खास्तगी: पुनर्स्थापना + बकाया वेतन का दावा कर सकते हैं`,
      steps: [
        'हमेशा लिखित बर्खास्तगी पत्र मांगें',
        'जांचें कि नोटिस अवधि दी गई या नहीं',
        'अवैतनिक वेतन, PF, ग्रेच्युटी का दावा करें',
        'बर्खास्तगी के 3 साल के भीतर श्रम न्यायालय में शिकायत दर्ज करें',
      ],
    },
    mr: {
      summary: 'चुकीच्या पद्धतीने नोकरी काढणे बेकायदेशीर आहे. नियोक्त्याने योग्य प्रक्रिया पाळणे आवश्यक आहे.',
      detail: `औद्योगिक विवाद कायदा 1947 नुसार तुमचे अधिकार:
• नोटीस कालावधी: 1+ वर्षे सेवेसाठी 30 दिवसांची लेखी नोटीस अनिवार्य
• छाटणी नुकसानभरपाई: सेवेच्या प्रत्येक वर्षासाठी 15 दिवसांचा पगार
• चुकीची बडतर्फी: पुनर्स्थापना + थकीत वेतनाचा दावा करता येतो`,
      steps: [
        'नेहमी लेखी बडतर्फी पत्र मागा',
        'नोटीस कालावधी दिला का ते तपासा',
        'थकीत पगार, PF, ग्रॅच्युइटीचा दावा करा',
        'बडतर्फीनंतर 3 वर्षांच्या आत कामगार न्यायालयात तक्रार करा',
      ],
    },
    followUps: {
      en: ['What documents to keep after termination?', 'How to file wrongful termination complaint?', 'Am I entitled to full and final settlement?', 'What is the notice period I must give?'],
      hi: ['बर्खास्तगी के बाद कौन से दस्तावेज रखें?', 'गलत बर्खास्तगी की शिकायत कैसे दर्ज करें?', 'क्या मैं पूर्ण और अंतिम निपटान का हकदार हूं?'],
      mr: ['बडतर्फीनंतर कोणते कागदपत्र ठेवावेत?', 'चुकीच्या बडतर्फीची तक्रार कशी करावी?'],
    },
  },

  // ── WOMEN SAFETY / POSH ──
  {
    id: 'women_safety',
    topic: 'Women Safety & POSH',
    keywords: ['posh', 'women safety', 'harassment', 'sexual harassment', 'workplace harassment', 'icc', 'complaints committee', 'महिला सुरक्षा', 'उत्पीड़न', 'छेड़छाड़', 'महिला सुरक्षितता'],
    en: {
      summary: 'Every woman worker has the right to a safe workplace. Sexual Harassment of Women at Workplace Act (POSH Act) 2013 protects all women.',
      detail: `POSH Act (Prevention of Sexual Harassment) 2013:
• Applies to ALL workplaces — offices, factories, shops, homes
• Internal Complaints Committee (ICC) mandatory for 10+ employees
• Local Complaints Committee (LCC) for unorganized sector
• Complaints must be resolved within 90 days
• Confidentiality is legally protected — name cannot be revealed
• Employer penalized if ICC not formed: up to ₹50,000 fine

Types of harassment covered:
Physical, verbal, non-verbal, quid pro quo, hostile environment

National helpline: 181 (Women Helpline)`,
      steps: [
        'Write down the incident with date, time, location, witnesses',
        'File complaint with Internal Complaints Committee (ICC) within 3 months',
        'If no ICC — file complaint at Local Complaints Committee (District Collector office)',
        'You can also file FIR under IPC Section 354A',
        'Contact 181 helpline for immediate support',
        'JanKam Women Safety Desk is available for confidential support',
      ],
    },
    hi: {
      summary: 'हर महिला कर्मचारी को सुरक्षित कार्यस्थल का अधिकार है। POSH अधिनियम 2013 सभी महिलाओं की रक्षा करता है।',
      detail: `POSH अधिनियम 2013:
• सभी कार्यस्थलों पर लागू
• 10+ कर्मचारियों पर ICC अनिवार्य
• शिकायत 90 दिनों में हल होनी चाहिए
• गोपनीयता कानूनी रूप से संरक्षित है

राष्ट्रीय हेल्पलाइन: 181`,
      steps: [
        'तारीख, समय, स्थान के साथ घटना लिखें',
        '3 महीने के भीतर ICC में शिकायत दर्ज करें',
        'ICC न हो तो LCC में शिकायत करें',
        'FIR: IPC धारा 354A के तहत',
        '181 हेल्पलाइन पर तुरंत सहायता लें',
      ],
    },
    mr: {
      summary: 'प्रत्येक महिला कामगाराला सुरक्षित कार्यस्थळाचा अधिकार आहे. POSH कायदा 2013 सर्व महिलांचे संरक्षण करतो.',
      detail: `POSH कायदा 2013:
• सर्व कार्यस्थळांना लागू
• 10+ कर्मचाऱ्यांसाठी ICC अनिवार्य
• तक्रार 90 दिवसांत निकाली काढली जाणे आवश्यक
• गोपनीयता कायदेशीररित्या संरक्षित आहे

राष्ट्रीय हेल्पलाइन: 181`,
      steps: [
        'तारीख, वेळ, ठिकाण यासह घटना लिहा',
        '3 महिन्यांत ICC कडे तक्रार करा',
        'ICC नसल्यास LCC कडे जा',
        'FIR: IPC कलम 354A अंतर्गत',
        '181 हेल्पलाइनवर त्वरित मदत घ्या',
      ],
    },
    followUps: {
      en: ['How do I file a POSH complaint?', 'What if my company has no ICC?', 'Is my complaint kept confidential?', 'Can I file a police complaint for workplace harassment?', 'What is the National Women Helpline number?'],
      hi: ['POSH शिकायत कैसे दर्ज करें?', 'अगर कंपनी में ICC न हो?', 'क्या मेरी शिकायत गोपनीय रहेगी?'],
      mr: ['POSH तक्रार कशी करायची?', 'कंपनीत ICC नसल्यास काय?', 'तक्रार गुप्त ठेवली जाईल का?'],
    },
  },

  // ── LEAVE RIGHTS ──
  {
    id: 'leave',
    topic: 'Leave Rights',
    keywords: ['leave', 'annual leave', 'sick leave', 'casual leave', 'earned leave', 'छुट्टी', 'रजा', 'अवकाश', 'leave denied'],
    en: {
      summary: 'Workers have legal rights to paid leave. Denying earned leave is illegal.',
      detail: `Maharashtra Shops & Establishments Act / Factories Act:
• Earned/Annual Leave: 1 day per 20 days worked (Factories), minimum 12 days/year
• Sick Leave: 7 days/year (paid, on medical certificate)
• Casual Leave: 8 days/year
• National/Festival Holidays: 14 per year (paid)
• Maternity Leave: 26 weeks (paid) for first 2 children
• Leave encashment: Unused leaves must be paid on leaving`,
      steps: [
        'Apply for leave in writing (email/letter) and keep a copy',
        'If leave denied — ask for written reasons',
        'Track all your leaves in a personal diary',
        'On leaving — demand leave encashment for unused leaves',
        'File complaint if leave encashment not given',
      ],
    },
    hi: {
      summary: 'श्रमिकों को कानूनी रूप से वेतन सहित छुट्टी का अधिकार है। अर्जित छुट्टी से इनकार करना अवैध है।',
      detail: `कारखाना अधिनियम/महाराष्ट्र दुकान अधिनियम:
• अर्जित छुट्टी: 20 कार्यदिवसों पर 1 दिन
• बीमार छुट्टी: 7 दिन/वर्ष
• आकस्मिक छुट्टी: 8 दिन/वर्ष
• राष्ट्रीय/त्योहार छुट्टी: 14 दिन/वर्ष (वेतन सहित)
• मातृत्व अवकाश: 26 सप्ताह`,
      steps: [
        'लिखित रूप में छुट्टी के लिए आवेदन करें',
        'यदि छुट्टी मना हो — लिखित कारण मांगें',
        'व्यक्तिगत डायरी में सभी छुट्टियां ट्रैक करें',
        'नौकरी छोड़ने पर अनुपयोगी छुट्टियों का नकदीकरण मांगें',
      ],
    },
    mr: {
      summary: 'कामगारांना कायदेशीर पगारी रजेचा अधिकार आहे. अर्जित रजा नाकारणे बेकायदेशीर आहे.',
      detail: `कारखाना कायदा / महाराष्ट्र दुकान कायदा:
• अर्जित रजा: 20 कार्यदिवसांत 1 दिवस
• आजारी रजा: 7 दिवस/वर्ष
• आकस्मिक रजा: 8 दिवस/वर्ष
• राष्ट्रीय/सण सुट्टी: 14 दिवस/वर्ष (पगारी)`,
      steps: [
        'लेखी स्वरूपात रजेसाठी अर्ज करा',
        'रजा नाकारल्यास लेखी कारण मागा',
        'सर्व रजा वैयक्तिक डायरीत नोंदवा',
        'नोकरी सोडताना न वापरलेल्या रजेचे रोखीकरण मागा',
      ],
    },
    followUps: {
      en: ['How many leaves am I entitled to per year?', 'Can employer refuse to pay leave encashment?', 'What is maternity leave entitlement?', 'Can I be fired for taking sick leave?'],
      hi: ['मुझे प्रति वर्ष कितनी छुट्टियां मिलनी चाहिए?', 'क्या नियोक्ता छुट्टी नकदीकरण देने से मना कर सकता है?'],
      mr: ['मला दरवर्षी किती रजा मिळावी?', 'नियोक्ता रजा रोखीकरण नाकारू शकतो का?'],
    },
  },

  // ── SALARY DELAY ──
  {
    id: 'salary_delay',
    topic: 'Salary Delay & Non-Payment',
    keywords: ['salary delay', 'salary not given', 'payment not received', 'pending salary', 'vetan nahi', 'वेतन नहीं', 'salary roka', 'salary pending'],
    en: {
      summary: 'Salary must be paid by the 7th (factories) or 10th (other) of the following month. Delay is illegal.',
      detail: `Payment of Wages Act, 1936:
• Due date: 7th of next month (factories/mines), 10th for others
• Penalty for delay: Fine + compensation to worker
• Deductions only allowed: PF, ESIC, Advances, Income Tax, Uniform
• Deductions ILLEGAL: For damage, poor work (without enquiry), fines
• If not paid: File with Payment of Wages Inspector or Labour Court`,
      steps: [
        'Send written/WhatsApp message to HR about pending salary',
        'Note all months where salary was delayed or not paid',
        'Contact Payment of Wages Inspector at District Labour Office',
        'File application in Labour Court under Section 15 of PWA',
        'Relief: Unpaid salary + 10x compensation in some cases',
      ],
    },
    hi: {
      summary: 'वेतन अगले महीने की 7 तारीख (कारखाने) या 10 तारीख तक दिया जाना चाहिए। देरी अवैध है।',
      detail: `मजदूरी भुगतान अधिनियम, 1936:
• नियत तारीख: अगले महीने की 7 तारीख तक
• देरी के लिए जुर्माना + कर्मचारी को मुआवजा
• अनुमत कटौती: PF, ESIC, अग्रिम, आयकर
• अवैध कटौती: क्षति, खराब काम के लिए (बिना जांच के)`,
      steps: [
        'HR को लिखित/WhatsApp संदेश भेजें',
        'देरी के सभी महीने नोट करें',
        'जिला श्रम कार्यालय में शिकायत दर्ज करें',
      ],
    },
    mr: {
      summary: 'पगार पुढील महिन्याच्या 7 तारखेपर्यंत (कारखाने) दिला जाणे आवश्यक आहे. उशीर बेकायदेशीर आहे.',
      detail: `मजुरी देय कायदा, 1936:
• देय तारीख: पुढील महिन्याच्या 7 तारखेपर्यंत
• उशिरासाठी दंड + कामगाराला नुकसानभरपाई
• परवानगीप्राप्त कपात: PF, ESIC, अग्रिम, आयकर`,
      steps: [
        'HR ला लेखी/WhatsApp संदेश पाठवा',
        'उशीर झालेले सर्व महिने नोंदवा',
        'जिल्हा कामगार कार्यालयात तक्रार करा',
      ],
    },
    followUps: {
      en: ['How to file salary delay complaint?', 'Can I get compensation for salary delay?', 'What deductions from salary are legal?', 'Can employer withhold salary as punishment?'],
      hi: ['वेतन देरी की शिकायत कैसे करें?', 'क्या वेतन देरी के लिए मुआवजा मिलेगा?'],
      mr: ['पगार उशिराची तक्रार कशी करायची?', 'पगार उशिरासाठी नुकसानभरपाई मिळेल का?'],
    },
  },

  // ── MATERNITY ──
  {
    id: 'maternity',
    topic: 'Maternity Benefits',
    keywords: ['maternity', 'pregnancy', 'maternity leave', 'maternity benefit', 'मातृत्व', 'गर्भावस्था', 'मातृत्व अवकाश', 'प्रसूती'],
    en: {
      summary: 'Women workers are entitled to 26 weeks of paid maternity leave for the first two children.',
      detail: `Maternity Benefit Act 1961 (Amended 2017):
• Paid maternity leave: 26 weeks (first 2 children), 12 weeks (3rd+ child)
• Can take up to 8 weeks before expected delivery
• No dismissal during maternity leave period
• Medical bonus: ₹3,500 if no employer-provided medical care
• Work from home provision: After leave if employer agrees
• Creche facility: Mandatory for 50+ employee companies
• Eligibility: 80+ days worked in last 12 months`,
      steps: [
        'Inform employer 8 weeks before expected delivery',
        'Get Form A from HR (Notice of leave)',
        'Submit medical certificate',
        'Receive maternity benefit continuously during leave',
        'If dismissed — file complaint under Maternity Benefit Act',
      ],
    },
    hi: {
      summary: 'महिला कर्मचारियों को पहले दो बच्चों के लिए 26 सप्ताह का वेतन सहित मातृत्व अवकाश मिलता है।',
      detail: `मातृत्व लाभ अधिनियम 1961:
• 26 सप्ताह (पहले 2 बच्चे), 12 सप्ताह (तीसरा+)
• प्रसव से 8 सप्ताह पहले तक ले सकती हैं
• मातृत्व अवकाश के दौरान बर्खास्तगी नहीं
• चिकित्सा बोनस: ₹3,500`,
      steps: [
        'प्रसव से 8 सप्ताह पहले नियोक्ता को सूचित करें',
        'HR से Form A लें',
        'चिकित्सा प्रमाण पत्र जमा करें',
      ],
    },
    mr: {
      summary: 'महिला कामगारांना पहिल्या दोन मुलांसाठी 26 आठवड्यांची पगारी मातृत्व रजा मिळते.',
      detail: `मातृत्व लाभ कायदा 1961:
• 26 आठवडे (पहिली 2 मुले), 12 आठवडे (3रे+)
• प्रसूतीच्या 8 आठवडे आधी घेता येते
• मातृत्व रजेदरम्यान बडतर्फी नाही
• वैद्यकीय बोनस: ₹3,500`,
      steps: [
        'प्रसूतीच्या 8 आठवडे आधी नियोक्त्याला कळवा',
        'HR कडून Form A घ्या',
        'वैद्यकीय प्रमाणपत्र सादर करा',
      ],
    },
    followUps: {
      en: ['How to apply for maternity leave?', 'Can I be fired while on maternity leave?', 'What is the medical bonus under maternity benefit act?', 'What if employer refuses maternity leave?'],
      hi: ['मातृत्व अवकाश के लिए कैसे आवेदन करें?', 'क्या मातृत्व अवकाश के दौरान निकाला जा सकता है?'],
      mr: ['मातृत्व रजेसाठी कसा अर्ज करावा?', 'मातृत्व रजेदरम्यान काढले जाऊ शकते का?'],
    },
  },

  // ── BONUS ──
  {
    id: 'bonus',
    topic: 'Annual Bonus',
    keywords: ['bonus', 'annual bonus', 'statutory bonus', 'festival bonus', 'diwali bonus', 'बोनस', 'वार्षिक बोनस'],
    en: {
      summary: 'Workers earning up to ₹21,000/month are entitled to statutory bonus of minimum 8.33% of annual wages.',
      detail: `Payment of Bonus Act 1965:
• Eligible: Employees earning ≤ ₹21,000/month
• Minimum bonus: 8.33% of annual wages (or ₹100 minimum)
• Maximum bonus: 20% of annual wages
• Payable: Within 8 months of financial year end
• Minimum 30 working days in the year required
• Allocable surplus determines actual bonus percentage`,
      steps: [
        'Check if you qualify (≤ ₹21,000/month salary)',
        'Employer must display the bonus amount notice',
        'If not paid — file complaint at Labour Commissioner',
        'Deadline: Bonus must be paid by November 30',
      ],
    },
    hi: {
      summary: '₹21,000/माह तक कमाने वाले कर्मचारियों को वार्षिक वेतन का न्यूनतम 8.33% बोनस मिलने का हकदार हैं।',
      detail: `बोनस भुगतान अधिनियम 1965:
• पात्रता: ≤ ₹21,000/माह
• न्यूनतम बोनस: वार्षिक वेतन का 8.33%
• अधिकतम: 20%
• भुगतान: वित्त वर्ष समाप्ति के 8 महीने के भीतर`,
      steps: [
        'जांचें कि आप पात्र हैं (≤ ₹21,000/माह)',
        'न मिले तो श्रम आयुक्त को शिकायत करें',
        'समयसीमा: 30 नवंबर तक',
      ],
    },
    mr: {
      summary: '₹21,000/महिना पर्यंत कमावणाऱ्या कर्मचाऱ्यांना वार्षिक वेतनाच्या किमान 8.33% बोनस मिळण्याचा अधिकार आहे.',
      detail: `बोनस देय कायदा 1965:
• पात्रता: ≤ ₹21,000/महिना
• किमान बोनस: वार्षिक वेतनाच्या 8.33%
• जास्तीत जास्त: 20%
• देय: आर्थिक वर्ष संपल्यापासून 8 महिन्यांत`,
      steps: [
        'पात्रता तपासा',
        'न मिळाल्यास कामगार आयुक्तांकडे तक्रार करा',
        'मुदत: 30 नोव्हेंबरपर्यंत',
      ],
    },
    followUps: {
      en: ['When should bonus be paid?', 'Is my employer obligated to pay bonus?', 'What if bonus is not paid?', 'How is bonus calculated?'],
      hi: ['बोनस कब दिया जाना चाहिए?', 'क्या नियोक्ता बोनस देने के लिए बाध्य है?'],
      mr: ['बोनस कधी दिला जावा?', 'नियोक्ता बोनस देण्यास बांधील आहे का?'],
    },
  },

  // ── RESIGNATION ──
  {
    id: 'resignation',
    topic: 'Resignation & Notice Period',
    keywords: ['resign', 'resignation', 'notice period', 'quit job', 'leave job', 'full final settlement', 'f&f', 'इस्तीफा', 'नोकरी सोडणे', 'राजीनामा'],
    en: {
      summary: 'You have the right to resign from any job. Proper notice period must be given as per your appointment letter or standing orders.',
      detail: `Resignation process:
• Notice period: As per appointment letter (typically 30–90 days)
• Can resign without reason — it is your right
• Full & Final Settlement must be paid within 30–45 days
• F&F includes: Pending salary, Leave encashment, PF transfer, Gratuity (5+ years), Bonus (if applicable)
• Notice buyout: You can pay notice period salary to leave early (subject to employer agreement)
• Immediate resignation: Possible in cases of harassment, illegal activity, or medical emergency`,
      steps: [
        'Submit resignation letter in writing to HR and reporting manager',
        'Keep acknowledged copy with company stamp/signature',
        'Serve notice period or negotiate notice buyout',
        'Apply for PF transfer online on EPFO portal',
        'Demand F&F settlement in writing within 30 days',
        'If F&F not paid — file complaint at Labour Court',
      ],
    },
    hi: {
      summary: 'आपको किसी भी नौकरी से इस्तीफा देने का अधिकार है। नियुक्ति पत्र के अनुसार उचित नोटिस अवधि देनी होगी।',
      detail: `इस्तीफा प्रक्रिया:
• नोटिस अवधि: नियुक्ति पत्र के अनुसार (30-90 दिन)
• बिना कारण इस्तीफा दे सकते हैं
• F&F: 30-45 दिनों के भीतर
• F&F में: बकाया वेतन, छुट्टी नकदीकरण, PF, ग्रेच्युटी (5+ वर्ष)`,
      steps: [
        'HR को लिखित इस्तीफा पत्र दें',
        'स्वीकृत प्रति अपने पास रखें',
        'नोटिस अवधि पूरी करें',
        'EPFO पोर्टल पर PF ट्रांसफर के लिए आवेदन करें',
        '30 दिनों के भीतर F&F मांगें',
      ],
    },
    mr: {
      summary: 'कोणत्याही नोकरीतून राजीनामा देण्याचा तुम्हाला अधिकार आहे. नियुक्ती पत्रानुसार योग्य नोटीस कालावधी द्यावा लागेल.',
      detail: `राजीनामा प्रक्रिया:
• नोटीस कालावधी: नियुक्ती पत्रानुसार (30-90 दिवस)
• कारण न देता राजीनामा देता येतो
• F&F: 30-45 दिवसांत
• F&F मध्ये: थकीत पगार, रजा रोखीकरण, PF, ग्रॅच्युइटी`,
      steps: [
        'HR ला लेखी राजीनामा द्या',
        'स्वीकृत प्रत स्वतःकडे ठेवा',
        'नोटीस कालावधी पूर्ण करा',
        'EPFO पोर्टलवर PF हस्तांतरणासाठी अर्ज करा',
        '30 दिवसांत F&F मागा',
      ],
    },
    followUps: {
      en: ['What is included in full and final settlement?', 'Can employer hold my salary during notice period?', 'What if employer refuses to accept resignation?', 'Can I resign immediately without notice?'],
      hi: ['F&F में क्या शामिल है?', 'क्या नोटिस के दौरान नियोक्ता वेतन रोक सकता है?'],
      mr: ['F&F मध्ये काय समाविष्ट आहे?', 'नोटीस कालावधीत नियोक्ता पगार रोखू शकतो का?'],
    },
  },
];

export default knowledgeBase;
