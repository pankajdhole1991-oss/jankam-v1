// ============================================================
// JANKAM — Full E2E Registration Verification (Fixed)
// No .select() after insert — avoids RETURNING * hitting SELECT RLS
// ============================================================
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) env[match[1]] = match[2];
});

const SUPABASE_URL = env['SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_ANON_KEY'];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Anon Key Length:', SUPABASE_KEY.length);

async function run() {
  // ──────────────────────────────────────────────
  // STEP 1: RPC — get_next_member_id
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log(' STEP 1: RPC get_next_member_id(Pune)');
  console.log('════════════════════════════════════════════');

  const { data: memberId, error: memberIdErr } = await supabase.rpc('get_next_member_id', { p_district: 'Pune' });
  console.log('RPC Response → memberId:', memberId);
  console.log('RPC Error    :', JSON.stringify(memberIdErr, null, 2));
  if (memberIdErr || !memberId) { console.error('❌ RPC failed. Aborting.'); process.exit(1); }

  // ──────────────────────────────────────────────
  // STEP 2: RPC — get_next_volunteer_id
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log(' STEP 2: RPC get_next_volunteer_id()');
  console.log('════════════════════════════════════════════');

  const { data: volunteerId, error: volunteerIdErr } = await supabase.rpc('get_next_volunteer_id');
  console.log('RPC Response → volunteerId:', volunteerId);
  console.log('RPC Error    :', JSON.stringify(volunteerIdErr, null, 2));
  if (volunteerIdErr || !volunteerId) { console.error('❌ RPC failed. Aborting.'); process.exit(1); }

  // ──────────────────────────────────────────────
  // STEP 3: INSERT into public.members
  // NOTE: No .select() — avoids RETURNING * hitting SELECT RLS (USING false)
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log(' STEP 3: INSERT RAJESH_DEBUG_MEMBER');
  console.log(' ID:', memberId);
  console.log('════════════════════════════════════════════');

  const memberPayload = {
    id: memberId,
    name: 'RAJESH_DEBUG_MEMBER',
    mobile: '8989898989',
    email: 'rajesh.debug@jankam.test',
    gender: 'Male',
    age: 30,
    work_state: 'Maharashtra',
    work_district: 'Pune',
    company_name: 'Debug Industries Ltd',
    industry_type: 'Manufacturing',
    worker_type: 'Contract Worker',
    status: 'active'
  };

  console.log('\n📤 Payload:', JSON.stringify(memberPayload, null, 2));

  const memberRes = await supabase.from('members').insert([memberPayload]);

  console.log('\n📥 Full Supabase Response:');
  console.log('  HTTP Status  :', memberRes.status, memberRes.statusText);
  console.log('  error.code   :', memberRes.error?.code   ?? 'null');
  console.log('  error.message:', memberRes.error?.message ?? 'null');
  console.log('  error.details:', memberRes.error?.details ?? 'null');
  console.log('  error.hint   :', memberRes.error?.hint    ?? 'null');
  console.log('  data         :', JSON.stringify(memberRes.data, null, 2));

  const memberOk = !memberRes.error && (memberRes.status === 201 || memberRes.status === 200);

  if (!memberOk) {
    console.error('\n❌ MEMBER INSERT FAILED — full error object:');
    console.error(JSON.stringify(memberRes.error, null, 2));
  } else {
    console.log('\n✅ MEMBER INSERT SUCCESS — HTTP', memberRes.status);
  }

  // ──────────────────────────────────────────────
  // STEP 4: INSERT into public.volunteers
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log(' STEP 4: INSERT RAJESH_DEBUG_VOLUNTEER');
  console.log(' ID:', volunteerId);
  console.log('════════════════════════════════════════════');

  const volunteerPayload = {
    id: volunteerId,
    name: 'RAJESH_DEBUG_VOLUNTEER',
    mobile: '8989898990',
    email: 'rajesh.volunteer@jankam.test',
    state: 'Maharashtra',
    district: 'Pune',
    industry_type: 'General',
    skills: ['Advocacy', 'Translation'],
    status: 'active'
  };

  console.log('\n📤 Payload:', JSON.stringify(volunteerPayload, null, 2));

  const volunteerRes = await supabase.from('volunteers').insert([volunteerPayload]);

  console.log('\n📥 Full Supabase Response:');
  console.log('  HTTP Status  :', volunteerRes.status, volunteerRes.statusText);
  console.log('  error.code   :', volunteerRes.error?.code    ?? 'null');
  console.log('  error.message:', volunteerRes.error?.message  ?? 'null');
  console.log('  error.details:', volunteerRes.error?.details  ?? 'null');
  console.log('  error.hint   :', volunteerRes.error?.hint     ?? 'null');
  console.log('  data         :', JSON.stringify(volunteerRes.data, null, 2));

  const volunteerOk = !volunteerRes.error && (volunteerRes.status === 201 || volunteerRes.status === 200);

  if (!volunteerOk) {
    console.error('\n❌ VOLUNTEER INSERT FAILED — full error object:');
    console.error(JSON.stringify(volunteerRes.error, null, 2));
  } else {
    console.log('\n✅ VOLUNTEER INSERT SUCCESS — HTTP', volunteerRes.status);
  }

  // ──────────────────────────────────────────────
  // STEP 5: Cascade inserts — audit_logs + notifications
  // (Only if primary inserts succeeded)
  // ──────────────────────────────────────────────
  let memberAuditId = null;
  let memberNotifId = null;
  let volunteerAuditId = null;
  let volunteerNotifId = null;

  if (memberOk) {
    console.log('\n════════════════════════════════════════════');
    console.log(' STEP 5a: Insert member audit_log entry');
    console.log('════════════════════════════════════════════');
    const auditMRes = await supabase.from('audit_logs').insert([{
      admin_user: 'system',
      action: 'MEMBER_REGISTERED',
      target_id: memberId,
      new_value: `Union member registered: RAJESH_DEBUG_MEMBER. District: Pune`,
      ip_address: '127.0.0.1',
      browser: 'NodeJS Test',
      device: 'Server'
    }]).select('id, created_at');
    console.log('  HTTP Status :', auditMRes.status, auditMRes.statusText);
    console.log('  Error       :', JSON.stringify(auditMRes.error, null, 2));
    console.log('  Data        :', JSON.stringify(auditMRes.data, null, 2));
    if (!auditMRes.error && auditMRes.data?.[0]) memberAuditId = auditMRes.data[0];

    console.log('\n════════════════════════════════════════════');
    console.log(' STEP 5b: Insert member notification entry');
    console.log('════════════════════════════════════════════');
    const notifMRes = await supabase.from('notifications').insert([{
      recipient: '8989898989',
      type: 'WhatsApp',
      message: `नमस्कार RAJESH_DEBUG_MEMBER, JanKam सदस्य आईडी: ${memberId}`,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString()
    }]).select('id, created_at');
    console.log('  HTTP Status :', notifMRes.status, notifMRes.statusText);
    console.log('  Error       :', JSON.stringify(notifMRes.error, null, 2));
    console.log('  Data        :', JSON.stringify(notifMRes.data, null, 2));
    if (!notifMRes.error && notifMRes.data?.[0]) memberNotifId = notifMRes.data[0];
  }

  if (volunteerOk) {
    console.log('\n════════════════════════════════════════════');
    console.log(' STEP 5c: Insert volunteer audit_log entry');
    console.log('════════════════════════════════════════════');
    const auditVRes = await supabase.from('audit_logs').insert([{
      admin_user: 'system',
      action: 'VOLUNTEER_REGISTERED',
      target_id: volunteerId,
      new_value: `Volunteer registered: RAJESH_DEBUG_VOLUNTEER. District: Pune`,
      ip_address: '127.0.0.1',
      browser: 'NodeJS Test',
      device: 'Server'
    }]).select('id, created_at');
    console.log('  HTTP Status :', auditVRes.status, auditVRes.statusText);
    console.log('  Error       :', JSON.stringify(auditVRes.error, null, 2));
    console.log('  Data        :', JSON.stringify(auditVRes.data, null, 2));
    if (!auditVRes.error && auditVRes.data?.[0]) volunteerAuditId = auditVRes.data[0];

    console.log('\n════════════════════════════════════════════');
    console.log(' STEP 5d: Insert volunteer notification');
    console.log('════════════════════════════════════════════');
    const notifVRes = await supabase.from('notifications').insert([{
      recipient: '8989898990',
      type: 'WhatsApp',
      message: `नमस्कार RAJESH_DEBUG_VOLUNTEER, JanKam वॉलंटियर आईडी: ${volunteerId}`,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString()
    }]).select('id, created_at');
    console.log('  HTTP Status :', notifVRes.status, notifVRes.statusText);
    console.log('  Error       :', JSON.stringify(notifVRes.error, null, 2));
    console.log('  Data        :', JSON.stringify(notifVRes.data, null, 2));
    if (!notifVRes.error && notifVRes.data?.[0]) volunteerNotifId = notifVRes.data[0];
  }

  // ──────────────────────────────────────────────
  // FINAL PROOF SUMMARY
  // ──────────────────────────────────────────────
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          JANKAM E2E VERIFICATION PROOF               ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log('━━━ MEMBER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Name              :', 'RAJESH_DEBUG_MEMBER');
  console.log('  Mobile            :', '8989898989');
  console.log('  Generated ID (DB) :', memberId);
  console.log('  ID Source         :', 'Supabase RPC get_next_member_id() — NO localStorage');
  console.log('  HTTP Status       :', memberRes.status, memberRes.statusText);
  console.log('  Insert Result     :', memberOk ? '✅ SUCCESS' : '❌ FAILED');
  console.log('  Audit Log Row     :', memberAuditId ? JSON.stringify(memberAuditId) : (memberOk ? 'see error above' : 'skipped'));
  console.log('  Notification Row  :', memberNotifId ? JSON.stringify(memberNotifId) : (memberOk ? 'see error above' : 'skipped'));
  console.log('');
  console.log('━━━ VOLUNTEER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Name              :', 'RAJESH_DEBUG_VOLUNTEER');
  console.log('  Mobile            :', '8989898990');
  console.log('  Generated ID (DB) :', volunteerId);
  console.log('  ID Source         :', 'Supabase RPC get_next_volunteer_id() — NO localStorage');
  console.log('  HTTP Status       :', volunteerRes.status, volunteerRes.statusText);
  console.log('  Insert Result     :', volunteerOk ? '✅ SUCCESS' : '❌ FAILED');
  console.log('  Audit Log Row     :', volunteerAuditId ? JSON.stringify(volunteerAuditId) : (volunteerOk ? 'see error above' : 'skipped'));
  console.log('  Notification Row  :', volunteerNotifId ? JSON.stringify(volunteerNotifId) : (volunteerOk ? 'see error above' : 'skipped'));
  console.log('');
  console.log('━━━ CONFIRMATIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  localStorage fallback   : ✅ NOT USED — DB is sole source of truth');
  console.log('  Duplicate key conflicts : ' + (memberOk && volunteerOk ? '✅ NONE — IDs generated from live DB state' : '⚠ Check errors above'));
  console.log('');

  if (!memberOk || !volunteerOk) process.exit(1);
}

run().catch(err => {
  console.error('\n💥 Fatal crash:', err.message || err);
  process.exit(1);
});
