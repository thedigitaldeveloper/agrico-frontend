// Execute the real homepage adapters with synthetic CMS responses; no network or CMS writes.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/design/qa/home-curation');
const sourcePaths = ['src/lib/cms/repositories/rs-home.ts', 'src/lib/cms/repositories/home.ts', 'src/lib/cms/repositories/blog.ts'];
const sources = Object.fromEntries(sourcePaths.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const sourceHashes = Object.fromEntries(sourcePaths.map(file => [file, crypto.createHash('sha256').update(sources[file]).digest('hex')]));
const compiled = Object.fromEntries(sourcePaths.map(file => {
  const result = ts.transpileModule(sources[file], { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.equal(result.diagnostics?.length ?? 0, 0, 'Adapter syntax: ' + file);
  return [file, result.outputText];
}));
const plain = value => JSON.parse(JSON.stringify(value));
const ids = records => Array.from(records, item => item.documentId || item.id);
const published = (documentId, type = 'Blog') => ({
  documentId, slug: documentId, name: 'Fixture ' + documentId, description: 'Synthetic editorial summary',
  type, dateTime: '2026-10-10', publishedAt: '2026-10-10T00:00:00.000Z', tags: [], image: null, thumbnail: null,
});
const selections = (values, key) => values.map(documentId => ({ [key]: documentId ? { documentId } : null }));

function loadModule(file, dependencies) {
  const fixtureModule = { exports: {} };
  const context = vm.createContext({ module: fixtureModule, exports: fixtureModule.exports, require(name) {
    assert(Object.hasOwn(dependencies, name), 'Unexpected unmocked dependency: ' + name);
    return dependencies[name];
  } });
  new vm.Script(compiled[file], { filename: file }).runInContext(context);
  return fixtureModule.exports;
}

function harness({ home = {}, records = {}, latest = {}, failCollection = false } = {}) {
  const calls = { collections: [], home: [], blogs: [], mentors: [], testimonials: [], catalogue: 0, optionalFailures: 0 };
  const catalogue = {
    programs: [{ documentId: 'programme-full-catalogue', slug: 'fixture-mba', name: 'Fixture MBA', course: { name: 'MBA' } }],
    universities: [{ documentId: 'university-full-catalogue', slug: 'fixture-university', name: 'Fixture University' }],
    offerings: [{ id: 'exact-pair', programSlug: 'fixture-mba', universitySlug: 'fixture-university', degree: 'MBA', mode: 'Online', href: '/offering/fixture-university/fixture-mba' }],
  };
  const client = {
    async cmsSingle(endpoint, query, options) {
      assert.equal(endpoint, '/home');
      calls.home.push(plain({ endpoint, query, options }));
      return home;
    },
    async cmsFetchOptional(run, fallback) {
      try { return await run(); } catch (error) {
        // Assertions must fail the test, not be swallowed as a simulated CMS outage.
        if (error instanceof assert.AssertionError) throw error;
        calls.optionalFailures += 1;
        return fallback;
      }
    },
    async cmsCollection(endpoint, query, options) {
      calls.collections.push(plain({ endpoint, query, options }));
      assert.equal(query.status, 'published', 'Curated lookups explicitly request published records');
      assert.equal(query.pagination.pageSize, 100, 'Curated fetches use the bounded page size');
      assert(Number.isInteger(query.pagination.page) && query.pagination.page > 0, 'Explicit one-based page');
      const selected = query.filters?.documentId?.$in;
      assert(Array.isArray(selected), 'Curated lookup is restricted to selected document IDs');
      assert.equal(new Set(selected).size, selected.length, 'Home normalizer removes duplicate selections');
      assert.deepEqual(Object.keys(query.filters), ['documentId']);
      const tag = { '/blogs': 'cms:blog', '/mentor-profiles': 'cms:mentor-profile', '/testimonials': 'cms:testimonial' }[endpoint];
      assert.deepEqual(plain(options.tags), [tag], 'Correct cache tag for the curated collection');
      if (failCollection) throw new Error('Synthetic unavailable CMS');
      // Model the published Strapi boundary faithfully. Shuffled published rows,
      // duplicate response rows and draft/unselected records are all in the store.
      const filtered = (records[endpoint] ?? []).filter(item => item.publishedAt && selected.includes(item.documentId));
      const start = (query.pagination.page - 1) * 100;
      return { data: filtered.slice(start, start + 100), meta: { pagination: { page: query.pagination.page, pageSize: 100, pageCount: Math.ceil(filtered.length / 100), total: filtered.length } } };
    },
  };
  const tags = { collectionTag: name => 'cms:' + name };
  const media = { resolveImage: value => value?.url ? { src: value.url, alt: value.alternativeText || '' } : null, mediaUrl: value => value || null };
  const homeAdapter = loadModule(sourcePaths[1], {
    '../client': client, '../tags': tags, '../media': media,
    '@/lib/links': { resolveLink: href => href ? { href, external: false } : null },
    '@/lib/youtube': { youtubeId: () => null, youtubeThumbnail: () => null },
  });
  const blogAdapter = loadModule(sourcePaths[2], { '../client': client, '../tags': tags });
  const adapter = loadModule(sourcePaths[0], {
    'server-only': {}, '../client': client, '../tags': tags, '../media': media,
    './home': homeAdapter,
    './blog': { BLOG_SECTIONS: blogAdapter.BLOG_SECTIONS, async listBlogs(params) {
      calls.blogs.push(plain(params));
      return { posts: latest[params.section] ?? [] };
    } },
    './mentor': { async listMentors(params) { calls.mentors.push(plain(params)); return { mentors: latest.mentors ?? [] }; } },
    './testimonial': { async listTestimonials(limit) { calls.testimonials.push(limit); return latest.testimonials ?? []; } },
    './rs-catalogue': { async getRsCatalogue() { calls.catalogue += 1; return catalogue; } },
  });
  return { calls, async run() {
    const result = await adapter.getRsHomeData();
    assert.deepEqual(ids(result.catalogue), ['exact-pair'], 'Editorial curation never removes the full programme catalogue');
    assert.deepEqual(Array.from(result.programmeChoices), ['MBA']);
    assert.deepEqual(Array.from(result.universityOptions, item => item.slug), ['fixture-university']);
    return result;
  } };
}

const results = [];
async function check(name, run) { const detail = await run(); results.push({ name, status: 'passed', ...detail }); }

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await check('Curated published selections preserve authored order and omit duplicates, missing records and wrong post types', async () => {
    const newsB = published('news-b', 'Press release');
    newsB.thumbnail = { url: '/uploads/fixture-news.jpg', alternativeText: 'Fixture news photograph' };
    newsB.tags = [{ name: 'Admissions' }];
    const data = harness({
      home: {
        section_display: { news: 'curated', blogs: 'curated', mentors: 'curated', testimonials: 'curated' },
        section_visibility: { mentors: true, testimonials: true },
        featured_news: selections(['news-b', 'missing', 'news-a', 'news-b', 'draft-news', 'blog-a', 'no-type', null], 'post'),
        featured_blogs: selections(['article-a', 'blog-b', 'article-a', 'news-a', 'draft-blog', 'missing'], 'post'),
        featured_mentors: selections(['mentor-b', 'mentor-a', 'mentor-b', 'draft-mentor', 'missing'], 'mentor'),
        featured_testimonials: selections(['testimonial-b', 'testimonial-a', 'testimonial-b', 'draft-testimonial', 'missing'], 'testimonial'),
      },
      records: {
        '/blogs': [published('news-a', 'News'), published('unselected', 'News'), published('blog-b'), { ...published('draft-news', 'News'), publishedAt: null }, published('article-a', 'Articles'), published('blog-a'), newsB, { ...published('draft-blog'), publishedAt: null }, published('no-type', null), newsB],
        '/mentor-profiles': [published('mentor-a'), { ...published('draft-mentor'), publishedAt: null }, published('mentor-b'), published('mentor-a')],
        '/testimonials': [published('testimonial-a'), { ...published('draft-testimonial'), publishedAt: null }, published('testimonial-b'), published('testimonial-b')],
      },
    });
    const result = await data.run();
    assert.deepEqual(ids(result.news), ['news-b', 'news-a']);
    assert.deepEqual(ids(result.blogs), ['article-a', 'blog-b']);
    assert.deepEqual(ids(result.mentors), ['mentor-b', 'mentor-a']);
    assert.deepEqual(ids(result.testimonials), ['testimonial-b', 'testimonial-a']);
    assert.deepEqual(plain(result.news[0]), { id: 'news-b', title: 'Fixture news-b', summary: 'Synthetic editorial summary', date: '2026-10-10', image: '/uploads/fixture-news.jpg', imageAlt: 'Fixture news photograph', category: 'Admissions', href: '/news/news-b' });
    assert.equal(result.blogs[0].href, '/blogs/article-a', 'Legacy Articles remain discoverable through Blogs');
    assert.equal(data.calls.collections.length, 4);
    assert.equal(data.calls.blogs.length + data.calls.mentors.length + data.calls.testimonials.length, 0, 'Curated selections do not trigger latest fallbacks');
    return { news: ids(result.news), blogs: ids(result.blogs), mentors: ids(result.mentors), testimonials: ids(result.testimonials), collectionQueries: data.calls.collections };
  });
  await check('Intentional curated empty sections stay empty without any latest or selected-record fetch', async () => {
    const data = harness({ home: { section_display: { news: 'curated', blogs: 'curated', mentors: 'curated', testimonials: 'curated' }, section_visibility: { mentors: true, testimonials: true } }, latest: { news: [published('must-not-fill', 'News')], blogs: [published('must-not-fill')] } });
    const result = await data.run();
    for (const section of ['news', 'blogs', 'mentors', 'testimonials']) assert.equal(result[section].length, 0);
    assert.equal(data.calls.collections.length + data.calls.blogs.length + data.calls.mentors.length + data.calls.testimonials.length, 0);
    return { intentionallyEmptySections: ['news', 'blogs', 'mentors', 'testimonials'] };
  });
  await check('Latest is the default while mentors and testimonials remain opt-in', async () => {
    const data = harness({ home: { featured_mentors: selections(['selected-mentor'], 'mentor'), featured_testimonials: selections(['selected-testimonial'], 'testimonial') }, latest: { news: [published('latest-news', 'News')], blogs: [published('latest-blog')], mentors: [published('must-not-show')], testimonials: [published('must-not-show')] } });
    const result = await data.run();
    assert.deepEqual(ids(result.news), ['latest-news']);
    assert.deepEqual(ids(result.blogs), ['latest-blog']);
    assert.equal(result.mentors.length + result.testimonials.length, 0);
    assert.deepEqual(data.calls.blogs, [{ section: 'news', pageSize: 3 }, { section: 'blogs', pageSize: 3 }]);
    assert.equal(data.calls.collections.length + data.calls.mentors.length + data.calls.testimonials.length, 0);
    return { latestRequests: data.calls.blogs, optionalSections: 'hidden unless explicitly true' };
  });
  await check('Section visibility false prevents requests in both curated and latest display modes', async () => {
    for (const mode of ['curated', 'latest']) {
      const data = harness({ home: { section_display: { news: mode, blogs: mode, mentors: mode, testimonials: mode }, section_visibility: { news: false, blogs: false, mentors: false, testimonials: false }, featured_news: selections(['news-a'], 'post'), featured_blogs: selections(['blog-a'], 'post'), featured_mentors: selections(['mentor-a'], 'mentor'), featured_testimonials: selections(['testimonial-a'], 'testimonial') } });
      const result = await data.run();
      for (const section of ['news', 'blogs', 'mentors', 'testimonials']) assert.equal(result[section].length, 0);
      assert.equal(data.calls.collections.length + data.calls.blogs.length + data.calls.mentors.length + data.calls.testimonials.length, 0);
      assert.equal(result.home.sectionVisibility.news, false);
    }
    return { modes: ['curated', 'latest'] };
  });
  await check('Explicit optional-section opt-in uses bounded latest defaults; non-booleans are not opt-ins', async () => {
    const data = harness({ home: { section_visibility: { news: false, blogs: false, mentors: true, testimonials: true } }, latest: { mentors: [published('latest-mentor')], testimonials: [published('latest-testimonial')] } });
    const result = await data.run();
    assert.deepEqual(ids(result.mentors), ['latest-mentor']);
    assert.deepEqual(ids(result.testimonials), ['latest-testimonial']);
    assert.deepEqual(data.calls.mentors, [{ pageSize: 6 }]);
    assert.deepEqual(data.calls.testimonials, [9]);
    const invalid = harness({ home: { section_visibility: { news: false, blogs: false, mentors: 'true', testimonials: 1 } } });
    const invalidResult = await invalid.run();
    assert.equal(invalidResult.mentors.length + invalidResult.testimonials.length, 0);
    assert.equal(invalid.calls.mentors.length + invalid.calls.testimonials.length + invalid.calls.collections.length, 0);
    return { mentorsPageSize: 6, testimonialLimit: 9, rejectedOptIns: ['string true', 'number 1'] };
  });
  await check('More than 100 curated records are paginated and reassembled in authored order', async () => {
    const idsInOrder = Array.from({ length: 105 }, (_, index) => 'post-' + String(index + 1).padStart(3, '0'));
    const data = harness({ home: { section_visibility: { news: false }, section_display: { blogs: 'curated' }, featured_blogs: selections([...idsInOrder, idsInOrder[0]], 'post') }, records: { '/blogs': idsInOrder.slice().reverse().map(id => published(id)) } });
    const result = await data.run();
    assert.deepEqual(ids(result.blogs), idsInOrder);
    assert.deepEqual(data.calls.collections.map(call => call.query.pagination), [{ page: 1, pageSize: 100 }, { page: 2, pageSize: 100 }]);
    assert(data.calls.collections.every(call => JSON.stringify(call.query.filters.documentId.$in) === JSON.stringify(idsInOrder)));
    assert.equal(data.calls.blogs.length, 0);
    return { selectedCount: 105, pages: [1, 2], pageSize: 100, first: result.blogs[0].id, last: result.blogs.at(-1).id };
  });
  await check('Unavailable curated records remain empty instead of becoming unrelated latest content', async () => {
    const data = harness({ home: { section_visibility: { news: false }, section_display: { blogs: 'curated' }, featured_blogs: selections(['selected-blog'], 'post') }, latest: { blogs: [published('unrelated-latest')] }, failCollection: true });
    const result = await data.run();
    assert.equal(result.blogs.length, 0);
    assert.equal(data.calls.optionalFailures, 1);
    assert.equal(data.calls.blogs.length, 0);
    return { latestFallbackRequests: 0 };
  });
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ date: new Date().toISOString(), fixture: 'Actual rs-home.ts and home.ts normalizer transpiled by installed TypeScript into isolated CommonJS VM; actual BLOG_SECTIONS; mocked CMS/latest/catalogue dependencies; no network, server or CMS writes', sourceHashes, tests: results.length, results, errors: [] }, null, 2));
  console.log('Homepage curation: ' + results.length + ' scenarios passed; authored order, published query, empty/hidden sections, opt-ins and 105-record pagination verified.');
})().catch(error => {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ date: new Date().toISOString(), sourceHashes, results, error: String(error), stack: error.stack }, null, 2));
  console.error(error); process.exitCode = 1;
});
