import { useState, useEffect } from 'react';
import { Users, CheckCircle, ArrowRight, Shield, Phone, MapPin, Briefcase, Award, Download, Printer, PlusCircle, Heart } from 'lucide-react';
import { membersService } from '../services/members';
import { leadershipService } from '../services/leadership';
import { settingsService } from '../services/settings';
import { analyticsService } from '../services/analytics';
import SearchableSelect from './SearchableSelect';
import { INDIAN_STATES, STATE_DISTRICTS } from '../data/indiaStates';
import { INDUSTRIES, WORKER_TYPES, EDUCATION_LEVELS, LANGUAGES } from './ComplaintForm';
import { qrAnalyticsService } from '../services/qrAnalytics';
import { otpGateway } from '../utils/otpGateway';

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

const VOLUNTEER_SKILLS = [
  'Labour Rights Awareness', 'Social Media', 'Legal Support', 'Worker Counseling',
  'Data Entry', 'Event Coordination', 'Community Outreach', 'Digital Marketing',
  'Training', 'Other'
];

const GENDERS = ['Male', 'Female', 'Other'];

const BENEFITS = [
  { icon: Shield, text: 'Free legal support for labour disputes' },
  { icon: Phone, text: '24×7 helpline access priority' },
  { icon: Users, text: 'Community of 8,432+ workers standing united' },
  { icon: CheckCircle, text: 'Instant grievance ID tracking & automated AI assistance' },
];

interface MemberFormState {
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
  workerType: string;
  educationLevel: string;
  preferredLanguage: string;
  companyName: string;
  occupation: string;
  experience: string; // Years
  emergencyName: string;
  emergencyMobile: string;
}

const EMPTY_MEMBER: MemberFormState = {
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
  workerType: '',
  educationLevel: '',
  preferredLanguage: 'Auto Detect',
  companyName: '',
  occupation: '',
  experience: '',
  emergencyName: '',
  emergencyMobile: '',
};

interface VolunteerFormState {
  name: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  industryType: string;
  workerType: string;
  educationLevel: string;
  preferredLanguage: string;
  skills: string[];
  emergencyName: string;
  emergencyMobile: string;
}

const EMPTY_VOLUNTEER: VolunteerFormState = {
  name: '',
  mobile: '',
  email: '',
  state: 'Maharashtra',
  district: '',
  industryType: '',
  workerType: '',
  educationLevel: '',
  preferredLanguage: 'Auto Detect',
  skills: [],
  emergencyName: '',
  emergencyMobile: '',
};

type MemberErrors = Partial<Record<keyof MemberFormState, string>>;
type VolunteerErrors = Partial<Record<keyof VolunteerFormState, string>>;

export default function JoinJanKam() {
  const [settings, setSettings] = useState(() => settingsService.getAll());
  const [activeTab, setActiveTab] = useState<'member' | 'volunteer'>('member');
  const [liveWorkerCount, setLiveWorkerCount] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(settingsService.getAll());
    };
    window.addEventListener('jankam-settings-update', handleUpdate);
    return () => window.removeEventListener('jankam-settings-update', handleUpdate);
  }, []);

  // Sync live worker count for benefits text
  useEffect(() => {
    const refresh = () => {
      const stats = analyticsService.getLiveStats();
      setLiveWorkerCount(stats.workersSupported);
    };
    refresh();
    window.addEventListener('jankam-data-update', refresh);
    return () => window.removeEventListener('jankam-data-update', refresh);
  }, []);
  
  // States for Member form
  const [memberForm, setMemberForm] = useState<MemberFormState>(EMPTY_MEMBER);
  const [memberErrors, setMemberErrors] = useState<MemberErrors>({});
  const [memberSubmitted, setMemberSubmitted] = useState<any | null>(null);

  // States for Volunteer form
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormState>(EMPTY_VOLUNTEER);
  const [volunteerErrors, setVolunteerErrors] = useState<VolunteerErrors>({});
  const [volunteerSubmitted, setVolunteerSubmitted] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Member OTP States
  const [memberOtpCode, setMemberOtpCode] = useState('');
  const [memberSentOtp, setMemberSentOtp] = useState<string | null>(null);
  const [isMemberOtpVerified, setIsMemberOtpVerified] = useState(false);
  const [memberOtpTimer, setMemberOtpTimer] = useState(0);
  const [showMemberOtpField, setShowMemberOtpField] = useState(false);
  const [memberOtpError, setMemberOtpError] = useState('');
  const [sendingMemberOtp, setSendingMemberOtp] = useState(false);
  const [verifyingMemberOtp, setVerifyingMemberOtp] = useState(false);

  // Volunteer OTP States
  const [volunteerOtpCode, setVolunteerOtpCode] = useState('');
  const [volunteerSentOtp, setVolunteerSentOtp] = useState<string | null>(null);
  const [isVolunteerOtpVerified, setIsVolunteerOtpVerified] = useState(false);
  const [volunteerOtpTimer, setVolunteerOtpTimer] = useState(0);
  const [showVolunteerOtpField, setShowVolunteerOtpField] = useState(false);
  const [volunteerOtpError, setVolunteerOtpError] = useState('');
  const [sendingVolunteerOtp, setSendingVolunteerOtp] = useState(false);
  const [verifyingVolunteerOtp, setVerifyingVolunteerOtp] = useState(false);

  // Member OTP Timer effect
  useEffect(() => {
    let interval: any;
    if (memberOtpTimer > 0) {
      interval = setInterval(() => {
        setMemberOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [memberOtpTimer]);

  // Volunteer OTP Timer effect
  useEffect(() => {
    let interval: any;
    if (volunteerOtpTimer > 0) {
      interval = setInterval(() => {
        setVolunteerOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [volunteerOtpTimer]);

  // Reset Member verification if mobile changes
  useEffect(() => {
    setIsMemberOtpVerified(false);
    setShowMemberOtpField(false);
    setMemberSentOtp(null);
    setMemberOtpCode('');
  }, [memberForm.mobile]);

  // Reset Volunteer verification if mobile changes
  useEffect(() => {
    setIsVolunteerOtpVerified(false);
    setShowVolunteerOtpField(false);
    setVolunteerSentOtp(null);
    setVolunteerOtpCode('');
  }, [volunteerForm.mobile]);

  const handleSendMemberOTP = async () => {
    if (!/^[0-9]{10}$/.test(memberForm.mobile)) {
      setMemberErrors((prev) => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number' }));
      return;
    }
    setSendingMemberOtp(true);
    setMemberOtpError('');
    try {
      const code = await otpGateway.sendOTP(memberForm.mobile);
      setMemberSentOtp(code);
      setShowMemberOtpField(true);
      setMemberOtpTimer(30);
    } catch (err) {
      setMemberOtpError('Failed to send OTP. Try again.');
    } finally {
      setSendingMemberOtp(false);
    }
  };

  const handleVerifyMemberOTP = async () => {
    if (!memberOtpCode || memberOtpCode.length !== 4) {
      setMemberOtpError('Enter a valid 4-digit code');
      return;
    }
    setVerifyingMemberOtp(true);
    setMemberOtpError('');
    try {
      const isCorrect = await otpGateway.verifyOTP(memberForm.mobile, memberOtpCode, memberSentOtp || '');
      if (isCorrect) {
        setIsMemberOtpVerified(true);
        setShowMemberOtpField(false);
      } else {
        setMemberOtpError('Incorrect OTP. Try again.');
      }
    } catch (err) {
      setMemberOtpError('Verification failed.');
    } finally {
      setVerifyingMemberOtp(false);
    }
  };

  const handleSendVolunteerOTP = async () => {
    if (!/^[0-9]{10}$/.test(volunteerForm.mobile)) {
      setVolunteerErrors((prev) => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number' }));
      return;
    }
    setSendingVolunteerOtp(true);
    setVolunteerOtpError('');
    try {
      const code = await otpGateway.sendOTP(volunteerForm.mobile);
      setVolunteerSentOtp(code);
      setShowVolunteerOtpField(true);
      setVolunteerOtpTimer(30);
    } catch (err) {
      setVolunteerOtpError('Failed to send OTP. Try again.');
    } finally {
      setSendingVolunteerOtp(false);
    }
  };

  const handleVerifyVolunteerOTP = async () => {
    if (!volunteerOtpCode || volunteerOtpCode.length !== 4) {
      setVolunteerOtpError('Enter a valid 4-digit code');
      return;
    }
    setVerifyingVolunteerOtp(true);
    setVolunteerOtpError('');
    try {
      const isCorrect = await otpGateway.verifyOTP(volunteerForm.mobile, volunteerOtpCode, volunteerSentOtp || '');
      if (isCorrect) {
        setIsVolunteerOtpVerified(true);
        setShowVolunteerOtpField(false);
      } else {
        setVolunteerOtpError('Incorrect OTP. Try again.');
      }
    } catch (err) {
      setVolunteerOtpError('Verification failed.');
    } finally {
      setVerifyingVolunteerOtp(false);
    }
  };

  // Load drafts on mount
  useEffect(() => {
    try {
      const savedMember = localStorage.getItem('jankam_draft_member');
      if (savedMember) setMemberForm(JSON.parse(savedMember));

      const savedVolunteer = localStorage.getItem('jankam_draft_volunteer');
      if (savedVolunteer) setVolunteerForm(JSON.parse(savedVolunteer));
    } catch (e) {
      console.warn('Failed to load JoinJanKam drafts', e);
    }
  }, []);

  // Save drafts on changes
  useEffect(() => {
    if (memberForm !== EMPTY_MEMBER && !memberSubmitted) {
      localStorage.setItem('jankam_draft_member', JSON.stringify(memberForm));
    }
  }, [memberForm, memberSubmitted]);

  useEffect(() => {
    if (volunteerForm !== EMPTY_VOLUNTEER && !volunteerSubmitted) {
      localStorage.setItem('jankam_draft_volunteer', JSON.stringify(volunteerForm));
    }
  }, [volunteerForm, volunteerSubmitted]);

  // Helper bindings for Member Form
  const setMember = (k: keyof MemberFormState) => (v: string) => {
    setMemberForm(prev => ({ ...prev, [k]: v }));
    if (memberErrors[k]) setMemberErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleMemberHomeStateChange = (stateVal: string) => {
    setMemberForm(prev => ({ ...prev, homeState: stateVal, homeDistrict: '' }));
    if (memberErrors.homeState) setMemberErrors(prev => ({ ...prev, homeState: undefined }));
  };

  const handleMemberWorkStateChange = (stateVal: string) => {
    setMemberForm(prev => ({ ...prev, workState: stateVal, workDistrict: '' }));
    if (memberErrors.workState) setMemberErrors(prev => ({ ...prev, workState: undefined }));
  };

  // Helper bindings for Volunteer Form
  const setVolunteer = (k: keyof VolunteerFormState) => (v: string) => {
    setVolunteerForm(prev => ({ ...prev, [k]: v }));
    if (volunteerErrors[k]) setVolunteerErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleVolunteerStateChange = (stateVal: string) => {
    setVolunteerForm(prev => ({ ...prev, state: stateVal, district: '' }));
    if (volunteerErrors.state) setVolunteerErrors(prev => ({ ...prev, state: undefined }));
  };

  const toggleSkill = (skill: string) => {
    setVolunteerForm(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  // Validations
  const validateMember = (f: MemberFormState): MemberErrors => {
    const e: MemberErrors = {};
    if (!f.name.trim() || f.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^[0-9]{10}$/.test(f.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address';
    if (!f.gender) e.gender = 'Select gender';
    
    const parsedAge = parseInt(f.age);
    if (!f.age || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      e.age = 'Enter valid age (18 - 100)';
    }
    if (!f.homeState) e.homeState = 'Select home state';
    if (!f.homeDistrict) e.homeDistrict = 'Select home district';
    if (!f.workState) e.workState = 'Select current work state';
    if (!f.workDistrict) e.workDistrict = 'Select current work district';
    if (!f.industryType) e.industryType = 'Select industry type';
    if (!f.workerType) e.workerType = 'Select worker type';
    if (!f.educationLevel) e.educationLevel = 'Select education level';
    if (!f.preferredLanguage) e.preferredLanguage = 'Select preferred language';
    if (!f.companyName.trim()) e.companyName = 'Enter company / employer name';
    if (!f.occupation.trim()) e.occupation = 'Enter your occupation';
    
    const parsedExp = parseInt(f.experience);
    if (!f.experience || isNaN(parsedExp) || parsedExp < 0 || parsedExp > 60) {
      e.experience = 'Enter experience years (0 - 60)';
    }
    if (f.emergencyMobile && !/^[0-9]{10}$/.test(f.emergencyMobile)) {
      e.emergencyMobile = 'Enter a valid 10-digit mobile';
    }
    return e;
  };

  const validateVolunteer = (f: VolunteerFormState): VolunteerErrors => {
    const e: VolunteerErrors = {};
    if (!f.name.trim() || f.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^[0-9]{10}$/.test(f.mobile)) e.mobile = 'Enter valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter valid email address';
    if (!f.state) e.state = 'Select state';
    if (!f.district) e.district = 'Select district';
    if (!f.industryType) e.industryType = 'Select industry sector';
    if (!f.workerType) e.workerType = 'Select worker type';
    if (!f.educationLevel) e.educationLevel = 'Select education level';
    if (!f.preferredLanguage) e.preferredLanguage = 'Select language preference';
    if (f.skills.length === 0) e.skills = 'Select at least one skill';
    if (f.emergencyMobile && !/^[0-9]{10}$/.test(f.emergencyMobile)) {
      e.emergencyMobile = 'Enter a valid 10-digit mobile';
    }
    return e;
  };

  // Handlers
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validateMember(memberForm);
    if (Object.keys(errs).length) {
      setMemberErrors(errs);
      setTimeout(() => {
        const firstKey = Object.keys(errs)[0];
        const el = document.getElementById(`join-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      const result = await membersService.join({
        name: memberForm.name.trim(),
        mobile: memberForm.mobile.trim(),
        email: memberForm.email.trim(),
        gender: memberForm.gender,
        age: parseInt(memberForm.age),
        homeState: memberForm.homeState,
        homeDistrict: memberForm.homeDistrict,
        workState: memberForm.workState,
        workDistrict: memberForm.workDistrict,
        industryType: memberForm.industryType,
        workerType: memberForm.workerType,
        educationLevel: memberForm.educationLevel,
        preferredLanguage: memberForm.preferredLanguage,
        companyName: memberForm.companyName.trim(),
        occupation: memberForm.occupation.trim(),
        experience: memberForm.experience.trim(),
        emergencyName: memberForm.emergencyName.trim() || undefined,
        emergencyMobile: memberForm.emergencyMobile.trim() || undefined,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });

      if (memberForm.preferredLanguage && memberForm.preferredLanguage !== 'Auto Detect') {
        const code = memberForm.preferredLanguage === 'Hindi' ? 'hi' : memberForm.preferredLanguage === 'Marathi' ? 'mr' : 'en';
        localStorage.setItem('jankam_session_lang', code);
      }

      // Clear draft on successful submit
      localStorage.removeItem('jankam_draft_member');

      // Record QR Campaign conversion if scanned
      qrAnalyticsService.recordMemberConversion();

      setSubmitting(false);
      setMemberSubmitted(result);
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch (err: any) {
      console.error('[SUBMIT MEMBER ERROR]', err);
      setSubmitError(err.message || 'Failed to submit member registration.');
      setSubmitting(false);
      setMemberSubmitted(null);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validateVolunteer(volunteerForm);
    if (Object.keys(errs).length) {
      setVolunteerErrors(errs);
      setTimeout(() => {
        const firstKey = Object.keys(errs)[0];
        const el = document.getElementById(`vol-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      const result = await leadershipService.apply({
        name: volunteerForm.name.trim(),
        mobile: volunteerForm.mobile.trim(),
        email: volunteerForm.email.trim(),
        state: volunteerForm.state,
        district: volunteerForm.district,
        industryType: volunteerForm.industryType,
        workerType: volunteerForm.workerType,
        educationLevel: volunteerForm.educationLevel,
        preferredLanguage: volunteerForm.preferredLanguage,
        skills: volunteerForm.skills,
        emergencyName: volunteerForm.emergencyName.trim() || undefined,
        emergencyMobile: volunteerForm.emergencyMobile.trim() || undefined,
        status: 'active',
      });

      if (volunteerForm.preferredLanguage && volunteerForm.preferredLanguage !== 'Auto Detect') {
        const code = volunteerForm.preferredLanguage === 'Hindi' ? 'hi' : volunteerForm.preferredLanguage === 'Marathi' ? 'mr' : 'en';
        localStorage.setItem('jankam_session_lang', code);
      }

      // Clear draft on successful submit
      localStorage.removeItem('jankam_draft_volunteer');

      // Record QR Campaign conversion if scanned
      qrAnalyticsService.recordVolunteerConversion();

      setSubmitting(false);
      setVolunteerSubmitted(result);
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch (err: any) {
      console.error('[SUBMIT VOLUNTEER ERROR]', err);
      setSubmitError(err.message || 'Failed to submit volunteer registration.');
      setSubmitting(false);
      setVolunteerSubmitted(null);
    }
  };

  const resetMember = () => {
    localStorage.removeItem('jankam_draft_member');
    setMemberSubmitted(null);
    setMemberForm(EMPTY_MEMBER);
    setMemberErrors({});
  };

  const resetVolunteer = () => {
    localStorage.removeItem('jankam_draft_volunteer');
    setVolunteerSubmitted(null);
    setVolunteerForm(EMPTY_VOLUNTEER);
    setVolunteerErrors({});
  };

  // PDFs Downloads
  const downloadMemberPDF = (m: any) => {
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups to print member card.'); return; }
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>JanKam Membership Card — ${m.id}</title>
<style>
  body { font-family: sans-serif; background: #fff; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; }
  .card { border: 2.5px solid #0A1931; border-radius: 16px; overflow: hidden; }
  .header { background: #0A1931; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-weight: 900; font-size: 1.4rem; color: #F5A623; }
  .tagline { font-size: 0.65rem; color: rgba(255,255,255,0.6); }
  .body { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { border: 1px solid #eee; border-radius: 8px; padding: 8px 10px; }
  .label { font-size: 0.6rem; color: #999; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
  .val { font-size: 0.85rem; font-weight: 600; color: #111; }
  .id-box { grid-column: span 2; text-align: center; background: #fffbeb; border: 1.5px solid #fde68a; padding: 12px; border-radius: 8px; margin-bottom: 6px; }
  .id-txt { font-size: 1.6rem; font-weight: 900; color: #0A1931; letter-spacing: 2px; }
  .footer { background: #071529; color: rgba(255,255,255,0.5); font-size: 0.65rem; padding: 10px 20px; text-align: center; }
</style>
</head><body onload="window.print()">
<div class="card">
  <div class="header">
    <div><div class="logo">JanKam</div><div class="tagline">Union Membership Card</div></div>
    <div style="font-weight:700; font-size:0.75rem; color:#F5A623;">✓ ACTIVE MEMBER</div>
  </div>
  <div class="body">
    <div class="id-box">
      <div class="label">Universal Membership ID</div>
      <div class="id-txt">${m.id}</div>
    </div>
    <div class="field"><div class="label">Full Name</div><div class="val">${m.name}</div></div>
    <div class="field"><div class="label">Mobile</div><div class="val">${m.mobile}</div></div>
    <div class="field"><div class="label">Age / Gender</div><div class="val">${m.age} / ${m.gender}</div></div>
    <div class="field"><div class="label">Preferred Language</div><div class="val">${m.preferredLanguage}</div></div>
    <div class="field"><div class="label">Work District</div><div class="val">${m.workDistrict}, ${m.workState}</div></div>
    <div class="field"><div class="label">Employer Name</div><div class="val">${m.companyName}</div></div>
    <div class="field"><div class="label">Occupation</div><div class="val">${m.occupation}</div></div>
    <div class="field"><div class="label">Experience (Years)</div><div class="val">${m.experience} Years</div></div>
    <div class="field" style="grid-column: span 2; display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border-color: #bbf7d0;">
      <div>
        <div class="label" style="color: #15803d; margin: 0 0 2px;">Verified Member Credentials</div>
        <div class="val" style="font-size: 0.72rem; color: #166534; font-weight: 500; line-height: 1.3;">Scan QR code to securely audit universal union status.</div>
      </div>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&ecc=H&data=${encodeURIComponent(window.location.origin + '?verify-member=' + m.id)}" style="width: 70px; height: 70px; margin-left: 10px;" />
    </div>
  </div>
  <div class="footer">
    JanKam Labour Rights Desk | 📞 1800-123-4567 | help@jankam.org
  </div>
</div>
</body></html>`);
    win.document.close();
  };

  const downloadVolunteerPDF = (v: any) => {
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups to print volunteer card.'); return; }
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>JanKam Volunteer Registration — ${v.id}</title>
<style>
  body { font-family: sans-serif; background: #fff; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; }
  .card { border: 2.5px solid #0A1931; border-radius: 16px; overflow: hidden; }
  .header { background: #0A1931; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-weight: 900; font-size: 1.4rem; color: #F5A623; }
  .tagline { font-size: 0.65rem; color: rgba(255,255,255,0.6); }
  .body { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { border: 1px solid #eee; border-radius: 8px; padding: 8px 10px; }
  .label { font-size: 0.6rem; color: #999; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
  .val { font-size: 0.85rem; font-weight: 600; color: #111; }
  .id-box { grid-column: span 2; text-align: center; background: #fffbeb; border: 1.5px solid #fde68a; padding: 12px; border-radius: 8px; margin-bottom: 6px; }
  .id-txt { font-size: 1.6rem; font-weight: 900; color: #0A1931; letter-spacing: 2px; }
  .skills-box { grid-column: span 2; border: 1px solid #eee; border-radius: 8px; padding: 8px 10px; }
  .footer { background: #071529; color: rgba(255,255,255,0.5); font-size: 0.65rem; padding: 10px 20px; text-align: center; }
</style>
</head><body onload="window.print()">
<div class="card">
  <div class="header">
    <div><div class="logo">JanKam</div><div class="tagline">Official Volunteer Registration</div></div>
    <div style="font-weight:700; font-size:0.75rem; color:#F5A623;">✓ REGISTERED VOLUNTEER</div>
  </div>
  <div class="body">
    <div class="id-box">
      <div class="label">Volunteer Registration ID</div>
      <div class="id-txt">${v.id}</div>
    </div>
    <div class="field"><div class="label">Full Name</div><div class="val">${v.name}</div></div>
    <div class="field"><div class="label">Mobile</div><div class="val">${v.mobile}</div></div>
    <div class="field"><div class="label">Email</div><div class="val">${v.email}</div></div>
    <div class="field"><div class="label">Language Preference</div><div class="val">${v.preferredLanguage}</div></div>
    <div class="field"><div class="label">Operations District</div><div class="val">${v.district}, ${v.state}</div></div>
    <div class="field"><div class="label">Education Level</div><div class="val">${v.educationLevel}</div></div>
    <div class="skills-box">
      <div class="label">Skills & Contributions</div>
      <div class="val" style="margin-top: 4px;">${v.skills.join(', ')}</div>
    </div>
  </div>
  <div class="footer">
    JanKam Labour Welfare Network | 📞 1800-123-4567 | help@jankam.org
  </div>
</div>
</body></html>`);
    win.document.close();
  };

  const inputStyle = (hasErr?: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    background: hasErr ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${hasErr ? 'rgba(248,113,113,0.45)' : 'rgba(255,255,255,0.1)'}`,
    color: 'white',
    fontSize: '0.92rem',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
  });

  return (
    <section id="join" className="section-pad" style={{ background: '#0A1931' }}>
      <div className="max-w-7xl mx-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Left — Info */}
          <div>
            <div className="section-label">Join JanKam</div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                marginTop: '10px',
                marginBottom: '16px',
              }}
            >
              Join Us & Build Our{' '}
              <span className="text-gradient-gold">Collective Strength</span>
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                marginBottom: '32px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Becoming a union member or active volunteer is 100% free. Join JanKam to secure direct legal support, regular rights counseling, case tracking, and a community of workers standing together across Maharashtra.
            </p>

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(245,166,35,0.1)',
                        border: '1px solid rgba(245,166,35,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: '#F5A623' }} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {b.text.includes('8,432+') 
                        ? `Join ${liveWorkerCount.toLocaleString('en-IN')} workers standing united` 
                        : b.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp Community banner */}
            <div
              style={{
                marginTop: '32px',
                padding: '20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(10, 25, 49, 0.4) 100%)',
                border: '1.5px solid rgba(37, 211, 102, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onClick={() => window.open(settings.social.whatsAppCommunityUrl || 'https://chat.whatsapp.com/IBR4USUYbfdDsXeqnbvpWm?s=cl&p=a&mlu=2', '_blank')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(37, 211, 102, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.8rem',
                }}
              >
                💬
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '4px',
                    margin: 0,
                  }}
                >
                  Join Maharashtra State Labour Union Community
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Stand together with thousands of active union workers. Click to join our official WhatsApp group instantly.
                </p>
              </div>
              <ArrowRight size={18} style={{ color: '#25D366' }} />
            </div>
          </div>

          {/* Right — Form or Success */}
          <div>
            {activeTab === 'member' && memberSubmitted ? (
              /* ── Member Success Card ── */
              <div
                style={{
                  background: 'rgba(52,211,153,0.05)',
                  border: '1.5px solid rgba(52,211,153,0.25)',
                  borderRadius: '20px',
                  padding: '36px 28px',
                  textAlign: 'center',
                  animation: 'scaleIn 0.35s ease-out',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(52,211,153,0.12)',
                    border: '2px solid rgba(52,211,153,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <CheckCircle size={32} style={{ color: '#34D399' }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  Welcome to JanKam!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}>
                  You have successfully joined JanKam's active worker community. Your digital membership card is generated.
                </p>
                
                <div
                  style={{
                    background: 'rgba(245,166,35,0.08)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Universal Member ID
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: '#F5A623', fontWeight: 700, letterSpacing: '2px', marginBottom: '12px' }}>
                    {memberSubmitted.id}
                  </div>
                  
                  {/* Verified QR code onscreen */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.62rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✓ Verified Union Member Card
                    </span>
                    <div style={{ background: 'white', padding: '6px', borderRadius: '8px', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&ecc=H&data=${encodeURIComponent(
                          `${window.location.origin}?verify-member=${memberSubmitted.id}`
                        )}`}
                        alt="Member Verification QR"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => downloadMemberPDF(memberSubmitted)}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <Download size={14} /> Download Card
                    </button>
                    <button
                      onClick={() => downloadMemberPDF(memberSubmitted)}
                      className="btn-outline"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <Printer size={14} /> Print Card
                    </button>
                  </div>
                  <button
                    onClick={resetMember}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <PlusCircle size={14} />
                    Start New Submission
                  </button>
                </div>
              </div>
            ) : activeTab === 'volunteer' && volunteerSubmitted ? (
              /* ── Volunteer Success Card ── */
              <div
                style={{
                  background: 'rgba(52,211,153,0.05)',
                  border: '1.5px solid rgba(52,211,153,0.25)',
                  borderRadius: '20px',
                  padding: '36px 28px',
                  textAlign: 'center',
                  animation: 'scaleIn 0.35s ease-out',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(52,211,153,0.12)',
                    border: '2px solid rgba(52,211,153,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <Award size={32} style={{ color: '#34D399' }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  Volunteer Registered!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}>
                  Thank you for joining our movement. Your volunteer operational file is active. Our Coordinator will call you in 48 hours.
                </p>

                <div
                  style={{
                    background: 'rgba(245,166,35,0.08)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Volunteer Registry ID
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: '#F5A623', fontWeight: 700, letterSpacing: '2px' }}>
                    {volunteerSubmitted.id}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => downloadVolunteerPDF(volunteerSubmitted)}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <Download size={14} /> Download Receipt
                    </button>
                    <button
                      onClick={() => downloadVolunteerPDF(volunteerSubmitted)}
                      className="btn-outline"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <Printer size={14} /> Print Receipt
                    </button>
                  </div>
                  <button
                    onClick={resetVolunteer}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <PlusCircle size={14} />
                    Start New Submission
                  </button>
                </div>
              </div>
            ) : (
              /* ── Form Card ── */
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: 'clamp(20px, 5vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Tab Switcher */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '8px',
                }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('member'); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: activeTab === 'member' ? '#F5A623' : 'transparent',
                      color: activeTab === 'member' ? '#0A1931' : 'rgba(255,255,255,0.6)',
                      fontFamily: 'Outfit, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    👤 Join Union
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('volunteer'); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: activeTab === 'volunteer' ? '#F5A623' : 'transparent',
                      color: activeTab === 'volunteer' ? '#0A1931' : 'rgba(255,255,255,0.6)',
                      fontFamily: 'Outfit, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    🤝 Be a Volunteer
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(245,166,35,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {activeTab === 'member' ? <Users size={20} style={{ color: '#F5A623' }} /> : <Heart size={20} style={{ color: '#F5A623' }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                      {activeTab === 'member' ? 'Membership Registration' : 'Volunteer Registration'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                      100% Free · Census Grade Location Tracker
                    </div>
                  </div>
                </div>

                {activeTab === 'member' && (
                  <form onSubmit={handleMemberSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.keys(memberErrors).length > 0 && (
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
                        <span>⚠ Please complete {Object.keys(memberErrors).length} required fields before submitting.</span>
                      </div>
                    )}
                    {submitError && activeTab === 'member' && (
                      <div
                        style={{
                          padding: '14px 18px',
                          background: 'rgba(248,113,113,0.15)',
                          border: '1.5px solid rgba(248,113,113,0.45)',
                          borderRadius: '12px',
                          color: '#F87171',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          fontFamily: 'Inter, sans-serif',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          marginBottom: '10px',
                          animation: 'fadeIn 0.2s ease-out'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚫</span>
                        <span>Registration Failed: {submitError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        id="join-name"
                        label="Full Name"
                        value={memberForm.name}
                        onChange={setMember('name')}
                        placeholder=" Rajesh Kumar"
                        error={memberErrors.name}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <TextField
                          id="join-mobile"
                          label="Mobile Number"
                          value={memberForm.mobile}
                          onChange={setMember('mobile')}
                          placeholder="10-digit mobile number"
                          error={memberErrors.mobile}
                          type="tel"
                          inputMode="numeric"
                        />
                        
                        {/* OTP Trigger & Indicator */}
                        {/^[0-9]{10}$/.test(memberForm.mobile) && (
                          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            {isMemberOtpVerified ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                                <span style={{ background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  ✓ Mobile Verified
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendMemberOTP}
                                disabled={sendingMemberOtp || memberOtpTimer > 0}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(245,166,35,0.1)',
                                  border: '1.5px solid rgba(245,166,35,0.3)',
                                  color: '#F5A623',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: sendingMemberOtp ? 'wait' : 'pointer',
                                  fontFamily: 'Outfit, sans-serif',
                                  outline: 'none',
                                  borderStyle: 'solid',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; }}
                              >
                                {sendingMemberOtp ? 'Sending...' : memberOtpTimer > 0 ? `Resend in ${memberOtpTimer}s` : 'Send Verification OTP'}
                              </button>
                            )}
                          </div>
                        )}

                        {/* OTP Code Entry Panel */}
                        {showMemberOtpField && !isMemberOtpVerified && (
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
                              <label htmlFor="join-otp-code" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                                Enter 4-Digit OTP *
                              </label>
                              {memberOtpTimer > 0 ? (
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                                  Resend in {memberOtpTimer}s
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendMemberOTP}
                                  style={{ background: 'none', border: 'none', color: '#F5A623', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                                >
                                  Resend OTP
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                id="join-otp-code"
                                type="text"
                                maxLength={4}
                                inputMode="numeric"
                                placeholder="e.g. 4982"
                                value={memberOtpCode}
                                onChange={(e) => setMemberOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
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
                                onClick={handleVerifyMemberOTP}
                                disabled={verifyingMemberOtp || memberOtpCode.length !== 4}
                                style={{
                                  padding: '10px 18px',
                                  borderRadius: '8px',
                                  background: '#F5A623',
                                  color: '#0A1931',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  cursor: verifyingMemberOtp || memberOtpCode.length !== 4 ? 'not-allowed' : 'pointer',
                                  opacity: verifyingMemberOtp || memberOtpCode.length !== 4 ? 0.6 : 1,
                                  outline: 'none',
                                  border: 'none',
                                }}
                              >
                                {verifyingMemberOtp ? 'Verifying...' : 'Verify'}
                              </button>
                            </div>
                            {memberOtpError && (
                              <p style={{ fontSize: '0.75rem', color: '#F87171', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                                ⚠ {memberOtpError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <TextField
                        id="join-email"
                        label="Email Address"
                        value={memberForm.email}
                        onChange={setMember('email')}
                        placeholder="name@example.com"
                        error={memberErrors.email}
                        type="email"
                      />
                      <SearchableSelect
                        id="join-gender"
                        label="Gender"
                        value={memberForm.gender}
                        onChange={setMember('gender')}
                        options={GENDERS.map(g => ({ value: g, label: g }))}
                        placeholder="Gender"
                        error={memberErrors.gender}
                      />
                      <TextField
                        id="join-age"
                        label="Age"
                        value={memberForm.age}
                        onChange={setMember('age')}
                        placeholder="Age"
                        error={memberErrors.age}
                        type="number"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SearchableSelect
                        id="join-preferredLanguage"
                        label="Preferred Language"
                        value={memberForm.preferredLanguage}
                        onChange={setMember('preferredLanguage')}
                        options={LANGUAGES.map(l => ({ value: l, label: l }))}
                        placeholder="Select language"
                        error={memberErrors.preferredLanguage}
                      />
                      <SearchableSelect
                        id="join-educationLevel"
                        label="Education Level"
                        value={memberForm.educationLevel}
                        onChange={setMember('educationLevel')}
                        options={EDUCATION_LEVELS.map(e => ({ value: e, label: e }))}
                        placeholder="Select education level"
                        error={memberErrors.educationLevel}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <SearchableSelect
                        id="join-homeState"
                        label="Home State"
                        value={memberForm.homeState}
                        onChange={handleMemberHomeStateChange}
                        options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                        placeholder="Home State"
                        error={memberErrors.homeState}
                      />
                      <SearchableSelect
                        id="join-homeDistrict"
                        label="Home District"
                        value={memberForm.homeDistrict}
                        onChange={setMember('homeDistrict')}
                        options={(STATE_DISTRICTS[memberForm.homeState] || ['Other']).map(d => ({ value: d, label: d }))}
                        placeholder="Home District"
                        error={memberErrors.homeDistrict}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SearchableSelect
                        id="join-workState"
                        label="Current Work State"
                        value={memberForm.workState}
                        onChange={handleMemberWorkStateChange}
                        options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                        placeholder="Work State"
                        error={memberErrors.workState}
                      />
                      <SearchableSelect
                        id="join-workDistrict"
                        label="Current Work District"
                        value={memberForm.workDistrict}
                        onChange={setMember('workDistrict')}
                        options={(STATE_DISTRICTS[memberForm.workState] || ['Other']).map(d => ({ value: d, label: d }))}
                        placeholder="Work District"
                        error={memberErrors.workDistrict}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <TextField
                        id="join-companyName"
                        label="Company / Employer Name"
                        value={memberForm.companyName}
                        onChange={setMember('companyName')}
                        placeholder="Company name"
                        error={memberErrors.companyName}
                      />
                      <SearchableSelect
                        id="join-industryType"
                        label="Industry Type"
                        value={memberForm.industryType}
                        onChange={setMember('industryType')}
                        options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                        placeholder="Select industry"
                        error={memberErrors.industryType}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SearchableSelect
                        id="join-workerType"
                        label="Worker Type"
                        value={memberForm.workerType}
                        onChange={setMember('workerType')}
                        options={WORKER_TYPES.map(w => ({ value: w, label: w }))}
                        placeholder="Worker type"
                        error={memberErrors.workerType}
                      />
                      <TextField
                        id="join-occupation"
                        label="Occupation"
                        value={memberForm.occupation}
                        onChange={setMember('occupation')}
                        placeholder="e.g. Fitter"
                        error={memberErrors.occupation}
                      />
                      <TextField
                        id="join-experience"
                        label="Experience (Years)"
                        value={memberForm.experience}
                        onChange={setMember('experience')}
                        placeholder="e.g. 5"
                        error={memberErrors.experience}
                        type="number"
                        inputMode="numeric"
                      />
                    </div>

                    {/* Emergency Contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <TextField
                        id="join-emergencyName"
                        label="Emergency Contact Name (Opt)"
                        value={memberForm.emergencyName}
                        onChange={setMember('emergencyName')}
                        placeholder="Contact person's name"
                        error={memberErrors.emergencyName}
                        required={false}
                      />
                      <TextField
                        id="join-emergencyMobile"
                        label="Emergency Contact Mobile (Opt)"
                        value={memberForm.emergencyMobile}
                        onChange={setMember('emergencyMobile')}
                        placeholder="10-digit mobile number"
                        error={memberErrors.emergencyMobile}
                        required={false}
                        type="tel"
                        inputMode="numeric"
                      />
                    </div>

                    {/* Sandbox OTP warning */}
                    {!isMemberOtpVerified && (
                      <div style={{ fontSize: '0.8rem', color: '#F5A623', marginBottom: '8px', textAlign: 'center', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                        ⚠️ Sandbox Mode: Mobile OTP verification is recommended, but bypass is active for testing.
                      </div>
                    )}

                    <button
                      id="join-submit"
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{
                        fontSize: '1rem',
                        padding: '14px',
                        justifyContent: 'center',
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? 'wait' : 'pointer',
                        marginTop: '6px',
                      }}
                    >
                      {submitting ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '18px', height: '18px', border: '2px solid rgba(10,25,49,0.3)', borderTopColor: '#0A1931', borderRadius: '50%' }} />
                          Joining Union...
                        </>
                      ) : (
                        <>
                          <Users size={17} />
                          Join JanKam Union — 100% Free
                        </>
                      )}
                    </button>
                  </form>
                )}

                {activeTab === 'volunteer' && (
                  <form onSubmit={handleVolunteerSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.keys(volunteerErrors).length > 0 && (
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
                        <span>⚠ Please complete {Object.keys(volunteerErrors).length} required fields before submitting.</span>
                      </div>
                    )}
                    {submitError && activeTab === 'volunteer' && (
                      <div
                        style={{
                          padding: '14px 18px',
                          background: 'rgba(248,113,113,0.15)',
                          border: '1.5px solid rgba(248,113,113,0.45)',
                          borderRadius: '12px',
                          color: '#F87171',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          fontFamily: 'Inter, sans-serif',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          marginBottom: '10px',
                          animation: 'fadeIn 0.2s ease-out'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚫</span>
                        <span>Registration Failed: {submitError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        id="vol-name"
                        label="Full Name"
                        value={volunteerForm.name}
                        onChange={setVolunteer('name')}
                        placeholder="e.g. Rahul S."
                        error={volunteerErrors.name}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <TextField
                          id="vol-mobile"
                          label="Mobile Number"
                          value={volunteerForm.mobile}
                          onChange={setVolunteer('mobile')}
                          placeholder="10-digit mobile number"
                          error={volunteerErrors.mobile}
                          type="tel"
                          inputMode="numeric"
                        />
                        
                        {/* OTP Trigger & Indicator */}
                        {/^[0-9]{10}$/.test(volunteerForm.mobile) && (
                          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            {isVolunteerOtpVerified ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                                <span style={{ background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  ✓ Mobile Verified
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendVolunteerOTP}
                                disabled={sendingVolunteerOtp || volunteerOtpTimer > 0}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(245,166,35,0.1)',
                                  border: '1.5px solid rgba(245,166,35,0.3)',
                                  color: '#F5A623',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: sendingVolunteerOtp ? 'wait' : 'pointer',
                                  fontFamily: 'Outfit, sans-serif',
                                  outline: 'none',
                                  borderStyle: 'solid',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; }}
                              >
                                {sendingVolunteerOtp ? 'Sending...' : volunteerOtpTimer > 0 ? `Resend in ${volunteerOtpTimer}s` : 'Send Verification OTP'}
                              </button>
                            )}
                          </div>
                        )}

                        {/* OTP Code Entry Panel */}
                        {showVolunteerOtpField && !isVolunteerOtpVerified && (
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
                              <label htmlFor="vol-otp-code" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                                Enter 4-Digit OTP *
                              </label>
                              {volunteerOtpTimer > 0 ? (
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                                  Resend in {volunteerOtpTimer}s
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendVolunteerOTP}
                                  style={{ background: 'none', border: 'none', color: '#F5A623', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                                >
                                  Resend OTP
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                id="vol-otp-code"
                                type="text"
                                maxLength={4}
                                inputMode="numeric"
                                placeholder="e.g. 4982"
                                value={volunteerOtpCode}
                                onChange={(e) => setVolunteerOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
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
                                onClick={handleVerifyVolunteerOTP}
                                disabled={verifyingVolunteerOtp || volunteerOtpCode.length !== 4}
                                style={{
                                  padding: '10px 18px',
                                  borderRadius: '8px',
                                  background: '#F5A623',
                                  color: '#0A1931',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  cursor: verifyingVolunteerOtp || volunteerOtpCode.length !== 4 ? 'not-allowed' : 'pointer',
                                  opacity: verifyingVolunteerOtp || volunteerOtpCode.length !== 4 ? 0.6 : 1,
                                  outline: 'none',
                                  border: 'none',
                                }}
                              >
                                {verifyingVolunteerOtp ? 'Verifying...' : 'Verify'}
                              </button>
                            </div>
                            {volunteerOtpError && (
                              <p style={{ fontSize: '0.75rem', color: '#F87171', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                                ⚠ {volunteerOtpError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        id="vol-email"
                        label="Email Address"
                        value={volunteerForm.email}
                        onChange={setVolunteer('email')}
                        placeholder="name@example.com"
                        error={volunteerErrors.email}
                        type="email"
                      />
                      <SearchableSelect
                        id="vol-preferredLanguage"
                        label="Preferred Language"
                        value={volunteerForm.preferredLanguage}
                        onChange={setVolunteer('preferredLanguage')}
                        options={LANGUAGES.map(l => ({ value: l, label: l }))}
                        placeholder="Select language"
                        error={volunteerErrors.preferredLanguage}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <SearchableSelect
                        id="vol-state"
                        label="State of Operations"
                        value={volunteerForm.state}
                        onChange={handleVolunteerStateChange}
                        options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                        placeholder="Select state"
                        error={volunteerErrors.state}
                      />
                      <SearchableSelect
                        id="vol-district"
                        label="District of Operations"
                        value={volunteerForm.district}
                        onChange={setVolunteer('district')}
                        options={(STATE_DISTRICTS[volunteerForm.state] || ['Other']).map(d => ({ value: d, label: d }))}
                        placeholder="Select district"
                        error={volunteerErrors.district}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <SearchableSelect
                        id="vol-industryType"
                        label="Industry Sector"
                        value={volunteerForm.industryType}
                        onChange={setVolunteer('industryType')}
                        options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                        placeholder="Select industry"
                        error={volunteerErrors.industryType}
                      />
                      <SearchableSelect
                        id="vol-workerType"
                        label="Worker Type"
                        value={volunteerForm.workerType}
                        onChange={setVolunteer('workerType')}
                        options={WORKER_TYPES.map(w => ({ value: w, label: w }))}
                        placeholder="Worker type"
                        error={volunteerErrors.workerType}
                      />
                      <SearchableSelect
                        id="vol-educationLevel"
                        label="Education Level"
                        value={volunteerForm.educationLevel}
                        onChange={setVolunteer('educationLevel')}
                        options={EDUCATION_LEVELS.map(e => ({ value: e, label: e }))}
                        placeholder="Select education level"
                        error={volunteerErrors.educationLevel}
                      />
                    </div>

                    {/* Skills Select (Pill Grid) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif' }}>
                        Volunteer Contributions / Skills <span style={{ color: '#F87171' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
                        {VOLUNTEER_SKILLS.map(skill => {
                          const active = volunteerForm.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                fontFamily: 'Outfit, sans-serif',
                                cursor: 'pointer',
                                border: `1.5px solid ${active ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                                background: active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.03)',
                                color: active ? '#F5A623' : 'rgba(255,255,255,0.6)',
                                transition: 'all 0.15s',
                              }}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                      {volunteerErrors.skills && <p style={{ fontSize: '0.75rem', color: '#F87171' }}>{volunteerErrors.skills}</p>}
                    </div>

                    {/* Emergency Contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <TextField
                        id="vol-emergencyName"
                        label="Emergency Contact Name (Opt)"
                        value={volunteerForm.emergencyName}
                        onChange={setVolunteer('emergencyName')}
                        placeholder="Contact person's name"
                        error={volunteerErrors.emergencyName}
                        required={false}
                      />
                      <TextField
                        id="vol-emergencyMobile"
                        label="Emergency Contact Mobile (Opt)"
                        value={volunteerForm.emergencyMobile}
                        onChange={setVolunteer('emergencyMobile')}
                        placeholder="10-digit mobile number"
                        error={volunteerErrors.emergencyMobile}
                        required={false}
                        type="tel"
                        inputMode="numeric"
                      />
                    </div>

                    {/* Sandbox OTP warning */}
                    {!isVolunteerOtpVerified && (
                      <div style={{ fontSize: '0.8rem', color: '#F5A623', marginBottom: '8px', textAlign: 'center', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                        ⚠️ Sandbox Mode: Mobile OTP verification is recommended, but bypass is active for testing.
                      </div>
                    )}

                    <button
                      id="vol-submit"
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{
                        fontSize: '1rem',
                        padding: '14px',
                        justifyContent: 'center',
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? 'wait' : 'pointer',
                        marginTop: '6px',
                      }}
                    >
                      {submitting ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '18px', height: '18px', border: '2px solid rgba(10,25,49,0.3)', borderTopColor: '#0A1931', borderRadius: '50%' }} />
                          Registering Volunteer...
                        </>
                      ) : (
                        <>
                          <Users size={17} />
                          Register as Active Volunteer
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                  🔒 Secure local database storage. Data remains entirely confidential.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
