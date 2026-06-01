import { useState, useRef } from 'react';
import { Download, Printer, Languages, MapPin, Sparkles, FileText, CheckCircle, Heart, Phone, Users } from 'lucide-react';

type PosterType = 'factory' | 'construction' | 'general' | 'whatsapp' | 'rights' | 'safety' | 'movement';
type Language = 'en' | 'hi' | 'mr';
type District = 'general' | 'pune' | 'mumbai' | 'thane' | 'nashik' | 'nagpur' | 'kolhapur' | 'aurangabad';
type LayoutFormat = 'a4_portrait' | 'a4_landscape' | 'a3_portrait' | 'social_share' | 'status_share';

interface PosterTemplate {
  id: PosterType;
  icon: typeof FileText;
  en: { title: string; subtitle: string; desc?: string };
  hi: { title: string; subtitle: string; desc?: string };
  mr: { title: string; subtitle: string; desc?: string };
}

const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: 'factory',
    icon: FileText,
    en: {
      title: "WORKERS DESERVE JUSTICE",
      subtitle: "File Complaints · Know Your Rights · Track Your Cases · Join JanKam",
      desc: "Get free support if you face wage theft, salary delays, illegal deductions, or unsafe shop floors."
    },
    hi: {
      title: "मजदूरों को न्याय मिलना चाहिए",
      subtitle: "शिकायत दर्ज करें · अधिकार जानें · केस ट्रैक करें · जनकाम से जुड़ें",
      desc: "यदि आपको वेतन चोरी, वेतन में देरी, अवैध कटौती, या असुरक्षित कार्यस्थल का सामना करना पड़ता है तो मुफ्त सहायता प्राप्त करें।"
    },
    mr: {
      title: "कामगारांना न्याय मिळालाच पाहिजे",
      subtitle: "तक्रार नोंदवा · अधिकार जाणून घ्या · केस ट्रॅक करा · जनकामशी जोडा",
      desc: "पगार चोरी, विलंबाने मिळणारे वेतन, बेकायदेशीर कपात किंवा असुरक्षित कार्यस्थळाचा सामना करावा लागत असल्यास मोफत मदत मिळवा."
    }
  },
  {
    id: 'construction',
    icon: FileText,
    en: {
      title: "SALARY NOT PAID? OVERTIME NOT GIVEN?",
      subtitle: "PF ISSUE? ESIC ISSUE? SCAN & GET HELP INSTANTLY",
      desc: "Free legal support, union solidarity, and district commissioner advocacy for construction, masonry, and contract labourers."
    },
    hi: {
      title: "वेतन नहीं मिला? ओवरटाइम नहीं दिया?",
      subtitle: "पीएफ समस्या? ईएसआईसी समस्या? स्कैन करें और तुरंत मदद पाएं",
      desc: "निर्माण, राजमिस्त्री और अनुबंध पर काम करने वाले मजदूरों के लिए मुफ्त कानूनी सहायता, यूनियन एकजुटता और जिला आयुक्त वकालत।"
    },
    mr: {
      title: "पगार मिळाला नाही? ओव्हरटाईम दिला नाही?",
      subtitle: "पीएफ समस्या? ईएसआयसी समस्या? स्कॅन करा आणि त्वरित मदत मिळवा",
      desc: "बांधकाम, गवंडी आणि कंत्राटी कामगारांसाठी मोफत कायदेशीर मदत, युनियनची एकजूट आणि जिल्हा कामगार आयुक्त कार्यालयाकडे पाठपुरावा."
    }
  },
  {
    id: 'general',
    icon: Users,
    en: {
      title: "JAN KAM STANDS WITH WORKERS",
      subtitle: "No worker should fight exploitation alone. Scan to secure your basic rights today.",
      desc: "Protecting statutory minimum wages, double-rate overtime, gratuity claims, and occupational health rules."
    },
    hi: {
      title: "जनकाम मजदूरों के साथ खड़ा है",
      subtitle: "किसी भी मजदूर को अकेले शोषण से नहीं लड़ना चाहिए। आज ही अपने अधिकारों को सुरक्षित करने के लिए स्कैन करें।",
      desc: "वैधानिक न्यूनतम मजदूरी, डबल-रेट ओवरटाइम, ग्रेच्युटी दावों और व्यावसायिक स्वास्थ्य नियमों का संरक्षण।"
    },
    mr: {
      title: "जनकाम कामगारांच्या पाठीशी खंबीरपणे उभे आहे",
      subtitle: "कोणत्याही कामगाराने शोषणाविरुद्ध एकट्याने लढू नये. आजच तुमचे मूलभूत कायदेशीर हक्क सुरक्षित करण्यासाठी स्कॅन करा.",
      desc: "वैधानिक किमान वेतन, दुप्पट दराने ओव्हरटाईम, ग्रॅच्युइटीचे दावे आणि कामाच्या ठिकाणच्या आरोग्य नियमांचे संरक्षण."
    }
  },
  {
    id: 'whatsapp',
    icon: Phone,
    en: {
      title: "JOIN MAHARASHTRA LABOUR UNION COMMUNITY",
      subtitle: "Connect With Workers Across Maharashtra · Join WhatsApp Community",
      desc: "Receive daily alerts on legal rights updates, direct union assistance guidelines, and join solidarity drives."
    },
    hi: {
      title: "महाराष्ट्र लेबर यूनियन कम्युनिटी में शामिल हों",
      subtitle: "महाराष्ट्र भर के मजदूरों से जुड़ें · आधिकारिक व्हाट्सएप कम्युनिटी में शामिल हों",
      desc: "कानूनी अधिकारों के अपडेट, प्रत्यक्ष यूनियन सहायता दिशानिर्देशों पर दैनिक अलर्ट प्राप्त करें, और एकजुटता अभियानों में शामिल हों।"
    },
    mr: {
      title: "महाराष्ट्र कामगार युनियन कम्युनिटीमध्ये सामील व्हा",
      subtitle: "महाराष्ट्रभरातील कामगारांशी जोडा · अधिकृत व्हॉट्सॲप कम्युनिटीमध्ये सामील व्हा",
      desc: "कायदेशीर हक्कांचे अपडेट्स, थेट युनियन मदतीची मार्गदर्शक तत्त्वे आणि कामगार चळवळींबद्दल रोज अलर्ट मिळवा."
    }
  },
  {
    id: 'rights',
    icon: CheckCircle,
    en: {
      title: "KNOW YOUR LABOUR RIGHTS",
      subtitle: "Minimum Wage · Overtime (2x) · PF Accounts · ESIC Healthcare · Women POSH Protection",
      desc: "Scan to access our digital library, perform salary audits, check compliance codes, and claim your entitlements."
    },
    hi: {
      title: "अपने कामगार अधिकारों को जानें",
      subtitle: "न्यूनतम वेतन · ओवरटाइम (2x) · पीएफ खाते · ईएसआईसी स्वास्थ्य · महिला पॉश (POSH) संरक्षण",
      desc: "डिजिटल लाइब्रेरी तक पहुँचने, वेतन ऑडिट करने, अनुपालन कोड की जाँच करने और अपनी पात्रता का दावा करने के लिए स्कैन करें।"
    },
    mr: {
      title: "तुमचे कामगार अधिकार जाणून घ्या",
      subtitle: "किमान वेतन · ओव्हरटाईम (२x) · पीएफ खाती · ईएसआयसी आरोग्य सेवा · महिला पॉश (POSH) संरक्षण",
      desc: "डिजिटल लायब्ररीमध्ये प्रवेश मिळवण्यासाठी, वेतनाचे ऑडिट करण्यासाठी, नियमांची तपासणी करण्यासाठी आणि तुमचे हक्क मिळवण्यासाठी स्कॅन करा."
    }
  },
  {
    id: 'safety',
    icon: Heart,
    en: {
      title: "SAFE WORKPLACES FOR WOMEN WORKERS",
      subtitle: "POSH Rights · Anti-Harassment Reporting · Maternity Leaves · Dedicated Safety helpline",
      desc: "JanKam ensures every woman worker is protected against harassment, receives mandatory maternity leaves, and has secure working environments."
    },
    hi: {
      title: "महिला श्रमिकों के लिए सुरक्षित कार्यस्थल",
      subtitle: "पॉश (POSH) अधिकार · उत्पीड़न विरोधी रिपोर्टिंग · मातृत्व अवकाश · समर्पित सुरक्षा हेल्पलाइन",
      desc: "जनकाम यह सुनिश्चित करता है कि प्रत्येक महिला श्रमिक उत्पीड़न से सुरक्षित रहे, अनिवार्य मातृत्व अवकाश प्राप्त करे, और उसका कार्य वातावरण सुरक्षित हो।"
    },
    mr: {
      title: "महिला कामगारांसाठी सुरक्षित कार्यस्थळ",
      subtitle: "पॉश (POSH) अधिकार · छळवणुकीविरुद्ध तक्रार · मातृत्व रजा · समर्पित महिला सुरक्षा हेल्पलाइन",
      desc: "जनकाम हे सुनिश्चित करते की प्रत्येक महिला कामगाराचे छळवणुकीपासून संरक्षण होईल, हक्काची मातृत्व रजा मिळेल आणि सुरक्षित कामाचे वातावरण असेल."
    }
  },
  {
    id: 'movement',
    icon: Sparkles,
    en: {
      title: "JAN KAM STANDS WITH EVERY WORKER",
      subtitle: "No worker should stand alone. Protected by JanKam support network.",
      desc: "From factory workers, construction workers, drivers, farm workers, sanitation workers, security guards, contract workers, office staff, warehouse workers, manufacturing workers, and industrial labourers — JanKam stands with you."
    },
    hi: {
      title: "जनकाम हर मजदूर के साथ खड़ा है",
      subtitle: "कोई भी मजदूर अकेला नहीं रहेगा। जनकाम सहायता नेटवर्क द्वारा सुरक्षित।",
      desc: "फैक्ट्री श्रमिकों, निर्माण श्रमिकों, ड्राइवरों, कृषि श्रमिकों, स्वच्छता कर्मचारियों, सुरक्षा गार्डों, अनुबंध श्रमिकों, कार्यालय कर्मचारियों, गोदाम श्रमिकों, विनिर्माण श्रमिकों और औद्योगिक मजदूरों तक — जनकाम आपके साथ खड़ा है।"
    },
    mr: {
      title: "जनकाम प्रत्येक कामगाराच्या पाठीशी खंबीरपणे उभे आहे",
      subtitle: "कोणताही कामगार एकटा उभा राहणार नाही. जनकाम समर्थन नेटवर्कद्वारे संरक्षित.",
      desc: "फॅक्टरी कामगार, बांधकाम कामगार, ड्रायव्हर, शेतमजूर, स्वच्छता कामगार, सुरक्षा रक्षक, कंत्राटी कामगार, कार्यालयीन कर्मचारी, वेअरहाऊस कामगार, मॅन्युफॅक्चरिंग कामगार आणि औद्योगिक मजूर — जनकाम तुमच्या पाठीशी उभे आहे."
    }
  }
];

const DISTRICT_INFO: Record<District, { name: string; localDesk: string; phone: string }> = {
  general: { name: "All Districts", localDesk: "Maharashtra Labour Rights Desk", phone: "+91 7218028783" },
  pune: { name: "Pune Division", localDesk: "Pune Labour Rights Advocacy Desk", phone: "+91 7218028783 (Pune)" },
  mumbai: { name: "Mumbai Division", localDesk: "Mumbai Workers Support Network", phone: "+91 7218028783 (Mumbai)" },
  thane: { name: "Thane Division", localDesk: "Thane Industrial Labour Desk", phone: "+91 7218028783 (Thane)" },
  nashik: { name: "Nashik Division", localDesk: "Nashik Labour Rights Council", phone: "+91 7218028783 (Nashik)" },
  nagpur: { name: "Nagpur Division", localDesk: "Nagpur Vidarbha Workers Assembly", phone: "+91 7218028783 (Nagpur)" },
  kolhapur: { name: "Kolhapur Division", localDesk: "Kolhapur Workers Union Desk", phone: "+91 7218028783 (Kolhapur)" },
  aurangabad: { name: "Aurangabad Division", localDesk: "Chhatrapati Sambhajinagar Labour Desk", phone: "+91 7218028783 (Sambhajinagar)" }
};

export default function PosterGenerator() {
  const [selectedType, setSelectedType] = useState<PosterType>('factory');
  const [language, setLanguage] = useState<Language>('hi');
  const [district, setDistrict] = useState<District>('general');
  const [layout, setLayout] = useState<LayoutFormat>('a4_portrait');
  const posterRef = useRef<HTMLDivElement>(null);

  const activeTemplate = POSTER_TEMPLATES.find(p => p.id === selectedType)!;
  const distInfo = DISTRICT_INFO[district];

  // Dynamic QR Code generation URL pointing to landing page with analytical tracking parameters
  const siteUrl = window.location.origin;
  const trackingParams = `utm_source=qr&utm_district=${district}&utm_poster=${selectedType}`;
  const qrTargetUrl = `${siteUrl}?${trackingParams}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&ecc=H&data=${encodeURIComponent(qrTargetUrl)}`;

  // Translation helpers for fixed UI titles/badges inside posters
  const tr = {
    en: {
      badge: "100% FREE · CONFIDENTIAL · WORKER FRIENDLY",
      support: "Scan To Get Help Now",
      subline: "Labour Rights Desk · Workers Support Network",
      helpline: "Official Union Helpline",
      wa: "Join WhatsApp Community",
      cta: "SCAN TO FILE COMPLAINT / JOIN UNION",
      freeTag: "No Registration Fee · No Hidden Charges",
      trustFooter: "Your Complaint. Your Rights. Your Voice. Protected by JanKam.",
      stands: "YOU ARE NOT ALONE"
    },
    hi: {
      badge: "100% मुफ्त · गोपनीय · मजदूर हितैषी",
      support: "अभी मदद पाने के लिए स्कैन करें",
      subline: "लेबर राइट्स डेस्क · वर्कर्स सपोर्ट नेटवर्क",
      helpline: "आधिकारिक यूनियन हेल्पलाइन",
      wa: "व्हाट्सएप कम्युनिटी से जुड़ें",
      cta: "शिकायत दर्ज करने / यूनियन में शामिल होने के लिए स्कैन करें",
      freeTag: "कोई पंजीकरण शुल्क नहीं · कोई छिपा हुआ शुल्क नहीं",
      trustFooter: "आपकी शिकायत। आपके अधिकार। आपकी आवाज़। जनकाम द्वारा सुरक्षित।",
      stands: "आप अकेले नहीं हैं"
    },
    mr: {
      badge: "१००% मोफत · गोपनीय · कामगार स्नेही",
      support: "त्वरित मदतीसाठी स्कॅन करा",
      subline: "कामगार हक्क डेस्क · वर्कर्स सपोर्ट नेटवर्क",
      helpline: "अधिकृत युनियन हेल्पलाईन",
      wa: "व्हॉट्सॲप कम्युनिटीमध्ये सामील व्हा",
      cta: "तक्रार नोंदवण्यासाठी / युनियनमध्ये सामील होण्यासाठी स्कॅन करा",
      freeTag: "कोणतेही नोंदणी शुल्क नाही · कोणतेही छुपे शुल्क नाही",
      trustFooter: "तुमची तक्रार. तुमचे अधिकार. तुमचा आवाज. जनकामद्वारे सुरक्षित.",
      stands: "तुम्ही एकटे नाही आहात"
    }
  }[language];

  // Print function which triggers high-resolution window print specifically styled for A4/A3 aspect ratios
  const handlePrint = () => {
    const printContent = posterRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a printable page frame
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>JanKam Campaign Poster - ${selectedType}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@800;900&display=swap');
            body {
              margin: 0;
              padding: 0;
              background: #0A1931;
              color: white;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
            }
            .print-container {
              width: ${layout.includes('landscape') ? '297mm' : '210mm'};
              height: ${layout.includes('landscape') ? '210mm' : '297mm'};
              box-sizing: border-box;
              padding: 20mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: linear-gradient(185deg, #0A1931 0%, #0F2347 100%);
              border: 10px solid #F5A623;
              position: relative;
            }
            .text-gold { color: #F5A623 !important; }
            .badge {
              font-size: 11px;
              letter-spacing: 2px;
              color: #F5A623;
              font-weight: 700;
              text-align: center;
              border: 1.5px solid rgba(245,166,35,0.4);
              padding: 6px 12px;
              border-radius: 50px;
              margin: 0 auto;
              text-transform: uppercase;
              background: rgba(245,166,35,0.06);
            }
            .header-text {
              font-family: 'Outfit', sans-serif;
              font-weight: 900;
              font-size: 32px;
              text-align: center;
              line-height: 1.2;
              margin-top: 20px;
            }
            .body-desc {
              font-size: 16px;
              color: rgba(255,255,255,0.85);
              text-align: center;
              max-width: 80%;
              margin: 20px auto;
              line-height: 1.6;
            }
            .qr-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 30px 0;
            }
            .qr-box {
              width: 180px;
              height: 180px;
              background: white;
              padding: 12px;
              border-radius: 12px;
              border: 3px solid #F5A623;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-box img { width: 100%; height: 100%; }
            .helplines {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border-top: 1.5px dashed rgba(255,255,255,0.15);
              padding-top: 20px;
              font-size: 13px;
            }
            .help-col { display: flex; flex-direction: column; gap: 4px; }
            .footer-branding {
              text-align: center;
              font-size: 11px;
              color: rgba(255,255,255,0.4);
              margin-top: 25px;
            }
            @page {
              size: A4 ${layout.includes('landscape') ? 'landscape' : 'portrait'};
              margin: 0;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="print-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const selectedLayoutClass = layout === 'a4_landscape' ? 'flex-row' : 'flex-col';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Configuration Controls Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
      }}>
        {/* Poster Type Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Poster Campaign Type</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as PosterType)}
            style={selectStyle}
          >
            <option value="factory">🏭 Factory / Plant Poster</option>
            <option value="construction">🏗️ Construction Site Poster</option>
            <option value="general">📢 General Worker Awareness</option>
            <option value="whatsapp">💬 WhatsApp Group Onboarding</option>
            <option value="rights">⚖️ Know Your Rights Library</option>
            <option value="safety">🛡️ Women Worker Safety</option>
            <option value="movement">✊ Movement stands with workers</option>
          </select>
        </div>

        {/* Language selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Poster Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            style={selectStyle}
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi / हिंदी</option>
            <option value="mr">🇮🇳 Marathi / मराठी</option>
          </select>
        </div>

        {/* Local District Branding Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Local District Branding</label>
          <select
            value={district}
            onChange={e => setDistrict(e.target.value as District)}
            style={selectStyle}
          >
            <option value="general">All Maharashtra (General)</option>
            <option value="pune">Pune Division Desk</option>
            <option value="mumbai">Mumbai Division Desk</option>
            <option value="thane">Thane Industrial Desk</option>
            <option value="nashik">Nashik Region Desk</option>
            <option value="nagpur">Nagpur Desks</option>
            <option value="kolhapur">Kolhapur Desks</option>
            <option value="aurangabad">Aurangabad Desks</option>
          </select>
        </div>

        {/* Print Size Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Print / Layout Ratio</label>
          <select
            value={layout}
            onChange={e => setLayout(e.target.value as LayoutFormat)}
            style={selectStyle}
          >
            <option value="a4_portrait">📄 A4 Portrait Notice Board</option>
            <option value="a4_landscape">🎴 A4 Landscape Notice Board</option>
            <option value="a3_portrait">📰 A3 Print Ready Banner</option>
            <option value="social_share">📱 WhatsApp Share Card</option>
            <option value="status_share">📱 WhatsApp Status Share</option>
          </select>
        </div>
      </div>

      {/* Editor Main Grid: Live Preview vs Download Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Live A4 Preview Board (8 Columns) */}
        <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Outfit, sans-serif' }}>
            Live Campaign Poster Preview
          </div>

          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* framed paper sheet */}
            <div
              id="campaign-poster-paper"
              ref={posterRef}
              style={{
                width: '100%',
                maxWidth: layout.includes('landscape') ? '720px' : '500px',
                aspectRatio: layout.includes('landscape') ? '1.414' : '0.707',
                background: 'linear-gradient(185deg, #0A1931 0%, #0F2347 100%)',
                color: 'white',
                border: '6px solid #F5A623',
                borderRadius: '8px',
                padding: '30px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
            >
              {/* Caution stripes top decoration */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '4px',
                background: 'repeating-linear-gradient(45deg, #F5A623, #F5A623 10px, #0A1931 10px, #0A1931 20px)'
              }} />

              {/* Poster Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '1.5px',
                    color: '#F5A623',
                    fontWeight: 700,
                    border: '1.2px solid rgba(245,166,35,0.3)',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    background: 'rgba(245,166,35,0.06)',
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  {tr.badge}
                </span>
                
                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: selectedType === 'movement' ? '1.6rem' : '1.9rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    lineHeight: 1.25,
                    color: '#FFFFFF',
                    margin: '6px 0 0',
                    letterSpacing: '-0.5px'
                  }}
                >
                  {selectedType === 'movement' ? (
                    <>
                      {language === 'en' ? 'JAN KAM STANDS WITH ' : language === 'hi' ? 'जनकाम हर ' : 'जनकाम प्रत्येक '}
                      <span style={{ color: '#F5A623' }}>
                        {language === 'en' ? 'EVERY WORKER' : language === 'hi' ? 'मजदूर के साथ' : 'कामगाराच्या पाठीशी'}
                      </span>
                    </>
                  ) : (
                    activeTemplate[language].title
                  )}
                </h1>
              </div>

              {/* Poster Body / Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', margin: '14px 0' }}>
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: 'center',
                    lineHeight: 1.55,
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    fontWeight: 500,
                    maxWidth: '92%'
                  }}
                >
                  {activeTemplate[language].subtitle}
                </p>

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.6)',
                    textAlign: 'center',
                    lineHeight: 1.5,
                    fontFamily: 'Inter, sans-serif',
                    margin: '4px 0 0',
                    fontStyle: 'italic',
                    maxWidth: '88%'
                  }}
                >
                  {activeTemplate[language].desc}
                </p>
              </div>

              {/* QR and Target Box */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 20px 8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.2px solid rgba(245,166,35,0.22)',
                  borderRadius: '16px',
                }}>
                  
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {tr.support}
                  </span>

                  {/* QR Box with Branded details */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#F5A623', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px' }}>
                      JAN KAM
                    </span>

                    <div style={{
                      width: '125px', height: '125px', background: 'white', padding: '8px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}>
                      <img src={qrImageUrl} alt="Outreach scannable QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <span style={{ fontSize: '0.52rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                      {tr.subline}
                    </span>
                  </div>
                </div>
              </div>

              {/* District Local Helpline & Community info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                borderTop: '1.5px dashed rgba(255,255,255,0.12)',
                paddingTop: '14px',
                fontSize: '0.74rem',
                fontFamily: 'Inter, sans-serif'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#F5A623', fontWeight: 700 }}>{distInfo.localDesk}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>{tr.helpline}: {distInfo.phone}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                  <span style={{ color: '#34D399', fontWeight: 700 }}>WhatsApp Helpline</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>+91 7218028783</span>
                </div>
              </div>

              {/* Footer Trust stamp */}
              <div style={{
                textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px',
                fontFamily: 'Inter, sans-serif'
              }}>
                {tr.trustFooter}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Info and Actions (4 Columns) */}
        <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Outfit, sans-serif' }}>
            Outreach Poster Actions
          </div>

          {/* Action box */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
              High-Res Exports
            </h3>
            
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4, margin: 0 }}>
              Generate, audit, and print high-resolution notices to place across shop floors, contract labor zones, factories, transport hubs, and notice boards.
            </p>

            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ width: '100%', fontSize: '0.85rem', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Printer size={16} /> Print Campaign Poster (PDF)
            </button>

            <a
              href={qrImageUrl}
              download={`jankam_outreach_${selectedType}_${language}.png`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ width: '100%', fontSize: '0.85rem', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Download size={16} /> Save High-Res QR Code
            </a>

            <div style={{
              background: 'rgba(245,166,35,0.06)',
              border: '1.2px solid rgba(245,166,35,0.18)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F5A623', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} /> Scannable Error Correction
              </div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                QR code is generated under <strong>Level-H High Error Correction</strong> standards, remaining scannable even if up to 30% of print is smudged, wet, or torn in industrial zones.
              </span>
            </div>
          </div>

          {/* Target Zones */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 800, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recommended Target Zones
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {["MIDC Estates", "Factories", "Construction Sites", "Labour Chowks", "Warehouses", "Shop Floors", "Worker Housing Areas", "Transport Hubs"].map(zone => (
                <span
                  key={zone}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  📍 {zone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: '#0A1931',
  border: '1.5px solid rgba(255,255,255,0.12)',
  color: 'white',
  fontSize: '0.82rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  cursor: 'pointer',
} as React.CSSProperties;
