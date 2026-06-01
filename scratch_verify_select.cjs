const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env['SUPABASE_URL'], env['SUPABASE_ANON_KEY']);

async function verifySelect() {
  console.log('--- 1. FETCH MEMBERS DIRECT QUERY ---');
  const mRes = await supabase.from('members').select('*');
  console.log('HTTP Status   :', mRes.status, mRes.statusText);
  console.log('Error         :', mRes.error);
  console.log('Rows Returned :', mRes.data?.length);
  console.log('Sample Data   :', JSON.stringify(mRes.data, null, 2));

  console.log('\n--- 2. FETCH VOLUNTEERS DIRECT QUERY ---');
  const vRes = await supabase.from('volunteers').select('*');
  console.log('HTTP Status   :', vRes.status, vRes.statusText);
  console.log('Error         :', vRes.error);
  console.log('Rows Returned :', vRes.data?.length);
  console.log('Sample Data   :', JSON.stringify(vRes.data, null, 2));
}

verifySelect().catch(console.error);
