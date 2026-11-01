/* Derive applicant-facing explanations from each institution's own sourced facts. */
const { verifiedCutoffs } = require('./agrico-publication-quality.cjs');
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value) : value ? [value.name || value.label || value.title, value.description || value.details || value.text || value.scope].filter(Boolean).join(': ') : '';
const list = values => (values || []).map(text).filter(Boolean);
const uniq = values => [...new Set(values.filter(Boolean))];
const link = (label, href) => '[' + label.replace(/[\[\]]/g, '') + '](' + href + ')';
const currency = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const fee = p => p.fees?.verification === 'verified' && Number.isFinite(p.fees.amount_inr) ? currency(p.fees.amount_inr) + ' / ' + p.fees.period + ' · ' + (p.fees.academic_year || 'source undated; current intake not confirmed') : 'A verified numerical fee is not available';
const section = (id, heading, paragraphs = [], extra = {}) => ({ id, heading, paragraphs: paragraphs.filter(Boolean), ...extra });
const normalize = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ');
function uniqueQuestions(values) {
  const seen = new Set();
  return values.filter(value => value?.question && value?.answer && !seen.has(normalize(value.question)) && seen.add(normalize(value.question)));
}
function facts(p) {
  const base = '/university/' + p.slug;
  const name = p.identity.short_name || p.name;
  const programmes = p.programmes.map(row => row.name).join('; ');
  const services = [...(p.campus.student_services || []), ...p.campus.facilities.filter(row => /hostel|residen|accomm|transport|mess|sport|library|student|canteen|welfare|grievance/i.test(text(row)))].filter((row, index, array) => array.findIndex(other => normalize(other.name) === normalize(row.name)) === index);
  const q = (question, answer, source_ids = []) => ({ question, answer: clean(answer), source_ids: uniq(source_ids).filter(id => p.sources.some(s => s.id === id)) });
  const location = q('Where is ' + name + ' located?', p.identity.address || [p.identity.city, p.identity.state].filter(Boolean).join(', '), p.identity.source_ids);
  const courses = q('Which agriculture or allied programmes are covered at ' + name + '?', 'This profile covers ' + programmes + '. The ' + link('courses and fees table', base + '/course-fee') + ' separates the qualifications and published fee periods.', p.programmes.flatMap(row => row.source_ids || []));
  const accreditation = q('What is the recorded ICAR scope for ' + name + '?', p.recognition.icar_units.map(unit => unit.unit + ': ' + (unit.programmes_as_printed || []).filter(label => !/^[_\s-]*$/.test(label)).map(clean).join('; ') + ', recorded term ' + unit.valid_from + ' to ' + unit.valid_until + '.').join(' ') + ' This entry applies to the named unit and programme.', p.recognition.source_ids);
  const entry = p.programmes.map(row => q('What are the entry requirements for ' + row.name + ' at ' + name + '?', row.eligibility || 'The exact intake-year subject and marks rule still needs confirmation through ' + link('the official admission route', base + '/admission-process') + '.', row.source_ids));
  const durations = p.programmes.filter(row => row.duration).map(row => q('How long is ' + row.name + ' at ' + name + '?', row.duration + (row.mode ? '; study format: ' + row.mode : '') + '. ' + (row.summary || ''), row.source_ids));
  const fees = p.programmes.map(row => q('What fee is documented for ' + row.name + ' at ' + name + '?', fee(row) + '. ' + [row.fees?.note, row.fees?.includes && 'Included charges: ' + row.fees.includes].filter(Boolean).join(' '), row.fees?.source_ids));
  const route = q('How does admission to ' + name + ' work?', [p.admissions.intro, p.admissions.route_scope, ...p.admissions.steps.map(step => step.title + ': ' + step.text)].filter(Boolean).join(' '), p.admissions.source_ids);
  const documents = q('Which application documents does ' + name + ' list?', p.admissions.documents.length ? list(p.admissions.documents).join('; ') + '. Check the applicable notice for originals, formats and category-specific certificates.' : 'A complete institution-issued document list has not been verified. Use ' + link('the official application channel', base + '/admission-process') + ' to obtain the checklist for ' + programmes + '.', p.admissions.source_ids);
  const dates = q('Which dated admission notices are recorded for ' + name + '?', p.admissions.dates.length ? p.admissions.dates.map(row => [row.label, row.date, row.academic_year].filter(Boolean).join(' · ')).join('; ') + '. These are the dates of the named events; an earlier deadline does not establish a current opening.' : 'No dated admission event is verified in this profile. The official channel is ' + (p.identity.admissions_url || p.identity.website) + '; check the notice for the programme and entry year you intend to join.', p.admissions.source_ids);
  const contact = q('How can I contact ' + name + ' about an application?', [p.identity.phone && 'Published phone: ' + p.identity.phone, p.identity.email && 'Published email: ' + p.identity.email, 'Official admissions: ' + (p.identity.admissions_url || p.identity.website)].filter(Boolean).join('. '), p.identity.source_ids);
  const practical = q('What practical learning is described at ' + name + '?', list(p.campus.practical_learning).join(' ') || p.campus.intro, p.campus.source_ids);
  const facilities = q('Which teaching facilities are documented at ' + name + '?', list(p.campus.facilities).join(' ') || p.campus.intro, p.campus.source_ids);
  const people = q('Who is listed in the teaching information for ' + name + '?', p.faculty.people.length ? [p.faculty.intro, p.faculty.people.slice(0, 6).map(row => [row.name, row.role || row.designation, row.qualification].filter(Boolean).join(' · ')).join('; ')].filter(Boolean).join(' ') : 'A current named department roster is not verified in this profile. The ' + link('infrastructure page', base + '/infrastructure') + ' contains the teaching facilities and practical work established by the available sources.', p.faculty.source_ids);
  const student = q('What student facilities are documented for ' + name + '?', services.length ? list(services).join(' ') : p.campus.intro + ' Accommodation availability, meal charges and transport arrangements for your entry year still need direct confirmation.', uniq([...p.campus.source_ids, ...services.flatMap(row => row.source_ids || [])]));
  const scholarship = q('What scholarship information is available for ' + name + '?', p.scholarships.text + ' ' + p.scholarships.schemes.map(row => text(row)).join(' '), p.scholarships.source_ids);
  const career = q('What training and outcome evidence is available for ' + name + '?', p.placements.text + ' ' + list(p.placements.statistics.filter(row => typeof row === 'string')).join(' '), p.placements.source_ids);
  const employers = q('Which employers or training organisations are named for ' + name + '?', p.placements.recruiters.length ? list(p.placements.recruiters).join('; ') + '. Read the stated programme and reporting scope in ' + link('training and placements', base + '/training-and-placements') + '.' : 'The available sources do not establish a programme-specific recruiter list for ' + programmes + '. The documented preparation consists of ' + (list(p.campus.practical_learning).join(' ') || p.campus.intro), uniq([...p.placements.source_ids, ...p.campus.source_ids]));
  const closing = verifiedCutoffs(p);
  const cutoff = q('Is a programme-specific closing rank available for ' + name + '?', closing.length ? closing.map(row => [row.programme, row.academic_year, row.round, row.quota, row.category, Number.isFinite(row.closing_rank) ? 'closing rank ' + row.closing_rank : 'closing score ' + row.closing_score].join(' · ')).join('; ') : 'A named-programme, category and round closing list is not verified here. The published entry requirements are ' + p.programmes.map(row => row.name + ': ' + (row.eligibility || 'intake-year criteria need confirmation')).join('; ') + '. These requirements are not a closing rank.', uniq([...p.admissions.source_ids, ...(p.cutoffs?.source_ids || [])]));
  return { base, name, programmes, services, q, location, courses, accreditation, entry, durations, fees, route, documents, dates, contact, practical, facilities, people, student, scholarship, career, employers, cutoff };
}

function deepenUniversity(p, overview, pages, profiles, posts) {
  const f = facts(p);
  const all = uniqueQuestions([...(p.faqs || []), f.courses, ...f.durations, ...f.entry, ...f.fees, f.route, f.accreditation, f.practical, f.facilities, f.student, f.scholarship, f.career, f.contact, f.dates]);
  const forTab = {
    'admission-process': [f.route, ...f.entry, f.documents, f.dates, f.contact],
    'course-fee': [...f.fees, ...f.durations, f.scholarship, f.contact],
    scholarship: [f.scholarship, ...p.scholarships.schemes.map(scheme => f.q('What does ' + scheme.name + ' mean for applicants to ' + f.name + '?', [scheme.details || scheme.description, scheme.award && 'Award: ' + text(scheme.award), scheme.eligibility && 'Eligibility: ' + text(scheme.eligibility), scheme.renewal && 'Renewal: ' + text(scheme.renewal), scheme.documents && 'Documents: ' + list(Array.isArray(scheme.documents) ? scheme.documents : [scheme.documents]).join('; ')].filter(Boolean).join(' '), scheme.source_ids)), ...f.fees.slice(0, 1), f.contact],
    'training-and-placements': [f.career, f.practical, f.employers, f.facilities],
    'cut-off': [...f.entry, f.cutoff, f.route, f.dates],
    infrastructure: [f.facilities, f.practical, f.people, f.location],
    'campus-life': [f.location, f.student, f.practical, f.contact],
    gallery: [f.q('What is shown in the ' + f.name + ' photo gallery?', overview.hero_media.filter(image => image.role.startsWith('campus')).map(image => image.caption || image.alt).join('; '), []), f.location, f.practical, f.q('Where can I read about facilities beyond the ' + f.name + ' photographs?', 'The ' + link('infrastructure page', f.base + '/infrastructure') + ' explains the documented teaching setting. Read ' + link('campus life', f.base + '/campus-life') + ' for student arrangements; a general campus image does not confirm access to every facility.')],
    'news-and-notifications': [f.dates, f.route, f.contact, f.courses],
    faqs: all,
  };
  overview.faqs = uniqueQuestions([f.location, f.courses, ...f.entry.slice(0, 1), ...f.durations.slice(0, 1), ...f.fees.slice(0, 1), f.route, f.accreditation, f.practical, f.student, f.scholarship, f.career, ...all]).slice(0, 14);
  for (const page of pages) {
    page.faqs = uniqueQuestions(forTab[page.tab_slug] || page.faqs);
    if (page.tab_slug !== 'faqs') page.faqs = uniqueQuestions([...page.faqs, ...all.filter(item => ({ scholarship: /scholar|waiver|concession/i, 'course-fee': /fee|tuition|domicile|cost/i, 'admission-process': /admission|eligib|apply|subject|entrance/i }[page.tab_slug] || /$^/).test(item.question))]).slice(0, 9);
    page.sources = overview.sources;
    const byId = id => page.sections.find(row => row.id === id);
    if (page.tab_slug === 'scholarship' && p.scholarships.schemes.length) {
      const target = byId('listed-scholarship-schemes');
      if (target) target.table = { columns: ['Scheme', 'Published award and eligibility', 'Continuation / documents'], rows: p.scholarships.schemes.map(row => [row.name, [row.details || row.description, row.award && 'Award: ' + text(row.award), row.eligibility && 'Eligibility: ' + text(row.eligibility)].filter(Boolean).join(' '), [row.renewal && text(row.renewal), row.documents && list(Array.isArray(row.documents) ? row.documents : [row.documents]).join('; ')].filter(Boolean).join(' ') || 'Use the conditions in the cited scheme; additional terms are not quoted.']) };
    }
    if (page.tab_slug === 'campus-life') {
      const target = byId('documented-student-setting');
      if (target && f.services.length) { target.subsections = []; target.table = { columns: ['Student facility / service', 'Documented information'], rows: f.services.map(row => [row.name, row.description || row.details || '']) }; target.source_ids = uniq([...p.campus.source_ids, ...f.services.flatMap(row => row.source_ids || [])]); }
      const planning = byId('student-arrangements');
      if (planning) { planning.paragraphs = ['For your own offer, confirm room availability, residential costs and travel arrangements that are not specified above.']; planning.table.rows = planning.table.rows.filter(row => /live|cost|travel/.test(row[0])); }
    }
    if (page.tab_slug === 'news-and-notifications') {
      const target = byId('verified-news');
      if (target && !target.post_cards?.length) target.paragraphs = ['For a new application opening, revised deadline or fee notice, use the official admission channel for ' + p.name + '. Any dated events below retain their original session and event dates.'];
    }
    if (page.tab_slug === 'gallery') { page.summary = 'View campus and academic photographs associated with ' + p.name + ', then connect the pictured setting with the documented programme and facilities.'; page.description = page.summary; const target = byId('campus-photo-gallery'); if (target) target.paragraphs = ['Read the captions to identify the building, activity or event pictured at ' + p.name + '. The facilities and practical-learning details below provide the academic context.']; }
    if (page.tab_slug === 'faqs') { const target = byId('questions-in-context'); if (target) target.paragraphs = ['Find answers about ' + f.programmes + ', entry requirements, fee periods, practical study and student facilities. Follow the subject-page links for detailed tables and application steps.']; }
    page.sections.forEach(s => { s.paragraphs = s.paragraphs.map(value => value.replace(/source-linked images/g, 'campus photographs').replace(/source-linked campus and academic imagery/g, 'campus and academic photographs')); });
    page.toc = page.sections.map(s => ({ id: s.id, title: s.heading }));
  }
  const overviewSection = id => overview.sections.find(s => s.id === id);
  const programmeSection = overviewSection('programmes-fees');
  programmeSection.table = { columns: ['Programme', 'Duration', 'Entry requirements', 'Published fee / source session'], rows: p.programmes.map(row => [row.name, row.duration || 'Not verified', row.eligibility || 'Confirm intake-year requirements', fee(row)]) };
  const admissionSection = overviewSection('admission-process');
  admissionSection.subsections = p.admissions.steps.map(row => ({ heading: row.title, paragraphs: [row.text] }));
  if (p.admissions.dates.length) admissionSection.subsections.push({ heading: 'Dated admission notices', paragraphs: [], bullets: p.admissions.dates.map(row => [row.label, row.date, row.academic_year].filter(Boolean).join(' · ')) });
  const scholarshipSection = overviewSection('scholarships');
  if (p.scholarships.schemes.length) scholarshipSection.table = { columns: ['Scheme / policy', 'Published scope and conditions'], rows: p.scholarships.schemes.map(row => [row.name, row.details || row.description || 'See cited policy']) };
  const campusSection = overviewSection('campus-facilities');
  campusSection.subsections = p.campus.facilities.slice(0, 4).map(row => ({ heading: row.name, paragraphs: [row.description], source_ids: row.source_ids }));
  const compare = overviewSection('compare-options');
  const candidates = (p.related || []).map(row => profiles.find(other => other.id === row.id)).filter(Boolean).slice(0, 3);
  compare.paragraphs = ['Compare the exact qualification and entry route. Fee figures below retain their own payment period, source session and charge scope; they are not an all-in price ranking.'];
  compare.table = { columns: ['Institution', 'Programme(s)', 'Entry route', 'Published fee / session'], rows: [p, ...candidates].map(row => [link(row.name, '/university/' + row.slug), row.programmes.map(course => course.name).join('; '), row.programmes.map(course => course.admission_route || course.eligibility || 'Confirm programme-specific route').join('; '), row.programmes.map(course => course.name + ': ' + fee(course)).join('; ')]) };
  const specific = posts.filter(post => post.related_institution_ids?.length === 1 && post.related_institution_ids[0] === p.id);
  if (specific.length) {
    const cards = specific.map(post => ({ title: post.title, path: post.path, description: post.description, kind: post.kind }));
    const current = overviewSection('updates-guides');
    current.post_cards = [...cards, ...(current.post_cards || []).filter(card => !cards.some(other => other.path === card.path))].slice(0, 7);
    overview.related_posts = [...cards, ...overview.related_posts.filter(card => !cards.some(other => other.path === card.path))].slice(0, 7);
    for (const page of pages) {
      page.related_posts = cards;
      const beforeFaq = page.sections.findIndex(s => s.id === 'faqs');
      page.sections.splice(beforeFaq, 0, section('institution-guides', 'Guides for applicants to ' + p.name, [], { post_cards: cards }));
      page.toc = page.sections.map(s => ({ id: s.id, title: s.heading }));
    }
  }
  overview.toc = overview.sections.map(s => ({ id: s.id, title: s.heading }));
}

function institutionGuides(profiles) {
  const guides = [];
  for (const p of profiles) {
    const f = facts(p);
    const guideSources = p.sources.filter(source => !source.id.startsWith('media_'));
    const cleanIds = ids => uniq(ids || []).filter(id => guideSources.some(s => s.id === id));
    const priced = p.programmes.filter(row => row.fees?.verification === 'verified' && Number.isFinite(row.fees.amount_inr));
    const focus = priced.length ? 'fee-offer' : p.campus.practical_learning.length ? 'practical-study' : 'application-plan';
    const title = focus === 'fee-offer' ? p.name + ': understand the agriculture fee offer' : focus === 'practical-study' ? p.name + ': connect practical learning with your course choice' : p.name + ': plan an agriculture application';
    const summary = focus === 'fee-offer' ? 'Read the published fee period, applicant category and charge notes for ' + p.name + ', then connect the cost with admission and scholarship conditions.' : 'Use the documented programmes, learning activities and admission route at ' + p.name + ' to prepare a course-specific application and campus discussion.';
    const programmeFacts = section('programme-fit', 'Start with the qualification you would actually join', [p.overview.paragraphs[0], 'The qualification determines the subjects, practical work and entry route you need to compare. This guide focuses on ' + f.programmes + ' at ' + [p.identity.city, p.identity.state].filter(Boolean).join(', ') + '.'], { table: { columns: ['Programme', 'Duration / mode', 'Published entry requirements'], rows: p.programmes.map(row => [row.name, [row.duration, row.mode].filter(Boolean).join(' · '), row.eligibility || 'Intake-year subject and marks requirements need confirmation']) }, source_ids: cleanIds(p.programmes.flatMap(row => row.source_ids || [])) });
    const cost = section('read-the-quote', 'Read a fee quotation with its category and payment period', [priced.length ? 'The following figures come from the institution-specific schedules retained in this research. Read the session and category beside the amount before using it in a budget.' : 'A verified numerical fee is not available for the programmes below. The useful starting point is the institution’s own charge description, followed by an itemised offer for your entry year.'], { table: { columns: ['Programme', 'Published amount / period / session', 'Charge notes'], rows: p.programmes.map(row => [row.name, fee(row), [row.fees?.note, row.fees?.includes].filter(Boolean).join(' ') || 'Obtain an itemised written quotation']) }, source_ids: cleanIds(p.programmes.flatMap(row => row.fees?.source_ids || [])) });
    const practical = section('learning-in-context', 'Connect the learning activities with your own interests', [p.campus.intro, 'Consider which of the documented activities you would like to practise and how they relate to the degree you are applying for. Use this list in a department discussion about the actual timetable and supervision.'], { bullets: list(p.campus.practical_learning), subsections: p.campus.facilities.slice(0, 4).map(row => ({ heading: row.name, paragraphs: [row.description], source_ids: cleanIds(row.source_ids) })), source_ids: cleanIds(p.campus.source_ids) });
    const entry = section('prepare-the-application', 'Prepare for the published admission route', [p.admissions.intro, p.admissions.route_scope], { subsections: p.admissions.steps.map(row => ({ heading: row.title, paragraphs: [row.text] })), bullets: list(p.admissions.documents), source_ids: cleanIds(p.admissions.source_ids) });
    const support = section('support-and-student-arrangements', 'Keep scholarship and residential arrangements separate', [p.scholarships.text, ...list(f.services).slice(0, 4), 'Use the award terms to identify which fee heads a scholarship can cover. Residential costs and the amount initially payable should remain visible in your budget until your own offer confirms them.'], { subsections: p.scholarships.schemes.map(row => ({ heading: row.name, paragraphs: [row.details || row.description].filter(Boolean), source_ids: cleanIds(row.source_ids) })), source_ids: cleanIds([...p.scholarships.source_ids, ...f.services.flatMap(row => row.source_ids || [])]) });
    const recognition = section('recognition-and-outcomes', 'Read programme scope and career evidence together', [p.recognition.text, p.placements.text], { source_ids: cleanIds([...p.recognition.source_ids, ...p.placements.source_ids]) });
    const next = section('next-steps', 'Open the detailed pages for your next decision', ['Continue with ' + link(p.name + ' admission requirements', f.base + '/admission-process') + ', ' + link('fees and charge scope', f.base + '/course-fee') + ', ' + link('scholarship conditions', f.base + '/scholarship') + ' and ' + link('the practical learning setting', f.base + '/infrastructure') + '. These pages separate the source facts so that you can compare the same programme and entry year.', 'The ' + link('institution overview', f.base) + ' also provides the recorded ICAR term and a comparison with other institutions. Keep the exact qualification, campus and category in your shortlist notes.']);
    const cleanFaq = item => ({ ...item, source_ids: cleanIds(item.source_ids) });
    const guideFaqs = uniqueQuestions(focus === 'fee-offer' ? [...f.fees.slice(0, 2), f.scholarship, f.route, f.student] : [f.practical, f.facilities, ...f.entry.slice(0, 1), f.route, f.accreditation]).map(cleanFaq);
    guides.push({ id: 'institution-guide-' + p.id, cms_type: 'Articles', slug: p.slug + '-agriculture-' + focus + '-guide', title, description: summary, summary, byline: 'Agrico Editorial', reviewed_on: '2026-10-31', status: 'written_reviewed', sections: focus === 'fee-offer' ? [programmeFacts, cost, entry, support, practical, recognition, next] : [programmeFacts, practical, entry, cost, support, recognition, next], faqs: guideFaqs, related_institution_ids: [p.id], related_topic_ids: ['fee-budget', 'icar-check', 'campus-compare'], sources: guideSources, verification_notes: ['This institution-specific explainer uses the same reviewed fact ledger as the detail pages. Source sessions and unverified facts retain their scope; it is not an independent new admission notice.'] });
    if (p.slug === 'rnb-global-university') {
      const variants = [
        ['admission-documents', 'RNB Global University agriculture: subjects, application and documents', [programmeFacts, entry, next], [f.route, ...f.entry, f.documents, f.dates]],
        ['scholarship-charge-scope', 'RNB Global University agriculture scholarships: tuition and charge scope', [support, cost, next], [f.scholarship, ...f.fees, f.contact]],
        ['farm-and-enterprise-learning', 'RNB Global University agriculture: farm, rural and enterprise learning', [practical, recognition, entry, next], [f.practical, f.facilities, f.career, f.accreditation]],
      ];
      const parentGuide = guides[guides.length - 1];
      for (const [slug, variantTitle, sections, faqs] of variants) guides.push({ ...parentGuide, id: 'rnb-guide-' + slug, slug: 'rnb-global-university-agriculture-' + slug, title: variantTitle, summary: 'A focused guide to ' + variantTitle.toLowerCase() + ', with programme-specific source context and links to the full detail pages.', description: 'Read the documented agriculture ' + slug.replace(/-/g, ' ') + ' at RNB Global University, with session and programme scope retained.', sections, faqs: uniqueQuestions(faqs).map(cleanFaq) });
    }
  }
  return guides;
}

function stateQuestions(hub, profiles, topic) {
  const degrees = uniq(profiles.flatMap(p => p.programmes.map(row => row.name)));
  return [
    { question: 'Which institutions are covered in this ' + hub.state + ' agriculture collection?', answer: 'The collection contains ' + profiles.length + ' sourced profiles: ' + profiles.map(p => link(p.name, '/university/' + p.slug)).join('; ') + '. It represents the researched private agriculture and allied-study set, rather than every college in the state.' },
    { question: 'Which qualifications can I compare in ' + hub.state + '?', answer: degrees.join('; ') + '. Open the named programme and institution before comparing entry subjects, duration and practical learning.' },
    { question: 'How should I check the admission route for agriculture in ' + hub.state + '?', answer: topic ? 'Start with ' + link(topic.title, topic.path) + ', then use the institution’s admission page for its programme, quota and entry-year rules.' : profiles.map(p => p.name + ': ' + (p.programmes[0].admission_route || p.admissions.intro)).join(' ') },
    { question: 'Where are the sourced fee figures for ' + hub.state + ' institutions?', answer: 'Use the institution-specific fee tables: ' + profiles.map(p => link(p.name, '/university/' + p.slug + '/course-fee')).join('; ') + '. Figures keep their own session, payment period and category; a missing verified amount is left unquoted.' },
    { question: 'Does an ICAR entry cover every degree at a listed ' + hub.state + ' institution?', answer: 'The record must match the academic unit, programme and validity term. Each linked institution overview shows the programme labels and recorded dates from the audited register; a university name alone does not extend that scope.' },
  ];
}
module.exports = { deepenUniversity, institutionGuides, stateQuestions };
