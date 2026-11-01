/* Original, scoped additions from the official ANGRAU Oct30 source check. */
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../docs/content/universities-2026-10-30');
const file = path.join(base, 'editorial/angrau-private-agriculture-college-admission.json');
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
const notice = 'https://angrau.ac.in/UPLOADS/AdmissionsPDFs/Revised_Manual_coun_chedule_30_10.pdf';
const lastRanks = 'https://angrau.ac.in/UPLOADS/AdmissionsPDFs/LastRanks2025_26.pdf';
const additions = [
  { id: 'revised-manual-counselling-2026', heading: 'Revised manual counselling: the notice checked on 31 October 2026', paragraphs: [
    'ANGRAU’s [revised manual-counselling notice](' + notice + ') addresses candidates already registered for the named 2026 admission routes. Its calendar covers special-category and AGRICET sessions on 2 November, AP EAPCET rank-based sessions during 3–10 November, and a registered-candidate spot session on 11 November. The schedule marks 5 and 8 November as non-counselling days.',
    'Use the original timetable for your precise reporting time and rank band. The venue is Krishna Auditorium, RARS, Lam Farm. An invitation does not establish a seat at a particular affiliated college; the notice requires applicants to check the updated vacancy position. Its affiliated-college fee table retains annual convenor amounts and excludes hostel, transport and mess charges. These are dated channel instructions, not a promise that a future application window remains open.'
  ], source_ids: ['angrau-revised-manual-2026'] },
  { id: 'read-published-last-ranks', heading: 'Why a private-college last-rank table is not your college’s cutoff', paragraphs: [
    'The official [2025–26 last-ranks PDF](' + lastRanks + ') separates constituent colleges from affiliated private colleges. The private-college table is grouped by region, reservation category, farmer/non-farmer status and gender; it does not identify a separate closing rank for each named college.',
    'The footnote limits those figures to participation in the first two online counselling sessions for 2025–26 and warns against treating them as final ranks for 2026–27. Use the table to understand the published scope. Do not relabel a pooled private-college figure as the cutoff for SBVR, N.S., Sri Krishnadevaraya or Sri Kinjarapu, or use it as a prediction of your own admission.'
  ], source_ids: ['angrau-last-ranks-2025-26'] },
];
for (const section of additions) {
  const index = doc.sections.findIndex(item => item.id === section.id);
  if (index >= 0) doc.sections[index] = section; else doc.sections.push(section);
}
for (const source of [
  { id: 'angrau-revised-manual-2026', title: 'ANGRAU revised manual counselling schedule, October 2026', url: notice, checked_on: '2026-10-31', note: 'Official admissions-index link, complete three-page text read; page3 affiliated-college annual convener table and exclusions visually checked. Schedule applies to registered candidates and does not establish college-specific vacancies.' },
  { id: 'angrau-last-ranks-2025-26', title: 'ANGRAU last online counselling ranks, B.Sc. Agriculture 2025–26', url: lastRanks, checked_on: '2026-10-31', note: 'Official table is pooled by constituent/private sector and reservation/region/farmer/gender labels, not by named affiliated college. Footnote limits its meaning to the first two online rounds; no individual-college rank was invented.' },
]) {
  const index = doc.sources.findIndex(item => item.id === source.id);
  if (index >= 0) doc.sources[index] = source; else doc.sources.push(source);
}
doc.reviewed_on = '2026-10-31';
const question = 'Can I use a pooled ANGRAU private-college rank as an individual college cutoff?';
if (!doc.faqs.some(item => item.question === question)) doc.faqs.push({ question, answer: 'No. The cited 2025–26 table groups affiliated private colleges together. It is not a named-college closing list and its footnote does not support predicting 2026–27 admission.' });
fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
console.log('ANGRAU shared guide now includes the revised registered-candidate schedule and correct last-rank scope.');
