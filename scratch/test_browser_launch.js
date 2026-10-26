import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const playwrightPath = path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0', 'package');
const { chromium } = require(playwrightPath);

async function testLaunch() {
  console.log('Testing Chromium launch via Playwright...');
  const browser = await chromium.launch({ headless: true });
  console.log('✅ Browser launched successfully!');
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:5174/ ...');
  const response = await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  console.log('Page response status:', response.status());
  const title = await page.title();
  console.log('Page title:', title);

  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('Has #root?:', html.includes('id="root"'));

  await browser.close();
  console.log('✅ Browser closed successfully. Real browser automation is 100% OPERATIONAL!');
}

testLaunch().catch(err => {
  console.error('❌ Launch failed:', err);
  process.exit(1);
});
