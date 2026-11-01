// Isolated integration checks for the real carousel, without a running app or CMS.
// Fixture products exercise selection order and native controls; they are not CMS records.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const esbuild = require(process.env.RS_ESBUILD_MODULE || require.resolve('esbuild', {
  paths: [root, path.resolve(root, '../rs-education-backend')],
}));
const { chromium } = require(process.env.RS_PLAYWRIGHT_MODULE || path.join(
  os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
));
const output = path.join(root, 'docs/design/qa/programme-alignment');
const sourcePaths = ['src/components/rs/programme-carousel.tsx', 'src/components/rs/programme-carousel.css', 'src/app/rs.css'];
const sourceHashes = Object.fromEntries(sourcePaths.map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'),
]));

const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgrammeCarousel } from './src/components/rs/programme-carousel';
const products = Array.from({ length: 7 }, (_, index) => ({ id: 'programme-' + (index + 1), name: 'Fixture University ' + (index + 1) }));
function Fixture() {
  const [filter, setFilter] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [version, setVersion] = useState(0);
  const [actions, setActions] = useState(0);
  const items = (filter ? products.filter((_, index) => index === 1 || index === 4) : products).slice();
  if (reverse) items.reverse();
  return <main className="rs-home">
    <div className="fixture-controls rs-container">
      <button onClick={() => setFilter(true)}>Filter to two</button>
      <button onClick={() => { setFilter(false); setReverse(false); setVersion(value => value + 1); }}>Restore all</button>
      <button onClick={() => setVersion(value => value + 1)}>Reset position</button>
      <button onClick={() => setReverse(value => !value)}>Reverse order</button>
      <output aria-label="Card activations">{actions}</output>
    </div>
    <section id="programmes" className="rs-container rs-section">
      <h1>Selected programme carousel fixture</h1>
      <ProgrammeCarousel items={items} resetKey={String(filter) + ':' + version} renderItem={item => (
        <article className="rs-programme-card rs-offering-card" data-product-id={item.id}>
          <header className="rs-offering-brand"><strong>{item.name}</strong></header>
          <div className="rs-offering-body">
            <h3>MBA</h3><p className="rs-programme-name">{item.id}</p>
            <label>Compare<input type="checkbox" aria-label={'Compare ' + item.id} /></label>
            <label>Notes<input type="text" aria-label={'Notes ' + item.id} defaultValue="AB" /></label>
            <label>Mode<select aria-label={'Mode ' + item.id} defaultValue="online"><option value="online">Online</option><option value="distance">Distance</option></select></label>
            <button type="button" onClick={() => setActions(value => value + 1)}>Save {item.id}</button>
            <a href={'#' + item.id} onClick={event => { event.preventDefault(); setActions(value => value + 1); }}>Details {item.id}</a>
          </div>
        </article>
      )} />
      <div className="rs-programme-more"><a href="#programmes">Explore all programmes</a></div>
    </section>
  </main>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`;

// Only reset/browser defaults and fixture controls are supplied here. Carousel layout
// comes directly from the real stylesheets, so a breakpoint or overflow regression fails.
const fixtureCss = `
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, sans-serif; }
button, input, select { font: inherit; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.fixture-controls { display: flex; flex-wrap: wrap; gap: 8px; padding-block: 14px; }
.fixture-controls button { padding: 7px; }
#programmes h1 { font-size: 22px; }
.rs-offering-body label { display: block; width: 100%; margin-bottom: 8px; font-size: 13px; }
.rs-offering-body input[type=text], .rs-offering-body select { display: block; max-width: 100%; width: 100%; }
.rs-offering-body input[type=checkbox] { margin-left: 8px; }
.rs-offering-body > button, .rs-offering-body > a { margin-block: 6px; }
`;

async function geometry(page) {
  return page.locator('.rs-programme-track').evaluate(track => {
    const box = track.getBoundingClientRect();
    const left = box.left + parseFloat(getComputedStyle(track).paddingLeft);
    const right = box.right - parseFloat(getComputedStyle(track).paddingRight);
    const cards = [...track.children].map(slide => {
      const rect = slide.getBoundingClientRect();
      return { id: slide.querySelector('[data-product-id]').dataset.productId, left: rect.left, right: rect.right, width: rect.width };
    });
    return {
      left: track.scrollLeft,
      max: track.scrollWidth - track.clientWidth,
      visible: cards.filter(card => card.left >= left - 2 && card.right <= right + 2).map(card => card.id),
      order: cards.map(card => card.id),
      overflow: document.documentElement.scrollWidth > innerWidth,
      status: track.parentElement.querySelector('[role=status]').textContent,
    };
  });
}

async function waitVisible(page, first, count) {
  await page.waitForFunction(({ first, count }) => {
    const track = document.querySelector('.rs-programme-track');
    if (!track) return false;
    const box = track.getBoundingClientRect();
    const style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft);
    const right = box.right - parseFloat(style.paddingRight);
    const visible = [...track.children].filter(slide => {
      const rect = slide.getBoundingClientRect();
      return rect.left >= left - 2 && rect.right <= right + 2;
    });
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const previous = document.querySelector('[aria-label="Previous programmes"]');
    const next = document.querySelector('[aria-label="Next programmes"]');
    // The component measures scroll in requestAnimationFrame. Wait for its actual
    // accessible button state as well as geometry, without adding arbitrary sleeps.
    const measured = previous.disabled === (track.scrollLeft <= 2) && next.disabled === (track.scrollLeft >= maximum - 2);
    return measured && visible.length === count && visible[0]?.querySelector('[data-product-id]')?.dataset.productId === first;
  }, { first, count });
}

async function alignedControls(page, visibleCount) {
  const layout = await page.locator('.rs-programme-carousel').evaluate((carousel, count) => {
    const track = carousel.querySelector('.rs-programme-track').getBoundingClientRect();
    const heading = carousel.closest('#programmes').querySelector('h1').getBoundingClientRect();
    const cards = [...carousel.querySelectorAll('[data-product-id]')].slice(0, count).map(card => card.getBoundingClientRect());
    const previous = carousel.querySelector('[aria-label="Previous programmes"]').getBoundingClientRect();
    const next = carousel.querySelector('[aria-label="Next programmes"]').getBoundingClientRect();
    const rect = carousel.getBoundingClientRect();
    return {
      wrapperPadding: parseFloat(getComputedStyle(carousel).paddingLeft),
      headingLeft: heading.left, headingRight: heading.right,
      firstCardLeft: cards[0].left, lastCardRight: cards.at(-1).right,
      trackBottom: track.bottom, cardsBottom: Math.max(...cards.map(card => card.bottom)),
      previous: { top: previous.top, right: previous.right, width: previous.width, height: previous.height },
      next: { top: next.top, left: next.left, right: next.right, width: next.width, height: next.height },
      wrapperRight: rect.right,
    };
  }, visibleCount);
  assert(layout.wrapperPadding < 4, 'Programme wrapper does not reserve side arrow gutters');
  assert(Math.abs(layout.firstCardLeft - layout.headingLeft) <= 2, 'First card aligns with the section heading left edge');
  assert(Math.abs(layout.lastCardRight - layout.headingRight) <= 2, 'Visible card row reaches the section heading right edge');
  assert([layout.previous, layout.next].every(button => button.top >= layout.trackBottom - 2 && button.top >= layout.cardsBottom && button.width >= 44 && button.height >= 44), '44px controls sit below the track without covering cards');
  assert(layout.previous.right <= layout.next.left, 'Previous and Next targets do not overlap');
  assert(Math.abs(layout.next.right - layout.wrapperRight) <= 2, 'Control pair aligns with the right section edge');
  return layout;
}

async function waitForScrollSettled(page) {
  await page.evaluate(() => { delete window.__rsProgrammeScrollSettle; });
  await page.waitForFunction(() => {
    const left = document.querySelector('.rs-programme-track').scrollLeft, now = performance.now();
    const previous = window.__rsProgrammeScrollSettle;
    if (!previous || Math.abs(previous.left - left) > .25) {
      window.__rsProgrammeScrollSettle = { left, since: now };
      return false;
    }
    return now - previous.since >= 180;
  }, undefined, { polling: 'raf' });
}

async function checkWidth(page, bundle, css, width, visibleCount) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Programme carousel integration fixture</title></head><body><div id="root"></div></body></html>');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: bundle });
  const track = page.getByLabel('Programme cards', { exact: true });
  const previous = page.getByRole('button', { name: 'Previous programmes', exact: true });
  const next = page.getByRole('button', { name: 'Next programmes', exact: true });
  await waitVisible(page, 'programme-1', visibleCount);
  await next.waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('[aria-label="Next programmes"]').disabled);
  let state = await geometry(page);
  assert.deepEqual(state.order, Array.from({ length: 7 }, (_, i) => 'programme-' + (i + 1)));
  assert.equal(state.overflow, false, `Document overflow at ${width}px`);
  assert(await previous.isDisabled(), `Previous initially disabled at ${width}px`);
  assert.match(state.status, new RegExp('Showing programmes 1 to ' + visibleCount + ' of 7'));
  const alignment = await alignedControls(page, visibleCount);

  let steps = 0;
  while (steps < 7 - visibleCount) {
    assert(await next.isEnabled(), 'Next stays available until the final product');
    await next.click();
    steps += 1;
    await waitVisible(page, 'programme-' + (steps + 1), visibleCount);
    assert(await previous.isEnabled());
  }
  assert(await next.isDisabled(), 'Next disables at the final product');
  await waitVisible(page, 'programme-' + (8 - visibleCount), visibleCount);
  state = await geometry(page);
  assert(Math.abs(state.left - state.max) <= 2, `Final card reached at ${width}px`);
  assert.equal(steps, 7 - visibleCount, 'Arrows advance one product at a time');
  assert.equal(state.overflow, false);

  for (let first = 7 - visibleCount; first >= 1; first -= 1) {
    await previous.click();
    await waitVisible(page, 'programme-' + first, visibleCount);
  }
  assert(await previous.isDisabled(), 'Previous disables at the first product');
  await next.click();
  await waitVisible(page, 'programme-2', visibleCount);

  await page.getByRole('button', { name: 'Reset position', exact: true }).click();
  await waitVisible(page, 'programme-1', visibleCount);
  await page.waitForFunction(() => document.querySelector('[aria-label="Previous programmes"]').disabled);
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await waitVisible(page, 'programme-2', visibleCount);
  assert(await track.evaluate(element => document.activeElement === element));
  await page.keyboard.press('ArrowLeft');
  await waitVisible(page, 'programme-1', visibleCount);

  if (width <= 390) {
    await waitForScrollSettled(page);
    const box = await track.boundingBox();
    const client = await page.context().newCDPSession(page);
    try {
      // Dispatch actual browser touch input. Headless Chrome on this Windows host
      // accepts synthesizeScrollGesture(touch) without delivering a scroll gesture.
      // No DOM scroll API or pointer-handler mock is used for the swipe check.
      const startX = box.x + box.width * 0.82;
      const y = box.y + 35;
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y, id: 1 }] });
      for (let step = 1; step <= 12; step += 1) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: startX - box.width * 0.72 * step / 12, y, id: 1 }],
        });
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await waitVisible(page, 'programme-2', visibleCount);
      await waitForScrollSettled(page);
      assert((await geometry(page)).left > 2, 'Real touch swipe advances the native scroll track');
    } finally {
      await client.detach();
    }
    await page.getByRole('button', { name: 'Reset position', exact: true }).click();
    await waitVisible(page, 'programme-1', visibleCount);
    await waitForScrollSettled(page);
  }

  const first = page.locator('[data-product-id="programme-1"]');
  const checkbox = first.getByRole('checkbox');
  await checkbox.focus();
  await page.keyboard.press('Space');
  assert(await checkbox.isChecked(), 'Native checkbox Space activation is preserved');
  const notes = first.getByRole('textbox');
  await notes.focus();
  await notes.evaluate(input => input.setSelectionRange(2, 2));
  await page.keyboard.press('ArrowLeft');
  assert.equal(await notes.evaluate(input => input.selectionStart), 1, 'Native input cursor movement is preserved');
  const mode = first.getByRole('combobox');
  await mode.focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await mode.inputValue(), 'distance', 'Native select keyboard changes are preserved');
  await first.getByRole('button').focus();
  await page.keyboard.press('Space');
  await first.getByRole('link').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.getByLabel('Card activations').textContent(), '2', 'Native button and link activation are preserved');
  assert((await geometry(page)).left <= 2, 'Card controls must not navigate the carousel');
  const canceled = await first.locator('a,button,input,select').evaluateAll(controls => controls.map(control =>
    !control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })),
  ));
  assert(canceled.every(value => !value), 'Carousel must not cancel nested control arrow keys');

  await next.click();
  await waitVisible(page, 'programme-2', visibleCount);
  await page.getByRole('button', { name: 'Filter to two', exact: true }).click();
  await waitVisible(page, 'programme-2', Math.min(visibleCount, 2));
  state = await geometry(page);
  assert.deepEqual(state.order, ['programme-2', 'programme-5'], 'Filter preserves selected product order');
  assert(state.left <= 2, 'Filter resets scroll position');
  assert.equal(state.overflow, false);
  if (visibleCount >= 2) assert(await page.locator('.rs-programme-carousel-controls').isHidden(), 'Controls hide when all filtered products fit');
  else {
    assert(await previous.isDisabled());
    assert(await next.isEnabled());
  }

  await page.getByRole('button', { name: 'Restore all', exact: true }).click();
  await waitVisible(page, 'programme-1', visibleCount);
  await next.click();
  await waitVisible(page, 'programme-2', visibleCount);
  await page.getByRole('button', { name: 'Reverse order', exact: true }).click();
  await waitVisible(page, 'programme-7', visibleCount);
  state = await geometry(page);
  assert.deepEqual(state.order, Array.from({ length: 7 }, (_, i) => 'programme-' + (7 - i)));
  assert(state.left <= 2, 'CMS-style ordering change resets position without resetKey changing');
  assert.equal(state.overflow, false);
  if (process.env.RS_CAROUSEL_CAPTURE) await page.screenshot({ path: path.join(output, `carousel-${width}.png`), fullPage: true });
  return { width, visible: visibleCount, arrowStepsToEnd: steps, alignment, checks: ['ordered geometry', 'header and card row edge alignment', '44px right-aligned controls below track without overlap', 'both arrow ends', 'keyboard arrows', ...(width <= 390 ? ['native touch swipe and inertia settling'] : []), 'native card controls', 'same-items reset', 'filter reset with controls hidden when products fit', 'order-change reset', 'no document overflow'] };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const built = await esbuild.build({
    absWorkingDir: root, stdin: { contents: fixture, resolveDir: root, sourcefile: 'programme-carousel-fixture.tsx', loader: 'tsx' },
    bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', target: ['chrome110'],
    loader: { '.css': 'empty' }, define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
  });
  const css = fixtureCss + '\n' + fs.readFileSync(path.join(root, 'src/app/rs.css'), 'utf8') + '\n' +
    fs.readFileSync(path.join(root, 'src/components/rs/programme-carousel.css'), 'utf8');
  const browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  let page;
  const errors = [];
  const results = [];
  try {
    for (const [width, count] of [[1440, 4], [1031, 3], [768, 2], [390, 1], [360, 1]]) {
      page = await browser.newPage({ reducedMotion: 'reduce', isMobile: width <= 390, hasTouch: width <= 768 });
      page.setDefaultTimeout(10000);
      page.on('pageerror', error => errors.push(error.message));
      results.push(await checkWidth(page, built.outputFiles[0].text, css, width, count));
      console.log(`Carousel ${width}px: ${count} visible; arrows, keyboard, controls, reset, filtering${width <= 390 ? ' and touch swipe' : ''} passed`);
      await page.close();
      page = undefined;
    }
    assert.deepEqual(errors, [], 'No browser runtime errors');
    const report = { date: new Date().toISOString(), fixture: 'Actual ProgrammeCarousel with seven ordered synthetic products, real component/CSS, no running app or CMS', sourceHashes, results, errors };
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(report, null, 2));
    for (const name of ['failure.json', 'failure.png']) fs.rmSync(path.join(output, name), { force: true });
  } catch (error) {
    if (page) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ date: new Date().toISOString(), sourceHashes, results, errors, error: String(error), stack: error.stack }, null, 2));
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
