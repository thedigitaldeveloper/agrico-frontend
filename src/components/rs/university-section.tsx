'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { resolveLink } from '@/lib/links';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';
import type { HomeUniversity, Offering } from './home-types';
import './university-section.css';

type UniversityProgramme = Pick<Offering, 'universitySlug' | 'degree' | 'href'>;
type UniversityCard = Omit<HomeUniversity, 'image' | 'imageAlt' | 'degrees'>;

const defaultHeader: SectionHeaderConfig = {
  heading: 'Get to know your next university.',
  description: 'Explore the university and the programmes you can choose.',
  ctaLabel: 'View all universities',
  ctaLink: '/universities',
};

function programmeLinks(university: UniversityCard, catalogue: UniversityProgramme[]) {
  const degrees = new Map<string, { label: string; destinations: Set<string> }>();
  for (const offering of catalogue) {
    if (offering.universitySlug !== university.slug || !offering.degree.trim()) continue;
    const key = offering.degree.trim().toLowerCase();
    const degree = degrees.get(key) ?? { label: offering.degree.trim(), destinations: new Set<string>() };
    degree.destinations.add(offering.href);
    degrees.set(key, degree);
  }
  return [...degrees.values()].map(({ label, destinations }) => ({
    label,
    href: destinations.size === 1 ? [...destinations][0] : '/university/' + encodeURIComponent(university.slug),
  }));
}

/** Lightweight data-led cards preserve the editor's order without campus photos. */
export function RsUniversitySection({ universities, catalogue, header, preview = false }: {
  universities: UniversityCard[];
  catalogue: UniversityProgramme[];
  header?: SectionHeaderConfig | null;
  preview?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const hintId = useId();
  const headingId = useId();
  const universityIds = JSON.stringify(universities.map(university => university.id));
  const [position, setPosition] = useState({ previous: false, next: false, first: 1, last: 1 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      const box = track.getBoundingClientRect();
      const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = Math.max(0, Math.min(track.scrollLeft, maximum));
      const cards = [...track.querySelectorAll<HTMLElement>('[data-rs-university-slide]')];
      const visible = cards.flatMap((card, index) => {
        const rect = card.getBoundingClientRect();
        return rect.right > box.left + 3 && rect.left < box.right - 3 ? [index + 1] : [];
      });
      const next = { previous: left > 2, next: left < maximum - 2, first: visible[0] ?? 1, last: visible.at(-1) ?? cards.length };
      setPosition(current => current.previous === next.previous && current.next === next.next &&
        current.first === next.first && current.last === next.last ? current : next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    track.scrollTo({ left: 0, behavior: 'instant' });
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    track.querySelectorAll('[data-rs-university-slide]').forEach(card => observer.observe(card));
    track.addEventListener('scroll', schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener('scroll', schedule);
    };
  }, [universityIds]);

  function scrollTo(left: number) {
    trackRef.current?.scrollTo({
      left,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  function advance(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.querySelectorAll<HTMLElement>('[data-rs-university-slide]')];
    const origin = slides[0]?.getBoundingClientRect().left ?? 0;
    const starts = slides.map(slide => slide.getBoundingClientRect().left - origin);
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = Math.max(0, Math.min(track.scrollLeft, maximum));
    const destination = direction === 1
      ? starts.find(start => start > left + 2) ?? maximum
      : starts.reverse().find(start => start < left - 2) ?? 0;
    scrollTo(Math.max(0, Math.min(destination, maximum)));
  }

  if (!universities.length) return null;
  const content = header ?? defaultHeader;
  const headerLink = content.ctaLink ? resolveLink(content.ctaLink) : null;

  return <section id="universities" className="rs-section rs-container rs-uni-section" aria-labelledby={content.heading ? headingId : undefined}>
    {content.heading || content.description || content.ctaLabel ? <div className="rs-section-heading rs-uni-heading">
      <div>
        {content.eyebrow ? <span className="rs-eyebrow">{content.eyebrow}</span> : null}
        {content.heading ? <h2 id={headingId}>{content.heading}</h2> : null}
        {content.description ? <p>{content.description}</p> : null}
      </div>
      {content.ctaLabel && headerLink ? <Link className="rs-text-link rs-uni-directory" href={headerLink.href}>
        {content.ctaLabel}<ArrowRight size={17} aria-hidden="true" />
      </Link> : null}
    </div> : null}
    <div className="rs-uni-carousel" role="region" aria-roledescription="carousel" aria-label="Selected universities">
      <p id={hintId} className="sr-only">Swipe to browse universities, or focus this carousel and use the left and right arrow keys.</p>
      <div className="rs-uni-track" ref={trackRef} id={trackId} tabIndex={0} aria-label="University cards" aria-describedby={hintId}
        onKeyDown={event => {
          if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            advance(event.key === 'ArrowLeft' ? -1 : 1);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            scrollTo(event.key === 'Home' ? 0 : event.currentTarget.scrollWidth - event.currentTarget.clientWidth);
          }
        }}>
        {universities.map((university, index) => {
            const universityHref = '/university/' + encodeURIComponent(university.slug);
            const logo = university.cardLogo || university.logo;
            const programmes = programmeLinks(university, catalogue);
            const approvals = [...new Set(university.approvals ?? [])];
            const programmeCount = university.programmeCount ?? catalogue.filter(item => item.universitySlug === university.slug).length;
            return <article className="rs-uni-card" data-rs-university-slide={university.id} key={university.id} aria-roledescription="slide" aria-label={`${index + 1} of ${universities.length}: ${university.name}`}>
              <div className="rs-uni-copy">
                <div className="rs-uni-identity">
                  <span className="rs-uni-logo" data-university={university.slug} data-logo-kind={university.cardLogo ? 'mark' : 'wordmark'}>
                    {logo ? <Image src={logo} fill sizes="40px" alt="" /> : <span className="rs-uni-initial" aria-hidden="true">{university.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>}
                  </span>
                  <h3>{preview ? university.name : <Link href={universityHref}>{university.name}</Link>}</h3>
                </div>
                {university.location ? <p className="rs-uni-location"><MapPin size={13} aria-hidden="true" />{university.location}</p> : null}
                {university.ownership || university.modes?.length ? <p className="rs-uni-context">{[university.ownership, university.modes?.join(' / ')].filter(Boolean).join(' · ')}</p> : null}
                {approvals.length ? <ul className="rs-uni-credentials" aria-label="Approvals and accreditation">{approvals.slice(0, 2).map(approval => <li key={approval}>{approval}</li>)}{approvals.length > 2 ? <li><Link href={universityHref} aria-label={'All approvals for ' + university.name}>+{approvals.length - 2} more</Link></li> : null}</ul> : null}
                <dl className="rs-uni-facts">
                  {programmeCount > 0 ? <div><dt>Programmes</dt><dd>{programmeCount}</dd></div> : null}
                  {university.establishedYear ? <div><dt>Established</dt><dd>{university.establishedYear}</dd></div> : null}
                  {university.rating ? <div><dt>Rating</dt><dd><Star size={12} aria-hidden="true" />{university.rating}/5</dd></div> : null}
                </dl>
                {university.rankings?.[0] ? <p className="rs-uni-ranking">{university.rankings[0]}</p> : null}
                <div className="rs-uni-footer">
                  {programmes.length ? <nav className="rs-uni-chips" aria-label={'Programmes at ' + university.name}>{programmes.slice(0, 4).map(programme => <Link key={programme.label} href={preview ? '#programmes' : programme.href} aria-label={programme.label + ' at ' + university.name}>{programme.label}</Link>)}{programmes.length > 4 ? <Link href={universityHref} aria-label={'All programmes at ' + university.name}>+{programmes.length - 4}</Link> : null}</nav> : null}
                  <Link className="rs-uni-explore" href={preview ? '#programmes' : universityHref}>Explore university<ArrowRight size={16} aria-hidden="true" /></Link>
                </div>
              </div>
            </article>;
          })}
      </div>
      <p className="sr-only" role="status" aria-live="polite">Showing universities {position.first} to {position.last} of {universities.length}.</p>
      <div className="rs-uni-controls" hidden={!position.previous && !position.next}>
        <button type="button" className="rs-uni-previous" aria-label="Previous universities" aria-controls={trackId} disabled={!position.previous} onClick={() => advance(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" className="rs-uni-next" aria-label="Next universities" aria-controls={trackId} disabled={!position.next} onClick={() => advance(1)}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
    </div>
  </section>;
}
