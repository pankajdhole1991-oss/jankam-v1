const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env');
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
  console.error('❌ Missing URL or ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function inspect() {
  console.log('Connecting to Supabase...');
  
  const tables = ['complaints', 'members', 'volunteers', 'districts'];
  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table "${t}": error:`, error.message);
      } else {
        console.log(`Table "${t}": exists! Row count = ${count}`);
      }
    } catch (e) {
      console.log(`Table "${t}": threw exception:`, e.message);
    }
  }
  
  // Let's also see if we can query complaints, members, volunteers and check their districts
  console.log('\n--- COMPLAINTS BY DISTRICT ---');
  const { data: compData } = await supabase.from('complaints').select('work_district, status');
  const compCounts = {};
  (compData || []).forEach(r => {
    const d = r.work_district || 'unknown';
    compCounts[d] = compCounts[d] || { total: 0, resolved: 0 };
    compCounts[d].total++;
    if (r.status === 'resolved') compCounts[d].resolved++;
  });
  console.log(compCounts);

  console.log('\n--- MEMBERS BY DISTRICT ---');
  const { data: memData } = await supabase.from('members').select('work_district');
  const memCounts = {};
  (memData || []).forEach(r => {
    const d = r.work_district || 'unknown';
    memCounts[d] = (memCounts[d] || 0) + 1;
  });
  console.log(memCounts);

  console.log('\n--- VOLUNTEERS BY DISTRICT ---');
  const { data: volData } = await supabase.from('volunteers').select('district');
  const volCounts = {};
  (volData || []).forEach(r => {
    const d = r.district || 'unknown';
    volCounts[d] = (volCounts[d] || 0) + 1;
  });
  console.log(volCounts);
}

inspect().catch(console.error);
