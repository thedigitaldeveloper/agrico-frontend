const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const profiles = JSON.parse(fs.readFileSync(path.join(base, 'institutions.json'), 'utf8')).institutions;
const folder = path.join(base, 'seo');
fs.mkdirSync(folder, { recursive: true });
const save = (name, value) => fs.writeFileSync(path.join(folder, name), JSON.stringify(value, null, 2) + '\n');
const publicationFile = path.join(base, 'publication.json');
const publication = fs.existsSync(publicationFile) ? JSON.parse(fs.readFileSync(publicationFile, 'utf8')) : null;
const readyTopics = new Map((publication?.posts || []).map(post => [post.id, post]));
const contentComplete = readyTopics.size >= 16 && publication?.institutions?.length === 58;
const sources = [
  { id: 'reference', title: 'Reference university page and its linked admission/article routes', url: 'https://www.merishiksha.org/university/rnb-global-university' },
  { id: 'helpful', title: 'Google: helpful, reliable content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
  { id: 'links', title: 'Google: crawlable links and descriptive anchor text', url: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable' },
  { id: 'rankings', title: 'Google: no guaranteed first position', url: 'https://developers.google.com/search/docs/fundamentals/do-i-need-seo' },
  { id: 'faq-2026', title: 'Google: FAQ rich results retired from 7 May 2026', url: 'https://developers.google.com/search/updates' },
  { id: 'breadcrumbs', title: 'Google: breadcrumb markup', url: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb' },
];
const sections = [
  { id: 'overview', title: 'Agriculture study at this institution', intent: 'Identify the school/college and explain the relevant learning setting.', content: 'overview', status: 'copy_available' },
  { id: 'quick-facts', title: 'Key facts at a glance', intent: 'Location, ownership, affiliation and verified establishment details in a small table.', content: 'identity', status: 'copy_available' },
  { id: 'programmes-fees', title: 'Agriculture programmes, fees and eligibility', intent: 'Programme table with duration, qualifying subjects, fee period, quota, source year and offering-detail links.', content: 'programmes', status: 'table_and_link_binding_needed' },
  { id: 'admission-process', title: 'How to apply and which route applies', intent: 'Programme-specific entry route, documents and dated notices; distinguish university admissions from state/ICAR counselling.', content: 'admissions', status: 'verification_and_link_binding_needed' },
  { id: 'icar-accreditation', title: 'ICAR accreditation: course, unit and validity', intent: 'Show the precise listed programme/unit and term; link to the official source and the accreditation explainer.', content: 'recognition', status: 'copy_available' },
  { id: 'curriculum-practical', title: 'Curriculum and practical learning', intent: 'Verified subjects, farm/lab work, RAWE or experiential learning where the institution actually documents them.', content: 'campus.practical_learning', status: 'institution_specific_expansion_needed' },
  { id: 'campus-facilities', title: 'Campus, laboratories and student facilities', intent: 'Authentic photos, useful captions and verified facilities, with location/campus scope.', content: 'campus', status: 'media_and_content_binding_needed' },
  { id: 'scholarships', title: 'Scholarships and cost support', intent: 'Applicable scheme, source year, conditions and exclusions; never assume every general scholarship covers agriculture.', content: 'scholarships', status: 'publish_verified_items_only' },
  { id: 'career-placements', title: 'Career support and reported outcomes', intent: 'Separate general career possibilities from programme-specific placement evidence; attach year and scope to figures.', content: 'placements', status: 'publish_verified_items_only' },
  { id: 'compare-options', title: 'Other agriculture institutions to compare', intent: 'Relevant alternatives by programme, location and verified facts; no unsupported ranking.', content: 'related', status: 'published_target_matching_needed' },
  { id: 'updates-guides', title: 'Admission updates and useful guides', intent: 'Relevant published news plus explanatory articles/blogs, automatically selected through CMS relations.', content: 'new_editorial_relations', status: 'not_yet_written_or_connected' },
  { id: 'faqs', title: 'Applicant questions answered', intent: 'Institution-specific answers with useful contextual links, without repeating entire sections.', content: 'faqs', status: 'copy_available_link_enhancement_needed' },
  { id: 'sources-review', title: 'Sources and content review date', intent: 'Concise official references and a real editorial review date/byline; keep internal research gaps outside public marketing copy.', content: 'sources', status: 'editorial_display_binding_needed' },
];
const topics = [
  ['icar-check', 'Articles', 'How to check ICAR accreditation for an agriculture programme', 'icar-accreditation-how-to-check', 'Explain programme/unit scope, dates and official-list checks.', 'ICAR accreditation register and official accreditation rules'],
  ['bsc-eligibility', 'Articles', 'B.Sc. Agriculture eligibility: subjects and admission routes', 'bsc-agriculture-eligibility', 'Help applicants check their subject combination and the exact university criteria.', 'Current official admission notices; no universal percentage claim'],
  ['fee-budget', 'Articles', 'How to compare agriculture fees, quotas and living costs', 'agriculture-fee-budget', 'Explain semester/year/total, quota differences, compulsory charges and hostel budgets.', 'Dated official fee schedules with charge definitions'],
  ['rawe', 'Articles', 'RAWE and experiential learning in B.Sc. Agriculture', 'rawe-and-experiential-learning', 'Explain the learning stages and questions to ask about actual implementation.', 'ICAR academic guidance plus institution curriculum evidence'],
  ['agri-v-engineering', 'Articles', 'B.Sc. Agriculture or Agricultural Engineering: compare the study paths', 'bsc-agriculture-vs-agricultural-engineering', 'Compare subjects, entry requirements and practical learning without declaring a universal winner.', 'Official curricula and entry requirements'],
  ['msc-pathways', 'Articles', 'Choosing an M.Sc. Agriculture specialisation', 'msc-agriculture-specialisations', 'Compare qualifying degrees and subject focus across agriculture specialisations.', 'University programme notices and postgraduate curricula'],
  ['cuet-icar', 'Articles', 'CUET and ICAR UG counselling: understand the admission route', 'cuet-icar-agriculture-admission-route', 'Separate examination registration, counselling and institution-specific participation.', 'Current NTA/ICAR notices and counselling information'],
  ['tnau-route', 'Articles', 'Applying to TNAU-affiliated private agriculture colleges', 'tnau-private-agriculture-college-admission', 'Explain the documented counselling and management channels, current eligibility and fee scope.', 'TNAU current brochure/FAQs and individual college notices'],
  ['angrau-route', 'Articles', 'ANGRAU-affiliated private agriculture admission and fee quotas', 'angrau-private-agriculture-college-admission', 'Explain AP EAPCET route, convenor/management charges and published exclusions.', 'Current official ANGRAU prospectus and college notices'],
  ['rajasthan-jet', 'Articles', 'Rajasthan JET and agriculture college admission routes', 'rajasthan-jet-agriculture-admission', 'Explain where JET applies and where a university publishes a different route.', 'Current official examination and participating-institution notices'],
  ['college-questions', 'Blog', 'Questions to ask before choosing an agriculture college', 'questions-before-choosing-agriculture-college', 'A practical applicant checklist about curriculum, recognition and learning facilities.', 'Draw examples from verified institution profiles; no invented campus visits'],
  ['fee-letter', 'Blog', 'Reading an agriculture fee letter before paying', 'reading-an-agriculture-fee-letter', 'A worked explanation of fee periods, deposits, exclusions and written confirmation.', 'Use labelled real fee examples or clearly labelled illustrative arithmetic'],
  ['campus-compare', 'Blog', 'Compare two agriculture campuses using a useful checklist', 'compare-agriculture-campuses', 'Help families compare actual learning conditions and travel/living constraints.', 'Verified facilities; visitor questions do not pretend to be first-hand reviews'],
  ['counselling-prep', 'Blog', 'Prepare for agriculture admission counselling', 'prepare-for-agriculture-counselling', 'A preparation checklist linking to the correct route and official documentation.', 'Current official counselling instructions for each referenced route'],
  ['scholarship-questions', 'Blog', 'Check agriculture scholarship conditions before budgeting', 'agriculture-scholarship-conditions', 'Explain programme exclusions, renewal criteria and the difference between eligibility and an award.', 'Dated programme-applicable scholarship terms'],
  ['career-choice', 'Blog', 'Plan an agriculture study pathway after Class 12', 'agriculture-study-plan-after-class-12', 'Help students connect subject interests with degree choices and further study.', 'Official programme requirements; no job or salary guarantee'],
].map(([id, cms_type, title, slug, intent, evidence_needed]) => ({ id, cms_type, title, slug, proposed_url: '/' + (cms_type === 'Articles' ? 'articles' : 'blogs') + '/' + slug, intent, evidence_needed, status: 'planned_not_written', priority: ['icar-check', 'bsc-eligibility', 'fee-budget', 'agri-v-engineering', 'college-questions', 'counselling-prep'].includes(id) ? 'P1' : 'P2', linked_institution_ids: [] }));
const byTopic = new Map(topics.map(topic => [topic.id, topic]));
const knownProgramme = name => /engineering/i.test(name) && /agricultur/i.test(name) ? '/btech-agricultural-engineering' : /diploma/i.test(name) && /agricultur/i.test(name) ? '/diploma-agriculture' : /M\.?\s*B\.?\s*A/i.test(name) && /agri/i.test(name) ? '/mba-agribusiness' : /M\.?\s*Sc/i.test(name) && /agronomy/i.test(name) ? '/msc-agronomy' : /B\.?\s*Sc/i.test(name) && /horticultur/i.test(name) ? '/bsc-horticulture' : /B\.?\s*Sc/i.test(name) && /agricultur/i.test(name) ? '/bsc-agriculture' : null;
const stateCounts = profiles.reduce((map, profile) => (map[profile.identity.state] = (map[profile.identity.state] || 0) + 1, map), {});
const stateHubs = Object.entries(stateCounts).filter(([, count]) => count >= 3).map(([state, count]) => ({ state, institutions: count, proposed_url: '/agriculture-colleges/' + state.toLowerCase().replace(/\s+/g, '-'), status: 'planned_collection_route', publish_requirement: 'Unique state-specific admission explanation and a useful verified institution comparison; do not publish a filter-only duplicate.' }));
const briefs = profiles.map(profile => {
  const details = JSON.stringify([profile.programmes, profile.admissions, profile.campus]).toLowerCase();
  const hasBscAgriculture = profile.programmes.some(row => /B\.?\s*Sc/i.test(row.name) && /agricultur/i.test(row.name));
  const topicIds = new Set(['icar-check', 'fee-budget', 'college-questions', 'counselling-prep']);
  if (hasBscAgriculture) for (const id of ['bsc-eligibility', 'agri-v-engineering', 'career-choice']) topicIds.add(id);
  if (/rawe|rural agricultural|experiential|student ready/.test(details)) topicIds.add('rawe');
  if (profile.programmes.some(row => /M\.?\s*Sc/i.test(row.name) && /agri|agronomy|horticul|plant|soil/.test(row.name.toLowerCase()))) topicIds.add('msc-pathways');
  if (details.includes('cuet')) topicIds.add('cuet-icar');
  if (/tamil nadu agricultural/i.test(profile.identity.parent_university || '')) topicIds.add('tnau-route');
  if (/acharya.*ranga|angrau/i.test((profile.identity.parent_university || '') + details)) topicIds.add('angrau-route');
  if (profile.identity.state === 'Rajasthan' && /\bjet\b/.test(details)) topicIds.add('rajasthan-jet');
  if (profile.scholarships.schemes.length || /exclu|scholarship/i.test(profile.scholarships.text)) topicIds.add('scholarship-questions');
  const reading = [...topicIds].map(id => {
    const topic = byTopic.get(id); topic.linked_institution_ids.push(profile.id);
    return { topic_id: id, anchor: topic.title, proposed_url: topic.proposed_url, target_status: 'planned_not_written', placement: id === 'icar-check' ? 'icar-accreditation' : ['fee-budget', 'fee-letter'].includes(id) ? 'programmes-fees' : id === 'rawe' ? 'curriculum-practical' : id === 'scholarship-questions' ? 'scholarships' : ['bsc-eligibility', 'cuet-icar', 'tnau-route', 'angrau-route', 'rajasthan-jet', 'counselling-prep'].includes(id) ? 'admission-process' : 'updates-guides' };
  });
  const focus = profile.programmes.some(row => /veterinary|B\.?V\.?Sc/i.test(row.name)) && !hasBscAgriculture ? 'veterinary and animal sciences' : 'agriculture and allied study';
  return {
    id: profile.id, name: profile.name, slug: profile.slug, primary_page: '/university/' + profile.slug,
    status: 'research_copy_available_seo_expansion_planned',
    primary_intent: profile.name + ' ' + focus + ' courses, fees and admission requirements',
    suggested_h1: profile.name + ': ' + (focus === 'veterinary and animal sciences' ? 'Veterinary Courses and Admission Information' : 'Agriculture Courses and Admission Information'),
    metadata: { source: 'Existing unique profile SEO title/description can be retained and refined for this specific intent.', existing_title: profile.seo.title, existing_description: profile.seo.description },
    toc: sections.map(section => ({ id: section.id, title: section.title, href: '#' + section.id, source_field: section.content, next_step: section.status })),
    programme_links: profile.programmes.map(row => ({ name: row.name, general_guide_url: knownProgramme(row.name), offering_url_pattern: knownProgramme(row.name) ? '/offering/' + profile.slug + knownProgramme(row.name) : null, activation: 'Only after the matching programme and institution are published; no draft 404 links.' })),
    guide_links: reading,
    location_hub: stateHubs.find(hub => hub.state === profile.identity.state)?.proposed_url || null,
    related_institutions: (profile.related || []).map(row => ({ id: row.id, name: row.name, proposed_url: '/university/' + row.slug, activation: 'Published target required' })),
    news: { status: 'event_driven_not_fabricated', official_admission_source: profile.identity.admissions_url || profile.identity.website, trigger_types: ['Official admission calendar or revised deadline', 'Published fee revision', 'Dated ICAR decision', 'Documented curriculum or programme change'], public_empty_state: 'Omit an empty news block rather than fabricate an update.' },
    engagement: ['Working TOC and active section state', 'Programme and fee comparison table', 'Actual logo/campus photos with useful captions', 'Compare relevant institutions', 'Ask for eligibility/admission guidance with the selected institution preserved', 'Useful related reading and official references'],
    facts_to_resolve: profile.verification_gaps,
  };
});
const plan = {
  version: '2.0', checked_on: '2026-10-30', status: 'blueprint_not_implemented',
  conclusion: 'The 58 original profiles are a sourced editorial base. They are not yet a complete contextually interlinked SEO publication system.',
  reference_audit: { source: sources[0].url, observed: ['Eleven named institution navigation tabs.', 'Nine working in-page TOC anchors on the main overview.', 'Four tables on the main overview.', 'Four linked supporting articles; a sampled article links back to the university.', 'Compare/brochure/counselling interactions and related-institution discovery.', 'Entity/breadcrumb markup on the overview and Article markup on the sampled guide.'], cautions: ['Reference rankings, traffic and conversion performance were not available; structure alone does not establish SEO success.', 'The initial course-and-fee audit used a different path from the actual course-fee navigation target; do not infer that the supplied fee tab itself was broken.', 'The sampled news route contained three H1 elements; our target is one main H1 with meaningful H2/H3 sections.', 'Approximate fees, financial-scheme eligibility and aggregate ratings require their own evidence; do not borrow those claims.'] },
  gap_analysis: [
    { feature: 'Original researched institutional copy', current: '58 profiles, programme facts, FAQs and source logs prepared.', next: 'Reorganise for applicant search intent and readable page sections.' },
    { feature: 'Full TOC plus section navigation', current: 'The live detail UI has a short section bar; the drafts do not carry a complete publication TOC.', next: 'Build deterministic H2/H3 anchors for the complete agriculture outline.' },
    { feature: 'Contextual internal links', current: 'Draft paragraphs and FAQs are plain text; related-institution selections alone do not create a content network.', next: 'Add natural programme/guide/exam links and reciprocal article links with published-target checks.' },
    { feature: 'University-specific related editorial content', current: 'CMS has Articles, News, Press release and Blog types, but no direct university relation in the inspected schema.', next: 'Add explicit university/programme relations and display relevant related posts.' },
    { feature: 'Route and canonical consistency', current: 'Articles and Blogs currently expose overlapping content types through separate detail route families.', next: 'Choose one canonical URL per post, validate its type, and redirect or canonicalise alternate paths.' },
    { feature: 'Evidence and current fees', current: 'Source years, quotas and unknown facts are recorded.', next: 'Publish only supported numbers; complete the open facts needed for each intended page.' },
    { feature: 'Media and engagement', current: 'Institution logos and campus photos are stored locally with provenance and a prepared CMS upload map; publication binding remains pending.', next: 'Use the verified stored institution logo and campus images in the published detail views.' },
  ],
  page_outline: sections,
  architecture: ['University profile links to its actual course offerings, relevant programme guides and a small contextual reading set.', 'Each guide links back to relevant institution profiles and the correct programme page.', 'News links to the affected institution/programme; the institution shows the same published update.', 'State collection pages connect relevant profiles where there is enough distinct useful information.'],
  editorial_types: [
    { type: 'Articles', role: 'Evergreen explanatory guides backed by official sources.', example: 'How to check an agriculture programme’s ICAR term.' },
    { type: 'Blog', role: 'Decision support, comparison methods and practical applicant checklists.', example: 'Questions to ask before choosing an agriculture campus.' },
    { type: 'News', role: 'Dated, verified admission/fee/exam/accreditation changes.', example: 'A specific official revised counselling notice; not a generic admissions-open headline.' },
    { type: 'Press release', role: 'Only a genuine attributed institutional announcement.', example: 'An actual sourced announcement, labelled by its publisher and date.' },
  ],
  linking_rules: ['Use ordinary crawlable <a href> links with concise descriptive anchor text.', 'Link where the destination answers the reader’s next question; avoid repeated keyword anchors and unrelated footer link dumps.', 'Do not activate planned URLs until the destination is published and returns its real content.', 'Give the main hub a useful summary; create separate admission/fee pages only when each can answer a distinct query with enough unique verified information.', 'Keep one canonical address for each post and institution intent; no duplicated article/blog copies.', 'Do not publish blanket exam routes, loan-scheme eligibility or all-course ICAR claims.'],
  cms_changes_needed: ['Add university and programme relations to editorial posts, retaining existing course/exam/stream taxonomy relations.', 'Represent section headings/ids and rich-text inline links so the TOC and body remain aligned.', 'Add real author/reviewer and reviewed-at fields or an honest publisher byline.', 'Validate internal link targets and show only published related items.', 'Retain media provenance, fee period/quota/source-year and exact programme accreditation scope.'],
  google_guidance: ['Original useful analysis and institution-specific facts matter more than merely rewriting another publisher.', 'There is no Google-prescribed word-count target; depth follows the applicant question and available evidence.', 'Use meaningful links and a coherent hierarchy; links are not a guaranteed ranking formula.', 'FAQ answers remain useful for students, but Google retired FAQ rich results from 7 May 2026. Do not promise FAQ snippets.', 'Use accurate entity, breadcrumb and editorial structured data matching visible content; never invent AggregateRating.', 'Public crawlability, canonical URLs, sitemaps, mobile usability and Search Console verification are launch checks. No one can guarantee immediate first position.'],
  publication_sequence: ['Prepare one agriculture-focused RNB pilot using this outline and the researched facts/media.', 'Create the first useful shared guides and their stable canonical URLs.', 'Bind and review a small initial institution batch, then extend the verified structure across all 58.', 'Publish genuine updates as evidence appears; do not manufacture news to fill a quota.', 'Check actual indexing/query performance after public launch and improve content from real user/search evidence.'],
  ranking_expectation: 'No guaranteed first position or immediate indexing. This is a content and technical preparation plan, not proof of search performance.',
  sources,
};
if (contentComplete) {
  plan.version = '3.0';
  plan.status = 'content_written_local_frontend_implemented';
  for (const section of plan.page_outline) section.status = 'implemented_with_source_scoped_content';
  const deferred = (publication.university_tabs || []).filter(doc => doc.indexing?.index === false);
  plan.conclusion = 'All 58 institutions have an overview and ten separate subject tab pages. The page structure is complete but factual coverage is uneven: ' + profiles.reduce((sum, profile) => sum + profile.verification_gaps.length, 0) + ' research gaps remain and ' + deferred.length + ' evidence-poor tabs defer search indexing while remaining readable. Ten Articles, six Blogs, two historical News stories and eight state collections are written. Local frontend and CMS payloads are prepared; no remote publication or CMS data import has occurred.';
  plan.gap_analysis = [
    { feature: 'Content quality and indexing gates', current: deferred.length + ' Cut-off, Scholarship and News tabs use noindex/follow and are excluded from sitemaps because their separate search intent lacks source evidence.', next: 'Resolve the dated official facts, regenerate and review indexing before enabling these tabs. See content-seo-audit.html and content-seo-audit.json.' },
    { feature: 'Institution content', current: '58 overview pages plus 580 separate tab pages for admissions, fees, scholarships, placements, eligibility/cutoffs, infrastructure, campus life, gallery, news and FAQs.', next: 'Maintain dated facts without replacing unknown values with assumptions.' },
    { feature: 'TOC and section navigation', current: 'Deterministic headings and anchors are rendered in the complete reader and local university pages.', next: 'Keep headings and TOC in sync when editing imported content.' },
    { feature: 'Internal links and supporting reading', current: 'All 16 queued articles/blogs and two sourced historical updates are written, linked and served on canonical local routes.', next: 'Keep new related content relevant and validate targets during publication.' },
    { feature: 'CMS content and editorial relations', current: 'University agriculture_content, blog editorial_content, byline/review fields and university/programme relations are implemented. CMS payloads are prepared.', next: 'Execute the prepared import against the intended CMS environment when importing data.' },
    { feature: 'Canonical editorial routes', current: 'Articles, Blogs and News have distinct canonical routes; a wrong route family redirects to the canonical address.', next: 'Preserve the canonical route when migrating existing CMS posts.' },
    { feature: 'Facts and source scope', current: 'Fee periods, source sessions, quotas and exact ICAR terms remain visible. Unsupported numbers remain unquoted.', next: 'Recheck new intake facts and accreditation renewals from official evidence.' },
    { feature: 'Media', current: 'All 58 profiles have stored authentic logos and campus/academic imagery bound to the local frontend. Background and native-resolution notes are preserved.', next: 'Resolve local media paths to uploaded provider URLs during CMS import.' },
  ];
  plan.cms_changes_needed = ['Implemented: structured university/editorial content fields with deterministic TOC and source references.', 'Implemented: university/programme editorial relations and published related-reading display.', 'Implemented: an honest Agrico Editorial byline and review date, separate from publication and official-notice dates.', 'Implemented: canonical editorial routes, local images and sitemap entries.', 'Prepared: slug-matched CMS content and media payloads. No CMS data import or remote deployment was executed.'];
  plan.publication_sequence = ['Completed: all 58 overview pages and 580 separate subject tab pages, with agriculture-specific tables and cross-page links.', 'Completed: 10 Articles, six Blogs, two sourced historical News stories and eight state collections.', 'Completed: local frontend routes, canonical redirects, TOC, contextual links, source references and media binding.', 'Prepared: CMS import payloads with content and media fields; preserve actual dates and resolve IDs during import.', 'After a public launch: verify the real domain, indexing and query performance in Search Console.'];
  for (const topic of topics) if (readyTopics.has(topic.id)) topic.status = 'written_local_route_available';
  for (const brief of briefs) {
    brief.status = 'structured_content_written_local_frontend_implemented';
    for (const item of brief.toc) item.next_step = 'implemented_with_source_scoped_content';
    for (const item of brief.guide_links) item.target_status = readyTopics.has(item.topic_id) ? 'written_local_route_available' : item.target_status;
    brief.news.written_historical_updates = (publication.posts || []).filter(post => post.kind === 'News' && post.related_institution_ids?.includes(brief.id)).map(post => ({ title: post.title, path: post.path, official_notice_date: post.notice_published_on }));
  }
  for (const state of stateHubs) state.status = 'written_local_collection_route';
}
save('blueprint.json', plan);
save('university-page-briefs.json', briefs);
save('editorial-queue.json', topics);
save('state-page-briefs.json', stateHubs);
save('news-source-map.json', briefs.map(row => ({ id: row.id, name: row.name, university_url: row.primary_page, ...row.news })));
const template = fs.readFileSync(path.join(base, 'seo-review-template.html'), 'utf8');
const data = JSON.stringify({ plan, briefs, topics, stateHubs }).replace(/</g, '\\u003c');
fs.writeFileSync(path.join(base, 'seo-review.html'), template.replace('/*SEO_DATA*/', 'const DATA=' + data + ';'));
console.log(JSON.stringify({ university_briefs: briefs.length, shared_article_briefs: topics.filter(row => row.cms_type === 'Articles').length, blog_briefs: topics.filter(row => row.cms_type === 'Blog').length, state_briefs: stateHubs.length, content_written: contentComplete, remote_publication: false, output: path.join(base, 'seo-review.html') }, null, 2));
