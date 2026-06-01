// ============================================================
// JANKAM — COMPLAINTS ADVANCED DATABASE & ROUTING SERVICES
// ============================================================
import { storageService, STORAGE_KEYS } from './storage';
import type { ComplaintData } from '../types/complaint';
import { supabase, checkSupabaseOnline } from './supabaseClient';
import { notificationsService } from './notifications';
import { liveStatsService } from './liveStats';

// Auto-routing directory map for the Auto Assignment Engine
const DISTRICT_ROUTERS: Record<string, { team: string; volunteer: string; officer: string }> = {
  pune: { team: 'Pune Division Advocacy Desk', volunteer: 'Suresh Mane (Advocate Staff)', officer: 'Pankaj Dhole (Lead Advocate)' },
  mumbai: { team: 'Mumbai Workers Support Network', volunteer: 'Anil Deshmukh (Volunteer)', officer: 'Adv. Smita Patil (Advocate)' },
  thane: { team: 'Thane Industrial Labour Desk', volunteer: 'Rohan Shinde (Staff)', officer: 'Adv. Vijay Kadam (Advocate)' },
  nashik: { team: 'Nashik Labour Rights Council', volunteer: 'Deepak Thorat (Volunteer)', officer: 'Adv. Ramesh Hire (Advocate)' },
  nagpur: { team: 'Nagpur Vidarbha Workers Assembly', volunteer: 'Vinod Kale (Staff)', officer: 'Adv. Sandeep Joshi (Advocate)' },
  kolhapur: { team: 'Kolhapur Workers Union Desk', volunteer: 'Mahesh Patil (Volunteer)', officer: 'Adv. S. R. Chougule (Advocate)' },
  aurangabad: { team: 'Chhatrapati Sambhajinagar Labour Desk', volunteer: 'Satish Chavan (Staff)', officer: 'Adv. Sanjay Kolhe (Advocate)' },
};

export const getAssignmentsForDistrict = (district: string) => {
  const key = (district || '').trim().toLowerCase();
  return DISTRICT_ROUTERS[key] || {
    team: 'Maharashtra Central Advocacy Desk',
    volunteer: 'JanKam Support Staff',
    officer: 'Pankaj Dhole (Lead Advocate)',
  };
};

// Generate sequential Complaint ID
export const generateComplaintId = (district: string): string => {
  const cleanDistrict = (district || 'PUN').trim().slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const existing = storageService.count(STORAGE_KEYS.COMPLAINTS);
  const seq = String(existing + 1).padStart(5, '0');
  return `JK-${cleanDistrict}-${year}-${seq}`;
};

export const complaintsService = {
  // Check if 3 similar complaints exist under the same (mobile + company + category)
  checkDuplicateExists: (mobile: string, company: string, category: string): boolean => {
    const list = complaintsService.getAll();
    const mMobile = (mobile || '').replace(/\s+/g, '');
    const mCompany = (company || '').trim().toLowerCase();
    const mCategory = category || '';
    
    if (!mMobile || !mCompany || !mCategory) return false;
    
    const duplicates = list.filter(c => {
      const cMobile = (c.mobile || '').replace(/\s+/g, '');
      const cCompany = (c.companyName || '').trim().toLowerCase();
      const cCategory = c.complaintType || '';
      return cMobile === mMobile && cCompany === mCompany && cCategory === mCategory;
    });
    return duplicates.length >= 3;
  },

  // Submit new case intake
  submit: async (data: Omit<ComplaintData, 'id' | 'status' | 'createdAt'>): Promise<ComplaintData> => {
    console.log('[STEP 1] Form submit received for new complaint. Data:', data);
    
    const cId = generateComplaintId(data.workDistrict);
    
    // Auto Assignment Engine triggers
    const routes = getAssignmentsForDistrict(data.workDistrict);

    const complaint: ComplaintData = {
      ...data,
      id: cId,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      assignedVolunteer: data.assignedVolunteer || routes.volunteer,
      assignedDistrictTeam: data.assignedDistrictTeam || routes.team,
      assignedOfficer: data.assignedOfficer || routes.officer,
    };

    console.log('[STEP 2] Validation passed. Generated Case ID:', complaint.id);

    // 1. Sync to Supabase Postgres Table
    const isOnline = await checkSupabaseOnline();
    let supabaseSuccess = false;

    if (isOnline && supabase) {
      const cleanVal = (val: any, fallback: string): string => {
        if (val === null || val === undefined) return fallback;
        const s = String(val).trim();
        return s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' ? fallback : s;
      };

      const payload = {
        id: complaint.id,
        name: cleanVal(complaint.name, 'Anonymous'),
        mobile: cleanVal(complaint.mobile, '9999999999'),
        email: complaint.email || null,
        gender: complaint.gender || null,
        age: typeof complaint.age === 'number' ? complaint.age : null,
        home_state: complaint.homeState || null,
        home_district: complaint.homeDistrict || null,
        work_state: complaint.workState || null,
        work_district: cleanVal(complaint.workDistrict, 'Pune'),
        industry_type: complaint.industryType || null,
        company_name: cleanVal(complaint.companyName, 'N/A'),
        employee_id: complaint.employeeId || null,
        worker_type: complaint.workerType || null,
        education_level: complaint.educationLevel || null,
        preferred_language: complaint.preferredLanguage || null,
        complaint_type: cleanVal(complaint.complaintType, 'Other'),
        description: cleanVal(complaint.description, 'No description provided.'),
        priority_level: complaint.priorityLevel || 'Medium',
        document_type: complaint.documentType || null,
        employer_name: cleanVal(complaint.employerName, 'N/A'),
        employer_mobile: complaint.employerMobile || null,
        employer_email: complaint.employerEmail || null,
        company_address: complaint.companyAddress || null,
        work_site_address: complaint.workSiteAddress || null,
        supervisor_name: complaint.supervisorName || null,
        supervisor_mobile: complaint.supervisorMobile || null,
        hr_mobile: complaint.hrMobile || null,
        hr_email: complaint.hrEmail || null,
        incident_date: complaint.incidentDate || null,
        complaint_against: complaint.complaintAgainst || null,
        approx_financial_loss: complaint.approxFinancialLoss || null,
        witness_name: complaint.witnessName || null,
        witness_mobile: complaint.witnessMobile || null,
        witness_designation: complaint.witnessDesignation || null,
        evidence_notes: complaint.evidenceNotes || null,
        worker_mobile_verified: !!complaint.workerMobileVerified,
        notification_type: complaint.notificationType || 'WhatsApp',
        internal_notes: complaint.internalNotes || null,
        public_update: complaint.publicUpdate || null,
        current_stage: complaint.currentStage || 'submitted',
        assigned_volunteer: complaint.assignedVolunteer || null,
        assigned_district_team: complaint.assignedDistrictTeam || null,
        assigned_officer: complaint.assignedOfficer || null,
        status: complaint.status || 'submitted'
      };

      console.log('[STEP 3] Payload prepared for public.complaints schema write:', payload);
      console.log('[STEP 4] Supabase insert started for complaints table...');

      try {
        const response = await supabase.from('complaints').insert([payload]);
        const { error, status, statusText } = response;
        
        console.log('[STEP 5] Response received from Supabase complaints insert:');
        console.log(' - HTTP Status:', status, statusText);
        console.log(' - Postgres Error:', error);
        console.log(' - Inserted Row ID:', complaint.id);
        
        if (error) {
          console.error('[SUPABASE] INSERT into complaints table FAILED! Postgres Error Details:', error);
        } else {
          console.log('[SUPABASE] INSERT into complaints table SUCCESS! Row registered in Supabase Console.');
          supabaseSuccess = true;

          // Cascade: Insert into public.audit_logs
          console.log('[SUPABASE] Cascade: Initiating audit log entry for complaint intake...');
          try {
            const auditRes = await supabase.from('audit_logs').insert([{
              admin_user: 'system',
              action: 'COMPLAINT_SUBMITTED',
              target_id: complaint.id,
              new_value: `Complaint registered successfully: ${payload.name}. Category: ${payload.complaint_type}`,
              ip_address: '192.168.43.102',
              browser: 'Google Chrome',
              device: 'Desktop Workstation'
            }]);
            console.log('[SUPABASE] Audit log insert response status:', auditRes.status, auditRes.statusText);
            if (auditRes.error) {
              console.warn('[SUPABASE] Audit log insert failed with error:', auditRes.error);
            } else {
              console.log('[SUPABASE] Audit log insert succeeded.');
            }
          } catch (ae) {
            console.error('[SUPABASE] Audit log insertion crashed synchronously:', ae);
          }
        }
      } catch (e) {
        console.error('[SUPABASE] Synchronous client transmission error caught in service layer:', e);
      }
    } else {
      console.warn('[SUPABASE] Write skipped because Supabase is unconfigured or client is offline.');
    }

    if (!supabaseSuccess) {
      console.warn('[SUPABASE] Supabase write failed or skipped. Relying entirely on localStorage fallback persistence.');
    } else {
      console.log('[SUPABASE] LocalStorage fallback was not used as the primary write path.');
    }

    // 2. Offline Fallback Local Storage Sync
    storageService.append(STORAGE_KEYS.COMPLAINTS, complaint);
    
    // 3. Queue WhatsApp / Email Alert notifications
    try {
      const trackLink = `https://jankam.in/track?id=${complaint.id}`;
      const msg = `नमस्कार ${complaint.name}, आपकी शिकायत JanKam Labour Advocates के पास दर्ज कर ली गई है। शिकायत क्रमांक: ${complaint.id}। आप अपनी शिकायत का विवरण यहाँ ट्रैक कर सकते हैं: ${trackLink}`;
      
      console.log('[SUPABASE] Queueing outflow notification for complaint tracking...');
      notificationsService.queueNotification(complaint.mobile, 'WhatsApp', msg);
      
      if (complaint.email) {
        notificationsService.queueNotification(
          complaint.email, 
          'Email', 
          `Dear ${complaint.name},\n\nYour complaint has been successfully registered with JanKam. Case ID: ${complaint.id}.\nTrack your grievance status here: ${trackLink}`
        );
      }
    } catch (e) {
      console.warn('Failed to queue submission alerts:', e);
    }

    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {
      // ignore
    }
    return complaint;
  },

  // Secure RPC query mapping for Worker Tracking
  getWorkerComplaint: async (complaintId: string, mobile: string): Promise<ComplaintData | null> => {
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        // Execute secure SECURITY DEFINER database procedure to query credentials
        const { data, error } = await supabase.rpc('get_worker_complaint', {
          p_id: (complaintId || '').trim().toUpperCase(),
          p_mobile: (mobile || '').trim().replace(/\s+/g, '')
        });
        
        if (!error && data && data.length > 0) {
          const row = data[0];
          return {
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
          };
        }
      } catch (e) {
        console.warn('RPC request failed, running offline fallback search:', e);
      }
    }

    // Secure Local Storage matching fallback
    const list = complaintsService.getAll();
    const match = list.find(c => {
      const cId = c.id || '';
      const cMobile = (c.mobile || '').replace(/\s+/g, '');
      const sId = (complaintId || '').trim();
      const sMobile = (mobile || '').replace(/\s+/g, '');
      return cId.toUpperCase() === sId.toUpperCase() && cMobile === sMobile;
    });
    return match || null;
  },

  softDelete: async (id: string): Promise<void> => {
    const list = storageService.get<ComplaintData>(STORAGE_KEYS.COMPLAINTS) || [];
    const updated = list.map(c => c.id === id ? { ...c, isDeleted: true, deletedAt: new Date().toISOString() } : c);
    storageService.set(STORAGE_KEYS.COMPLAINTS, updated);

    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        await supabase
          .from('complaints')
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase soft delete sync failed:', e);
      }
    }
    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {}
  },

  getAll: (): ComplaintData[] => {
    const list = storageService.get<ComplaintData>(STORAGE_KEYS.COMPLAINTS) || [];
    return list.filter(c => !c.isDeleted);
  },

  count: (): number => {
    return complaintsService.getAll().length;
  },
};
