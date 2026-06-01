const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('[DIAGNOSTICS] Loading .env credentials...');
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const url = env['SUPABASE_URL'] ? env['SUPABASE_URL'].trim() : null;
const key = env['SUPABASE_ANON_KEY'] ? env['SUPABASE_ANON_KEY'].trim() : null;

if (!url || !key) {
  console.error('❌ Missing URL or ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const cleanVal = (val, fallback) => {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' ? fallback : s;
};

async function executeWorkflowTests() {
  const suffix = Date.now().toString().slice(-6);

  console.log('\n=============================================');
  console.log('WORKFLOW 1: MEMBER REGISTRATION & CASCADES');
  console.log('=============================================');
  
  const memberId = `JKM-DEBUG-${suffix}`;
  const memberPayload = {
    id: memberId,
    name: 'RAJESH_DEBUG_MEMBER',
    mobile: '8989898989',
    email: 'rajesh.member@debug.com',
    gender: 'Male',
    age: 28,
    work_state: 'Maharashtra',
    work_district: 'Pune',
    company_name: 'Debug Industries Ltd',
    industry_type: 'Manufacturing',
    worker_type: 'Contract Worker',
    experience: 5,
    status: 'active'
  };

  console.log('[STEP 1] Member Form submit received for RAJESH_DEBUG_MEMBER');
  console.log('[STEP 2] Validation passed. Generated Member ID:', memberId);
  console.log('[STEP 3] Payload prepared for public.members table:', memberPayload);
  console.log('[STEP 4] Supabase insert started for members table...');
  
  const mRes = await supabase.from('members').insert([memberPayload]);
  console.log('[STEP 5] Response received from Supabase members insert:');
  console.log(' - HTTP Status:', mRes.status, mRes.statusText);
  console.log(' - Postgres Error:', mRes.error);
  console.log(' - Inserted Row ID:', memberId);

  if (!mRes.error) {
    console.log('[SUPABASE] Cascade 1: Initiating audit log entry for member registration...');
    const auditPayload = {
      admin_user: 'system',
      action: 'MEMBER_REGISTERED',
      target_id: memberId,
      new_value: `Union member registered successfully: RAJESH_DEBUG_MEMBER. District: Pune`,
      ip_address: '192.168.43.102',
      browser: 'Google Chrome',
      device: 'Desktop Workstation'
    };
    console.log(' - Audit Log Payload:', auditPayload);
    const auditRes = await supabase.from('audit_logs').insert([auditPayload]);
    console.log(' - Audit Log Response status:', auditRes.status, auditRes.statusText);
    console.log(' - Audit Log Postgres Error:', auditRes.error);

    console.log('[SUPABASE] Cascade 2: Initiating notification entry for member onboarding...');
    const msg = `नमस्कार RAJESH_DEBUG_MEMBER, आप भारतीय श्रमिक अधिकार संगठन (JanKam) के सदस्य बन गए हैं। आपका सदस्य क्रमांक: ${memberId} है।`;
    const notifPayload = {
      recipient: '8989898989',
      type: 'WhatsApp',
      message: msg,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString()
    };
    console.log(' - Notification Payload:', notifPayload);
    const notifRes = await supabase.from('notifications').insert([notifPayload]);
    console.log(' - Notification Response status:', notifRes.status, notifRes.statusText);
    console.log(' - Notification Postgres Error:', notifRes.error);
  }

  console.log('\n=============================================');
  console.log('WORKFLOW 2: VOLUNTEER REGISTRATION & CASCADES');
  console.log('=============================================');
  
  const volunteerId = `JKL-DEBUG-${suffix}`;
  const volunteerPayload = {
    id: volunteerId,
    name: 'RAJESH_DEBUG_VOLUNTEER',
    mobile: '8989898989',
    email: 'rajesh.vol@debug.com',
    state: 'Maharashtra',
    district: 'Pune',
    industry_type: 'General',
    skills: ['Advocacy', 'Translation'],
    status: 'active'
  };

  console.log('[STEP 1] Volunteer Form submit received for RAJESH_DEBUG_VOLUNTEER');
  console.log('[STEP 2] Validation passed. Generated Volunteer ID:', volunteerId);
  console.log('[STEP 3] Payload prepared for public.volunteers table:', volunteerPayload);
  console.log('[STEP 4] Supabase insert started for volunteers table...');
  
  const vRes = await supabase.from('volunteers').insert([volunteerPayload]);
  console.log('[STEP 5] Response received from Supabase volunteers insert:');
  console.log(' - HTTP Status:', vRes.status, vRes.statusText);
  console.log(' - Postgres Error:', vRes.error);
  console.log(' - Inserted Row ID:', volunteerId);

  if (!vRes.error) {
    console.log('[SUPABASE] Cascade 1: Initiating audit log entry for volunteer registration...');
    const auditPayload = {
      admin_user: 'system',
      action: 'VOLUNTEER_REGISTERED',
      target_id: volunteerId,
      new_value: `Volunteer registered successfully: RAJESH_DEBUG_VOLUNTEER. District: Pune`,
      ip_address: '192.168.43.102',
      browser: 'Google Chrome',
      device: 'Desktop Workstation'
    };
    console.log(' - Audit Log Payload:', auditPayload);
    const auditRes = await supabase.from('audit_logs').insert([auditPayload]);
    console.log(' - Audit Log Response status:', auditRes.status, auditRes.statusText);
    console.log(' - Audit Log Postgres Error:', auditRes.error);

    console.log('[SUPABASE] Cascade 2: Initiating notification entry for volunteer onboarding...');
    const msg = `नमस्कार RAJESH_DEBUG_VOLUNTEER, JanKam में वॉलंटियर के रूप में आपका आवेदन प्राप्त हो गया है। आपका वॉलंटियर आईडी: ${volunteerId} है।`;
    const notifPayload = {
      recipient: '8989898989',
      type: 'WhatsApp',
      message: msg,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString()
    };
    console.log(' - Notification Payload:', notifPayload);
    const notifRes = await supabase.from('notifications').insert([notifPayload]);
    console.log(' - Notification Response status:', notifRes.status, notifRes.statusText);
    console.log(' - Notification Postgres Error:', notifRes.error);
  }

  console.log('\n=============================================');
  console.log('VERIFYING WRITE AND PERSISTENCE STATUS');
  console.log('=============================================');
  
  console.log('[QUERY] Querying public.members table...');
  const memberQuery = await supabase.from('members').select('*').eq('name', 'RAJESH_DEBUG_MEMBER');
  console.log(' - Members Query Status:', memberQuery.status, memberQuery.statusText);
  console.log(' - Members Query Error:', memberQuery.error);
  console.log(' - Members Query Data:', memberQuery.data);

  console.log('\n[QUERY] Querying public.volunteers table...');
  const volunteerQuery = await supabase.from('volunteers').select('*').eq('name', 'RAJESH_DEBUG_VOLUNTEER');
  console.log(' - Volunteers Query Status:', volunteerQuery.status, volunteerQuery.statusText);
  console.log(' - Volunteers Query Error:', volunteerQuery.error);
  console.log(' - Volunteers Query Data:', volunteerQuery.data);
}

executeWorkflowTests().catch(console.error);
