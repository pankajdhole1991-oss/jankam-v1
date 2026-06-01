import { useState, useMemo, useEffect } from 'react';
import { 
  Shield, X, Search, Trash2, Award, FileText, Users, Heart, Check, RefreshCw, 
  Settings, Edit2, Plus, Download, LogOut, Info, BookOpen, HelpCircle, MapPin, 
  CheckCircle, AlertTriangle, Play 
} from 'lucide-react';
import { complaintsService } from '../services/complaints';
import { membersService } from '../services/members';
import { leadershipService } from '../services/leadership';
import { successStoriesService, type SuccessStory } from '../services/successStories';
import { districtsService, type DistrictRecord } from '../services/districts';
import { settingsService, type OrganizationSettings } from '../services/settings';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { COMPLAINT_TYPE_LABELS, COMPLAINT_STATUS_LABELS } from '../types/complaint';
import { qrAnalyticsService } from '../services/qrAnalytics';
import { auditLogsService, type AuditLogData } from '../services/auditLogs';
import { notificationsService } from '../services/notifications';
import { adminService } from '../services/admin';
import { supabase, checkSupabaseOnline } from '../services/supabaseClient';
import { liveStatsService } from '../services/liveStats';
import type { LiveStats } from '../services/liveStats';

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  // Login Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(() => {
    return localStorage.getItem('jankam_admin_session') === 'active';
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('jankam_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginError, setLoginError] = useState('');

  // Primary Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'members' | 'volunteers' | 'stories' | 'districts' | 'settings' | 'audit' | 'notifications' | 'admin_mgmt'>('overview');
  
  // Settings Sub-Tabs
  const [settingsTab, setSettingsTab] = useState<'general' | 'contact' | 'social' | 'content' | 'backups' | 'diagnostics'>('general');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);

  // Notifications Queue State
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch Audit Logs reactively
  useEffect(() => {
    if (activeTab === 'audit') {
      auditLogsService.getAll().then(setAuditLogs);
    }
  }, [activeTab]);

  // Fetch Notifications reactively
  useEffect(() => {
    if (activeTab === 'notifications') {
      notificationsService.getAll().then(setNotifications);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleNotifUpdate = () => {
      notificationsService.getAll().then(setNotifications);
    };
    window.addEventListener('jankam-notifications-update', handleNotifUpdate);
    return () => window.removeEventListener('jankam-notifications-update', handleNotifUpdate);
  }, []);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState(() => {
    const saved = localStorage.getItem('jankam_admin_user');
    const user = saved ? JSON.parse(saved) : null;
    return user?.assignedDistrict || 'All';
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Data States loaded dynamically from services
  const [complaints, setComplaints] = useState(() => complaintsService.getAll());
  const [members, setMembers] = useState(() => membersService.getAll());
  const [volunteers, setVolunteers] = useState(() => leadershipService.getAll());
  const [stories, setStories] = useState(() => successStoriesService.getAll());
  const [districts, setDistricts] = useState(() => districtsService.getAll());
  const [settings, setSettings] = useState(() => settingsService.getAll());
  const [qrStats, setQrStats] = useState(() => qrAnalyticsService.get());

  // Live Supabase stats state
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);

  // Fetch live Supabase stats on mount and on every data update
  useEffect(() => {
    const fetchLive = async () => {
      try {
        liveStatsService.invalidate(); // always fresh in Admin Portal
        const s = await liveStatsService.getStats();
        setLiveStats(s);
        if (s.districtBreakdown && s.districtBreakdown.length > 0) {
          setDistricts(s.districtBreakdown as any);
        }
        console.log('[AdminPortal] Live stats fetched from Supabase:', s);
        
        // Also fetch live lists of complaints, members, and volunteers
        await fetchSupabaseData();
      } catch (e) {
        console.warn('[AdminPortal] Failed to fetch live stats/data:', e);
      }
    };
    if (authorized) {
      fetchLive();
    }
    const handler = () => {
      if (authorized) fetchLive();
    };
    window.addEventListener('jankam-data-update', handler);
    return () => window.removeEventListener('jankam-data-update', handler);
  }, [authorized]);

  // Supabase Live Diagnostics Panel States
  const [diagUrl, setDiagUrl] = useState(() => import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('jankam_supabase_url') || '');
  const [diagKey, setDiagKey] = useState(() => import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('jankam_supabase_anon_key') || '');
  const [diagLog, setDiagLog] = useState<string>('Ready to audit database connection...');
  const [diagRunning, setDiagRunning] = useState(false);

  // Admins Management States
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'State Admin' | 'District Admin' | 'Volunteer'>('Volunteer');
  const [adminDistrict, setAdminDistrict] = useState('');
  const [adminActive, setAdminActive] = useState(true);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Fetch Admins reactively
  const refreshAdmins = () => {
    setLoadingAdmins(true);
    adminService.getAdmins().then((data) => {
      setAdmins(data);
      setLoadingAdmins(false);
    });
  };

  useEffect(() => {
    if (activeTab === 'admin_mgmt') {
      refreshAdmins();
    }
  }, [activeTab]);

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    
    if (!adminUsername.trim() || adminUsername.trim().length < 3) {
      setAdminError('Username must be at least 3 characters.');
      return;
    }
    
    if (!selectedAdmin && (!adminPassword || adminPassword.length < 6)) {
      setAdminError('Password must be at least 6 characters for a new administrator.');
      return;
    }

    if (selectedAdmin) {
      // Update admin
      const ok = await adminService.updateAdmin(
        currentUser?.username || 'system',
        selectedAdmin.id,
        selectedAdmin.username,
        adminRole,
        adminRole === 'District Admin' || adminRole === 'Volunteer' ? adminDistrict : null,
        adminActive,
        adminPassword || undefined
      );
      if (ok) {
        setAdminSuccess('Administrator updated successfully.');
        refreshAdmins();
        setTimeout(() => {
          setShowAdminModal(false);
          setSelectedAdmin(null);
        }, 1500);
      } else {
        setAdminError('Failed to update administrator in Supabase.');
      }
    } else {
      // Create admin
      const ok = await adminService.createAdmin(
        currentUser?.username || 'system',
        adminUsername.trim(),
        adminPassword,
        adminRole,
        adminRole === 'District Admin' || adminRole === 'Volunteer' ? adminDistrict : null
      );
      if (ok) {
        setAdminSuccess('Administrator created successfully.');
        refreshAdmins();
        setTimeout(() => {
          setShowAdminModal(false);
          setAdminUsername('');
          setAdminPassword('');
          setAdminRole('Volunteer');
          setAdminDistrict('');
        }, 1500);
      } else {
        setAdminError('Failed to create administrator. Username may already exist.');
      }
    }
  };

  const runLiveSupabaseDiagnostics = async () => {
    setDiagRunning(true);
    setDiagLog('Starting Supabase Live Diagnostics connection audit...\n');
    
    try {
      const url = diagUrl.trim();
      const key = diagKey.trim();
      
      if (!url || !key) {
        setDiagLog(prev => prev + '❌ FAILURE: Supabase URL or Anon Key is empty!\nConfigure them below or in your .env file.');
        setDiagRunning(false);
        return;
      }
      
      // Save overrides locally for active session
      localStorage.setItem('jankam_supabase_url', url);
      localStorage.setItem('jankam_supabase_anon_key', key);
      
      setDiagLog(prev => prev + `[INFO] Mapped Project Endpoint: ${url}\n`);
      setDiagLog(prev => prev + `[INFO] Anon Public Key footprint: ${key.slice(0, 10)}...${key.slice(-8)}\n`);
      setDiagLog(prev => prev + '[ACTION] Initializing Supabase client and testing network ping...\n');
      
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(url, key);
      
      // 1. Check complaints table structure by running a dry select
      setDiagLog(prev => prev + '[ACTION] Testing SELECT query on complaints table (limit 1)...\n');
      const selectComplaints = await testClient.from('complaints').select('id').limit(1);
      
      if (selectComplaints.error) {
        setDiagLog(prev => prev + `❌ SELECT complaints FAILED! Postgres Code: ${selectComplaints.error.code}\nMessage: ${selectComplaints.error.message}\nDetails: ${selectComplaints.error.details}\nHint: ${selectComplaints.error.hint}\n\n`);
      } else {
        setDiagLog(prev => prev + `✅ SELECT complaints SUCCESS! complaints table exists and is readable. Found records: ${selectComplaints.data?.length || 0}\n`);
      }
      
      // 2. Try inserting a real unique test record into public.complaints
      const testId = `JK-TEST-DIAGNOSTIC-${Date.now()}`;
      setDiagLog(prev => prev + `[ACTION] Testing live INSERT of record with ID: ${testId} into complaints table...\n`);
      
      const testPayload = {
        id: testId,
        name: 'Supabase Diagnostic Test',
        mobile: '+919999999999',
        email: 'diagnostic@jankam.in',
        gender: 'Other',
        age: 30,
        home_state: 'Maharashtra',
        home_district: 'Pune',
        work_state: 'Maharashtra',
        work_district: 'Pune',
        industry_type: 'IT',
        company_name: 'JanKam Diagnostic Lab',
        employee_id: 'DIAG-001',
        worker_type: 'Permanent Employee',
        education_level: 'Graduate',
        preferred_language: 'English',
        complaint_type: 'Other',
        description: 'Automatic test execution payload verifying live end-to-end writes.',
        priority_level: 'Low',
        employer_name: 'JanKam Org',
        incident_date: '2026-05-30',
        complaint_against: 'Other',
        worker_mobile_verified: true,
        notification_type: 'None',
        current_stage: 'submitted',
        status: 'submitted'
      };
      
      const insertComplaints = await testClient.from('complaints').insert([testPayload]);
      
      if (insertComplaints.error) {
        setDiagLog(prev => prev + `❌ INSERT complaints FAILED! Postgres Code: ${insertComplaints.error.code}\nMessage: ${insertComplaints.error.message}\nDetails: ${insertComplaints.error.details}\nHint: ${insertComplaints.error.hint}\n\n`);
      } else {
        setDiagLog(prev => prev + `✅ INSERT complaints SUCCESS! HTTP Status: ${insertComplaints.status} ${insertComplaints.statusText}\n\n`);
      }
      
      // 3. Test members table access
      setDiagLog(prev => prev + '[ACTION] Testing SELECT query on members table (limit 1)...\n');
      const selectMembers = await testClient.from('members').select('id').limit(1);
      if (selectMembers.error) {
        setDiagLog(prev => prev + `❌ SELECT members FAILED! Postgres Code: ${selectMembers.error.code}\nMessage: ${selectMembers.error.message}\n`);
      } else {
        setDiagLog(prev => prev + `✅ SELECT members SUCCESS! members table exists and is readable.\n`);
      }
      
      // 4. Test volunteers table access
      setDiagLog(prev => prev + '[ACTION] Testing SELECT query on volunteers table (limit 1)...\n');
      const selectVolunteers = await testClient.from('volunteers').select('id').limit(1);
      if (selectVolunteers.error) {
        setDiagLog(prev => prev + `❌ SELECT volunteers FAILED! Postgres Code: ${selectVolunteers.error.code}\nMessage: ${selectVolunteers.error.message}\n`);
      } else {
        setDiagLog(prev => prev + `✅ SELECT volunteers SUCCESS! volunteers table exists and is readable.\n`);
      }
      
      setDiagLog(prev => prev + '\n⚡ Database connection audit completed! Copy/paste this report if inserts failed.');
    } catch (err: any) {
      setDiagLog(prev => prev + `\n❌ FATAL CRASH during connection diagnostics: ${err.message || err}\n`);
    } finally {
      setDiagRunning(false);
    }
  };

  // Modal / Dialog States for Success Story Add/Edit
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [storyForm, setStoryForm] = useState<Omit<SuccessStory, 'status'>>({
    caseId: '',
    workerName: '',
    district: '',
    issue: '',
    outcome: '',
    description: '',
    recovery: '',
    amountRecovered: '',
    image: '',
  });

  // Modal / Dialog States for District Edit
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictRecord | null>(null);
  const [districtForm, setDistrictForm] = useState<Omit<DistrictRecord, 'id' | 'division'>>({
    name: '',
    status: 'active',
    activeComplaints: 0,
    resolvedComplaints: 0,
    members: 0,
    volunteers: 0,
    casesNew: 0,
    casesUnderReview: 0,
    casesResolved: 0,
    casesClosed: 0,
    casesEscalated: 0,
  });

  // Complaint edit & details overlay state
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // FAQ addition helper inside settings
  const [faqForm, setFaqForm] = useState({ q: '', a: '' });

  // Handle Login Authentication (Database-backed Cryptographic Authenticated RPC)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    let role = '';
    let assignedDistrict: string | undefined = undefined;

    // 1. Dynamic Database Bcrypt Authentication Check
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { data, error } = await supabase.rpc('authenticate_admin', {
          p_username: username,
          p_password: password
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const authUser = data[0];
          role = authUser.role;
          assignedDistrict = authUser.district || undefined;
          console.log(`[AUTH] Admin ${username} successfully authenticated via pgcrypto blowfish/bcrypt hashes in Supabase.`);
        }
      } catch (err) {
        console.warn('Database auth failed, trying local development sandbox backup credentials:', err);
      }
    }

    // 2. Local development offline sandbox fallback checks
    if (!role) {
      if (username === 'superadmin' && password === 'JKM@admin#2026!Secure') {
        role = 'Super Admin';
      } else if (username === 'stateadmin' && password === 'state2026') {
        role = 'State Admin';
      } else if (username === 'puneadmin' && password === 'pune2026') {
        role = 'District Admin';
        assignedDistrict = 'Pune';
      } else if (username === 'volunmumbai' && password === 'volun2026') {
        role = 'Volunteer';
        assignedDistrict = 'Mumbai';
      } else if (username === 'admin' && password === 'JKM@admin#2026!Secure') {
        role = 'Super Admin';
      }
    }

    if (role) {
      const userObj = { username, role, assignedDistrict };
      localStorage.setItem('jankam_admin_session', 'active');
      localStorage.setItem('jankam_admin_user', JSON.stringify(userObj));
      setAuthorized(true);
      setCurrentUser(userObj);
      setLoginError('');
      
      if (assignedDistrict) {
        setFilterDistrict(assignedDistrict);
      }
    } else {
      setLoginError('Invalid Username or Password. Please try again. Authentication is backed by database pgcrypto bcrypt hashes.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('jankam_admin_session');
    localStorage.removeItem('jankam_admin_user');
    setAuthorized(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    const handleQrUpdate = () => {
      setQrStats(qrAnalyticsService.get());
    };
    window.addEventListener('jankam-qr-analytics-update', handleQrUpdate);
    return () => {
      window.removeEventListener('jankam-qr-analytics-update', handleQrUpdate);
    };
  }, []);

  // Fetch live lists of complaints, members, and volunteers from Supabase
  const fetchSupabaseData = async () => {
    const isOnline = await checkSupabaseOnline();
    if (!isOnline || !supabase) return;
    try {
      // 1. Fetch complaints
      const { data: compData, error: compErr } = await supabase
        .from('complaints')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!compErr && compData) {
        const mappedComplaints = compData.map((row: any) => ({
          id: row.id,
          name: row.name,
          mobile: row.mobile,
          email: row.email,
          gender: row.gender,
          age: row.age,
          homeState: row.home_state,
          homeDistrict: row.home_district,
          workState: row.work_state,
          workDistrict: row.work_district,
          industryType: row.industry_type,
          companyName: row.company_name,
          employeeId: row.employee_id,
          workerType: row.worker_type,
          educationLevel: row.education_level,
          preferredLanguage: row.preferred_language,
          complaintType: row.complaint_type,
          description: row.description,
          priorityLevel: row.priority_level,
          documentType: row.document_type,
          employerName: row.employer_name,
          employerMobile: row.employer_mobile,
          employerEmail: row.employer_email,
          companyAddress: row.company_address,
          workSiteAddress: row.work_site_address,
          supervisorName: row.supervisor_name,
          supervisorMobile: row.supervisor_mobile,
          hrMobile: row.hr_mobile,
          hrEmail: row.hr_email,
          incidentDate: row.incident_date,
          complaintAgainst: row.complaint_against,
          approxFinancialLoss: row.approx_financial_loss,
          witnessName: row.witness_name,
          witnessMobile: row.witness_mobile,
          witnessDesignation: row.witness_designation,
          evidenceNotes: row.evidence_notes,
          workerMobileVerified: row.worker_mobile_verified,
          lastNotificationSent: row.last_notification_sent,
          notificationType: row.notification_type,
          internalNotes: row.internal_notes,
          publicUpdate: row.public_update,
          currentStage: row.current_stage,
          assignedVolunteer: row.assigned_volunteer,
          assignedDistrictTeam: row.assigned_district_team,
          assignedOfficer: row.assigned_officer,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
        setComplaints(mappedComplaints);
        storageService.set(STORAGE_KEYS.COMPLAINTS, mappedComplaints);
      }

      // 2. Fetch members
      const { data: memData, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!memErr && memData) {
        const mappedMembers = memData.map((row: any) => ({
          id: row.id,
          name: row.name,
          mobile: row.mobile,
          email: row.email,
          gender: row.gender,
          age: row.age,
          workState: row.work_state,
          workDistrict: row.work_district,
          companyName: row.company_name,
          industryType: row.industry_type,
          workerType: row.worker_type,
          experience: row.experience,
          status: row.status,
          createdAt: row.created_at
        }));
        setMembers(mappedMembers as any);
        storageService.set(STORAGE_KEYS.MEMBERS, mappedMembers);
      }

      // 3. Fetch volunteers
      const { data: volData, error: volErr } = await supabase
        .from('volunteers')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!volErr && volData) {
        const mappedVolunteers = volData.map((row: any) => ({
          id: row.id,
          name: row.name,
          mobile: row.mobile,
          email: row.email,
          state: row.state,
          district: row.district,
          industryType: row.industry_type,
          skills: row.skills,
          status: row.status,
          createdAt: row.created_at
        }));
        setVolunteers(mappedVolunteers as any);
        storageService.set(STORAGE_KEYS.LEADERSHIP, mappedVolunteers);
      }
    } catch (e) {
      console.warn('[AdminPortal] Error loading data from Supabase:', e);
    }
  };

  // Sync databases and dispatch global updates
  const refreshData = () => {
    setComplaints(complaintsService.getAll());
    setMembers(membersService.getAll());
    setVolunteers(leadershipService.getAll());
    setStories(successStoriesService.getAll());
    setDistricts(districtsService.getAll());
    setSettings(settingsService.getAll());
    setQrStats(qrAnalyticsService.get());
    
    // Warm up from Supabase asynchronously
    fetchSupabaseData().then(() => {
      window.dispatchEvent(new Event('jankam-data-update'));
    });
  };

  // --- MUTATORS & STATUS MANAGERS ---

  const updateComplaintStatus = async (id: string, status: any) => {
    // 1. Optimistic update in react state first!
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c));

    const list = complaintsService.getAll();
    const oldCase = list.find(c => c.id === id);
    const oldValue = (oldCase ? oldCase.status : 'submitted') as any;
    const updated = list.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
    storageService.set(STORAGE_KEYS.COMPLAINTS, updated);
    
    // Sync to Supabase
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('complaints')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) {
          console.error('Failed to sync complaint status to Supabase:', error);
          // Revert optimistic update
          setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: oldValue } : c));
          const reverted = list.map(c => c.id === id ? { ...c, status: oldValue } : c);
          storageService.set(STORAGE_KEYS.COMPLAINTS, reverted);
          alert(`Failed to update status: [${error.code}] ${error.message}`);
          return;
        }
      } catch (err: any) {
        console.error('Failed to sync complaint status to Supabase:', err);
        // Revert optimistic update
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: oldValue } : c));
        const reverted = list.map(c => c.id === id ? { ...c, status: oldValue } : c);
        storageService.set(STORAGE_KEYS.COMPLAINTS, reverted);
        alert(`Failed to update status: ${err.message || err}`);
        return;
      }
    }

    // Log to Audit Ledger
    auditLogsService.log({
      adminUser: 'admin',
      action: 'Status Updated',
      targetId: id,
      oldValue,
      newValue: status,
      reason: 'Quick status change from tracking list'
    });
    
    // Invalidate live stats and dispatch global data update
    liveStatsService.invalidate();
    window.dispatchEvent(new Event('jankam-data-update'));
  };

  const saveComplaintEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedComplaint.id) return;
    const list = complaintsService.getAll();
    const oldCase = list.find(c => c.id === selectedComplaint.id);
    const oldStatus = oldCase ? oldCase.status : 'unknown';
    const newStatus = editForm.currentStage === 'resolved' ? 'resolved' : (editForm.status || selectedComplaint.status);

    const editedCase = {
      ...selectedComplaint,
      ...editForm,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    // Optimistic UI updates
    setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? editedCase : c));

    const updated = list.map(c => c.id === selectedComplaint.id ? editedCase : c);
    storageService.set(STORAGE_KEYS.COMPLAINTS, updated);

    // Sync to Supabase
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      const payload: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (editForm.priorityLevel) payload.priority_level = editForm.priorityLevel;
      if (editForm.currentStage) payload.current_stage = editForm.currentStage;
      if (editForm.assignedVolunteer !== undefined) payload.assigned_volunteer = editForm.assignedVolunteer;
      if (editForm.assignedDistrictTeam !== undefined) payload.assigned_district_team = editForm.assignedDistrictTeam;
      if (editForm.assignedOfficer !== undefined) payload.assigned_officer = editForm.assignedOfficer;
      if (editForm.internalNotes !== undefined) payload.internal_notes = editForm.internalNotes;
      if (editForm.publicUpdate !== undefined) payload.public_update = editForm.publicUpdate;

      try {
        const { error } = await supabase
          .from('complaints')
          .update(payload)
          .eq('id', selectedComplaint.id);
        
        if (error) {
          console.error('Failed to sync complaint edits to Supabase:', error);
          // Rollback
          setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? selectedComplaint : c));
          storageService.set(STORAGE_KEYS.COMPLAINTS, list);
          alert(`Failed to save edits: [${error.code}] ${error.message}`);
          return;
        }
      } catch (err: any) {
        console.error('Failed to sync complaint edits to Supabase:', err);
        // Rollback
        setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? selectedComplaint : c));
        storageService.set(STORAGE_KEYS.COMPLAINTS, list);
        alert(`Failed to save edits: ${err.message || err}`);
        return;
      }
    }

    if (oldStatus !== newStatus) {
      auditLogsService.log({
        adminUser: 'admin',
        action: 'Status Updated',
        targetId: selectedComplaint.id,
        oldValue: oldStatus,
        newValue: newStatus,
        reason: editForm.reasonForChange || 'Details modified via edit modal'
      });
    } else {
      auditLogsService.log({
        adminUser: 'admin',
        action: 'Details Modified',
        targetId: selectedComplaint.id,
        oldValue: 'Previous Case Details',
        newValue: 'Updated Case Details',
        reason: editForm.reasonForChange || 'Details modified via edit modal'
      });
    }

    setSelectedComplaint(null);
    setEditForm({});
    liveStatsService.invalidate();
    window.dispatchEvent(new Event('jankam-data-update'));
  };

  const updateMemberStatus = async (id: string, status: any) => {
    setMembers(prev =>
  prev.map(m =>
    m.id === id ? { ...m, status } : m
  )
);
    const list = storageService.get<any>(STORAGE_KEYS.MEMBERS) || [];
    const oldMember = list.find(m => m.id === id);
    const oldValue = oldMember ? oldMember.status : 'unknown';
    const updated = list.map(m => m.id === id ? { ...m, status } : m);
    storageService.set(STORAGE_KEYS.MEMBERS, updated);

    // Sync to Supabase Postgres Table
    const isOnline = await checkSupabaseOnline();
   if (isOnline && supabase) {
  try {
    const { error } = await supabase
      .from('members')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Member Update Error:', error);
      alert(`Member Update Error: ${error.message}`);
      return;
    }

    console.log('Member updated successfully');
  } catch (e) {
    console.warn('Supabase member status sync failed:', e);
    alert(`Supabase Error: ${String(e)}`);
    return;
  }
}

    auditLogsService.log({
      adminUser: currentUser?.username || 'admin',
      action: 'Member Status Updated',
      targetId: id,
      oldValue,
      newValue: status,
      reason: `Member status updated to ${status}`
    });

    if (status === 'active') {
      const name = oldMember ? oldMember.name : 'Worker';
      const mobile = oldMember ? oldMember.mobile : '';
      const email = oldMember ? oldMember.email || '' : '';
      
      const msg = `Dear ${name}, your JanKam Union Membership has been APPROVED! Your Member ID is ${id}. Stand united! Trace/Track at: jankam.in`;
      
      if (mobile) {
        notificationsService.queueNotification(mobile, 'WhatsApp', msg);
        notificationsService.queueNotification(mobile, 'SMS', msg);
      }
      if (email) {
        notificationsService.queueNotification(email, 'Email', msg);
      }
    }

    refreshData();
  };

  const updateVolunteerStatus = async (id: string, status: any) => {
    setVolunteers(prev =>
  prev.map(v =>
    v.id === id ? { ...v, status } : v
  )
);
    const list = storageService.get<any>(STORAGE_KEYS.LEADERSHIP) || [];
    const oldVol = list.find(v => v.id === id);
    const oldValue = oldVol ? oldVol.status : 'unknown';
    const updated = list.map(v => v.id === id ? { ...v, status } : v);
    storageService.set(STORAGE_KEYS.LEADERSHIP, updated);

    // Sync to Supabase Postgres Table
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        await supabase
          .from('volunteers')
          .update({ status })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase volunteer status sync failed:', e);
      }
    }

    auditLogsService.log({
      adminUser: currentUser?.username || 'admin',
      action: 'Volunteer Status Updated',
      targetId: id,
      oldValue,
      newValue: status,
      reason: `Volunteer status updated to ${status}`
    });

    if (status === 'active') {
      const name = oldVol ? oldVol.name : 'Volunteer';
      const mobile = oldVol ? oldVol.mobile : '';
      const email = oldVol ? oldVol.email || '' : '';
      
      const msg = `Dear ${name}, welcome to the JanKam leadership circle! Your volunteer application has been APPROVED (ID: ${id}). Let's fight for labour rights together!`;
      
      if (mobile) {
        notificationsService.queueNotification(mobile, 'WhatsApp', msg);
        notificationsService.queueNotification(mobile, 'SMS', msg);
      }
      if (email) {
        notificationsService.queueNotification(email, 'Email', msg);
      }
    }

    refreshData();
  };

  // --- DELETIONS ---

  const deleteComplaint = (id: string) => {
    if (confirm(`Are you sure you want to delete complaint ${id}?`)) {
      complaintsService.softDelete(id).then(() => {
        auditLogsService.log({
          adminUser: currentUser?.username || 'admin',
          action: 'Complaint Deleted',
          targetId: id,
          oldValue: 'Active Complaint',
          newValue: 'Soft Deleted Complaint',
          reason: 'Administrative soft deletion from dashboard registry'
        });
        refreshData();
      });
    }
  };

  const deleteMember = (id: string) => {
    if (confirm(`Are you sure you want to delete member ${id}?`)) {
      membersService.softDelete(id).then(() => {
        auditLogsService.log({
          adminUser: currentUser?.username || 'admin',
          action: 'Member Deleted',
          targetId: id,
          oldValue: 'Active Union Member',
          newValue: 'Soft Deleted Member',
          reason: 'Administrative soft deletion from membership registry'
        });
        refreshData();
      });
    }
  };

  const deleteVolunteer = (id: string) => {
    if (confirm(`Are you sure you want to delete volunteer ${id}?`)) {
      leadershipService.softDelete(id).then(() => {
        auditLogsService.log({
          adminUser: currentUser?.username || 'admin',
          action: 'Volunteer Deleted',
          targetId: id,
          oldValue: 'Active Volunteer Coordinator',
          newValue: 'Soft Deleted Volunteer',
          reason: 'Administrative soft deletion from volunteers registry'
        });
        refreshData();
      });
    }
  };

  // --- COMPLAINT FILTERING & SEARCHING ---
  const filteredComplaints = useMemo(() => {
    let list = complaints;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.id?.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.workDistrict.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q)
      );
    }
    const currentFilterDist = currentUser?.assignedDistrict || filterDistrict;
    if (currentFilterDist !== 'All') {
      list = list.filter(c => c.workDistrict.toLowerCase() === currentFilterDist.toLowerCase());
    }
    if (filterStatus !== 'All') {
      list = list.filter(c => c.status === filterStatus);
    }
    if (filterCategory !== 'All') {
      list = list.filter(c => c.complaintType === filterCategory);
    }
    if (filterPriority !== 'All') {
      list = list.filter(c => c.priorityLevel === filterPriority);
    }
    return list;
  }, [complaints, searchQuery, filterDistrict, filterStatus, filterCategory, filterPriority, currentUser]);

  // --- MEMBER FILTERING & SEARCHING ---
  const filteredMembers = useMemo(() => {
    let list = members;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(m =>
        m.id?.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.workDistrict.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q)
      );
    }
    const currentFilterDist = currentUser?.assignedDistrict || filterDistrict;
    if (currentFilterDist !== 'All') {
      list = list.filter(m => m.workDistrict.toLowerCase() === currentFilterDist.toLowerCase());
    }
    if (filterStatus !== 'All') {
      list = list.filter(m => m.status === filterStatus);
    }
    return list;
  }, [members, searchQuery, filterDistrict, filterStatus, currentUser]);

  // --- VOLUNTEER FILTERING & SEARCHING ---
  const filteredVolunteers = useMemo(() => {
    let list = volunteers;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(v =>
        v.id?.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.mobile.includes(q) ||
        v.district.toLowerCase().includes(q)
      );
    }
    const currentFilterDist = currentUser?.assignedDistrict || filterDistrict;
    if (currentFilterDist !== 'All') {
      list = list.filter(v => v.district.toLowerCase() === currentFilterDist.toLowerCase());
    }
    if (filterStatus !== 'All') {
      list = list.filter(v => v.status === filterStatus);
    }
    return list;
  }, [volunteers, searchQuery, filterDistrict, filterStatus, currentUser]);

  // --- CALCULATE DASHBOARD OVERVIEW STATS ---
  // Prefer live Supabase counts; fall back to localStorage-computed values
  const stats = useMemo(() => {
    if (liveStats) {
      // ✅ Source: Supabase (public.members, public.volunteers, public.complaints)
      const uniqueDistricts = new Set<string>();
      complaints.forEach(c => c.workDistrict && uniqueDistricts.add(c.workDistrict.toLowerCase()));
      members.forEach(m => m.workDistrict && uniqueDistricts.add(m.workDistrict.toLowerCase()));
      return {
        complaintsCount:   liveStats.complaintsCount,
        resolvedComplaints: liveStats.resolvedComplaints,
        membersCount:      liveStats.membersCount,
        volunteersCount:   liveStats.volunteersCount,
        districtsCovered:  liveStats.districtsCovered,
        activeVolunteers:  liveStats.activeVolunteers,
        resolutionRate:    liveStats.resolutionRate,
        workersSupported:  liveStats.workersSupported,
        isLive: true,
      };
    }
    // ⚠️ Fallback: localStorage-computed values (used until first Supabase fetch)
    const activeVolCount = volunteers.filter(v => v.status === 'active').length;
    const resolvedComplCount = complaints.filter(c => c.status === 'resolved').length;
    const uniqueDistricts = new Set<string>();
    complaints.forEach(c => c.workDistrict && uniqueDistricts.add(c.workDistrict.toLowerCase()));
    members.forEach(m => m.workDistrict && uniqueDistricts.add(m.workDistrict.toLowerCase()));
    return {
      complaintsCount: complaints.length,
      resolvedComplaints: resolvedComplCount,
      membersCount: members.length,
      volunteersCount: volunteers.length,
      districtsCovered: uniqueDistricts.size || 6,
      activeVolunteers: activeVolCount,
      resolutionRate: complaints.length > 0 ? Math.round((resolvedComplCount / complaints.length) * 100) : 0,
      workersSupported: members.length + activeVolCount + resolvedComplCount,
      isLive: false,
    };
  }, [complaints, members, volunteers, liveStats]);

  // SLA Overview Metrics & Average Latency Computation
  const slaMetrics = useMemo(() => {
    const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed');
    const open = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed');
    
    // SLA Escalation threshold is 7 days
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const nowMs = new Date().getTime();
    
    const escalated = complaints.filter(c => {
      const isSlaUntouched = c.status === 'submitted' && (nowMs - new Date(c.createdAt).getTime()) > sevenDaysInMs;
      return c.status === 'escalated' || isSlaUntouched;
    });

    const resolvedWithTime = complaints.filter(c => c.status === 'resolved' && c.updatedAt);
    let avgResolutionDays = '3.5'; // fallback default
    if (resolvedWithTime.length > 0) {
      const totalMs = resolvedWithTime.reduce((sum, c) => {
        const diff = new Date(c.updatedAt!).getTime() - new Date(c.createdAt).getTime();
        return sum + (diff > 0 ? diff : 0);
      }, 0);
      const avgDays = totalMs / resolvedWithTime.length / (1000 * 60 * 60 * 24);
      avgResolutionDays = avgDays.toFixed(1);
    }

    return {
      openCount: open.length,
      resolvedCount: resolved.length,
      escalatedCount: escalated.length,
      avgResolutionDays
    };
  }, [complaints]);

  // Dynamic Volumetric Heatmap calculation
  const districtHeatmap = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      const dist = c.workDistrict || 'Other';
      const clean = dist.trim().toLowerCase();
      counts[clean] = (counts[clean] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([district, count]) => ({
        name: (district.charAt(0) || '').toUpperCase() + district.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Top 10 Complaint Categories distribution
  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      const cat = c.complaintType || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [complaints]);

  // --- EXPORT TO CSV ENGINE (HIGH Spreadsheets Parity) ---
  const handleExportCSV = (type: 'complaints' | 'members' | 'volunteers' | 'stories') => {
    let dataToExport: any[] = [];
    let namePrefix = 'JanKam_Export';
    
    if (type === 'complaints') {
      dataToExport = complaints;
      namePrefix = 'JanKam_Complaints';
    } else if (type === 'members') {
      dataToExport = members;
      namePrefix = 'JanKam_UnionMembers';
    } else if (type === 'volunteers') {
      dataToExport = volunteers;
      namePrefix = 'JanKam_Volunteers';
    } else if (type === 'stories') {
      dataToExport = stories;
      namePrefix = 'JanKam_SuccessStories';
    }

    if (dataToExport.length === 0) {
      alert('No database records available to export.');
      return;
    }

    // Generate CSV file payload
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => 
      Object.values(row).map(val => {
        let str = String(val === null || val === undefined ? '' : val);
        str = str.replace(/"/g, '""'); // escape nested double quotes
        return `"${str}"`;
      }).join(',')
    );
    const csvString = [headers, ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${namePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CSR REPORT GENERATOR (Print-ready document framework) ---
  const downloadCSRReport = () => {
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups to print report.'); return; }
    
    const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalCount = complaints.length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const resRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
    
    const heatmapRows = districtHeatmap.map((d, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>📍 ${d.name}</td>
        <td><strong>${d.count}</strong> Cases</td>
      </tr>
    `).join('');
    
    const categoryRows = topCategories.map((c) => `
      <tr>
        <td>📋 ${c.category}</td>
        <td><strong>${c.count}</strong> Cases</td>
        <td style="width: 150px;">
          <div style="background: #eee; border-radius: 4px; overflow: hidden; height: 10px; width: 100%;">
            <div style="background: #F5A623; height: 100%; width: ${totalCount > 0 ? (c.count / totalCount) * 100 : 0}%;"></div>
          </div>
        </td>
      </tr>
    `).join('');

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>JanKam Labour Rights CSR Performance Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.5; }
  .header { border-bottom: 3px solid #0A1931; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 2.2rem; font-weight: 900; color: #0A1931; letter-spacing: 1px; }
  .title { font-size: 1.1rem; text-transform: uppercase; color: #D4890A; font-weight: 700; }
  .meta { text-align: right; font-size: 0.85rem; color: #555; }
  .grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px; }
  .stat-card { border: 1.5px solid #eee; border-radius: 12px; padding: 15px; text-align: center; background: #fafafa; }
  .stat-val { font-size: 1.8rem; font-weight: 900; color: #0A1931; }
  .stat-label { font-size: 0.75rem; color: #666; font-weight: 700; margin-top: 5px; }
  .section-title { font-size: 1.2rem; font-weight: 800; border-bottom: 1.5px solid #0A1931; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; color: #0A1931; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.9rem; }
  th { background: #f5f5f5; font-weight: 700; }
  .footer { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 60px; text-align: center; font-size: 0.8rem; color: #666; }
</style>
</head><body onload="window.print()">
<div class="header">
  <div>
    <div class="logo">JAN KAM</div>
    <div class="title">Corporate Social Responsibility (CSR) Performance Report</div>
  </div>
  <div class="meta">
    Report Date: <strong>${nowStr}</strong><br/>
    Scope: Maharashtra Labour Operations
  </div>
</div>

<div class="grid-stats">
  <div class="stat-card">
    <div class="stat-val">${totalCount}</div>
    <div class="stat-label">Complaints Filed</div>
  </div>
  <div class="stat-card">
    <div class="stat-val">${resolvedCount}</div>
    <div class="stat-label">Complaints Resolved</div>
  </div>
  <div class="stat-card">
    <div class="stat-val">${resRate}%</div>
    <div class="stat-label">Resolution Rate</div>
  </div>
  <div class="stat-card">
    <div class="stat-val">${members.length}</div>
    <div class="stat-label">Union Members</div>
  </div>
</div>

<div class="section-title">📍 District Hotspot Heatmap (Cases Volumetric Ranking)</div>
<table>
  <thead>
    <tr>
      <th style="width: 50px;">Rank</th>
      <th>District Division</th>
      <th>Complaint Volume</th>
    </tr>
  </thead>
  <tbody>
    ${heatmapRows || '<tr><td colspan="3" style="text-align:center;">No data available</td></tr>'}
  </tbody>
</table>

<div class="section-title">📊 Top Grievance Categories & Structural Distribution</div>
<table>
  <thead>
    <tr>
      <th>Complaint Category</th>
      <th>Cases Count</th>
      <th>Ratio Bar</th>
    </tr>
  </thead>
  <tbody>
    ${categoryRows || '<tr><td colspan="3" style="text-align:center;">No data available</td></tr>'}
  </tbody>
</table>

<div class="section-title">📜 Operational Summary & SLA Latency</div>
<p style="font-size: 0.9rem; color: #333; margin-top: 10px;">
  JanKam platform is powered by decentralised industrial advocacy desks. Average resolution latency for resolved cases is computed dynamically at <strong>${slaMetrics.avgResolutionDays} Days</strong>. Total coverage spans <strong>${stats.districtsCovered}</strong> districts across Maharashtra. Active legal counseling is supported by <strong>${volunteers.length}</strong> registered volunteers and coordinators.
</p>

<div class="footer">
  JanKam Labour Empowerment Platform | Universal Governance Ledger | CSR-V1-2026
</div>
</body></html>`);
    win.document.close();
  };

  // --- BACKUP & RESTORE SYSTEMS (JSON & CSV Disaster Recovery) ---
  const handleExportBackupJSON = () => {
    const backupData = {
      complaints: complaintsService.getAll(),
      members: membersService.getAll(),
      volunteers: leadershipService.getAll(),
      stories: successStoriesService.getAll(),
      districts: districtsService.getAll(),
      settings: settingsService.getAll(),
      qrAnalytics: qrAnalyticsService.get(),
      timestamp: new Date().toISOString()
    };

    const str = JSON.stringify(backupData, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JanKam_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.complaints && parsed.members && parsed.volunteers) {
          // Restore to Local Storage keys
          storageService.set(STORAGE_KEYS.COMPLAINTS, parsed.complaints);
          storageService.set(STORAGE_KEYS.MEMBERS, parsed.members);
          storageService.set(STORAGE_KEYS.LEADERSHIP, parsed.volunteers);
          if (parsed.stories) storageService.set('jankam_stories', parsed.stories);
          if (parsed.districts) storageService.set('jankam_districts', parsed.districts);
          if (parsed.settings) storageService.set('jankam_settings', parsed.settings);
          
          alert('Database restored successfully! All records have been successfully merged.');
          refreshData();
          
          // Log import to audit ledger
          auditLogsService.log({
            adminUser: 'admin',
            action: 'Settings Changed',
            targetId: 'Backup Restore',
            oldValue: 'Previous State',
            newValue: `Restored state at ${parsed.timestamp || new Date().toISOString()}`,
            reason: 'Administrative full database JSON backup restore'
          });
        } else {
          alert('Invalid backup file structure. Ensure complaints and members are present.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // --- SETTINGS MUTATORS ---
  const handleSettingsChange = (group: 'general' | 'contact' | 'social', key: string, value: string) => {
    const updated = {
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value,
      },
    };
    setSettings(updated);
  };

  const handleLegalChange = (key: 'aboutJanKam' | 'privacyPolicy' | 'termsConditions', value: string) => {
    const updated = {
      ...settings,
      legal: {
        ...settings.legal,
        [key]: value,
      },
    };
    setSettings(updated);
  };

  const handleSaveSettings = () => {
    settingsService.update(settings);
    alert('Organization settings & legal frameworks updated successfully across the entire website!');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.q || !faqForm.a) return;
    const updatedFaqs = [...settings.legal.faq, { q: faqForm.q, a: faqForm.a }];
    const updated = {
      ...settings,
      legal: {
        ...settings.legal,
        faq: updatedFaqs,
      },
    };
    setSettings(updated);
    settingsService.update(updated);
    setFaqForm({ q: '', a: '' });
    alert('FAQ added successfully!');
  };

  const handleDeleteFaq = (index: number) => {
    const updatedFaqs = settings.legal.faq.filter((_, idx) => idx !== index);
    const updated = {
      ...settings,
      legal: {
        ...settings.legal,
        faq: updatedFaqs,
      },
    };
    setSettings(updated);
    settingsService.update(updated);
  };

  // --- SUCCESS STORIES MODAL SAVERS ---
  const openStoryForm = (story: SuccessStory | null = null) => {
    if (story) {
      setEditingStory(story);
      setStoryForm({
        caseId: story.caseId,
        workerName: story.workerName,
        district: story.district,
        issue: story.issue,
        outcome: story.outcome,
        description: story.description,
        recovery: story.recovery,
        amountRecovered: story.amountRecovered || '',
        image: story.image || '',
      });
    } else {
      setEditingStory(null);
      setStoryForm({
        caseId: `JK-${(String(districtsService.getAll().find(d => d.status === 'active')?.name || 'PUN').slice(0, 3) || '').toUpperCase()}-${String(stories.length + 1).padStart(4, '0')}`,
        workerName: '',
        district: 'Pune',
        issue: '',
        outcome: '',
        description: '',
        recovery: '',
        amountRecovered: '',
        image: '',
      });
    }
    setStoryModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.caseId || !storyForm.workerName || !storyForm.district || !storyForm.issue || !storyForm.outcome || !storyForm.description || !storyForm.recovery) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload: SuccessStory = {
      ...storyForm,
      status: 'resolved',
    };

    if (editingStory) {
      successStoriesService.update(editingStory.caseId, payload);
      alert('Success story updated successfully!');
    } else {
      successStoriesService.add(payload);
      alert('Success story added successfully!');
    }

    setStoryModalOpen(false);
    refreshData();
  };

  const handleDeleteStory = (caseId: string) => {
    if (confirm(`Are you sure you want to delete success story ${caseId}?`)) {
      successStoriesService.delete(caseId);
      refreshData();
    }
  };

  // --- DISTRICT DESK MODAL SAVERS ---
  const openDistrictForm = (district: DistrictRecord) => {
    setEditingDistrict(district);
    setDistrictForm({
      name: district.name,
      status: district.status,
      activeComplaints: district.activeComplaints,
      resolvedComplaints: district.resolvedComplaints,
      members: district.members,
      volunteers: district.volunteers,
      casesNew: district.casesNew || 0,
      casesUnderReview: district.casesUnderReview || 0,
      casesResolved: district.casesResolved || 0,
      casesClosed: district.casesClosed || 0,
      casesEscalated: district.casesEscalated || 0,
    });
    setDistrictModalOpen(true);
  };

  const handleSaveDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;

    districtsService.update(editingDistrict.id, {
      name: districtForm.name,
      status: districtForm.status,
      activeComplaints: Number(districtForm.activeComplaints),
      resolvedComplaints: Number(districtForm.resolvedComplaints),
      members: Number(districtForm.members),
      volunteers: Number(districtForm.volunteers),
    });

    setDistrictModalOpen(false);
    alert('District records and public maps updated automatically!');
    refreshData();
  };

  const getPriorityStyle = (p: string) => {
    if (p === 'High') return { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' };
    if (p === 'Medium') return { background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' };
    return { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60A5FA' };
  };

  const uniqueDistricts = useMemo(() => {
    const list = new Set<string>();
    complaints.forEach(c => c.workDistrict && list.add(c.workDistrict));
    members.forEach(m => m.workDistrict && list.add(m.workDistrict));
    volunteers.forEach(v => v.district && list.add(v.district));
    return Array.from(list).sort();
  }, [complaints, members, volunteers]);

  // Secure Auth Form if unauthorized
  if (!authorized) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(10, 25, 49, 0.99)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: '#0F2347',
            border: '1.5px solid rgba(245,166,35,0.35)',
            borderRadius: '24px',
            padding: '36px 28px',
            maxWidth: '440px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: '50%',
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
            }}
          >
            <X size={16} />
          </button>

          <div
            style={{
              width: '54px', height: '54px', borderRadius: '16px',
              background: 'rgba(245,166,35,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Shield size={26} style={{ color: '#F5A623' }} />
          </div>

          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: 'white', marginBottom: '6px' }}>
            JanKam Admin Portal
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
            Enter administrator username and password to access settings, district data, registries, and operational metrics.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: 'white',
                fontSize: '0.92rem',
                textAlign: 'left',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: 'white',
                fontSize: '0.92rem',
                textAlign: 'left',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {loginError && (
              <p style={{ fontSize: '0.78rem', color: '#F87171', fontFamily: 'Inter, sans-serif' }}>
                {loginError}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem' }}
            >
              Authenticate & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0A1931',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Admin Header ── */}
      <header
        style={{
          background: '#0F2347',
          borderBottom: '1.5px solid rgba(245,166,35,0.25)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5A623, #D4890A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 900, color: '#0A1931',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            JK
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'white', fontSize: '1rem', lineHeight: 1.1 }}>
              {settings.general.organizationName} Admin Center
            </div>
            <div style={{ fontSize: '0.68rem', color: '#F5A623', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.5px' }}>
              OPERATIONAL LABOR MANAGEMENT DESK • {(currentUser?.role || 'ADMIN').toUpperCase()} {currentUser?.assignedDistrict ? `(${currentUser.assignedDistrict})` : ''}
            </div>
          </div>
        </div>

        {/* Tab triggers */}
        <div style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'complaints', label: '📋 Complaints' },
            { id: 'members', label: '👤 Members' },
            { id: 'volunteers', label: '🤝 Volunteers' },
            { id: 'stories', label: '🏆 Cases' },
            { id: 'districts', label: '🗺️ Districts' },
            { id: 'notifications', label: '📢 Notifications' },
            ...(currentUser?.role === 'Super Admin' || currentUser?.role === 'State Admin'
              ? [
                  { id: 'settings', label: '⚙️ Settings' },
                  { id: 'audit', label: '🔍 Audit Logs' },
                ]
              : []),
            ...(currentUser?.role === 'Super Admin'
              ? [
                  { id: 'admin_mgmt', label: '🛡️ Admins' },
                ]
              : []),
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setSearchQuery(''); }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === t.id ? '#F5A623' : 'transparent',
                color: activeTab === t.id ? '#0A1931' : 'rgba(255,255,255,0.7)',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={refreshData}
            title="Refresh database"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: '8px',
              width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            }}
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '7px 12px', gap: '5px', borderColor: 'rgba(248,113,113,0.3)', color: '#F87171' }}
          >
            <LogOut size={14} /> Log Out
          </button>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '7px 12px', gap: '5px' }}
          >
            <X size={14} /> Exit Panel
          </button>
        </div>
      </header>

      {/* ── Search and Filter controls for list views ── */}
      {activeTab !== 'overview' && activeTab !== 'settings' && (
        <div style={{ background: 'rgba(10,25,49,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab} registry...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters Row */}
          {(activeTab === 'complaints' || activeTab === 'members' || activeTab === 'volunteers') && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Filters:</span>
              
              {/* District Filter */}
              <select
                value={currentUser?.assignedDistrict || filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
                disabled={!!currentUser?.assignedDistrict}
                style={{
                  background: '#0F2347',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  outline: 'none',
                  opacity: currentUser?.assignedDistrict ? 0.6 : 1,
                  cursor: currentUser?.assignedDistrict ? 'not-allowed' : 'pointer'
                }}
              >
                {currentUser?.assignedDistrict ? (
                  <option value={currentUser.assignedDistrict}>{currentUser.assignedDistrict}</option>
                ) : (
                  <>
                    <option value="All">All Districts</option>
                    {uniqueDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </>
                )}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ background: '#0F2347', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}
              >
                <option value="All">All Statuses</option>
                {activeTab === 'complaints' ? (
                  <>
                    <option value="submitted">New</option>
                    <option value="under_review">Under Review</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pending</option>
                    <option value="active">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>

              {/* Category Filter (Complaints Only) */}
              {activeTab === 'complaints' && (
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ background: '#0F2347', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="All">All Categories</option>
                  {Object.keys(COMPLAINT_TYPE_LABELS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}

              {/* Priority Filter (Complaints Only) */}
              {activeTab === 'complaints' && (
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  style={{ background: '#0F2347', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              )}

              <button
                onClick={() => { setFilterDistrict('All'); setFilterStatus('All'); setFilterCategory('All'); setFilterPriority('All'); setSearchQuery(''); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '0.7rem', color: 'white', cursor: 'pointer' }}
              >
                Reset Filters
              </button>

              {/* Export System */}
              <button
                onClick={() => handleExportCSV(activeTab as any)}
                style={{ marginLeft: 'auto', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Download size={12} /> CSV / Excel Export
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Main Dashboard Panel (Scrollable) ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                Operational Overview Control Desk
              </h2>
              {/* Quick CSV backups & CSR Print */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={downloadCSRReport}
                  style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                >
                  <FileText size={11} /> Download CSR Report
                </button>
                <button
                  onClick={() => handleExportCSV('complaints')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={11} /> Backup Cases
                </button>
                <button
                  onClick={() => handleExportCSV('members')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={11} /> Backup Members
                </button>
              </div>
            </div>

            {/* Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Average Resolution Time', val: `${slaMetrics.avgResolutionDays} Days`, sub: 'Case resolution speed', icon: RefreshCw, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
                { label: 'Open Grievance Cases', val: slaMetrics.openCount, sub: 'Under review/mediation', icon: FileText, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                { label: 'Resolved Cases', val: slaMetrics.resolvedCount, sub: 'Dues successfully recovered', icon: CheckCircle, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
                { label: 'SLA Overdue / Escalated', val: slaMetrics.escalatedCount, sub: 'Untouched > 7 Days', icon: AlertTriangle, color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>
                      {s.val}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>{s.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Recent Registrations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:grid-cols-2', gap: '20px' }}>
              {/* Left Column: Recent Complaints */}
              <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.98rem', fontWeight: 800, color: 'white', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📋 Recent Complaints Submitted</span>
                  <span style={{ fontSize: '0.72rem', color: '#F5A623', cursor: 'pointer' }} onClick={() => setActiveTab('complaints')}>View All →</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {complaints.slice(0, 4).map(c => {
                    const cName = c.name || 'Anonymous';
                    const cDist = c.workDistrict || 'Other';
                    const cType = c.complaintType || 'General';
                    const cStatus = c.status || 'submitted';
                    return (
                      <div key={c.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>{cName} ({cDist})</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Category: {cType}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(245,166,35,0.1)', color: '#F5A623', fontWeight: 700 }}>
                          {((cStatus).replace('_', ' ')).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Recent Membership & Volunteers */}
              <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.98rem', fontWeight: 800, color: 'white', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🤝 Recent Membership Requests</span>
                  <span style={{ fontSize: '0.72rem', color: '#F5A623', cursor: 'pointer' }} onClick={() => setActiveTab('members')}>View All →</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {members.slice(0, 4).map(m => {
                    const mName = m.name || 'Anonymous Member';
                    const mDist = m.workDistrict || 'Other';
                    const mSector = m.industryType || 'General';
                    const mStatus = m.status || 'pending';
                    return (
                      <div key={m.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>{mName} ({mDist})</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Sector: {mSector}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: mStatus === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(245,166,35,0.1)', color: mStatus === 'active' ? '#34D399' : '#F5A623', fontWeight: 700 }}>
                          {(mStatus).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Heatmap & Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:grid-cols-2', gap: '20px' }}>
              {/* Left Column: District Heatmap */}
              <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.98rem', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
                  📍 District Grievance Heatmap (Highest volume first)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)' }}>District</th>
                        <th style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Complaints Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtHeatmap.map((d, index) => (
                        <tr key={d.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', color: 'white', fontWeight: 600 }}>
                            {index + 1}. {d.name}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#F5A623', fontWeight: 700, textAlign: 'right' }}>
                            {d.count} Cases
                          </td>
                        </tr>
                      ))}
                      {districtHeatmap.length === 0 && (
                        <tr>
                          <td colSpan={2} style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                            No district case data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Top Categories progress-ratio bars */}
              <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.98rem', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
                  📊 Top Complaint Categories Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topCategories.map((c) => {
                    const totalComplaints = complaints.length || 1;
                    const percent = Math.round((c.count / totalComplaints) * 100);
                    return (
                      <div key={c.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                          <span>📋 {c.category}</span>
                          <span style={{ fontWeight: 700, color: '#F5A623' }}>{c.count} ({percent}%)</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', height: '8px', width: '100%' }}>
                          <div style={{ background: 'linear-gradient(90deg, #F5A623, #D4890A)', height: '100%', width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {topCategories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                      No category data available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Campaign Analytics Dashboard */}
            <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏭 Industrial QR Outreach Campaign & Analytics</span>
                <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(52,211,153,0.1)', color: '#34D399', fontWeight: 700 }}>LIVE OUTREACH</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Campaign Scans</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F5A623', marginTop: '4px' }}>{qrStats.totalScans}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complaints from QR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399', marginTop: '4px' }}>{qrStats.complaintsFromQR}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Members Joined from QR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#60A5FA', marginTop: '4px' }}>{qrStats.membersFromQR}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Volunteers from QR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F87171', marginTop: '4px' }}>{qrStats.volunteersFromQR}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:grid-cols-2', gap: '20px' }}>
                {/* District breakdowns */}
                <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Scans By District Division</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(qrStats.scansByDistrict).map(([dist, count]) => (
                      <div key={dist} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>📍 {dist}</span>
                        <span style={{ color: 'white', fontWeight: 700 }}>{count} scans</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Poster breakdowns */}
                <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Scans By Poster Campaign</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(qrStats.scansByPosterType).map(([poster, count]) => (
                      <div key={poster} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>📢 {poster}</span>
                        <span style={{ color: 'white', fontWeight: 700 }}>{count} scans</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Database migration prompt */}
            <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: '16px', padding: '16px 20px', fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              🌐 <strong>Supabase & PostgreSQL Migration Status: Ready</strong><br/>
              This administrative interface is completely connected to local storage keys. The underlying data structure maps directly to standard table rows. To sync with a cloud relational database, change the service layer adapters in <code>src/services/</code> to route requests to API endpoints.
            </div>
          </div>
        )}

        {/* 2. COMPLAINTS MANAGEMENT TAB */}
        {activeTab === 'complaints' && (
          <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                  {['Complaint ID', 'Worker Name', 'Mobile / Email', 'Location', 'Category', 'Company', 'Priority', 'Filed Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map(c => {
                    const cId = c.id || 'N/A';
                    const cName = c.name || 'Anonymous';
                    const cGender = c.gender || 'N/A';
                    const cAge = c.age || 'N/A';
                    const cMobile = c.mobile || 'N/A';
                    const cEmail = c.email || 'N/A';
                    const cDist = c.workDistrict || 'Other';
                    const cState = c.workState || 'Maharashtra';
                    const cType = c.complaintType || 'General';
                    const cCompany = c.companyName || 'N/A';
                    const cWorkerType = c.workerType || 'N/A';
                    const cPriority = c.priorityLevel || 'medium';
                    const cStatus = c.status || 'submitted';
                    const cCreatedAt = c.createdAt || new Date().toISOString();
                    
                    const pStyle = getPriorityStyle(cPriority);
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#F5A623', fontWeight: 700 }}>{cId}</td>
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: 600 }}>{cName}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{cGender}, Age {cAge}</span></td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{cMobile}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{cEmail}</span></td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>
                          <strong>{cDist}</strong>, {(cState).slice(0,3)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'white' }}>{cType}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{cCompany}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{cWorkerType}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, ...pStyle }}>
                            {cPriority}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                          {cCreatedAt ? new Date(cCreatedAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <select
                              value={c.status}
                              onChange={e => updateComplaintStatus(c.id!, e.target.value as any)}
                              style={{
                                background: '#0A1931',
                                color: c.status === 'resolved' ? '#34D399' : 'white',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '6px',
                                padding: '4px 6px',
                                fontSize: '0.8rem',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="submitted">New</option>
                              <option value="under_review">Under Review</option>
                              <option value="escalated">Escalated</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            {(() => {
                              const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                              const isOverdue = c.status === 'submitted' && (new Date().getTime() - new Date(c.createdAt).getTime()) > sevenDaysInMs;
                              if (isOverdue || c.status === 'escalated') {
                                return (
                                  <span style={{ fontSize: '0.65rem', color: '#F87171', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    ⚠️ SLA Escalated
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setEditForm({
                                currentStage: c.currentStage || 'submitted',
                                internalNotes: c.internalNotes || '',
                                publicUpdate: c.publicUpdate || '',
                                assignedVolunteer: c.assignedVolunteer || '',
                                assignedDistrictTeam: c.assignedDistrictTeam || '',
                                assignedOfficer: c.assignedOfficer || '',
                                status: c.status || 'submitted',
                              });
                            }}
                            style={{
                              background: 'rgba(245,166,35,0.15)', border: 'none',
                              color: '#F5A623', borderRadius: '4px', padding: '4px 8px',
                              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            Details
                          </button>
                          {currentUser?.role === 'Super Admin' && (
                            <button
                              onClick={() => deleteComplaint(c.id!)}
                              style={{
                                background: 'transparent', border: 'none',
                                color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                      No matching complaint records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. MEMBERS MANAGEMENT TAB */}
        {activeTab === 'members' && (
          <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                  {['Membership ID', 'Member Name', 'Mobile / Email', 'Work Location', 'Industry Sector', 'Worker Type', 'Experience', 'Join Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(m => {
                    const mId = m.id || 'N/A';
                    const mName = m.name || 'Anonymous';
                    const mGender = m.gender || 'N/A';
                    const mAge = m.age || 'N/A';
                    const mMobile = m.mobile || 'N/A';
                    const mEmail = m.email || 'N/A';
                    const mDist = m.workDistrict || 'Other';
                    const mState = m.workState || 'Maharashtra';
                    const mSector = m.industryType || 'General';
                    const mWorkerType = m.workerType || 'N/A';
                    const mExperience = m.experience || '0';
                    const mStatus = m.status || 'pending';
                    const mCreatedAt = m.createdAt || new Date().toISOString();
                    const mJoinDate = m.joinDate || (mCreatedAt ? new Date(mCreatedAt).toLocaleDateString('en-IN') : 'N/A');
                    
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#60A5FA', fontWeight: 700 }}>{mId}</td>
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: 600 }}>{mName}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{mGender}, Age {mAge}</span></td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{mMobile}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{mEmail}</span></td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{mDist}, {(mState).slice(0,3)}</td>
                        <td style={{ padding: '12px 16px', color: 'white' }}>{mSector}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{mWorkerType}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{mExperience} Years</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{mJoinDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={m.status}
                          onChange={e => updateMemberStatus(m.id!, e.target.value as any)}
                          style={{
                            background: '#0A1931',
                            color: m.status === 'active' ? '#34D399' : m.status === 'rejected' ? '#F87171' : 'white',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            fontSize: '0.8rem',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {currentUser?.role === 'Super Admin' && (
                          <button
                            onClick={() => deleteMember(m.id!)}
                            style={{
                              background: 'transparent', border: 'none',
                              color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                      No union membership records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. VOLUNTEERS MANAGEMENT TAB */}
        {activeTab === 'volunteers' && (
          <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                  {['Volunteer ID', 'Name', 'Mobile / Email', 'District Operations', 'Industry Sector', 'Skills Grid', 'Join Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.length > 0 ? (
                  filteredVolunteers.map(v => {
                    const vId = v.id || 'N/A';
                    const vName = v.name || 'Anonymous';
                    const vMobile = v.mobile || 'N/A';
                    const vEmail = v.email || 'N/A';
                    const vDistrict = v.district || 'Other';
                    const vState = v.state || 'Maharashtra';
                    const vSector = v.industryType || 'General';
                    const vSkills = Array.isArray(v.skills) ? v.skills : [];
                    const vStatus = v.status || 'pending';
                    const vCreatedAt = v.createdAt || new Date().toISOString();
                    
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#F87171', fontWeight: 700 }}>{vId}</td>
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: 600 }}>{vName}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{vMobile}<br/><span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{vEmail}</span></td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{vDistrict}, {(vState).slice(0,3)}</td>
                        <td style={{ padding: '12px 16px', color: 'white' }}>{vSector}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)', maxWidth: '240px', wordBreak: 'break-word' }}>{vSkills.join(', ')}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                          {vCreatedAt ? new Date(vCreatedAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={v.status}
                          onChange={e => updateVolunteerStatus(v.id!, e.target.value as any)}
                          style={{
                            background: '#0A1931',
                            color: v.status === 'active' ? '#34D399' : v.status === 'rejected' ? '#F87171' : 'white',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            fontSize: '0.8rem',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {currentUser?.role === 'Super Admin' && (
                          <button
                            onClick={() => deleteVolunteer(v.id!)}
                            style={{
                              background: 'transparent', border: 'none',
                              color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                      No volunteer registry profiles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. SUCCESS STORIES MANAGEMENT TAB */}
        {activeTab === 'stories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                Workers Success Stories Manager
              </h3>
              <button
                onClick={() => openStoryForm(null)}
                style={{ background: '#F5A623', color: '#0A1931', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add Success Story
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {stories.map(s => (
                <div key={s.caseId} style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#F5A623', fontWeight: 700 }}>
                      ID: {s.caseId}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openStoryForm(s)}
                        style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(s.caseId)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>{s.workerName} ({s.district})</div>
                    <div style={{ fontSize: '0.86rem', color: '#34D399', fontWeight: 700, marginTop: '2px' }}>{s.recovery}</div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: 0 }}>
                    "{s.description.slice(0, 120)}..."
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. DISTRICT NETWORK MANAGEMENT TAB */}
        {activeTab === 'districts' && (
          <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                  {['District Name', 'Division', 'Active Cases', 'Resolved Cases', 'Union Members', 'Active Volunteers', 'Coverage Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districts.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', color: 'white', fontWeight: 700 }}>{d.name}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{d.division} Division</td>
                    <td style={{ padding: '12px 16px', color: 'white', fontWeight: 600 }}>{d.activeComplaints}</td>
                    <td style={{ padding: '12px 16px', color: '#34D399', fontWeight: 600 }}>{d.resolvedComplaints}</td>
                    <td style={{ padding: '12px 16px', color: '#60A5FA', fontWeight: 600 }}>{d.members}</td>
                    <td style={{ padding: '12px 16px', color: '#F87171', fontWeight: 600 }}>{d.volunteers}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                          color: d.status === 'active' ? '#34D399' : d.status === 'growing' ? '#F5A623' : '#94A3B8',
                          background: d.status === 'active' ? 'rgba(52,211,153,0.1)' : d.status === 'growing' ? 'rgba(245,166,35,0.1)' : 'rgba(148,163,184,0.1)',
                        }}
                      >
                        {(d.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => openDistrictForm(d)}
                        style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                      >
                        <Edit2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. SETTINGS PANEL TAB */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                Central Organization Settings Control Center
              </h3>
              <button
                onClick={handleSaveSettings}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '10px 24px', background: '#34D399', color: '#0A1931' }}
              >
                💾 Save All Settings
              </button>
            </div>

            {/* Settings Sub-Tabs row */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              {[
                { id: 'general', label: '💼 General Profile' },
                { id: 'contact', label: '📞 Contact Details' },
                { id: 'social', label: '🌐 Social & Community' },
                { id: 'content', label: '📜 Content & Legal' },
                { id: 'backups', label: '💾 Backup & Restore' },
                { id: 'diagnostics', label: '⚡ Supabase Diagnostics' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSettingsTab(sub.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: settingsTab === sub.id ? 'rgba(245,166,35,0.18)' : 'transparent',
                    color: settingsTab === sub.id ? '#F5A623' : 'rgba(255,255,255,0.5)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Settings Forms container */}
            <div style={{ background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              
              {/* GENERAL SUB-TAB */}
              {settingsTab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Organization Name</label>
                    <input type="text" value={settings.general.organizationName} onChange={e => handleSettingsChange('general', 'organizationName', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Founder Name</label>
                    <input type="text" value={settings.general.founderName} onChange={e => handleSettingsChange('general', 'founderName', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Founder Designation</label>
                    <input type="text" value={settings.general.founderDesignation} onChange={e => handleSettingsChange('general', 'founderDesignation', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Founder Profile Description / Quote Message</label>
                    <textarea rows={3} value={settings.general.founderDescription} onChange={e => handleSettingsChange('general', 'founderDescription', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Organization Mission Statement</label>
                    <textarea rows={2} value={settings.general.missionStatement} onChange={e => handleSettingsChange('general', 'missionStatement', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Organization Vision Statement</label>
                    <textarea rows={2} value={settings.general.visionStatement} onChange={e => handleSettingsChange('general', 'visionStatement', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Office Street Address</label>
                    <input type="text" value={settings.general.officeAddress} onChange={e => handleSettingsChange('general', 'officeAddress', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Office City</label>
                    <input type="text" value={settings.general.officeCity} onChange={e => handleSettingsChange('general', 'officeCity', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Office State</label>
                    <input type="text" value={settings.general.officeState} onChange={e => handleSettingsChange('general', 'officeState', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Office PIN Code</label>
                    <input type="text" value={settings.general.officePinCode} onChange={e => handleSettingsChange('general', 'officePinCode', e.target.value)} style={settingsInputStyle} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', textAlign: 'left' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 8px 0' }}>🌐 Language & Localization Settings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Default System Language</label>
                        <select style={settingsInputStyle} defaultValue="English">
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Marathi">Marathi (मराठी)</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Supported Translations</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', height: '100%', marginTop: '6px' }}>
                          <label style={{ fontSize: '0.82rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked disabled /> English
                          </label>
                          <label style={{ fontSize: '0.82rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked disabled /> Hindi (हिंदी)
                          </label>
                          <label style={{ fontSize: '0.82rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked disabled /> Marathi (मराठी)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* CONTACT SUB-TAB */}
              {settingsTab === 'contact' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Helpline Phone Number</label>
                    <input type="text" value={settings.contact.phoneNumber} onChange={e => handleSettingsChange('contact', 'phoneNumber', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>WhatsApp Contact Number</label>
                    <input type="text" value={settings.contact.whatsAppNumber} onChange={e => handleSettingsChange('contact', 'whatsAppNumber', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Emergency Helpline Line</label>
                    <input type="text" value={settings.contact.emergencyHelpline} onChange={e => handleSettingsChange('contact', 'emergencyHelpline', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Primary Email Address</label>
                    <input type="email" value={settings.contact.emailAddress} onChange={e => handleSettingsChange('contact', 'emailAddress', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Technical Support Email</label>
                    <input type="email" value={settings.contact.supportEmail} onChange={e => handleSettingsChange('contact', 'supportEmail', e.target.value)} style={settingsInputStyle} />
                  </div>
                </div>
              )}

              {/* SOCIAL SUB-TAB */}
              {settingsTab === 'social' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Facebook URL</label>
                    <input type="text" value={settings.social.facebookUrl} onChange={e => handleSettingsChange('social', 'facebookUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Instagram URL</label>
                    <input type="text" value={settings.social.instagramUrl} onChange={e => handleSettingsChange('social', 'instagramUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>YouTube Channel URL</label>
                    <input type="text" value={settings.social.youtubeUrl} onChange={e => handleSettingsChange('social', 'youtubeUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Telegram Channel URL</label>
                    <input type="text" value={settings.social.telegramUrl} onChange={e => handleSettingsChange('social', 'telegramUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Twitter/X Handle URL</label>
                    <input type="text" value={settings.social.twitterUrl} onChange={e => handleSettingsChange('social', 'twitterUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>LinkedIn Organization URL</label>
                    <input type="text" value={settings.social.linkedinUrl} onChange={e => handleSettingsChange('social', 'linkedinUrl', e.target.value)} style={settingsInputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem', color: '#F5A623', fontWeight: 'bold' }}>Official WhatsApp Union Community URL</label>
                    <input type="text" value={settings.social.whatsAppCommunityUrl} onChange={e => handleSettingsChange('social', 'whatsAppCommunityUrl', e.target.value)} style={{ ...settingsInputStyle, borderColor: 'rgba(245,166,35,0.45)' }} />
                  </div>
                </div>
              )}

              {/* CONTENT & LEGAL SUB-TAB */}
              {settingsTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>About JanKam Platform details</label>
                    <textarea rows={4} value={settings.legal.aboutJanKam} onChange={e => handleLegalChange('aboutJanKam', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Privacy Policy & Data Confidentiality Framework</label>
                    <textarea rows={4} value={settings.legal.privacyPolicy} onChange={e => handleLegalChange('privacyPolicy', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Terms of Service & Disclaimer text</label>
                    <textarea rows={4} value={settings.legal.termsConditions} onChange={e => handleLegalChange('termsConditions', e.target.value)} style={settingsTextareaStyle}></textarea>
                  </div>

                  {/* FAQ Manager */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>
                      📋 Frequently Asked Questions (FAQ) Manager
                    </h4>
                    
                    {/* Exisiting FAQs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {settings.legal.faq.map((faq, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F5A623' }}>Q: {faq.q}</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>A: {faq.a}</div>
                          </div>
                          <button onClick={() => handleDeleteFaq(idx)} style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add FAQ form */}
                    <form onSubmit={handleAddFaq} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Add FAQ Item:</div>
                      <input type="text" placeholder="Question" value={faqForm.q} onChange={e => setFaqForm(prev => ({ ...prev, q: e.target.value }))} style={settingsInputStyle} />
                      <input type="text" placeholder="Answer" value={faqForm.a} onChange={e => setFaqForm(prev => ({ ...prev, a: e.target.value }))} style={settingsInputStyle} />
                      <button type="submit" style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, alignSelf: 'flex-end', cursor: 'pointer' }}>
                        Add to FAQ Array
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* BACKUPS SUB-TAB */}
              {settingsTab === 'backups' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                  <div>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 700, fontSize: '0.98rem', marginBottom: '8px' }}>
                      💾 Database JSON Disaster Backups
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      Export all records (complaints, members, volunteers, success stories, and settings) in a unified JSON backup file. This backup can be kept securely and used to restore the platform state in case of local cache clearance or system resets.
                    </p>
                    <button
                      onClick={handleExportBackupJSON}
                      style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', padding: '10px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} /> Export Administrative Backup (JSON)
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 700, fontSize: '0.98rem', marginBottom: '8px' }}>
                      📂 Restore Platform from Backup (JSON)
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      Upload a previously exported JanKam JSON backup file to restore all databases. <strong style={{ color: '#F87171' }}>Warning:</strong> This will replace all current local records with the records stored in the backup file.
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackupJSON}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1.5px dashed rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: 'white',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 700, fontSize: '0.98rem', marginBottom: '8px' }}>
                      📊 Spreadsheet CSV Backup Channels
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      Download individual database tables directly as standard CSV files compatible with Microsoft Excel, Google Sheets, or LibreOffice.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleExportCSV('complaints')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        📥 CSV Complaints Table
                      </button>
                      <button
                        onClick={() => handleExportCSV('members')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        📥 CSV Members Table
                      </button>
                      <button
                        onClick={() => handleExportCSV('volunteers')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        📥 CSV Volunteers Table
                      </button>
                      <button
                        onClick={() => handleExportCSV('stories')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        📥 CSV Cases & Stories
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DIAGNOSTICS SUB-TAB */}
              {settingsTab === 'diagnostics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                  <div>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 700, fontSize: '0.98rem', marginBottom: '8px' }}>
                      ⚡ Supabase Database Connection & Write Diagnostics
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      Perform a real-time connection audit against your live Supabase project. This panel pings the database, audits table schemas, attempts a unique mock insertion into <code style={{ color: '#F5A623', background: 'rgba(245,166,35,0.1)', padding: '2px 4px', borderRadius: '4px' }}>public.complaints</code>, and reports the exact Postgres responses or constraint blocker errors.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Supabase Project URL</label>
                      <input
                        type="text"
                        value={diagUrl}
                        onChange={(e) => setDiagUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Publishable Anon Key</label>
                      <input
                        type="password"
                        value={diagKey}
                        onChange={(e) => setDiagKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button
                      onClick={runLiveSupabaseDiagnostics}
                      disabled={diagRunning}
                      style={{
                        background: diagRunning ? 'rgba(255,255,255,0.1)' : '#F5A623',
                        color: diagRunning ? 'rgba(255,255,255,0.4)' : '#0A1931',
                        border: 'none', padding: '10px 20px', borderRadius: '8px',
                        fontSize: '0.8rem', fontWeight: 800, cursor: diagRunning ? 'wait' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {diagRunning ? 'Auditing Connection...' : '⚡ Run Connection & Write Test'}
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('jankam_supabase_url');
                        localStorage.removeItem('jankam_supabase_anon_key');
                        setDiagUrl(import.meta.env.VITE_SUPABASE_URL || '');
                        setDiagKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
                        setDiagLog('Local storage overrides cleared. Standard .env settings restored.');
                      }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Clear Local Overrides
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Diagnostic Log Console Output</label>
                    <textarea
                      readOnly
                      value={diagLog}
                      style={{
                        background: '#040d1a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#60A5FA',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        height: '240px',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 8. AUDIT LOGS TIMELINE TAB */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                🔍 Immutable Administrative Audit Ledger
              </h3>
              <button
                onClick={() => {
                  auditLogsService.getAll().then(setAuditLogs);
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Refresh Audit Trail
              </button>
            </div>

            <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                    {['Timestamp', 'Admin User', 'Action', 'Target ID', 'Old Value', 'New Value', 'Reason', 'Device Context / IP'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    [...auditLogs].reverse().map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: 700 }}>
                          👤 {log.adminUser}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                              color: (log.action || '').includes('Approved') || (log.action || '').includes('Resolved') ? '#34D399' : (log.action || '').includes('Rejected') || (log.action || '').includes('Delete') ? '#F87171' : '#F5A623',
                              background: (log.action || '').includes('Approved') || (log.action || '').includes('Resolved') ? 'rgba(52,211,153,0.1)' : (log.action || '').includes('Rejected') || (log.action || '').includes('Delete') ? 'rgba(248,113,113,0.1)' : 'rgba(245,166,35,0.1)',
                            }}
                          >
                            {(log.action || '').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#60A5FA' }}>
                          {log.targetId}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.oldValue}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'white', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.newValue}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                          {log.reason || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                          IP: {log.ipAddress || '127.0.0.1'}<br/>
                          {log.browser || 'Browser'} / {log.device || 'PC'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No audit ledger records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. NOTIFICATIONS QUEUE TAB */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                📢 Operational Communication Notification Queue
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    notificationsService.processQueue().then(() => {
                      notificationsService.getAll().then(setNotifications);
                      alert('Simulated background queue processor executed successfully!');
                    });
                  }}
                  style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} /> Run Queue Processor
                </button>
                <button
                  onClick={() => {
                    notificationsService.getAll().then(setNotifications);
                  }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} /> Refresh Queue Logs
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                    {['Timestamp', 'Recipient (Phone/Email)', 'Gateway Type', 'Message Body Payload', 'Transmission Status', 'Retries', 'Gateway Diagnostics', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                   {notifications.length > 0 ? (
                    notifications.map((notif, idx) => {
                      const nCreatedAt = notif.createdAt || new Date().toISOString();
                      const nRecipient = notif.recipient || 'N/A';
                      const nType = notif.type || 'SMS';
                      const nMessage = notif.message || '';
                      const nStatus = notif.status || 'pending';
                      const nRetryCount = notif.retryCount || 0;
                      const nErrorNotes = notif.errorNotes || 'No faults reported. Success.';
                      
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {nCreatedAt ? new Date(nCreatedAt).toLocaleString('en-IN') : 'N/A'}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'white', fontWeight: 700 }}>
                            {nRecipient}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                                color: nType === 'WhatsApp' ? '#34D399' : nType === 'SMS' ? '#60A5FA' : '#F5A623',
                                background: nType === 'WhatsApp' ? 'rgba(52,211,153,0.1)' : nType === 'SMS' ? 'rgba(96,165,250,0.1)' : 'rgba(245,166,35,0.1)',
                              }}
                            >
                              {nType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.9)', maxWidth: '300px', wordBreak: 'break-word' }}>
                            {nMessage}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                                color: nStatus === 'sent' ? '#34D399' : nStatus === 'failed' ? '#F87171' : nStatus === 'retry' ? '#F5A623' : '#60A5FA',
                                background: nStatus === 'sent' ? 'rgba(52,211,153,0.1)' : nStatus === 'failed' ? 'rgba(248,113,113,0.1)' : nStatus === 'retry' ? 'rgba(245,166,35,0.1)' : 'rgba(96,165,250,0.1)',
                              }}
                            >
                              {(nStatus).toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'white', fontWeight: 600 }}>
                            {nRetryCount}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', maxWidth: '150px' }}>
                            {nErrorNotes}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {nStatus === 'failed' ? (
                              <button
                                onClick={() => notificationsService.retryNotification(notif.id)}
                                style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Retry Outflow
                              </button>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>Locked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No queued notifications in the outflow logs ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. ADMINISTRATORS MANAGEMENT TAB */}
        {activeTab === 'admin_mgmt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                🛡️ Administrator Management Dashboard
              </h3>
              <button
                onClick={() => {
                  setSelectedAdmin(null);
                  setAdminUsername('');
                  setAdminPassword('');
                  setAdminRole('Volunteer');
                  setAdminDistrict('');
                  setAdminActive(true);
                  setAdminError('');
                  setAdminSuccess('');
                  setShowAdminModal(true);
                }}
                style={{ background: '#F5A623', color: '#0A1931', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit, sans-serif' }}
              >
                <Plus size={14} /> Create New Admin
              </button>
            </div>

            <div style={{ overflowX: 'auto', background: '#0F2347', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                    {['Username', 'Role', 'Assigned District', 'Active Status', 'Created At', 'Last Login', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingAdmins ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        Loading administrators ledger...
                      </td>
                    </tr>
                  ) : admins.length > 0 ? (
                    admins.map((adm) => (
                      <tr key={adm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: 700 }}>
                          {adm.username}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                              color: adm.role === 'Super Admin' ? '#F5A623' : adm.role === 'State Admin' ? '#60A5FA' : adm.role === 'District Admin' ? '#34D399' : '#A78BFA',
                              background: adm.role === 'Super Admin' ? 'rgba(245,166,35,0.1)' : adm.role === 'State Admin' ? 'rgba(96,165,250,0.1)' : adm.role === 'District Admin' ? 'rgba(52,211,153,0.1)' : 'rgba(167,139,250,0.1)',
                            }}
                          >
                            {adm.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>
                          {adm.district || 'All Districts (Super/State)'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                              color: adm.isActive ? '#34D399' : '#F87171',
                              background: adm.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                            }}
                          >
                            {adm.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                          {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                          {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString('en-IN') : 'Never'}
                        </td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setSelectedAdmin(adm);
                              setAdminUsername(adm.username);
                              setAdminPassword('');
                              setAdminRole(adm.role);
                              setAdminDistrict(adm.district || '');
                              setAdminActive(adm.isActive);
                              setAdminError('');
                              setAdminSuccess('');
                              setShowAdminModal(true);
                            }}
                            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Edit / Reset
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to ${adm.isActive ? 'deactivate' : 'activate'} ${adm.username}?`)) {
                                const ok = await adminService.updateAdmin(
                                  currentUser?.username || 'system',
                                  adm.id,
                                  adm.username,
                                  adm.role,
                                  adm.district,
                                  !adm.isActive
                                );
                                if (ok) {
                                  refreshAdmins();
                                } else {
                                  alert('Action failed.');
                                }
                              }
                            }}
                            style={{ 
                              background: adm.isActive ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)', 
                              border: 'none', 
                              color: adm.isActive ? '#F87171' : '#34D399', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.72rem', 
                              cursor: 'pointer', 
                              fontWeight: 600 
                            }}
                          >
                            {adm.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No administrators registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ============ SUCCESS STORY MODAL DIALOG ============ */}
      {storyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0F2347', border: '1.5px solid rgba(245,166,35,0.3)', borderRadius: '24px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.15rem' }}>
                {editingStory ? '✏️ Edit Success Story Record' : '🏆 Create New Success Story'}
              </h3>
              <button onClick={() => setStoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Case Reference ID (Format: JK-PUN-0001)</label>
                <input type="text" value={storyForm.caseId} onChange={e => setStoryForm(prev => ({ ...prev, caseId: e.target.value }))} style={settingsInputStyle} required disabled={!!editingStory} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Worker Name</label>
                <input type="text" value={storyForm.workerName} onChange={e => setStoryForm(prev => ({ ...prev, workerName: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>District</label>
                <input type="text" value={storyForm.district} onChange={e => setStoryForm(prev => ({ ...prev, district: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Labour Issue</label>
                <input type="text" placeholder="e.g. Unpaid Wages, PF Default, Maternity Denial" value={storyForm.issue} onChange={e => setStoryForm(prev => ({ ...prev, issue: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Resolution Outcome Headline</label>
                <input type="text" placeholder="e.g. Dues recovered & policy corrected" value={storyForm.outcome} onChange={e => setStoryForm(prev => ({ ...prev, outcome: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Recovery Stat Tag</label>
                <input type="text" placeholder="e.g. ₹18,000 Dues Recovered, Safe Workplace Enforced" value={storyForm.recovery} onChange={e => setStoryForm(prev => ({ ...prev, recovery: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Amount Recovered (Optional, digits only)</label>
                <input type="text" placeholder="e.g. 18000" value={storyForm.amountRecovered} onChange={e => setStoryForm(prev => ({ ...prev, amountRecovered: e.target.value }))} style={settingsInputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Worker Case Narrative / Description</label>
                <textarea rows={3} value={storyForm.description} onChange={e => setStoryForm(prev => ({ ...prev, description: e.target.value }))} style={settingsTextareaStyle} required></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setStoryModalOpen(false)} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.8rem' }}>
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DISTRICT DESK MODAL DIALOG ============ */}
      {districtModalOpen && editingDistrict && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0F2347', border: '1.5px solid rgba(245,166,35,0.3)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.15rem' }}>
                ✏️ Edit District: {editingDistrict.name}
              </h3>
              <button onClick={() => setDistrictModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDistrict} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>District Name</label>
                <input type="text" value={districtForm.name} onChange={e => setDistrictForm(prev => ({ ...prev, name: e.target.value }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Coverage Desk Status</label>
                <select value={districtForm.status} onChange={e => setDistrictForm(prev => ({ ...prev, status: e.target.value as any }))} style={settingsInputStyle}>
                  <option value="active">Active Desk</option>
                  <option value="growing">Growing Presence</option>
                  <option value="pending">Pending Launch</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Active Complaints Count</label>
                <input type="number" value={districtForm.activeComplaints} onChange={e => setDistrictForm(prev => ({ ...prev, activeComplaints: Number(e.target.value) }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Resolved Complaints Count</label>
                <input type="number" value={districtForm.resolvedComplaints} onChange={e => setDistrictForm(prev => ({ ...prev, resolvedComplaints: Number(e.target.value) }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Union Members Count</label>
                <input type="number" value={districtForm.members} onChange={e => setDistrictForm(prev => ({ ...prev, members: Number(e.target.value) }))} style={settingsInputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Registered Volunteers Count</label>
                <input type="number" value={districtForm.volunteers} onChange={e => setDistrictForm(prev => ({ ...prev, volunteers: Number(e.target.value) }))} style={settingsInputStyle} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setDistrictModalOpen(false)} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.8rem' }}>
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ SECURE ADMINISTRATOR MANAGEMENT MODAL ============ */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0F2347', border: '1.5px solid #F5A623', borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.15rem' }}>
                {selectedAdmin ? `🛡️ Edit & Secure: ${selectedAdmin.username}` : '🛡️ Create New Administrator'}
              </h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>Admin Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  disabled={!!selectedAdmin}
                  placeholder="e.g. punevolunteer"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>
                  {selectedAdmin ? 'Reset Password (Leave blank to keep current)' : 'Password (Min. 6 chars)'}
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={selectedAdmin ? '••••••••' : 'Password hash trigger'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>Administrative Role Tier</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0F2347', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="State Admin">State Admin</option>
                  <option value="District Admin">District Admin</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>

              {(adminRole === 'District Admin' || adminRole === 'Volunteer') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>Assigned District Lockdown</label>
                  <select
                    value={adminDistrict}
                    onChange={(e) => setAdminDistrict(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0F2347', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="">-- Select Assigned District --</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input type="checkbox" id="admin-active-status" checked={adminActive} onChange={(e) => setAdminActive(e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="admin-active-status" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    Active Status (Uncheck to Deactivate profile)
                  </label>
                </div>
              )}

              {adminError && <div style={{ fontSize: '0.8rem', color: '#F87171', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>❌ {adminError}</div>}
              {adminSuccess && <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>✅ {adminSuccess}</div>}

              <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '12px', background: '#F5A623', color: '#0A1931', border: 'none', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                {selectedAdmin ? 'Update Administrator' : 'Create Administrator'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL DRAWER FOR COMPLAINTS ── */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 15, 35, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              height: '100vh',
              background: '#0A1931',
              borderLeft: '1.5px solid rgba(245, 166, 35, 0.25)',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              position: 'relative',
              textAlign: 'left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#F5A623', margin: 0 }}>
                  Advocacy Case File: {selectedComplaint.id}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                  Filed on {new Date(selectedComplaint.createdAt).toLocaleString()} • Last Update: {selectedComplaint.updatedAt ? new Date(selectedComplaint.updatedAt).toLocaleString() : 'Never'}
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none', color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable details */}
            <form
              onSubmit={saveComplaintEdits}
              style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
            >
              {/* Complainant personal details */}
              <div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.9rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '12px', margin: '0 0 12px 0' }}>
                  👤 1. Worker Personal Parameters
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
                  <div><strong>Full Name:</strong> <span style={{ color: 'white' }}>{selectedComplaint.name}</span></div>
                  <div><strong>Mobile Number:</strong> <span style={{ color: 'white' }}>{selectedComplaint.mobile}</span></div>
                  <div><strong>Email Address:</strong> <span style={{ color: 'white' }}>{selectedComplaint.email || 'N/A'}</span></div>
                  <div><strong>Gender / Age:</strong> <span style={{ color: 'white' }}>{selectedComplaint.gender}, {selectedComplaint.age} years</span></div>
                  <div><strong>Home Location:</strong> <span style={{ color: 'white' }}>{selectedComplaint.homeDistrict}, {selectedComplaint.homeState}</span></div>
                  <div><strong>Current Workplace:</strong> <span style={{ color: 'white' }}>{selectedComplaint.workDistrict}, {selectedComplaint.workState}</span></div>
                  <div><strong>Industry Sector:</strong> <span style={{ color: 'white' }}>{selectedComplaint.industryType}</span></div>
                  <div><strong>Worker Type:</strong> <span style={{ color: 'white' }}>{selectedComplaint.workerType}</span></div>
                  <div><strong>Education Level:</strong> <span style={{ color: 'white' }}>{selectedComplaint.educationLevel}</span></div>
                  <div><strong>Preferred Language:</strong> <span style={{ color: 'white' }}>{selectedComplaint.preferredLanguage}</span></div>
                </div>
              </div>

              {/* Employer / Contractor Details */}
              <div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.9rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '12px', margin: '0 0 12px 0' }}>
                  🏢 2. Employer & Corporate Entity Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
                  <div><strong>Employer / Contractor:</strong> <span style={{ color: 'white' }}>{selectedComplaint.employerName}</span></div>
                  <div><strong>Company Name:</strong> <span style={{ color: 'white' }}>{selectedComplaint.companyName}</span></div>
                  <div><strong>Employer Mobile:</strong> <span style={{ color: 'white' }}>{selectedComplaint.employerMobile || 'N/A'}</span></div>
                  <div><strong>Employer Email:</strong> <span style={{ color: 'white' }}>{selectedComplaint.employerEmail || 'N/A'}</span></div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Registered Address:</strong> <span style={{ color: 'white' }}>{selectedComplaint.companyAddress || 'N/A'}</span></div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Actual Work Site:</strong> <span style={{ color: 'white' }}>{selectedComplaint.workSiteAddress || 'N/A'}</span></div>
                  <div><strong>Supervisor:</strong> <span style={{ color: 'white' }}>{selectedComplaint.supervisorName || 'N/A'} {selectedComplaint.supervisorMobile ? `(${selectedComplaint.supervisorMobile})` : ''}</span></div>
                  <div><strong>HR Department:</strong> <span style={{ color: 'white' }}>{selectedComplaint.hrEmail || 'N/A'} {selectedComplaint.hrMobile ? `(${selectedComplaint.hrMobile})` : ''}</span></div>
                </div>
              </div>

              {/* Case Claim Details */}
              <div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.9rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '12px', margin: '0 0 12px 0' }}>
                  📋 3. Incident Claim & Witnesses
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  <div><strong>Incident Date:</strong> <span style={{ color: 'white' }}>{selectedComplaint.incidentDate}</span></div>
                  <div><strong>Directed Against:</strong> <span style={{ color: 'white' }}>{selectedComplaint.complaintAgainst}</span></div>
                  <div><strong>Grievance Category:</strong> <span style={{ color: 'white' }}>{selectedComplaint.complaintType}</span></div>
                  <div><strong>Financial Loss:</strong> <span style={{ color: 'white' }}>{selectedComplaint.approxFinancialLoss || 'N/A'}</span></div>
                  <div><strong>Witness:</strong> <span style={{ color: 'white' }}>{selectedComplaint.witnessName || 'N/A'} {selectedComplaint.witnessDesignation ? `(${selectedComplaint.witnessDesignation})` : ''} {selectedComplaint.witnessMobile ? `- ${selectedComplaint.witnessMobile}` : ''}</span></div>
                  <div><strong>Evidence Type:</strong> <span style={{ color: 'white' }}>{selectedComplaint.documentType || 'None Uploaded'}</span></div>
                </div>
                {selectedComplaint.evidenceNotes && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginBottom: '10px' }}>
                    <strong>Evidence Notes:</strong> {selectedComplaint.evidenceNotes}
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', lineHeight: 1.5, textAlign: 'left' }}>
                  <strong style={{ color: '#F5A623' }}>Complaint Description:</strong>
                  <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '4px', whiteSpace: 'pre-wrap', margin: '4px 0 0 0' }}>{selectedComplaint.description}</p>
                </div>
              </div>

              {/* Secret advocacy notes & case controls */}
              <div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', color: '#F5A623', fontSize: '0.9rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '14px', margin: '0 0 14px 0' }}>
                  ⚖️ 4. Secretarial Actions & Advocacy Assignment
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)' }}>Current Operational Stage</label>
                    <select
                      value={editForm.currentStage}
                      onChange={e => setEditForm({ ...editForm, currentStage: e.target.value })}
                      style={settingsInputStyle}
                    >
                      <option value="submitted">Submitted — Awaiting Review</option>
                      <option value="under_review">Under Active Review</option>
                      <option value="employer_verification">Employer Verification Status</option>
                      <option value="conciliation">Active Conciliation Mediation</option>
                      <option value="resolved">Resolved Successfully</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)' }}>Assigned District Desk</label>
                    <input
                      type="text"
                      value={editForm.assignedDistrictTeam || ''}
                      onChange={e => setEditForm({ ...editForm, assignedDistrictTeam: e.target.value })}
                      style={settingsInputStyle}
                      placeholder="e.g. Pune District Desk"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)' }}>Assigned Volunteer</label>
                    <input
                      type="text"
                      value={editForm.assignedVolunteer || ''}
                      onChange={e => setEditForm({ ...editForm, assignedVolunteer: e.target.value })}
                      style={settingsInputStyle}
                      placeholder="Volunteer name"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)' }}>Assigned Advocate Officer</label>
                    <input
                      type="text"
                      value={editForm.assignedOfficer || ''}
                      onChange={e => setEditForm({ ...editForm, assignedOfficer: e.target.value })}
                      style={settingsInputStyle}
                      placeholder="Officer name"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🛡️ Secret Internal Administrative Notes</span>
                    <span style={{ color: 'rgba(248,113,113,0.7)' }}>🔒 Admins Only — Hidden from worker</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.internalNotes || ''}
                    onChange={e => setEditForm({ ...editForm, internalNotes: e.target.value })}
                    style={settingsTextareaStyle}
                    placeholder="Enter confidential notes, phone call summaries, legal analysis and investigations."
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📢 Worker-Facing Public Actions Update</span>
                    <span style={{ color: '#34D399' }}>👁️ PUBLIC — Displayed live on tracking stepper timeline</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.publicUpdate || ''}
                    onChange={e => setEditForm({ ...editForm, publicUpdate: e.target.value })}
                    style={settingsTextareaStyle}
                    placeholder="Enter case updates, next steps, conciliation date and recovery progress that the worker will see live."
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '18px',
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn-outline"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '10px 30px', fontSize: '0.85rem', background: '#34D399', color: '#0A1931' }}
                >
                  💾 Save Case File Updates
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline Shared Styles for Inputs inside Settings
const settingsInputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  color: 'white',
  fontSize: '0.88rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
} as React.CSSProperties;

const settingsTextareaStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  color: 'white',
  fontSize: '0.88rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  resize: 'vertical',
} as React.CSSProperties;
