// Read-only live QA. Run only after the RS CMS import and frontend build are ready.
// CMS calls use public GETs. Browser mutations are blocked; no form is submitted.
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
const output = path.join(root, 'docs/design/qa/catalogue-details');
const widths = process.env.RS_QA_WIDTHS ? process.env.RS_QA_WIDTHS.split(',').map(Number) : [1440, 390, 360];
assert(widths.length && widths.every(width => [1440, 390, 360].includes(width)), 'QA widths must be 1440, 390 or 360');
for (const address of [origin, cms]) assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(address).hostname), 'QA targets local RS services only');
const sourceFiles = [
  'src/components/university/university-detail-view.tsx', 'src/components/university/university-detail.css',
  'src/components/university/university-hero.tsx', 'src/components/university/university-spec-band.tsx',
  'src/components/university/university-fee-table.tsx', 'src/components/university/university-admission-sidebar.tsx',
  'src/components/university/admission-panel.tsx', 'src/components/university/section-nav.tsx',
  'src/components/university/university-enquiry-modal.tsx', 'src/components/forms/enquiry-form.tsx',
  'src/components/program/program-detail-view.tsx', 'src/components/program/programme-detail.css',
  'src/components/program/program-hero.tsx', 'src/components/program/program-admission-sidebar.tsx',
  'src/components/program/university-explorer.tsx', 'src/components/program/offering-detail-view.tsx',
  'src/lib/cms/repositories/university.ts', 'src/lib/cms/repositories/program.ts', 'src/lib/cms/repositories/content.ts',
  'src/app/university/[slug]/page.tsx', 'src/app/university/[slug]/[section]/page.tsx',
  'src/app/[slug]/page.tsx', 'src/app/[slug]/[section]/page.tsx', 'src/app/offering/[university]/[program]/page.tsx',
  'src/components/cms/section-body.tsx', 'src/app/rs.css', 'scripts/verify-rs-detail-ui.cjs',
];
const sourceHashes = () => Object.fromEntries(sourceFiles.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
const report = { date: new Date().toISOString(), origin, cms, sourceHashes: sourceHashes(), buildId: fs.existsSync(path.join(root, '.next/BUILD_ID')) ? fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim() : null, checks: [], routes: [], layouts: [], browserErrors: [], consoleErrors: [], failedResponses: [], blockedMutations: [], limitations: [] };
const normal = value => String(value || '').replace(/\s+/g, ' ').trim();
const slugOf = section => section.secondary_slug || section.slug;
const universityPath = slug => '/university/' + encodeURIComponent(slug);
const programmePath = slug => '/' + encodeURIComponent(slug);
const offeringPath = (university, programme) => '/offering/' + encodeURIComponent(university) + '/' + encodeURIComponent(programme);
function pass(label) { report.checks.push(label); console.log('PASS: ' + label); }
function save(name = 'checks.json') { fs.writeFileSync(path.join(output, name), JSON.stringify(report, null, 2) + '\n'); }

async function api(endpoint, query = {}) {
  const response = await fetch(cms + '/api/' + endpoint + '?' + qs.stringify(query, { encodeValuesOnly: true }), { method: 'GET', signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, 'Public CMS GET ' + endpoint);
  return response.json();
}
async function collection(endpoint, query = {}) {
  const entries = [];
  for (let page = 1; ; page += 1) {
    const response = await api(endpoint, { ...query, status: 'published', pagination: { page, pageSize: 100 } });
    assert(Array.isArray(response.data), endpoint + ' is a collection');
    entries.push(...response.data);
    if (!response.data.length || page >= (response.meta?.pagination?.pageCount || 1)) return entries;
  }
}
const contentPopulate = { content: { on: {
  'common.rich-text': { populate: '*' }, 'college.faq-section': { populate: { faqs: { populate: '*' } } },
  'college.steps-section': { populate: { steps: { populate: '*' } } }, 'common.highlight-list': { populate: { items: { populate: '*' } } },
  'common.bullet-list': { populate: { items: { populate: '*' } } }, 'common.notification': { populate: '*' },
  'college.fee-structure': { populate: '*' }, 'college.featured': { populate: { cards: { populate: '*' } } },
} } };
async function sectionsFor(owner, slug) {
  return collection('university-contents', { filters: { [owner]: { slug: { $eqi: slug } } }, sort: 'id:asc', populate: contentPopulate });
}
function firstSection(sections) {
  return sections.find(section => /^(overview|about)$/i.test(slugOf(section)) || /overview/i.test(section.name || '')) || sections[0] || null;
}
async function expectedData() {
  const programs = await collection('programs', { populate: { course: { populate: { level: true } }, course_mode: true, universities: { fields: ['slug', 'name'] } } });
  const byUniversity = new Map();
  for (const program of programs) for (const university of program.universities || []) {
    const group = byUniversity.get(university.slug) || { university, programs: [] };
    group.programs.push(program); byUniversity.set(university.slug, group);
  }
  assert(byUniversity.size, 'Imported published programme/university relationships exist');
  const candidates = [...byUniversity.values()].sort((a, b) => b.programs.length - a.programs.length).slice(0, 6);
  let chosen;
  for (const candidate of candidates) {
    const university = (await api('universities/slug/' + encodeURIComponent(candidate.university.slug))).data;
    const sections = await sectionsFor('university', university.slug);
    const categories = [/about|overview/i, /course|fee/i, /faq/i].filter(pattern => sections.some(item => pattern.test(slugOf(item) + ' ' + item.name))).length;
    const score = categories * 100 + Math.min(candidate.programs.length, 20) + (university.image ? 4 : 0) + (university.card_logo || university.logo ? 2 : 0);
    if (!chosen || score > chosen.score) chosen = { ...candidate, university, sections, score };
    if (categories === 3 && candidate.programs.length > 6 && university.image) break;
  }
  assert(chosen && chosen.sections.length, 'Representative university has authored detail sections');
  const ordered = chosen.programs.slice().sort((a, b) => {
    const score = p => (/MBA/i.test(p.course?.name || '') ? 10 : 0) + (/finance/i.test(p.name) ? 4 : 0) + (chosen.university.program_fees?.some(row => row.program?.slug === p.slug) ? 3 : 0);
    return score(b) - score(a);
  });
  let program, programSections;
  for (const candidate of ordered.slice(0, 8)) {
    const record = (await api('programs/slug/' + encodeURIComponent(candidate.slug))).data;
    const sections = await sectionsFor('program', candidate.slug);
    if (record && sections.length) { program = record; programSections = sections; break; }
  }
  assert(program && programSections?.length, 'Representative programme has authored content routes');
  assert(program.universities.some(item => item.slug === chosen.university.slug), 'Exact offering is a published programme-university relationship');
  const selected = { university: chosen.university, universitySections: chosen.sections, universityPrograms: chosen.programs, program, programSections };
  report.selection = { university: { slug: selected.university.slug, name: selected.university.name, documentId: selected.university.documentId, logo: selected.university.card_logo?.url || selected.university.logo?.url, image: selected.university.image?.url }, program: { slug: program.slug, name: program.full_name || program.name, documentId: program.documentId }, universitySections: chosen.sections.map(item => ({ slug: slugOf(item), name: item.name })), programmeSections: programSections.map(item => ({ slug: slugOf(item), name: item.name })), universityProgrammeCount: chosen.programs.length, exactOffering: offeringPath(chosen.university.slug, program.slug) };
  return selected;
}
function routeCases(expected) {
  const universityRoot = universityPath(expected.university.slug), programRoot = programmePath(expected.program.slug), exact = offeringPath(expected.university.slug, expected.program.slug);
  const firstUni = firstSection(expected.universitySections), firstProgram = firstSection(expected.programSections);
  const routes = [{ key: 'university-overview', kind: 'university', path: universityRoot, section: firstUni, root: true, capture: true }];
  for (const section of expected.universitySections.filter(item => /about|overview|course|fee|faq/i.test(slugOf(item)))) routes.push({ key: 'university-' + slugOf(section), kind: 'university', path: universityRoot + '/' + encodeURIComponent(slugOf(section)), section, capture: /faq/i.test(slugOf(section)) });
  const programSection = expected.programSections.find(item => item.documentId !== firstProgram?.documentId && /faq|fee|curriculum|admission/i.test(slugOf(item))) || expected.programSections.find(item => item.documentId !== firstProgram?.documentId) || firstProgram;
  routes.push({ key: 'programme-overview', kind: 'program', path: programRoot, section: firstProgram, root: true, capture: true });
  if (programSection) routes.push({ key: 'programme-' + slugOf(programSection), kind: 'program', path: programRoot + '/' + encodeURIComponent(slugOf(programSection)), section: programSection });
  routes.push({ key: 'offering-overview', kind: 'offering', path: exact, section: firstProgram, root: true, capture: true });
  if (programSection) routes.push({ key: 'offering-' + slugOf(programSection), kind: 'offering', path: exact + '?section=' + encodeURIComponent(slugOf(programSection)), section: programSection });
  return routes;
}
function blockText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(blockText).join(' ');
  if (!value || typeof value !== 'object') return '';
  return value.text || blockText(value.children || []);
}
function sampleContent(section) {
  for (const block of section?.content || []) {
    if (block.__component === 'college.faq-section') {
      const question = block.faqs?.find(item => item.title && item.description?.length)?.title;
      if (question) return normal(question);
    }
    const value = block.heading || block.name || blockText(block.body || block.description) || block.steps?.[0]?.title || block.items?.[0]?.key || block.items?.[0]?.text;
    if (normal(value).length >= 8) return normal(value).slice(0, 100);
  }
  return null;
}
async function waitHydrated(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
}
async function verifyContent(page, test, expected) {
  const headline = normal(await page.locator('main h1').innerText());
  const wanted = test.kind === 'university'
    ? test.root ? expected.university.heading || expected.university.name : test.section.heading || test.section.display_name || test.section.name || expected.university.name
    : expected.program.full_name || expected.program.name;
  assert.equal(headline, normal(wanted), test.key + ' heading matches the public CMS');
  const body = normal(await page.locator('main').innerText());
  if (test.kind === 'university') {
    assert(body.includes(normal(expected.university.name)), 'University identity remains present on section routes');
    for (const value of [expected.university.city, expected.university.state, ...(expected.university.approvals || []).map(item => item.name)].filter(Boolean)) assert(body.includes(normal(value)), 'University CMS fact is rendered: ' + value);
  }
  const sample = sampleContent(test.section);
  const content = page.locator(test.kind === 'university' ? '.rs-ud-content' : '.rs-pd-content').first();
  if (sample) assert(normal(await content.innerText()).includes(sample), test.key + ' renders authored section content');
  else report.limitations.push(test.key + ': CMS section has no supported text sample to compare.');
  const sections = test.kind === 'university' ? expected.university.university_contents || [] : expected.program.university_contents || [];
  const nav = test.kind === 'offering' ? page.getByRole('navigation', { name: 'Programme sections', exact: true }) : page.getByRole('navigation', { name: 'Sections', exact: true });
  if (sections.length > (test.kind === 'offering' ? 0 : 1)) {
    assert.equal(await nav.locator('a').count(), sections.length, 'Every CMS section retains a navigation link');
    const allowed = new Set(sections.map(slugOf));
    const expectedBase = test.kind === 'university' ? universityPath(expected.university.slug) : test.kind === 'program' ? programmePath(expected.program.slug) : offeringPath(expected.university.slug, expected.program.slug);
    for (const href of await nav.locator('a').evaluateAll(items => items.map(item => item.getAttribute('href')))) {
      const url = new URL(href, origin);
      if (test.kind === 'offering') assert(url.pathname === expectedBase && allowed.has(url.searchParams.get('section')), 'Offering section link preserves the exact pair');
      else assert(url.pathname === expectedBase || url.pathname.startsWith(expectedBase + '/') && allowed.has(decodeURIComponent(url.pathname.split('/').pop())), 'Detail navigation stays with the same entity');
    }
    assert.equal(await nav.locator('a[aria-current="page"]').count(), 1, 'One section is identified as current');
  }
  if (test.kind === 'offering') {
    assert.equal(normal(await page.locator('.rs-pd-offering-university').innerText()).replace(/→/g, ''), normal(expected.university.name), 'Offering identifies the CMS university');
    const form = page.locator('#offering-enquiry form');
    assert.equal(await form.locator('input[name="university"]').inputValue(), expected.university.slug, 'Offering enquiry university context is exact');
    assert.equal(await form.locator('input[name="program"]').inputValue(), expected.program.slug, 'Offering enquiry programme context is exact');
    assert.equal(await form.locator('input[name="consent"]').getAttribute('required'), '', 'Offering consent remains required');
    const fee = expected.university.program_fees?.find(row => row.program?.slug === expected.program.slug);
    if (fee?.fee !== null && fee?.fee !== undefined && Number.isFinite(Number(fee.fee))) {
      const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(fee.fee));
      assert(normal(await page.locator('.rs-pd-admission-fee').innerText()).includes(normal(formatted)), 'Exact university-specific fee is displayed');
    }
  }
  if (test.kind === 'program' && test.root) {
    const actual = await page.locator('#universities a[href^="/offering/"]').evaluateAll(items => items.map(item => item.getAttribute('href')));
    const wanted = (expected.program.universities || []).map(item => offeringPath(item.slug, expected.program.slug));
    assert.deepEqual([...new Set(actual)].sort(), [...new Set(wanted)].sort(), 'Every programme university row links to its actual offering');
  }
}
async function imagesDecode(page, test) {
  const images = page.locator('main img');
  const result = [];
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    if (!await image.isVisible()) continue;
    await image.scrollIntoViewIfNeeded();
    const state = await image.evaluate(async element => {
      await Promise.race([element.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timed out: ' + element.src)), 15000))]);
      return { src: element.currentSrc || element.src, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight, complete: element.complete };
    });
    assert(state.complete && state.naturalWidth > 0 && state.naturalHeight > 0, test.key + ' visible image decodes');
    result.push(state);
  }
  return result;
}
async function modal(page, trigger, expectedContext, label) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  for (const [name, value] of Object.entries(expectedContext)) assert.equal(await dialog.locator('input[name="' + name + '"]').inputValue(), value, label + ' exact ' + name + ' context');
  assert(await dialog.locator('input[name="consent"]').evaluate(input => input.required && !input.checked), 'Modal retains unchecked required consent');
  assert(await dialog.locator('input[name="name"]').inputValue() === '', 'No applicant information is entered');
  const close = dialog.getByRole('button', { name: 'Close dialog', exact: true });
  const box = await close.boundingBox();
  assert(box.width >= 43.5 && box.height >= 43.5 && box.x >= 0 && box.x + box.width <= page.viewportSize().width + 1, 'Close control stays visible with a 44px target');
  await close.focus(); await page.keyboard.press('Shift+Tab');
  assert(await dialog.evaluate(node => node.contains(document.activeElement)), 'Modal keyboard focus is trapped');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert(await trigger.evaluate(node => node === document.activeElement), 'Escape restores focus to the enquiry trigger');
  await trigger.click(); await dialog.waitFor({ state: 'visible' });
  await close.click(); await dialog.waitFor({ state: 'detached' });
  pass(label + ': opens, keeps exact context, traps focus and closes with Escape/button without submitting');
}
async function universityFeeSearch(page, expected) {
  const table = page.locator('.rs-ud-fees');
  if (!expected.universityPrograms.length) { assert.equal(await table.count(), 0); return; }
  assert.equal(await table.count(), 1, 'University overview includes its actual programmes');
  const search = table.getByRole('searchbox', { name: 'Search courses', exact: true });
  const before = await table.locator('tbody tr').count();
  const more = table.getByRole('button', { name: 'Show all programmes', exact: true });
  if (expected.universityPrograms.length > 6) {
    assert.equal(before, 6, 'Overview initially keeps programme list compact');
    await more.click();
    assert.equal(await table.locator('tbody tr').count(), expected.universityPrograms.length, 'Show all exposes every related programme');
  } else report.limitations.push('Selected university has no additional programmes beyond the initial display.');
  const first = expected.universityPrograms[0];
  await search.fill(first.name);
  const matches = expected.universityPrograms.filter(item => [item.name, item.full_name, item.course?.name].some(value => value?.toLowerCase().includes(first.name.toLowerCase())));
  assert.equal(await table.locator('tbody tr').count(), matches.length, 'Fee search filters actual programme names');
  await search.fill('rs-detail-qa-no-such-programme-849273');
  assert.equal(await table.locator('tbody tr').count(), 0, 'Unmatched fee search returns no rows');
  assert(await table.getByRole('status').isVisible(), 'Fee search shows a useful empty state');
  await table.getByRole('button', { name: 'Clear search', exact: true }).click();
  assert.equal(await search.inputValue(), '', 'Clear search resets input');
  const links = await table.locator('tbody a').evaluateAll(items => items.map(item => item.getAttribute('href')));
  const expectedLinks = expected.universityPrograms.map(item => offeringPath(expected.university.slug, item.slug));
  assert.deepEqual([...new Set(links)].sort(), [...new Set(expectedLinks)].sort(), 'University programme table preserves every exact pair');
  pass('University fee list: search, empty state, clear, show-all and exact programme links');
}
async function faqInteraction(page, test) {
  const questions = (test.section?.content || []).filter(block => block.__component === 'college.faq-section').flatMap(block => block.faqs || []).filter(item => item.title && item.description?.length);
  if (!questions.length) return;
  const control = page.getByRole('button', { name: questions[0].title, exact: true });
  if (await control.count()) {
    await control.click(); assert.equal(await control.getAttribute('aria-expanded'), 'true', 'FAQ expands');
    await control.click(); assert.equal(await control.getAttribute('aria-expanded'), 'false', 'FAQ collapses');
  } else {
    const summary = page.locator('summary').filter({ hasText: questions[0].title }).first();
    assert(await summary.count(), 'Authored FAQ has an interactive control');
    await summary.click(); assert(await summary.evaluate(item => item.parentElement.open), 'Native FAQ expands');
    await summary.click(); assert(!await summary.evaluate(item => item.parentElement.open), 'Native FAQ collapses');
  }
}
async function mobileClearance(page, test, width) {
  if (test.kind !== 'university' || width > 640) return null;
  const bar = page.locator('.rs-ud-mobile-actions > div');
  const spacer = page.locator('.rs-ud-mobile-spacer');
  const barBox = await bar.boundingBox(), spacerBox = await spacer.boundingBox();
  report.lastMobileClearance = { width, path: test.path, bar: barBox, spacer: spacerBox };
  assert(barBox && spacerBox && spacerBox.height >= barBox.height - 1, 'Mobile page reserves space for fixed admissions actions: bar=' + barBox?.height + 'px, spacer=' + spacerBox?.height + 'px');
  const last = page.locator('.rs-ud-closing a').last();
  await last.evaluate(node => node.scrollIntoView({ block: 'center' }));
  const visible = await last.evaluate(node => { const r = node.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { top: r.top, bottom: r.bottom, reachable: node === hit || node.contains(hit) }; });
  assert(visible.reachable, 'Last university CTA can scroll clear of the fixed mobile bar');
  return { barHeight: barBox.height, spacerHeight: spacerBox.height, finalActionReachable: visible.reachable };
}
async function layout(page, test, width, imageStates) {
  await page.evaluate(() => { document.activeElement instanceof HTMLElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  const metrics = await page.evaluate(() => {
    const rect = node => { if (!node) return null; const r = node.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height, right: r.right }; };
    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight,
      heading: rect(document.querySelector('main h1')), hero: rect(document.querySelector('.rs-ud-hero,.rs-pd-hero')),
      content: rect(document.querySelector('.rs-ud-content,.rs-pd-content')), nav: rect(document.querySelector('main nav[aria-label="Sections"],main nav[aria-label="Programme sections"]')),
      outside: [...document.querySelectorAll('main *')].filter(node => { const style = getComputedStyle(node), r = node.getBoundingClientRect(); return style.position !== 'absolute' && style.position !== 'fixed' && r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && !node.closest('[class*="overflow-x-auto"],.rs-pd-section-tabs'); }).slice(0, 12).map(node => ({ tag: node.tagName, class: node.className, ...rect(node) })) };
  });
  assert(metrics.documentWidth <= width + 1, test.key + ': no horizontal document overflow at ' + width);
  assert(metrics.heading.x >= -1 && metrics.heading.right <= width + 1, 'Headline remains inside the viewport');
  if (test.capture) {
    await page.screenshot({ path: path.join(output, test.key + '-' + width + '.png'), fullPage: true, animations: 'disabled' });
    await page.screenshot({ path: path.join(output, test.key + '-' + width + '-top.png'), animations: 'disabled' });
  }
  report.layouts.push({ route: test.path, width, ...metrics, images: imageStates });
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  let browser, page;
  try {
    console.log('Reading published RS catalogue through public GET endpoints');
    const expected = await expectedData();
    const cases = routeCases(expected);
    pass('Representative university, programme, content sections and exact pair resolved from the published CMS');
    browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width > 640 ? 1050 : 900 }, reducedMotion: 'reduce', isMobile: width <= 640, hasTouch: width <= 640 });
      await context.route('**/*', route => {
        const request = route.request();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) { report.blockedMutations.push({ method: request.method(), url: request.url() }); return route.abort('blockedbyclient'); }
        return route.continue();
      });
      page = await context.newPage(); page.setDefaultTimeout(18000); page.setDefaultNavigationTimeout(120000);
      page.on('pageerror', error => report.browserErrors.push({ url: page.url(), message: error.message }));
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ url: page.url(), message: message.text() }); });
      page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ url: response.url(), status: response.status(), type: response.request().resourceType() }); });
      for (const test of cases) {
        console.log('CHECK: ' + width + 'px ' + test.path);
        const response = await page.goto(origin + test.path, { waitUntil: 'domcontentloaded' });
        assert.equal(response?.status(), 200, test.path + ' returns HTTP 200');
        await waitHydrated(page, test.kind === 'university' ? '.rs-university-detail' : '.rs-programme-detail');
        await verifyContent(page, test, expected);
        await faqInteraction(page, test);
        const images = await imagesDecode(page, test);
        const clearance = await mobileClearance(page, test, width);
        await layout(page, test, width, images);
        if (test.kind === 'university' && test.root) {
          await universityFeeSearch(page, expected);
          await modal(page, page.locator('.rs-ud-hero-actions').getByRole('button', { name: 'Talk to a counsellor', exact: true }), { university: expected.university.slug }, width + 'px university counselling');
          if (width <= 640) await modal(page, page.locator('.rs-ud-mobile-actions').getByRole('button', { name: 'Talk to Us', exact: true }), { university: expected.university.slug }, width + 'px mobile university counselling');
        }
        if (test.kind === 'program' && test.root) {
          const choice = page.locator('.rs-pd-university-select select');
          if (await choice.count()) await choice.selectOption(expected.university.slug);
          await modal(page, page.locator('.rs-pd-admission-actions').getByRole('button', { name: 'Talk to a counsellor', exact: true }), { university: expected.university.slug, program: expected.program.slug }, width + 'px programme counselling');
        }
        report.routes.push({ path: test.path, kind: test.kind, width, status: response.status(), imagesDecoded: images.length, mobileClearance: clearance });
        pass(width + 'px ' + test.key + ': HTTP, CMS content, navigation, media, interactions and overflow checks'); save();
      }
      await context.close(); page = null;
    }
    assert.deepEqual(report.browserErrors, [], 'No browser runtime errors');
    assert.deepEqual(report.consoleErrors, [], 'No browser console errors');
    assert.deepEqual(report.failedResponses, [], 'No failed browser resource requests');
    assert.deepEqual(report.blockedMutations, [], 'No mutation or form submission was attempted');
    assert.deepEqual(sourceHashes(), report.sourceHashes, 'Reviewed source stayed unchanged throughout QA');
    report.status = 'passed'; save();
    fs.writeFileSync(path.join(output, 'layout.json'), JSON.stringify(report.layouts, null, 2) + '\n');
    console.log('RS detail UI QA passed. Evidence: ' + output);
  } catch (error) {
    report.status = 'failed'; report.failure = { message: error.message, stack: error.stack };
    if (page) { report.failedUrl = page.url(); await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true, animations: 'disabled' }).catch(() => {}); }
    save('failure.json'); console.error(error); process.exitCode = 1;
  } finally { if (browser) await browser.close(); }
})();
