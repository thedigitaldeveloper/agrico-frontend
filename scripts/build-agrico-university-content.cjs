/* Assemble and validate the editorial research package without touching the CMS. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'docs/content/universities-2026-10-30');
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/research/icar-2026-10-30/count-audit.json'), 'utf8'));
const expected = audit.records.filter(row => row.count_status === 'included');
const requirements = JSON.parse(fs.readFileSync(path.join(directory, 'page-content-requirements.json'), 'utf8'));
const strict = process.argv.includes('--complete');
const batches = ['batch-01', 'batch-02', 'batch-03'];
const institutions = [];
const issues = [];
for (const batch of batches) {
  const folder = path.join(directory, batch);
  if (!fs.existsSync(folder)) continue;
  for (const file of fs.readdirSync(folder).filter(file => file.endsWith('.json'))) {
    const input = JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'));
    const records = Array.isArray(input) ? input : Array.isArray(input.institutions) ? input.institutions : [input];
    for (const row of records) if (row.id && row.identity && row.hero) institutions.push({ ...row, editorial_file: batch + '/' + file });
  }
}
institutions.sort((a, b) => a.id - b.id);
const seenIds = new Set(), seenSlugs = new Set();
const recordCoverage = [];
const requiredKeys = ['identity', 'hero', 'overview', 'programmes', 'admissions', 'campus', 'scholarships', 'placements', 'recognition', 'faculty', 'faqs', 'seo', 'media', 'sources', 'verification_gaps'];
const text = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(text).join(' ') : value && typeof value === 'object' ? Object.values(value).map(text).join(' ') : '';
const wordCount = value => text(value).trim().split(/\s+/).filter(Boolean).length;
const canonical = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const reusedParagraphs = new Map();
for (const row of institutions) {
  const problem = (field, message) => issues.push({ id: row.id, name: row.name, field, message });
  if (seenIds.has(row.id)) problem('id', 'Duplicate institution id');
  if (seenSlugs.has(row.slug)) problem('slug', 'Duplicate institution slug');
  seenIds.add(row.id); seenSlugs.add(row.slug);
  if (!expected[row.id - 1]) problem('id', 'Id is outside the 58 audited institutions');
  const sourceIds = new Set((row.sources || []).map(source => source.id));
  if (sourceIds.size !== row.sources.length) problem('sources', 'Duplicate source identifiers');
  // Recursively check field-level source references, including programme fees.
  function refs(value, prefix = '') {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach((item, index) => refs(item, prefix + '.' + index));
    for (const [key, item] of Object.entries(value)) {
      if (key === 'source_ids') {
        if (!Array.isArray(item)) problem(prefix + '.' + key, 'Source references must be an array');
        else for (const id of item) if (!sourceIds.has(id)) problem(prefix + '.' + key, 'Unknown source ' + id);
      } else refs(item, prefix + '.' + key);
    }
  }
  refs(row);
  for (const key of requiredKeys) if (row[key] === undefined) problem(key, 'Required content type missing');
  if (!row.name || !row.slug || !row.hero?.summary || !row.overview?.paragraphs?.length) problem('overview', 'Identity, hero or original overview is empty');
  if (!Array.isArray(row.programmes) || !row.programmes.length) problem('programmes', 'At least one sourced agriculture/allied programme is required');
  if (!Array.isArray(row.faqs) || row.faqs.length < 5) problem('faqs', 'At least five applicant FAQs are required');
  if (!row.recognition?.icar_units?.length) problem('recognition', 'Audited ICAR unit and validity are missing');
  const expectedRow = expected[row.id - 1];
  row.audit_name = expectedRow?.institution_name || row.name;
  if (expectedRow && !row.recognition?.icar_units?.some(unit => unit.source_url === expectedRow.source_url && unit.source_range?.replace(/^Sheet1!/, '') === expectedRow.source_range)) problem('recognition', 'Profile does not include the ICAR source row for its assigned institution');
  if (expectedRow && row.identity.kind !== (expectedRow.count_type === 'Private college' ? 'private_college' : 'private_university')) problem('identity.kind', 'College/university identity differs from the audited institution');
  for (const source of row.sources || []) {
    try { if (!/^https?:$/.test(new URL(source.url).protocol)) throw Error(); } catch { problem('sources', 'Invalid source URL ' + source.url); }
    if (!['page_read', 'search_excerpt'].includes(source.access)) problem('sources', 'Source access must distinguish page read from search excerpt');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checked_on || '') || source.checked_on < '2026-10-30' || source.checked_on > '2026-10-31') problem('sources', 'Invalid or future source verification date');
  }
  for (const programme of row.programmes || []) {
    const fee = programme.fees;
    if (!fee) { problem('programmes.fees', 'Fee scope/status object is missing'); continue; }
    if (fee.amount_inr !== null && fee.amount_inr !== undefined) {
      if (typeof fee.amount_inr !== 'number' || !Number.isFinite(fee.amount_inr) || fee.amount_inr < 0) problem('programmes.fees', 'Fee must be a non-negative number or null');
      if (fee.verification !== 'verified' || !fee.period || !fee.source_ids?.length) problem('programmes.fees', 'A quoted amount requires verified source and fee period');
    }
  }
  for (const unit of row.recognition?.icar_units || []) {
    const printed = audit.records.find(record => record.source_url === unit.source_url && record.source_range === unit.source_range?.replace(/^Sheet1!/, ''));
    if (!printed) problem('recognition.icar_units', 'ICAR source URL/range does not match the local audit');
    else if (printed.valid_from !== unit.valid_from || printed.valid_until !== unit.valid_until) problem('recognition.icar_units', 'Accreditation validity differs from the audited term');
  }
  const originalCopy = [row.hero?.summary, ...(row.overview?.paragraphs || []), row.admissions?.intro, row.campus?.intro, row.scholarships?.text, row.placements?.text, ...(row.faqs || []).map(faq => faq.answer)].filter(Boolean);
  for (const paragraph of originalCopy) if (wordCount(paragraph) >= 18) {
    const key = canonical(paragraph);
    if (!reusedParagraphs.has(key)) reusedParagraphs.set(key, []);
    reusedParagraphs.get(key).push(row.id);
  }
  row.related = institutions.filter(other => other.id !== row.id).sort((a, b) => Number(b.identity.state === row.identity.state) - Number(a.identity.state === row.identity.state) || a.id - b.id).slice(0, 3).map(other => ({ id: other.id, name: other.name, slug: other.slug, selection: other.identity.state === row.identity.state ? 'Same-state researched option' : 'Other researched agriculture/allied institution' }));
  recordCoverage.push({ id: row.id, name: row.name, slug: row.slug, state: row.identity.state, kind: row.identity.kind, programmes: row.programmes.length, fees_verified: row.programmes.filter(p => p.fees?.verification === 'verified' && typeof p.fees.amount_inr === 'number').length, fees_explicitly_2026: row.programmes.filter(p => p.fees?.verification === 'verified' && typeof p.fees.amount_inr === 'number' && /^2026/.test(p.fees.academic_year || '')).length, eligibility_verified: row.programmes.filter(p => p.eligibility).length, identity_facts: ['established', 'address', 'website', 'admissions_url'].filter(key => row.identity[key]).length, sources: row.sources.length, official_sources: row.sources.filter(s => ['official', 'regulator', 'affiliating_university'].includes(s.kind)).length, pages_read: row.sources.filter(s => s.access === 'page_read').length, gaps: row.verification_gaps.length, original_copy_words: wordCount(originalCopy), content_types: requiredKeys.filter(key => row[key] !== undefined).length, editorial_file: row.editorial_file });
}
const duplicates = [...reusedParagraphs.entries()].filter(([, ids]) => new Set(ids).size > 1).map(([paragraph, ids]) => ({ paragraph, ids: [...new Set(ids)] }));
const missing = expected.map((row, index) => ({ id: index + 1, name: row.institution_name })).filter(row => !seenIds.has(row.id));
if (strict && missing.length) issues.push({ field: 'institutions', message: missing.length + ' institutions are missing' });
const allSources = institutions.flatMap(row => row.sources.map(source => ({ ...source, institution_id: row.id, institution: row.name })));
const latestCheck = allSources.map(source => source.checked_on).sort().at(-1) || '2026-10-30';
const pack = { version: '1.1', checked_on: latestCheck, status: 'editorial_research_draft', note: 'Original copy and sourced facts prepared for review. This is not a CMS publication or proof that every fee/admission detail is verified.', expected_institutions: 58, institutions };
const report = { checked_on: pack.checked_on, expected_institutions: 58, prepared_institutions: institutions.length, private_universities: institutions.filter(row => row.identity.kind === 'private_university').length, private_colleges: institutions.filter(row => row.identity.kind === 'private_college').length, missing, programme_rows: recordCoverage.reduce((sum, row) => sum + row.programmes, 0), verified_fee_rows: recordCoverage.reduce((sum, row) => sum + row.fees_verified, 0), verified_eligibility_rows: recordCoverage.reduce((sum, row) => sum + row.eligibility_verified, 0), source_records: allSources.length, unique_source_urls: new Set(allSources.map(source => source.url)).size, total_verification_gaps: recordCoverage.reduce((sum, row) => sum + row.gaps, 0), original_copy_words: recordCoverage.reduce((sum, row) => sum + row.original_copy_words, 0), duplicate_paragraphs: duplicates, issues, records: recordCoverage };
report.fee_rows_explicitly_2026 = recordCoverage.reduce((sum, row) => sum + row.fees_explicitly_2026, 0);
report.fee_rows_with_other_or_unspecified_source_year = report.verified_fee_rows - report.fee_rows_explicitly_2026;
report.accreditation_terms_ending_within_90_days = institutions.flatMap(row => (row.recognition?.icar_units || []).filter(unit => unit.valid_until <= '2027-01-28').map(unit => ({ id: row.id, name: row.name, unit: unit.unit, valid_until: unit.valid_until, note: 'Renewal must be rechecked before any later admission-year claim.' })));
fs.writeFileSync(path.join(directory, 'institutions.json'), JSON.stringify(pack, null, 2) + '\n');
fs.writeFileSync(path.join(directory, 'coverage.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(directory, 'source-register.json'), JSON.stringify(allSources, null, 2) + '\n');
fs.writeFileSync(path.join(directory, 'verification-gaps.json'), JSON.stringify(institutions.flatMap(row => row.verification_gaps.map(gap => ({ institution_id: row.id, institution: row.name, ...gap }))), null, 2) + '\n');
const escapedData = JSON.stringify({ pack, report, requirements }).replace(/</g, '\\u003c');
const template = fs.readFileSync(path.join(directory, 'review-template.html'), 'utf8');
fs.writeFileSync(path.join(directory, 'review.html'), template.replace('/*CONTENT_DATA*/', 'const DATA=' + escapedData + ';'));
console.log(JSON.stringify({ prepared: institutions.length, missing: missing.length, programme_rows: report.programme_rows, verified_fees: report.verified_fee_rows, source_urls: report.unique_source_urls, gaps: report.total_verification_gaps, duplicate_paragraphs: duplicates.length, issues: issues.length, output: path.join(directory, 'review.html') }, null, 2));
if (issues.length) { console.error(JSON.stringify(issues.slice(0, 25), null, 2)); process.exitCode = 1; }
