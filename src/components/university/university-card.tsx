import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { resolveThumbnail } from '@/lib/cms/media';
import type { UniversityCard as University } from '@/lib/cms/repositories/university';
import './university-card.css';

/** The directory retains published facts and actions in a lightweight logo-led card. */
export function UniversityCard({ university }: { university: University }) {
  const href = '/university/' + encodeURIComponent(university.slug);
  const logo = resolveThumbnail(university.card_logo || university.logo, 96, university.name);
  const location = [university.city, university.state].filter(Boolean).join(', ');
  const established = university.establish?.slice(0, 4);
  const credentials = [...new Set((university.approvals ?? []).map(item => item.name))];
  const rating = university.rating == null ? null : Number(university.rating);
  return <article className="rs-directory-university" data-university-card={university.slug}>
    <header className="rs-directory-university-identity">
      <div className="rs-directory-university-logo" data-university={university.slug} data-logo-kind={university.card_logo ? 'mark' : 'wordmark'}>
        {logo ? <Image src={logo.src} alt="" width={48} height={48} /> : <span aria-hidden="true">{university.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>}
      </div>
      <h3><Link href={href}>{university.name}</Link></h3>
    </header>
    {location ? <p className="rs-directory-location"><MapPin size={14} aria-hidden="true" />{location}</p> : null}
    {university.ownership_type || university.tag ? <p className="rs-directory-university-context">{[university.ownership_type?.name, university.tag?.name].filter(Boolean).join(' · ')}</p> : null}
    {credentials.length ? <ul className="rs-directory-credentials" aria-label="Approvals and accreditation">{credentials.slice(0, 3).map(name => <li key={name}>{name}</li>)}{credentials.length > 3 ? <li><Link href={href}>+{credentials.length - 3} more</Link></li> : null}</ul> : null}
    <dl className="rs-directory-university-facts">
      {established ? <div><dt>Established</dt><dd>{established}</dd></div> : null}
      {rating && Number.isFinite(rating) && rating <= 5 && rating > 0 ? <div><dt>Rating</dt><dd><Star size={13} aria-hidden="true" />{rating}/5</dd></div> : null}
      {university.rankings?.[0] ? <div className="rs-directory-ranking"><dt>Ranking</dt><dd>{university.rankings[0].name}</dd></div> : null}
    </dl>
    {university.course_modes?.length ? <p className="rs-directory-university-context">{university.course_modes.map(mode => mode.name).join(' / ')}</p> : null}
    <footer className="rs-directory-university-actions">
      <Link href={href} className="rs-directory-university-link">{university.view_button_text || 'Explore university'}<ArrowRight size={16} aria-hidden="true" /></Link>
      {university.show_apply_button ? <Link href={'/common-application-form?university=' + encodeURIComponent(university.slug)} className="rs-directory-apply">{university.apply_button_text || 'Apply now'}</Link> : null}
    </footer>
  </article>;
}