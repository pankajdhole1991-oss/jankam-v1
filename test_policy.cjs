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

const supabase = createClient(url, key);

async function testPolicy() {
  console.log('Testing Notifications Insert...');
  const nRes = await supabase.from('notifications').insert([{
    recipient: '9999999999',
    type: 'WhatsApp',
    message: 'Test notification',
    status: 'pending'
  }]);
  console.log('Notifications status:', nRes.status, nRes.statusText);
  console.log('Notifications error:', nRes.error);

  console.log('\nTesting Audit Logs Insert...');
  const aRes = await supabase.from('audit_logs').insert([{
    admin_user: 'system',
    action: 'TEST_ACTION',
    target_id: 'JK-TEST-001',
    new_value: 'Test Details',
    ip_address: '127.0.0.1',
    browser: 'Chrome',
    device: 'Desktop'
  }]);
  console.log('Audit Logs status:', aRes.status, aRes.statusText);
  console.log('Audit Logs error:', aRes.error);
}

testPolicy();
