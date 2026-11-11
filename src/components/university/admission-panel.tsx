'use client';

import { useId, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Building2, ChevronDown, Download, Headphones, IndianRupee, MessageCircle, Phone } from 'lucide-react';
import { useEnquiryModal } from './university-enquiry-modal';
import type { Media } from '@/lib/cms/types';
import { mediaUrl } from '@/lib/cms/media';
import './admission-panel.css';

/** Admission actions stay visible; published facts belong to the page content. */
export function AdmissionPanel({
  name,
  universitySlug,
  universityName,
  programSlug,
  programTitle,
  feeLabel,
  feeSubtext,
  courses = [],
  showApply,
  applyLabel,
  eligibility = [],
  brochure,
  syllabus,
  whatsapp,
  phone,
}: {
  name: string;
  universitySlug: string;
  universityName: string;
  programSlug?: string;
  programTitle?: string;
  feeLabel?: string | null;
  feeSubtext?: string | null;
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
  const id = useId();
  const { openModal } = useEnquiryModal();
  const [selection, setSelection] = useState('');
  const choices = [...new Set(courses.filter(Boolean))];
  const selected = choices.includes(selection) ? selection : choices[0] || '';
  const activeProgramName = selected || programTitle || (programSlug ? name : undefined);
  const whatsappNumber = whatsapp?.replace(/\D/g, '');
  const phoneNumber = phone?.replace(/[^\d+]/g, '');
  const open = (source: 'application-form' | 'counselling') =>
    openModal({
      universitySlug,
      universityName,
      programSlug,
      programName: activeProgramName,
      source,
      title: source === 'counselling' ? 'Talk about your options' : `Apply for ${activeProgramName || name}`,
      subtitle: activeProgramName && universityName ? `${activeProgramName} at ${universityName}` : undefined,
    });
  const message = encodeURIComponent(
    `I would like agriculture admission guidance for ${activeProgramName || name}${activeProgramName && universityName ? ' at ' + universityName : ''}.`
  );
  const documents = [
    { label: 'Brochure', media: brochure },
    { label: 'Syllabus', media: syllabus },
  ].filter(item => item.media?.url);

  return (
    <aside className="sm-admission-card" aria-labelledby={`${id}-title`}>
      <div className="sm-admission-header">
        <div className="sm-admission-eyebrow">
          <span>
            <Headphones size={18} aria-hidden="true" />
          </span>
          Admission guidance
        </div>
        <h2 id={`${id}-title`}>Plan your admission.</h2>
        <p>Talk through course choices, eligibility and your next steps.</p>
      </div>
      <div className="sm-admission-body">
        {universityName ? (
          <div className="sm-admission-university">
            <Building2 size={18} aria-hidden="true" />
            <p>
              <span>Your university</span>
              <strong>{universityName}</strong>
            </p>
          </div>
        ) : null}
        {programTitle && !choices.length ? (
          <div className="sm-admission-university sm-admission-programme">
            <BookOpen size={18} aria-hidden="true" />
            <p>
              <span>Selected programme</span>
              <strong>{programTitle}</strong>
            </p>
          </div>
        ) : null}
        {feeLabel ? (
          <div className="sm-admission-fee-chip">
            <IndianRupee size={16} aria-hidden="true" />
            <div>
              <span>{feeSubtext || 'Verified tuition fee'}</span>
              <strong>{feeLabel}</strong>
            </div>
          </div>
        ) : null}
        {choices.length ? (
          <div className="sm-admission-field">
            <label htmlFor={`${id}-course`}>Interested course</label>
            <div>
              <select id={`${id}-course`} value={selected} onChange={event => setSelection(event.target.value)}>
                {choices.map(course => (
                  <option key={course}>{course}</option>
                ))}
              </select>
              <ChevronDown size={17} aria-hidden="true" />
            </div>
          </div>
        ) : null}
        {showApply ? (
          <button className="sm-admission-primary" type="button" onClick={() => open('application-form')}>
            {applyLabel || 'Apply Now'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : null}
        <div className="sm-admission-support">
          <span>Have a question?</span>
          <button className="sm-admission-contact" type="button" onClick={() => open('counselling')}>
            <span className="sm-admission-contact-icon">
              <Headphones size={19} aria-hidden="true" />
            </span>
            <span>Talk to a counsellor</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          {whatsappNumber ? (
            <a
              className="sm-admission-contact"
              href={`https://wa.me/${whatsappNumber}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sm-admission-contact-icon">
                <MessageCircle size={19} aria-hidden="true" />
              </span>
              <span>
                Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ) : null}
        </div>
        {documents.length || phoneNumber ? (
          <div className="sm-admission-resources">
            {documents.map(item => (
              <a key={item.label} href={mediaUrl(item.media!.url)!} target="_blank" rel="noopener noreferrer">
                <Download size={16} aria-hidden="true" />
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            {phoneNumber ? (
              <a href={`tel:${phoneNumber}`}>
                <Phone size={16} aria-hidden="true" />
                {phone}
              </a>
            ) : null}
          </div>
        ) : null}
        {eligibility.length ? (
          <details className="sm-admission-eligibility">
            <summary>
              Eligibility information
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <ul>
              {eligibility.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </aside>
  );
}
