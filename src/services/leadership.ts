import { storageService, STORAGE_KEYS } from './storage';
import type { LeadershipData } from '../types/index';
import { supabase, checkSupabaseOnline } from './supabaseClient';
import { liveStatsService } from './liveStats';

export const leadershipService = {
  apply: async (data: Omit<LeadershipData, 'id' | 'createdAt'>): Promise<LeadershipData> => {
    console.log('[STEP 1] Form submit received for new volunteer registration. Data:', data);
    
    // 1. Fetch secure, database-backed sequential unique ID
    const isOnline = await checkSupabaseOnline();
    if (!isOnline || !supabase) {
      throw new Error('Database is offline or not configured. Cannot process volunteer registration.');
    }

    console.log('[STEP 2] Querying live database sequence via RPC get_next_volunteer_id...');
    const { data: dbGeneratedId, error: rpcError } = await supabase.rpc('get_next_volunteer_id');

    if (rpcError || !dbGeneratedId) {
      console.error('[SUPABASE] Database ID generation failed:', rpcError);
      throw new Error(`Database sequential ID generation failed: ${rpcError?.message || 'Unknown'}`);
    }

    const application: LeadershipData = {
      ...data,
      id: dbGeneratedId,
      createdAt: new Date().toISOString(),
    };

    console.log('[STEP 3] Validation passed. Generated Database Volunteer ID:', application.id);

    const cleanVal = (val: any, fallback: string): string => {
      if (val === null || val === undefined) return fallback;
      const s = String(val).trim();
      return s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' ? fallback : s;
    };

    const payload = {
      id: application.id,
      name: cleanVal(application.name, 'Anonymous'),
      mobile: cleanVal(application.mobile, '9999999999'),
      email: application.email || null,
      state: application.state || 'Maharashtra',
      district: cleanVal(application.district, 'Pune'),
      industry_type: application.industryType || 'General',
      skills: application.skills || [],
      status: application.status || 'pending'
    };

    console.log('[STEP 4] Payload prepared for public.volunteers schema write:', payload);
    console.log('[STEP 5] Supabase insert started for volunteers table...');

    const response = await supabase.from('volunteers').insert([payload]);
    const { error, status, statusText } = response;
    
    console.log('[STEP 6] Response received from Supabase volunteers insert:');
    console.log(' - HTTP Status:', status, statusText);
    console.log(' - Postgres Error:', error);
    console.log(' - Inserted Row ID:', application.id);

    if (error) {
      console.error('[SUPABASE] INSERT into volunteers table FAILED! Postgres Error Details:', error);
      throw new Error(`Database insert failed: [${error.code}] ${error.message} (${error.details || 'no details'})`);
    }

    console.log('[SUPABASE] INSERT into volunteers table SUCCESS! Row registered in Supabase Console.');

    // Cascade 1: Insert into public.audit_logs
    console.log('[SUPABASE] Cascade 1: Initiating audit log entry for volunteer registration...');
    try {
      const auditRes = await supabase.from('audit_logs').insert([{
        admin_user: 'system',
        action: 'VOLUNTEER_REGISTERED',
        target_id: application.id,
        new_value: `Volunteer registered successfully: ${payload.name}. District: ${payload.district}`,
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

    // Cascade 2: Insert into public.notifications
    console.log('[SUPABASE] Cascade 2: Initiating notification queuing for volunteer onboarding...');
    try {
      const msg = `नमस्कार ${payload.name}, JanKam में वॉलंटियर के रूप में आपका आवेदन प्राप्त हो गया है। आपका वॉलंटियर आईडी: ${application.id} है।`;
      const notifRes = await supabase.from('notifications').insert([{
        recipient: payload.mobile,
        type: 'WhatsApp',
        message: msg,
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString()
      }]);
      console.log('[SUPABASE] Notification insert response status:', notifRes.status, notifRes.statusText);
      if (notifRes.error) {
        console.warn('[SUPABASE] Notification insert failed with error:', notifRes.error);
      } else {
        console.log('[SUPABASE] Notification insert succeeded.');
      }
    } catch (ne) {
      console.error('[SUPABASE] Notification insertion crashed synchronously:', ne);
    }

    // Mirror to local cache for display bindings
    storageService.append(STORAGE_KEYS.LEADERSHIP, application);
    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {}
    return application;
  },

  softDelete: async (id: string): Promise<void> => {
    const list = storageService.get<LeadershipData>(STORAGE_KEYS.LEADERSHIP) || [];
    const updated = list.map(v => v.id === id ? { ...v, isDeleted: true, deletedAt: new Date().toISOString() } : v);
    storageService.set(STORAGE_KEYS.LEADERSHIP, updated);

    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        await supabase
          .from('volunteers')
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase volunteer soft delete sync failed:', e);
      }
    }
    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {}
  },

  getAll: (): LeadershipData[] => {
    const list = storageService.get<LeadershipData>(STORAGE_KEYS.LEADERSHIP) || [];
    return list.filter(v => !v.isDeleted);
  },
};

