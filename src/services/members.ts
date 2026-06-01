import { storageService, STORAGE_KEYS } from './storage';
import type { MemberData } from '../types/member';
import { supabase, checkSupabaseOnline } from './supabaseClient';
import { liveStatsService } from './liveStats';

// NOTE: ID generation is handled exclusively by the Supabase RPC `get_next_member_id`.
// There is no frontend ID generation — the database is the only source of truth.

export const membersService = {
  join: async (data: Omit<MemberData, 'id' | 'createdAt'>): Promise<MemberData> => {
    console.log('[STEP 1] Form submit received for new member registration. Data:', data);
    
    // 1. Fetch secure, database-backed sequential unique ID
    const isOnline = await checkSupabaseOnline();
    if (!isOnline || !supabase) {
      throw new Error('Database is offline or not configured. Cannot process member registration.');
    }

    console.log('[STEP 2] Querying live database sequence via RPC get_next_member_id...');
    const { data: dbGeneratedId, error: rpcError } = await supabase.rpc('get_next_member_id', {
      p_district: data.workDistrict
    });

    if (rpcError || !dbGeneratedId) {
      console.error('[SUPABASE] Database ID generation failed:', rpcError);
      throw new Error(`Database sequential ID generation failed: ${rpcError?.message || 'Unknown'}`);
    }

    const member: MemberData = {
      ...data,
      id: dbGeneratedId,
      createdAt: new Date().toISOString(),
    };

    console.log('[STEP 3] Validation passed. Generated Database Member ID:', member.id);

    const cleanVal = (val: any, fallback: string): string => {
      if (val === null || val === undefined) return fallback;
      const s = String(val).trim();
      return s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' ? fallback : s;
    };

    const payload = {
      id: member.id,
      name: cleanVal(member.name, 'Anonymous'),
      mobile: cleanVal(member.mobile, '9999999999'),
      email: member.email || null,
      gender: member.gender || null,
      age: typeof member.age === 'number' ? member.age : (member.age ? parseInt(String(member.age)) : null),
      work_state: member.workState || null,
      work_district: cleanVal(member.workDistrict, 'Pune'),
      company_name: cleanVal(member.companyName, 'N/A'),
      industry_type: cleanVal(member.industryType, 'General'),
      worker_type: member.workerType || null,
      experience: member.experience ? parseInt(String(member.experience)) : null,
      status: member.status || 'pending'
    };

    console.log('[STEP 4] Payload prepared for public.members schema write:', payload);
    console.log('[STEP 5] Supabase insert started for members table...');

    const response = await supabase.from('members').insert([payload]);
    const { error, status, statusText } = response;
    
    console.log('[STEP 6] Response received from Supabase members insert:');
    console.log(' - HTTP Status:', status, statusText);
    console.log(' - Postgres Error:', error);
    console.log(' - Inserted Row ID:', member.id);

    if (error) {
      console.error('[SUPABASE] INSERT into members table FAILED! Postgres Error Details:', error);
      throw new Error(`Database insert failed: [${error.code}] ${error.message} (${error.details || 'no details'})`);
    }

    console.log('[SUPABASE] INSERT into members table SUCCESS! Row registered in Supabase Console.');

    // Cascade 1: Insert into public.audit_logs
    console.log('[SUPABASE] Cascade 1: Initiating audit log entry for member registration...');
    try {
      const auditRes = await supabase.from('audit_logs').insert([{
        admin_user: 'system',
        action: 'MEMBER_REGISTERED',
        target_id: member.id,
        new_value: `Union member registered successfully: ${payload.name}. District: ${payload.work_district}`,
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
    console.log('[SUPABASE] Cascade 2: Initiating notification queuing for member onboarding...');
    try {
      const msg = `नमस्कार ${payload.name}, आप भारतीय श्रमिक अधिकार संगठन (JanKam) के सदस्य बन गए हैं। आपका सदस्य क्रमांक: ${member.id} है।`;
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
    storageService.append(STORAGE_KEYS.MEMBERS, member);
    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch (e) {
      // ignore
    }
    return member;
  },

  softDelete: async (id: string): Promise<void> => {
    const list = storageService.get<MemberData>(STORAGE_KEYS.MEMBERS) || [];
    const updated = list.map(m => m.id === id ? { ...m, isDeleted: true, deletedAt: new Date().toISOString() } : m);
    storageService.set(STORAGE_KEYS.MEMBERS, updated);

    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        await supabase
          .from('members')
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase member soft delete sync failed:', e);
      }
    }
    try {
      liveStatsService.invalidate();
      window.dispatchEvent(new Event('jankam-data-update'));
    } catch {}
  },

  getAll: (): MemberData[] => {
    const list = storageService.get<MemberData>(STORAGE_KEYS.MEMBERS) || [];
    return list.filter(m => !m.isDeleted);
  },

  count: (): number => {
    return membersService.getAll().length;
  },
};

