const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const outDir = 'C:/Users/corew/devcom-digital/.impeccable/review';

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mobile.newPage();

  await mpage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await mpage.fill('input[type="email"], input[name="email"]', 'demo@devcomdigital.com');
  await mpage.fill('input[type="password"], input[name="password"]', 'demo12345');
  await Promise.all([
    mpage.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    mpage.click('button[type="submit"]'),
  ]);
  await mpage.waitForTimeout(1500);

  await mpage.goto('http://localhost:3000/tools', { waitUntil: 'networkidle' });
  await mpage.screenshot({ path: `${outDir}/tools-mobile-v2.png`, fullPage: true });

  await mobile.close();
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
