const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { parseDocument } = require('htmlparser2');
const dom = require('domutils');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..'), base = path.join(root, 'docs/content/universities-2026-10-30');
const read = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
const data = read('publication.json'), plan = read('cms-html-content-import-plan.json');
const docs = [...data.institutions, ...data.university_tabs, ...data.posts];
const compile = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file);
Module._extensions['.ts'] = compile; Module._extensions['.tsx'] = compile; Module._extensions['.css'] = () => {};
const { sanitizeSectionMarkup, scopeSectionCss } = require(path.join(root, 'src/components/cms/html-section-code.ts'));
const { publicationHtmlState } = require(path.join(root, 'src/lib/agrico/publication-html.ts'));
const { HtmlSection } = require(path.join(root, 'src/components/cms/html-section.tsx'));
const elements = (node, predicate) => dom.findAll(item => item.type === 'tag' && predicate(item), node.children || []);
(async () => {
  assert.equal(plan.records.length, 638); assert.equal(plan.posts.length, data.posts.length);
  for (const record of [...plan.records, ...plan.posts]) {
    const doc = docs.find(doc => doc.path === record.path);
    const stored = record.fields.body_html || record.fields.content[0];
    if (!record.fields.body_html) assert.equal(stored.__component, 'common.html-section');
    const block = { ...stored, __component: 'common.html-section' };
    const cleaned = parseDocument(sanitizeSectionMarkup(block.code.html));
    assert.equal(elements(cleaned, element => element.name === 'figcaption').flatMap(caption => elements(caption, child => child.name === 'a')).length, 0, doc.path + ': image-credit link present');
    assert.equal(elements(cleaned, element => element.name === 'h1').length, 0, doc.path + ': duplicate page title');
    assert.deepEqual(elements(cleaned, element => element.attribs.class?.split(' ').includes('ag-publication-section') && element.attribs.id).map(element => element.attribs.id), doc.sections.map(section => section.id), doc.path + ': section sequence');
    assert.equal(elements(cleaned, element => element.name === 'details').length, doc.faqs.length, doc.path + ': FAQs');
    const ids = new Set(elements(cleaned, element => !!element.attribs.id).map(element => element.attribs.id));
    for (const link of elements(cleaned, element => element.name === 'a' && element.attribs.href?.startsWith('#'))) assert(ids.has(link.attribs.href.slice(1)), doc.path + ': broken TOC/source target ' + link.attribs.href);
    assert.equal(elements(cleaned, element => element.name === 'a' && /https?:\/\/(?:www\.)?pushkaram\.in/i.test(element.attribs.href || '')).length, 0);
    const section = { content: [{ ...block, id: 1 }], heading: doc.title, display_name: doc.tab_label || null, seo: record.fields.seo || null };
    const state = publicationHtmlState(doc, section);
    assert(state.htmlBlock, doc.path + ': actual CMS HTML body not selected');
    assert.equal(state.doc.indexing.index, doc.indexing.index, doc.path + ': noindex lost');
    assert.equal(publicationHtmlState({ ...doc, path: doc.path + '-wrong' }, section).htmlBlock, null, doc.path + ': wrong document body accepted');
  }
  for (const doc of data.institutions) {
    const rows = plan.records.filter(row => row.university_lookup.slug === doc.slug).sort((a, b) => a.fields.position - b.fields.position);
    assert.deepEqual(rows.map(row => row.fields.secondary_slug), doc.tabs.map(tab => tab.id));
    assert.deepEqual(rows.map(row => row.fields.position), Array.from({ length: 11 }, (_, index) => index));
    assert.equal(new Set(rows.map(row => row.fields.slug)).size, 11);
  }
  const sample = plan.records.find(row => row.path === '/university/rnb-global-university/course-fee');
  const document = docs.find(doc => doc.path === sample.path);
  const edited = { ...sample.fields.content[0], id: 1, code: { ...sample.fields.content[0].code, html: sample.fields.content[0].code.html.replace('Programmes, duration and sourced fees', 'CMS edited heading proof') } };
  const selection = publicationHtmlState(document, { content: [edited], heading: document.title, display_name: document.tab_label, seo: null }, [{ secondary_slug: 'course-fee', position: -1, display_name: 'Fees first' }]);
  assert.equal(selection.doc.tabs[0].id, 'course-fee');
  assert.match(renderToStaticMarkup(React.createElement(HtmlSection, { block: selection.htmlBlock })), /CMS edited heading proof/);
  const legacyHtml = `<article data-agrico-document="${document.path}"><figcaption>Campus <a href="https://example.com/photo">Image source</a></figcaption><p class="ag-publication-image-credit">Caption <a href="https://example.com/photo">Image source</a></p><a href="/articles/agriculture-fee-budget">Read our guide</a></article>`;
  const legacy = publicationHtmlState(document, { content: [{ ...edited, code: { ...edited.code, html: legacyHtml } }], heading: document.title, display_name: document.tab_label, seo: null });
  assert.doesNotMatch(legacy.htmlBlock.code.html, /href="https:\/\/example.com\/photo"/);
  assert.match(legacy.htmlBlock.code.html, /href="\/articles\/agriculture-fee-budget"/);
  const scoped = scopeSectionCss(edited.code.css, 'proof-scope'); assert.match(scoped, /data-rs-html-section="proof-scope"/);
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(base, 'cms-html-preview.html')).href + '#read=' + encodeURIComponent(sample.path));
    assert.equal(await page.locator('#institution option').count(), data.institutions.length + data.posts.length);
    assert.equal(await page.locator('#tabs button').count(), 11);
    const frame = page.frameLocator('#preview'); await frame.locator('.ag-publication-toc').waitFor();
    assert.equal(await frame.locator('h1').count(), 0);
    assert.equal(await frame.locator('.ag-publication-section').count(), document.sections.length);
    for (const width of ['1000', '768', '390', '320']) {
      await page.locator('#width').selectOption(width);
      assert(await frame.locator('html').evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'HTML body overflow ' + width);
    }
    await page.locator('#width').selectOption('390');
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(base, 'qa/cms-html-fees-preview.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent('<style>body{margin:0;padding:16px}#outside{color:rgb(10,20,30)}</style><p id="outside">Outside the CMS block</p>' + renderToStaticMarkup(React.createElement(HtmlSection, { block: { ...sample.fields.content[0], id: 3 } })));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await page.locator('.ag-publication-toc').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(241, 245, 233)');
    assert.equal(await page.locator('#outside').evaluate(element => getComputedStyle(element).color), 'rgb(10, 20, 30)');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
  const report = { checked_on: '2026-10-31', bodies: docs.length, university_bodies: plan.records.length, editorial_bodies: data.posts.length, cms_import_executed: false, import_sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(base, 'cms-html-content-import-plan.json'))).digest('hex'), checks: ['All ' + docs.length + ' bodies pass the actual CMS sanitizer with their heading/TOC/source/FAQ sequence preserved and no duplicate H1', 'No exported gallery image-credit anchors; legacy imported credit links are removed while internal guide links remain', 'Each institution has eleven uniquely named Content Sections in position0–10', 'CMS HTML selection, editing and reordered navigation are verified; wrong-document blocks are rejected', 'Existing HTML/CSS scope compiler and 320–1000px CMS body preview pass; no live CMS import was executed'], errors };
  fs.writeFileSync(path.join(base, 'html-content-verification.json'), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
