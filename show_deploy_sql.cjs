// Deploy registration_rpc.sql to Supabase via Management API
const fs = require('fs');
const path = require('path');
const https = require('https');

const sql = fs.readFileSync(path.join(__dirname, 'registration_rpc.sql'), 'utf8');

// Extract project ref from env
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) env[match[1]] = match[2];
});

const supabaseUrl = env['SUPABASE_URL']; // e.g. https://teajhickwuhxpzrxjimk.supabase.co
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]; // teajhickwuhxpzrxjimk

console.log('Project Ref:', projectRef);
console.log('SQL to deploy:\n', sql);
console.log('\n--- IMPORTANT ---');
console.log('The Supabase Management API requires a SERVICE_ROLE or Management API token.');
console.log('Anon key cannot deploy functions via Management API.');
console.log('\nPlease manually execute the following SQL in your Supabase SQL Editor:');
console.log('URL: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
console.log('\n' + '='.repeat(60));
console.log(sql);
console.log('='.repeat(60));
