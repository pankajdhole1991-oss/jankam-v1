import { useState } from 'react';
import { Search, ShieldAlert, BookOpen, Scale, ArrowRight, X, Heart, Shield, CheckCircle, AlertOctagon } from 'lucide-react';

interface RightItem {
  id: string;
  title: string;
  category: 'wages' | 'safety' | 'social_sec' | 'women' | 'legal';
  categoryLabel: string;
  law: string;
  summary: string;
  actName: string;
  meaning: string;
  covered: string;
  obligations: string[];
  workerRights: string[];
  violations: string[];
  example: string;
  nextSteps: string[];
  keywords: string[];
  image: string;
}

export default function LabourRights() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [activeRight, setActiveRight] = useState<RightItem | null>(null);

  const RIGHTS: RightItem[] = [
    {
      id: 'r-min-wage',
      title: 'Right to Minimum Wage',
      category: 'wages',
      categoryLabel: 'Wages & Hours',
      law: 'Minimum Wages Act, 1948',
      summary: 'Every worker in Maharashtra has the right to receive state-mandated minimum wages based on skill level and zone.',
      actName: 'Minimum Wages Act, 1948 (Maharashtra Rules)',
      meaning: 'Every employer is legally bound to pay wages at or above the minimum rates set by the Government of Maharashtra. Paying below this rate is a criminal offense, and any mutual agreement to work for less is legally invalid.',
      covered: 'All manual, technical, clerical, skilled, semi-skilled, and unskilled workers employed in scheduled industries (factories, construction, retail shops, logistics, hotels).',
      obligations: [
        'Pay minimum wages regularly by the 7th of every month.',
        'Calculate wages based on state cost-of-living index revisions (DA updated in January & July).',
        'Maintain a physical attendance and muster wage register (Form II).',
        'Provide monthly pay slips with exact basic and DA breakdowns.'
      ],
      workerRights: [
        'Right to receive the full minimum wage without unauthorized deductions.',
        'Right to claim arrears and compensation up to 10 times the unpaid difference if underpaid.',
        'Right to file a direct grievance through the Labour Department without fear of firing.'
      ],
      violations: [
        'Paying cash-in-hand below the legal rate without salary slips.',
        'Failing to pay the revised dearness allowance (DA) cost-of-living adjustments.',
        'Deducting money for food, lodging, or breakages that drops wages below the minimum line.'
      ],
      example: 'Rajesh is an unskilled loader at a factory in Pimpri. The state minimum wage for his sector is ₹12,500/month. His employer pays him only ₹8,000 cash-in-hand and provides no slip. This is a severe criminal violation.',
      nextSteps: [
        'Check the latest Maharashtra government minimum wage notification.',
        'Secure 3 months of bank statements showing actual deposits or sign-sheets.',
        'Use our AI Salary Desk to calculate your exact arrears.',
        'File an official underpayment complaint immediately.'
      ],
      keywords: ['wage', 'minimum wage', 'salary', 'min wage', 'pay', 'vetan', 'pagar', 'underpaid', 'basic salary', 'deductions'],
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&fit=crop',
    },
    {
      id: 'r-overtime',
      title: 'Double Overtime Pay',
      category: 'wages',
      categoryLabel: 'Wages & Hours',
      law: 'Factories Act, 1948 / Shops Act, 2017',
      summary: 'Any work done beyond 9 hours a day or 48 hours a week must be compensated at double (2x) the regular wage rate.',
      actName: 'Factories Act, 1948 (Section 59) / Maharashtra Shops & Establishments Act, 2017',
      meaning: 'An employee\'s standard working day is limited to 9 hours (including intervals) or 48 hours a week. Any work performed beyond these boundaries is legally classified as overtime and MUST be paid at exactly DOUBLE (2x) your normal hourly rate.',
      covered: 'All industrial workers, factory operators, warehouse staff, security guards, and commercial shop assistants.',
      obligations: [
        'Maintain an active Overtime Register (Form I) recording exact extra hours worked.',
        'Calculate overtime pay using double the regular rate: 2x (Basic Wage + DA).',
        'Restrict total overtime hours to legal limits (maximum 125 hours per quarter under Shops Act).'
      ],
      workerRights: [
        'Right to refuse excessive forced overtime that violates statutory limits.',
        'Right to receive double pay for every extra hour worked, including weekend and holiday duties.'
      ],
      violations: [
        'Paying normal single rates cash-in-hand for overtime work.',
        'Forcing employees to work 12-hour shifts daily while logging only 8 hours.',
        'Manipulating digital punch-in/out records to delete overtime logs.'
      ],
      example: 'Amit works as a packaging assistant. His standard pay is ₹100 per hour. When he works 10 hours instead of 8, his employer must pay him ₹200 for each of those 2 extra hours. Instead, his employer pays him only normal hourly rates.',
      nextSteps: [
        'Log your exact daily entry and exit times in a private notebook or via WhatsApp.',
        'Take pictures of physical attendance sheets or log screens before the month ends.',
        'Use JanKam\'s Overtime Calculator to compute your exact outstanding overtime dues.',
        'File a complaint to recover unpaid overtime wages.'
      ],
      keywords: ['overtime', 'ot', 'double pay', 'extra hours', 'shift', 'hours', 'working hours', 'overtime pay', 'weekend', 'sunday'],
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop',
    },
    {
      id: 'r-safety',
      title: 'Workplace Health & Safety',
      category: 'safety',
      categoryLabel: 'Health & Safety',
      law: 'Factories Act, 1948 / OSH Code, 2020',
      summary: 'Workers are entitled to a safe, clean, and hazard-free work environment with proper ventilation and protective gear.',
      actName: 'Factories Act, 1948 (Chapters III & IV) / Occupational Safety & Health Code, 2020',
      meaning: 'Every worker has the right to perform their duties in a safe, sanitary, and hazard-free environment. Employers are legally obligated to proactively maintain equipment and provide personal protective equipment (PPE) free of charge.',
      covered: 'All workers in factories, chemical industries, construction sites, engineering workshops, and warehouses.',
      obligations: [
        'Provide all safety gear (helmets, gloves, safety boots, goggles, harness) completely free of cost.',
        'Maintain clean drinking water, adequate ventilation, exhaust fans, and separate sanitation facilities.',
        'Ensure machinery is safely fenced and conduct annual safety audits.',
        'Keep well-stocked first-aid boxes and active fire exits.'
      ],
      workerRights: [
        'Right to refuse to work in conditions that present an imminent threat to life or severe injury.',
        'Right to receive proper safety training and health checkups at the employer\'s expense.',
        'Right to report safety violations directly to government inspectors anonymously.'
      ],
      violations: [
        'Forcing construction workers to work at heights without safety harnesses or netting.',
        'Charging employees or deducting salary for boots, helmets, or safety gloves.',
        'Lack of clean drinking water or failure to provide separate, clean toilets for female staff.'
      ],
      example: 'Suman works in a chemical packaging workshop in Chinchwad. The employer refuses to provide safety gloves or nose masks despite toxic fumes. Multiple workers have fallen ill with breathing problems. This is a hazardous safety violation.',
      nextSteps: [
        'Safely photograph the safety hazards or lack of protective equipment.',
        'Submit a written request to HR demanding safety equipment.',
        'If refused, file a confidential safety complaint through JanKam\'s anonymous pipeline.'
      ],
      keywords: ['safety', 'health', 'protective gear', 'ppe', 'gloves', 'helmet', 'hazard', 'hazardous', 'accident', 'drinking water', 'toilets', 'fire'],
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop',
    },
    {
      id: 'r-maternity',
      title: 'Paid Maternity Benefit',
      category: 'women',
      categoryLabel: 'Women\'s Rights',
      law: 'Maternity Benefit Act, 1961 (Amended 2017)',
      summary: 'Women employees are entitled to 26 weeks of fully paid maternity leave for their first two children.',
      actName: 'Maternity Benefit Act, 1961 (Section 4) / Amended 2017',
      meaning: 'Female employees are legally entitled to 26 weeks of fully paid maternity leave (100% of their actual gross wages) to care for their child. It is a severe criminal offense for an employer to terminate a woman or alter her job terms during pregnancy.',
      covered: 'All women employees (including contract, temporary, or permanent staff) who have worked for at least 80 days in the preceding 12 months.',
      obligations: [
        'Pay 100% of normal average wages during the 26 weeks of maternity leave.',
        'Ensure absolute job security — no dismissal, notice, or demotion during pregnancy.',
        'Establish an active creche facility if the company has 50 or more employees.',
        'Provide two paid nursing breaks daily for the child up to 15 months of age.'
      ],
      workerRights: [
        'Right to 26 weeks of fully paid leave (up to 8 weeks before delivery).',
        'Right to absolute job protection; termination during pregnancy is null and void under the law.',
        'Right to request work-from-home if the nature of work permits.'
      ],
      violations: [
        'Terminating a female worker immediately after she informs HR about her pregnancy.',
        'Refusing to pay salary during maternity leave or forcing unpaid sick leave.',
        'Demoting a female worker or forcing a salary reduction upon her return.'
      ],
      example: 'Priya, an office assistant in Pimple Gurav, notified her manager that she was pregnant. HR sent her a termination letter the next week claiming "restructuring." This is a major criminal offense under the Act.',
      nextSteps: [
        'Send a formal written notice of pregnancy (Form 1) to HR via email to establish proof.',
        'Keep copies of your appointment letter, salary slips, and all email exchanges.',
        'If terminated or denied paid leave, immediately file an urgent grievance with our Women Safety coordinator.'
      ],
      keywords: ['maternity', 'women', 'pregnancy', 'pregnancy leave', 'maternity leave', 'paid leave', 'fired', 'child', 'female', 'harassment'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&fit=crop',
    },
    {
      id: 'r-epf',
      title: 'Provident Fund (EPF) Security',
      category: 'social_sec',
      categoryLabel: 'Social Security',
      law: 'Employees\' Provident Funds Act, 1952',
      summary: 'A secure retirement saving scheme where employers must matching-contribute 12% of basic wages to your UAN.',
      actName: 'Employees\' Provident Funds & Miscellaneous Provisions Act, 1952',
      meaning: 'A mandatory savings scheme. The employer deducts 12% of your basic salary (+DA) and must contribute a matching 12% from their side. All funds are deposited directly into your UAN (Universal Account Number) maintained by the government EPFO.',
      covered: 'Mandatory for all companies with 20 or more employees, covering workers earning up to ₹15,000 basic salary (optional above that).',
      obligations: [
        'Register the company under the EPFO and secure UANs for all eligible employees.',
        'Deposit the employee\'s deducted 12% share AND the employer\'s matching 12% share by the 15th of every month.',
        'Ensure UAN numbers are printed clearly on every monthly salary slip.'
      ],
      workerRights: [
        'Right to view your updated PF balance online via the EPFO passbook portal at any time.',
        'Right to full employer contributions (8.33% goes to the Pension Scheme EPS, 3.67% to EPF).',
        'Right to withdraw or transfer your PF balance after 2 months of leaving a job.'
      ],
      violations: [
        'Deducting the 12% share from the worker\'s pay slip but pocketing the money instead of depositing it.',
        'Failing to register the worker under EPFO or refusing to generate a UAN.',
        'Claiming the employer matching contribution is "part of CTC" and deducting it from the employee\'s net take-home pay.'
      ],
      example: 'Ramesh has ₹1,500 deducted for "PF" on his pay slip monthly. When he registers on the EPFO portal, he finds no deposits have been made for a year. His employer is committing criminal breach of trust.',
      nextSteps: [
        'Get your 12-digit UAN from your employer or salary slip.',
        'Register and activate UAN on the EPFO portal (unifiedportal-mem.epfindia.gov.in).',
        'Download your PF Passbook monthly to verify actual deposits.',
        'File an official default complaint if deductions are made but not deposited.'
      ],
      keywords: ['pf', 'provident fund', 'epf', 'epfo', 'uan', 'pension', 'eps', 'retirement', 'savings', 'deduction mismatch'],
      image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80&fit=crop',
    },
    {
      id: 'r-esic',
      title: 'Full ESIC Medical Cover',
      category: 'social_sec',
      categoryLabel: 'Social Security',
      law: 'Employees\' State Insurance Act, 1948',
      summary: 'Complete healthcare, sickness cash allowance, and maternity care cover for workers earning under ₹21,000.',
      actName: 'Employees\' State Insurance Act, 1948',
      meaning: 'A social security scheme providing complete medical care to the worker and their dependants. The employee contributes a tiny 0.75% of gross wages, and the employer pays 3.25%. Insured persons receive free treatment at ESIC clinics and cash allowances during sick leaves.',
      covered: 'All employees earning up to ₹21,000/month employed in non-seasonal factories or shops with 10 or more workers.',
      obligations: [
        'Register all eligible employees on the ESIC portal within 10 days of hiring.',
        'Deduct 0.75% from employees and pay the employer\'s 3.25% share to the ESIC fund monthly.',
        'Provide employees with their 10-digit ESIC IP number and print their e-Pehchaan Card.'
      ],
      workerRights: [
        'Right to unlimited, completely free medical treatment for yourself and your immediate family members.',
        'Right to receive 70% of wages in cash from the government during approved medical leaves (up to 91 days).',
        'Right to 100% paid maternity benefits for female workers.'
      ],
      violations: [
        'Deducting ESIC share from the worker\'s wages but failing to register them.',
        'Refusing to issue the Pehchan Card or hide the IP number from the employee.',
        'Failing to pay the contribution, causing the worker\'s medical card to be suspended.'
      ],
      example: 'Vijay met with a machinery accident at a warehouse in Hinjewadi. He asked for his ESIC card for treatment, but HR admitted they never registered him. This is a severe ESIC violation.',
      nextSteps: [
        'Demand your 10-digit ESIC Insurance Number (IP) from your HR.',
        'Download your e-Pehchaan card from the ESIC portal and verify your family details.',
        'If the employer has not registered you, file a complaint to force enrollment.'
      ],
      keywords: ['esic', 'esi', 'medical', 'insurance', 'hospital', 'doctor', 'treatment', 'dispensary', 'sick leave', 'accident', 'pehchan'],
      image: 'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=800&q=80&fit=crop',
    },
    {
      id: 'r-wrongful-term',
      title: 'Wrongful Dismissal Shield',
      category: 'legal',
      categoryLabel: 'Legal Protection',
      law: 'Industrial Disputes Act, 1947 / Shops Act, 2017',
      summary: 'Protection against arbitrary firing. Employers must provide a valid written cause and notice or pay in lieu.',
      actName: 'Industrial Disputes Act, 1947 (Section 25F) / Maharashtra Shops & Establishments Act, 2017',
      meaning: 'Employers cannot terminate employees arbitrarily. A worker who has completed 1 year of service must be given 30 to 90 days of prior written notice, retrenchment compensation, and a valid reason proved via formal domestic inquiry.',
      covered: 'All factory workmen, shop assistants, commercial establishment staff, and service sector workers.',
      obligations: [
        'Provide a minimum of 30 days (Shops Act) or 90 days (Factories Act) written notice before termination.',
        'Pay full salary in lieu of notice period immediately if terminating on the spot.',
        'Pay retrenchment compensation (15 days average wage for every year of service).',
        'Clear all Full & Final (F&F) dues within 48 hours under the Shops Act.'
      ],
      workerRights: [
        'Right to demand a written termination letter stating the exact legal cause.',
        'Right to challenge arbitrary dismissal in the Labour Department and seek reinstatement with back wages.',
        'Right to receive gratuity (if 5+ years worked) and leave encashment upon leaving.'
      ],
      violations: [
        'Forcing employees to sign a "voluntary resignation" under pressure or threat of blacklist.',
        'Firing a worker instantly with zero notice, zero pay, and no written letter.',
        'Withholding salary, F&F settlement, or experience certificates to block future employment.'
      ],
      example: 'Sanjay, a warehouse supervisor with 3 years of service, was told not to come from tomorrow because of "cost cutting." No notice, no pay, and no compensation was given. This is illegal retrenchment.',
      nextSteps: [
        'DO NOT sign any forced resignation letter or blank papers; it voids your termination rights.',
        'Gather your appointment letter, last 3 months of pay slips, and any written dismissal proof.',
        'File an official dispute on JanKam to initiate the Labour Commissioner conciliation process.'
      ],
      keywords: ['termination', 'fired', 'resignation', 'resign', 'dismissal', 'wrongful termination', 'notice', 'notice period', 'full final', 'settlement'],
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop',
    },
    {
      id: 'r-equal-pay',
      title: 'Equal Pay for Equal Work',
      category: 'women',
      categoryLabel: 'Women\'s Rights',
      law: 'Equal Remuneration Act, 1976',
      summary: 'Prohibits gender discrimination in wages. Men and women doing similar work must receive equal pay.',
      actName: 'Equal Remuneration Act, 1976 / Code on Wages, 2019',
      meaning: 'Employers are legally prohibited from paying lower wages to female workers compared to male workers performing identical or similar work. Gender-based wage gaps, recruitment biases, or training exclusions are strictly illegal.',
      covered: 'All industrial, commercial, agricultural, contract, and casual workers without exception.',
      obligations: [
        'Pay identical wage scales to men and women doing similar shifts or tasks.',
        'Ensure non-discriminatory hiring, training, and promotion practices.',
        'Maintain a gender-wise register of employees and salaries (Form D).'
      ],
      workerRights: [
        'Right to receive equal wages for equal shifts, duties, or outputs.',
        'Right to file a wage parity claim and recover all historical unpaid salary differences.'
      ],
      violations: [
        'Paying female sorting staff ₹300/day while male sorting staff get ₹400/day for the same shift.',
        'Denying female employees specific shifts or duties under the guise of "protection" to pay them less.'
      ],
      example: 'Kiran and her male colleague both work as supermarket cashiers in Pimple Gurav, performing identical shifts. Kiran is paid ₹9,000/month, while her colleague is paid ₹12,000. This is illegal gender discrimination.',
      nextSteps: [
        'Request pay slip information or gather testimony showing wage disparity.',
        'Present the evidence to the company HR requesting correction.',
        'If unresolved, submit a wage parity dispute through JanKam.'
      ],
      keywords: ['equal pay', 'women', 'gender', 'discrimination', 'parity', 'remuneration', 'wages', 'cashier', 'female', 'wage gap'],
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80&fit=crop',
    },
    {
      id: 'r-posh',
      title: 'Women Safety & POSH Act',
      category: 'women',
      categoryLabel: 'Women\'s Rights',
      law: 'POSH Act, 2013',
      summary: 'Protection against workplace harassment. Mandates an Internal Complaints Committee (ICC) in all workplaces with 10+ employees.',
      actName: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
      meaning: 'The POSH Act guarantees women a safe, secure, and harassment-free working environment. It mandates that any workplace with 10 or more employees MUST establish an active Internal Complaints Committee (ICC) to address harassment claims.',
      covered: 'All women workers (including contract, temporary, domestic, corporate, and casual workers) in any public or private establishment.',
      obligations: [
        'Establish an active Internal Complaints Committee (ICC) headed by a senior female employee.',
        'Conduct regular POSH awareness workshops and display POSH penal notices prominently.',
        'Resolve all reported harassment complaints within 90 days with absolute confidentiality.',
        'Provide safety checkups and coordinate with district Local Complaints Committees (LCC).'
      ],
      workerRights: [
        'Right to work in a environment free of unwelcome physical contact, comments, or hostile advances.',
        'Right to file a formal complaint with the ICC or LCC without any fear of demotion or termination.',
        'Right to demand absolute confidentiality during inquiry proceedings.'
      ],
      violations: [
        'Failing to establish an active ICC in an office or factory with 10+ staff.',
        'HR or management dismissing harassment claims as "personal matters" and taking no action.',
        'Leaking the complainant\'s name, leading to peer pressure and forced resignation.'
      ],
      example: 'Meera faced continuous inappropriate remarks from her supervisor. When she complained to HR, she found the factory had no safety committee, and HR advised her to "adjust or leave." This is a severe criminal violation.',
      nextSteps: [
        'Document the exact dates, times, and descriptions of inappropriate behavior or messages.',
        'Identify if your company has a designated ICC; if not, you can report directly to the District LCC.',
        'Submit a confidential grievance on JanKam to consult our Labour Rights team safely.'
      ],
      keywords: ['women', 'safety', 'posh', 'harassment', 'abuse', 'icc', 'complaint', 'sexual', 'hostile', 'confidential', 'helpline', 'police'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&fit=crop',
    }
  ];

  const categories = [
    { code: 'all', label: 'All Rights' },
    { code: 'wages', label: 'Wages & Hours' },
    { code: 'safety', label: 'Health & Safety' },
    { code: 'social_sec', label: 'Social Security' },
    { code: 'women', label: 'Women\'s Rights' },
    { code: 'legal', label: 'Legal Shield' },
  ];

  const filtered = RIGHTS.filter(r => {
    const term = search.toLowerCase().trim();
    const matchesSearch = r.title.toLowerCase().includes(term) ||
                         r.law.toLowerCase().includes(term) ||
                         r.summary.toLowerCase().includes(term) ||
                         r.meaning.toLowerCase().includes(term) ||
                         r.covered.toLowerCase().includes(term) ||
                         r.categoryLabel.toLowerCase().includes(term) ||
                         r.keywords.some(k => k.toLowerCase().includes(term));
    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const mapRightToComplaintType = (id: string): string => {
    switch (id) {
      case 'r-min-wage':
        return 'Salary Deduction';
      case 'r-overtime':
        return 'Overtime Non-Payment';
      case 'r-safety':
        return 'Other';
      case 'r-maternity':
        return 'Women Safety';
      case 'r-epf':
        return 'PF Issue';
      case 'r-esic':
        return 'ESIC Issue';
      case 'r-wrongful-term':
        return 'Illegal Termination';
      case 'r-equal-pay':
        return 'Women Safety';
      case 'r-posh':
        return 'Women Safety';
      default:
        return 'Other';
    }
  };

  const triggerComplaint = (right: RightItem) => {
    setActiveRight(null);
    const complaintCategory = mapRightToComplaintType(right.id);
    
    // Dispatch jankam-autofill-complaint event
    window.dispatchEvent(new CustomEvent('jankam-autofill-complaint', {
      detail: {
        complaintType: complaintCategory,
      }
    }));
    
    handleScrollTo('#complaint');
    setTimeout(() => {
      const el = document.getElementById('cf-name') as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select?.();
      }
    }, 550);
  };

  const triggerAICopilot = (topicId: string) => {
    setActiveRight(null);
    handleScrollTo('#ai-sahayak');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('jankam-open-ai-chat', {
        detail: { contextTopic: topicId }
      }));
    }, 550);
  };

  return (
    <section id="rights" className="section-pad" style={{ background: '#0F2347' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          <div>
            <div className="section-label">Labour Rights Library</div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.7rem, 4.5vw, 2.5rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                marginTop: '10px',
              }}
            >
              Know Your Laws, Protect Your{' '}
              <span className="text-gradient-gold">Livelihood</span>
            </h2>
          </div>

          {/* Search and Category Filters */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '16px',
          }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search rights, acts, or keywords (e.g., minimum wage, overtime, PF, women)..."
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.92rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#F5A623'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(c => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCat(c.code)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedCat === c.code ? '#F5A623' : 'rgba(255,255,255,0.12)',
                    background: selectedCat === c.code ? '#F5A623' : 'rgba(255,255,255,0.03)',
                    color: selectedCat === c.code ? '#0A1931' : 'rgba(255,255,255,0.65)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rights Grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '20px',
          }}>
            <ShieldAlert size={48} style={{ color: '#F5A623', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
              No Rights Found
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto' }}>
              We couldn't find any law matching "{search}". Try searching for wage, overtime, safety, or maternity.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map(r => (
              <div
                key={r.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
                className="group hover:border-[#F5A623]/30 hover:-translate-y-1.5"
                onClick={() => setActiveRight(r)}
              >
                {/* Image */}
                <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={r.image}
                    alt={r.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    className="group-hover:scale-105"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,35,71,0.1), rgba(15,35,71,0.95))' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: '#F5A623',
                    color: '#0A1931',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    {r.categoryLabel}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    {r.law}
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', flex: 1 }}>
                    {r.summary}
                  </p>

                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#F5A623',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      marginTop: '8px',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    View Full Law Details
                    <ArrowRight size={13} style={{ transition: 'transform 0.15s' }} className="group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeRight && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, backdropFilter: 'blur(5px)' }}
            onClick={() => setActiveRight(null)}
          />

          {/* Modal Content */}
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1101,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            pointerEvents: 'none',
          }}>
            <div
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90dvh',
                background: '#0F2347',
                border: '1.5px solid rgba(245,166,35,0.3)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'all',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              }}
            >
              {/* Image banner */}
              <div style={{ height: '160px', position: 'relative', flexShrink: 0 }}>
                <img src={activeRight.image} alt={activeRight.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,35,71,0.2), #0F2347)' }} />

                {/* Close Button */}
                <button
                  onClick={() => setActiveRight(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>

                {/* Badge & Title */}
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: '#F5A623',
                    color: '#0A1931',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Outfit, sans-serif',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}>
                    {activeRight.categoryLabel}
                  </span>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.35rem', color: 'white', lineHeight: 1.2 }}>
                    {activeRight.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable details */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Act Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}>
                  <BookOpen size={18} style={{ color: '#F5A623', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Act Name / Statutory Reference
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'white', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>
                      {activeRight.actName}
                    </div>
                  </div>
                </div>

                {/* 2. What this law means */}
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    What This Law Means
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                    {activeRight.meaning}
                  </p>
                </div>

                {/* 3. Who is covered */}
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Who is Covered / Eligible?
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                    {activeRight.covered}
                  </p>
                </div>

                {/* 4. Employer Obligations & Worker Rights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px' }}>
                    <h5 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> Employer Obligations
                    </h5>
                    <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeRight.obligations.map((o, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px' }}>
                    <h5 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={12} /> Worker Rights
                    </h5>
                    <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeRight.workerRights.map((w, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. Common Violations */}
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Common Violations
                  </h4>
                  <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {activeRight.violations.map((v, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{v}</li>
                    ))}
                  </ul>
                </div>

                {/* 6. Real Workplace Example */}
                <div style={{
                  background: 'rgba(245,166,35,0.03)',
                  border: '1px solid rgba(245,166,35,0.15)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    🔍 Real Workplace Example
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                    {activeRight.example}
                  </p>
                </div>

                {/* 7. What worker should do next */}
                <div style={{
                  background: 'rgba(248,113,113,0.03)',
                  border: '1px solid rgba(248,113,113,0.15)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertOctagon size={14} /> What You Should Do Next
                  </h4>
                  <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeRight.nextSteps.map((s, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{s}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Action Footer */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                flexShrink: 0,
              }}>
                <button
                  id="rights-modal-file-complaint"
                  onClick={() => triggerComplaint(activeRight)}
                  className="btn-primary"
                  style={{
                    flex: '1 1 200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  📋 File Violation Complaint
                </button>
                <button
                  id="rights-modal-consult-ai"
                  onClick={() => triggerAICopilot(activeRight.id)}
                  className="btn-outline"
                  style={{
                    flex: '1 1 200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '11px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  💬 Consult AI Copilot
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
