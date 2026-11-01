import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, ChevronRight, ClipboardList, FileText, GraduationCap, Headphones, MessageSquare, Minus, Plus, Scale, UsersRound } from 'lucide-react';
import type { CtaBanner, SectionHeaderConfig } from '@/lib/cms/repositories/home';
import { resolveLink } from '@/lib/links';
import type { HomePost, RsHomeData } from './home-types';
import { HomeSelection, ProgrammeExplorer, OfferingComparison, CallbackForm } from './home-interactions';
import { RsHero } from './hero';
import { RsOptionalHomeSections } from './home-optional';
import { RsUniversitySection } from './university-section';
import { RsProgrammeSpotlight } from './programme-spotlight';
import { RsContentCarousel } from './content-carousel';
import { CustomSection } from '@/components/cms/custom-section';
import { HtmlSection, isHtmlSection } from '@/components/cms/html-section';
import './home-sections.css';

const ICONS: Record<string, typeof BookOpen> = {
  bookopen: BookOpen, filetext: FileText, clipboardlist: ClipboardList, graduationcap: GraduationCap,
  headphones: Headphones, messagesquare: MessageSquare, users: UsersRound, usersround: UsersRound,
  scale: Scale, building2: Building2,
};
function iconFor(name: string | undefined, fallback: typeof BookOpen) {
  return ICONS[(name ?? '').replace(/[\s_-]/g, '').toLowerCase()] ?? fallback;
}
function SectionLink({ href, children, className = 'rs-text-link' }: { href: string; children: ReactNode; className?: string }) {
  const link = resolveLink(href);
  if (!link) return null;
  return <Link href={link.href} className={className}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}
function Heading({ config, fallback }: { config?: SectionHeaderConfig | null; fallback: SectionHeaderConfig }) {
  const content = config ?? fallback;
  if (!content.heading && !content.description && !content.ctaLabel) return null;
  return (
    <div className="rs-section-heading">
      <div>
        {content.eyebrow ? <span className="rs-eyebrow">{content.eyebrow}</span> : null}
        {content.heading ? <h2>{content.heading}</h2> : null}
        {content.description ? <p>{content.description}</p> : null}
      </div>
      {content.ctaLabel && content.ctaLink ? <SectionLink href={content.ctaLink}>{content.ctaLabel}</SectionLink> : null}
    </div>
  );
}
function Posts({ posts, kind, preview, config }: {
  posts: HomePost[]; kind: 'news' | 'blogs'; preview: boolean; config?: SectionHeaderConfig | null;
}) {
  if (!posts.length) return null;
  const blog = kind === 'blogs';
  const cards = posts.map((post) => {
    const date = post.date ? new Date(post.date) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date) : null;
    return (
      <article key={post.id} className="rs-post">
        {post.image ? <div className="rs-post-image"><Image src={post.image} fill sizes={blog ? '(max-width:640px) 100vw, 33vw' : '(max-width:640px) 100vw, 50vw'} className="rs-cover" alt={post.imageAlt ?? ''} />{!preview ? <Link href={post.href} className="rs-card-image-link" aria-label={(blog ? 'Read blog: ' : 'Read update: ') + post.title} /> : null}</div> : <div className="rs-post-placeholder" aria-hidden="true"><BookOpen size={38} strokeWidth={1.25} /></div>}
        <div className="rs-post-copy">
          {!blog ? <span className="rs-post-category">{post.category || 'News'}</span> : null}
          {dateLabel ? <time className="rs-post-date" dateTime={post.date!}>{dateLabel}</time> : null}
          <h3>{preview ? post.title : <Link href={post.href} className="rs-post-title-link">{post.title}</Link>}</h3>
          {post.summary ? <p>{post.summary}</p> : null}
          {preview ? <details className="rs-preview-reading"><summary className="rs-text-link">{blog ? 'Read blog' : 'Read update'}<ArrowRight size={16} aria-hidden="true" /></summary><p>This is illustrative editorial content in the design preview.</p></details> : <SectionLink href={post.href}>{blog ? 'Read blog' : 'Read update'}</SectionLink>}
        </div>
      </article>
    );
  });
  const pages = Array.from({ length: Math.ceil(cards.length / 3) }, (_, page) => <div className="rs-news-grid" key={page}>{cards.slice(page * 3, page * 3 + 3)}</div>);
  return (
    <section id={kind} className={'rs-section ' + (blog ? 'rs-blogs' : 'rs-news')}>
      <div className="rs-container">
        <Heading config={config} fallback={{
          heading: blog ? 'From the RS blog.' : 'News & updates.',
          description: blog ? 'Practical guidance for a smarter admission journey.' : 'Stay informed with the latest from universities.',
          ctaLabel: blog ? 'View all blogs' : 'All updates', ctaLink: '/' + kind,
        }} />
        <RsContentCarousel label={blog ? 'Blogs' : 'News and updates'} pages={!blog} itemKeys={blog ? posts.map(post => post.id) : pages.map((_, index) => posts[index * 3].id)}>{blog ? cards : pages}</RsContentCarousel>
      </div>
    </section>
  );
}
export function RsHome({ data, preview = false }: { data: RsHomeData; preview?: boolean }) {
  const home = data.home;
  const show = (key: string) => home?.sectionVisibility?.[key] !== false;
  const spotlight = data.spotlight;
  const catalogue = data.catalogue;
  const services = home ? home.serviceLinks : [
    { iconName: 'FileText', title: 'Explore programmes', description: 'Know about fees, eligibility and more.', href: '#programmes' },
    { iconName: 'Scale', title: 'Compare your options', description: 'Explore and compare university programmes.', href: '#programme-comparison' },
    { iconName: 'UsersRound', title: 'Get admission guidance', description: 'Speak to a counsellor about your next step.', href: '#guidance' },
  ];
  const faqHeader: SectionHeaderConfig = home?.faqsHeader ?? {
    heading: 'A little more clarity.', description: 'Have questions? Find quick answers here or speak to our counsellor.',
    ctaLabel: 'Talk to a counsellor', ctaLink: '#guidance',
  };
  const callback: CtaBanner = home?.bottomBanner ?? {
    heading: 'Let’s find your next step.', description: 'Get guidance on programmes, eligibility and the admission process.',
  };
  const serviceHref = (href: string) => {
    if (href === '#programmes' && (!show('programmes') || !data.offerings.length)) return '/programs';
    if (href === '#programme-comparison' && (!show('compare') || catalogue.length < 2)) return '/compare';
    if (href === '#guidance' && !show('callback')) return '/contact-us';
    return href;
  };
  return (
    <div className="rs-home">
      <HomeSelection preview={preview} availableIds={catalogue.map((offering) => offering.id)} initialCompared={data.comparisonOfferings.map((offering) => offering.id)}>
        {preview ? <div className="rs-preview-notice">Design preview · Example catalogue and illustrative imagery · Enquiry submission is disabled</div> : null}
        <RsHero slides={data.slides} offerings={data.offerings} catalogue={catalogue} preview={preview} />
        {show('services') && services.length ? (
          <div className="rs-benefits"><div className="rs-container">
            {services.map((service) => {
              const Icon = iconFor(service.iconName, BookOpen);
              const href = resolveLink(serviceHref(service.href));
              if (!href) return null;
              return <Link href={href.href} key={service.title}><Icon size={38} strokeWidth={1.25} aria-hidden="true" /><span><strong>{service.title}</strong><small>{service.description}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>;
            })}
          </div></div>
        ) : null}
        {show('programmes') ? <ProgrammeExplorer compareEnabled={show('compare') && catalogue.length >= 2} offerings={data.offerings} catalogue={catalogue} config={home?.courseFinder} header={home?.programsHeader} /> : null}
        {show('universities') && data.universities.length ? (
          <RsUniversitySection universities={data.universities.map(({ id, name, slug, location, logo, cardLogo, ownership, approvals, rankings, modes, establishedYear, rating, programmeCount }) => ({ id, name, slug, location, logo, cardLogo, ownership, approvals, rankings, modes, establishedYear, rating, programmeCount }))} catalogue={catalogue.map(({ universitySlug, degree, href }) => ({ universitySlug, degree, href }))} header={home?.universitiesHeader} preview={preview} />
        ) : null}
        {show('spotlight') && spotlight ? (
          <RsProgrammeSpotlight spotlight={spotlight} preview={preview} />
        ) : null}
        {home?.contentSections?.length ? <div className="rs-section rs-container rs-custom-sections">
          {home.contentSections.map((block) => isHtmlSection(block)
            ? <HtmlSection key={block.id} block={block} />
            : <CustomSection key={block.id} block={block} />)}
        </div> : null}
        {show('compare') ? <OfferingComparison offerings={catalogue} config={home?.compareHeader} universityDefaults={home?.comparisonUniversities.map((university) => university.slug)} /> : null}
        {show('howItWorks') && data.steps.length ? (
          <section id="admission-steps" className="rs-steps"><div className="rs-container">
            <Heading config={home?.howItWorksConfig} fallback={{ heading: 'From shortlist to your next step.' }} />
            <ol>{data.steps.map((step, index) => {
              const Icon = iconFor(step.iconName, [FileText, UsersRound, MessageSquare][index % 3]);
              return (
                <li key={step.title}>
                  <span className="rs-step-icon"><Icon size={31} strokeWidth={1.5} aria-hidden="true" /></span>
                  <span className="rs-step-number">{step.step ?? String(index + 1).padStart(2, '0')}</span>
                  <div className="rs-step-content"><h3>{step.title}</h3><p>{step.description}</p>{step.highlights?.length ? <p className="rs-steps-extra">{step.highlights.join(' · ')}</p> : null}</div>
                  <ChevronRight className="rs-step-next" size={22} aria-hidden="true" />
                </li>
              );
            })}</ol>
          </div></section>
        ) : null}
        <RsOptionalHomeSections data={data} />
        {show('news') ? <Posts posts={data.news} kind="news" preview={preview} config={home?.newsHeader} /> : null}
        {show('blogs') ? <Posts posts={data.blogs} kind="blogs" preview={preview} config={home?.articlesHeader} /> : null}
        {show('faq') && data.faqs.length ? (
          <section className="rs-section rs-container rs-faq">
            <div className="rs-faq-intro">
              {faqHeader.eyebrow ? <span className="rs-eyebrow">{faqHeader.eyebrow}</span> : null}
              {faqHeader.heading ? <h2>{faqHeader.heading}</h2> : null}
              {faqHeader.description ? <p>{faqHeader.description}</p> : null}
              {faqHeader.ctaLabel && faqHeader.ctaLink ? <SectionLink href={serviceHref(faqHeader.ctaLink)} className="rs-button rs-button-outline">{faqHeader.ctaLabel}</SectionLink> : null}
            </div>
            <div className="rs-faq-list">{data.faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0}>
                <summary>{faq.question}<Plus className="rs-faq-plus" size={19} aria-hidden="true" /><Minus className="rs-faq-minus" size={19} aria-hidden="true" /></summary>
                <p>{faq.answer}</p>
              </details>
            ))}</div>
          </section>
        ) : null}
        {show('callback') ? (
          <section id="guidance" className="rs-guidance"><div className="rs-container rs-guidance-grid">
            <div className="rs-guidance-copy">
              {callback.eyebrow ? <span className="rs-eyebrow">{callback.eyebrow}</span> : null}
              {callback.heading ? <h2>{callback.heading}</h2> : null}
              {callback.description ? <p>{callback.description}</p> : null}
            </div>
            <CallbackForm offerings={catalogue} submitLabel={callback.primaryCtaLabel || undefined} />
          </div></section>
        ) : null}
      </HomeSelection>
    </div>
  );
}
