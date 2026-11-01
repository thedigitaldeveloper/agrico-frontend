import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import type { PublicationCard, PublicationDocument, PublicationSection, PublicationSource } from '@/lib/agrico/publication';
import { isPermittedSourceLink } from '../../lib/agrico/source-links';

const safeHref = (href: string) => href.startsWith('/') && !href.startsWith('//') || isPermittedSourceLink(href);
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return <>{parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match || !safeHref(match[2])) return <span key={index}>{part}</span>;
    return match[2].startsWith('/') ? <Link key={index} href={match[2]}>{match[1]}</Link> : <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>;
  })}</>;
}
function References({ ids, sources }: { ids?: string[]; sources: PublicationSource[] }) {
  const known = (ids || []).filter(id => sources.some(source => source.id === id));
  return known.length ? <p className="ag-publication-refs">Sources: {known.map(id => <a href={'#source-' + id} key={id}>[{sources.findIndex(source => source.id === id) + 1}]</a>)}</p> : null;
}
export function PublicationCards({ cards }: { cards: PublicationCard[] }) {
  return <div className="ag-publication-cards">{cards.map(card => {
    const image = card.media?.find(image => image.role === 'card_logo') || card.media?.find(image => image.role === 'logo');
    const href = card.path || card.href || '/agriculture-colleges';
    return <Link href={href} className="ag-publication-card" key={href}>
      {image ? <span className={'ag-publication-card-logo ' + (image.background === 'dark' ? 'is-dark' : '')}><Image src={image.src} alt={image.alt} width={130} height={65} unoptimized={image.src.endsWith('.svg')} /></span> : <span className="ag-publication-card-kind">{card.kind || 'Explore'}</span>}
      <h3>{card.title || card.name}</h3><p>{card.description}</p><span className="ag-text-link">Read more<ArrowRight size={15} /></span>
    </Link>;
  })}</div>;
}
function ContentSection({ section, doc }: { section: PublicationSection; doc: PublicationDocument }) {
  return <section id={section.id} className="ag-publication-section">
    <h2>{section.heading}</h2>
    {section.paragraphs.map((text, index) => <p key={index}><Inline text={text} /></p>)}
    {!!section.bullets?.length && <ul>{section.bullets.map((text, index) => <li key={index}><Inline text={text} /></li>)}</ul>}
    {section.table && <div className="ag-publication-table" tabIndex={0} role="region" aria-label={section.heading + ' table'}><table><thead><tr>{section.table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}><Inline text={String(cell)} /></th> : <td key={cellIndex}><Inline text={String(cell)} /></td>)}</tr>)}</tbody></table></div>}
    {section.subsections?.map((item, index) => <div className="ag-publication-subsection" key={index}><h3>{item.heading}</h3>{item.paragraphs.map((text, index) => <p key={index}><Inline text={text} /></p>)}{!!item.bullets?.length && <ul>{item.bullets.map((text, index) => <li key={index}><Inline text={text} /></li>)}</ul>}<References ids={item.source_ids} sources={doc.sources} /></div>)}
    {!!section.images?.length && <div className="ag-publication-gallery">{section.images.map(image => <figure key={image.src}><a href={image.src} target="_blank" rel="noopener noreferrer"><Image src={image.src} alt={image.alt} width={image.width || 800} height={image.height || 500} sizes="(max-width: 600px) 100vw, 42vw" unoptimized={image.src.endsWith('.svg')} /></a><figcaption>{image.caption}</figcaption></figure>)}</div>}
    {!!section.university_cards?.length && <PublicationCards cards={section.university_cards} />}
    {!!section.post_cards?.length && <PublicationCards cards={section.post_cards} />}
    {section.official_link && safeHref(section.official_link.href) && <a className="ag-text-link" href={section.official_link.href} target="_blank" rel="noopener noreferrer">{section.official_link.label}<ExternalLink size={15} /></a>}
    {section.id === 'faqs' && <div className="ag-detail-faqs">{doc.faqs.map(faq => <details key={faq.question}><summary><span>{faq.question}</span><ChevronDown size={16} /></summary><p><Inline text={faq.answer} /></p><References ids={faq.source_ids} sources={doc.sources} /></details>)}</div>}
    {section.id === 'sources-review' && <><p>Prepared by {doc.byline}. Content reviewed on <time dateTime={doc.reviewed_on}>{new Date(doc.reviewed_on + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</time>. Fee sessions, admission categories and accreditation terms refer to the cited sources.</p><ol className="ag-publication-sources">{doc.sources.map(source => <li key={source.id} id={'source-' + source.id}>{isPermittedSourceLink(source.url) && source.link_status !== 'untrusted_current_domain' ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ExternalLink size={12} /></a> : <span>{source.title} · Historical link disabled; current domain is unrelated.</span>}{(source.note || source.notes) && <p>{source.note || source.notes}</p>}{source.checked_on && <p>Source checked: <time dateTime={source.checked_on}>{source.checked_on}</time>{source.access === 'search_excerpt' ? ' · Search excerpt only; see the recorded evidence limits.' : ''}</p>}</li>)}</ol></>}
    <References ids={section.source_ids} sources={doc.sources} />
  </section>;
}

export function AgricoPublicationContent({ doc }: { doc: PublicationDocument }) {
const isUniversity = doc.kind === "University" || doc.kind === "UniversityTab";
return <article className="ag-publication-body" data-agrico-document={doc.path}><nav className="ag-publication-toc" aria-label="Table of Contents"><p className="ag-eyebrow">On this page</p><h2>Table of Contents</h2><ol>{doc.toc.map(item => <li key={item.id}><a href={'#' + item.id}>{item.title}</a></li>)}</ol></nav>{doc.sections.map(section => <ContentSection key={section.id} section={section} doc={doc} />)}
      {!isUniversity && !!doc.related_universities.length && <section className="ag-publication-section"><h2>Explore relevant institutions</h2><PublicationCards cards={doc.related_universities} /></section>}
      {!isUniversity && !!doc.related_posts.length && <section className="ag-publication-section"><h2>Continue your reading</h2><PublicationCards cards={doc.related_posts} /></section>}
    </article>;
}
