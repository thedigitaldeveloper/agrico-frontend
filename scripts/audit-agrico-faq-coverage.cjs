const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseDocument } = require('htmlparser2');
const { findAll } = require('domutils');

const base = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const publication = read('publication.json');
const cms = read('cms-html-content-import-plan.json');
const existingAudit = read('content-seo-audit.json');
const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const groups = [
  ['overview', 'University overview', publication.institutions],
  ...['admission-process', 'course-fee', 'scholarship', 'training-and-placements', 'cut-off', 'infrastructure', 'campus-life', 'gallery', 'news-and-notifications', 'faqs'].map(key => [key, ({ 'admission-process': 'Admission', 'course-fee': 'Courses & fees', scholarship: 'Scholarships', 'training-and-placements': 'Training & placements', 'cut-off': 'Cut-off', infrastructure: 'Infrastructure', 'campus-life': 'Campus life', gallery: 'Gallery', 'news-and-notifications': 'University news', faqs: 'Dedicated FAQ tab' })[key], publication.university_tabs.filter(doc => doc.tab_slug === key)]),
  ...['Articles', 'Blog', 'News'].map(key => [key, key, publication.posts.filter(doc => doc.cms_type === key)]),
  ['State', 'State listing', publication.states],
];
const documents = groups.flatMap(([type, label, docs]) => docs.map(doc => ({
  path: doc.path,
  title: doc.title,
  institution: doc.parent_title || doc.name || '',
  type,
  type_label: label,
  faq_count: (doc.faqs || []).length,
  faqs: doc.faqs || [],
})));
const byPath = new Map(documents.map(doc => [doc.path, doc]));
assert.equal(byPath.size, documents.length, 'Duplicate document paths');
function stats(docs) {
  const counts = docs.map(doc => doc.faq_count);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const distribution = {};
  counts.forEach(count => { distribution[count] = (distribution[count] || 0) + 1; });
  return { pages: docs.length, total_faq_occurrences: total, minimum: Math.min(...counts), average: total / docs.length, maximum: Math.max(...counts), distribution };
}
const emptyPairs = [];
const withinPageDuplicates = [];
for (const doc of documents) {
  const seen = new Set();
  for (const faq of doc.faqs) {
    if (!String(faq.question || '').trim() || !String(faq.answer || '').trim()) emptyPairs.push(doc.path);
    const key = normalize(faq.question);
    if (seen.has(key)) withinPageDuplicates.push({ path: doc.path, question: faq.question });
    seen.add(key);
  }
}
const cmsMismatches = [];
for (const record of [...cms.records, ...cms.posts]) {
  const html = record.fields?.content?.[0]?.code?.html || record.fields?.body_html?.code?.html;
  const doc = byPath.get(record.path);
  const actual = html ? findAll(node => node.type === 'tag' && node.name === 'details', parseDocument(html).children).length : null;
  if (!doc || actual !== doc.faq_count) cmsMismatches.push({ path: record.path, json_count: doc?.faq_count, html_count: actual });
}
const repeatedSets = ['gallery', 'news-and-notifications'].map(type => {
  const docs = documents.filter(doc => doc.type === type);
  return { type, pages: docs.length, unique_faq_sets: new Set(docs.map(doc => JSON.stringify(doc.faqs))).size, note: 'All pages use the same two general FAQs; institution-specific coverage needs editorial improvement.' };
});
const reference = {
  url: 'https://www.merishiksha.org/university/rnb-global-university',
  checked_on: '2026-10-31',
  verified_scope: 'Overview page only',
  overview_faq_count: 10,
  question_topics: ['Recognition', 'Courses', 'Fees', 'Admission process', 'Placement support', 'Hostels', 'Scholarships', 'Entrance routes', 'Comparisons', 'Campus life'],
  our_rnb_overview_faq_count: byPath.get('/university/rnb-global-university').faq_count,
  our_rnb_dedicated_faq_count: byPath.get('/university/rnb-global-university/faqs').faq_count,
  comparison: 'Overview FAQ coverage is below the reference in both count and topic breadth. The reference child-tab FAQ counts were not independently verified in this pass. Ten is the observed reference count, not an asserted SEO requirement.',
};
const thinTabs = documents.filter(doc => !['overview', 'Articles', 'Blog', 'News', 'State'].includes(doc.type) && doc.faq_count === 1);
const zeroPages = documents.filter(doc => doc.faq_count === 0);
const template = fs.readFileSync(path.resolve(__dirname, 'agrico-university-tabs.cjs'), 'utf8');
const report = {
  checked_on: '2026-10-31',
  scope: 'FAQ audit of prepared publication content and actual CMS HTML export; no content was added or padded by this audit.',
  counting_note: 'A FAQ occurrence is one question-and-answer pair on a page. Repeated questions on different pages are counted on each page. The overall figure includes eight state listing pages that use application JSON rather than exported CMS HTML.',
  all_documents: stats(documents),
  university_documents: stats(documents.filter(doc => !['Articles', 'Blog', 'News', 'State'].includes(doc.type))),
  cms_html_documents: stats(documents.filter(doc => doc.type !== 'State')),
  by_type: groups.map(([type, label]) => ({ type, label, ...stats(documents.filter(doc => doc.type === type)) })),
  reference,
  verification: { cms_html_bodies_checked: cms.records.length + cms.posts.length, cms_count_mismatches: cmsMismatches, empty_faq_pairs: emptyPairs, duplicate_questions_within_page: withinPageDuplicates },
  gaps: {
    overview_template_caps_faqs_at_three: template.includes('overview.faqs = overview.faqs.slice(0, 3)'),
    single_faq_tab_count: thinTabs.length,
    single_faq_tabs: thinTabs.map(doc => doc.path),
    zero_faq_page_count: zeroPages.length,
    zero_faq_pages: zeroPages.map(doc => doc.path),
    repeated_faq_sets: repeatedSets,
    existing_unresolved_factual_flags: existingAudit.factual_gaps,
    existing_evidence_deferred_pages: existingAudit.deferred_for_evidence,
    note: 'FAQ depth is an additional editorial issue. Factual flags are missing or incomplete evidence fields, not a count of broken pages. This FAQ audit does not repeat the full technical SEO or runtime audit.',
  },
  editorial_priorities: [
    'Remove the arbitrary three-question overview cap when expanding coverage, then use verified institution-specific answers about programmes, admissions, costs, practical learning, student facilities and outcomes.',
    'Improve the 59 one-question placement and infrastructure tabs with available programme-specific evidence; do not invent outcomes or facilities to reach a number.',
    'Add useful state-specific questions to the eight state listings where the researched evidence supports an answer.',
    'Replace repeated editorial-process questions on gallery and news pages with questions that help applicants understand the institution and the actual dated material.',
    'Resolve the existing factual evidence flags before treating all content as publication-ready. FAQ length alone does not establish content quality or search performance.',
  ],
  documents,
};
assert.equal(cmsMismatches.length, 0, 'CMS FAQ counts differ from publication JSON');
assert.equal(emptyPairs.length, 0, 'Blank FAQ question or answer');
assert.equal(withinPageDuplicates.length, 0, 'Duplicate FAQ question within a page');
fs.writeFileSync(path.join(base, 'faq-coverage-audit.json'), JSON.stringify(report, null, 2) + '\n');

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const previewLink = doc => 'publication-review.html#read=' + encodeURIComponent(doc.path);
const tableRows = report.by_type.map(row => `<tr><th scope="row">${escape(row.label)}</th><td>${row.pages}</td><td>${row.minimum}</td><td>${row.average.toFixed(2)}</td><td>${row.maximum}</td><td>${escape(Object.entries(row.distribution).map(([count, pages]) => `${count} FAQs: ${pages} pages`).join(' · '))}</td></tr>`).join('');
const pageRows = documents.map(doc => `<tr data-type="${escape(doc.type)}" data-search="${escape([doc.title, doc.path, doc.type_label].join(' ').toLowerCase())}"><td><a href="${escape(previewLink(doc))}">${escape(doc.title)}</a><small>${escape(doc.path)}</small></td><td>${escape(doc.type_label)}</td><td class="count ${doc.faq_count < 2 ? 'low' : ''}">${doc.faq_count}</td><td>${doc.faq_count ? `<details><summary>Read ${doc.faq_count} FAQs</summary><ol>${doc.faqs.map(faq => `<li><strong>${escape(faq.question)}</strong><p>${escape(faq.answer)}</p></li>`).join('')}</ol></details>` : 'No FAQ block'}</td></tr>`).join('');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Agrico FAQ coverage audit — 31 October 2026</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f2f5ee;color:#213a2e;font:16px/1.6 system-ui,sans-serif}main{max-width:1380px;margin:auto;padding:32px 24px 64px}h1{font-size:clamp(28px,4vw,43px);line-height:1.2;margin:8px 0 16px}h2{font-size:23px;margin:0 0 14px}p{margin:8px 0 14px}a{color:#17613f;overflow-wrap:anywhere}section{background:white;border:1px solid #d8e3d4;border-radius:16px;padding:24px;margin:20px 0}.eyebrow{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#526c51}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stat{background:#183f2d;color:#fff;padding:18px;border-radius:12px}.stat strong{display:block;font-size:30px}.stat span{font-size:14px}.notice{border-left:5px solid #c7882c;background:#fff8e9;padding:16px;margin:18px 0}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;text-align:left;font-size:14px}th,td{padding:12px;border-bottom:1px solid #dce4d8;vertical-align:top}thead{background:#eff4e9}th{font-weight:650}small{display:block;color:#5d6d60;font-size:12px;overflow-wrap:anywhere}summary{cursor:pointer;font-weight:600}details ol{padding-left:20px;min-width:220px}details li{margin:8px 0 16px}.count{font-size:20px;font-weight:700}.low{color:#9a4b06}.filters{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0}label{display:flex;flex-direction:column;gap:4px;font-size:14px}input,select{font:inherit;min-height:44px;padding:8px 12px;border:1px solid #a6b8a5;border-radius:8px;max-width:100%}input{width:340px}#pages th:first-child{width:34%}#pages th:last-child{width:40%}[hidden]{display:none!important}@media(max-width:600px){main{padding:20px 12px 40px}section{padding:16px}.stats{grid-template-columns:repeat(2,1fr)}.stat{padding:12px}.stat strong{font-size:26px}.filters{display:block}.filters label{margin-bottom:12px}input,select{width:100%}#pages{min-width:680px}.summary-table{min-width:680px}}
</style></head><body><main><div class="eyebrow">Agrico · prepared content audit · 31 October 2026</div><h1>FAQ coverage needs more depth</h1><p>Counts include all university pages, editorial pages and state listings. This report checks existing content; it has not added FAQs to meet a target.</p>
<div class="stats"><div class="stat"><strong>${documents.length}</strong><span>pages checked</span></div><div class="stat"><strong>${report.all_documents.total_faq_occurrences.toLocaleString('en-IN')}</strong><span>FAQ occurrences</span></div><div class="stat"><strong>${report.all_documents.average.toFixed(2)}</strong><span>average per page</span></div><div class="stat"><strong>${report.all_documents.minimum}</strong><span>minimum per page</span></div></div>
<section><h2>Reference comparison</h2><p>The <a href="${reference.url}">MeriShiksha RNB Global University overview</a> has <strong>10 FAQs</strong>. Our RNB overview has <strong>${reference.our_rnb_overview_faq_count}</strong>; its dedicated FAQ tab has <strong>${reference.our_rnb_dedicated_faq_count}</strong>. All 58 Agrico overviews currently have three FAQs because the overview template truncates the list.</p><p>The reference covers ${escape(reference.question_topics.join(', ').toLowerCase())}. Agrico’s RNB overview FAQs currently cover location, programme duration and domicile-related fee differences. Relevant information may appear elsewhere in the page body, but the overview FAQ block does not match the reference’s breadth.</p><div class="notice">Only the reference overview FAQ count was verified. Child-tab counts could not be independently verified in this pass. Ten is the observed comparison count; this report does not treat it as an SEO requirement or a ranking promise.</div></section>
<section><h2>Minimum and average by page type</h2><div class="scroll"><table class="summary-table"><thead><tr><th>Page type</th><th>Pages</th><th>Minimum</th><th>Average</th><th>Maximum</th><th>Distribution</th></tr></thead><tbody>${tableRows}</tbody></table></div><p><small>Averages count each question-and-answer pair where it appears, including repeated FAQs across pages. University pages alone: ${report.university_documents.pages} pages, minimum ${report.university_documents.minimum}, average ${report.university_documents.average.toFixed(2)}. The 656 CMS HTML bodies average ${report.cms_html_documents.average.toFixed(2)}; the eight state listings use application JSON.</small></p></section>
<section><h2>Remaining gaps</h2><ul><li><strong>${thinTabs.length} child tabs have only one FAQ:</strong> 35 placement tabs and 24 infrastructure tabs.</li><li><strong>${zeroPages.length} state listing pages have no FAQ block.</strong> This is an editorial coverage opportunity, not by itself a rendering failure.</li><li><strong>Gallery:</strong> all 58 pages have the same two general FAQs. <strong>University news:</strong> all 58 tabs also repeat one identical two-question set.</li><li><strong>Overview:</strong> a template cap limits all pages to three questions; the FAQ block omits several applicant topics present in the reference.</li><li>The existing broader content audit still records <strong>${existingAudit.factual_gaps} unresolved factual evidence flags</strong> and <strong>${existingAudit.deferred_for_evidence} pages deferred from indexing</strong>. These are separate from the FAQ count findings. <a href="content-seo-audit.html">Read the existing content and SEO audit</a>.</li></ul><h2>What was checked</h2><p>FAQ counts match between publication JSON and all <strong>${report.verification.cms_html_bodies_checked} exported CMS HTML bodies</strong>. No empty questions or answers and no duplicate question within the same page were found. Cross-page generic repetition remains. This pass does not repeat the complete technical SEO or runtime audit.</p><h2>Editorial priorities</h2><ol>${report.editorial_priorities.map(item => `<li>${escape(item)}</li>`).join('')}</ol></section>
<section><h2>Every page and its questions</h2><div class="filters"><label>Search institution, page or path<input id="search" type="search" placeholder="For example: RNB Global"></label><label>Page type<select id="type"><option value="">All page types</option>${report.by_type.map(row => `<option value="${escape(row.type)}">${escape(row.label)}</option>`).join('')}</select></label><label>FAQ count<select id="coverage"><option value="">Any count</option><option value="zero">Zero</option><option value="one">One</option><option value="under3">Fewer than three</option><option value="atleast5">At least five</option></select></label></div><p id="result-count" role="status">${documents.length} pages shown</p><div class="scroll"><table id="pages"><thead><tr><th>Page</th><th>Type</th><th>FAQs</th><th>Questions and answers</th></tr></thead><tbody>${pageRows}</tbody></table></div></section><p><a href="faq-coverage-audit.json">Download complete JSON audit</a> · <a href="publication-review.html">Open content reader</a></p></main>
<script>const rows=Array.from(document.querySelectorAll('#pages tbody tr'));const search=document.getElementById('search');const type=document.getElementById('type');const coverage=document.getElementById('coverage');function filter(){const query=search.value.toLowerCase().trim();let shown=0;for(const row of rows){const n=Number(row.querySelector('.count').textContent);const countOk=!coverage.value||(coverage.value==='zero'&&n===0)||(coverage.value==='one'&&n===1)||(coverage.value==='under3'&&n<3)||(coverage.value==='atleast5'&&n>=5);const visible=(!query||row.dataset.search.includes(query))&&(!type.value||row.dataset.type===type.value)&&countOk;row.hidden=!visible;if(visible)shown++;}document.getElementById('result-count').textContent=shown+' pages shown';}search.addEventListener('input',filter);type.addEventListener('change',filter);coverage.addEventListener('change',filter);</script></body></html>`;
fs.writeFileSync(path.join(base, 'faq-coverage-audit.html'), html);
console.log(JSON.stringify({ all_documents: report.all_documents, by_type: report.by_type, verification: report.verification, report: path.join(base, 'faq-coverage-audit.html') }, null, 2));
