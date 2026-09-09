const path = require('path');
const playwrightPath = path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package');
const { chromium } = require(playwrightPath);

(async () => {
  console.log('--- REPRODUCING STUDENT PROFILE BUG ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.log('  [BROWSER CONSOLE ERROR]', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('  [BROWSER PAGEERROR]', err.message, err.stack);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push({ url: res.url(), status: res.status() });
      console.log(`  [HTTP ${res.status}] ${res.url()}`);
    }
  });

  // 1. Go to student login
  await page.goto('http://localhost:5173/auth/student-login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[placeholder*="student"]').first().fill('arun.kumar@nexus.edu');
  await page.locator('input[type="password"]').first().fill('nexus@2026');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForTimeout(3000);
  console.log('1. URL after student login:', page.url());

  // 2. Click "My Profile"
  console.log('2. Clicking "My Profile" in Sidebar or Nav...');
  const profileLink = page.locator('button, a').filter({ hasText: /^My Profile$/ }).first();
  const count = await profileLink.count();
  console.log('Found profile links with exact text "My Profile":', count);

  if (count > 0) {
    await profileLink.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Trying direct navigation to http://localhost:5173/student/profile');
    await page.goto('http://localhost:5173/student/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  console.log('3. URL after clicking/navigating to Profile:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('4. Body text sample (first 400 chars):', bodyText.slice(0, 400).replace(/\n+/g, ' '));
  console.log('5. Total console errors:', consoleLogs.filter(l => l.type === 'error').length);
  console.log('6. Total network errors:', networkErrors.length);

  await browser.close();
})();
