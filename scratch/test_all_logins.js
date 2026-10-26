const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // 1. Institution Login
    await page.goto('http://localhost:5174/auth/institution-login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill('placements@srmist.edu.in');
    await page.locator('input[type="password"]').fill('nexus@2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    console.log('Institution URL after login:', page.url());
    const instHeadings = await page.locator('h1, h2').allTextContents();
    console.log('Institution Headings:', instHeadings.slice(0, 3));

    // Clear session for company
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // 2. Company Login
    await page.goto('http://localhost:5174/auth/company-login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill('talent@abctech.com');
    await page.locator('input[type="password"]').fill('nexus@2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    console.log('Company URL after login:', page.url());
    const compHeadings = await page.locator('h1, h2').allTextContents();
    console.log('Company Headings:', compHeadings.slice(0, 3));
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
