// Read-only live smoke: public GETs only; no account/enquiry submissions or CMS writes.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const qs = require('qs');
const { chromium } = require(process.env.RS_PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const origin = process.env.RS_QA_ORIGIN || 'http://localhost:3003';
const cms = process.env.RS_QA_CMS_ORIGIN || 'http://127.0.0.1:1340';
const authOnly = process.env.RS_QA_SCOPE === 'auth';
for (const value of [origin, cms]) assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname), 'Local RS services only');
const output = path.join(root, 'docs/design/qa/secondary-pages');
const reportFile = path.join(output, authOnly ? 'auth-recheck.json' : 'checks.json');
const files = ['src/app/news/page.tsx', 'src/app/blogs/page.tsx', 'src/app/exams/page.tsx', 'src/app/scholarships/page.tsx', 'src/app/search/page.tsx', 'src/app/login/page.tsx', 'src/app/register/page.tsx', 'src/components/ui/listing.css', 'src/components/blog/post-listing.tsx', 'src/components/blog/post-card.tsx', 'src/components/rs/auth-shell.tsx', 'src/components/auth/auth-forms.tsx', 'src/app/rs.css'];
const report = { date: new Date().toISOString(), origin, cms, buildId: fs.existsSync(path.join(root, '.next/BUILD_ID')) ? fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim() : null, sourceHashes: Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])), expected: {}, checks: [], routes: [], destinationChecks: [], browserErrors: [], failedResponses: [], blockedMutations: [], defects: [] };
const normal = value => String(value || '').replace(/\s+/g, ' ').trim();
const groups = [{ key: 'universities', prefix: '/university/' }, { key: 'programs', prefix: '/program/' }, { key: 'examinations', prefix: '/exams/' }, { key: 'schemes', prefix: '/scholarship/' }, { key: 'courses', prefix: '/programs?course=' }, { key: 'blogs', prefix: '/blogs/' }];
async function api(endpoint, query) {
  const response = await fetch(cms + '/api/' + endpoint + '?' + qs.stringify(query, { encodeValuesOnly: true }), { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, 'Public CMS GET ' + endpoint);
  return response.json();
}
async function expectedData() {
  const pagination = { page: 1, pageSize: 12 };
  const [news, blogs, exams, scholarships, search] = await Promise.all([
    api('blogs', { status: 'published', filters: { type: { $in: ['News', 'Press release'] } }, sort: ['dateTime:desc', 'createdAt:desc'], pagination }),
    api('blogs', { status: 'published', filters: { type: { $in: ['Blog', 'Articles'] } }, sort: ['dateTime:desc', 'createdAt:desc'], pagination }),
    api('examinations', { status: 'published', sort: 'position:asc', pagination }),
    api('schemes', { status: 'published', sort: 'name:asc', pagination }),
    api('fuzzy-search/search', { query: 'MBA' }),
  ]);
  const entries = [
    { key: 'news', path: '/news', title: 'Education News', label: 'Education News', data: news, prefix: '/news/' },
    { key: 'blogs', path: '/blogs', title: 'From the Blog', label: 'From the Blog', data: blogs, prefix: '/blogs/' },
    { key: 'exams', path: '/exams', title: 'Entrance Exams', label: 'Exams', data: exams, prefix: '/exams/' },
    { key: 'scholarships', path: '/scholarships', title: 'Scholarships', label: 'Scholarships', data: scholarships, prefix: '/scholarship/' },
  ];
  for (const entry of entries) {
    assert(Array.isArray(entry.data.data));
    entry.records = entry.data.data;
    entry.total = entry.data.meta.pagination.total;
    report.expected[entry.key] = { total: entry.total, firstPage: entry.records.map(record => ({ name: record.name, slug: record.slug })) };
  }
  const hits = groups.flatMap(group => (search[group.key] || []).map(hit => ({ title: hit.name, href: group.prefix + hit.slug, group: group.key })));
  report.expected.search = { query: 'MBA', total: hits.length, results: hits };
  entries.push({ key: 'search', path: '/search?q=MBA', title: 'Search', hits, total: hits.length });
  return entries;
}
async function visibleImages(page) {
  const snapshots = [];
  for (const image of await page.locator('img').elementHandles()) {
    const visible = await image.evaluate(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth; });
    if (!visible) continue;
    // Responsive srcset selection can change currentSrc while the image loads.
    // Check the visible element itself, then record its final selected source.
    await page.waitForFunction(element => element.isConnected && element.complete && element.naturalWidth > 0, image, { timeout: 12000 });
    snapshots.push(await image.evaluate(element => ({ src: element.currentSrc || element.src, alt: element.alt })));
  }
  return snapshots;
}
async function layout(page, listing) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const data = await page.evaluate(isListing => {
    const bounds = selector => { const element = document.querySelector(selector), rect = element?.getBoundingClientRect(); return rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width } : null; };
    const outliers = [...document.querySelectorAll('main *')].flatMap(element => {
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      if (!rect.width || style.position === 'fixed' || style.position === 'absolute' || element.tagName === 'SCRIPT' || style.clip !== 'auto') return [];
      return rect.left < -1 || rect.right > innerWidth + 1 ? [{ tag: element.tagName, className: String(element.className).slice(0, 100), left: rect.left, right: rect.right }] : [];
    });
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, header: bounds('.rs-header-inner'), footer: bounds('.rs-footer > .rs-container'), content: bounds(isListing ? '.rs-listing' : '.rs-auth-grid'), heading: bounds('main h1'), outliers: outliers.slice(0, 12) };
  }, listing);
  assert(data.header && data.footer && data.content && data.heading, 'Shared shell and primary heading are present');
  assert(data.scrollWidth <= data.width + 1 && data.bodyWidth <= data.width + 1, 'No horizontal page overflow');
  assert.equal(data.outliers.length, 0, 'No main content clipped outside the viewport');
  assert(data.heading.top >= data.header.bottom - 1, 'Heading stays below the shared header');
  assert(Math.abs(data.header.left - data.footer.left) < 2 && Math.abs(data.header.right - data.footer.right) < 2, 'Header and footer share content guides');
  if (listing) assert(Math.abs(data.content.left - data.header.left) < 2 && Math.abs(data.content.right - data.header.right) < 2, 'Listing aligns to the shared content guides');
  return data;
}
async function targetSizes(page, selector) {
  const controls = await page.locator(selector).evaluateAll(elements => elements.flatMap(element => { const rect = element.getBoundingClientRect(); return rect.width && rect.height ? [{ label: element.getAttribute('aria-label') || element.textContent.trim() || element.getAttribute('name'), width: rect.width, height: rect.height }] : []; }));
  for (const control of controls) assert(control.width >= 43.5 && control.height >= 43.5, '44px control target: ' + control.label + ' (' + control.width + '×' + control.height + 'px)');
  return controls;
}
async function inspectListing(page, entry) {
  assert.equal(normal(await page.locator('main h1').innerText()), entry.title);
  assert((await page.title()).includes(entry.title) || entry.key === 'exams' || entry.key === 'scholarships', 'Document title identifies the page');
  const main = normal(await page.locator('main').innerText());
  if (entry.key !== 'search') {
    const grid = page.locator('main ul[aria-label="' + entry.label + '"]');
    assert.equal(await grid.locator(':scope > li').count(), entry.records.length, 'First-page card count matches public CMS');
    const links = await grid.locator('a[href]').evaluateAll(items => items.map(item => item.getAttribute('href')));
    for (const record of entry.records) assert(links.includes(entry.prefix + record.slug), 'Card links to the actual record: ' + record.slug);
    if (entry.total) assert(main.includes('Showing 1–' + Math.min(12, entry.total) + ' of ' + entry.total), 'Published record count is accurately displayed');
    else assert(/nothing published|no exams published|no scholarships have been published/i.test(main), 'Empty catalogue is described without fake cards');
    if (['news', 'blogs'].includes(entry.key)) {
      assert.equal(await page.locator('nav[aria-label="Editorial sections"] a[aria-current="page"]').getAttribute('href'), entry.path);
      await targetSizes(page, 'nav[aria-label="Editorial sections"] a');
    }
  } else {
    assert.equal(await page.locator('main input[name="q"]').inputValue(), 'MBA');
    if (entry.total) assert(main.includes(entry.total + ' ' + (entry.total === 1 ? 'result' : 'results') + ' for “MBA”'), 'Search total matches public API');
    else assert(main.includes('No results for “MBA”'));
    const links = await page.locator('main section a').evaluateAll(items => items.map(item => item.getAttribute('href')));
    assert.deepEqual(links.slice().sort(), entry.hits.map(hit => hit.href).sort(), 'Search preserves every API result and destination, including disclosed rows');
    const disclosures = page.locator('main details');
    if (await disclosures.count()) {
      const first = disclosures.first(), summary = first.locator('summary');
      await summary.click(); assert(await first.evaluate(element => element.open), 'Search disclosure expands');
      await summary.click(); assert(!await first.evaluate(element => element.open), 'Search disclosure collapses');
    }
  }
  const search = page.locator('main form[role="search"]');
  assert.equal((await search.getAttribute('method')).toLowerCase(), 'get');
  assert.equal(new URL(await search.getAttribute('action'), origin).pathname, entry.path.split('?')[0]);
  const controls = await targetSizes(page, 'main form[role="search"] input[type="search"], main form[role="search"] button[type="submit"]');
  const filters = page.locator('main nav[aria-label="Filters"] summary');
  if (await filters.isVisible()) { await targetSizes(page, 'main nav[aria-label="Filters"] summary'); await filters.click(); assert(await filters.locator('..').evaluate(element => element.open)); await filters.click(); }
  return { observedCount: entry.total, firstPageRecords: entry.records?.length, controls };
}
async function inspectAuth(page, entry) {
  assert.equal(normal(await page.locator('main h1').innerText()), entry.key === 'login' ? 'Welcome back.' : 'A new chapter starts here.');
  const form = page.locator('form.rs-auth-form');
  assert.equal(await form.count(), 1);
  assert.equal(await form.locator('input[type="password"]').inputValue(), '', 'Password remains empty');
  assert.equal(await form.locator('input[type="email"]').inputValue(), '', 'Email remains empty');
  const show = form.getByRole('button', { name: 'Show password', exact: true });
  await show.click();
  assert.equal(await form.locator('input[name="password"]').getAttribute('type'), 'text');
  await form.getByRole('button', { name: 'Hide password', exact: true }).click();
  if (entry.key === 'register') {
    assert(await form.locator('input[name="consent"]').evaluate(element => element.required && !element.checked));
    const summary = form.locator('details summary');
    await summary.click();
    assert(await form.locator('select[name="qualification"]').isVisible());
    assert(!await form.locator('select[name="qualification"]').evaluate(element => element.required));
    await targetSizes(page, 'main .rs-auth-form details summary, main .rs-auth-form select');
    await summary.click();
  }
  const other = entry.key === 'login' ? '/register' : '/login';
  assert.equal(await form.locator('.rs-auth-alternative a').getAttribute('href'), other);
  return { controls: await targetSizes(page, 'main .rs-auth-form input:not([type="hidden"]):not([type="checkbox"]), main .rs-auth-form button'), formSubmitted: false };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const entries = authOnly ? [] : await expectedData();
  const browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 950 } });
  await context.route('**/*', route => { const method = route.request().method(); if (!['GET', 'HEAD'].includes(method)) { report.blockedMutations.push({ method, url: route.request().url() }); return route.abort(); } return route.continue(); });
  const destinations = new Set();
  try {
    const cases = [1440, 390, 360].flatMap(width => entries.map(entry => ({ ...entry, width }))).concat([{ key: 'login', path: '/login', width: 390, auth: true }, { key: 'register', path: '/register', width: 390, auth: true }]);
    for (const entry of cases) {
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      await page.setViewportSize({ width: entry.width, height: 950 });
      page.on('pageerror', error => report.browserErrors.push({ route: entry.path, width: entry.width, error: error.message }));
      page.on('response', response => { if (response.status() >= 400 && !response.url().includes('_rsc=')) report.failedResponses.push({ route: entry.path, width: entry.width, status: response.status(), url: response.url() }); });
      try {
        const response = await page.goto(origin + entry.path, { waitUntil: 'domcontentloaded', timeout: 90000 });
        assert.equal(response.status(), 200, 'Public page HTTP 200');
        await page.locator('main h1').waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        const geometry = await layout(page, !entry.auth);
        const detail = entry.auth ? await inspectAuth(page, entry) : await inspectListing(page, entry);
        const images = await visibleImages(page);
        const links = await page.locator('main a[href]').evaluateAll(items => items.filter(item => { const rect = item.getBoundingClientRect(); return rect.width && rect.height; }).map(item => ({ text: item.textContent.trim(), href: item.getAttribute('href') })));
        assert(links.every(link => link.href && link.href !== '#' && !link.href.toLowerCase().startsWith('javascript:')), 'Visible action destinations are usable routes');
        if (entry.width === 1440 && !entry.auth) {
          const samples = entry.records ? entry.records.slice(0, 1).map(record => entry.prefix + record.slug) : entry.hits.filter((hit, index, all) => all.findIndex(item => item.group === hit.group) === index).map(hit => hit.href);
          samples.forEach(href => destinations.add(href));
        }
        const capture = entry.auth || entry.width === 390 || (entry.width === 1440 && entry.key === 'news');
        if (capture) await page.screenshot({ path: path.join(output, entry.key + '-' + entry.width + '.png'), fullPage: false });
        await page.locator('.rs-footer').scrollIntoViewIfNeeded();
        const footerImages = await visibleImages(page);
        assert.equal(await page.locator('.rs-footer a[aria-label="Agrico home"]').getAttribute('href'), '/');
        report.routes.push({ key: entry.key, path: entry.path, width: entry.width, status: 200, title: await page.title(), ...detail, geometry, images, footerImages, visibleActionCount: links.length });
        console.log('PASS ' + entry.path + ' at ' + entry.width + 'px');
      } catch (error) {
        report.defects.push({ route: entry.path, width: entry.width, error: String(error), stack: error.stack });
        await page.screenshot({ path: path.join(output, entry.key + '-' + entry.width + '-failure.png'), fullPage: false }).catch(() => {});
        console.error('FAIL ' + entry.path + ' at ' + entry.width + 'px: ' + error.message);
      } finally { await page.close(); }
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    }
    for (const href of destinations) {
      try {
        const response = await context.request.get(origin + href, { timeout: 90000 });
        report.destinationChecks.push({ href, status: response.status(), finalUrl: response.url() });
        if (response.status() !== 200) report.defects.push({ href, error: 'Visible sample destination returned ' + response.status() });
      } catch (error) { report.defects.push({ href, error: String(error) }); }
    }
    assert.equal(report.blockedMutations.length, 0, 'No form submission or mutation was attempted');
    report.checks.push('Public GET routes only; no forms submitted; offscreen lazy images not required to load.');
    if (report.browserErrors.length || report.failedResponses.length) report.defects.push({ error: 'Browser runtime or failed resource responses were recorded', browserErrors: report.browserErrors.length, failedResponses: report.failedResponses.length });
  } finally { await browser.close(); }
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log('Secondary pages: ' + report.routes.length + ' route/width cases passed; ' + report.defects.length + ' defects.');
  process.exitCode = report.defects.length ? 1 : 0;
})().catch(error => { fs.mkdirSync(output, { recursive: true }); report.defects.push({ error: String(error), stack: error.stack }); fs.writeFileSync(reportFile, JSON.stringify(report, null, 2)); console.error(error); process.exitCode = 1; });
