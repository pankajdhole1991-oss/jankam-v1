const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function verifyWrites() {
  const testIdSuffix = Date.now().toString().slice(-6);
  
  // 1. Complaint Write
  const complaintId = `JK-VERIFY-${testIdSuffix}`;
  console.log(`[ACTION] Submitting test complaint row with ID: ${complaintId}...`);
  const complaintPayload = {
    id: complaintId,
    name: 'DB_TEST_COMPLAINT',
    mobile: '9999999999',
    work_district: 'Pune',
    work_state: 'Maharashtra',
    company_name: 'DB_TEST_COMPANY',
    employer_name: 'DB_TEST_EMPLOYER',
    complaint_type: 'Salary Delay',
    description: 'Direct end-to-end verification write for database schema constraints.',
    incident_date: '2026-06-01',
    status: 'submitted',
    current_stage: 'submitted'
  };
  
  const cResult = await supabase.from('complaints').insert([complaintPayload]);
  console.log('--- COMPLAINTS WRITE RESULT ---');
  console.log('HTTP Status:', cResult.status, cResult.statusText);
  console.log('Postgres Error:', cResult.error);
  console.log('Record inserted successfully:', cResult.status === 201 && cResult.error === null);
  
  // 2. Member Write
  const memberId = `JKM-VERIFY-${testIdSuffix}`;
  console.log(`\n[ACTION] Submitting test member row with ID: ${memberId}...`);
  const memberPayload = {
    id: memberId,
    name: 'DB_TEST_MEMBER',
    mobile: '9999999999',
    work_district: 'Pune',
    work_state: 'Maharashtra',
    company_name: 'DB_TEST_COMPANY',
    industry_type: 'General',
    status: 'pending'
  };
  
  const mResult = await supabase.from('members').insert([memberPayload]);
  console.log('--- MEMBERS WRITE RESULT ---');
  console.log('HTTP Status:', mResult.status, mResult.statusText);
  console.log('Postgres Error:', mResult.error);
  console.log('Record inserted successfully:', mResult.status === 201 && mResult.error === null);
  
  // 3. Volunteer Write
  const volunteerId = `JKL-VERIFY-${testIdSuffix}`;
  console.log(`\n[ACTION] Submitting test volunteer row with ID: ${volunteerId}...`);
  const volunteerPayload = {
    id: volunteerId,
    name: 'DB_TEST_VOLUNTEER',
    mobile: '9999999999',
    district: 'Pune',
    state: 'Maharashtra',
    industry_type: 'General',
    status: 'pending',
    skills: ['Advocacy']
  };
  
  const vResult = await supabase.from('volunteers').insert([volunteerPayload]);
  console.log('--- VOLUNTEERS WRITE RESULT ---');
  console.log('HTTP Status:', vResult.status, vResult.statusText);
  console.log('Postgres Error:', vResult.error);
  console.log('Record inserted successfully:', vResult.status === 201 && vResult.error === null);

  console.log('\n--- VERIFICATION EVIDENCE SUMMARY ---');
  console.log(`Complaint Row ID: ${complaintId} | Created At: ${new Date().toISOString()}`);
  console.log(`Member Row ID: ${memberId} | Created At: ${new Date().toISOString()}`);
  console.log(`Volunteer Row ID: ${volunteerId} | Created At: ${new Date().toISOString()}`);
}

verifyWrites().catch(console.error);
