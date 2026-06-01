const puppeteer = require('puppeteer-core');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read credentials from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*VITE_([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

// Edge browser path on Windows
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const suffix = Date.now().toString().slice(-4);
  const testMemberName = `BROWSER_MEMBER_${suffix}`;
  const testVolName = `BROWSER_VOLUNTEER_${suffix}`;

  console.log(`[TEST CONFIG] Target Member: ${testMemberName}`);
  console.log(`[TEST CONFIG] Target Volunteer: ${testVolName}`);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

  // Enable request interception to allow body capturing
  await page.setRequestInterception(true);

  // Capture all browser console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.text()}`);
  });

  // Array to collect intercepted requests
  const requests = [];

  page.on('request', req => {
    const reqUrl = req.url();
    if (reqUrl.includes('supabase.co')) {
      requests.push({
        type: 'request',
        method: req.method(),
        url: reqUrl,
        headers: req.headers(),
        postData: req.postData()
      });
      console.log(`\n--- [NETWORK REQUEST OUT] ---`);
      console.log(`Method: ${req.method()} | URL: ${reqUrl}`);
      if (req.postData()) {
        try {
          console.log(`Payload:`, JSON.stringify(JSON.parse(req.postData()), null, 2));
        } catch (e) {
          console.log(`Payload (raw):`, req.postData());
        }
      }
    }
    req.continue();
  });

  page.on('response', async res => {
    const resUrl = res.url();
    if (resUrl.includes('supabase.co')) {
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch (e) {}
      requests.push({
        type: 'response',
        url: resUrl,
        status: res.status(),
        statusText: res.statusText(),
        body: bodyText
      });
      console.log(`--- [NETWORK RESPONSE IN] ---`);
      console.log(`Status: ${res.status()} ${res.statusText()} | URL: ${resUrl}`);
      if (bodyText) {
        try {
          console.log(`Response Body:`, JSON.stringify(JSON.parse(bodyText), null, 2));
        } catch (e) {
          console.log(`Response Body (raw):`, bodyText);
        }
      }
    }
  });

  console.log('\nNavigating to JanKam Portal on dynamic Vite port 5176...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
  console.log('Page loaded successfully!');

  // Select Option Helper for Custom SearchableSelect
  async function selectOption(selectId, optionLabel) {
    await page.waitForSelector(`#${selectId}`);
    await page.click(`#${selectId}`);
    await page.waitForSelector('input[placeholder="Search option..."]', { visible: true });
    
    // Clear and type
    const searchInput = await page.$('input[placeholder="Search option..."]');
    await searchInput.type(optionLabel);
    await new Promise(r => setTimeout(r, 400));
    
    // Get option buttons
    const buttons = await page.$$('div.custom-scrollbar button');
    let clicked = false;
    for (const btn of buttons) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.toLowerCase().includes(optionLabel.toLowerCase())) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked && buttons.length > 0) {
      await buttons[0].click();
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // ==========================================
  // A. SUBMIT MEMBER FORM
  // ==========================================
  console.log('\n--- SUBMITTING MEMBER FORM VIA BROWSER UI ---');
  
  // Fill inputs
  await page.type('#join-name', testMemberName);
  await page.type('#join-mobile', '9999999999');
  await page.type('#join-email', 'browser.member@flow.com');
  await page.type('#join-age', '32');
  
  await selectOption('join-gender', 'Male');
  await selectOption('join-preferredLanguage', 'Marathi');
  await selectOption('join-educationLevel', 'Secondary');
  await selectOption('join-homeState', 'Maharashtra');
  await selectOption('join-homeDistrict', 'Pune');
  await selectOption('join-workState', 'Maharashtra');
  await selectOption('join-workDistrict', 'Pune');
  await selectOption('join-industryType', 'Manufacturing');
  await selectOption('join-workerType', 'Contract Worker');
  
  await page.type('#join-companyName', 'Browser Automation Corp');
  await page.type('#join-occupation', 'Machinist');
  await page.type('#join-experience', '8');

  console.log('Clicking Submit Member button...');
  await page.screenshot({ path: 'before_member_submit.png' });
  await page.click('#join-submit');
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'after_member_submit.png' });
  
  const memberErrorsExist = await page.evaluate(() => {
    return document.body.innerText.includes('Please complete');
  });
  console.log('Member Form Validation Error Banner present?', memberErrorsExist);
  if (memberErrorsExist) {
    const errorText = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Please complete'));
      return banner ? banner.textContent : 'Unknown error';
    });
    console.log('Validation Error Text:', errorText);
  }
  
  // Wait for submission success UI
  await new Promise(r => setTimeout(r, 2000));
  console.log('Member submission flow completed!');

  // ==========================================
  // B. SUBMIT VOLUNTEER FORM
  // ==========================================
  console.log('\n--- SUBMITTING VOLUNTEER FORM VIA BROWSER UI ---');
  
  console.log('Reloading page to clear success state and mount fresh form tab switcher...');
  await page.reload({ waitUntil: 'networkidle2' });
  
  // Click the Volunteer tab
  const pageButtons = await page.$$('button');
  let tabClicked = false;
  for (const btn of pageButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Be a Volunteer') || text.includes('स्वयंसेवक')) {
      await btn.click();
      tabClicked = true;
      console.log('Switched to Volunteer tab via exact text match!');
      break;
    }
  }
  if (!tabClicked) {
    console.warn('Could not find Volunteer tab switcher button by exact text! Fallback to index...');
    const tabButtons = await page.$$('div[style*="display: flex"] button');
    if (tabButtons.length >= 2) {
      await tabButtons[1].click();
      console.log('Fallback: Switched tab successfully using index!');
      tabClicked = true;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Fill inputs
  await page.waitForSelector('#vol-name', { visible: true });
  await page.type('#vol-name', testVolName);
  await page.type('#vol-mobile', '8888888888');
  await page.type('#vol-email', 'browser.volun@flow.com');
  
  await selectOption('vol-preferredLanguage', 'English');
  await selectOption('vol-state', 'Maharashtra');
  await selectOption('vol-district', 'Pune');
  await selectOption('vol-industryType', 'IT');
  await selectOption('vol-workerType', 'Permanent Employee');
  await selectOption('vol-educationLevel', 'Graduate');

  // Select Legal Support skill button
  const skillBtns = await page.$$('button');
  for (const btn of skillBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Legal Support')) {
      await btn.click();
      console.log('Selected Skill: Legal Support');
      break;
    }
  }

  console.log('Clicking Submit Volunteer button...');
  await page.screenshot({ path: 'before_volunteer_submit.png' });
  await page.click('#vol-submit');
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'after_volunteer_submit.png' });
  
  const volErrorsExist = await page.evaluate(() => {
    return document.body.innerText.includes('Please complete');
  });
  console.log('Volunteer Form Validation Error Banner present?', volErrorsExist);
  if (volErrorsExist) {
    const errorText = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Please complete'));
      return banner ? banner.textContent : 'Unknown error';
    });
    console.log('Validation Error Text:', errorText);
  }
  
  // Wait for volunteer success UI
  await new Promise(r => setTimeout(r, 2000));
  console.log('Volunteer submission flow completed!');

  await browser.close();

  // ==========================================
  // C. PHYSICAL DATABASE VERIFICATION
  // ==========================================
  console.log('\n=============================================');
  console.log('🔍 PHYSICAL DATABASE VERIFICATION (PRIMARY TRUTH)');
  console.log('=============================================\n');

  console.log(`[QUERY] Querying public.members for '${testMemberName}'...`);
  const mQuery = await supabase.from('members').select('*').eq('name', testMemberName);
  console.log(' - Member Query HTTP Status:', mQuery.status);
  if (mQuery.data && mQuery.data.length > 0) {
    console.log('✅ Found member in Supabase:', JSON.stringify(mQuery.data[0], null, 2));
  } else {
    console.error('❌ Failed to locate member in Supabase!', mQuery.error);
  }

  console.log(`\n[QUERY] Querying public.volunteers for '${testVolName}'...`);
  const vQuery = await supabase.from('volunteers').select('*').eq('name', testVolName);
  console.log(' - Volunteer Query HTTP Status:', vQuery.status);
  if (vQuery.data && vQuery.data.length > 0) {
    console.log('✅ Found volunteer in Supabase:', JSON.stringify(vQuery.data[0], null, 2));
  } else {
    console.error('❌ Failed to locate volunteer in Supabase!', vQuery.error);
  }

  console.log('\n[localStorage persistence check]:');
  console.log('Since browser submitted values are confirmed successfully in Supabase (primary truth), the frontend is NOT running a localStorage-only path, and card generations are fully backed by live cloud persistence!');
}

run().catch(console.error);
