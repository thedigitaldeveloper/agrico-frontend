/* Assemble the researched facts into complete, linked agriculture reading pages. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { buildUniversityTabs } = require('./agrico-university-tabs.cjs');
const { applyPublicationQuality } = require('./agrico-publication-quality.cjs');
const { deepenUniversity, institutionGuides, stateQuestions } = require('./agrico-content-depth.cjs');
const base = path.join(root, 'docs/content/universities-2026-10-30');
const read = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8').replace(/^\uFEFF/, ''));
const save = (file, value) => fs.writeFileSync(path.join(base, file), JSON.stringify(value, null, 2) + '\n');
const researchPack = read('institutions.json');
const profiles = researchPack.institutions;
const briefs = read('seo/university-page-briefs.json');
const queue = read('seo/editorial-queue.json');
const media = read('media-manifest.json').records;
const strict = process.argv.includes('--complete');
const issues = [];
const editorialDir = path.join(base, 'editorial');
fs.mkdirSync(editorialDir, { recursive: true });
const articles = fs.readdirSync(editorialDir).filter(file => file.endsWith('.json')).map(file => ({ file, post: read('editorial/' + file) }));
for (const post of institutionGuides(profiles)) articles.push({ file: 'generated/' + post.slug + '.json', post });
const section = (id, heading, paragraphs = [], more = {}) => ({ id, heading, paragraphs: paragraphs.filter(Boolean), ...more });
const link = (label, href) => '[' + label.replace(/[\[\]]/g, '') + '](' + href + ')';
const valueText = value => typeof value === 'string' || typeof value === 'number' ? String(value) : value && typeof value === 'object' ? [value.title || value.name || value.label, value.text || value.description || value.details || value.value].filter(Boolean).join(': ') : '';
const list = values => (values || []).map(valueText).filter(Boolean);
const programmeGuide = name => /agricultur.*engineer|engineer.*agricultur/i.test(name) ? '/btech-agricultural-engineering' : /diploma/i.test(name) && /agricultur/i.test(name) ? '/diploma-agriculture' : /M\.?\s*B\.?\s*A/i.test(name) && /agri/i.test(name) ? '/mba-agribusiness' : /M\.?\s*Sc/i.test(name) && /agronomy/i.test(name) ? '/msc-agronomy' : /B\.?\s*Sc/i.test(name) && /horticultur/i.test(name) ? '/bsc-horticulture' : /B\.?\s*Sc/i.test(name) && /agricultur/i.test(name) ? '/bsc-agriculture' : null;
const feeText = fee => typeof fee?.amount_inr === 'number' && fee.verification === 'verified' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(fee.amount_inr) + (fee.period ? ' / ' + fee.period : '') + (fee.academic_year ? ' · source session ' + fee.academic_year : '') : 'Current amount not confirmed; request a dated fee statement.';
const postPath = post => '/' + (post.cms_type === 'Articles' ? 'articles' : post.cms_type === 'Blog' ? 'blogs' : 'news') + '/' + post.slug;
const topicPaths = new Map(queue.map(topic => [topic.id, topic.proposed_url]));
const sourcesFor = (profile, sourceIds) => [...new Set(sourceIds || [])].filter(id => profile.sources.some(source => source.id === id));
const refs = (profile, part) => ({ source_ids: sourcesFor(profile, part?.source_ids) });
function mediaFor(profile) {
  return (media.find(row => row.id === profile.id)?.assets || []).map(asset => {
    const publicFile = '/images/institutions/' + profile.slug + '/' + path.basename(asset.file);
    const target = path.join(root, 'public', publicFile);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const input = path.join(base, asset.file);
    if (!fs.existsSync(target) || fs.statSync(target).size !== fs.statSync(input).size) fs.copyFileSync(input, target);
    // Acquisition URLs remain in the internal media manifest, outside the
    // published document and editable CMS image markup.
    return { role: asset.role, src: publicFile, alt: asset.alt, caption: asset.description, background: asset.display_background || 'light', width: asset.width, height: asset.height };
  });
}
const institutionCards = profiles.map(profile => ({ id: profile.id, slug: profile.slug, name: profile.name, href: '/university/' + profile.slug, description: [profile.identity.city, profile.identity.state].filter(Boolean).join(', '), kind: profile.identity.kind, media: mediaFor(profile) }));
const postDocs = articles.map(({ file, post }) => {
  if (!post.slug || !post.title || !post.sections?.length || !post.sources?.length || !post.faqs?.length) issues.push(file + ': missing article body, sources or FAQs');
  const known = queue.find(topic => topic.id === post.id);
  if (known && (post.slug !== known.slug || post.cms_type !== known.cms_type)) issues.push(file + ': topic identity mismatch');
  if (post.cms_type === 'News' && (!post.event_date || !post.published_on)) issues.push(file + ': news needs an independently sourced event and publication date');
  return {
    ...post, kind: post.cms_type, path: postPath(post), meta_title: post.title,
    ...(post.cms_type === 'News' ? { notice_published_on: post.published_on, published_on: undefined } : {}),
    toc: [...post.sections.map(s => ({ id: s.id, title: s.heading })), { id: 'faqs', title: 'Questions answered' }, { id: 'sources-review', title: 'Sources and editorial review' }],
    sections: [...post.sections, section('faqs', 'Questions answered'), section('sources-review', 'Sources and editorial review')],
    related_universities: institutionCards.filter(row => post.related_institution_ids?.includes(row.id)),
    related_posts: [],
  };
});
const postById = new Map(postDocs.map(post => [post.id, post]));
for (const post of postDocs) {
  post.related_posts = (post.related_topic_ids || []).map(id => postById.get(id)).filter(Boolean).map(post => ({ title: post.title, path: post.path, description: post.description, kind: post.kind }));
  const examples = institutionCards.filter(card => post.related_institution_ids?.includes(card.id));
  const candidates = examples.flatMap(card => card.media.filter(image => image.role.startsWith('campus')).map(image => ({ ...image, institution: card.name })));
  const image = candidates.sort((a, b) => b.width * b.height - a.width * a.height)[0];
  if (image) post.hero_media = [{ ...image, role: 'campus_primary', caption: 'Campus example: ' + image.institution + '. ' + (image.caption || '') + ' This contextual image does not document the fee, scholarship or admission outcome described in the guide.' }];
}
const universityDocs = profiles.map(profile => {
  const factSourceIds = new Set();
  function collectFactSources(value) { if (!value || typeof value !== 'object') return; if (Array.isArray(value)) return value.forEach(collectFactSources); for (const [key, item] of Object.entries(value)) if (key === 'source_ids' && Array.isArray(item)) item.forEach(id => factSourceIds.add(id)); else if (!['media', 'sources'].includes(key)) collectFactSources(item); }
  collectFactSources(profile);
  const brief = briefs.find(brief => brief.id === profile.id);
  const card = institutionCards.find(card => card.id === profile.id);
  const veterinary = profile.programmes.every(programme => /veterinary|B\.?\s*V\.?\s*Sc/i.test(programme.name));
  const relatedPosts = (brief?.guide_links || []).map(guide => postById.get(guide.topic_id)).filter(Boolean);
  // The shortlists and campus-comparison blogs also have explicit reciprocal links.
  for (const post of postDocs) if (post.related_institution_ids?.includes(profile.id) && !relatedPosts.includes(post)) relatedPosts.push(post);
  const readIn = id => relatedPosts.filter(post => brief?.guide_links.some(guide => guide.topic_id === post.id && guide.placement === id));
  const reading = id => readIn(id).slice(0, 2).map(post => 'Useful reading: ' + link(post.title, post.path) + '.');
  const factRows = [
    ['Institution', profile.name], ['Institution type', profile.identity.ownership], ['Location', card.description],
    profile.identity.parent_university && ['Affiliation', profile.identity.parent_university],
    profile.identity.established && ['Established', String(profile.identity.established)],
    ['Programmes covered here', profile.programmes.map(p => p.name).join('; ')],
    profile.identity.address && ['Address', profile.identity.address],
  ].filter(Boolean);
  const programmes = profile.programmes.map(programme => ({
    heading: programme.name,
    paragraphs: [programme.summary, programme.fees?.note, programme.icar_scope_note].filter(Boolean),
    source_ids: [...new Set([...(programme.source_ids || []), ...(programme.fees?.source_ids || [])])],
  }));
  const steps = (profile.admissions.steps || []).map(step => ({ heading: step.title, paragraphs: [step.text] }));
  const scholarshipSchemes = (profile.scholarships.schemes || []).map(scheme => ({ heading: scheme.name, paragraphs: [scheme.details || scheme.description].filter(Boolean), source_ids: scheme.source_ids || [] }));
  const faqLinks = answer => {
    const id = /accredit|ICAR/i.test(answer.question) ? 'icar-check' : /fee|cost|tuition/i.test(answer.question) ? 'fee-budget' : /eligib|admission|apply/i.test(answer.question) && !veterinary ? 'bsc-eligibility' : null;
    const post = postById.get(id);
    return { ...answer, answer: answer.answer + (post ? ' See ' + link(post.title, post.path) + ' for the checks behind this question.' : '') };
  };
  const sections = [
    section('overview', profile.overview.heading, profile.overview.paragraphs, refs(profile, profile.overview)),
    section('quick-facts', 'Key facts at a glance', [], { table: { columns: ['What to check', 'Institution information'], rows: factRows } }),
    section('programmes-fees', veterinary ? 'Veterinary programme, fees and eligibility' : 'Agriculture programmes, fees and eligibility', ['Compare the exact programme and fee category. The source session is shown beside each verified amount; tuition, examination charges, deposits and residential costs can have different scopes.', ...reading('programmes-fees')], {
      table: { columns: ['Programme', 'Duration / level', 'Eligibility', 'Admission route', 'Published fee and session'], rows: profile.programmes.map(p => [programmeGuide(p.name) ? link(p.name, programmeGuide(p.name)) : p.name, [p.duration, p.level].filter(Boolean).join(' · '), p.eligibility || 'Confirm the intake-year criteria with the institution.', p.admission_route || 'Confirm the programme-specific admission channel.', feeText(p.fees)]) }, subsections: programmes,
    }),
    section('admission-process', profile.admissions.heading, [profile.admissions.intro, profile.admissions.route_scope, ...reading('admission-process')], { ...refs(profile, profile.admissions), bullets: list(profile.admissions.eligibility_points), subsections: [...steps, ...(profile.admissions.documents?.length ? [{ heading: 'Documents listed by the institution', paragraphs: [], bullets: list(profile.admissions.documents) }] : []), ...(profile.admissions.dates?.length ? [{ heading: 'Dated official notices', paragraphs: ['These dates describe the cited notice or session. A past notice does not establish that applications or seats are currently available.'], bullets: profile.admissions.dates.map(date => [date.label, date.date, date.academic_year].filter(Boolean).join(' · ')) }] : [])], official_link: { label: 'Official admission information', href: profile.identity.admissions_url || profile.identity.website } }),
    section('icar-accreditation', 'ICAR accreditation: programme, unit and validity', [profile.recognition.text, ...reading('icar-accreditation')], { ...refs(profile, profile.recognition), table: { columns: ['Listed academic unit', 'Programmes as listed', 'Recorded term'], rows: profile.recognition.icar_units.map(unit => [unit.unit, (unit.programmes_as_printed || []).filter(value => !/^[_\s-]*$/.test(value)).map(value => value.replace(/\s+/g, ' ').trim()).join('; '), unit.valid_from + ' to ' + unit.valid_until]) }, bullets: (profile.recognition.other_recognitions || []).map(valueText).filter(Boolean) }),
    section('curriculum-practical', veterinary ? 'Clinical and practical learning' : 'Curriculum and practical learning', reading('curriculum-practical'), { ...refs(profile, profile.campus), bullets: list(profile.campus.practical_learning) }),
    section('campus-facilities', profile.campus.heading, [profile.campus.intro], { ...refs(profile, profile.campus), subsections: (profile.campus.facilities || []).map(facility => ({ heading: facility.name, paragraphs: [facility.description], source_ids: facility.source_ids || [] })), images: card.media.filter(asset => asset.role.startsWith('campus')) }),
    section('scholarships', profile.scholarships.heading, [profile.scholarships.text, ...reading('scholarships')], { ...refs(profile, profile.scholarships), subsections: scholarshipSchemes }),
    section('career-placements', profile.placements.heading, [profile.placements.text], { ...refs(profile, profile.placements), bullets: [...list(profile.placements.statistics), ...list(profile.placements.recruiters)], subsections: profile.faculty.people?.length ? [{ heading: 'Academic staff listed by the institution', paragraphs: [profile.faculty.intro], bullets: profile.faculty.people.map(person => [person.name, person.role || person.designation, person.qualification].filter(Boolean).join(' · ')) }] : [] }),
    section('compare-options', 'Other institutions to compare', ['Compare programme fit, admission route, costs and the actual campus rather than treating the following options as a ranking.'], { university_cards: (profile.related || []).map(row => institutionCards.find(card => card.id === row.id)).filter(Boolean) }),
    section('updates-guides', 'Admission guides and related reading', ['Use these explanations to understand the questions behind your shortlist, then check the institution’s current official notice.'], { post_cards: relatedPosts.map(post => ({ title: post.title, path: post.path, description: post.description, kind: post.kind })) }),
    section('faqs', 'Applicant questions answered'), section('sources-review', 'Sources and editorial review'),
  ];
  return {
    id: String(profile.id), institution_id: profile.id, kind: 'University', slug: profile.slug, path: card.href,
    name: profile.name, title: profile.name, meta_title: profile.name + (veterinary ? ' | Veterinary Courses, Fees & Admissions' : ' | Agriculture Courses, Fees & Admissions'),
    description: profile.seo.description, summary: profile.hero.summary, byline: 'Agrico Editorial', reviewed_on: profile.editorial_reviewed_on || (profile.sources.some(source => source.checked_on === '2026-10-31') ? '2026-10-31' : '2026-10-30'),
    eyebrow: profile.hero.eyebrow, identity: profile.identity, hero_media: card.media,
    sections, toc: sections.map(s => ({ id: s.id, title: s.heading })), faqs: profile.faqs.map(faqLinks),
    sources: profile.sources.filter(source => !source.id.startsWith('media_') || factSourceIds.has(source.id)).map(source => source.id.startsWith('media_') ? { id: source.id, title: profile.name + ' — official institutional page', url: source.url, kind: source.kind, access: source.access, checked_on: source.checked_on, note: source.note, link_status: source.link_status } : source),
    related_universities: (profile.related || []).map(row => institutionCards.find(card => card.id === row.id)).filter(Boolean),
    related_posts: relatedPosts.slice(0, 4).map(post => ({ title: post.title, path: post.path, description: post.description, kind: post.kind })),
  };
});
const universityTabs = universityDocs.flatMap(doc => buildUniversityTabs(profiles.find(profile => profile.id === doc.institution_id), doc, postDocs));
for (const doc of universityDocs) deepenUniversity(profiles.find(profile => profile.id === doc.institution_id), doc, universityTabs.filter(tab => tab.institution_id === doc.institution_id), profiles, postDocs);
const stateDocs = read('seo/state-page-briefs.json').map(hub => {
  const localProfiles = profiles.filter(profile => profile.identity.state === hub.state);
  const localDocs = universityDocs.filter(doc => doc.identity.state === hub.state);
  const routeTopic = hub.state === 'Tamil Nadu' ? 'tnau-route' : hub.state === 'Andhra Pradesh' ? 'angrau-route' : hub.state === 'Rajasthan' ? 'rajasthan-jet' : null;
  const topic = postById.get(routeTopic);
  const states = {
    'Tamil Nadu': 'Tamil Nadu applicants should distinguish TNAU-affiliated colleges from private and deemed universities with their own admission notices. A college affiliation and a university name are different facts; the course and quota determine which published rules to read.',
    'Rajasthan': 'Rajasthan includes private universities and independently affiliated options. Check whether the exact programme participates in the current JET counselling route or uses a separate university process. Some fee schedules distinguish domicile categories, so a headline price may not match your offer.',
    'Punjab': 'The Punjab profiles include agriculture degrees and a separate veterinary pathway. Compare the qualification first: the animal-health programme and crop-science degree have different subject requirements, admission rules and practical teaching settings.',
    'Madhya Pradesh': 'Madhya Pradesh applicants can compare institutions in different cities and campus settings. Confirm the named agricultural school and current entry route; a university-wide recognition, fee or placement headline should not replace programme-level evidence.',
    'Uttar Pradesh': 'The Uttar Pradesh collection brings together universities and an independent affiliated college. Read the awarding/affiliating university, campus address and programme-specific admission notice before comparing fees or practical-learning claims.',
    'Andhra Pradesh': 'For ANGRAU-affiliated agriculture colleges in Andhra Pradesh, check the current prospectus and the relevant quota. AP EAPCET-based counselling, management-category requirements and individual institutional charges should be read separately.',
    'Haryana': 'Haryana applicants should compare the location of the actual teaching campus, commute or accommodation needs, and the exact agricultural programme. Confirm the current eligibility and fee category directly rather than transferring another Haryana university’s rules.',
    'Uttarakhand': 'The Uttarakhand profiles have different institutional identities and learning settings. Compare the agriculture curriculum, local field-learning arrangements and programme-specific admission notice together with the costs of living and travel.',
  };
  const rows = localProfiles.map(profile => [link(profile.name, '/university/' + profile.slug), profile.identity.city, profile.identity.ownership, profile.programmes.map(p => p.name).join('; ')]);
  const sections = [
    section('state-overview', 'Planning agriculture study in ' + hub.state, [states[hub.state] || 'Compare the exact institution, programme and current admission notice before making your shortlist.', 'This collection includes ' + localProfiles.length + ' institutions from Agrico’s sourced 58-institution private agriculture and allied-study research set. It is not an exhaustive directory of every college in the state or a ranking.']),
    section('institutions', 'Institutions and programmes to compare', [], { table: { columns: ['Institution', 'City', 'Institution type', 'Programmes covered'], rows } }),
    section('admission-checks', 'Which admission instructions should you use?', [topic ? 'Start with ' + link(topic.title, topic.path) + ', then confirm the entry-year rules for the exact institution and quota.' : 'Open the institution profile and follow its official admission link. Compare accepted subjects, selection route, document requirements and the relevant fee period.'], { bullets: ['Match the named campus and awarding or affiliating university.', 'Compare fees using the source session and quota, with accommodation and compulsory charges identified.', 'Check the exact ICAR-listed unit and programme term rather than assuming every course is covered.', 'Ask how the department organises practical classes, field work or clinical teaching for your cohort.'] }),
    section('shortlist', 'Build a useful shortlist', ['Choose a few programmes that match your subjects and learning interests. Keep separate notes for academic eligibility, recognition, practical facilities and the full cost of attendance. A better-looking campus image does not answer those questions.'], { university_cards: localDocs.map(doc => institutionCards.find(card => card.id === doc.institution_id)) }),
    section('faqs', 'Agriculture study in ' + hub.state + ': questions answered'),
    section('sources-review', 'Sources and editorial review'),
  ];
  return { id: 'state-' + hub.state, kind: 'State', slug: hub.proposed_url.split('/').pop(), path: hub.proposed_url, title: 'Private agriculture colleges and universities in ' + hub.state, meta_title: 'Agriculture Colleges in ' + hub.state + ' | Courses & Admission Checks', description: 'Compare sourced agriculture and allied-study profiles in ' + hub.state + ', their programmes, cities, admission routes and fee checks.', summary: 'Explore programme-specific information for the ' + localProfiles.length + ' institutions in this researched collection.', byline: 'Agrico Editorial', reviewed_on: '2026-10-31', sections, toc: sections.map(s => ({ id: s.id, title: s.heading })), faqs: stateQuestions(hub, localProfiles, topic), sources: localDocs.flatMap(doc => doc.sources.filter(s => /icar|regulat|affiliat/i.test(s.kind || '')).slice(0, 1)).filter((s, index, array) => array.findIndex(other => other.url === s.url) === index), related_universities: [], related_posts: topic ? [{ title: topic.title, path: topic.path, description: topic.description, kind: topic.kind }] : [] };
});
const content = { version: '4.1', checked_on: researchPack.checked_on, tabs_prepared_on: '2026-10-31', status: 'structured_content_written', institutions: universityDocs, university_tabs: universityTabs, posts: postDocs, states: stateDocs };
applyPublicationQuality(content, profiles);
const routes = new Set(['/', '/articles', '/blogs', '/news', '/universities', '/agriculture-colleges', '/bsc-agriculture', '/bsc-horticulture', '/btech-agricultural-engineering', '/diploma-agriculture', '/mba-agribusiness', '/msc-agronomy', ...universityDocs.map(doc => doc.path), ...universityTabs.map(doc => doc.path), ...postDocs.map(doc => doc.path), ...stateDocs.map(doc => doc.path)]);
const links = [];
function checkText(value, from) {
  if (typeof value === 'string') for (const match of value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const target = match[2];
    if (target.startsWith('/')) {
      const targetPath = target.split('#')[0].split('?')[0];
      links.push({ from, to: targetPath, anchor: match[1] });
      if (!routes.has(targetPath)) issues.push(from + ': unknown internal target ' + target);
    } else if (!/^https?:\/\//.test(target)) issues.push(from + ': unsafe link scheme');
  }
  else if (Array.isArray(value)) value.forEach(item => checkText(item, from));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => checkText(item, from));
}
for (const doc of [...universityDocs, ...universityTabs, ...postDocs, ...stateDocs]) {
  const ids = doc.sections.map(section => section.id);
  if (new Set(ids).size !== ids.length) issues.push(doc.path + ': duplicate section id');
  if (!doc.description || !doc.summary || !doc.sources.length) issues.push(doc.path + ': missing metadata or source provenance');
  checkText([doc.sections, doc.faqs], doc.path);
}
if (strict) for (const topic of queue) if (!postById.has(topic.id)) issues.push('Unwritten topic: ' + topic.id);
save('publication.json', content);
const tabFolder = path.join(base, 'tab-pages');
fs.mkdirSync(tabFolder, { recursive: true });
for (const profile of profiles) fs.writeFileSync(path.join(tabFolder, profile.slug + '.json'), JSON.stringify(universityTabs.filter(tab => tab.slug === profile.slug), null, 2) + '\n');
save('publication-runtime.json', { ...content, university_tabs: universityTabs.map(({ institution_id, slug, tab_slug, path, reviewed_on, indexing }) => ({ institution_id, slug, tab_slug, path, reviewed_on, indexing })) });
const reviewTemplate = fs.readFileSync(path.join(base, 'publication-review-template.html'), 'utf8');
fs.writeFileSync(path.join(base, 'publication-review.html'), reviewTemplate.replace('/*PUBLICATION_DATA*/', 'const DATA=' + JSON.stringify(content).replace(/</g, '\\u003c') + ';'));
save('publication-link-map.json', { checked_on: '2026-10-30', links, routes: [...routes] });
const importPlan = { status: 'prepared_not_executed', matching_key: 'slug', university_field: 'agriculture_content', editorial_field: 'editorial_content', instructions: ['Match institutions by slug and preserve existing document IDs. Create a missing institution from the prepared base fields instead of importing an unnamed duplicate.', 'Attach media using cms-media-import-plan.json, then replace the matching local public image URLs in the content JSON with uploaded URLs.', 'Store the university document in agriculture_content and the editorial document in editorial_content.', 'Set the relation fields only after resolving existing university/programme document IDs.', 'Keep editorial type canonical routes, the honest byline and actual review date; official notice dates are distinct from Agrico article publication.', 'Validate remaining fact gaps before quoting their unpublished values. No import or remote publication has been executed.'], universities: universityDocs.map(doc => { const source = profiles.find(profile => profile.id === doc.institution_id); return { slug: doc.slug, fields: { name: doc.name, slug: doc.slug, city: doc.identity.city, state: doc.identity.state, country: 'India', address: source.identity.address || null, established_year: source.identity.established || null, agriculture_content: { ...doc, tab_pages: universityTabs.filter(tab => tab.institution_id === doc.institution_id) } }, taxonomy_lookups: { ownership_type: source.identity.ownership }, programme_source: source.editorial_file + '#programmes' }; }), posts: postDocs.map(doc => ({ slug: doc.slug, fields: { name: doc.title, slug: doc.slug, type: doc.kind, description: doc.description, author_name: doc.byline, reviewed_at: doc.reviewed_on + 'T00:00:00.000Z', editorial_content: doc }, university_slugs: doc.related_universities.map(row => row.slug), dateTime_rule: 'Set the actual Agrico publication timestamp when publishing. A historical official notice date is not this article publication date.' })) };
save('cms-content-import-plan.json', importPlan);
const report = { checked_on: '2026-10-31', institutions: universityDocs.length, university_tab_pages: universityTabs.length, tabs_per_institution: 11, total_university_pages: universityDocs.length + universityTabs.length, articles: postDocs.filter(doc => doc.kind === 'Articles').length, blogs: postDocs.filter(doc => doc.kind === 'Blog').length, news: postDocs.filter(doc => doc.kind === 'News').length, state_collections: stateDocs.length, contextual_links: links.length, body_words: [...universityDocs, ...universityTabs, ...postDocs, ...stateDocs].reduce((sum, doc) => sum + JSON.stringify([doc.summary, doc.sections, doc.faqs]).split(/\s+/).length, 0), missing_topics: queue.filter(topic => !postById.has(topic.id)).map(topic => topic.id), issues };
save('publication-validation.json', report);
console.log(JSON.stringify({ ...report, issues: issues.slice(0, 15) }, null, 2));
if (issues.length) process.exitCode = 1;
