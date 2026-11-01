const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = process.env.AGRICO_PREVIEW_URL || 'http://localhost:3003';
const output = path.resolve(__dirname, '../docs/design/qa/agrico-home');
fs.mkdirSync(output, { recursive: true });
const checks = [];
const layouts = [];
const errors = [];
const pass = message => { checks.push(message); console.log('PASS ' + message); };
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.loading !== 'lazy' || image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {}))); });
}
async function capture(page, name, width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(async () => { for (let top = 0; top < document.body.scrollHeight; top += 800) { scrollTo(0, top); await new Promise(resolve => setTimeout(resolve, 30)); } scrollTo(0, 0); });
  await settle(page);
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' });
  await page.screenshot({ path: path.join(output, name + '-top.png'), animations: 'disabled' });
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(120000);
  page.on('pageerror', error => errors.push(error.message));
  try {
    const response = await page.goto(root, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    await page.locator('.ag-home h1').waitFor();
    await settle(page);
    assert.match(await page.locator('h1').innerText(), /Study agriculture/);
    assert.equal(await page.locator('.ag-home > section').count(), 12);
    assert.equal(await page.locator('.ag-header').count(), 1);
    assert.equal(await page.locator('.rs-header').count(), 0);
    assert.equal(await page.locator('.ag-footer').count(), 1);
    pass('Approved homepage: twelve sections and one matching header/footer');
    await capture(page, 'desktop', 1440);
    await page.locator('#programmes').screenshot({ path: path.join(output, 'programme-explorer.png') });
    await page.locator('#compare').screenshot({ path: path.join(output, 'programme-comparison.png') });
    await page.locator('#universities').screenshot({ path: path.join(output, 'university-directory.png') });
    await page.locator('#learning').screenshot({ path: path.join(output, 'learning-pathways.png') });
    await page.locator('#guidance').screenshot({ path: path.join(output, 'counselling-desktop.png') });

    for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll('.ag-container,.ag-programme-explorer,.ag-university-directory,.ag-comparison-card,.ag-pathway-table,.ag-callback-form')].filter(node => { const box = node.getBoundingClientRect(); return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1); }).map(node => ({ class: node.className, bounds: node.getBoundingClientRect().toJSON() })),
      }));
      layouts.push(layout);
      assert(layout.scrollWidth <= width + 1, 'Document overflow at ' + width);
      assert.deepEqual(layout.overflow, [], 'Section overflow at ' + width);
    }
    pass('No document or section overflow at 320, 360, 390, 768, 1024, 1440 and 1920px');
    await capture(page, 'mobile', 390);
    await page.locator('#guidance').screenshot({ path: path.join(output, 'counselling-mobile.png') });
    assert.equal(await page.locator('#ag-mobile-number').evaluate(node => getComputedStyle(node).fontSize), '16px');
    await capture(page, 'tablet', 768);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole('button', { name: 'Postgraduate', exact: true }).click();
    assert.match(await page.locator('.ag-course-panel h3').innerText(), /MBA Agribusiness/);
    await page.locator('.ag-degree-index').getByRole('button', { name: 'Agronomy', exact: true }).click();
    assert.match(await page.locator('.ag-course-panel h3').innerText(), /Agronomy/);
    await page.getByRole('button', { name: 'Diploma', exact: true }).click();
    assert.match(await page.locator('.ag-course-panel h3').innerText(), /Diploma in Agriculture/);
    assert.equal(await page.locator('.ag-course-panel').getByRole('link', { name: 'View programme', exact: true }).getAttribute('href'), '/diploma-agriculture');
    pass('Study levels, course selection and programme detail links work');

    await page.locator('.ag-finder input').fill('Horticulture');
    await page.locator('.ag-finder').getByRole('button', { name: 'Find programmes' }).click();
    assert.match(await page.locator('.ag-course-panel h3').innerText(), /Horticulture/);
    assert.match(await page.locator('.ag-search-results').innerText(), /Horticulture/);
    await page.locator('.ag-finder input').fill('no-match-example-987');
    await page.locator('.ag-finder').getByRole('button', { name: 'Find programmes' }).click();
    assert.match(await page.locator('.ag-search-results').innerText(), /No exact matches/);
    await page.getByRole('button', { name: 'Clear search results' }).click();
    pass('Programme search and useful empty-results state work');

    await page.locator('.ag-degree-index').getByRole('button', { name: 'B.Sc. Agriculture', exact: true }).click();
    await page.locator('.ag-course-panel').getByRole('checkbox', { name: 'Add to compare' }).check();
    await page.locator('.ag-degree-index').getByRole('button', { name: 'Agri Engineering', exact: true }).click();
    await page.locator('.ag-course-panel').getByRole('checkbox', { name: 'Add to compare' }).check();
    await page.getByRole('button', { name: 'Compare these programmes', exact: true }).click();
    assert.equal(await page.locator('.ag-full-comparison thead th').count(), 3);
    assert.match(await page.locator('.ag-full-comparison').innerText(), /Plant, soil & crop sciences/);
    assert.match(await page.locator('.ag-full-comparison').innerText(), /Machinery, water & food systems/);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ag-dialog').open);
    await page.locator('.ag-degree-index').getByRole('button', { name: 'Horticulture', exact: true }).click();
    await page.locator('.ag-course-panel').getByRole('checkbox', { name: 'Add to compare' }).click();
    assert.equal(await page.locator('.ag-course-panel').getByRole('checkbox', { name: 'Add to compare' }).isChecked(), false);
    assert.match(await page.locator('.ag-live-message').innerText(), /compare two programmes/);
    await page.locator('#compare').getByRole('button', { name: 'Clear selection', exact: true }).click();
    pass('Two-programme comparison, informative facts, selection limit and clearing work');

    await page.getByRole('checkbox', { name: 'Compare Punjab Agricultural University', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Compare Tamil Nadu Agricultural University', exact: true }).check();
    await page.getByRole('button', { name: 'Compare selected', exact: true }).click();
    assert.equal(await page.locator('.ag-university-modal-grid article').count(), 2);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ag-dialog').open);
    await page.locator('.ag-university-selection').getByRole('button', { name: 'Clear', exact: true }).click();
    pass('University shortlist comparison and clear controls work');

    await page.getByRole('button', { name: 'Read guide', exact: true }).first().click();
    assert.equal(await page.locator('.ag-reading-section').count(), 3);
    assert.match(await page.locator('#ag-dialog-title').innerText(), /Choosing your agriculture degree/);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ag-dialog').open);
    const secondFaq = page.locator('.ag-faq-list details').nth(1);
    await secondFaq.locator('summary').click();
    assert(await secondFaq.evaluate(node => node.open));
    await secondFaq.locator('summary').click();
    assert.equal(await secondFaq.evaluate(node => node.open), false);
    pass('Guides contain full content; FAQ accordions and Escape dismissal work');

    await page.locator('.ag-step-title').filter({ hasText: 'Get counselling' }).click();
    await page.waitForFunction(() => document.activeElement?.id === 'ag-full-name');
    assert.equal(await page.locator('#ag-programme-interest').inputValue(), '');
    await page.locator('#ag-programme-interest').selectOption('horticulture');
    assert.equal(await page.locator('.ag-callback-form input[name=university]').inputValue(), '');
    pass('General counselling focuses the callback form and accepts a programme interest without inventing a university choice');

    await page.locator('.ag-callback-form').getByRole('button', { name: 'Request a callback' }).click();
    assert.equal(await page.locator('#ag-full-name').evaluate(node => node.validity.valid), false);
    await page.locator('.ag-callback-form').evaluate(form => { form.noValidate = true; });
    await page.locator('.ag-callback-form').getByRole('button', { name: 'Request a callback' }).click();
    await page.locator('#ag-form-status').waitFor();
    assert.match(await page.locator('#ag-form-status').innerText(), /check the highlighted fields/);
    assert.equal(await page.locator('#ag-full-name').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#ag-mobile-number').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('.ag-callback-form input[name=consent]').getAttribute('aria-invalid'), 'true');
    await page.locator('.ag-callback-form').evaluate(form => { form.noValidate = false; });
    pass('Callback native and server-side validation work; no valid enquiry or contact data was submitted');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    assert(await page.locator('#ag-mobile-menu').evaluate(node => node.open));
    await page.locator('#ag-mobile-menu nav').getByRole('link', { name: 'Programmes', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('#ag-mobile-menu').open);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#ag-mobile-menu').open);
    pass('Mobile navigation opens, navigates and closes with Escape');

    await page.goto(root + '/?q=Agribusiness', { waitUntil: 'domcontentloaded' });
    await page.locator('.ag-course-panel h3').waitFor();
    assert.match(await page.locator('.ag-course-panel h3').innerText(), /MBA Agribusiness/);
    pass('Search URL restores matching study level and programme');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 20)); } await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
    const brokenImages = await page.evaluate(() => [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc));
    assert.deepEqual(brokenImages, []);
    assert.deepEqual(errors, []);
    pass('All photos render and no browser runtime errors occurred');
    const atlas = await page.request.get(root + '/images/agrico/academic-illustrations.png');
    assert.equal(atlas.status(), 200);
    await page.goto(root + '/login', { waitUntil: 'domcontentloaded' });
    await page.locator('.rs-header').waitFor();
    assert.equal(await page.locator('.ag-header').count(), 0);
    pass('Existing non-home route retains its original working navigation shell');
  } finally {
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ date: new Date().toISOString(), root, checks, layouts, errors }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
