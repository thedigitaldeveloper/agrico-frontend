const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const pack = JSON.parse(fs.readFileSync(path.join(directory, 'institutions.json'), 'utf8'));
const coverage = JSON.parse(fs.readFileSync(path.join(directory, 'coverage.json'), 'utf8'));
(async () => {
  assert.equal(pack.institutions.length, 58);
  assert.equal(coverage.private_universities, 39);
  assert.equal(coverage.private_colleges, 19);
  assert.deepEqual(coverage.issues, []);
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [], checks = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('file:///' + directory.replace(/\\/g, '/') + '/review.html');
    assert.match(await page.locator('main h2').innerText(), /Every content type/);
    assert.equal(await page.locator('#institution-list button').count(), 58);
    for (const row of pack.institutions) {
      await page.locator('#institution-list button[data-id="' + row.id + '"]').click();
      assert.equal(await page.locator('main h2').innerText(), row.hero.title);
      for (const id of ['overview', 'programmes', 'admissions', 'campus', 'scholarships', 'placements', 'recognition', 'faculty', 'faqs', 'seo', 'related', 'gaps', 'sources']) assert.equal(await page.locator('main #' + id).count(), 1, row.name + ': ' + id);
      assert(await page.locator('main #faqs details').count() >= 5);
      assert.equal(await page.locator('main .source-list li').count(), row.sources.length);
    }
    checks.push('All 58 profiles render every content section, FAQs and matching source register');
    await page.locator('#search').fill('LPU');
    assert.equal(await page.locator('#institution-list button').count(), 1);
    assert.match(await page.locator('#institution-list button').innerText(), /Lovely Professional/);
    await page.locator('#search').fill('no-match-987');
    assert.equal(await page.locator('#institution-list button').count(), 0);
    await page.locator('#search').fill('');
    await page.locator('#state').selectOption('Punjab');
    assert(await page.locator('#institution-list button').count() > 0);
    await page.locator('#state').selectOption('');
    checks.push('Institution/acronym search, state filter and empty results work');
    await page.getByRole('button', { name: 'Coverage', exact: true }).click();
    assert.equal(await page.locator('main tbody tr').count(), 58);
    await page.getByRole('button', { name: 'Content checklist', exact: true }).click();
    checks.push('Coverage and full page-content checklist render');
    const widths = [320, 390, 768, 1024, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('#institution-list button[data-id="43"]').click();
      const size = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      assert(size.document <= width + 1, 'Overflow at ' + width);
    }
    checks.push('No document overflow at 320, 390, 768, 1024 and 1440px');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(directory, 'review-desktop.png'), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(directory, 'review-mobile.png'), animations: 'disabled' });
    assert.deepEqual(errors, []);
    checks.push('No browser runtime errors');
    fs.writeFileSync(path.join(directory, 'review-verification.json'), JSON.stringify({ checked_on: pack.checked_on, checks, errors, profiles: pack.institutions.length }, null, 2));
    for (const check of checks) console.log('PASS ' + check);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
