// Live, read-only checks. Start the production RS frontend (3001) and CMS (1338) first.
// No forms are submitted and every CMS request is GET. No credentials are needed.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const qs = require('qs');
const { chromium } = require(process.env.RS_PLAYWRIGHT_MODULE || path.join(
  os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
));

const root = path.resolve(__dirname, '..');
const origin = process.env.RS_QA_ORIGIN || 'http://localhost:3003';
const cms = process.env.RS_QA_CMS_ORIGIN || 'http://127.0.0.1:1340';
const output = path.join(root, 'docs/design/qa/university-lightweight');
const widths = [1440, 1031, 768, 390, 360];
for (const value of [origin, cms]) {
  const url = new URL(value);
  assert(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'This QA script is restricted to local RS services');
}
const sourceFiles = [
  'src/components/rs/home.tsx', 'src/components/rs/home-types.ts',
  'src/components/rs/university-section.tsx', 'src/components/rs/university-section.css',
  'src/components/rs/programme-spotlight.tsx', 'src/components/rs/programme-spotlight.css',
  'src/components/rs/programme-carousel.css',
  'src/lib/cms/repositories/home.ts', 'src/lib/cms/repositories/rs-home.ts',
  'src/lib/cms/repositories/rs-catalogue.ts', 'src/app/rs.css',
];
const sourceHashes = Object.fromEntries(sourceFiles.map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'),
]));
const report = { date: new Date().toISOString(), origin, cms, sourceHashes, checks: [], layouts: [], network: [], errors: [], limitations: [] };
const check = label => { report.checks.push(label); console.log('PASS: ' + label); };
const text = value => String(value || '').replace(/\s+/g, ' ').trim();
const universityHref = slug => '/university/' + encodeURIComponent(slug);
const offeringHref = (university, program) => '/offering/' + encodeURIComponent(university) + '/' + encodeURIComponent(program);

async function api(endpoint, query) {
  const response = await fetch(cms + '/api/' + endpoint + '?' + qs.stringify(query, { encodeValuesOnly: true }), {
    method: 'GET', signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, 'Public CMS GET ' + endpoint);
  return response.json();
}
async function all(endpoint, populate) {
  const result = [];
  for (let page = 1; ; page += 1) {
    const value = await api(endpoint, { view: 'homepage', status: 'published', populate, pagination: { page, pageSize: 100 } });
    assert(Array.isArray(value.data), 'CMS collection ' + endpoint);
    result.push(...value.data);
    if (!value.data.length || page >= (value.meta?.pagination?.pageCount || 1)) return result;
  }
}
function assetPath(src) {
  if (!src) return null;
  let url = new URL(src, cms);
  if (url.pathname === '/_next/image') url = new URL(url.searchParams.get('url'), cms);
  return decodeURIComponent(url.pathname);
}
async function expectedData() {
  const [homeResult, universities, programs] = await Promise.all([
    api('home', { status: 'published', populate: {
      featured_universities: { populate: { university: { fields: ['name', 'slug'] } } },
      spotlight_offering: { populate: { program: { fields: ['slug'] }, university: { fields: ['slug'] }, image: true } },
    } }),
    all('universities', { logo: true, card_logo: true, image: true }),
    all('programs', { course: { populate: { level: true } }, course_mode: true, duration_type: true, thumbnail: true, universities: { fields: ['slug', 'name'] } }),
  ]);
  const home = homeResult.data;
  assert(home, 'Published Home exists');
  assert.notEqual(home.section_visibility?.universities, false, 'Universities must be enabled for this section audit');
  assert.notEqual(home.section_visibility?.spotlight, false, 'Spotlight must be enabled for this section audit');
  const universityMap = new Map(universities.map(item => [item.slug, item]));
  const seen = new Set();
  const selected = (home.featured_universities || []).flatMap(item => {
    const university = universityMap.get(item.university?.slug);
    if (!university || seen.has(university.slug)) return [];
    seen.add(university.slug);
    const degreeGroups = new Map();
    for (const program of programs) {
      if (!(program.universities || []).some(relation => relation.slug === university.slug)) continue;
      const label = text(program.course?.name || program.name);
      if (!label) continue;
      const key = label.toLowerCase();
      const group = degreeGroups.get(key) || { label, urls: new Set() };
      group.urls.add(offeringHref(university.slug, program.slug));
      degreeGroups.set(key, group);
    }
    return [{ ...university, links: [...degreeGroups.values()].map(group => ({
      label: group.label,
      href: group.urls.size === 1 ? [...group.urls][0] : universityHref(university.slug),
    })) }];
  });
  assert(selected.length > 0, 'CMS has at least one published selected university');
  const selection = home.spotlight_offering;
  const university = universityMap.get(selection?.university?.slug);
  const program = programs.find(item => item.slug === selection?.program?.slug);
  assert(university && program, 'CMS spotlight selects a published university and programme');
  assert((program.universities || []).some(item => item.slug === university.slug), 'Spotlight is an actual catalogue pair');
  const spotlight = {
    university, program,
    href: offeringHref(university.slug, program.slug),
    heading: text(selection.heading) || text((program.course_mode?.name || 'Mode to be confirmed') + ' ' + (program.course?.name || program.name)),
    mode: text(program.course_mode?.name) || 'Mode to be confirmed',
    duration: text(program.duration_text) || (Number(program.duration) > 0 && program.duration_type?.name ? program.duration + ' ' + program.duration_type.name : 'Duration to be confirmed'),
    image: selection.image || program.thumbnail || university.image,
  };
  report.cmsSelection = {
    universities: selected.map(item => ({ documentId: item.documentId, slug: item.slug, name: item.name,
      cardLogo: item.card_logo?.url || null, logo: item.logo?.url || null, image: item.image?.url || null, links: item.links })),
    spotlight: { university: university.slug, program: program.slug, href: spotlight.href,
      mode: spotlight.mode, duration: spotlight.duration, image: spotlight.image?.url || null },
  };
  return { universities: selected, spotlight };
}
async function home(page) {
  const response = await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), 'Homepage responds successfully');
  await page.locator('#universities.rs-uni-section .rs-uni-card').first().waitFor();
  await page.locator('.rs-programme-spotlight__action').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function loadedImages(locator, label) {
  const images = locator.locator('img');
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async element => {
      await Promise.race([element.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timed out')), 12000))]);
    });
    assert(await image.evaluate(element => element.complete && element.naturalWidth > 0), label + ' image decodes');
  }
}
async function assertImage(locator, media, label) {
  if (!media?.url) { assert.equal(await locator.count(), 0, label + ' has no invented image'); return; }
  assert.equal(await locator.count(), 1, label + ' image is present');
  const image = await locator.evaluate(element => ({ src: element.currentSrc || element.src, width: element.naturalWidth, height: element.naturalHeight }));
  assert.equal(assetPath(image.src), assetPath(media.url), label + ' uses the exact CMS asset');
  assert(image.width > 0 && image.height > 0, label + ' decoded dimensions');
}
async function linksAndMedia(page, expected) {
  const cards = page.locator('.rs-uni-card');
  assert.equal(await cards.count(), expected.universities.length, 'Every CMS selected published university renders exactly once');
  assert.deepEqual(await cards.evaluateAll(items => items.map(item => item.dataset.rsUniversitySlide)), expected.universities.map(item => item.documentId), 'University DOM order matches CMS authored order');
  for (let index = 0; index < expected.universities.length; index += 1) {
    const university = expected.universities[index];
    const card = cards.nth(index);
    await loadedImages(card, university.name);
    const href = universityHref(university.slug);
    for (const selector of ['.rs-uni-identity h3 a', '.rs-uni-explore']) {
      assert.equal(await card.locator(selector).getAttribute('href'), href, university.name + ' ' + selector + ' preserves university');
    }
    assert.equal(text(await card.locator('h3').innerText()), text(university.name), 'Full university name remains readable');
    assert.equal(await card.locator('.rs-uni-photo').count(), 0, 'University campus image and photo link have been removed');
    assert.equal(await card.locator('img:not(.rs-uni-logo img)').count(), 0, 'University cards contain only identity marks');
    await assertImage(card.locator('.rs-uni-logo img'), university.card_logo || university.logo, university.name + ' mark');
    const mark = await card.locator('.rs-uni-logo').boundingBox();
    assert(mark && Math.abs(mark.width - mark.height) <= 1 && mark.width >= 30, 'University mark has an uncropped square well');
    if (university.card_logo) assert.equal(await card.locator('.rs-uni-logo').getAttribute('data-logo-kind'), 'mark', 'CMS square mark is preferred to wordmark');
    if (await card.locator('.rs-uni-logo img').count()) assert.equal(await card.locator('.rs-uni-logo img').evaluate(image => getComputedStyle(image).objectFit), 'contain', 'University mark is not cropped');
    const chips = await card.locator('.rs-uni-chips a').evaluateAll(items => items.map(item => ({ label: item.textContent.trim(), href: item.getAttribute('href') })));
    assert.deepEqual(chips.slice().sort((a,b) => a.label.localeCompare(b.label)), university.links.slice().sort((a,b) => a.label.localeCompare(b.label)), 'Degree chips use actual programmes at ' + university.name);
    for (const selector of ['.rs-uni-chips a', '.rs-uni-explore']) {
      for (const box of await card.locator(selector).evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })))) {
        assert(box.height >= 43.5, 'University chip/explore touch target is at least 44px');
      }
    }
  }
  const spotlight = page.locator('.rs-programme-spotlight');
  await loadedImages(spotlight, 'Spotlight');
  assert.equal(text(await spotlight.locator('h2').innerText()), expected.spotlight.heading, 'Spotlight title follows CMS');
  assert.equal(text(await spotlight.locator('.rs-programme-spotlight__university').innerText()), text(expected.spotlight.university.name), 'Spotlight names selected university');
  const facts = text(await spotlight.locator('.rs-programme-spotlight__facts').innerText());
  assert(facts.includes(expected.spotlight.mode) && facts.includes(expected.spotlight.duration), 'Spotlight mode and duration match the selected programme');
  assert.equal(await spotlight.locator('.rs-programme-spotlight__action').getAttribute('href'), expected.spotlight.href, 'Spotlight CTA retains exact offering');
  await assertImage(spotlight.locator('.rs-programme-spotlight__image img'), expected.spotlight.image, 'Spotlight photograph');
  await assertImage(spotlight.locator('.rs-programme-spotlight__mark img'), expected.spotlight.university.card_logo || expected.spotlight.university.logo, 'Spotlight mark');
  const action = spotlight.locator('.rs-programme-spotlight__action');
  const box = await action.boundingBox();
  assert(await action.isVisible() && box?.height >= 43.5, 'Spotlight CTA is visible and at least 44px high');
}
async function universityOnlyNetwork(page, expected, imageRequests, width) {
  // Run before explicitly visiting/decoding Spotlight. The retained Spotlight
  // may share a campus asset with a university and be loaded by browser lookahead;
  // shared requests must be backed by an actual outside-section image/srcset.
  const section = page.locator('#universities');
  assert.equal(await section.locator('.rs-uni-photo').count(), 0, 'Logo-only university section has no campus photo element or link');
  assert.equal(await section.locator('img:not(.rs-uni-logo img)').count(), 0, 'No non-logo image is present in the university section');
  for (let index = 0; index < expected.universities.length; index += 1) {
    await loadedImages(section.locator('.rs-uni-card').nth(index), 'University-only logo scroll');
  }
  const candidates = await page.locator('img').evaluateAll(images => images.filter(image => !image.closest('#universities')).flatMap(image => {
    const urls = [image.currentSrc, image.src];
    for (const srcset of [image.srcset, ...[...image.closest('picture')?.querySelectorAll('source') || []].map(source => source.srcset)]) {
      urls.push(...srcset.split(',').map(candidate => candidate.trim().split(/\s+/)[0]));
    }
    return urls.filter(Boolean);
  }));
  const retainedSources = new Set(candidates.map(value => new URL(value, origin).href));
  const campusPaths = new Set(expected.universities.map(university => assetPath(university.image?.url)).filter(Boolean));
  const campusRequests = [...new Set(imageRequests.filter(url => campusPaths.has(assetPath(url))))];
  const unrelated = campusRequests.filter(url => !retainedSources.has(new URL(url, origin).href));
  assert.deepEqual(unrelated, [], 'No university campus image request is introduced by visiting or scrolling logo-only university cards');
  report.network.push({ width, phase: 'Initial homepage and university-only logo scroll; before explicit Spotlight visit',
    universityCampusImagesInDom: 0, universityOnlyCampusRequests: unrelated,
    sharedCampusRequestsFromRetainedSections: campusRequests.map(url => ({ url, asset: assetPath(url) })) });
}
async function assertArrowClearance(page) {
  const controls = page.locator('.rs-uni-controls');
  if (await controls.isVisible()) await controls.scrollIntoViewIfNeeded();
  const result = await page.locator('#universities').evaluate(section => {
    const track = section.querySelector('.rs-uni-track').getBoundingClientRect();
    const textRects = [];
    for (const container of section.querySelectorAll('.rs-uni-copy,.rs-uni-heading')) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (container.closest('.rs-uni-card') && (rect.right <= track.left || rect.left >= track.right)) continue;
          textRects.push({ text: node.textContent.trim(), x: Math.max(rect.left, track.left), right: Math.min(rect.right, track.right), y: rect.top, bottom: rect.bottom });
        }
      }
    }
    return [...section.querySelectorAll('.rs-uni-controls button')].filter(button => button.getClientRects().length).map(button => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { label: button.getAttribute('aria-label'), width: rect.width, height: rect.height,
        inViewport: rect.left >= -.5 && rect.right <= innerWidth + .5,
        hit: hit === button || button.contains(hit),
        overlappingText: textRects.filter(text => text.right > rect.left + .5 && text.x < rect.right - .5 && text.bottom > rect.top + .5 && text.y < rect.bottom - .5).map(text => text.text),
      };
    });
  });
  for (const control of result) {
    assert(control.width >= 43.5 && control.height >= 43.5 && control.inViewport && control.hit, control.label + ' remains visible, clickable and 44px');
    assert.deepEqual(control.overlappingText, [], control.label + ' does not cover university names, chips or CTA text');
  }
  return result;
}
async function trackState(page) {
  return page.locator('.rs-uni-track').evaluate(track => {
    const box = track.getBoundingClientRect();
    return { left: track.scrollLeft, maximum: Math.max(0, track.scrollWidth - track.clientWidth),
      visible: [...track.querySelectorAll('.rs-uni-card')].filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.left >= box.left - 1 && rect.right <= box.right + 1;
      }).map(card => card.dataset.rsUniversitySlide),
    };
  });
}
async function waitMeasured(page, at) {
  await page.waitForFunction(position => {
    const track = document.querySelector('.rs-uni-track');
    const previous = document.querySelector('.rs-uni-previous');
    const next = document.querySelector('.rs-uni-next');
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = track.scrollLeft;
    const measured = previous.disabled === (left <= 2) && next.disabled === (left >= maximum - 2);
    return measured && (position === 'start' ? left <= 2 : position === 'end' ? left >= maximum - 2 : left > 2);
  }, at);
}
async function settledScroll(track) {
  // A touch has momentum plus CSS scroll snap. Seeing the first movement is
  // not proof that the gesture is finished; an immediate Home can be undone.
  await track.evaluate(element => new Promise((resolve, reject) => {
    let previous = element.scrollLeft;
    let lastMovement = performance.now();
    const deadline = lastMovement + 5000;
    function inspect() {
      const now = performance.now();
      if (Math.abs(element.scrollLeft - previous) > .25) lastMovement = now;
      previous = element.scrollLeft;
      if (now - lastMovement >= 140) return resolve();
      if (now > deadline) return reject(new Error('Native university scroll did not settle within 5 seconds'));
      requestAnimationFrame(inspect);
    }
    requestAnimationFrame(inspect);
  }));
}
async function controls(page, width, count) {
  const track = page.getByLabel('University cards', { exact: true });
  const previous = page.getByRole('button', { name: 'Previous universities', exact: true });
  const next = page.getByRole('button', { name: 'Next universities', exact: true });
  await track.scrollIntoViewIfNeeded();
  await track.focus();
  await page.keyboard.press('Home');
  await waitMeasured(page, 'start');
  const initial = await trackState(page);
  const perView = width >= 1200 ? 4 : width >= 901 ? 3 : width >= 641 ? 2 : 1;
  assert.equal(initial.visible.length, Math.min(count, perView), 'Responsive university card count at ' + width);
  await assertArrowClearance(page);
  if (initial.maximum <= 2) {
    assert(await page.locator('.rs-uni-controls').isHidden(), 'University controls hide when all cards fit');
    assert.equal(initial.visible.length, count, 'Every card is visible when controls are hidden');
    return { width, scrollable: false, visible: initial.visible.length, checks: ['controls hidden when all fit'] };
  }
  assert(await previous.isDisabled() && await next.isEnabled(), 'University arrows reflect the initial endpoint');
  for (const button of [previous, next]) {
    const box = await button.boundingBox();
    assert(box?.width >= 43.5 && box.height >= 43.5, 'University arrow touch target is 44px');
  }
  await next.click();
  await waitMeasured(page, 'advanced');
  const advanced = await trackState(page);
  assert(advanced.left > initial.left + 2, 'Next university arrow actually scrolls');
  await previous.click();
  await waitMeasured(page, 'start');
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await waitMeasured(page, 'advanced');
  assert(await track.evaluate(element => document.activeElement === element), 'Arrow keys retain track focus');
  await page.keyboard.press('ArrowLeft');
  await waitMeasured(page, 'start');
  await page.keyboard.press('End');
  await waitMeasured(page, 'end');
  assert(await next.isDisabled(), 'Next university arrow disables at the final card');
  await page.keyboard.press('Home');
  await waitMeasured(page, 'start');
  const nestedCancellation = await page.locator('.rs-uni-card a').evaluateAll(links => links.map(link => !link.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))));
  assert(nestedCancellation.every(canceled => !canceled), 'University carousel leaves nested links keyboard handling alone');
  const completed = ['arrows', 'disabled endpoints', 'keyboard arrows/Home/End', 'nested link keys'];
  if (width <= 390) {
    await track.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    const client = await page.context().newCDPSession(page);
    try {
      const startX = box.x + box.width * .82;
      const y = box.y + Math.min(70, box.height * .35);
      const before = await trackState(page);
      const touchTarget = await page.evaluate(({ x, y }) => {
        const target = document.elementFromPoint(x, y);
        return { inTrack: !!target?.closest('.rs-uni-track'), tag: target?.tagName,
          className: target?.className, innerWidth, viewportScale: visualViewport?.scale,
          touchPoints: navigator.maxTouchPoints, coarsePointer: matchMedia('(pointer:coarse)').matches };
      }, { x: startX, y });
      assert(touchTarget.inTrack, 'Native swipe starts on the actual university scroll surface, not a fixed overlay');
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y, id: 1 }] });
      for (let step = 1; step <= 12; step += 1) {
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - box.width * .72 * step / 12, y, id: 1 }] });
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      try { await waitMeasured(page, 'advanced'); }
      catch (error) {
        report.touchFailure = { width, before, after: await trackState(page), touchTarget,
          previousDisabled: await previous.isDisabled(), nextDisabled: await next.isDisabled() };
        throw error;
      }
      await settledScroll(track);
      completed.push('native browser touch swipe');
    } finally { await client.detach(); }
    await track.focus();
    await page.keyboard.press('Home');
    await waitMeasured(page, 'start');
  }
  return { width, scrollable: true, visible: initial.visible.length, checks: completed };
}
async function captureLayout(page, width, expected) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  const layout = await page.evaluate(() => {
    const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height, right: r.right, bottom: r.bottom + scrollY }; };
    const uni = document.querySelector('#universities');
    const spotlight = document.querySelector('.rs-programme-spotlight');
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      universities: rect(uni), heading: rect(uni.querySelector('.rs-uni-heading')), track: rect(uni.querySelector('.rs-uni-track')),
      sharedContainer: rect(document.querySelector('.rs-hero-grid.rs-container')), spotlight: rect(spotlight),
      cards: [...uni.querySelectorAll('.rs-uni-card')].map(card => ({ id: card.dataset.rsUniversitySlide, ...rect(card),
        copy: rect(card.querySelector('.rs-uni-copy')), programmeCount: card.querySelectorAll('.rs-uni-chips a').length, nameLength: card.querySelector('h3').textContent.trim().length,
        contentOverflow: card.querySelector('.rs-uni-copy').scrollWidth > card.querySelector('.rs-uni-copy').clientWidth + 1,
      })),
      spotlightCta: rect(spotlight.querySelector('.rs-programme-spotlight__action')),
      spotlightImage: spotlight.querySelector('.rs-programme-spotlight__image') ? rect(spotlight.querySelector('.rs-programme-spotlight__image')) : null,
      images: [...uni.querySelectorAll('img'), ...spotlight.querySelectorAll('img')].map(image => ({ src: image.currentSrc || image.src, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight })),
    };
  });
  assert(layout.documentWidth <= width + 1, 'No page horizontal overflow at ' + width);
  assert(Math.abs(layout.heading.x - layout.sharedContainer.x) <= 1 && Math.abs(layout.heading.right - layout.sharedContainer.right) <= 1,
    'University heading follows the shared container edges at ' + width);
  const visible = layout.cards.filter(card => card.x >= layout.track.x - 1 && card.right <= layout.track.right + 1);
  assert(visible.length, 'University carousel has a fully visible card');
  assert(Math.abs(Math.min(...visible.map(card => card.x)) - layout.heading.x) <= 1 &&
    Math.abs(Math.max(...visible.map(card => card.right)) - layout.heading.right) <= 1,
    'University cards align with the heading edges without extra side gutters at ' + width);
  assert(layout.cards.every(card => card.height <= 180 + Math.max(0, card.programmeCount - 3) * 44 + Math.ceil(Math.max(0, card.nameLength - 80) / 40) * 20 && !card.contentOverflow), 'University cards stay compact with readable, unclipped copy at ' + width);
  assert(layout.spotlight.height <= (width <= 640 ? 460 : 400), 'Spotlight remains a compact band at ' + width);
  if (layout.cards.length > 1) {
    assert(layout.cards.every(card => Math.abs(card.y-layout.cards[0].y) < 2), 'University cards stay in one compact horizontal row at every width');
  }
  if (expected.spotlight.image && width <= 640) assert(layout.spotlightImage.height <= 130, 'Mobile spotlight image stays framed instead of becoming a large stacked banner');
  const top = Math.max(0, Math.floor(layout.universities.y - 12));
  const bottom = Math.ceil(layout.spotlight.bottom + 12);
  await page.screenshot({ path: path.join(output, 'universities-spotlight-' + width + '.png'), clip: { x: 0, y: top, width, height: bottom-top }, fullPage: true, animations: 'disabled' });
  report.layouts.push(layout);
}
async function navigate(page, locator, href, label) {
  const expected = new URL(href, origin);
  await locator.click();
  await page.waitForURL(url => url.pathname === expected.pathname && url.search === expected.search);
  await page.locator('main').waitFor();
  assert.equal(await page.getByRole('heading', { name: '404', exact: true }).count(), 0, label + ' does not lead to a not-found page');
  check(label + ' navigates to ' + expected.pathname);
  await home(page);
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const expected = await expectedData();
  check('Expected selection, marks, programme relationships and spotlight read from public CMS GETs');
  const browser = await chromium.launch({ executablePath: process.env.RS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  let page;
  try {
    async function openAtWidth(width) {
      if (page) await page.context().close();
      // Resize alone cannot turn a desktop context into mobile emulation. Use
      // the same mobile/touch settings as the isolated native-scroll checks.
      const context = await browser.newContext({ viewport: { width, height: 1100 },
        reducedMotion: 'reduce', isMobile: width <= 640, hasTouch: width <= 900 });
      page = await context.newPage();
      page.rsQaImageRequests = [];
      page.on('request', request => { if (request.resourceType() === 'image') page.rsQaImageRequests.push(request.url()); });
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(90000);
      page.on('pageerror', error => report.errors.push(error.message));
      await home(page);
    }
    for (const width of widths) {
      await openAtWidth(width);
      await universityOnlyNetwork(page, expected, page.rsQaImageRequests, width);
      await linksAndMedia(page, expected);
      const interaction = await controls(page, width, expected.universities.length);
      report.checks.push({ width, interaction });
      await captureLayout(page, width, expected);
      check(width + 'px: CMS order/media/links, compact geometry, no overflow and carousel controls');
    }
    await openAtWidth(1440);
    const firstHref = universityHref(expected.universities[0].slug);
    for (const [selector, label] of [
      ['.rs-uni-identity h3 a', 'University name'], ['.rs-uni-explore', 'Explore university'],
    ]) await navigate(page, page.locator('.rs-uni-card').first().locator(selector), firstHref, label);
    const linkedIndex = expected.universities.findIndex(university => university.links.length);
    if (linkedIndex >= 0) {
      const chip = page.locator('.rs-uni-card').nth(linkedIndex).locator('.rs-uni-chips a').first();
      const chipHref = await chip.getAttribute('href');
      assert(expected.universities[linkedIndex].links.some(link => link.href === chipHref), 'Chosen chip preserves its CMS university/programme relationship');
      await navigate(page, chip, chipHref, 'University programme chip');
    }
    else report.limitations.push('No published programme chips exist in the selected universities, so chip navigation was not available to exercise.');
    await navigate(page, page.locator('.rs-programme-spotlight__action'), expected.spotlight.href, 'Spotlight programme CTA');
    assert.deepEqual(report.errors, [], 'No browser runtime errors');
    report.status = 'passed';
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(output, 'layout.json'), JSON.stringify(report.layouts, null, 2));
    for (const name of ['failure.json', 'failure.png']) fs.rmSync(path.join(output, name), { force: true });
    console.log('Universities and spotlight QA passed; report and five focused captures saved to ' + output);
  } catch (error) {
    report.status = 'failed'; report.failure = { message: error.message, stack: error.stack };
    if (page) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify(report, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
