import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, Monitor } from 'lucide-react';
import type { Offering } from './home-types';

/** Compact square institution mark beside a readable university name. */
export function UniversityIdentity({ offering, preview = false, className = '' }: {
  offering: Offering;
  preview?: boolean;
  className?: string;
}) {
  return <div className={`rs-offering-identity ${className}`}>
    <div className="rs-offering-logo" data-university={offering.universitySlug} data-logo-kind={offering.cardLogo ? 'mark' : 'wordmark'}>
      {(offering.cardLogo || offering.logo) ? <Image src={offering.cardLogo || offering.logo!} fill sizes="56px" alt="" /> : (
        <span className="rs-offering-initial" aria-hidden="true">{offering.university.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>
      )}
    </div>
    <p className="rs-offering-university-name">{preview ? offering.university : (
      <Link href={'/university/' + encodeURIComponent(offering.universitySlug)}>{offering.university}</Link>
    )}</p>
  </div>;
}

/** A product is a published university/programme pair; the institution is its first identity. */
export function OfferingCard({ offering, preview = false, action, comparison }: {
  offering: Offering;
  preview?: boolean;
  action?: ReactNode;
  comparison?: { selected: boolean; disabled: boolean; onChange: () => void; label?: string };
}) {
  return <article className="rs-programme-card rs-offering-card" data-offering-id={offering.id}>
    <header className="rs-offering-brand"><UniversityIdentity offering={offering} preview={preview} /></header>
    <div className="rs-offering-body">
      <div className="rs-offering-labels">
        <span className="rs-chip rs-offering-mode">{offering.mode}</span>
        {offering.level ? <span className="rs-chip rs-offering-level">{offering.level}</span> : null}
      </div>
      <h3>{preview ? offering.degree : <Link href={offering.href} className="rs-programme-title-link" aria-label={offering.degree + ' at ' + offering.university}>{offering.degree}</Link>}</h3>
      <p className="rs-programme-name">{offering.fullName}</p>
      <dl className="rs-card-facts">
        <div><dt><Clock3 size={18} aria-hidden="true" />Duration</dt><dd>{offering.duration}</dd></div>
        <div><dt><Monitor size={18} aria-hidden="true" />Mode</dt><dd>{offering.mode}</dd></div>
      </dl>
      <div className="rs-offering-actions">
        {offering.syllabus ? <a className="rs-text-link" href={offering.syllabus} target="_blank" rel="noopener noreferrer">View syllabus <ArrowRight size={16} aria-hidden="true" /></a> : null}
        {action || (preview ? <a className="rs-button" href="#guidance">View fees &amp; eligibility <ArrowRight size={16} aria-hidden="true" /></a> : <Link className="rs-button" href={offering.href}>View fees &amp; eligibility <ArrowRight size={16} aria-hidden="true" /></Link>)}
        {comparison ? <label className="rs-compare-check"><input type="checkbox" checked={comparison.selected} disabled={comparison.disabled} onChange={comparison.onChange} />{comparison.label || 'Compare this programme'}</label> : null}
      </div>
    </div>
  </article>;
}
