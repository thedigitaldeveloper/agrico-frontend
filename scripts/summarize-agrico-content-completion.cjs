const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const read = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
const baseline = read('content-completion/baseline.json');
const profiles = read('institutions.json').institutions;
const coverage = read('coverage.json');
const count = (items, key) => items.reduce((result, item) => { const value = typeof key === 'function' ? key(item) : item[key]; result[value] = (result[value] || 0) + 1; return result; }, {});
const reports = fs.readdirSync(path.join(base, 'content-completion')).filter(file => /^batch-\d+-report\.json$/.test(file)).map(file => ({ file, report: read('content-completion/' + file) }));
const reviews = reports.flatMap(({ file, report }) => (report.institutions || report.records || []).map(row => ({ ...row, report_file: file })));
const institutions = profiles.map(profile => {
  const before = baseline.institutions.find(row => row.id === profile.id);
  const newSources = profile.sources.filter(source => !before.source_urls.includes(source.url));
  const changedFees = profile.programmes.flatMap(programme => {
    const previous = before.programmes.find(row => row.name === programme.name);
    return JSON.stringify(previous?.fees) === JSON.stringify(programme.fees) ? [] : [{ programme: programme.name, amount_inr: programme.fees.amount_inr, period: programme.fees.period, academic_year: programme.fees.academic_year, scope: programme.fees.includes, note: programme.fees.note, source_ids: programme.fees.source_ids }];
  });
  return { id: profile.id, name: profile.name, path: '/university/' + profile.slug, baseline_flags: before.verification_gaps.length, remaining_flags: profile.verification_gaps.length, baseline_faculty_names: before.faculty_people, current_faculty_names: profile.faculty.people.length, baseline_dated_events: before.dated_events, current_dated_events: profile.admissions.dates.length, changed_fee_records: changedFees, new_source_urls: newSources.map(source => source.url), new_source_count: newSources.length, ledger: reviews.find(row => (row.id || row.institution_id) === profile.id) || null };
});
const report = {
  checked_on: '2026-10-31', baseline_checked_on: '2026-10-30', profiles: profiles.length,
  baseline: { research_flags: baseline.coverage.total_verification_gaps, sourced_fee_amounts: baseline.coverage.verified_fee_rows, eligibility_rows: baseline.coverage.verified_eligibility_rows, profiles_with_named_faculty: baseline.institutions.filter(row => row.faculty_people).length, profiles_with_dated_events: baseline.institutions.filter(row => row.dated_events).length, source_records: baseline.coverage.source_records, unique_source_urls: baseline.coverage.unique_source_urls },
  after: { research_flags: coverage.total_verification_gaps, sourced_fee_amounts: coverage.verified_fee_rows, eligibility_rows: coverage.verified_eligibility_rows, profiles_with_named_faculty: profiles.filter(row => row.faculty.people.length).length, profiles_with_dated_events: profiles.filter(row => row.admissions.dates.length).length, profiles_with_reported_outcomes: profiles.filter(row => row.placements.statistics.length).length, source_records: coverage.source_records, unique_source_urls: coverage.unique_source_urls },
  changed_fee_records: institutions.reduce((sum, row) => sum + row.changed_fee_records.length, 0), new_source_records: institutions.reduce((sum, row) => sum + row.new_source_count, 0), ledger_institutions: new Set(reviews.map(row => row.id || row.institution_id)).size,
  note: 'Facts are added only within the source programme/session/quota scope. An undated published amount is not a current intake quote; an institution-submitted NIRF category table is not a salary promise for a particular degree. Remaining flags include optional scope/freshness questions and public evidence not located, rather than claims a service does not exist.',
  batch_reports: reports.map(({ file }) => 'content-completion/' + file), institutions,
};
report.original_flag_results = reports.reduce((sum, { report }) => { const values = report.original_gap_statuses || report.summary || {}; for (const key of ['resolved', 'partial', 'not_verified']) sum[key] += values[key] || 0; return sum; }, { resolved: 0, partial: 0, not_verified: 0 });
fs.writeFileSync(path.join(base, 'content-completion/completion-summary.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ baseline: report.baseline, after: report.after, changed_fee_records: report.changed_fee_records, ledger_institutions: report.ledger_institutions }, null, 2));
