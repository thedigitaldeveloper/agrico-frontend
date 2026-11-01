const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const media = JSON.parse(fs.readFileSync(path.join(directory, 'media-manifest.json'), 'utf8'));
const qa = path.join(directory, 'qa');
fs.mkdirSync(qa, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [], checks = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(directory, 'media-review.html')).href);
    assert.equal(await page.locator('.institution').count(), 58);
    const results = await page.locator('.preview img').evaluateAll(async images => {
      for (const img of images) img.loading = 'eager';
      return Promise.all(images.map(async img => {
        try { await img.decode(); return { src: img.getAttribute('src'), width: img.naturalWidth, height: img.naturalHeight }; }
        catch (error) { return { src: img.getAttribute('src'), error: error.message }; }
      }));
    });
    assert.equal(results.length, media.records.reduce((sum, row) => sum + row.assets.length, 0));
    assert.deepEqual(results.filter(image => image.error || !image.width), []);
    checks.push('All ' + results.length + ' selected originals decode in Chrome, including full SVG logos and embedded photographic SVGs');
    if (!process.argv.includes('--quick')) {
      await page.addStyleTag({ content: '.institution{padding:10px 0}.preview{height:135px}.preview.logo{padding:8px}.asset figcaption{padding:7px}.asset figcaption p,.meta,.note,.links{display:none}.identity{margin-bottom:7px}.identity h2{font-size:15px}.identity small{display:none}.assets{grid-template-columns:repeat(4,minmax(0,1fr))}.asset h3{font-size:10px;margin:0}.tools,.count,header,.stats{display:none}main{padding:5px 20px;max-width:none}' });
      for (let start = 0; start < media.records.length; start += 5) {
        const ids = media.records.slice(start, start + 5).map(row => row.id);
        await page.locator('.institution').evaluateAll((elements, ids) => elements.forEach(element => element.style.display = ids.includes(Number(element.dataset.institution)) ? '' : 'none'), ids);
        await page.screenshot({ path: path.join(qa, 'media-' + String(start + 1).padStart(2, '0') + '-' + Math.min(start + 5, 58) + '.png'), fullPage: true });
      }
    }
    await page.goto(pathToFileURL(path.join(directory, 'media-review.html')).href);
    await page.locator('#search').fill('rnb-global');
    assert.equal(await page.locator('.institution').count(), 1);
    assert.equal(await page.locator('.institution .asset').count(), 3);
    await page.screenshot({ path: path.join(qa, 'rnb-media.png'), fullPage: true });
    await page.locator('#search').fill('no-match-987');
    assert.equal(await page.locator('.institution').count(), 0);
    await page.locator('#search').fill('');
    await page.locator('#status').selectOption('partial');
    assert.equal(await page.locator('.institution').count(), 0);
    await page.locator('#status').selectOption('');
    checks.push('Media search, no-results and complete-collection filter behave correctly');
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Media overflow at ' + width);
    }
    await page.goto(pathToFileURL(path.join(directory, 'seo-review.html')).href);
    assert.equal(await page.locator('#institution-select option').count(), 58);
    for (const row of media.records) {
      await page.locator('#institution-select').selectOption(String(row.id));
      assert.match(await page.locator('#institution-brief h3').first().innerText(), new RegExp(row.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    assert.equal(await page.locator('#editorial .topic-grid .card').count(), 16);
    assert.equal(await page.locator('#outline .card').count(), 13);
    const missingTargets = await page.locator('.toc a').evaluateAll(links => links.filter(link => !document.querySelector(link.getAttribute('href'))).map(link => link.getAttribute('href')));
    assert.deepEqual(missingTargets, []);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'SEO review overflow at ' + width);
    }
    await page.locator('#institution-select').selectOption('57');
    await page.screenshot({ path: path.join(qa, 'seo-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(qa, 'seo-mobile.png') });
    checks.push('All 58 SEO briefs, 13 sections, 16 topic briefs and TOC targets render');
    checks.push('No document overflow at 320, 390, 768, 1024 or 1440px for either reader');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(directory, 'media-seo-verification.json'), JSON.stringify({ checked_on: '2026-10-30', checks, errors, decoded_images: results.length }, null, 2));
    for (const check of checks) console.log('PASS ' + check);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
