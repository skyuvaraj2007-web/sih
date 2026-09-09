const path = require('path');
const p1 = path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package');
const { chromium } = require(p1);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));

  await page.goto('http://localhost:5173/auth/institution-login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[placeholder*="institution"]').first().fill('placements@srmist.edu.in');
  await page.locator('input[type="password"]').first().fill('nexus@2026');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForTimeout(3000);
  console.log('Current URL after login:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text sample (first 400 chars):', bodyText.slice(0, 400).replace(/\n+/g, ' '));
  const errs = logs.filter(l => l.type === 'error' || l.type === 'pageerror');
  console.log('Console errors/pageerrors count:', errs.length);
  if (errs.length > 0) {
    console.log('Errors:', errs);
  }
  await browser.close();
})();
