import { aggregateApprovals, durationLabel } from './program-facts';
import { formatFee } from '@/lib/format';
import type { ProgramDetail } from '@/lib/cms/repositories/program';

export function ProgramSpecBand({ program }: { program: ProgramDetail }) {
  const baseFee = program.fee !== null && program.fee !== undefined && Number.isFinite(Number(program.fee)) && Number(program.fee) >= 0 ? formatFee(program.fee) : null;
  const facts = [
    { label: 'Duration', value: durationLabel(program) || null },
    { label: 'Programme level', value: program.course?.level?.name },
    { label: 'Average package', value: program.average_package || null },
    { label: 'Mode', value: program.course_mode?.name ?? null },
    { label: 'Course type', value: program.course_type?.name ?? null },
    { label: 'Course code', value: program.course_code || null },
    { label: 'Programme base fee — confirm university-specific fees', value: baseFee },
  ].filter(fact => fact.value);
  const approvals = aggregateApprovals(program.universities);
  if (!facts.some(fact => fact.value) && !approvals.length && !program.highlights?.length) return null;
  return <section aria-label="Programme at a glance" className="rs-pd-specs">
    <div className="container-page">
      {facts.length ? <dl className="rs-pd-facts">{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
      {approvals.length ? <div className="rs-pd-recognition"><p>Approvals held by the linked universities</p><div>{approvals.map(item => <span key={item.documentId}>{item.name}</span>)}</div></div> : null}
      {program.highlights?.length ? <dl className="rs-pd-highlights">{program.highlights.filter(item => item.key && item.value).map(item => <div key={item.id}><dt>{item.key}</dt><dd>{item.value}</dd></div>)}</dl> : null}
    </div>
  </section>;
}
