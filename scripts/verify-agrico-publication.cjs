const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'docs/content/universities-2026-10-30');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const publication = read('publication.json');
const report = read('publication-validation.json');
const documents = [...publication.institutions, ...(publication.university_tabs || []), ...publication.posts, ...publication.states];
const base = process.env.AGRICO_QA_URL || 'http://127.0.0.1:3003';
const qa = path.join(directory, 'qa');
fs.mkdirSync(qa, { recursive: true });
(async () => {
  assert.deepEqual(report.issues, []);
  assert.equal(publication.institutions.length, 58);
  assert.equal(publication.university_tabs.length, 580);
  assert.equal(documents.length, publication.institutions.length + publication.university_tabs.length + publication.posts.length + publication.states.length);
  assert.equal(publication.posts.filter(post => post.kind === 'Articles').length, report.articles);
  assert.equal(publication.posts.filter(post => post.id.startsWith('institution-guide-')).length, 58);
  assert.equal(publication.posts.filter(post => post.related_institution_ids?.length === 1 && post.related_institution_ids[0] === 46).length > 0, true);
  assert.equal(publication.posts.filter(post => post.kind === 'Blog').length, 6);
  assert.equal(publication.posts.filter(post => post.kind === 'News').length, 2);
  const errors = [], checks = [], responses = [];
  let images = 0;
  for (const row of read('media-manifest.json').records) for (const asset of row.assets) {
    const file = path.join(root, 'public/images/institutions', row.slug, path.basename(asset.file));
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), asset.sha256, file);
    images++;
  }
  checks.push('All ' + images + ' public image copies match the stored authentic originals byte for byte');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(directory, 'publication-review.html')).href);
    assert.equal(await page.locator('#list button').count(), documents.length);
    for (const doc of documents) {
      await page.evaluate(href => show(href), doc.path);
      assert.equal(await page.locator('main h1').innerText(), doc.title);
      assert.equal(await page.locator('main .section').count(), doc.sections.length);
      assert.equal(await page.locator('main details').count(), doc.faqs.length);
      const targets = await page.locator('.toc a').evaluateAll(links => links.filter(link => !document.getElementById(link.getAttribute('href').slice(1))).map(link => link.getAttribute('href')));
      assert.deepEqual(targets, [], doc.path);
    }
    checks.push('All ' + documents.length + ' offline documents render the matching body, TOC targets and FAQs');
    console.log('PASS Offline reader: all ' + documents.length + ' documents and TOC targets');
    await page.locator('#kind').selectOption('Articles');
    assert.equal(await page.locator('#list button').count(), report.articles);
    await page.locator('#kind').selectOption('Blog');
    assert.equal(await page.locator('#list button').count(), 6);
    await page.locator('#kind').selectOption('News');
    assert.equal(await page.locator('#list button').count(), 2);
    await page.locator('#kind').selectOption('');
    await page.locator('#search').fill('RNB Global');
    assert.equal(await page.locator('#list button').count(), 11 + publication.posts.filter(p => p.slug.includes('rnb-global')).length);
    await page.locator('#search').fill('');
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => show('/university/rnb-global-university'));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Offline overflow ' + width);
    }
    checks.push('Offline content-type filters, search and 320–1440px layouts work');
    const pending = documents.map(doc => doc.path);
    async function worker() {
      while (pending.length) {
        const route = pending.shift();
        const response = await page.request.get(base + route, { timeout: 120000 });
        const status = response.status();
        const html = await response.text();
        await response.dispose();
        assert.equal(status, 200, route + ': ' + html.slice(0, 100));
        assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, route + ': H1 count');
        assert.match(html, /ag-publication-body/, route + ': complete body absent');
        for (const match of html.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/g)) assert.doesNotMatch(match[1], /<a\b/i, route + ': image credit link');
        assert.doesNotMatch(html, /href="https?:\/\/(?:www\.)?pushkaram\.in/i, route + ': unrelated source domain remains clickable');
        const doc = documents.find(item => item.path === route);
        const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || '';
        assert.equal(/\bnoindex\b/.test(robots), doc.indexing?.index === false, route + ': indexing policy');
        assert.match(html, /<meta property="og:image" content="[^"]+"/, route + ': social image missing');
        const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => { const data = JSON.parse(match[1]); return data['@graph'] || (Array.isArray(data) ? data : [data]); });
        assert.equal(schemas.filter(item => ['WebPage', 'CollectionPage'].includes(item['@type']) && item.url?.endsWith(route)).length, 1, route + ': page schema');
        const article = schemas.find(item => ['Article', 'NewsArticle'].includes(item['@type']));
        if (article) { assert(article.image?.length, route + ': article image'); assert.equal(article.datePublished, doc.published_on); assert.match(article.author.url, /\/editorial-policy$/); }
        const organization = schemas.find(item => item['@type'] === 'Organization' && item['@id']?.endsWith('/#organization'));
        assert(organization?.logo?.url?.endsWith('/branding/agrico-logo.png'), route + ': incorrect publisher logo');
        responses.push({ route, status });
      }
    }
    await worker();
    checks.push('All ' + documents.length + ' local frontend routes return 200 with one H1 and the complete content body');
    checks.push('No gallery caption links are rendered on any content route');
    checks.push('All ' + documents.length + ' routes match their indexing policy and have social-image/page schema metadata; editorial images, author links and draft dates are accurate');
    console.log('PASS Frontend: all ' + documents.length + ' content routes return complete 200 responses');
    const examples = ['/university/rnb-global-university', '/university/adhiparasakthi-agricultural-college', publication.institutions.find(doc => doc.institution_id === 14).path, '/articles/agriculture-fee-budget', '/blogs/reading-an-agriculture-fee-letter', publication.posts.find(doc => doc.kind === 'News').path, publication.states[0].path];
    for (const route of examples) {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(await page.locator('h1').count(), 1);
      const doc = documents.find(doc => doc.path === route);
      assert.equal(await page.locator('.ag-publication-toc li').count(), doc.toc.length);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      assert.equal(new URL(canonical).pathname, route);
      assert.equal(await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.flatMap(script => { const item = JSON.parse(script.textContent); return Array.isArray(item) ? item : [item]; }).filter(item => item['@type'] === 'BreadcrumbList').length), 1);
      const broken = await page.locator('.ag-publication-toc a').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.href));
      assert.deepEqual(broken, []);
      if (doc.faqs.length) await page.locator('.ag-publication-body details').first().click();
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ': overflow ' + width);
      }
      if (route.includes('rnb-global')) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(qa, 'publication-rnb-desktop.png') });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(qa, 'publication-rnb-mobile.png') });
        await page.locator('#programmes-fees').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(qa, 'publication-rnb-fees-mobile.png') });
      }
    }
    checks.push('Representative institution, veterinary, article, blog, news and state pages have working TOCs, canonicals, breadcrumbs and responsive tables');
    for (const doc of publication.university_tabs.filter(doc => doc.institution_id === 57)) {
      await page.goto(base + doc.path, { waitUntil: 'domcontentloaded', timeout: 120000 });
      assert.equal(await page.locator('h1').innerText(), doc.title);
      assert.equal(await page.locator('nav[aria-label="University pages"] a').count(), 11);
      await page.waitForFunction(label => document.querySelector('.ag-detail-nav [aria-current="page"]')?.textContent === label, doc.tab_label);
      assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname, doc.path);
      if (doc.tab_slug === 'course-fee') {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(qa, 'publication-rnb-fee-tab-desktop.png') });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(qa, 'publication-rnb-fee-tab-mobile.png') });
      }
    }
    checks.push('All ten RNB tab pages have their own body, H1, canonical and correct active university tab');

    await page.goto(base + '/blogs/icar-accreditation-how-to-check', { timeout: 120000 });
    await page.waitForURL('**/articles/icar-accreditation-how-to-check');
    await page.goto(base + '/articles/reading-an-agriculture-fee-letter', { timeout: 120000 });
    await page.waitForURL('**/blogs/reading-an-agriculture-fee-letter');
    checks.push('Wrong editorial route families redirect to their canonical Article/Blog URLs');
    await page.goto(base + '/agriculture-colleges?q=Punjab', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.ag-publication-card').count(), publication.institutions.filter(doc => doc.identity.state === 'Punjab').length);
    await page.goto(base + '/university/rnb-global-university', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Get admission guidance', exact: true }).click();
    await page.locator('.ag-detail-dialog').waitFor({ state: 'visible', timeout: 10000 });
    assert(await page.locator('.ag-detail-dialog').isVisible());
    assert.match(await page.locator('.ag-detail-dialog').innerText(), /RNB Global University/);
    await page.getByRole('button', { name: 'Close enquiry' }).click();
    checks.push('Directory search and institution-preserving enquiry dialog work without submitting a lead');
    for (const [segment, docs] of [['universities', [...publication.institutions, ...publication.university_tabs, ...publication.states]], ['posts', publication.posts]]) {
      const xml = await (await page.request.get(base + '/sitemap/' + segment + '.xml')).text();
      for (const doc of docs) assert.equal(xml.includes(doc.path + '</loc>'), doc.indexing?.index !== false, 'Sitemap indexing mismatch ' + doc.path);
    }
    checks.push('Sitemap segments include eligible canonical URLs and exclude all ' + publication.university_tabs.filter(doc => doc.indexing?.index === false).length + ' evidence-deferred tabs');
    await page.goto(base + '/university/rnb-global-university/overview', { waitUntil: 'domcontentloaded' });
    assert.equal(new URL(page.url()).pathname, '/university/rnb-global-university');
    const staticXml = await (await page.request.get(base + '/sitemap/static.xml')).text();
    assert(!staticXml.includes('<lastmod>'), 'Unknown static modification dates must be omitted');
    await page.goto(base + '/editorial-policy', { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.locator('main').innerText(), /AI tools assist/);
    checks.push('Overview aliases redirect, sitemap dates are honest and the editorial methodology page is available');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(directory, 'publication-browser-verification.json'), JSON.stringify({ checked_on: '2026-10-31', content_sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, 'publication.json'))).digest('hex'), base, checks, errors, documents: documents.length, public_images: images, responses }, null, 2));
    for (const check of checks) console.log('PASS ' + check);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
