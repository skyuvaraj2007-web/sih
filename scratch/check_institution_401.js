const path = require('path');
const p1 = path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package');
const { chromium } = require(p1);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failedRequests = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  await page.goto('http://localhost:5173/auth/institution-login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[placeholder*="institution"]').first().fill('placements@srmist.edu.in');
  await page.locator('input[type="password"]').first().fill('nexus@2026');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForTimeout(3000);
  console.log('Failed requests after login:', failedRequests);
  await browser.close();
})();
