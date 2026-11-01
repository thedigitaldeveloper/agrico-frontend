// Read-only local integration QA against the actual imported CMS catalogue.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const qs = require('qs');
const { chromium } = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/design/qa/catalogue-home-listings');
const origin = 'http://localhost:3003';
const cms = 'http://127.0.0.1:1340/api/';
const widths = [1440, 1031, 768, 390, 360];
const files = ['src/components/rs/home.tsx', 'src/components/rs/home-types.ts', 'src/components/rs/home-interactions.tsx', 'src/components/rs/home-sections.css', 'src/components/rs/university-section.tsx', 'src/components/rs/university-section.css', 'src/components/rs/content-carousel.tsx', 'src/components/rs/content-carousel.css', 'src/lib/cms/repositories/home.ts', 'src/lib/cms/repositories/rs-home.ts', 'src/lib/cms/repositories/rs-catalogue.ts', 'src/components/university/university-card.tsx', 'src/components/ui/listing.css', 'src/app/programs/page.tsx', 'src/app/universities/page.tsx'];
const report = { date: new Date().toISOString(), sourceHashes: Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])), checks: [], layouts: [], errors: [] };
const pass = label => { report.checks.push(label); console.log('PASS: ' + label); };
async function api(route, query) {
  const response = await fetch(cms + route + '?' + qs.stringify(query, { encodeValuesOnly: true }), { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, 'Public CMS read ' + route);
  return response.json();
}
async function all(route) {
  const records = [];
  for (let page = 1; ; page++) {
    const value = await api(route, { view: 'homepage', status: 'published', pagination: { page, pageSize: 100 } });
    records.push(...value.data);
    if (!value.data.length || page >= value.meta.pagination.pageCount) return records;
  }
}
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.loading !== 'lazy' || image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {}))); });
}
async function noOverflow(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ' has no document overflow');
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const [universities, programmes, homeValue] = await Promise.all([
    all('universities'), all('programs'), api('home', { populate: {
      featured_universities: { populate: { university: { fields: ['slug', 'name'] } } },
      featured_offerings: { populate: { university: { fields: ['slug'] }, program: { fields: ['slug'] } } },
      featured_news: { populate: { post: { fields: ['slug'] } } }, featured_blogs: { populate: { post: { fields: ['slug'] } } },
    } }),
  ]);
  const home = homeValue.data;
  const byUniversity = new Map(universities.map(item => [item.slug, item]));
  const byProgramme = new Map(programmes.map(item => [item.slug, item]));
  const pairs = programmes.flatMap(programme => [...new Map((programme.universities ?? []).filter(university => byUniversity.has(university.slug)).map(university => [university.slug, { university: byUniversity.get(university.slug), programme }])).values()]);
  const expectedUniversities = [...new Map((home.featured_universities ?? []).map(item => item.university).filter(item => item && byUniversity.has(item.slug)).map(item => [item.slug, byUniversity.get(item.slug)])).values()];
  const expectedOfferings = (home.featured_offerings ?? []).filter(item => item.university && item.program && byUniversity.has(item.university.slug) && byProgramme.get(item.program.slug)?.universities.some(university => university.slug === item.university.slug));
  report.inventory = { universities: universities.length, programmes: programmes.length, offeringPairs: pairs.length, selectedUniversities: expectedUniversities.length, selectedOfferings: expectedOfferings.length };
  assert.equal(universities.length, 17); assert.equal(programmes.length, 141); assert(pairs.length > 100);
  pass('Full imported published catalogue is present, with exact valid university/programme pairs');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => report.errors.push(String(error)));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      const response = await page.goto(origin, { waitUntil: 'load' });
      assert.equal(response.status(), 200); await settle(page); await noOverflow(page, 'Home ' + width);
      assert.equal(await page.locator('#programmes .rs-programme-card').count(), expectedOfferings.length);
      assert.deepEqual(await page.locator('.rs-uni-card').evaluateAll(cards => cards.map(card => card.dataset.rsUniversitySlide)), expectedUniversities.map(item => item.documentId));
      assert.equal(await page.locator('#universities img:not(.rs-uni-logo img)').count(), 0);
      const layout = await page.evaluate(() => {
        const measure = selector => {
          const section = document.querySelector(selector); if (!section) return null;
          const track = section.querySelector('.rs-programme-track,.rs-uni-track,.rs-content-track');
          const heading = section.querySelector('.rs-section-heading h2');
          const cards = track ? [...track.children].map(item => item.getBoundingClientRect()) : [];
          const box = track?.getBoundingClientRect();
          const visible = box ? cards.filter(card => card.left >= box.left - 1 && card.right <= box.right + 1) : [];
          return { selector, height: section.getBoundingClientRect().height, visible: visible.length, leftDelta: heading && visible[0] ? visible[0].left - heading.getBoundingClientRect().left : null, cardHeights: cards.map(card => card.height) };
        };
        return { width: innerWidth, height: document.documentElement.scrollHeight, sections: ['#programmes', '#universities', '#news', '#blogs', '#admission-steps', '.rs-faq', '#guidance'].map(measure).filter(Boolean) };
      });
      for (const selector of ['#programmes', '#universities']) {
        const section = layout.sections.find(item => item.selector === selector);
        const selected = selector === '#programmes' ? expectedOfferings.length : expectedUniversities.length;
        assert.equal(section.visible, Math.min(selected, width >= 1200 ? 4 : width > 900 ? 3 : width > 640 ? 2 : 1));
        assert(Math.abs(section.leftDelta) <= 1, selector + ' heading and first card align');
      }
      for (let i = 0; i < expectedUniversities.length; i++) {
        const university = expectedUniversities[i]; const card = page.locator('.rs-uni-card').nth(i);
        const actual = await card.innerText();
        assert(actual.includes(university.name));
        if (university.city) assert(actual.includes(university.city));
        if (university.ownership_type?.name) assert(actual.includes(university.ownership_type.name));
        for (const approval of (university.approvals ?? []).slice(0, 2)) assert(actual.includes(approval.name));
        const count = pairs.filter(pair => pair.university.slug === university.slug).length;
        if (count) assert.equal((await card.locator('.rs-uni-facts dd').first().innerText()).trim(), String(count));
      }
      report.layouts.push(layout);
      await page.screenshot({ path: path.join(output, 'home-' + width + '.png'), fullPage: true, animations: 'disabled' });
      await page.locator('#universities').screenshot({ path: path.join(output, 'universities-' + width + '.png'), animations: 'disabled' });
    }
    pass('Home: five responsive widths, CMS order/data, 4/3/2/1 cards, aligned guides and no university campus photos or page overflow');
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(origin);
    const chips = page.locator('#programmes .rs-tabs button');
    if (await chips.count() > 1) {
      await chips.nth(1).click(); assert(await page.locator('#programmes .rs-programme-card').count() > 0);
      await page.getByRole('button', { name: 'All programmes', exact: true }).click();
      assert.equal(await page.locator('#programmes .rs-programme-card').count(), expectedOfferings.length);
    }
    const checks = page.locator('#programmes .rs-compare-check input');
    if (await checks.count() > 2) {
      await checks.nth(0).check(); await checks.nth(1).check(); assert(await checks.nth(2).isDisabled());
      await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
      assert.equal(await page.locator('#programmes .rs-compare-check input:checked').count(), 0);
      await checks.nth(0).check(); await checks.nth(1).check();
    }
    for (const label of ['Fees', 'Eligibility', 'Programme details', 'Compare programmes']) {
      const trigger = page.locator('.rs-comparison-actions').getByRole('button', { name: label, exact: true });
      if (await trigger.count()) {
        await trigger.click(); await page.locator('.rs-compare-table').waitFor();
        await page.getByRole('button', { name: 'Close details', exact: true }).click();
        assert(await trigger.evaluate(item => document.activeElement === item));
      }
    }
    if (await page.locator('.rs-faq details').count() > 1) { const faq = page.locator('.rs-faq details').nth(1); await faq.locator('summary').click(); assert(await faq.getAttribute('open') !== null); }
    await page.locator('#rs-name').fill('UI validation'); await page.locator('#rs-phone').fill('123');
    await page.locator('.rs-callback-form input[name="consent"]').check(); await page.locator('.rs-callback-form button[type="submit"]').click();
    await page.locator('#rs-form-status').waitFor(); assert.equal(await page.locator('#rs-name').inputValue(), 'UI validation');
    pass('Home degree tabs, comparison limit/clear/details/focus, FAQ and invalid enquiry preservation work');
    for (const course of ['mba', 'bba', 'mca']) {
      await page.goto(origin);
      const courseLabel = programmes.find(programme => programme.course?.slug === course)?.course.name;
      assert(courseLabel, 'Actual course label exists');
      await page.locator('.rs-hero-tabs').getByRole('button', { name: courseLabel, exact: true }).click();
      await page.getByRole('button', { name: 'Find my programme', exact: true }).click();
      await page.waitForURL(url => url.pathname === '/programs' && url.searchParams.get('course') === course);
      const expected = pairs.filter(pair => pair.programme.course?.slug === course).length;
      assert(expected > 0); assert((await page.locator('.rs-page-heading').innerText()).includes(String(expected)));
      assert.equal(await page.locator('.rs-programme-card').count(), Math.min(12, expected));
      const href = await page.locator('.rs-programme-card .rs-offering-actions .rs-button').first().getAttribute('href');
      assert(pairs.some(pair => href === '/offering/' + pair.university.slug + '/' + pair.programme.slug));
      if (course === 'mba') {
        for (const width of [1440, 390, 360]) { await page.setViewportSize({ width, height: 1000 }); await settle(page); await noOverflow(page, 'MBA listing'); await page.screenshot({ path: path.join(output, 'mba-listing-' + width + '.png'), fullPage: true, animations: 'disabled' }); }
        await page.getByRole('searchbox', { name: 'Search programs', exact: true }).fill('zz-no-course');
        await page.getByRole('search').getByRole('button', { name: 'Search', exact: true }).click(); await page.getByText('Nothing matches “zz-no-course”', { exact: true }).waitFor();
        await page.getByRole('link', { name: 'Clear the search', exact: true }).click(); await page.waitForURL(url => url.searchParams.get('course') === course && !url.searchParams.has('q'));
        if (expected > 12) { await page.getByRole('link', { name: 'Page 2', exact: true }).click(); await page.waitForURL(url => url.searchParams.get('page') === '2' && url.searchParams.get('course') === course); assert(await page.locator('.rs-programme-card').count() > 0); }
      }
    }
    pass('MBA/BBA/MCA finder shows every published matching offering; exact CTAs, retained filters, search reset and pagination work');
    await page.goto(origin + '/universities'); assert.equal(await page.locator('[data-university-card]').count(), 12);
    for (const width of [1440, 390, 360]) { await page.setViewportSize({ width, height: 1000 }); await settle(page); await noOverflow(page, 'University listing'); await page.screenshot({ path: path.join(output, 'university-listing-' + width + '.png'), fullPage: true, animations: 'disabled' }); }
    await page.getByRole('link', { name: 'Page 2', exact: true }).click(); await page.waitForFunction(() => document.querySelectorAll('[data-university-card]').length === 5); assert.equal(await page.locator('[data-university-card]').count(), 5);
    pass('All17 university records are accessible through compact responsive listing and pagination');
    await page.goto(origin); const post = page.locator('.rs-blogs .rs-post-title-link').first();
    if (await post.count()) { const href = await post.getAttribute('href'); await post.click(); await page.waitForURL('**' + href); assert.equal((await page.locator('h1').count()) > 0, true); }
    const redirects = JSON.parse(fs.readFileSync(path.join(root, 'src/config/catalogue-programme-redirects.json')));
    for (const redirect of redirects) {
      const response = await fetch(origin + '/offering/' + redirect.universitySlug + '/' + redirect.oldProgrammeSlug, { redirect: 'manual' });
      assert.equal(response.status, 308, 'Legacy offering permanently redirects');
      assert.equal(new URL(response.headers.get('location'), origin).pathname, '/offering/' + redirect.universitySlug + '/' + redirect.newProgrammeSlug);
    }
    pass('Four legacy homepage offering links redirect to their exact canonical university/programme pairs');
    assert.deepEqual(report.errors, []); pass('Editorial destinations work and no browser runtime errors occurred');
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ inventory: report.inventory, checks: report.checks.length }));
})().catch(error => { fs.mkdirSync(output, { recursive: true }); report.failure = String(error.stack || error); fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(report, null, 2)); console.error(error); process.exitCode = 1; });
