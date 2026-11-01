'use client';

import { useState } from 'react';
import { useEnquiryModal } from './university-enquiry-modal';
import type { Media } from '@/lib/cms/types';
import { mediaUrl } from '@/lib/cms/media';
import { formatFee } from '@/lib/format';

/** Admissions actions and facts supplied by the CMS, with no sample prices. */
export function AdmissionPanel({
  name, universitySlug, universityName, programSlug, courses = [], showApply,
  applyLabel, fees = [], eligibility = [], brochure, syllabus, whatsapp, phone,
}: {
  name: string;
  universitySlug: string;
  universityName: string;
  programSlug?: string;
  courses?: string[];
  showApply: boolean;
  applyLabel?: string | null;
  fees?: Array<{ name: string; fee: number | null; note?: string | null }>;
  eligibility?: string[];
  brochure?: Media | null;
  syllabus?: Media | null;
  whatsapp?: string;
  phone?: string | null;
}) {
  const { openModal } = useEnquiryModal();
  const [selection, setSelection] = useState('');
  const selected = courses.includes(selection) ? selection : (courses[0] ?? '');
  const [tab, setTab] = useState('apply');
  const priced = fees.filter(row => row.fee !== null && Number.isFinite(Number(row.fee)));
  const tabs = [{ key: 'apply', label: 'Enquire' },
    ...(priced.length ? [{ key: 'fees', label: 'Fees' }] : []),
    ...(eligibility.length ? [{ key: 'eligibility', label: 'Eligibility' }] : [])];
  const currentTab = tabs.some(item => item.key === tab) ? tab : 'apply';
  const open = (source: 'application-form' | 'counselling') => openModal({
    universitySlug, universityName, programSlug, programName: selected || (programSlug ? name : undefined),
    source, title: source === 'counselling' ? `Enquire about ${name}` : `Apply for ${selected || name}`,
  });
  const button = 'inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-ink-200 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-800 hover:bg-ink-50';

  return (
    <aside aria-label="Admissions and course information" className="min-w-0 lg:sticky lg:top-36 lg:self-start rounded-2xl border border-ink-200 bg-white p-5 text-ink-900 shadow-card sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-800">Your next step</p>
      <h2 className="mt-2 font-display text-2xl font-medium text-brand-800">Plan your admission</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">Explore the details or ask about your chosen programme.</p>
      <div className="mt-5 flex gap-1 rounded-xl bg-ink-100 p-1">
        {tabs.map(item => <button key={item.key} type="button" aria-pressed={currentTab === item.key} onClick={() => setTab(item.key)} className={`min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${currentTab === item.key ? 'bg-brand-800 text-white' : 'text-ink-700'}`}>{item.label}</button>)}
      </div>
      {currentTab === 'fees' ? <dl className="mt-4 space-y-4">
        {priced.map((row, index) => <div key={`${row.name}-${index}`}><dt className="text-sm">{row.name}</dt><dd className="mt-1 font-semibold text-brand-800">{formatFee(row.fee)}</dd>{row.note ? <dd className="mt-1 text-xs text-ink-700">{row.note}</dd> : null}</div>)}
      </dl> : null}
      {currentTab === 'eligibility' ? <ul className="mt-4 list-disc space-y-2 pl-4 text-sm">{eligibility.map(item => <li key={item}>{item}</li>)}</ul> : null}
      {currentTab === 'apply' ? <div className="mt-4 space-y-3">
        {courses.length ? <label className="block text-sm font-medium">Interested course
          <select value={selected} onChange={event => setSelection(event.target.value)} className="mt-2 min-h-11 min-w-0 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-base text-ink-900 sm:text-sm">
            {courses.map(course => <option key={course}>{course}</option>)}
          </select>
        </label> : null}
        {showApply ? <button type="button" onClick={() => open('application-form')} className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-900`}>{applyLabel || 'Apply'}</button> : null}
        {brochure?.url ? <a className={button} href={mediaUrl(brochure.url)!} target="_blank" rel="noopener noreferrer">Download brochure</a> : null}
        {syllabus?.url ? <a className={button} href={mediaUrl(syllabus.url)!} target="_blank" rel="noopener noreferrer">Download syllabus</a> : null}
        <button type="button" className={button} onClick={() => open('counselling')}>Talk to a counsellor</button>
        {whatsapp ? <a className={button} href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`I would like information about ${selected || name}.`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
        {phone ? <a className={button} href={`tel:${phone}`}>{phone}</a> : null}
      </div> : null}
    </aside>
  );
}
