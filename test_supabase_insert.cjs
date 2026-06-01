// ============================================
// JanKam — Live Supabase Write Diagnostics Test (CJS)
// ============================================
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('[DIAGNOSTICS] Loading .env credentials...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

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
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env!');
  console.log('Parsed env keys:', Object.keys(env));
  process.exit(1);
}

console.log('✅ Supabase URL:', url);
console.log('✅ Supabase Key Length:', key.length);

const supabase = createClient(url, key);

async function runTests() {
  const testIdSuffix = Date.now().toString().slice(-6);

  console.log('\n--- 1. Testing Complaints Insert ---');
  const complaintPayload = {
    id: `JK-TEST-${testIdSuffix}`,
    name: 'DB_TEST_COMPLAINT',
    mobile: '9999999999',
    work_district: 'Pune',
    work_state: 'Maharashtra',
    company_name: 'DB_TEST_COMPANY',
    employer_name: 'DB_TEST_EMPLOYER',
    complaint_type: 'Salary Delay',
    description: 'Temporary diagnostic complaint database write verification row.',
    incident_date: '2026-06-01',
    status: 'submitted',
    current_stage: 'submitted'
  };

  const cResult = await supabase.from('complaints').insert([complaintPayload]);
  console.log('Complaints Insert Status:', cResult.status, cResult.statusText);
  console.log('Complaints Insert Error:', cResult.error);

  console.log('\n--- 2. Testing Members Insert ---');
  const memberPayload = {
    id: `JKM-TEST-${testIdSuffix}`,
    name: 'DB_TEST_MEMBER',
    mobile: '9999999999',
    work_district: 'Pune',
    work_state: 'Maharashtra',
    company_name: 'DB_TEST_COMPANY',
    industry_type: 'General',
    status: 'pending'
  };

  const mResult = await supabase.from('members').insert([memberPayload]);
  console.log('Members Insert Status:', mResult.status, mResult.statusText);
  console.log('Members Insert Error:', mResult.error);

  console.log('\n--- 3. Testing Volunteers Insert ---');
  const volunteerPayload = {
    id: `JKL-TEST-${testIdSuffix}`,
    name: 'DB_TEST_VOLUNTEER',
    mobile: '9999999999',
    district: 'Pune',
    state: 'Maharashtra',
    industry_type: 'General',
    status: 'pending',
    skills: ['Advocacy', 'Translation']
  };

  const vResult = await supabase.from('volunteers').insert([volunteerPayload]);
  console.log('Volunteers Insert Status:', vResult.status, vResult.statusText);
  console.log('Volunteers Insert Error:', vResult.error);
}

runTests().catch(err => {
  console.error('Fatal crash during tests:', err);
});
