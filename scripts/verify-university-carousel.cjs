// Real RsUniversitySection and CSS; synthetic records only, no app/CMS server.
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
const output = path.join(root, 'docs/design/qa/university-data-led');
const sourcePaths = ['src/components/rs/university-section.tsx', 'src/components/rs/university-section.css', 'src/app/rs.css'];
const sourceHashes = Object.fromEntries(sourcePaths.map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'),
]));
const orderedIds = Array.from({ length: 7 }, (_, index) => 'fixture-university-' + (index + 1));

const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RsUniversitySection } from './src/components/rs/university-section';
const image = 'https://campus.fixture.rs.invalid/unused-campus.jpg';
const logo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect x="8" y="8" width="64" height="64" rx="10" fill="#a22334"/><circle cx="40" cy="40" r="18" fill="#fcfaf5"/></svg>');
const wordmark = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60"><rect width="240" height="60" fill="#6b6260"/></svg>');
const universities = Array.from({ length: 7 }, (_, index) => ({
  id: 'fixture-university-' + (index + 1), slug: 'fixture-university-' + (index + 1),
  name: index === 2 || index === 5
    ? 'Fixture International University for Continuing Education and Professional Studies ' + (index + 1)
    : 'Fixture University ' + (index + 1),
  location: index === 6 ? '' : 'Synthetic local test record', degrees: ['MBA'],
  ownership: index === 6 ? null : 'Private',
  approvals: index === 6 ? [] : ['Fixture Approval A', 'Fixture Approval B', 'Fixture Approval C', 'Fixture Approval A'],
  modes: index === 6 ? [] : ['Online', 'Distance'],
  establishedYear: index === 6 ? null : String(2000 + index),
  rating: index === 6 ? null : 4.2,
  programmeCount: index === 6 ? 0 : index === 0 ? 12 : 1,
  rankings: index === 6 ? [] : ['Synthetic ranking description for layout verification'],
  image: index === 2 || index === 6 ? null : image,
  imageAlt: 'Synthetic fixture geometry; not a real university campus',
  logo: index === 2 || index === 6 ? null : wordmark,
  cardLogo: index === 2 || index === 6 ? null : logo,
}));
const catalogue = universities.flatMap((university, index) => index === 6 ? [] :
  (index === 0 ? ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'M.Com', 'MBA'] : ['MBA']).map((degree, offeringIndex) => ({
    universitySlug: university.slug, degree, href: '/offering/' + university.slug + '/' + degree.toLowerCase() + (offeringIndex === 6 ? '-finance' : ''),
  })));
function Fixture() {
  const [lastHref, setLastHref] = useState('');
  const [reversed, setReversed] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const selected = (filtered ? universities.filter((_, index) => index === 1 || index === 4) : universities).slice();
  if (reversed) selected.reverse();
  return <main className="rs-home" onClick={event => {
    const link = event.target.closest('a');
    if (link) { event.preventDefault(); setLastHref(link.getAttribute('href')); }
  }}>
    <div className="fixture-controls rs-container"><button type="button" onClick={() => setReversed(value => !value)}>Reverse order</button><button type="button" onClick={() => setFiltered(true)}>Filter to two</button><button type="button" onClick={() => { setFiltered(false); setReversed(false); }}>Restore all</button></div>
    <RsUniversitySection universities={selected} catalogue={catalogue} />
    <output className="sr-only" aria-label="Activated destination">{lastHref}</output>
  </main>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`;

// Next's router and image service require an app. Only those framework wrappers
// become equivalent native elements; all section code, links, handlers and CSS
// remain real. Images use declared fill geometry, no fixture layout overrides.
const frameworkWrappers = {
  name: 'native-next-wrappers',
  setup(build) {
    build.onResolve({ filter: /^next\/(image|link)$/ }, args => ({ path: args.path, namespace: 'fixture-next' }));
    build.onLoad({ filter: /.*/, namespace: 'fixture-next' }, args => ({
      loader: 'jsx', resolveDir: root,
      contents: args.path === 'next/image' ? `import React from 'react';
        export default function Image({fill, priority, unoptimized, style, ...props}) {
          return <img {...props} style={fill ? {position:'absolute',inset:0,width:'100%',height:'100%',...style} : style} />;
        }` : `import React from 'react';
        export default React.forwardRef(function Link({href, prefetch, scroll, replace, ...props}, ref) {
          return <a {...props} href={href} ref={ref} />;
        });`,
    }));
  },
};
const defaults = `
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}button{font:inherit}a{color:inherit;text-decoration:none}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.fixture-controls{display:flex;flex-wrap:wrap;gap:8px;padding-block:10px}.fixture-controls button{min-height:44px}
`;

async function geometry(page) {
  return page.locator('.rs-uni-track').evaluate(track => {
    const box = track.getBoundingClientRect(), style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft), right = box.right - parseFloat(style.paddingRight);
    const cards = [...track.querySelectorAll('[data-rs-university-slide]')].map(card => {
      const rect = card.getBoundingClientRect();
      return { id: card.dataset.rsUniversitySlide, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    });
    return {
      left: track.scrollLeft, max: track.scrollWidth - track.clientWidth,
      visible: cards.filter(card => card.left >= left - 2 && card.right <= right + 2).map(card => card.id),
      cards, overflow: document.documentElement.scrollWidth > innerWidth,
      status: track.parentElement.querySelector('[role=status]').textContent,
    };
  });
}

async function waitVisible(page, ids) {
  await page.waitForFunction(expected => {
    const track = document.querySelector('.rs-uni-track');
    if (!track) return false;
    const box = track.getBoundingClientRect(), style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft), right = box.right - parseFloat(style.paddingRight);
    const visible = [...track.querySelectorAll('[data-rs-university-slide]')].filter(card => {
      const rect = card.getBoundingClientRect();
      return rect.left >= left - 2 && rect.right <= right + 2;
    }).map(card => card.dataset.rsUniversitySlide);
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const previous = document.querySelector('[aria-label="Previous universities"]');
    const next = document.querySelector('[aria-label="Next universities"]');
    const measured = previous.disabled === (track.scrollLeft <= 2) && next.disabled === (track.scrollLeft >= maximum - 2);
    return measured && JSON.stringify(visible) === JSON.stringify(expected);
  }, ids);
}

async function waitForScrollSettled(page) {
  // A snapped card can briefly align while native touch inertia still runs.
  // Observe a stable scroll position before sending Home or another input.
  await page.evaluate(() => { delete window.__rsUniversityScrollSettle; });
  await page.waitForFunction(() => {
    const track = document.querySelector('.rs-uni-track');
    const now = performance.now(), left = track.scrollLeft;
    const previous = window.__rsUniversityScrollSettle;
    if (!previous || Math.abs(previous.left - left) > .25) {
      window.__rsUniversityScrollSettle = { left, since: now };
      return false;
    }
    return now - previous.since >= 180;
  }, undefined, { polling: 'raf' });
}

async function checkWidth(page, bundle, css, width) {
  const mobile = width <= 390;
  const visibleCount = width >= 1200 ? 4 : width >= 901 ? 3 : width >= 641 ? 2 : 1;
  const first = orderedIds.slice(0, visibleCount);
  const second = orderedIds.slice(1, visibleCount + 1);
  const last = orderedIds.slice(-visibleCount);
  await page.setViewportSize({ width, height: 950 });
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic university carousel verification</title></head><body><div id="root"></div></body></html>');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: bundle });
  const track = page.getByLabel('University cards', { exact: true });
  const previous = page.getByRole('button', { name: 'Previous universities', exact: true });
  const next = page.getByRole('button', { name: 'Next universities', exact: true });
  await waitVisible(page, first);
  let state = await geometry(page);
  assert.deepEqual(state.cards.map(card => card.id), orderedIds, 'CMS selection order remains stable');
  assert.equal(state.overflow, false, `No document overflow at ${width}px`);
  assert(await previous.isDisabled(), 'Previous is disabled at the start');
  assert(await next.isEnabled(), 'More than four selected universities remain discoverable');
  assert(state.cards.every(card => Math.abs(card.top - state.cards[0].top) < 2), 'All university cards share one row at every breakpoint');
  assert(state.cards.every((card, i) => i === 0 || card.left > state.cards[i - 1].right), 'All seven cards are in order');
  assert.equal(await page.locator('.rs-uni-page').count(), 0, 'Old desktop page wrappers are absent');
  assert.equal(await page.locator('.rs-uni-photo').count(), 0, 'No campus photo region remains even when image data exists');
  assert(await page.locator('.rs-uni-card img').evaluateAll(images => images.every(image => image.closest('.rs-uni-logo'))), 'University images are logo marks only');
  assert.equal(await page.getByText('Programmes in focus', { exact: true }).count(), 0, 'Repeated programme caption is removed');
  const richCard = page.locator('[data-rs-university-slide="' + orderedIds[0] + '"]');
  assert.equal((await richCard.locator('.rs-uni-context').textContent()).trim(), 'Private · Online / Distance');
  assert.equal(await richCard.locator('.rs-uni-credentials li').count(), 3, 'Deduplicated approvals show two entries and a more link');
  assert.equal((await richCard.locator('.rs-uni-credentials a').textContent()).trim(), '+1 more');
  assert.equal(await richCard.locator('.rs-uni-credentials a').getAttribute('href'), '/university/' + orderedIds[0]);
  const facts = await richCard.locator('.rs-uni-facts > div').evaluateAll(items => Object.fromEntries(items.map(item => [item.querySelector('dt').textContent, item.querySelector('dd').textContent])));
  assert.deepEqual(facts, { Programmes: '12', Established: '2000', Rating: '4.2/5' }, 'Authored catalogue count, establishment and rating remain visible');
  assert.equal((await richCard.locator('.rs-uni-ranking').textContent()).trim(), 'Synthetic ranking description for layout verification');
  assert.equal(await richCard.locator('.rs-uni-chips a').count(), 5, 'Four degree links plus the remaining degree count');
  assert.equal((await richCard.locator('.rs-uni-chips a').last().textContent()).trim(), '+2');
  assert.equal(await richCard.locator('.rs-uni-chips a').last().getAttribute('href'), '/university/' + orderedIds[0]);
  assert.equal(await richCard.locator('.rs-uni-chips a').first().getAttribute('href'), '/university/' + orderedIds[0], 'Multiple offerings of one degree link to the university catalogue');
  assert.equal(await richCard.locator('.rs-uni-chips a').nth(1).getAttribute('href'), '/offering/' + orderedIds[0] + '/mca');
  const missingCard = page.locator('[data-rs-university-slide="' + orderedIds[6] + '"]');
  assert.equal(await missingCard.locator('.rs-uni-context, .rs-uni-location, .rs-uni-credentials, .rs-uni-ranking, .rs-uni-chips').count(), 0, 'Missing metadata does not create fallback claims or placeholders');
  assert.equal((await missingCard.locator('.rs-uni-facts').textContent()).trim(), '', 'Missing facts remain empty');
  const controls = await page.locator('.rs-uni-carousel').evaluate(carousel => {
    const track = carousel.querySelector('.rs-uni-track').getBoundingClientRect();
    const previous = carousel.querySelector('[aria-label="Previous universities"]').getBoundingClientRect();
    const next = carousel.querySelector('[aria-label="Next universities"]').getBoundingClientRect();
    return { padding: parseFloat(getComputedStyle(carousel).paddingLeft), trackBottom: track.bottom,
      previous: { top: previous.top, right: previous.right, width: previous.width, height: previous.height },
      next: { top: next.top, left: next.left, right: next.right, width: next.width, height: next.height }, right: carousel.getBoundingClientRect().right };
  });
  assert(controls.padding < 4, 'No reserved 32px arrow gutters');
  assert(controls.previous.top >= controls.trackBottom - 2 && controls.next.top >= controls.trackBottom - 2, 'Controls sit below the track');
  assert(controls.previous.right <= controls.next.left && Math.abs(controls.next.right - controls.right) <= 4, 'Controls form a right-aligned group');
  assert([controls.previous, controls.next].every(button => button.width >= 44 && button.height >= 44), 'Carousel controls have at least 44px targets');

  await next.click();
  await waitVisible(page, second);
  assert(await next.isEnabled(), 'A one-card step does not skip directly to the end');
  await previous.click();
  await waitVisible(page, first);

  await track.focus();
  await page.keyboard.press('End');
  await waitVisible(page, last);
  assert(await next.isDisabled(), 'End reaches the last university and disables Next');
  assert(await previous.isEnabled());
  state = await geometry(page);
  assert(Math.abs(state.left - state.max) <= 2, 'End reaches the physical scroll end');
  assert.equal(state.overflow, false);
  await previous.click();
  await waitVisible(page, orderedIds.slice(6 - visibleCount, 6));
  await track.focus();
  await page.keyboard.press('Home');
  await waitVisible(page, first);
  assert(await previous.isDisabled(), 'Home returns to the first university');
  await page.keyboard.press('ArrowRight');
  await waitVisible(page, second);
  await page.keyboard.press('ArrowLeft');
  await waitVisible(page, first);
  assert(await track.evaluate(element => element === document.activeElement), 'Keyboard navigation keeps focus on the track');

  let touchFirst;
  if (mobile) {
    await waitForScrollSettled(page);
    const box = await track.boundingBox(), client = await page.context().newCDPSession(page);
    try {
      const x = box.x + box.width * .83, y = box.y + 40;
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
      for (let step = 1; step <= 12; step += 1) {
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - box.width * .73 * step / 12, y, id: 1 }] });
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForFunction(() => document.querySelector('.rs-uni-track').scrollLeft > 20);
      await page.waitForFunction(() => {
        const track = document.querySelector('.rs-uni-track'), box = track.getBoundingClientRect();
        const padding = parseFloat(getComputedStyle(track).paddingLeft);
        return [...track.querySelectorAll('[data-rs-university-slide]')].some((card, index) => index > 0 && Math.abs(card.getBoundingClientRect().left - box.left - padding) < 2);
      });
      await waitForScrollSettled(page);
      touchFirst = (await geometry(page)).visible[0];
      assert(orderedIds.indexOf(touchFirst) > 0, 'Native touch swipe advances to a later university');
    } finally { await client.detach(); }
    await track.focus();
    await page.keyboard.press('Home');
    await waitVisible(page, first);
    await waitForScrollSettled(page);
  }

  for (const index of [2, 6]) {
    const card = page.locator('[data-rs-university-slide="' + orderedIds[index] + '"]');
    assert.equal(await card.locator('.rs-uni-logo img').count(), 0, 'Missing logo does not produce a broken image');
    assert.equal((await card.locator('.rs-uni-initial').textContent()).trim(), index === 2 ? 'FI' : 'FU');
  }
  for (let index = 0; index < 7; index += 1) {
    const card = page.locator('[data-rs-university-slide="' + orderedIds[index] + '"]');
    if (index > 0 && index < 6) assert.equal(await card.locator('.rs-uni-chips a').getAttribute('href'), '/offering/' + orderedIds[index] + '/mba');
    assert.equal(await card.locator('.rs-uni-explore').getAttribute('href'), '/university/' + orderedIds[index]);
  }
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  const logoGeometry = await richCard.locator('.rs-uni-logo').evaluate(mark => ({ width: mark.getBoundingClientRect().width, height: mark.getBoundingClientRect().height, intrinsicWidth: mark.querySelector('img').naturalWidth, intrinsicHeight: mark.querySelector('img').naturalHeight }));
  assert.equal(logoGeometry.width, logoGeometry.height, 'Square logo container');
  assert.equal(logoGeometry.intrinsicWidth, 80, 'Square cardLogo takes priority over the full wordmark');
  assert.equal(logoGeometry.intrinsicHeight, 80);
  const firstCard = page.locator('[data-rs-university-slide="' + orderedIds[0] + '"]');
  const explore = firstCard.locator('.rs-uni-explore');
  const cancelled = await explore.evaluate(link => !link.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
  assert.equal(cancelled, false, 'Carousel does not intercept nested link keys');
  await explore.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.getByLabel('Activated destination').textContent(), '/university/' + orderedIds[0]);
  await waitVisible(page, first);
  const clipped = await page.locator('.rs-uni-identity h3').evaluateAll(headings => headings.some(heading => heading.scrollWidth > heading.clientWidth + 1 || heading.scrollHeight > heading.clientHeight + 1));
  assert.equal(clipped, false, 'Long full university names wrap without clipping');
  assert.equal((await geometry(page)).overflow, false);
  await next.click();
  await waitVisible(page, second);
  await page.getByRole('button', { name: 'Reverse order', exact: true }).click();
  await waitVisible(page, [...orderedIds].reverse().slice(0, visibleCount));
  assert.deepEqual((await geometry(page)).cards.map(card => card.id), [...orderedIds].reverse(), 'CMS reordering resets to the new first card');
  await page.getByRole('button', { name: 'Restore all', exact: true }).click();
  await waitVisible(page, first);
  await page.getByRole('button', { name: 'Filter to two', exact: true }).click();
  await waitVisible(page, [orderedIds[1], orderedIds[4]].slice(0, visibleCount));
  assert.deepEqual((await geometry(page)).cards.map(card => card.id), [orderedIds[1], orderedIds[4]]);
  assert.equal(await page.locator('.rs-uni-controls').isHidden(), visibleCount >= 2, 'Controls hide precisely when all cards fit');
  assert.equal((await geometry(page)).overflow, false);
  await page.getByRole('button', { name: 'Restore all', exact: true }).click();
  await waitVisible(page, first);
  if (process.env.RS_CAROUSEL_CAPTURE) await page.screenshot({ path: path.join(output, 'carousel-' + width + '.png'), fullPage: true });
  return { width, firstVisible: first, nextVisible: second, lastVisible: last, touchFirst, controls, logoGeometry, facts, checks: ['seven ordered data-led universities in one row', 'authored ownership/modes/approvals/established/rating/programme count', 'deduplicated approvals and +N degrees', 'ambiguous degree links to university; unique offering exact link', 'square marks preferred over wordmarks', 'no campus photo markup or requests', '44px controls below track without overlay', 'Next/Previous advance one card', 'Home/End/arrow keys', 'disabled ends', ...(mobile ? ['native touch swipe and inertia settling'] : []), 'missing metadata and logo initials', 'long names', 'nested link keyboard activation', 'order reset', 'filtered fit controls hidden', 'no page overflow'] };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const built = await esbuild.build({
    absWorkingDir: root, stdin: { contents: fixture, resolveDir: root, sourcefile: 'university-carousel-fixture.tsx', loader: 'tsx' },
    bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', target: ['chrome110'],
    loader: { '.css': 'empty' }, plugins: [frameworkWrappers],
    define: { 'process.env': JSON.stringify({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://fixture.rs.invalid', NEXT_PUBLIC_CMS_URL: 'https://cms.fixture.rs.invalid' }) },
    logLevel: 'silent',
  });
  const css = defaults + '\n' + fs.readFileSync(path.join(root, 'src/app/rs.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/components/rs/university-section.css'), 'utf8');
  const browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [], errors = [], campusRequests = [];
  let page;
  try {
    for (const width of [1440, 1031, 768, 390, 360]) {
      page = await browser.newPage({ reducedMotion: 'reduce', isMobile: width <= 390, hasTouch: width <= 768 });
      await page.route('**/campus.fixture.rs.invalid/**', route => { campusRequests.push(route.request().url()); return route.abort(); });
      page.setDefaultTimeout(12000);
      page.on('pageerror', error => errors.push(error.message));
      results.push(await checkWidth(page, built.outputFiles[0].text, css, width));
      console.log('University carousel ' + width + 'px: data, controls, links, reorder and overflow checks passed' + (width <= 390 ? ', including native touch.' : '.'));
      await page.close(); page = undefined;
    }
    assert.deepEqual(errors, [], 'No browser runtime errors');
    assert.deepEqual(campusRequests, [], 'No campus assets are requested');
    fs.writeFileSync(path.join(output, 'carousel-checks.json'), JSON.stringify({ date: new Date().toISOString(), fixture: 'Actual RsUniversitySection with seven synthetic rich/missing-data universities and real CSS; native wrappers for Next Link/Image; no app server or CMS writes', sourceHashes, results, errors, campusRequests }, null, 2));
  } catch (error) {
    if (page) await page.screenshot({ path: path.join(output, 'carousel-failure.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(output, 'carousel-failure.json'), JSON.stringify({ date: new Date().toISOString(), sourceHashes, results, errors, error: String(error), stack: error.stack }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
