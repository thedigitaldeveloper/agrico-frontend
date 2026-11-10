const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = process.env.AGRICO_PREVIEW_URL || 'http://localhost:3003';
const output = path.resolve(__dirname, '../docs/design/qa/agrico-details');
fs.mkdirSync(output, { recursive: true });
const checks = [], layouts = [], errors = [];
const pass = message => { checks.push(message); console.log('PASS ' + message); };
const routes = [
  ['programme', '/btech-agricultural-engineering', 'B.Tech. Agricultural Engineering'],
  ['university', '/university/lovely-professional-university', 'Lovely Professional University'],
];
async function load(page, url) {
  const response = await page.goto(root + url, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, url);
  await page.locator('.ag-detail h1').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; });
}
async function capture(page, name, width) {
  await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
  await page.evaluate(async () => {
    for (let top = 0; top < document.body.scrollHeight; top += 800) { scrollTo(0, top); await new Promise(resolve => setTimeout(resolve, 25)); }
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    scrollTo(0, 0);
  });
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('.ag-detail-nav a[aria-current]')?.textContent === 'Overview');
  await page.screenshot({ path: path.join(output, name + '-top.png'), animations: 'disabled' });
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [kind, route, title] of routes) {
      await load(page, route);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('h1').innerText(), title);
      assert.equal(await page.locator('.ag-header').count(), 1);
      assert.equal(await page.locator('.ag-footer').count(), 1);
      assert.equal(await page.locator('.ag-detail-sidebar').count(), kind === 'programme' ? 1 : 0);
      assert.equal(await page.locator('.ag-detail-university-main').count(), kind === 'university' ? 1 : 0);
      for (const width of [320, 360, 375, 390, 414, 540, 700, 701, 768, 820, 900, 901, 1024, 1150, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        const layout = await page.evaluate(() => ({
          viewport: innerWidth, document: document.documentElement.scrollWidth,
          overflow: [...document.querySelectorAll('.ag-detail h1, .ag-detail h2, .ag-detail h3, .ag-detail p, .ag-detail-directory__row, .ag-detail-lead-form')].filter(node => {
            const rect = node.getBoundingClientRect();
            return rect.width && (rect.left < -1 || rect.right > innerWidth + 1 || node.scrollWidth > node.clientWidth + 2);
          }).map(node => ({ tag: node.tagName, class: node.className, text: node.textContent.slice(0, 70) })),
        }));
        layouts.push({ kind, width, ...layout });
        assert(layout.document <= width + 1, JSON.stringify({ kind, width, layout }));
        assert.deepEqual(layout.overflow, [], JSON.stringify({ kind, width, layout }));
      }
      pass(kind + ': 17 mobile/tablet/desktop widths, no document or text overflow; distinct layout and shared Agrico shell');
      await capture(page, kind + '-desktop', 1440);
      await capture(page, kind + '-mobile', 390);
      assert.equal(await page.locator('.ag-detail-nav a[aria-current]').innerText(), 'Overview');
      const search = page.getByRole('textbox', { name: 'Search ' + (kind === 'programme' ? 'universities' : 'programmes'), exact: true });
      await search.fill('no-results-example-987');
      assert.equal(await page.locator('.ag-detail-directory__row').count(), 0);
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
      assert(await page.locator('.ag-detail-directory__row').count() > 0);
      if (kind === 'university') {
        await page.getByRole('button', { name: 'Postgraduate', exact: true }).click();
        assert.equal(await page.locator('.ag-detail-directory__row').count(), 1);
        assert.match(await page.locator('.ag-detail-directory__row').innerText(), /Agronomy/);
        await page.getByRole('button', { name: 'All programmes', exact: true }).click();
      }
      pass(kind + ': searchable directory, filters and useful empty state');
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('.ag-detail-nav').getByRole('link', { name: kind === 'programme' ? 'Curriculum' : 'Admissions', exact: true }).click();
      await page.waitForFunction(id => {
        const nav = document.querySelector('.ag-detail-nav');
        const section = document.getElementById(id);
        return section.getBoundingClientRect().top >= nav.getBoundingClientRect().bottom - 2;
      }, kind === 'programme' ? 'curriculum' : 'admissions');
      await page.waitForFunction(label => document.querySelector('.ag-detail-nav a[aria-current]')?.textContent === label, kind === 'programme' ? 'Curriculum' : 'Admissions');
      pass(kind + ': sticky section links, scroll position and active section');
      for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
        await page.setViewportSize(viewport);
        await page.locator('.ag-detail-hero__actions > button').click();
        await page.waitForFunction(() => document.querySelector('.ag-detail-dialog').open);
        const dialog = page.locator('.ag-detail-dialog');
        const bounds = await dialog.boundingBox();
        assert(bounds.y >= -1 && bounds.y + bounds.height <= viewport.height + 1, 'Dialog fits viewport');
        const form = dialog.locator('form');
        assert.equal(await form.locator('input[name=program]').inputValue(), '');
        assert.equal(await form.locator('input[name=university]').inputValue(), '');
        assert.match(await form.locator('input[name=message]').inputValue(), kind === 'programme' ? /Engineering/ : /Lovely/);
        await dialog.getByRole('button', { name: 'Request a callback', exact: true }).click();
        assert.equal(await form.locator('input[name=name]').evaluate(node => node.validity.valid), false);
        if (viewport.width === 390) {
          assert.equal(await form.locator('input[name=phone]').evaluate(node => getComputedStyle(node).fontSize), '16px');
          await form.evaluate(node => { node.noValidate = true; });
          await dialog.getByRole('button', { name: 'Request a callback', exact: true }).click();
          await form.getByRole('alert').waitFor();
          for (const field of ['name', 'phone', 'email', 'consent']) assert.equal(await form.locator('[name=' + field + ']').getAttribute('aria-invalid'), 'true');
          await form.evaluate(node => { node.noValidate = false; });
        }
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('.ag-detail-dialog').open);
        assert.equal(await page.evaluate(() => document.body.style.overflow), '');
        assert.equal(await page.locator('.ag-detail-hero__actions > button').evaluate(node => node === document.activeElement), true);
      }
      pass(kind + ': portrait/landscape enquiry dialog, focus restoration, native/server validation and correct context; no valid enquiries submitted');
      assert.equal(await page.locator('img').evaluateAll(images => images.filter(img => img.complete && !img.naturalWidth).length), 0);
    }
    for (const route of ['/bsc-agriculture', '/bsc-horticulture', '/mba-agribusiness', '/msc-agronomy', '/diploma-agriculture', '/university/punjab-agricultural-university', '/university/tamil-nadu-agricultural-university', '/university/indian-agricultural-research-institute']) await load(page, route);
    pass('All six programme and four university guides load with their detail UI');
    assert.equal((await page.goto(root + '/university/unknown-example-987', { waitUntil: 'domcontentloaded' })).status(), 404);
    assert.equal((await page.goto(root + '/unknown-programme-example-987', { waitUntil: 'domcontentloaded' })).status(), 404);
    pass('Unknown programme and university routes retain real 404 responses');
    await page.goto(root, { waitUntil: 'domcontentloaded' });
    await page.locator('.ag-course-panel').getByRole('link', { name: 'View programme', exact: true }).click();
    await page.locator('.ag-detail[data-detail-kind=programme] h1').waitFor();
    await page.goto(root, { waitUntil: 'domcontentloaded' });
    await page.locator('.ag-university-row').first().getByRole('link', { name: /View university/ }).click();
    await page.locator('.ag-detail[data-detail-kind=university] h1').waitFor();
    pass('Homepage programme and university links open their matching detail pages');
    assert.deepEqual(errors, []);
    pass('No browser runtime errors');
    fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify({ root, checks, layouts, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
