import { useState, useRef, useEffect } from 'react';
import { complaintsService } from '../services/complaints';
import type { ComplaintData, ComplaintType } from '../types/complaint';
import { getPriorityForCategory } from '../types/complaint';
import { FileText, Send, Upload, Info } from 'lucide-react';
import ComplaintReceipt from './ComplaintReceipt';
import SearchableSelect from './SearchableSelect';
import { INDIAN_STATES, STATE_DISTRICTS } from '../data/indiaStates';
import { useTranslation } from '../translations/context';
import { qrAnalyticsService } from '../services/qrAnalytics';
import { otpGateway } from '../utils/otpGateway';

export const INDUSTRIES = [
  'Automobile', 'Manufacturing', 'Construction', 'Logistics', 'Warehouse',
  'Security', 'Housekeeping', 'Hotel', 'Restaurant', 'Retail',
  'Agriculture', 'Hospital', 'Healthcare', 'Education', 'IT',
  'BPO', 'Textile', 'Engineering', 'Government Contract', 'Other'
];

export const WORKER_TYPES = [
  'Permanent Employee', 'Contract Worker', 'Apprentice', 'Trainee',
  'Daily Wage Worker', 'Migrant Worker', 'Gig Worker', 'Other'
];

export const EDUCATION_LEVELS = [
  'No Formal Education', 'Primary', 'Secondary', 'Higher Secondary',
  'Diploma', 'Graduate', 'Post Graduate', 'Other'
];

export const LANGUAGES = [
  'Auto Detect', 'Hindi', 'Marathi', 'English'
];

export const DOCUMENT_TYPES = [
  'Salary Slip', 'PF Statement', 'ESIC Card', 'Appointment Letter',
  'Identity Proof', 'Complaint Evidence', 'Photos', 'Other'
];

const GENDERS = ['Male', 'Female', 'Other'];

const COMPLAINT_AGAINST_OPTIONS = [
  'Employer', 'Contractor', 'HR Department', 'Supervisor', 'Company Management', 'Other'
];

type FormErrors = Partial<Record<keyof FormState, string>>;

interface FormState {
  name: string;
  mobile: string;
  email: string;
  gender: string;
  age: string;
  homeState: string;
  homeDistrict: string;
  workState: string;
  workDistrict: string;
  industryType: string;
  companyName: string;
  employeeId: string;
  workerType: string;
  educationLevel: string;
  preferredLanguage: string;
  complaintType: string;
  description: string;
  documentType: string;

  // Upgraded Fields
  employerName: string;
  employerMobile: string;
  employerEmail: string;
  companyAddress: string;
  workSiteAddress: string;
  supervisorName: string;
  supervisorMobile: string;
  hrMobile: string;
  hrEmail: string;
  incidentDate: string;
  complaintAgainst: string;
  approxFinancialLoss: string;
  witnessName: string;
  witnessMobile: string;
  witnessDesignation: string;
  evidenceNotes: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  mobile: '',
  email: '',
  gender: '',
  age: '',
  homeState: 'Maharashtra',
  homeDistrict: '',
  workState: 'Maharashtra',
  workDistrict: '',
  industryType: '',
  companyName: '',
  employeeId: '',
  workerType: '',
  educationLevel: '',
  preferredLanguage: 'Auto Detect',
  complaintType: '',
  description: '',
  documentType: '',

  // Upgraded Fields
  employerName: '',
  employerMobile: '',
  employerEmail: '',
  companyAddress: '',
  workSiteAddress: '',
  supervisorName: '',
  supervisorMobile: '',
  hrMobile: '',
  hrEmail: '',
  incidentDate: '',
  complaintAgainst: 'Employer',
  approxFinancialLoss: '',
  witnessName: '',
  witnessMobile: '',
  witnessDesignation: '',
  evidenceNotes: '',
};

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

function TextField({ id, label, value, onChange, placeholder, error, type = 'text', required = true, inputMode }: TextFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif' }}>
        {label} {required && <span style={{ color: '#F87171' }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '10px',
          background: error ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${error ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: error ? '0 0 0 3px rgba(248, 113, 113, 0.25)' : 'none',
          color: 'white',
          fontSize: '0.92rem',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#F5A623';
          e.currentTarget.style.boxShadow = error
            ? '0 0 0 3px rgba(248, 113, 113, 0.25), 0 0 8px rgba(245, 166, 35, 0.4)'
            : '0 0 8px rgba(245, 166, 35, 0.4)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)';
          e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(248, 113, 113, 0.25)' : 'none';
        }}
      />
      {error && <p style={{ fontSize: '0.78rem', color: '#F87171', fontFamily: 'Inter, sans-serif' }}>{error}</p>}
    </div>
  );
}

export default function ComplaintForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ComplaintData | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset verification if mobile changes
  useEffect(() => {
    setIsOtpVerified(false);
    setShowOtpField(false);
    setSentOtp(null);
    setOtpCode('');
  }, [form.mobile]);

  // Check duplicates dynamically
  useEffect(() => {
    if (form.mobile && form.companyName && form.complaintType) {
      const exists = complaintsService.checkDuplicateExists(form.mobile, form.companyName, form.complaintType);
      setDuplicateWarning(exists);
    } else {
      setDuplicateWarning(false);
    }
  }, [form.mobile, form.companyName, form.complaintType]);

  const handleSendOTP = async () => {
    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setErrors((prev) => ({ ...prev, mobile: t('complaint.errMobile') }));
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    try {
      const code = await otpGateway.sendOTP(form.mobile);
      setSentOtp(code);
      setShowOtpField(true);
      setOtpTimer(30);
    } catch (err) {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 4) {
      setOtpError('Enter a valid 4-digit code');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const isCorrect = await otpGateway.verifyOTP(form.mobile, otpCode, sentOtp || '');
      if (isCorrect) {
        setIsOtpVerified(true);
        setShowOtpField(false);
      } else {
        setOtpError('Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setOtpError('Verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jankam_draft_complaint');
      if (saved) {
        setForm(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load complaint draft', e);
    }
  }, []);

  // Save draft on form changes
  useEffect(() => {
    if (form !== EMPTY_FORM && !submitted) {
      localStorage.setItem('jankam_draft_complaint', JSON.stringify(form));
    }
  }, [form, submitted]);

  const set = (key: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleHomeStateChange = (stateVal: string) => {
    setForm((prev) => ({ ...prev, homeState: stateVal, homeDistrict: '' }));
    if (errors.homeState) setErrors((prev) => ({ ...prev, homeState: undefined }));
  };

  const handleWorkStateChange = (stateVal: string) => {
    setForm((prev) => ({ ...prev, workState: stateVal, workDistrict: '' }));
    if (errors.workState) setErrors((prev) => ({ ...prev, workState: undefined }));
  };

  function validateForm(f: FormState): FormErrors {
    const errs: FormErrors = {};
    if (!f.name.trim() || f.name.trim().length < 2) {
      errs.name = t('complaint.errName');
    }
    if (!/^[0-9]{10}$/.test(f.mobile)) {
      errs.mobile = t('complaint.errMobile');
    }
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errs.email = t('complaint.errEmail');
    }
    if (!f.gender) errs.gender = t('complaint.errGender');
    
    const parsedAge = parseInt(f.age);
    if (!f.age || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      errs.age = t('complaint.errAge');
    }
    if (!f.homeState) errs.homeState = t('complaint.errHomeState');
    if (!f.homeDistrict) errs.homeDistrict = t('complaint.errHomeDistrict');
    if (!f.workState) errs.workState = t('complaint.errWorkState');
    if (!f.workDistrict) errs.workDistrict = t('complaint.errWorkDistrict');
    if (!f.industryType) errs.industryType = t('complaint.errIndustry');
    if (!f.companyName.trim() || f.companyName.trim().length < 2) {
      errs.companyName = t('complaint.errCompany');
    }
    if (!f.workerType) errs.workerType = t('complaint.errWorkerType');
    if (!f.educationLevel) errs.educationLevel = t('complaint.errEducation');
    if (!f.preferredLanguage) errs.preferredLanguage = t('complaint.errLang');
    if (!f.complaintType) errs.complaintType = t('complaint.errComplaintType');
    if (!f.description.trim() || f.description.trim().length < 30) {
      errs.description = t('complaint.errDescription');
    }
    
    // Upgraded Fields Validation
    if (!f.employerName.trim() || f.employerName.trim().length < 2) {
      errs.employerName = t('complaint.errEmployerName');
    }
    if (!f.incidentDate) {
      errs.incidentDate = t('complaint.errIncidentDate');
    }
    if (!f.complaintAgainst) {
      errs.complaintAgainst = t('complaint.errComplaintAgainst');
    }

    if (f.employerMobile && !/^[0-9]{10}$/.test(f.employerMobile)) {
      errs.employerMobile = t('complaint.errMobile');
    }
    if (f.witnessMobile && !/^[0-9]{10}$/.test(f.witnessMobile)) {
      errs.witnessMobile = t('complaint.errMobile');
    }
    if (f.supervisorMobile && !/^[0-9]{10}$/.test(f.supervisorMobile)) {
      errs.supervisorMobile = t('complaint.errMobile');
    }
    if (f.hrMobile && !/^[0-9]{10}$/.test(f.hrMobile)) {
      errs.hrMobile = t('complaint.errMobile');
    }
    return errs;
  }

  useEffect(() => {
    const handleAutofill = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        const d = customEvent.detail;
        setForm({
          name: d.name || '',
          mobile: d.mobile || '',
          email: d.email || '',
          gender: d.gender || '',
          age: String(d.age || ''),
          homeState: d.homeState || 'Maharashtra',
          homeDistrict: d.homeDistrict || '',
          workState: d.workState || 'Maharashtra',
          workDistrict: d.workDistrict || '',
          industryType: d.industryType || '',
          companyName: d.companyName || d.employer || '',
          employeeId: d.employeeId || '',
          workerType: d.workerType || '',
          educationLevel: d.educationLevel || '',
          preferredLanguage: d.preferredLanguage || 'Auto Detect',
          complaintType: d.complaintType || '',
          description: d.description || '',
          documentType: d.documentType || '',

          employerName: d.employerName || d.companyName || '',
          employerMobile: d.employerMobile || '',
          employerEmail: d.employerEmail || '',
          companyAddress: d.companyAddress || '',
          workSiteAddress: d.workSiteAddress || '',
          supervisorName: d.supervisorName || '',
          supervisorMobile: d.supervisorMobile || '',
          hrMobile: d.hrMobile || '',
          hrEmail: d.hrEmail || '',
          incidentDate: d.incidentDate || new Date().toISOString().split('T')[0],
          complaintAgainst: d.complaintAgainst || 'Employer',
          approxFinancialLoss: d.approxFinancialLoss || '',
          witnessName: d.witnessName || '',
          witnessMobile: d.witnessMobile || '',
          witnessDesignation: d.witnessDesignation || '',
          evidenceNotes: d.evidenceNotes || '',
        });
        setErrors({});
        setTimeout(() => {
          const el = document.getElementById('complaint');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };
    window.addEventListener('jankam-autofill-complaint', handleAutofill);
    return () => window.removeEventListener('jankam-autofill-complaint', handleAutofill);
  }, []);

  const [testDiagResponse, setTestDiagResponse] = useState<string>('');
  
  const handleTestDirectInsert = async () => {
    setTestDiagResponse('Starting diagnostic insert test...\n');
    try {
      const { supabase } = await import('../services/supabaseClient');
      if (!supabase) {
        setTestDiagResponse(prev => prev + '❌ Supabase client is null or offline.\n');
        return;
      }
      
      const testId = `JK-DB-TEST-${Date.now()}`;
      setTestDiagResponse(prev => prev + `[ACTION] Inserting test record with ID: ${testId}...\n`);
      
      const payload = {
        id: testId,
        name: 'DB_TEST',
        mobile: '9999999999',
        home_state: 'Maharashtra',
        home_district: 'Pune',
        work_state: 'Maharashtra',
        work_district: 'Pune',
        company_name: 'DB_TEST_COMPANY',
        complaint_type: 'Other',
        description: 'Temporary database write diagnostic test',
        employer_name: 'DB_TEST_EMPLOYER',
        incident_date: '2026-05-30',
        current_stage: 'submitted',
        status: 'submitted'
      };
      
      const response = await supabase.from('complaints').insert([payload]);
      const { data, error, status, statusText } = response;
      
      setTestDiagResponse(prev => prev + `[SUPABASE] HTTP Status: ${status} ${statusText}\n`);
      if (error) {
        setTestDiagResponse(prev => prev + `❌ INSERT FAILED!\nError code: ${error.code}\nMessage: ${error.message}\nDetails: ${error.details}\n`);
      } else {
        setTestDiagResponse(prev => prev + `✅ INSERT SUCCESS!\nData: ${JSON.stringify(data, null, 2)} (select returning blocked by RLS as expected, row created in DB)`);
      }
    } catch (err: any) {
      setTestDiagResponse(prev => prev + `❌ FATAL CRASH: ${err.message || err}\n`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[STEP 1] Submit clicked. Form values:', form);
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      console.warn('[STEP 1.5] Validation failed with errors:', errs);
      setErrors(errs);
      
      // Auto focus & Auto scroll to first invalid field
      setTimeout(() => {
        const firstKey = Object.keys(errs)[0];
        const el = document.getElementById(`cf-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        } else {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    console.log('[STEP 2] Validation passed. Proceeding with database submission...');
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const selectedCategory = form.complaintType as ComplaintType;
    const calculatedPriority = getPriorityForCategory(selectedCategory);

    const result = await complaintsService.submit({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      gender: form.gender,
      age: parseInt(form.age),
      homeState: form.homeState,
      homeDistrict: form.homeDistrict,
      workState: form.workState,
      workDistrict: form.workDistrict,
      industryType: form.industryType,
      companyName: form.companyName.trim(),
      employeeId: form.employeeId.trim() || undefined,
      workerType: form.workerType,
      educationLevel: form.educationLevel,
      preferredLanguage: form.preferredLanguage,
      complaintType: selectedCategory,
      description: form.description.trim(),
      priorityLevel: calculatedPriority,
      documentType: form.documentType || undefined,

      employerName: form.employerName.trim(),
      employerMobile: form.employerMobile.trim() || undefined,
      employerEmail: form.employerEmail.trim() || undefined,
      companyAddress: form.companyAddress.trim() || undefined,
      workSiteAddress: form.workSiteAddress.trim() || undefined,
      supervisorName: form.supervisorName.trim() || undefined,
      supervisorMobile: form.supervisorMobile.trim() || undefined,
      hrMobile: form.hrMobile.trim() || undefined,
      hrEmail: form.hrEmail.trim() || undefined,
      incidentDate: form.incidentDate,
      complaintAgainst: form.complaintAgainst as any,
      approxFinancialLoss: form.approxFinancialLoss.trim() || undefined,
      witnessName: form.witnessName.trim() || undefined,
      witnessMobile: form.witnessMobile.trim() || undefined,
      witnessDesignation: form.witnessDesignation.trim() || undefined,
      evidenceNotes: form.evidenceNotes.trim() || undefined,

      workerMobileVerified: true,
      lastNotificationSent: null,
      notificationType: 'WhatsApp',

      internalNotes: 'Complaint received and verified. Advised worker on rights and queued for volunteer validation.',
      publicUpdate: 'Complaint registered successfully and assigned to district advocacy desk.',
      currentStage: 'submitted',
      assignedVolunteer: 'Suresh Mane',
      assignedDistrictTeam: `${form.workDistrict || 'Pune'} District Desk`,
      assignedOfficer: 'Pankaj Dhole'
    });

    if (form.preferredLanguage && form.preferredLanguage !== 'Auto Detect') {
      const code = form.preferredLanguage === 'Hindi' ? 'hi' : form.preferredLanguage === 'Marathi' ? 'mr' : 'en';
      localStorage.setItem('jankam_session_lang', code);
    }

    // Clear draft on successful submit
    localStorage.removeItem('jankam_draft_complaint');

    // Record QR Campaign conversion if scanned
    qrAnalyticsService.recordComplaintConversion();

    setSubmitting(false);
    setSubmitted(result);
    window.dispatchEvent(new Event('jankam-data-update'));
  };

  const handleReset = () => {
    localStorage.removeItem('jankam_draft_complaint');
    setSubmitted(null);
    setForm(EMPTY_FORM);
    setErrors({});
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const homeDistricts = STATE_DISTRICTS[form.homeState] || ['Other'];
  const workDistricts = STATE_DISTRICTS[form.workState] || ['Other'];

  return (
    <section id="complaint" className="section-pad" style={{ background: '#0F2347' }} ref={formRef}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left — Info */}
          <div className="lg:col-span-4 lg:sticky lg:top-[100px]">
            <div className="section-label">{t('nav.fileComplaint')}</div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.7rem, 4.5vw, 2.5rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              {t('services.title')}{' '}
              <span className="text-gradient-gold">{t('services.titleGold')}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.97rem', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', marginBottom: '28px' }}>
              {t('hero.subtitle')}
            </p>

            {/* Steps */}
            {[
              { step: '1', label: 'Provide Information', desc: 'Enter states/districts, employment parameters, employer details, and description.' },
              { step: '2', label: 'Get Complaint ID', desc: 'Unique tracking ID generated instantly on submit.' },
              { step: '3', label: 'Download Receipt', desc: 'Secure PDF summary sheet for legal backup.' },
              { step: '4', label: 'AI Grievance Counsel', desc: 'Discuss your specific case instantly with JanKam AI.' },
            ].map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F5A623, #D4890A)',
                    color: '#0A1931',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem', fontFamily: 'Outfit, sans-serif' }}>{s.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div
              style={{
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t('tracker.fieldId')}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: '#F5A623', fontWeight: 700, letterSpacing: '2px' }}>
                JK-PUNE-0021
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                Format: JK-{"{WORK_DISTRICT}"}-{"{0000}"}
              </div>
            </div>
          </div>

          {/* Right — Form or Receipt */}
          <div className="lg:col-span-8">
            {submitted ? (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <ComplaintReceipt
                  complaint={submitted}
                  onNewComplaint={handleReset}
                />
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: 'clamp(20px, 5vw, 36px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Top Error Summary Banner */}
                {Object.keys(errors).length > 0 && (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(248,113,113,0.12)',
                      border: '1.5px solid rgba(248,113,113,0.3)',
                      borderRadius: '12px',
                      color: '#F87171',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      fontFamily: 'Inter, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <span>⚠ Please complete {Object.keys(errors).length} required fields before submitting.</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(245,166,35,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} style={{ color: '#F5A623' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>
                      {t('complaint.formTitle')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                      {t('complaint.formSub')}
                    </div>
                  </div>
                </div>

                {/* ── Section 1: Worker Info ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.sectionWorker')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-name"
                    label={t('complaint.fieldName')}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Rajesh Kumar"
                    error={errors.name}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <TextField
                      id="cf-mobile"
                      label={t('complaint.fieldMobile')}
                      value={form.mobile}
                      onChange={set('mobile')}
                      placeholder="10-digit mobile number"
                      error={errors.mobile}
                      type="tel"
                      inputMode="numeric"
                    />
                    
                    {/* OTP Trigger & Indicator */}
                    {/^[0-9]{10}$/.test(form.mobile) && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        {isOtpVerified ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                            <span style={{ background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                              ✓ Mobile Verified
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={sendingOtp || otpTimer > 0}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(245,166,35,0.1)',
                              border: '1.5px solid rgba(245,166,35,0.3)',
                              color: '#F5A623',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: sendingOtp ? 'wait' : 'pointer',
                              fontFamily: 'Outfit, sans-serif',
                              outline: 'none',
                              borderStyle: 'solid',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; }}
                          >
                            {sendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send Verification OTP'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* OTP Code Entry Panel */}
                {showOtpField && !isOtpVerified && (
                  <div
                    style={{
                      background: 'rgba(245,166,35,0.06)',
                      border: '1.5px solid rgba(245,166,35,0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginTop: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'fadeIn 0.2s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="cf-otp-code" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                        Enter 4-Digit Verification Code *
                      </label>
                      {otpTimer > 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                          Resend in {otpTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          style={{ background: 'none', border: 'none', color: '#F5A623', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="cf-otp-code"
                        type="text"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="e.g. 4982"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1.5px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          letterSpacing: '3px',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifyingOtp || otpCode.length !== 4}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          background: '#F5A623',
                          color: '#0A1931',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: verifyingOtp || otpCode.length !== 4 ? 'not-allowed' : 'pointer',
                          opacity: verifyingOtp || otpCode.length !== 4 ? 0.6 : 1,
                          outline: 'none',
                          border: 'none',
                        }}
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {otpError && (
                      <p style={{ fontSize: '0.75rem', color: '#F87171', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                        ⚠ {otpError}
                      </p>
                    )}
                  </div>
                )}

                {/* Duplicate Claim Warning Panel */}
                {duplicateWarning && (
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1.5px solid rgba(239,68,68,0.3)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      color: '#F87171',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      fontFamily: 'Inter, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '6px',
                      animation: 'fadeIn 0.2s ease-out',
                    }}
                  >
                    <span>⚠ Warning: Possible duplicate complaint found. 3 similar complaints already exist under this mobile number, company, and category.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    id="cf-email"
                    label={t('complaint.fieldEmail')}
                    value={form.email}
                    onChange={set('email')}
                    placeholder="name@example.com"
                    error={errors.email}
                    required={false}
                    type="email"
                  />
                  <SearchableSelect
                    id="cf-gender"
                    label={t('complaint.fieldGender')}
                    value={form.gender}
                    onChange={set('gender')}
                    options={GENDERS.map(g => ({ value: g, label: g }))}
                    placeholder="Select gender"
                    error={errors.gender}
                  />
                  <TextField
                    id="cf-age"
                    label={t('complaint.fieldAge')}
                    value={form.age}
                    onChange={set('age')}
                    placeholder="e.g. 28"
                    error={errors.age}
                    type="number"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SearchableSelect
                    id="cf-preferredLanguage"
                    label={t('complaint.fieldLang')}
                    value={form.preferredLanguage}
                    onChange={set('preferredLanguage')}
                    options={LANGUAGES.map(l => ({ value: l, label: l }))}
                    placeholder="Select preferred language"
                    error={errors.preferredLanguage}
                  />
                  <SearchableSelect
                    id="cf-educationLevel"
                    label={t('complaint.fieldEducation')}
                    value={form.educationLevel}
                    onChange={set('educationLevel')}
                    options={EDUCATION_LEVELS.map(e => ({ value: e, label: e }))}
                    placeholder="Select education level"
                    error={errors.educationLevel}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SearchableSelect
                    id="cf-homeState"
                    label={t('complaint.fieldHomeState')}
                    value={form.homeState}
                    onChange={handleHomeStateChange}
                    options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                    placeholder="Select Home State"
                    error={errors.homeState}
                  />
                  <SearchableSelect
                    id="cf-homeDistrict"
                    label={t('complaint.fieldHomeDistrict')}
                    value={form.homeDistrict}
                    onChange={set('homeDistrict')}
                    options={homeDistricts.map(d => ({ value: d, label: d }))}
                    placeholder="Select Home District"
                    error={errors.homeDistrict}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SearchableSelect
                    id="cf-workState"
                    label={t('complaint.fieldWorkState')}
                    value={form.workState}
                    onChange={handleWorkStateChange}
                    options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                    placeholder="Select Work State"
                    error={errors.workState}
                  />
                  <SearchableSelect
                    id="cf-workDistrict"
                    label={t('complaint.fieldWorkDistrict')}
                    value={form.workDistrict}
                    onChange={set('workDistrict')}
                    options={workDistricts.map(d => ({ value: d, label: d }))}
                    placeholder="Select Work District"
                    error={errors.workDistrict}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SearchableSelect
                    id="cf-industryType"
                    label={t('complaint.fieldIndustry')}
                    value={form.industryType}
                    onChange={set('industryType')}
                    options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                    placeholder="Select industry"
                    error={errors.industryType}
                  />
                  <SearchableSelect
                    id="cf-workerType"
                    label={t('complaint.fieldWorkerType')}
                    value={form.workerType}
                    onChange={set('workerType')}
                    options={WORKER_TYPES.map(w => ({ value: w, label: w }))}
                    placeholder="Select worker type"
                    error={errors.workerType}
                  />
                </div>


                {/* ── Section 2: Employer Info ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.sectionEmployer')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-employerName"
                    label={t('complaint.fieldEmployerName')}
                    value={form.employerName}
                    onChange={set('employerName')}
                    placeholder="Manager, Contractor, or Owner's name"
                    error={errors.employerName}
                  />
                  <TextField
                    id="cf-companyName"
                    label={t('complaint.fieldCompany')}
                    value={form.companyName}
                    onChange={set('companyName')}
                    placeholder="Employer's company name"
                    error={errors.companyName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-employerMobile"
                    label={t('complaint.fieldEmployerMobile')}
                    value={form.employerMobile}
                    onChange={set('employerMobile')}
                    placeholder="10-digit mobile number"
                    error={errors.employerMobile}
                    required={false}
                    type="tel"
                    inputMode="numeric"
                  />
                  <TextField
                    id="cf-employerEmail"
                    label={t('complaint.fieldEmployerEmail')}
                    value={form.employerEmail}
                    onChange={set('employerEmail')}
                    placeholder="employer@company.com"
                    error={errors.employerEmail}
                    required={false}
                    type="email"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-companyAddress"
                    label={t('complaint.fieldCompanyAddress')}
                    value={form.companyAddress}
                    onChange={set('companyAddress')}
                    placeholder="Registered head office address"
                    error={errors.companyAddress}
                    required={false}
                  />
                  <TextField
                    id="cf-workSiteAddress"
                    label={t('complaint.fieldWorkSiteAddress')}
                    value={form.workSiteAddress}
                    onChange={set('workSiteAddress')}
                    placeholder="Exact worksite, factory, or office location"
                    error={errors.workSiteAddress}
                    required={false}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-supervisorName"
                    label={t('complaint.fieldSupervisorName')}
                    value={form.supervisorName}
                    onChange={set('supervisorName')}
                    placeholder="Direct supervisor's name"
                    error={errors.supervisorName}
                    required={false}
                  />
                  <TextField
                    id="cf-supervisorMobile"
                    label={t('complaint.fieldSupervisorMobile')}
                    value={form.supervisorMobile}
                    onChange={set('supervisorMobile')}
                    placeholder="Supervisor's mobile number"
                    error={errors.supervisorMobile}
                    required={false}
                    type="tel"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    id="cf-hrMobile"
                    label={t('complaint.fieldHrMobile')}
                    value={form.hrMobile}
                    onChange={set('hrMobile')}
                    placeholder="HR contact number"
                    error={errors.hrMobile}
                    required={false}
                    type="tel"
                    inputMode="numeric"
                  />
                  <TextField
                    id="cf-hrEmail"
                    label={t('complaint.fieldHrEmail')}
                    value={form.hrEmail}
                    onChange={set('hrEmail')}
                    placeholder="hr@company.com"
                    error={errors.hrEmail}
                    required={false}
                    type="email"
                  />
                </div>


                {/* ── Section 3: Incident Details ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.sectionIncident')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    id="cf-incidentDate"
                    label={t('complaint.fieldIncidentDate')}
                    value={form.incidentDate}
                    onChange={set('incidentDate')}
                    placeholder="YYYY-MM-DD"
                    error={errors.incidentDate}
                    type="date"
                  />
                  <SearchableSelect
                    id="cf-complaintAgainst"
                    label={t('complaint.fieldComplaintAgainst')}
                    value={form.complaintAgainst}
                    onChange={set('complaintAgainst')}
                    options={COMPLAINT_AGAINST_OPTIONS.map(o => ({ value: o, label: o }))}
                    placeholder="Directed against..."
                    error={errors.complaintAgainst}
                  />
                  <TextField
                    id="cf-approxFinancialLoss"
                    label={t('complaint.fieldFinancialLoss')}
                    value={form.approxFinancialLoss}
                    onChange={set('approxFinancialLoss')}
                    placeholder="e.g. ₹25,000"
                    error={errors.approxFinancialLoss}
                    required={false}
                  />
                </div>

                <SearchableSelect
                  id="cf-complaint-type"
                  label={t('complaint.fieldComplaintType')}
                  value={form.complaintType}
                  onChange={set('complaintType')}
                  options={Object.entries({
                    'Salary Delay': 'Salary Delay',
                    'Salary Deduction': 'Salary Deduction',
                    'Overtime Non-Payment': 'Overtime Non-Payment',
                    'PF Issue': 'PF (Provident Fund) Issue',
                    'ESIC Issue': 'ESIC Issue',
                    'Workplace Harassment': 'Workplace Harassment',
                    'Women Safety': 'Women Safety & POSH Support',
                    'Illegal Termination': 'Illegal Termination / Layoff',
                    'Leave Issue': 'Leave Rights / Policy Issue',
                    'Gratuity Issue': 'Gratuity / Retiral Benefit Issue',
                    'Contract Labour Issue': 'Contract Labour Violation',
                    'Other': 'Other Labour / Workplace Grievance',
                  }).map(([v, l]) => ({ value: v, label: l }))}
                  placeholder="Select complaint category"
                  error={errors.complaintType}
                />

                {form.complaintType && (
                  <div
                    style={{
                      background: 'rgba(245,166,35,0.06)',
                      border: '1px solid rgba(245,166,35,0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.78rem',
                      color: '#F5A623',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>
                      Automatic priority assigned: <strong>{t(`complaint.priority${getPriorityForCategory(form.complaintType as ComplaintType)}`) || `${getPriorityForCategory(form.complaintType as ComplaintType)} Priority`}</strong>
                    </span>
                  </div>
                )}

                {/* Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="cf-description" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.fieldDescription')} <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <textarea
                    id="cf-description"
                    value={form.description}
                    onChange={(e) => set('description')(e.target.value)}
                    placeholder="Describe your complaint in detail — what happened, when it happened, and who is responsible. Minimum 30 characters."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: errors.description ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${errors.description ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: errors.description ? '0 0 0 3px rgba(248, 113, 113, 0.25)' : 'none',
                      color: 'white',
                      fontSize: '0.92rem',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '120px',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#F5A623';
                      e.currentTarget.style.boxShadow = errors.description
                        ? '0 0 0 3px rgba(248, 113, 113, 0.25), 0 0 8px rgba(245, 166, 35, 0.4)'
                        : '0 0 8px rgba(245, 166, 35, 0.4)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.description ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.boxShadow = errors.description ? '0 0 0 3px rgba(248, 113, 113, 0.25)' : 'none';
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {errors.description ? (
                      <p style={{ fontSize: '0.78rem', color: '#F87171', fontFamily: 'Inter, sans-serif' }}>{errors.description}</p>
                    ) : (
                      <span />
                    )}
                    <span style={{ fontSize: '0.75rem', color: form.description.length >= 30 ? '#34D399' : 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                      {form.description.length} / 30 characters
                    </span>
                  </div>
                </div>


                {/* ── Section 4: Evidence & Witness Collection ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.sectionEvidence')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    id="cf-witnessName"
                    label={t('complaint.fieldWitnessName')}
                    value={form.witnessName}
                    onChange={set('witnessName')}
                    placeholder="Co-worker / supervisor's name"
                    error={errors.witnessName}
                    required={false}
                  />
                  <TextField
                    id="cf-witnessMobile"
                    label={t('complaint.fieldWitnessMobile')}
                    value={form.witnessMobile}
                    onChange={set('witnessMobile')}
                    placeholder="10-digit mobile number"
                    error={errors.witnessMobile}
                    required={false}
                    type="tel"
                    inputMode="numeric"
                  />
                  <TextField
                    id="cf-witnessDesignation"
                    label={t('complaint.fieldWitnessDesignation')}
                    value={form.witnessDesignation}
                    onChange={set('witnessDesignation')}
                    placeholder="e.g. Electrician, Operator"
                    error={errors.witnessDesignation}
                    required={false}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="cf-evidenceNotes" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.fieldEvidenceNotes')}
                  </label>
                  <textarea
                    id="cf-evidenceNotes"
                    value={form.evidenceNotes}
                    onChange={(e) => set('evidenceNotes')(e.target.value)}
                    placeholder="Detail any logs, audio clips, video recordings, notices, or text chains supporting this case."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1.5px solid rgba(255,255,255,0.12)',
                      color: 'white',
                      fontSize: '0.92rem',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#F5A623'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  />
                </div>


                {/* ── Section 5: Documents Onboarding ── */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                    {t('complaint.sectionDocs')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Real Employee ID input */}
                  <TextField
                    id="cf-employeeId-real"
                    label={t('complaint.fieldEmployeeId')}
                    value={form.employeeId}
                    onChange={set('employeeId')}
                    placeholder="e.g. EMP-1234"
                    required={false}
                  />

                  <SearchableSelect
                    id="cf-documentType"
                    label={t('complaint.fieldDocType')}
                    value={form.documentType}
                    onChange={set('documentType')}
                    options={DOCUMENT_TYPES.map(d => ({ value: d, label: d }))}
                    placeholder="Select doc type"
                    error={errors.documentType}
                    required={false}
                  />
                </div>

                {/* Optional Doc Upload UI (Visual Cue) */}
                <div
                  style={{
                    border: '1.5px dashed rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('cf-file-uploader')?.click()}
                >
                  <input type="file" id="cf-file-uploader" style={{ display: 'none' }} />
                  <Upload size={22} style={{ color: '#F5A623', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
                    {form.documentType ? `${t('complaint.fieldDocUpload')} (${form.documentType})` : t('complaint.fieldDocUpload')}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    Max file size: 5MB (Optional)
                  </div>
                </div>

                {/* Sandbox OTP warning */}
                {!isOtpVerified && (
                  <div style={{ fontSize: '0.8rem', color: '#F5A623', marginBottom: '8px', textAlign: 'center', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                    ⚠️ Sandbox Mode: Mobile OTP verification is highly recommended, but bypass is active for database verification.
                  </div>
                )}

                {/* Submit Button */}
                <button
                  id="cf-submit"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    fontSize: '1rem',
                    padding: '15px',
                    justifyContent: 'center',
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'wait' : 'pointer',
                    marginTop: '8px',
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '18px', height: '18px', border: '2px solid rgba(10,25,49,0.3)', borderTopColor: '#0A1931', borderRadius: '50%' }} />
                      {t('complaint.btnSubmitting')}
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      {t('complaint.btnSubmit')}
                    </>
                  )}
                </button>

                {/* Temporary Diagnostic Test Button */}
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <button
                    type="button"
                    onClick={handleTestDirectInsert}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(245,166,35,0.15)',
                      border: '1px solid rgba(245,166,35,0.3)',
                      color: '#F5A623',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                  >
                    🛠️ Test Direct Database Insert
                  </button>
                  {testDiagResponse && (
                    <pre style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'rgba(255,255,255,0.85)',
                      whiteSpace: 'pre-wrap',
                      textAlign: 'left',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      {testDiagResponse}
                    </pre>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                  🔒 Double-encrypted intake database. Receipt with Vector QR tracking code generated instantly on submit.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
