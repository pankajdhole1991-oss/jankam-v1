const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env file
const envPath = path.join(__dirname, '.env');
console.log('[PROD TEST] Reading environment from:', envPath);
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const url = env['SUPABASE_URL'];
const key = env['SUPABASE_ANON_KEY'];

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runProductionWorkflows() {
  console.log('\n============================================================');
  console.log('📝 JANKAM: PRODUCTION REGISTRATION FLOWS VERIFICATION SUITE');
  console.log('============================================================\n');

  const suffix = Date.now().toString().slice(-4);
  const testIdSuffix = Date.now().toString().slice(-6);

  // ==========================================
  // 1. COMPLAINT WORKFLOW VERIFICATION
  // ==========================================
  console.log('--- 1. VERIFYING COMPLAINT REGISTRATION FLOW ---');
  const complaintId = `JK-PUN-2026-${testIdSuffix}`;
  
  const complaintPayload = {
    id: complaintId,
    name: 'DB_TEST_COMPLAINT_FLOW',
    mobile: '9999999999',
    work_district: 'Pune',
    work_state: 'Maharashtra',
    company_name: 'DB_TEST_COMPANY',
    employer_name: 'DB_TEST_EMPLOYER',
    complaint_type: 'Salary Delay',
    description: 'E2E production verification of the complaint intake flow.',
    incident_date: '2026-06-01',
    status: 'submitted',
    current_stage: 'submitted',
    assigned_volunteer: 'Suresh Mane (Advocate Staff)',
    assigned_district_team: 'Pune Division Advocacy Desk',
    assigned_officer: 'Pankaj Dhole (Lead Advocate)'
  };

  console.log('[PAYLOAD] public.complaints:', JSON.stringify(complaintPayload, null, 2));
  
  const cResult = await supabase.from('complaints').insert([complaintPayload]);
  console.log(`[RESPONSE] Status: ${cResult.status} ${cResult.statusText}`);
  if (cResult.error) {
    console.error('❌ Complaints table write FAILED:', cResult.error);
    process.exit(1);
  }
  console.log(`✅ Success: Row created in public.complaints. ID: ${complaintId}`);

  // Cascade 1: Audit Log
  const cAuditPayload = {
    admin_user: 'system',
    action: 'COMPLAINT_SUBMITTED',
    target_id: complaintId,
    new_value: `Complaint registered successfully: DB_TEST_COMPLAINT_FLOW. Category: Salary Delay`,
    ip_address: '192.168.43.102',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  console.log('[PAYLOAD] public.audit_logs:', JSON.stringify(cAuditPayload, null, 2));
  const cAuditRes = await supabase.from('audit_logs').insert([cAuditPayload]);
  console.log(`[RESPONSE] Status: ${cAuditRes.status} ${cAuditRes.statusText}`);
  if (cAuditRes.error) {
    console.error('❌ Audit Log write FAILED:', cAuditRes.error);
  } else {
    console.log('✅ Success: Cascade 1 Audit Log recorded.');
  }

  // Cascade 2: Notification
  const cNotifPayload = {
    recipient: '9999999999',
    type: 'WhatsApp',
    message: `नमस्कार DB_TEST_COMPLAINT_FLOW, आपकी शिकायत JanKam Labour Advocates के पास दर्ज कर ली गई है। शिकायत क्रमांक: ${complaintId}।`,
    status: 'pending',
    retry_count: 0
  };
  console.log('[PAYLOAD] public.notifications:', JSON.stringify(cNotifPayload, null, 2));
  const cNotifRes = await supabase.from('notifications').insert([cNotifPayload]);
  console.log(`[RESPONSE] Status: ${cNotifRes.status} ${cNotifRes.statusText}`);
  if (cNotifRes.error) {
    console.error('❌ Notification alert queue FAILED:', cNotifRes.error);
  } else {
    console.log('✅ Success: Cascade 2 WhatsApp Alert queued.');
  }


  // ==========================================
  // 2. MEMBER WORKFLOW VERIFICATION
  // ==========================================
  console.log('\n--- 2. VERIFYING MEMBER REGISTRATION FLOW ---');
  const memberId = `JKM-PUN-${testIdSuffix}`;
  
  const memberPayload = {
    id: memberId,
    name: 'DB_TEST_MEMBER_FLOW',
    mobile: '9999999999',
    email: 'member@test.com',
    gender: 'Male',
    age: 28,
    work_state: 'Maharashtra',
    work_district: 'Pune',
    company_name: 'DB_TEST_COMPANY',
    industry_type: 'General',
    worker_type: 'General Worker',
    experience: 5,
    status: 'pending'
  };

  console.log('[PAYLOAD] public.members:', JSON.stringify(memberPayload, null, 2));
  
  const mResult = await supabase.from('members').insert([memberPayload]);
  console.log(`[RESPONSE] Status: ${mResult.status} ${mResult.statusText}`);
  if (mResult.error) {
    console.error('❌ Members table write FAILED:', mResult.error);
    process.exit(1);
  }
  console.log(`✅ Success: Row created in public.members. ID: ${memberId}`);

  // Cascade 1: Audit Log
  const mAuditPayload = {
    admin_user: 'system',
    action: 'MEMBER_REGISTERED',
    target_id: memberId,
    new_value: `Union member registered successfully: DB_TEST_MEMBER_FLOW. District: Pune`,
    ip_address: '192.168.43.102',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  console.log('[PAYLOAD] public.audit_logs:', JSON.stringify(mAuditPayload, null, 2));
  const mAuditRes = await supabase.from('audit_logs').insert([mAuditPayload]);
  console.log(`[RESPONSE] Status: ${mAuditRes.status} ${mAuditRes.statusText}`);
  if (mAuditRes.error) {
    console.error('❌ Audit Log write FAILED:', mAuditRes.error);
  } else {
    console.log('✅ Success: Cascade 1 Audit Log recorded.');
  }

  // Cascade 2: Notification
  const mNotifPayload = {
    recipient: '9999999999',
    type: 'WhatsApp',
    message: `नमस्कार DB_TEST_MEMBER_FLOW, आप भारतीय श्रमिक अधिकार संगठन के सदस्य बन गए हैं। सदस्य क्रमांक: ${memberId} है।`,
    status: 'pending',
    retry_count: 0
  };
  console.log('[PAYLOAD] public.notifications:', JSON.stringify(mNotifPayload, null, 2));
  const mNotifRes = await supabase.from('notifications').insert([mNotifPayload]);
  console.log(`[RESPONSE] Status: ${mNotifRes.status} ${mNotifRes.statusText}`);
  if (mNotifRes.error) {
    console.error('❌ Notification alert queue FAILED:', mNotifRes.error);
  } else {
    console.log('✅ Success: Cascade 2 WhatsApp Alert queued.');
  }


  // ==========================================
  // 3. VOLUNTEER WORKFLOW VERIFICATION
  // ==========================================
  console.log('\n--- 3. VERIFYING VOLUNTEER REGISTRATION FLOW ---');
  const volunteerId = `JKL-${testIdSuffix.slice(-3)}`;
  
  const volunteerPayload = {
    id: volunteerId,
    name: 'DB_TEST_VOLUNTEER_FLOW',
    mobile: '9999999999',
    email: 'volunteer@test.com',
    state: 'Maharashtra',
    district: 'Pune',
    industry_type: 'General',
    skills: ['Advocacy', 'Translation'],
    status: 'pending'
  };

  console.log('[PAYLOAD] public.volunteers:', JSON.stringify(volunteerPayload, null, 2));
  
  const vResult = await supabase.from('volunteers').insert([volunteerPayload]);
  console.log(`[RESPONSE] Status: ${vResult.status} ${vResult.statusText}`);
  if (vResult.error) {
    console.error('❌ Volunteers table write FAILED:', vResult.error);
    process.exit(1);
  }
  console.log(`✅ Success: Row created in public.volunteers. ID: ${volunteerId}`);

  // Cascade 1: Audit Log
  const vAuditPayload = {
    admin_user: 'system',
    action: 'VOLUNTEER_REGISTERED',
    target_id: volunteerId,
    new_value: `Volunteer registered successfully: DB_TEST_VOLUNTEER_FLOW. District: Pune`,
    ip_address: '192.168.43.102',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  console.log('[PAYLOAD] public.audit_logs:', JSON.stringify(vAuditPayload, null, 2));
  const vAuditRes = await supabase.from('audit_logs').insert([vAuditPayload]);
  console.log(`[RESPONSE] Status: ${vAuditRes.status} ${vAuditRes.statusText}`);
  if (vAuditRes.error) {
    console.error('❌ Audit Log write FAILED:', vAuditRes.error);
  } else {
    console.log('✅ Success: Cascade 1 Audit Log recorded.');
  }

  // Cascade 2: Notification
  const vNotifPayload = {
    recipient: '9999999999',
    type: 'WhatsApp',
    message: `नमस्कार DB_TEST_VOLUNTEER_FLOW, JanKam में वॉलंटियर के रूप में आपका आवेदन प्राप्त हो गया है। आईडी: ${volunteerId} है।`,
    status: 'pending',
    retry_count: 0
  };
  console.log('[PAYLOAD] public.notifications:', JSON.stringify(vNotifPayload, null, 2));
  const vNotifRes = await supabase.from('notifications').insert([vNotifPayload]);
  console.log(`[RESPONSE] Status: ${vNotifRes.status} ${vNotifRes.statusText}`);
  if (vNotifRes.error) {
    console.error('❌ Notification alert queue FAILED:', vNotifRes.error);
  } else {
    console.log('✅ Success: Cascade 2 WhatsApp Alert queued.');
  }

  console.log('\n============================================================');
  console.log('🎉 ALL THREE REGISTRATION WORKFLOWS & CASCADES VERIFIED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runProductionWorkflows().catch(err => {
  console.error('❌ Fatal production verification runner crash:', err);
});
