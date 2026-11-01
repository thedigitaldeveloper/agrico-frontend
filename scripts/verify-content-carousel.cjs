// Actual RsContentCarousel and CSS with local synthetic records; no app/CMS writes.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const esbuild = require(process.env.RS_ESBUILD_MODULE || require.resolve('esbuild', { paths: [root, path.resolve(root, '../rs-education-backend')] }));
const { chromium } = require(process.env.RS_PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const output = path.join(root, 'docs/design/qa/content-carousel');
const sourcePaths = ['src/components/rs/content-carousel.tsx', 'src/components/rs/content-carousel.css', 'src/app/rs.css'];
const sourceHashes = Object.fromEntries(sourcePaths.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RsContentCarousel } from './src/components/rs/content-carousel';
const records = Array.from({ length: 7 }, (_, index) => ({ id: 'item-' + (index + 1), name: index === 2 ? 'An intentionally long synthetic editorial title that remains readable at every width' : 'Synthetic content item ' + (index + 1) }));
const groups = [records.slice(0, 3), records.slice(3, 6), records.slice(6)].map((items, index) => ({ id: 'page-' + (index + 1), items }));
function Fixture() {
  const [pages, setPages] = useState(false), [filter, setFilter] = useState(false), [reverse, setReverse] = useState(false), [empty, setEmpty] = useState(false), [actions, setActions] = useState(0);
  let items = (pages ? groups : records).slice();
  if (filter) items = items.slice(0, 1);
  if (empty) items = [];
  if (reverse) items.reverse();
  function card(item) { return <article className="fixture-content-card" data-item={item.id}><h3>{item.name}</h3><p>Local content for checking responsive geometry and accessible navigation.</p><label>Notes<input aria-label={'Notes ' + item.id} defaultValue="AB" /></label><button type="button" onClick={() => setActions(value => value + 1)}>Save {item.id}</button><a href={'#' + item.id} onClick={event => { event.preventDefault(); setActions(value => value + 1); }}>Read {item.id}</a></article>; }
  return <main className="rs-home"><div className="rs-container fixture-controls">
    <button onClick={() => { setPages(false); setEmpty(false); setFilter(false); setReverse(false); }}>Cards mode</button>
    <button onClick={() => { setPages(true); setEmpty(false); setFilter(false); setReverse(false); }}>Pages mode</button>
    <button onClick={() => setReverse(value => !value)}>Reverse order</button>
    <button onClick={() => setFilter(true)}>Only one</button>
    <button onClick={() => { setEmpty(false); setFilter(false); setReverse(false); }}>Restore all</button>
    <button onClick={() => setEmpty(true)}>Clear items</button><output aria-label="Card activations">{actions}</output>
  </div><section className="rs-container rs-section"><h2>Content carousel fixture</h2>
    <RsContentCarousel label="Editorial selections" pages={pages} itemKeys={items.map(item => item.id)}>{items.map(item => pages ? <div className="fixture-group" data-group={item.id}>{item.items.map(card)}</div> : card(item))}</RsContentCarousel>
  </section></main>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`;
const defaults = `
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}button,input{font:inherit}a{color:inherit}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.fixture-controls{display:flex;flex-wrap:wrap;gap:8px;padding-block:12px}.fixture-controls button{min-height:44px}
.fixture-content-card{min-width:0;border:1px solid #ddd4ca;border-radius:8px;background:#fff;padding:20px;color:#6b6260}
.fixture-content-card h3{font-size:20px;line-height:1.4;overflow-wrap:anywhere;margin:0 0 12px}
.fixture-content-card p{font-size:14px;line-height:1.6;margin-bottom:16px}.fixture-content-card label{display:block;font-size:12px}
.fixture-content-card input{display:block;width:100%;min-width:0;margin-block:6px 12px;min-height:44px}
.fixture-content-card button,.fixture-content-card a{display:inline-flex;align-items:center;min-height:44px;margin-right:12px}
.fixture-group{display:grid;gap:12px;min-width:0}
`;

async function geometry(page) {
  return page.locator('.rs-content-track').evaluate(track => {
    const box = track.getBoundingClientRect(), style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft), right = box.right - parseFloat(style.paddingRight);
    const slides = [...track.children].map(slide => {
      const rect = slide.getBoundingClientRect(), item = slide.querySelector('[data-group], [data-item]');
      return { id: item.dataset.group || item.dataset.item, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    });
    return { left: track.scrollLeft, max: track.scrollWidth - track.clientWidth, order: slides.map(slide => slide.id), visible: slides.filter(slide => slide.left >= left - 2 && slide.right <= right + 2).map(slide => slide.id), overflow: document.documentElement.scrollWidth > innerWidth };
  });
}

async function waitVisible(page, expected) {
  await page.waitForFunction(ids => {
    const track = document.querySelector('.rs-content-track');
    if (!track) return false;
    const box = track.getBoundingClientRect(), style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft), right = box.right - parseFloat(style.paddingRight);
    const visible = [...track.children].filter(slide => { const rect = slide.getBoundingClientRect(); return rect.left >= left - 2 && rect.right <= right + 2; }).map(slide => { const item = slide.querySelector('[data-group], [data-item]'); return item.dataset.group || item.dataset.item; });
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const previous = document.querySelector('[aria-label="Previous editorial selections"]'), next = document.querySelector('[aria-label="Next editorial selections"]');
    return previous.disabled === (track.scrollLeft <= 2) && next.disabled === (track.scrollLeft >= maximum - 2) && JSON.stringify(visible) === JSON.stringify(ids);
  }, expected);
}

async function settled(page) {
  await page.evaluate(() => { delete window.__rsContentScrollSettle; });
  await page.waitForFunction(() => {
    const left = document.querySelector('.rs-content-track').scrollLeft, now = performance.now(), last = window.__rsContentScrollSettle;
    if (!last || Math.abs(last.left - left) > .25) { window.__rsContentScrollSettle = { left, since: now }; return false; }
    return now - last.since >= 180;
  }, undefined, { polling: 'raf' });
}

async function touchSwipe(page) {
  const track = page.locator('.rs-content-track');
  await track.scrollIntoViewIfNeeded();
  await settled(page);
  const rect = await track.boundingBox(), client = await page.context().newCDPSession(page);
  try {
    const start = rect.x + rect.width * .83, y = rect.y + 35;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y, id: 1 }] });
    for (let step = 1; step <= 12; step += 1) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start - rect.width * .73 * step / 12, y, id: 1 }] });
      await new Promise(resolve => setTimeout(resolve, 16));
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => document.querySelector('.rs-content-track').scrollLeft > 20);
    await settled(page);
    const state = await geometry(page);
    assert(state.visible.length > 0 && state.order.indexOf(state.visible[0]) > 0, 'Native swipe advances to a later snapped item');
    return state.visible;
  } finally { await client.detach(); }
}

async function controlsGeometry(page) {
  const layout = await page.locator('.rs-content-carousel').evaluate(carousel => {
    const track = carousel.querySelector('.rs-content-track').getBoundingClientRect(), box = carousel.getBoundingClientRect();
    const controls = [...carousel.querySelectorAll('.rs-content-controls button')].map(button => { const b = button.getBoundingClientRect(); return { width: b.width, height: b.height, top: b.top, left: b.left, right: b.right }; });
    return { trackBottom: track.bottom, right: box.right, controls };
  });
  assert(layout.controls.every(button => button.width >= 44 && button.height >= 44 && button.top >= layout.trackBottom), '44px controls below the track do not cover content');
  assert(layout.controls[0].right <= layout.controls[1].left, 'Control hit targets do not overlap');
  assert(Math.abs(layout.controls[1].right - layout.right) <= 2, 'Controls align to the right content edge');
  return layout;
}

async function checkMode(page, width, pages) {
  await page.getByRole('button', { name: pages ? 'Pages mode' : 'Cards mode', exact: true }).click();
  const count = pages ? 1 : width >= 901 ? 3 : width >= 641 ? 2 : 1;
  const ids = Array.from({ length: pages ? 3 : 7 }, (_, i) => (pages ? 'page-' : 'item-') + (i + 1));
  const track = page.getByLabel('Editorial selections cards', { exact: true });
  const previous = page.getByRole('button', { name: 'Previous editorial selections', exact: true });
  const next = page.getByRole('button', { name: 'Next editorial selections', exact: true });
  await waitVisible(page, ids.slice(0, count));
  assert.deepEqual((await geometry(page)).order, ids);
  assert.equal((await geometry(page)).overflow, false);
  assert(await previous.isDisabled());
  const alignment = await controlsGeometry(page);
  for (let offset = 1; offset <= ids.length - count; offset += 1) {
    await next.click();
    await waitVisible(page, ids.slice(offset, offset + count));
  }
  assert(await next.isDisabled(), 'Next disables at the final slide');
  assert(Math.abs((await geometry(page)).left - (await geometry(page)).max) <= 2);
  await previous.click();
  await waitVisible(page, ids.slice(ids.length - count - 1, ids.length - 1));
  await track.focus();
  await page.keyboard.press('Home');
  await waitVisible(page, ids.slice(0, count));
  await page.keyboard.press('ArrowRight');
  await waitVisible(page, ids.slice(1, count + 1));
  await page.keyboard.press('ArrowLeft');
  await waitVisible(page, ids.slice(0, count));
  await page.keyboard.press('End');
  await waitVisible(page, ids.slice(-count));
  await page.keyboard.press('Home');
  await waitVisible(page, ids.slice(0, count));
  let touchVisible;
  if (width <= 390) {
    touchVisible = await touchSwipe(page);
    await track.focus();
    await page.keyboard.press('Home');
    await waitVisible(page, ids.slice(0, count));
    await settled(page);
  }
  const first = page.locator('[data-item="item-1"]');
  const input = first.getByRole('textbox');
  await input.focus();
  await input.evaluate(element => element.setSelectionRange(2, 2));
  await page.keyboard.press('ArrowLeft');
  assert.equal(await input.evaluate(element => element.selectionStart), 1, 'Nested input preserves native arrow-key editing');
  const before = Number(await page.getByLabel('Card activations').textContent());
  await first.getByRole('button').focus();
  await page.keyboard.press('Space');
  await first.getByRole('link').focus();
  await page.keyboard.press('Enter');
  assert.equal(Number(await page.getByLabel('Card activations').textContent()), before + 2, 'Native nested button/link actions work');
  const intercepted = await first.locator('a,button,input').evaluateAll(elements => elements.some(element => !element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))));
  assert.equal(intercepted, false, 'Carousel does not intercept keys from nested controls');
  assert((await geometry(page)).left <= 2);
  await next.click();
  await waitVisible(page, ids.slice(1, count + 1));
  await page.getByRole('button', { name: 'Reverse order', exact: true }).click();
  await waitVisible(page, [...ids].reverse().slice(0, count));
  assert.deepEqual((await geometry(page)).order, [...ids].reverse());
  assert((await geometry(page)).left <= 2, 'Order changes reset the native track');
  await page.getByRole('button', { name: 'Restore all', exact: true }).click();
  await waitVisible(page, ids.slice(0, count));
  await page.getByRole('button', { name: 'Only one', exact: true }).click();
  await waitVisible(page, [ids[0]]);
  assert(await page.locator('.rs-content-controls').isHidden(), 'Controls hide when every slide fits');
  assert.equal((await geometry(page)).overflow, false);
  await page.getByRole('button', { name: 'Clear items', exact: true }).click();
  assert.equal(await page.locator('.rs-content-carousel').count(), 0, 'Empty content produces no empty carousel');
  return { mode: pages ? 'three grouped pages' : 'seven individual items', visible: count, arrowSteps: ids.length - count, alignment, touchVisible, checks: ['responsive visible geometry', 'ordered content', '44px controls below content', 'previous/next and disabled ends', 'Home/End/arrow keys', ...(width <= 390 ? ['native swipe and inertia settling'] : []), 'native nested controls', 'order-reset', 'fit-controls-hidden', 'empty-content-hidden', 'no document overflow'] };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const built = await esbuild.build({ absWorkingDir: root, stdin: { contents: fixture, resolveDir: root, sourcefile: 'content-carousel-fixture.tsx', loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', target: ['chrome110'], loader: { '.css': 'empty' }, define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent' });
  const css = defaults + '\n' + fs.readFileSync(path.join(root, 'src/app/rs.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/components/rs/content-carousel.css'), 'utf8');
  const browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [], errors = [];
  let page;
  try {
    for (const width of [1440, 1031, 768, 390, 360]) {
      page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', isMobile: width <= 390, hasTouch: width <= 768 });
      page.setDefaultTimeout(12000);
      page.on('pageerror', error => errors.push(error.message));
      await page.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Synthetic content carousel verification</title></head><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: built.outputFiles[0].text });
      const cards = await checkMode(page, width, false), pages = await checkMode(page, width, true);
      results.push({ width, cards, pages });
      console.log('Content carousel ' + width + 'px: seven items and three grouped pages passed.');
      await page.close(); page = undefined;
    }
    assert.deepEqual(errors, [], 'No browser runtime errors');
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ date: new Date().toISOString(), fixture: 'Actual RsContentCarousel and real CSS, seven synthetic content items and three grouped pages; no app server or CMS', sourceHashes, results, errors }, null, 2));
  } catch (error) {
    const geometryAtFailure = page ? await geometry(page).catch(() => null) : null;
    const controlsAtFailure = page ? await page.locator('.rs-content-controls button').evaluateAll(buttons => buttons.map(button => ({ label: button.getAttribute('aria-label'), disabled: button.disabled }))).catch(() => null) : null;
    if (page) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ date: new Date().toISOString(), sourceHashes, results, errors, geometryAtFailure, controlsAtFailure, error: String(error), stack: error.stack }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
