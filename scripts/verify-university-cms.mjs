// Run after `npm run build`, with the CMS running. All changes below live in
// an in-memory proxy; this test never writes to the CMS or its database.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const cmsOrigin = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL;
assert.ok(cmsOrigin, 'Configure the CMS origin before running this check');
const sourceSlug = process.env.CMS_TEST_SOURCE_SLUG || 'amity-university-online';
const slug = 'cms-regression-fixture';
const secret = 'isolated-cms-regression-secret';
const appPort = Number(process.env.CMS_TEST_PORT || 3101);
const origin = `http://127.0.0.1:${appPort}`;
const source = await fetch(`${cmsOrigin}/api/universities/slug/${sourceSlug}`).then(r => r.json());
assert.ok(source.data?.image?.updatedAt, 'Use the updated backend and a university with a campus image');
const university = structuredClone(source.data);
Object.assign(university, { slug, name: 'CMS Regression University', banners: [] });
assert.equal(university.university_contents.length, 6, 'Choose a source university with six sections');

const refs = university.university_contents;
const programSlug = 'cms-regression-program';
const program = {
  id: 900002, documentId: 'regression-program', slug: programSlug, name: 'CMS Regression Program',
  full_name: null, fee: null, duration: null, duration_text: null, duration_type: null,
  average_package: null, rating: null, course_code: null, course: null, stream: null,
  course_mode: null, course_type: null, tag: null, program_icon: null,
  show_apply_button: false, apply_button_text: null, brochure: null, syllabus: null,
  short_description: null, seo: null, highlights: [], eligibilities: [], exams: [],
  universities: [], university_contents: [],
};
const section = {
  id: 900001, documentId: 'regression-section', name: 'CMS Test Page',
  display_name: 'CMS Test Page', slug: `${slug}-test`, secondary_slug: 'test',
  heading: 'CMS Test Page', seo: null, content: [], publishedAt: new Date().toISOString(),
};
const overview = { ...refs[0], heading: 'CMS Regression Overview', content: [], seo: null };
const collection = data => ({ data, meta: { pagination: { page: 1, pageSize: data.length, pageCount: 1, total: data.length } } });

const proxy = createServer(async (req, res) => {
  try {
    assert.equal(req.method, 'GET', 'The proxy only permits read requests');
    const url = new URL(req.url, cmsOrigin);
    res.setHeader('content-type', 'application/json');
    if (url.pathname === `/api/programs/slug/${programSlug}`) {
      res.end(JSON.stringify({ data: program }));
      return;
    }
    if (url.pathname === '/api/university-contents' &&
        [...url.searchParams].some(([key, value]) => key.startsWith('filters[program][slug]') && value === programSlug)) {
      res.end(JSON.stringify(collection([])));
      return;
    }
    if (url.pathname === `/api/universities/slug/${slug}`) {
      res.end(JSON.stringify({ data: university }));
      return;
    }
    if (url.pathname === '/api/university-contents' &&
        [...url.searchParams].some(([key, value]) => key.startsWith('filters[university][slug]') && value === slug)) {
      const wantsTest = [...url.searchParams].some(([key, value]) => key.startsWith('filters[$or]') && (value === 'test' || value === section.slug));
      res.end(JSON.stringify(collection(wantsTest ? (refs.includes(section) ? [section] : []) : [overview])));
      return;
    }
    const upstream = await fetch(url);
    res.statusCode = upstream.status;
    res.end(await upstream.text());
  } catch (error) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(error) }));
  }
});
await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
const proxyOrigin = `http://127.0.0.1:${proxy.address().port}`;
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(appPort)], {
  env: { ...process.env, CMS_INTERNAL_URL: proxyOrigin, REVALIDATE_SECRET: secret },
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
app.stdout.on('data', chunk => { logs += chunk; });
app.stderr.on('data', chunk => { logs += chunk; });
const closed = new Promise(resolve => app.once('exit', resolve));

async function page(path = `/university/${slug}`) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, `Page status for ${path}`);
  return response.text();
}
function nav(html) {
  const match = html.match(/<nav aria-label="Sections"[\s\S]*?<\/nav>/);
  assert.ok(match, 'The page renders its section navigation');
  return match[0];
}
function hero(html) {
  const match = html.match(/<section class="surface-inverse[\s\S]*?<\/section>/);
  assert.ok(match, 'The page renders the university hero');
  return match[0];
}
function tabCount(html) { return (nav(html).match(/<li\b/g) || []).length; }
async function webhook(payload) {
  const response = await fetch(`${origin}/api/revalidate`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 200);
  return response.json();
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null) throw new Error('Test server exited before startup');
    try { await fetch(`${origin}/api/revalidate`); ready = true; break; } catch { await delay(500); }
  }
  assert.ok(ready, 'Production Next server starts');
  await webhook({ event: 'entry.publish', model: 'university-content', entry: { slug: section.slug } });

  assert.equal(tabCount(await page()), 6);
  refs.push(section);
  assert.equal(tabCount(await page()), 6, 'The warmed production cache stays stale before its webhook');
  const result = await webhook({ event: 'entry.publish', model: 'university-content', entry: { slug: section.slug } });
  assert.ok(result.revalidated.includes('cms:university'), 'A child publish invalidates the parent cache');
  const published = await page();
  assert.equal(tabCount(published), 7, 'The first visit after publishing sees all seven tabs');
  assert.ok(nav(published).includes(`/university/${slug}/test`));
  assert.ok((await page(`/university/${slug}/test`)).includes('CMS Test Page'));
  console.log('PASS: cached six-tab page gains its seventh tab immediately after child publication');

  section.secondary_slug = null;
  await webhook({ event: 'entry.publish', model: 'university-content', entry: { slug: section.slug } });
  assert.ok(nav(await page()).includes(`/university/${slug}/${section.slug}`));
  assert.ok((await page(`/university/${slug}/${section.slug}`)).includes('CMS Test Page'));
  console.log('PASS: a subpage without a secondary slug is linked using its actual CMS slug');

  refs.pop();
  await webhook({ event: 'entry.unpublish', model: 'university-content', entry: { slug: section.slug } });
  assert.equal(tabCount(await page()), 6);
  console.log('PASS: unpublishing removes the tab on the first visit');

  Object.assign(university, { approvals: [], affiliations: [], tag: null, rankings: [], institute_tiers: [] });
  await webhook({ event: 'entry.publish', model: 'university', entry: { slug } });
  assert.doesNotMatch(hero(await page()), /Approvals:|Affiliations:|UGC-DEB|AICTE|NAAC|NIRF/);
  console.log('PASS: empty CMS recognition fields produce no invented approval or entitlement badges');

  university.approvals = [{ id: 1, documentId: 'fixture-approval', name: 'CMS Approval', slug: 'cms-approval', logo: null }];
  university.affiliations = [{ id: 2, documentId: 'fixture-affiliation', name: 'CMS Affiliation', slug: 'cms-affiliation' }];
  await webhook({ event: 'entry.publish', model: 'approval', entry: { slug: 'cms-approval' } });
  const withRelations = hero(await page());
  assert.match(withRelations, /CMS Approval/);
  assert.match(withRelations, /CMS Affiliation/);
  console.log('PASS: populated approval and affiliation records render from CMS data');

  const oldImage = university.image.updatedAt;
  university.image.updatedAt = '2026-10-11T12:00:00.000Z';
  university.image.alternativeText = 'Replacement CMS campus';
  await webhook({ event: 'media.update', media: { id: university.image.id } });
  const replacement = hero(await page());
  assert.match(replacement, /Replacement CMS campus/);
  assert.ok(replacement.includes(encodeURIComponent(encodeURIComponent(university.image.updatedAt))), 'Image optimizer receives the new revision in its source URL');
  const oldCampusKey = encodeURIComponent(`${university.image.url}?v=${encodeURIComponent(oldImage)}`);
  assert.ok(!replacement.includes(oldCampusKey), 'The old campus image cache key is gone');
  console.log('PASS: replacing media at the same URL changes the image cache key and refreshes the page');

  university.image = null;
  university.banners = [{ id: 1, media_type: 'image', heading: 'CMS campus banner', desktop_image: { ...source.data.image, alternativeText: 'CMS campus banner' }, mobile_image: null }];
  await webhook({ event: 'entry.publish', model: 'university', entry: { slug } });
  assert.match(hero(await page()), /CMS campus banner/);
  university.banners = [];
  await webhook({ event: 'entry.publish', model: 'university', entry: { slug } });
  assert.doesNotMatch(hero(await page()), /vgu-campus-main|Campus Infrastructure/);
  console.log('PASS: nested CMS banner media renders; missing media never substitutes another campus');

  Object.assign(university, { course_modes: [], rating: null, established_year: null, establish: null, program_fees: [], brochure: null });
  await webhook({ event: 'entry.publish', model: 'university', entry: { slug } });
  const emptyFacts = hero(await page());
  assert.doesNotMatch(emptyFacts, /169\+|Admissions Open|>Online<|UGC-DEB Entitled|Download Brochure/);
  university.course_modes = [{ documentId: 'regular-mode', name: 'Regular', slug: 'regular' }, { documentId: 'distance-mode', name: 'Distance', slug: 'distance' }];
  await webhook({ event: 'entry.publish', model: 'course-mode', entry: { slug: 'regular' } });
  const modes = hero(await page());
  assert.match(modes, />Regular</);
  assert.match(modes, />Distance</);
  console.log('PASS: university modes come from CMS; missing facts and files do not produce placeholder claims');

  await webhook({ event: 'entry.publish', model: 'program', entry: { slug: programSlug } });
  const emptyProgram = (await page(`/${programSlug}`)).split('<main')[1].split('</main>')[0];
  assert.doesNotMatch(emptyProgram, /2 Years|UGC-DEB|No-Cost|Early Admission Fee Waiver|169\+|>Online<|Download syllabus|Download brochure/);
  Object.assign(program, { course_mode: { documentId: 'distance-mode', name: 'Distance', slug: 'distance' }, duration_text: '18 Months', fee: 32123, average_package: 'CMS package' });
  await webhook({ event: 'entry.publish', model: 'course-mode', entry: { slug: 'distance' } });
  const programFacts = (await page(`/${programSlug}`)).split('<main')[1].split('</main>')[0];
  assert.match(programFacts, />Distance</);
  assert.match(programFacts, /18 Months/);
  assert.match(programFacts, /32,123/);
  assert.match(programFacts, /CMS package/);
  console.log('PASS: empty program facts stay empty; CMS mode, duration, fee and package render after taxonomy publication');

  const denied = await fetch(`${origin}/api/revalidate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event: 'media.update' }) });
  assert.equal(denied.status, 401);
  console.log('PASS: media cache invalidation still requires the webhook secret');
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  app.kill();
  await closed;
  await new Promise(resolve => proxy.close(resolve));
}
