const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Mock localStorage for node context
global.localStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null
};

// Mock window and navigator for node context
global.window = {
  dispatchEvent: () => {}
};
global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Google Chrome'
};
global.Event = class {};

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

process.env.VITE_SUPABASE_URL = env['SUPABASE_URL']?.trim();
process.env.VITE_SUPABASE_ANON_KEY = env['SUPABASE_ANON_KEY']?.trim();

// Import services dynamically after setting env
const { membersService } = require('./src/services/members.ts');
const { leadershipService } = require('./src/services/leadership.ts');
const { complaintsService } = require('./src/services/complaints.ts');

async function testRuntime() {
  const suffix = Date.now().toString().slice(-6);
  
  console.log('\n--- 1. Testing Member Service Ingestion ---');
  try {
    const member = await membersService.join({
      name: 'RAJESH_DEBUG_MEMBER',
      mobile: '8989898989',
      email: 'rajesh.member@debug.com',
      gender: 'Male',
      age: 28,
      homeState: 'Maharashtra',
      homeDistrict: 'Mumbai',
      workState: 'Maharashtra',
      workDistrict: 'Pune',
      industryType: 'Manufacturing',
      workerType: 'Contract Worker',
      educationLevel: 'High School',
      preferredLanguage: 'Hindi',
      companyName: 'Debug Industries Ltd',
      occupation: 'Assembler',
      experience: '5',
      emergencyName: 'Emergency Contact Rajesh',
      emergencyMobile: '9898989898'
    });
    console.log('Member registration call complete. Member ID:', member.id);
  } catch (e) {
    console.error('Member registration threw error:', e);
  }

  console.log('\n--- 2. Testing Volunteer Service Ingestion ---');
  try {
    const volunteer = await leadershipService.apply({
      name: 'RAJESH_DEBUG_VOLUNTEER',
      mobile: '8989898989',
      email: 'rajesh.vol@debug.com',
      state: 'Maharashtra',
      district: 'Pune',
      industryType: 'General',
      workerType: 'Social Work',
      educationLevel: 'Graduate',
      preferredLanguage: 'English',
      skills: ['Advocacy', 'Translation'],
      emergencyName: 'Emergency Contact Rajesh',
      emergencyMobile: '9898989898',
      status: 'pending'
    });
    console.log('Volunteer application call complete. Volunteer ID:', volunteer.id);
  } catch (e) {
    console.error('Volunteer application threw error:', e);
  }
}

testRuntime().catch(console.error);
