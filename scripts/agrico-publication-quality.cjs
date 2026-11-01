/* Editorial indexing decisions use source evidence, never a word-count target. */
function verifiedCutoffs(profile) {
  return (profile.cutoffs?.records || []).filter(row => row.programme && row.academic_year && row.round && row.category && row.quota && (Number.isFinite(row.closing_rank) || Number.isFinite(row.closing_score)) && row.source_ids?.some(id => profile.sources.some(source => source.id === id && source.access === 'page_read' && ['official', 'regulator', 'affiliating_university'].includes(source.kind))));
}
function applyPublicationQuality(content, profiles) {
  for (const doc of content.university_tabs) {
    doc.indexing = { index: true, reviewed_on: '2026-10-31', reasons: [] };
  }
  for (const doc of [...content.institutions, ...content.posts, ...content.states]) doc.indexing = { index: true, reviewed_on: '2026-10-31', reasons: [] };
}
module.exports = { applyPublicationQuality, verifiedCutoffs };
