const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const [name, vw, vh] of [['flow-desktop', 1440, 900], ['flow-mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`[${name}] ${msg.text()}`); });
    page.on('pageerror', err => errors.push(`[${name}] pageerror: ${err.message}`));
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Try to find the "How access works" section
    const heading = await page.locator('text=How access works').first();
    let clip = null;
    try {
      await heading.scrollIntoViewIfNeeded({ timeout: 5000 });
      await page.waitForTimeout(500);
    } catch (e) {}

    await page.screenshot({ path: `C:\\Users\\corew\\devcom-digital\\.impeccable\\review\\${name}.png`, fullPage: false });
    await page.close();
  }
  await browser.close();
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
})();
