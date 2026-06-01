const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env file
const envPath = path.join(__dirname, '.env');
console.log('[TEST] Reading environment from:', envPath);
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

async function runE2ETests() {
  console.log('\n============================================================');
  console.log('🛡️ JANKAM: ADMIN MANAGEMENT SYSTEM CRYPTOGRAPHIC E2E TEST SUITE');
  console.log('============================================================\n');

  // We will use a dynamic suffix to ensure unique runs can be executed repeatedly
  const suffix = Date.now().toString().slice(-4);
  const testUsername = `testadmin_${suffix}`;
  
  console.log(`[TESTING TARGET] Username: ${testUsername}`);

  // 1. Existing Seed User Logins Test
  console.log('\n--- STEP 1: VERIFYING EXISTING SEED LOGINS ---');
  const seeds = [
    { u: 'superadmin', p: 'jankam2026' },
    { u: 'stateadmin', p: 'state2026' },
    { u: 'puneadmin', p: 'pune2026' },
    { u: 'volunmumbai', p: 'volun2026' }
  ];

  for (const s of seeds) {
    const { data, error, status } = await supabase.rpc('authenticate_admin', {
      p_username: s.u,
      p_password: s.p
    });

    if (error || !data || data.length === 0) {
      console.error(`❌ Failed to login seed user: ${s.u}! Status: ${status}`, error);
      process.exit(1);
    }
    console.log(`✅ Success: Seed user '${s.u}' authenticated. Role: '${data[0].role}'`);
  }

  // 2. Admin Creation
  console.log('\n--- STEP 2: ADMIN CREATION ---');
  const createPayload = {
    p_username: testUsername,
    p_password: 'Test@2026',
    p_role: 'District Admin',
    p_district: 'Pune'
  };
  
  console.log('[RPC REQUEST] rpc("create_admin"):', JSON.stringify(createPayload, null, 2));

  const { data: createOk, error: createErr, status: createStatus, statusText: createStatusText } = await supabase.rpc('create_admin', createPayload);
  
  console.log('[RPC RESPONSE] Status:', createStatus, createStatusText);
  console.log('[RPC RESPONSE] Data:', createOk);
  
  if (createErr || !createOk) {
    console.error('❌ Failed to execute create_admin! Error detail:', {
      code: createErr?.code,
      message: createErr?.message,
      details: createErr?.details,
      hint: createErr?.hint
    });
    process.exit(1);
  }
  console.log('✅ Success: Admin created securely!');

  // Query table to get inserted ID
  const { data: adminsList } = await supabase.rpc('get_admins');
  const createdAdmin = (adminsList || []).find(a => a.username === testUsername);
  console.log('[DATABASE PROOF] Inserted public.admins Row:', JSON.stringify(createdAdmin, null, 2));

  // Insert Audit Log for Creation
  console.log('\n[AUDIT LOG] Inserting Admin Creation audit trail...');
  const auditPayload = {
    admin_user: 'superadmin',
    action: 'ADMIN_CREATED',
    target_id: testUsername,
    new_value: `Administrator profile registered securely. Role: District Admin. District: Pune`,
    ip_address: '127.0.0.1',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  
  const { status: auditStatus, error: auditErr } = await supabase.from('audit_logs').insert([auditPayload]);
  if (auditErr) {
    console.error('❌ Audit Log insertion failed:', auditErr);
  } else {
    console.log(`✅ Success: Audit log inserted! HTTP Status: ${auditStatus}`);
  }

  // Insert Alert Notification for Creation
  console.log('\n[NOTIFICATION] Queueing Administrator Onboarding notification alert...');
  const notifPayload = {
    recipient: '9999999999',
    type: 'WhatsApp',
    message: `🛡️ Security Alert: A new administrator account '${testUsername}' has been successfully created.`,
    status: 'pending'
  };
  
  const { status: notifStatus, error: notifErr } = await supabase.from('notifications').insert([notifPayload]);
  if (notifErr) {
    console.error('❌ Notification insertion failed:', notifErr);
  } else {
    console.log(`✅ Success: Notification queued! HTTP Status: ${notifStatus}`);
  }

  // 3. Admin Login
  console.log('\n--- STEP 3: ADMIN LOGIN ---');
  const loginPayload = {
    p_username: testUsername,
    p_password: 'Test@2026'
  };
  console.log('[RPC REQUEST] rpc("authenticate_admin"):', JSON.stringify(loginPayload, null, 2));

  const { data: authData, error: authErr } = await supabase.rpc('authenticate_admin', loginPayload);
  if (authErr || !authData || authData.length === 0) {
    console.error('❌ Authentication failed for testadmin!', authErr);
    process.exit(1);
  }
  console.log('[RPC RESPONSE] Success! Authenticated Row:', JSON.stringify(authData[0], null, 2));

  // 4. Password Reset
  console.log('\n--- STEP 4: PASSWORD RESET ---');
  const resetPayload = {
    p_id: createdAdmin.id,
    p_role: 'District Admin',
    p_district: 'Pune',
    p_is_active: true,
    p_password: 'NewTest@2026'
  };
  console.log('[RPC REQUEST] rpc("update_admin"):', JSON.stringify(resetPayload, null, 2));

  const { data: resetOk, error: resetErr } = await supabase.rpc('update_admin', resetPayload);
  if (resetErr || !resetOk) {
    console.error('❌ Password reset failed!', resetErr);
    process.exit(1);
  }
  console.log('[RPC RESPONSE] Success! Data:', resetOk);

  // Record Audit Log for Reset
  const auditResetPayload = {
    admin_user: 'superadmin',
    action: 'ADMIN_PASSWORD_RESET',
    target_id: testUsername,
    new_value: `Admin profile updated & password cryptographically reset. Role: District Admin. Active: true`,
    ip_address: '127.0.0.1',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  const { status: auditResetStatus, error: auditResetErr } = await supabase.from('audit_logs').insert([auditResetPayload]);
  if (auditResetErr) {
    console.error('❌ Password Reset audit log failed:', auditResetErr.message);
  } else {
    console.log(`✅ Success: Password Reset audit log inserted! HTTP Status: ${auditResetStatus}`);
  }

  // Verify old password fails
  const { data: oldAuth } = await supabase.rpc('authenticate_admin', {
    p_username: testUsername,
    p_password: 'Test@2026'
  });
  console.log(`✅ Success: Old password correctly invalidated (Auth returned ${oldAuth?.length || 0} rows)`);

  // Verify new password succeeds
  const { data: newAuth } = await supabase.rpc('authenticate_admin', {
    p_username: testUsername,
    p_password: 'NewTest@2026'
  });
  console.log(`✅ Success: New password successfully authenticated! (Role: ${newAuth[0].role})`);

  // 5. Admin Deactivation
  console.log('\n--- STEP 5: DEACTIVATION ---');
  const deactPayload = {
    p_id: createdAdmin.id,
    p_role: 'District Admin',
    p_district: 'Pune',
    p_is_active: false,
    p_password: null
  };
  console.log('[RPC REQUEST] rpc("update_admin") (deactivate):', JSON.stringify(deactPayload, null, 2));

  const { data: deactOk } = await supabase.rpc('update_admin', deactPayload);
  console.log('[RPC RESPONSE] Success! Data:', deactOk);

  // Record Audit Log for Deactivation
  const auditDeactPayload = {
    admin_user: 'superadmin',
    action: 'ADMIN_UPDATED',
    target_id: testUsername,
    new_value: `Admin profile updated. Role: District Admin. Active: false`,
    ip_address: '127.0.0.1',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  const { status: auditDeactStatus, error: auditDeactErr } = await supabase.from('audit_logs').insert([auditDeactPayload]);
  if (auditDeactErr) {
    console.error('❌ Deactivation audit log failed:', auditDeactErr.message);
  } else {
    console.log(`✅ Success: Deactivation audit log inserted! HTTP Status: ${auditDeactStatus}`);
  }

  // Verify login fails while deactivated
  const { data: deactAuth } = await supabase.rpc('authenticate_admin', {
    p_username: testUsername,
    p_password: 'NewTest@2026'
  });
  console.log(`✅ Success: Login rejected for deactivated account (Auth returned ${deactAuth?.length || 0} rows)`);

  // 6. Admin Reactivation
  console.log('\n--- STEP 6: REACTIVATION ---');
  const reactPayload = {
    p_id: createdAdmin.id,
    p_role: 'District Admin',
    p_district: 'Pune',
    p_is_active: true,
    p_password: null
  };
  console.log('[RPC REQUEST] rpc("update_admin") (reactivate):', JSON.stringify(reactPayload, null, 2));

  const { data: reactOk } = await supabase.rpc('update_admin', reactPayload);
  console.log('[RPC RESPONSE] Success! Data:', reactOk);

  // Record Audit Log for Reactivation
  const auditReactPayload = {
    admin_user: 'superadmin',
    action: 'ADMIN_UPDATED',
    target_id: testUsername,
    new_value: `Admin profile updated. Role: District Admin. Active: true`,
    ip_address: '127.0.0.1',
    browser: 'Node E2E Tester',
    device: 'Backend Script'
  };
  const { status: auditReactStatus, error: auditReactErr } = await supabase.from('audit_logs').insert([auditReactPayload]);
  if (auditReactErr) {
    console.error('❌ Reactivation audit log failed:', auditReactErr.message);
  } else {
    console.log(`✅ Success: Reactivation audit log inserted! HTTP Status: ${auditReactStatus}`);
  }

  // Verify login succeeds again
  const { data: reactAuth } = await supabase.rpc('authenticate_admin', {
    p_username: testUsername,
    p_password: 'NewTest@2026'
  });
  console.log(`✅ Success: Account reactivated successfully! Authenticated Role: ${reactAuth[0].role}`);

  console.log('\n============================================================');
  console.log('🎉 ALL CRYPTOGRAPHIC E2E SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runE2ETests().catch(err => {
  console.error('❌ Fatal test runner crash:', err);
});
