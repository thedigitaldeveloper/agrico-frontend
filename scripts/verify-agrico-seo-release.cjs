const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.AGRICO_QA_URL || 'http://localhost:3005';
const directory = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const checks = [], measurements = [];
  try {
    let response = await page.request.get(base + '/university/rnb-global-university/not-a-real-tab');
    assert.equal(response.status(), 404); assert.match(await response.text(), /noindex/); await response.dispose();
    response = await page.request.get(base + '/agriculture-colleges/does-not-exist');
    assert.equal(response.status(), 404); await response.dispose();
    checks.push('Unknown curated university tabs and unknown states return 404/noindex without requiring a working CMS');
    await page.addInitScript(() => {
      window.agricoLab = { lcp_ms: null, cls: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.agricoLab.lcp_ms = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.agricoLab.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    for (const route of ['/university/rnb-global-university/course-fee', '/articles/agriculture-fee-budget', '/editorial-policy']) {
      response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => image.getBoundingClientRect().top < innerHeight && (!image.complete || !image.naturalWidth || !image.hasAttribute('alt'))).map(image => image.currentSrc));
      assert.deepEqual(brokenImages, []);
      measurements.push({ route, viewport: '390x844', ...await page.evaluate(() => window.agricoLab) });
      if (route.startsWith('/articles')) { await page.screenshot({ path: path.join(directory, 'qa/seo-article-mobile.png') }); assert.match(await page.locator('.ag-publication-image-caption').innerText(), /Campus example:/); assert.equal(await page.locator('.ag-publication-image-caption a').count(), 0); }
    }
    checks.push('Article image context without credit links, editorial policy and representative mobile layouts render with no broken above-fold images');
    await page.goto(pathToFileURL(path.join(directory, 'content-seo-audit.html')).href);
    const audit = JSON.parse(fs.readFileSync(path.join(directory, 'content-seo-audit.json'))); assert.equal(await page.locator('tbody tr').count(), audit.deferred_for_evidence);
    assert.equal(await page.locator('details.institution').count(), 58);
    for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
    await page.locator('#filter').fill('Jagan Nath');
    assert.equal(await page.locator('details.institution:visible').count(), 1);
    await page.locator('#filter').fill('');
    await page.screenshot({ path: path.join(directory, 'qa/content-seo-audit-desktop.png') });
    checks.push('Audit reader contains all ' + audit.deferred_for_evidence + ' deferred tabs and 58 institution backlogs, with working filtering and 320–1440px layouts');
    const result = { checked_on: '2026-10-31', base, checks, lab_measurements: measurements, measurement_limits: 'A local unthrottled Chromium observation, not Lighthouse, field Core Web Vitals or real-user INP. Do not use these numbers as a live performance guarantee.', errors: [] };
    fs.writeFileSync(path.join(directory, 'seo-release-verification.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
