const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/auth/student-login', { waitUntil: 'networkidle' });
    console.log('Title:', await page.title());
    
    // Fill student credentials
    await page.locator('input[placeholder="student@university.edu"]').fill('arun.kumar@nexus.edu');
    await page.locator('input[type="password"]').fill('nexus@2026');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(2000);
    console.log('Current URL after login:', page.url());
    
    const headings = await page.locator('h1, h2').allTextContents();
    console.log('Headings on page:', headings);
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
