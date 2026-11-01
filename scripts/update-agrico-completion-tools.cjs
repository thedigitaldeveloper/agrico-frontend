/* One-time compatible migrations for the expanded Oct31 research pass. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function replace(file, before, after) {
  const target = path.join(root, file); let input = fs.readFileSync(target, 'utf8');
  if (input.includes(after)) return;
  if (!input.includes(before)) throw new Error('Expected migration target missing: ' + file + ' / ' + before.slice(0, 65));
  fs.writeFileSync(target, input.replace(before, after));
}
replace('scripts/audit-agrico-content-seo.cjs', "They are not 433 distinct blank values", "They are not a count of distinct blank values");
replace('scripts/audit-agrico-content-seo.cjs', '<strong>32 / 117</strong>', '<strong>${report.sourced_fee_amounts} / ${report.programme_rows}</strong>');
replace('scripts/audit-agrico-content-seo.cjs', '137 tabs remain readable', '${deferred.length} tabs remain readable');
replace('scripts/audit-agrico-content-seo.cjs', 'The remaining 527 pages', 'The remaining ${report.eligible_for_indexing} pages');
replace('scripts/audit-agrico-content-seo.cjs', '57 institution profiles have no verified placement metrics; 55 have no dated admission event; 44 have no current named faculty roster.', '${report.missing_placement_metric_profiles} institution profiles have no verified placement metrics; ${report.profiles_with_no_dated_admission_events} have no dated admission event; ${report.missing_current_faculty_profiles} have no current named faculty roster.');
replace('scripts/audit-agrico-content-seo.cjs', 'not 433 distinct blank values.', 'not a count of distinct blank values.');
replace('scripts/audit-agrico-content-seo.cjs', '<h2>137 deferred tab pages</h2>', '<h2>${deferred.length} deferred tab pages</h2>');
replace('scripts/audit-agrico-content-seo.cjs', '58 Cut-offs · 32 Scholarships · 47 News & Notices.', "${Object.entries(report.deferred_by_tab).map(([tab, count]) => count + ' ' + tab).join(' · ')}.");
replace('scripts/build-agrico-seo-plan.cjs', '433 research gaps remain and ', "' + profiles.reduce((sum, profile) => sum + profile.verification_gaps.length, 0) + ' research gaps remain and ");
replace('scripts/package-agrico-content-media.py', '137 deferred-indexing tabs and all 433 recorded factual gaps.', "{audit['deferred_for_evidence']} deferred-indexing tabs and {audit['factual_gaps']} recorded research flags.");
replace('scripts/package-agrico-content-media.py', '137 tabs lack enough separate source evidence', "{audit['deferred_for_evidence']} tabs lack enough separate source evidence");
replace('scripts/package-agrico-content-media.py', "'checked_on': '2026-10-30',", "'checked_on': coverage['checked_on'],");
replace('scripts/verify-agrico-publication.cjs', "checks.push('Sitemap segments include eligible canonical URLs and exclude all 137 evidence-deferred tabs');", "checks.push('Sitemap segments include eligible canonical URLs and exclude all ' + publication.university_tabs.filter(doc => doc.indexing?.index === false).length + ' evidence-deferred tabs');");
replace('scripts/verify-agrico-publication.cjs', "{ checked_on: '2026-10-31', base, checks, errors, documents:", "{ checked_on: '2026-10-31', content_sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, 'publication.json'))).digest('hex'), base, checks, errors, documents:");
replace('scripts/verify-agrico-seo-release.cjs', "assert.equal(await page.locator('tbody tr').count(), 137);", "const audit = JSON.parse(fs.readFileSync(path.join(directory, 'content-seo-audit.json'))); assert.equal(await page.locator('tbody tr').count(), audit.deferred_for_evidence);");
replace('scripts/verify-agrico-seo-release.cjs', "checks.push('Audit reader contains all 137 deferred tabs and 58 institution backlogs, with working filtering and 320–1440px layouts');", "checks.push('Audit reader contains all ' + audit.deferred_for_evidence + ' deferred tabs and 58 institution backlogs, with working filtering and 320–1440px layouts');");
replace('scripts/audit-agrico-content-seo.cjs', "const path = require('node:path');", "const path = require('node:path');\nconst crypto = require('node:crypto');");
replace('scripts/audit-agrico-content-seo.cjs', "if (result.checks.some(check => check.includes('indexing policy')))", "if (result.content_sha256 === crypto.createHash('sha256').update(fs.readFileSync(path.join(base, 'publication.json'))).digest('hex') && result.checks.some(check => check.includes('indexing policy')))");
replace('scripts/build-agrico-publication.cjs', "establish: source.identity.established ? String(source.identity.established) : null", "established_year: source.identity.established || null");
replace('src/components/agrico/publication-page.tsx', "sameAs: doc.identity?.website,", "sameAs: doc.identity?.website && isPermittedSourceLink(doc.identity.website) ? doc.identity.website : undefined,");
// All offline review surfaces retain provenance but cannot send users to a
// formerly educational domain that is now unrelated.
const policy = JSON.parse(fs.readFileSync(path.join(root, 'src/config/source-link-policy.json'), 'utf8'));
const quarantine = `<script data-source-link-policy>const disabledSourceHosts=${JSON.stringify(policy.disabled_hosts.map(entry => entry.hostname))};function quarantineHistoricalLinks(){for(const link of document.querySelectorAll('a[href]')){try{const host=new URL(link.getAttribute('href'),location.href).hostname.toLowerCase().replace(/^www\\./,'');if(disabledSourceHosts.some(blocked=>host===blocked||host.endsWith('.'+blocked))){const text=document.createElement('span');text.textContent=link.textContent+' (historical domain; link disabled)';link.replaceWith(text)}}catch{}}}new MutationObserver(quarantineHistoricalLinks).observe(document.body,{childList:true,subtree:true});quarantineHistoricalLinks();</script>`;
for (const name of ['publication-review-template.html', 'review-template.html', 'media-review-template.html']) {
  const file = path.join(root, 'docs/content/universities-2026-10-30', name);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-source-link-policy')) { html = html.replace(/<\/html>\s*$/, quarantine + '</html>'); fs.writeFileSync(file, html); }
}
console.log('Completion tooling now uses live counts, data hashes, correct CMS year fields and quarantined source links.');
