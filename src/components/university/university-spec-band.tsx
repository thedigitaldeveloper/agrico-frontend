import { ChevronDown } from 'lucide-react';
import type { UniversityDetail } from '@/lib/cms/repositories/university';

/** Authored university facts remain available on every section route. */
export function UniversitySpecBand({ university, expanded = true }: { university: UniversityDetail; expanded?: boolean }) {
  const facts = [
    { label: 'Study modes', value: university.course_modes.map(item => item.name).join(', ') },
    { label: 'Course types', value: university.course_types.map(item => item.name).join(', ') },
    { label: 'Courses', value: university.courses.map(item => item.name).join(', ') },
    { label: 'Streams', value: university.streams.map(item => item.name).join(', ') },
    { label: 'Entrance exams', value: university.exams.map(item => item.name).join(', ') },
    { label: 'Address', value: university.address || [university.city, university.state, university.country, university.pincode].filter(Boolean).join(', ') },
    { label: 'Affiliations', value: university.affiliations.map(item => item.name).join(', ') },
    { label: 'Rankings', value: university.rankings.map(item => item.name).join(', ') },
    { label: 'Institute tier', value: university.institute_tiers.map(item => item.name).join(', ') },
  ].filter(fact => fact.value);
  const highlights = university.highlights.filter(item => item.key && item.value);
  if (!facts.length && !highlights.length) return null;
  return <details className="rs-ud-facts" open={expanded}>
    <summary><span>University at a glance</span><ChevronDown size={19} aria-hidden="true" /></summary>
    <div className="rs-ud-facts-body">
      {facts.length ? <dl>{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
      {highlights.length ? <ul className="rs-ud-highlights">{highlights.map((item, index) => <li key={item.id || index}><strong>{item.key}</strong><p>{item.value}</p></li>)}</ul> : null}
    </div>
  </details>;
}
