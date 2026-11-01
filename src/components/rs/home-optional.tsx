import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { resolveThumbnail } from '@/lib/cms/media';
import { resolveLink } from '@/lib/links';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';
import type { RsHomeData } from './home-types';
import { RsContentCarousel } from './content-carousel';

function Header({ config }: { config: SectionHeaderConfig | null }) {
  if (!config) return null;
  const link = resolveLink(config.ctaLink);
  return <div className="rs-section-heading"><div>
    {config.eyebrow ? <span className="rs-eyebrow">{config.eyebrow}</span> : null}
    {config.heading ? <h2>{config.heading}</h2> : null}
    {config.description ? <p>{config.description}</p> : null}
  </div>{config.ctaLabel && link ? <Link href={link.href} className="rs-text-link">{config.ctaLabel}<ArrowRight size={16} aria-hidden="true" /></Link> : null}</div>;
}

/** Inherited CMS sections are opt-in; the approved homepage has none enabled. */
export function RsOptionalHomeSections({ data }: { data: RsHomeData }) {
  const home = data.home;
  if (!home) return null;
  const why = home.whyGeduConfig;
  const primary = resolveLink(why?.primaryCtaLink);
  const secondary = resolveLink(why?.secondaryCtaLink);
  return <>
    {home.sectionVisibility.stats === true && home.stats.length ? <section id="at-a-glance" className="rs-section rs-container rs-home-optional" aria-label="Agrico at a glance"><dl className="rs-optional-grid rs-optional-stats">{home.stats.map(stat => <div className="rs-optional-card" key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}{stat.description ? <p>{stat.description}</p> : null}</dd></div>)}</dl></section> : null}
    {home.sectionVisibility.why === true && (home.whyGeduCards.length || home.comparisonMatrix.length || why) ? <section id="why-rs" className="rs-section rs-container rs-home-optional">
      <Header config={why ?? { heading: 'Guidance for every next step.' }} />
      {why?.microBadges?.length ? <div className="rs-degree-tags">{why.microBadges.map(badge => <span className="rs-chip" key={badge}>{badge}</span>)}</div> : null}
      <div className="rs-optional-grid">{home.whyGeduCards.map(card => <article className="rs-optional-card" key={card.title}>{card.tag ? <span className="rs-chip">{card.tag}</span> : null}<h3>{card.title}</h3><p>{card.description}</p>{card.points.length ? <ul>{card.points.map(point => <li key={point}>{point}</li>)}</ul> : null}</article>)}</div>
      {home.comparisonMatrix.length ? <div className="rs-table-scroll">
        {why?.comparisonHeading ? <h3>{why.comparisonHeading}</h3> : null}
        {why?.comparisonBadge ? <p className="rs-small">{why.comparisonBadge}</p> : null}
        <table className="rs-compare-table"><caption className="sr-only">Agrico service comparison</caption><thead><tr><th scope="col">Feature</th><th scope="col">Agrico</th><th scope="col">Others</th></tr></thead><tbody>{home.comparisonMatrix.map(row => <tr key={row.factor}><th scope="row">{row.factor}</th><td>{row.gedu}</td><td>{row.others}</td></tr>)}</tbody></table>
      </div> : null}
      <div className="rs-programme-more">{why?.primaryCtaLabel && primary ? <Link href={primary.href} className="rs-button">{why.primaryCtaLabel}</Link> : null}{why?.secondaryCtaLabel && secondary ? <Link href={secondary.href} className="rs-button rs-button-outline">{why.secondaryCtaLabel}</Link> : null}</div>
    </section> : null}
    {home.sectionVisibility.mentors === true && data.mentors.length ? <section id="mentors" className="rs-section rs-container rs-home-optional">
      <Header config={home.mentorsHeader ?? { heading: 'People who help you choose.', ctaLabel: 'Meet the mentors', ctaLink: '/mentors' }} />
      <RsContentCarousel label="Mentors" itemKeys={data.mentors.map(mentor => mentor.documentId)}>{data.mentors.map(mentor => {
        const photo = resolveThumbnail(mentor.photo, 96, mentor.display_name);
        return <article className="rs-optional-card" key={mentor.documentId}><div className="rs-optional-person">{photo ? <Image src={photo.src} alt={photo.alt} width={64} height={64} /> : null}<h3>{mentor.display_name}</h3></div>{mentor.headline ? <p>{mentor.headline}</p> : null}{mentor.languages ? <p className="rs-small">{mentor.languages}</p> : null}<Link href={'/mentors/' + mentor.slug} className="rs-text-link">View mentor<ArrowRight size={16} aria-hidden="true" /></Link></article>;
      })}</RsContentCarousel>
    </section> : null}
    {home.sectionVisibility.testimonials === true && data.testimonials.length ? <section id="student-stories" className="rs-section rs-container rs-home-optional">
      <Header config={home.testimonialsHeader ?? { heading: 'In our students’ words.' }} />
      <RsContentCarousel label="Student stories" itemKeys={data.testimonials.map(item => item.documentId)}>{data.testimonials.map(item => {
        const photo = resolveThumbnail(item.photo, 96, item.name);
        return <figure className="rs-optional-card" key={item.documentId}><blockquote>{item.quote}</blockquote><figcaption className="rs-optional-person">{photo ? <Image src={photo.src} alt="" width={48} height={48} /> : null}<div><strong>{item.name}</strong>{item.role ? <p>{item.role}</p> : null}{item.university ? <Link className="rs-text-link" href={'/university/' + item.university.slug}>{item.university.name}</Link> : null}</div></figcaption></figure>;
      })}</RsContentCarousel>
    </section> : null}
  </>;
}
