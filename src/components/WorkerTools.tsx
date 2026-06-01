// ============================================================
// WorkerTools.tsx — 4 real calculators: Salary, Overtime, PF, Gratuity
// All calculations based on Indian labour law
// Mobile-first tab design
// ============================================================
import { useState } from 'react';
import {
  Calculator, IndianRupee, Clock, PiggyBank, Award,
  Download, Printer, Mail, Share2, Check, FileText, AlertTriangle, ShieldAlert, Sparkles, Send, QrCode
} from 'lucide-react';
import PosterGenerator from './PosterGenerator';

type Tab = 'salary' | 'overtime' | 'pf' | 'gratuity' | 'posters';

// ── Salary Breakdown ──
function calculateSalary(basic: number) {
  if (basic <= 0) return null;
  const da = Math.round(basic * 0.12);
  const hra = Math.round(basic * 0.15);
  const gross = basic + da + hra;
  const pfBase = basic + da;
  const pfEmployee = Math.round(pfBase * 0.12);
  const pfEmployer = Math.round(pfBase * 0.12);
  const esicEmployee = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  const esicEmployer = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
  const totalDeductions = pfEmployee + esicEmployee;
  const netTakeHome = gross - totalDeductions;
  return { basic, da, hra, gross, pfEmployee, pfEmployer, esicEmployee, esicEmployer, totalDeductions, netTakeHome };
}

// ── Overtime Calculator ──
function calculateOvertime(basic: number, otHours: number) {
  if (basic <= 0 || otHours <= 0) return null;
  const dailyWage = Math.round(basic / 26);
  const hourlyWage = Math.round(dailyWage / 8);
  const overtimeRate = hourlyWage * 2; // Double rate (Indian law)
  const overtimePay = overtimeRate * otHours;
  return { basic, otHours, dailyWage, hourlyWage, overtimeRate, overtimePay };
}

// ── PF Calculator ──
function calculatePF(basic: number, da: number, years: number) {
  if (basic <= 0) return null;
  const pfBase = basic + da;
  const employeeMonthly = Math.round(pfBase * 0.12);
  const employerMonthly = Math.round(pfBase * 0.12);
  const totalMonthly = employeeMonthly + employerMonthly;
  const annualContrib = totalMonthly * 12;
  const estimatedCorpus = Math.round(annualContrib * years * 1.085); // ~8.5% interest
  return { pfBase, employeeMonthly, employerMonthly, totalMonthly, annualContrib, estimatedCorpus, years };
}

// ── Gratuity Calculator ──
function calculateGratuity(lastSalary: number, yearsOfService: number) {
  if (lastSalary <= 0 || yearsOfService <= 0) return null;
  const isEligible = yearsOfService >= 5;
  // Formula: (Basic + DA) × 15 / 26 × years_of_service
  const gratuityAmount = isEligible ? Math.round((lastSalary * 15 / 26) * yearsOfService) : 0;
  return { lastSalary, yearsOfService, isEligible, gratuityAmount };
}

// ── Shared Components ──
function InputField({ id, label, value, onChange, placeholder, suffix }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder: string; suffix?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: suffix ? '11px 50px 11px 14px' : '11px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '0.92rem',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#F5A623'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight, note }: { label: string; value: string; highlight?: boolean; note?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div>
        <span style={{ fontSize: '0.85rem', color: highlight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', fontWeight: highlight ? 600 : 400 }}>
          {label}
        </span>
        {note && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>{note}</div>}
      </div>
      <span style={{
        fontSize: highlight ? '1.05rem' : '0.88rem',
        fontWeight: highlight ? 800 : 600,
        color: highlight ? '#F5A623' : 'rgba(255,255,255,0.7)',
        fontFamily: 'Outfit, sans-serif',
      }}>
        {value}
      </span>
    </div>
  );
}

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

// ── Calculator Tabs ──
// ── State-of-the-Art Salary Verification & Payslip Generator ──
function SalaryCalc() {
  // Inputs
  const [empName, setEmpName] = useState('Dilip Kumar');
  const [companyName, setCompanyName] = useState('Maharashtra Logistics');
  const [empId, setEmpId] = useState('JK-2026-904X');
  const [basicSalary, setBasicSalary] = useState('14500');
  const [grossInput, setGrossInput] = useState('18000');
  const [workingDays, setWorkingDays] = useState('26');
  const [presentDays, setPresentDays] = useState('24');
  const [otHours, setOtHours] = useState('10');
  const [bonus, setBonus] = useState('1500');
  const [incentives, setIncentives] = useState('800');
  const [deductions, setDeductions] = useState('300');
  const [isCopied, setIsCopied] = useState(false);

  // Parse values safely
  const nBasicSalary = parseFloat(basicSalary) || 0;
  const nGrossInput = parseFloat(grossInput) || 0;
  const nWorkingDays = parseFloat(workingDays) || 26;
  const nPresentDays = parseFloat(presentDays) || 0;
  const nOtHours = parseFloat(otHours) || 0;
  const nBonus = parseFloat(bonus) || 0;
  const nIncentives = parseFloat(incentives) || 0;
  const nDeductions = parseFloat(deductions) || 0;

  // 1. Calculations
  const basicPay = Math.round((nBasicSalary / nWorkingDays) * nPresentDays);
  const hra = Math.round(basicPay * 0.15); // HRA at 15%
  const da = Math.round(basicPay * 0.12);  // DA at 12%
  const conveyance = Math.round(basicPay * 0.08); // Conveyance at 8%
  const overtimePay = Math.round((basicPay / nWorkingDays / 8) * 2 * nOtHours); // 2x rate
  
  // Gross pay calculated based on elements
  const grossPayCalculated = basicPay + hra + da + conveyance + overtimePay + nBonus + nIncentives;
  
  // Deductions
  const pfDeduction = Math.round((basicPay + da) * 0.12); // PF 12%
  const esicDeduction = (grossPayCalculated <= 21000) ? Math.round(grossPayCalculated * 0.0075) : 0; // ESIC 0.75%
  const professionalTax = (grossPayCalculated > 10000) ? 200 : 0;
  
  const totalDeductions = pfDeduction + esicDeduction + professionalTax + nDeductions;
  const netSalary = grossPayCalculated - totalDeductions;

  // 2. Compliance Analysis
  const minWageThreshold = 13000;
  const isMinWageViolated = nBasicSalary < minWageThreshold;
  const isPfViolated = nBasicSalary <= 15000 && pfDeduction === 0;
  const isEsicViolated = grossPayCalculated <= 21000 && esicDeduction === 0;
  const isOtViolated = nOtHours > 0 && overtimePay === 0;

  const hasViolations = isMinWageViolated || isPfViolated || isEsicViolated || isOtViolated;
  const isUnderpaid = netSalary < (nBasicSalary + Math.round(nBasicSalary * 0.35)) && hasViolations;

  let complianceStatus: 'Compliant' | 'Underpaid' | 'Labour Law Violation' = 'Compliant';
  if (hasViolations) {
    complianceStatus = 'Labour Law Violation';
  } else if (isUnderpaid) {
    complianceStatus = 'Underpaid';
  }

  // 3. AI Analysis Summaries
  const expectedSalary = basicPay + hra + da + conveyance + overtimePay + nBonus + nIncentives - (pfDeduction + esicDeduction + professionalTax);
  const actualSalary = netSalary;
  const missingAmount = Math.max(0, expectedSalary - actualSalary);

  const potentialViolations: string[] = [];
  if (isMinWageViolated) potentialViolations.push(`Basic salary (₹${nBasicSalary}) is below the Maharashtra Minimum Wage threshold (₹${minWageThreshold}) for unskilled workers.`);
  if (isPfViolated) potentialViolations.push('Provident Fund (PF) is not being deducted although basic pay is below ₹15,000. (Violates EPF Act, 1952)');
  if (isEsicViolated) potentialViolations.push('ESIC is not registered or deducted although gross salary is below ₹21,000. (Violates ESI Act, 1948)');
  if (isOtViolated) potentialViolations.push('Overtime hours were worked but no double-rate (2x) pay was calculated. (Violates Factories Act, 1948)');

  const recommendedActions: string[] = [];
  if (hasViolations) {
    recommendedActions.push('Ask your HR / employer in writing for explanation of missing PF/ESIC deductions.');
    recommendedActions.push('File a verified labour dispute claim directly using the JanKam Complaint Form.');
    recommendedActions.push('Submit a written petition to the District Labour Commissioner.');
  } else {
    recommendedActions.push('Your salary structure is aligned with general labour law guidelines.');
    recommendedActions.push('Keep this payslip for your financial records.');
  }

  // Payslip ID & QR Verification code mockups
  const payslipId = `JK-PAY-${(companyName || '').slice(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const qrVerificationText = `Verified by JanKam Platform\nPayslip ID: ${payslipId}\nEmployee: ${empName}\nCompany: ${companyName}\nNet Salary: ₹${netSalary.toLocaleString('en-IN')}\nStatus: ${complianceStatus}`;

  // 4. Integrations
  const handleAutofillComplaint = () => {
    let violationDescription = `COMPLIANCE AUDIT DISCREPANCY:\n`;
    violationDescription += `- Employee: ${empName} (ID: ${empId})\n`;
    violationDescription += `- Employer: ${companyName}\n`;
    violationDescription += `- Reported Basic Salary: ₹${nBasicSalary}/month\n`;
    violationDescription += `- Present Days: ${nPresentDays} of ${nWorkingDays} working days\n\n`;
    
    if (isMinWageViolated) violationDescription += `* VIOLATION: Basic salary is below Maharashtra Minimum Wage (₹${minWageThreshold}).\n`;
    if (isPfViolated) violationDescription += `* VIOLATION: PF not deducted/deposited despite eligibility.\n`;
    if (isEsicViolated) violationDescription += `* VIOLATION: ESIC medical benefits not enrolled/deducted.\n`;
    if (isOtViolated) violationDescription += `* VIOLATION: Overtime hours not compensated at double-rate.\n`;
    
    violationDescription += `\nI request the District Labour Officer to verify my wage structure and ensure the employer registers my PF/ESIC accounts and clears all outstanding dues.`;

    const autofillEvent = new CustomEvent('jankam-autofill-complaint', {
      detail: {
        name: empName,
        mobile: '',
        district: 'Mumbai Suburban',
        employer: companyName,
        industry: 'Manufacturing / Factory',
        complaintType: 'salary_delay',
        description: violationDescription
      }
    });
    window.dispatchEvent(autofillEvent);
  };

  const getComplaintEmailLink = () => {
    const subject = encodeURIComponent(`Complaint regarding Labour Compliance Discrepancy at ${companyName}`);
    let body = `To,\nThe District Labour Commissioner,\nMaharashtra.\n\n`;
    body += `Respected Authority,\n\n`;
    body += `I, ${empName} (Employee ID: ${empId}), am writing to report serious labour law violations by my employer, ${companyName}.\n\n`;
    body += `Upon executing a JanKam Salary Compliance Audit, the following issues were verified:\n`;
    potentialViolations.forEach((v, i) => {
      body += `${i + 1}. ${v}\n`;
    });
    body += `\nExpected Net Salary: ₹${expectedSalary.toLocaleString('en-IN')}\n`;
    body += `Actual Net Salary Received: ₹${actualSalary.toLocaleString('en-IN')}\n`;
    body += `Outstanding / Discrepancy Amount: ₹${missingAmount.toLocaleString('en-IN')}\n\n`;
    body += `I humbly request your immediate intervention to audit the payroll systems at the aforementioned company and safeguard my basic rights.\n\n`;
    body += `Yours faithfully,\n${empName}\nContact: [Your Mobile Number]`;
    
    return `mailto:help@jankam.org?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const getWhatsAppShareLink = () => {
    let text = `*JanKam Verified Salary Payslip Audit*\n\n`;
    text += `*Employee:* ${empName}\n`;
    text += `*Employer:* ${companyName}\n`;
    text += `*Net Salary:* ₹${netSalary.toLocaleString('en-IN')}\n`;
    text += `*Compliance Status:* ${(complianceStatus || '').toUpperCase()}\n\n`;
    if (hasViolations) {
      text += `⚠️ *Detected Violations:*\n`;
      potentialViolations.forEach((v) => {
        text += `- ${v}\n`;
      });
    } else {
      text += `✅ All legal structures look compliant!\n`;
    }
    text += `\nVerify your wage details at: https://jankam.org`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handlePrintPayslip = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Payslip - ${empName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .payslip-box { border: 2px solid #333; padding: 30px; border-radius: 8px; max-width: 800px; margin: auto; }
            .header-table { width: 100%; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-title { font-size: 24px; font-weight: bold; }
            .meta-table { width: 100%; margin-bottom: 30px; font-size: 14px; }
            .meta-table td { padding: 4px 0; }
            .breakdown-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .breakdown-table th, .breakdown-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
            .breakdown-table th { background-color: #f5f5f5; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .summary-box { border: 1px solid #333; padding: 15px; background-color: #fdfdfd; border-radius: 6px; font-size: 15px; font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 20px; }
            .footer { border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px; font-size: 11px; text-align: center; color: #666; }
            .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; }
            .badge-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .badge-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="payslip-box">
            <table class="header-table">
              <tr>
                <td class="logo-title">JANKAM VERIFIED PAYSLIP</td>
                <td style="text-align: right; font-size: 13px;">
                  <strong>Payslip ID:</strong> ${payslipId}<br/>
                  <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
                </td>
              </tr>
            </table>

            <table class="meta-table">
              <tr>
                <td><strong>Employee Name:</strong> ${empName}</td>
                <td><strong>Company Name:</strong> ${companyName}</td>
              </tr>
              <tr>
                <td><strong>Employee ID:</strong> ${empId}</td>
                <td><strong>Working Days / Present:</strong> ${nWorkingDays} / ${nPresentDays} Days</td>
              </tr>
              <tr>
                <td><strong>Overtime Hours:</strong> ${nOtHours} Hours</td>
                <td><strong>Compliance:</strong> <span class="badge ${hasViolations ? 'badge-danger' : 'badge-success'}">${(complianceStatus || '').toUpperCase()}</span></td>
              </tr>
            </table>

            <table class="breakdown-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Earnings Description</th>
                  <th style="width: 50%;">Deductions & Adjustments</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Basic Pay: ₹${basicPay.toLocaleString('en-IN')}<br/>
                    Dearness Allowance (DA): ₹${da.toLocaleString('en-IN')}<br/>
                    House Rent Allowance (HRA): ₹${hra.toLocaleString('en-IN')}<br/>
                    Conveyance Allowance: ₹${conveyance.toLocaleString('en-IN')}<br/>
                    Overtime Compensation: ₹${overtimePay.toLocaleString('en-IN')}<br/>
                    Bonus Payment: ₹${nBonus.toLocaleString('en-IN')}<br/>
                    Performance Incentives: ₹${nIncentives.toLocaleString('en-IN')}
                  </td>
                  <td style="vertical-align: top;">
                    PF contribution (Employee 12%): ₹${pfDeduction.toLocaleString('en-IN')}<br/>
                    ESIC medical fund (0.75%): ₹${esicDeduction.toLocaleString('en-IN')}<br/>
                    Professional Tax: ₹${professionalTax.toLocaleString('en-IN')}<br/>
                    Additional Deductions: ₹${nDeductions.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr class="total-row">
                  <td>Total Earnings: ₹${grossPayCalculated.toLocaleString('en-IN')}</td>
                  <td>Total Deductions: ₹${totalDeductions.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-box">
              <span>NET SALARY PAYOUT (TAKE-HOME):</span>
              <span>₹${netSalary.toLocaleString('en-IN')}</span>
            </div>

            <div class="footer">
              This payslip has been auto-generated and verified by the JanKam Labour Intelligence System. <br/>
              QR Security Code: ${payslipId.slice(-6)}-JANKAM-VALIDATED. Citing Factories Act, 1948 & Payment of Wages Act, 1936.
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const copyTextToClipboard = () => {
    let payslipText = `=== JANKAM VERIFIED PAYSLIP ===\n`;
    payslipText += `Payslip ID: ${payslipId}\n`;
    payslipText += `Employee: ${empName} (ID: ${empId})\n`;
    payslipText += `Company: ${companyName}\n`;
    payslipText += `Working Days / Present: ${nWorkingDays} / ${nPresentDays}\n`;
    payslipText += `Gross Earnings: ₹${grossPayCalculated.toLocaleString('en-IN')}\n`;
    payslipText += `Total Deductions: ₹${totalDeductions.toLocaleString('en-IN')}\n`;
    payslipText += `Net Salary Payout: ₹${netSalary.toLocaleString('en-IN')}\n`;
    payslipText += `Compliance Status: ${(complianceStatus || '').toUpperCase()}\n`;
    if (hasViolations) {
      payslipText += `Detected Violations:\n`;
      potentialViolations.forEach((v) => payslipText += `- ${v}\n`);
    }

    const tempInput = document.createElement('textarea');
    tempInput.value = payslipText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Grid: Inputs Form & Live Output Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 cols on large screens) */}
        <div className="lg:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F5A623', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
              Step 1: Employee Details
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-name" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Employee Name</label>
              <input id="ver-name" type="text" value={empName} onChange={e => setEmpName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-id" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Employee ID</label>
              <input id="ver-id" type="text" value={empId} onChange={e => setEmpId(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="ver-company" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Company / Employer Name</label>
            <input id="ver-company" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginTop: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F5A623', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
              Step 2: Wages & Working Days
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-basic" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Basic Monthly Salary (₹)</label>
              <input id="ver-basic" type="number" min="0" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-gross" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Gross Payout (₹)</label>
              <input id="ver-gross" type="number" min="0" value={grossInput} onChange={e => setGrossInput(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-working" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Working Days</label>
              <input id="ver-working" type="number" min="1" value={workingDays} onChange={e => setWorkingDays(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-present" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Present Days</label>
              <input id="ver-present" type="number" min="0" value={presentDays} onChange={e => setPresentDays(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-ot" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>OT Hours</label>
              <input id="ver-ot" type="number" min="0" value={otHours} onChange={e => setOtHours(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-bonus" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Bonus (₹)</label>
              <input id="ver-bonus" type="number" min="0" value={bonus} onChange={e => setBonus(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-incentives" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Incentives (₹)</label>
              <input id="ver-incentives" type="number" min="0" value={incentives} onChange={e => setIncentives(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="ver-deductions" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>Misc Deductions</label>
              <input id="ver-deductions" type="number" min="0" value={deductions} onChange={e => setDeductions(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Audit Results & Professional Payslip Preview (7 cols) */}
        <div className="lg:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Compliance Status Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderRadius: '14px',
            background: complianceStatus === 'Compliant' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1.5px solid ${complianceStatus === 'Compliant' ? '#34D399' : '#F87171'}`,
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                Wages Compliance Status
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: complianceStatus === 'Compliant' ? '#34D399' : '#F87171', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>
                {complianceStatus}
              </div>
            </div>
            <div>
              {complianceStatus === 'Compliant' ? (
                <Check size={28} style={{ color: '#34D399', background: 'rgba(52,211,153,0.15)', padding: '5px', borderRadius: '50%' }} />
              ) : (
                <ShieldAlert size={28} style={{ color: '#F87171', background: 'rgba(248,113,113,0.15)', padding: '5px', borderRadius: '50%' }} />
              )}
            </div>
          </div>

          {/* AI Auditor Intelligence Analysis Panel */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(245,166,35,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={16} style={{ color: '#F5A623' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                Labour AI Auditor Insight
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Expected Pay</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>₹{expectedSalary.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Actual Payout</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60A5FA', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>₹{actualSalary.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Underpaid Dues</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: missingAmount > 0 ? '#F87171' : 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>₹{missingAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {hasViolations && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
                  Potential Violations:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {potentialViolations.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', padding: '8px 12px', borderRadius: '8px' }}>
                      <AlertTriangle size={14} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
                Recommended Legal Actions:
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '14px', listStyleType: 'disc' }}>
                {recommendedActions.map((v, i) => (
                  <li key={i} style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{v}</li>
                ))}
              </ul>
            </div>

            {/* Complaint auto-fill and auto-draft Integration buttons */}
            {hasViolations && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={handleAutofillComplaint} className="btn-primary" style={{ flex: '1 1 auto', fontSize: '0.78rem', padding: '8px 14px' }}>
                  <FileText size={13} /> Autofill Complaint Form
                </button>
                <a href={getComplaintEmailLink()} className="btn-outline" style={{ flex: '1 1 auto', fontSize: '0.78rem', padding: '8px 14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Mail size={13} /> Email Draft
                </a>
              </div>
            )}
          </div>

          {/* Premium Payslip Document Box */}
          <div style={{
            background: '#FFFFFF', color: '#1E293B', borderRadius: '18px', border: '2px dashed #CBD5E1', padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#F5A623', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>Verified Payslip Audit</span>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>{companyName}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>ID: {empId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                  background: complianceStatus === 'Compliant' ? '#D1FAE5' : '#FEE2E2',
                  color: complianceStatus === 'Compliant' ? '#065F46' : '#991B1B',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {(complianceStatus || '').toUpperCase()}
                </span>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
                  {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Payslip details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '14px', fontSize: '0.74rem' }}>
              <div>
                <div style={{ color: '#64748B', marginBottom: '2px' }}>Employee Name:</div>
                <div style={{ fontWeight: 700, color: '#1E293B' }}>{empName}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', marginBottom: '2px' }}>Payslip Reference:</div>
                <div style={{ fontWeight: 700, color: '#1E293B' }}>{payslipId}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', marginBottom: '2px' }}>Working / Present Days:</div>
                <div style={{ fontWeight: 700, color: '#1E293B' }}>{nWorkingDays} / {nPresentDays} Days</div>
              </div>
              <div>
                <div style={{ color: '#64748B', marginBottom: '2px' }}>Overtime Hours:</div>
                <div style={{ fontWeight: 700, color: '#1E293B' }}>{nOtHours} Hours</div>
              </div>
            </div>

            {/* Earnings vs Deductions Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '16px', fontSize: '0.74rem' }}>
              {/* Earnings (Left) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '2px' }}>EARNINGS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Basic Pay:</span><span style={{ fontWeight: 600 }}>₹{basicPay.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dearness (DA):</span><span style={{ fontWeight: 600 }}>₹{da.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>HRA (15%):</span><span style={{ fontWeight: 600 }}>₹{hra.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Conveyance:</span><span style={{ fontWeight: 600 }}>₹{conveyance.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Overtime Pay:</span><span style={{ fontWeight: 600 }}>₹{overtimePay.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bonus:</span><span style={{ fontWeight: 600 }}>₹{nBonus.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Incentives:</span><span style={{ fontWeight: 600 }}>₹{nIncentives.toLocaleString('en-IN')}</span></div>
              </div>

              {/* Deductions (Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid #E2E8F0', paddingLeft: '20px' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '2px' }}>DEDUCTIONS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PF Contribution:</span><span style={{ fontWeight: 600 }}>-₹{pfDeduction.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ESIC Health:</span><span style={{ fontWeight: 600 }}>-₹{esicDeduction.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Professional Tax:</span><span style={{ fontWeight: 600 }}>-₹{professionalTax.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Additional:</span><span style={{ fontWeight: 600 }}>-₹{nDeductions.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Total Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px', fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Gross:</span><span>₹{grossPayCalculated.toLocaleString('en-IN')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '20px' }}><span>Total Deduct:</span><span>₹{totalDeductions.toLocaleString('en-IN')}</span></div>
            </div>

            {/* Net Salary Summary Block */}
            <div style={{
              background: '#0F172A', color: '#FFFFFF', borderRadius: '12px', padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'
            }}>
              <div>
                <span style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Take-Home Salary</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>₹{netSalary.toLocaleString('en-IN')}</div>
              </div>
              
              {/* QR Verification mockup */}
              <div
                title={qrVerificationText}
                style={{
                  width: '42px', height: '42px', background: '#FFFFFF', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1.5px solid #F5A623', flexShrink: 0
                }}
              >
                🏁
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
              <button onClick={handlePrintPayslip} style={payslipBtnStyle('#0F172A', 'rgba(15,23,42,0.06)')}>
                <Printer size={12} /> Print / Save PDF
              </button>
              <button onClick={copyTextToClipboard} style={payslipBtnStyle('#2563EB', 'rgba(37,99,235,0.06)')}>
                {isCopied ? <Check size={12} /> : <FileText size={12} />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <a href={getWhatsAppShareLink()} target="_blank" rel="noreferrer" style={{ ...payslipBtnStyle('#16A34A', 'rgba(22,163,74,0.06)'), textDecoration: 'none' }}>
                <Share2 size={12} /> Share WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: 'white',
  fontSize: '0.85rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
} as React.CSSProperties;

const payslipBtnStyle = (color: string, bg: string) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '0.72rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: `1.2px solid ${color}35`,
  background: bg,
  color: color,
  fontFamily: 'Outfit, sans-serif',
  flex: '1 1 auto',
} as React.CSSProperties);


function OvertimeCalc() {
  const [basic, setBasic] = useState('');
  const [hours, setHours] = useState('');
  const result = calculateOvertime(parseFloat(basic) || 0, parseFloat(hours) || 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <InputField id="ot-basic" label="Basic Monthly Salary (₹)" value={basic} onChange={setBasic} placeholder="e.g. 18000" suffix="₹" />
        <InputField id="ot-hours" label="Overtime Hours Worked" value={hours} onChange={setHours} placeholder="e.g. 20" suffix="hrs" />
      </div>
      {result && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
          <ResultRow label="Daily Wage" value={fmt(result.dailyWage)} note="Basic ÷ 26 working days" />
          <ResultRow label="Hourly Wage" value={fmt(result.hourlyWage)} note="Daily ÷ 8 hours" />
          <ResultRow label="Overtime Rate (2×)" value={fmt(result.overtimeRate)} note="Double rate as per Factories Act" />
          <ResultRow label={`Overtime Hours Worked`} value={`${result.otHours} hrs`} />
          <ResultRow label="Total Overtime Pay Due" value={fmt(result.overtimePay)} highlight />
          <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#F5A623', fontFamily: 'Inter, sans-serif' }}>
              ⚖ Under Factories Act 1948 & Shops Act 2017, overtime must be paid at 2× regular hourly rate.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PFCalc() {
  const [basic, setBasic] = useState('');
  const [da, setDa] = useState('');
  const [years, setYears] = useState('');
  const result = calculatePF(parseFloat(basic) || 0, parseFloat(da) || 0, parseFloat(years) || 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <InputField id="pf-basic" label="Basic Salary (₹)" value={basic} onChange={setBasic} placeholder="e.g. 15000" suffix="₹" />
        <InputField id="pf-da" label="DA Amount (₹)" value={da} onChange={setDa} placeholder="e.g. 1800" suffix="₹" />
        <InputField id="pf-years" label="Years of Service" value={years} onChange={setYears} placeholder="e.g. 5" suffix="yrs" />
      </div>
      {result && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
          <ResultRow label="PF Base (Basic + DA)" value={fmt(result.pfBase)} />
          <ResultRow label="Employee Monthly (12%)" value={fmt(result.employeeMonthly)} note="Deducted from your salary" />
          <ResultRow label="Employer Monthly (12%)" value={fmt(result.employerMonthly)} note="Employer's contribution" />
          <ResultRow label="Total Monthly to EPF" value={fmt(result.totalMonthly)} highlight />
          <ResultRow label="Annual Contribution" value={fmt(result.annualContrib)} />
          <ResultRow label={`Estimated Corpus (${result.years} yrs @ 8.5%)`} value={fmt(result.estimatedCorpus)} highlight />
          <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#60A5FA', fontFamily: 'Inter, sans-serif' }}>
              ℹ Check your EPF balance anytime at <strong>epfindia.gov.in</strong> using your UAN number.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function GratuityCalc() {
  const [salary, setSalary] = useState('');
  const [years, setYears] = useState('');
  const result = calculateGratuity(parseFloat(salary) || 0, parseFloat(years) || 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <InputField id="gr-salary" label="Last Basic + DA (₹/month)" value={salary} onChange={setSalary} placeholder="e.g. 20000" suffix="₹" />
        <InputField id="gr-years" label="Years of Service" value={years} onChange={setYears} placeholder="e.g. 7" suffix="yrs" />
      </div>
      {result && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
          {!result.isEligible ? (
            <div style={{ padding: '16px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: '#F87171', fontFamily: 'Inter, sans-serif' }}>
                ⚠ Gratuity requires minimum <strong>5 years</strong> of continuous service.<br />
                You have {result.yearsOfService} year(s) — {5 - result.yearsOfService} more year(s) needed.
              </span>
            </div>
          ) : (
            <>
              <ResultRow label="Last Drawn Salary (Basic + DA)" value={fmt(result.lastSalary)} />
              <ResultRow label="Years of Service" value={`${result.yearsOfService} years`} />
              <ResultRow label="Formula" value="(Salary × 15 ÷ 26) × Years" note="As per Payment of Gratuity Act 1972" />
              <ResultRow label="Gratuity Amount" value={fmt(result.gratuityAmount)} highlight />
              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#34D399', fontFamily: 'Inter, sans-serif' }}>
                  ✓ Your employer must pay gratuity within 30 days of your last working day.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
const TABS: { id: Tab; label: string; shortLabel: string; icon: any; color: string }[] = [
  { id: 'salary', label: 'Salary Breakdown', shortLabel: 'Salary', icon: IndianRupee, color: '#F5A623' },
  { id: 'overtime', label: 'Overtime Pay', shortLabel: 'Overtime', icon: Clock, color: '#34D399' },
  { id: 'pf', label: 'PF Calculator', shortLabel: 'PF', icon: PiggyBank, color: '#60A5FA' },
  { id: 'gratuity', label: 'Gratuity', shortLabel: 'Gratuity', icon: Award, color: '#F87171' },
  { id: 'posters', label: 'QR Campaign Posters', shortLabel: 'Posters', icon: QrCode, color: '#818CF8' },
];

export default function WorkerTools() {
  const [activeTab, setActiveTab] = useState<Tab>('salary');
  const active = TABS.find(t => t.id === activeTab)!;

  return (
    <section id="tools" className="section-pad" style={{ background: '#0A1931' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div className="section-label">Worker Tools</div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.2,
              marginTop: '10px',
            }}
          >
            Calculate What You{' '}
            <span className="text-gradient-gold">Legally Deserve</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', marginTop: '10px', fontFamily: 'Inter, sans-serif', maxWidth: '500px' }}>
            Use these calculators to verify your salary, overtime pay, PF contributions, and gratuity based on current Indian labour law.
          </p>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '28px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                id={`tool-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isActive ? tab.color : 'rgba(255,255,255,0.1)',
                  background: isActive ? `${tab.color}15` : 'rgba(255,255,255,0.03)',
                  color: isActive ? tab.color : 'rgba(255,255,255,0.55)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Calculator Panel vs Poster Generator */}
        {activeTab === 'posters' ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${active.color}25`,
              borderRadius: '20px',
              padding: 'clamp(20px, 5vw, 36px)',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${active.color}15`, border: `1px solid ${active.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {<active.icon size={17} style={{ color: active.color }} />}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{active.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Outreach posters and print safe QRs</div>
              </div>
            </div>
            <PosterGenerator />
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${active.color}25`,
              borderRadius: '20px',
              padding: 'clamp(20px, 5vw, 36px)',
              maxWidth: '640px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${active.color}15`, border: `1px solid ${active.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {<active.icon size={17} style={{ color: active.color }} />}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{active.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Enter values to calculate instantly</div>
              </div>
            </div>

            {activeTab === 'salary' && <SalaryCalc />}
            {activeTab === 'overtime' && <OvertimeCalc />}
            {activeTab === 'pf' && <PFCalc />}
            {activeTab === 'gratuity' && <GratuityCalc />}
          </div>
        )}

        <p style={{ marginTop: '16px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', maxWidth: '500px' }}>
          * Calculations are based on standard Indian labour law rates. Actual amounts may vary based on employer agreements and local government orders.
        </p>
      </div>
    </section>
  );
}
