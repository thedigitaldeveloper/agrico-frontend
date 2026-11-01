const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const root = process.env.AGRICO_PREVIEW_URL || 'http://localhost:3003';
const output = path.resolve(__dirname, '../docs/design/qa/agrico-home');
const widths = [320, 360, 375, 390, 414, 430, 540, 600, 700, 701, 768, 820, 900, 901, 1000, 1001, 1024, 1150, 1151, 1280, 1366, 1440, 1536, 1920];
const reports = [];
const errors = [];

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(root, { waitUntil: 'networkidle', timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      const report = await page.evaluate(() => {
        const bounds = node => node.getBoundingClientRect();
        const visible = node => bounds(node).width > 0 && bounds(node).height > 0;
        const textClipping = [...document.querySelectorAll('.ag-home h1,.ag-home h2,.ag-home h3,.ag-home h4,.ag-course-panel p,.ag-guide-card p,.ag-update-copy p,.ag-counselling__copy p')].filter(visible).flatMap(node => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const text = range.getBoundingClientRect();
          const box = bounds(node);
          return text.left < box.left - 2 || text.right > box.right + 2 ? [{ text: node.textContent, className: node.className, textWidth: text.width, available: box.width }] : [];
        });
        const guideCollisions = [...document.querySelectorAll('.ag-guide-card')].flatMap(node => {
          const description = bounds(node.querySelector('p'));
          const link = bounds(node.querySelector('.ag-text-link'));
          return description.bottom > link.top - 3 ? [node.querySelector('h3').textContent] : [];
        });
        const controlsOutside = [...document.querySelectorAll('.ag-home button,.ag-home input:not([type=hidden]),.ag-home select,.ag-header__inner > a,.ag-mobile-trigger')].filter(visible).flatMap(node => {
          const box = bounds(node);
          return box.left < -1 || box.right > innerWidth + 1 ? [{ label: node.getAttribute('aria-label') || node.textContent, left: box.left, right: box.right }] : [];
        });
        const channel = x => { x /= 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; };
        const luminance = colour => { const rgb = colour.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel); return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]; };
        const guideButton = getComputedStyle(document.querySelector('.ag-question-sheet > .ag-button'));
        const a = luminance(guideButton.color), b = luminance(guideButton.backgroundColor);
        return {
          width: innerWidth, height: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth,
          textClipping, guideCollisions, controlsOutside,
          admissionGuideContrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05),
          sections: [...document.querySelectorAll('.ag-header,.ag-home > section,.ag-footer')].map(node => ({ name: node.id || node.className, top: Math.round(bounds(node).top + scrollY), height: Math.round(bounds(node).height) })),
        };
      });
      reports.push(report);
      if ([320, 820, 1024, 1280, 1920].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, 'viewport-' + width + '.png'), animations: 'disabled' });
      }
      console.log(`${width}px: height=${report.height}; clipping=${report.textClipping.length}; guide collisions=${report.guideCollisions.length}; outside controls=${report.controlsOutside.length}`);
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const phone = await context.newPage();
    await phone.goto(root, { waitUntil: 'networkidle', timeout: 120000 });
    await phone.getByRole('button', { name: 'Open navigation', exact: true }).tap();
    assert(await phone.locator('#ag-mobile-menu').evaluate(node => node.open));
    await phone.getByRole('button', { name: 'Close navigation', exact: true }).tap();
    await phone.setViewportSize({ width: 844, height: 390 });
    await phone.locator('.ag-course-panel').getByRole('link', { name: 'View programme', exact: true }).tap();
    await phone.locator('.ag-detail h1').waitFor();
    await phone.getByRole('button', { name: 'Get programme guidance', exact: true }).tap();
    await phone.waitForFunction(() => document.querySelector('.ag-detail-dialog').open);
    const dialog = await phone.locator('.ag-detail-dialog').evaluate(node => ({ open: node.open, top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, width: node.getBoundingClientRect().width, scrollable: node.scrollHeight > node.clientHeight }));
    assert(dialog.open && dialog.top >= 0 && dialog.bottom <= 391 && dialog.width <= 844);
    assert(dialog.scrollable, 'Landscape dialog must allow its content to scroll');
    await context.close();

    fs.writeFileSync(path.join(output, 'responsive-audit.json'), JSON.stringify({ date: new Date().toISOString(), root, widths, reports, touch: { portraitMenu: 'passed', landscapeDialog: dialog }, errors }, null, 2));
    for (const report of reports) {
      assert(report.scrollWidth <= report.width + 1, 'Document overflow at ' + report.width);
      assert.deepEqual(report.textClipping, [], 'Text clipping at ' + report.width);
      assert.deepEqual(report.guideCollisions, [], 'Guide text and link collision at ' + report.width);
      assert.deepEqual(report.controlsOutside, [], 'Control outside viewport at ' + report.width);
      assert(report.admissionGuideContrast >= 4.5, 'Admission guide CTA needs readable foreground/background contrast');
    }
    assert.deepEqual(errors, []);
    console.log('PASS 24 viewport widths, text and control bounds, guide cover spacing, CTA contrast and touch portrait/landscape navigation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
