'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { durationLabel } from '@/components/program/program-facts';
import type { ProgramCard } from '@/lib/cms/repositories/program';
import { formatFee } from '@/lib/format';

export function UniversityFeeTable({ programs, universityName, universitySlug, embedded = false, initialLimit = 12 }: {
  programs: Array<ProgramCard & { feeNote?: string | null }>;
  universityName: string; universitySlug: string; embedded?: boolean; initialLimit?: number;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const searchId = useId();
  const rows = programs.filter(program => [program.name, program.full_name, program.course?.name].some(value => value?.toLowerCase().includes(search.trim().toLowerCase())));
  const visible = expanded || search.trim() ? rows : rows.slice(0, initialLimit);
  if (!programs.length) return null;
  return <section aria-label={'Courses and fees at ' + universityName} className={'rs-ud-fees' + (embedded ? '' : ' container-page')}>
    <div className="rs-ud-fees-heading"><div><p className="rs-ud-eyebrow">Choose your programme</p><h2>Courses &amp; fees</h2></div>
      <label className="rs-ud-course-search" htmlFor={searchId}><Search size={17} aria-hidden="true" /><span className="sr-only">Search courses</span><input id={searchId} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search courses" /></label>
    </div>
    <div className="rs-ud-table-scroll">
      <table><caption className="sr-only">Published programmes and university-specific fees at {universityName}</caption>
        <thead><tr>{['Programme', 'Level', 'Mode', 'Duration', 'Fee'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{visible.map(program => <tr key={program.documentId}>
          <td data-label="Programme"><Link href={'/offering/' + encodeURIComponent(universitySlug) + '/' + encodeURIComponent(program.slug)}>{program.full_name || program.name}<ArrowRight size={15} aria-hidden="true" /></Link></td>
          <td data-label="Level">{program.course?.level?.name || '—'}</td>
          <td data-label="Mode">{program.course_mode?.name || '—'}</td>
          <td data-label="Duration">{durationLabel(program) || '—'}</td>
          <td data-label="Fee"><span>{formatFee(program.fee) ?? 'Request current fees'}</span>{program.feeNote ? <small>{program.feeNote}</small> : null}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {!rows.length ? <p role="status" className="rs-ud-course-empty">No programmes match “{search}”. <button type="button" onClick={() => setSearch('')}>Clear search</button></p> : null}
    {!expanded && !search.trim() && rows.length > initialLimit ? <button className="rs-ud-more-courses" type="button" onClick={() => setExpanded(true)}>Show all programmes<ArrowRight size={16} aria-hidden="true" /></button> : null}
  </section>;
}
