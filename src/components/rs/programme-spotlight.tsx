import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, Monitor } from 'lucide-react';
import { EnquireLink } from './home-interactions';
import type { SpotlightOffering } from './home-types';
import './programme-spotlight.css';

export function RsProgrammeSpotlight({ spotlight, preview = false }: {
  spotlight: SpotlightOffering;
  preview?: boolean;
}) {
  const title = spotlight.heading ?? [spotlight.mode, spotlight.degree].filter(Boolean).join(' ');
  const programmeName = spotlight.fullName || spotlight.program;
  const mark = spotlight.cardLogo || spotlight.logo;
  const description = spotlight.description;
  const action = <>View programme details <ArrowRight size={17} aria-hidden="true" /></>;

  return (
    <section className="rs-spotlight rs-programme-spotlight" aria-label="Programme spotlight" data-has-image={Boolean(spotlight.image)}>
      <div className="rs-container rs-programme-spotlight__inner">
        <div className="rs-programme-spotlight__copy">
          <div className="rs-programme-spotlight__intro">
            {spotlight.eyebrow ? <p className="rs-programme-spotlight__eyebrow">{spotlight.eyebrow}</p> : null}
            {title ? <h2>{title}</h2> : null}
          </div>

          <div className="rs-programme-spotlight__identity">
            {mark ? (
              <span className="rs-programme-spotlight__mark" data-university={spotlight.universitySlug} data-logo-kind={spotlight.cardLogo ? 'mark' : 'wordmark'}>
                <Image src={mark} fill sizes="40px" alt="" unoptimized={/\.(?:svg|ico)(?:[?#]|$)/i.test(mark)} />
              </span>
            ) : null}
            <div className="rs-programme-spotlight__name">
              <p className="rs-programme-spotlight__university">{spotlight.university}</p>
              {programmeName && programmeName !== title ? <p className="rs-programme-spotlight__programme">{programmeName}</p> : null}
            </div>
          </div>

          {description && description !== programmeName ? <p className="rs-programme-spotlight__description">{description}</p> : null}

          <div className="rs-programme-spotlight__bottom">
            {(spotlight.mode || spotlight.duration) ? (
              <ul className="rs-programme-spotlight__facts" aria-label="Programme facts">
                {spotlight.mode ? <li><Monitor size={17} aria-hidden="true" /><span>{spotlight.mode}</span></li> : null}
                {spotlight.duration ? <li><Clock3 size={17} aria-hidden="true" /><span>{spotlight.duration}</span></li> : null}
              </ul>
            ) : null}
            {preview ? (
              <EnquireLink offering={spotlight} className="rs-programme-spotlight__action">{action}</EnquireLink>
            ) : (
              <Link href={spotlight.href} className="rs-programme-spotlight__action">{action}</Link>
            )}
          </div>
        </div>

        {spotlight.image ? (
          <div className="rs-programme-spotlight__image">
            <Image
              src={spotlight.image}
              fill
              sizes="(max-width:640px) 112px, (max-width:900px) 42vw, 44vw"
              alt={spotlight.imageAlt ?? ''}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
