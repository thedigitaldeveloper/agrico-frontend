import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, ChevronRight, MapPin } from 'lucide-react';
import { DetailAskButton, DetailLeadForm, DetailNavigation, DetailProvider } from './detail-client';
import type { PublicationDocument } from '@/lib/agrico/publication';
import { SITE_URL } from '@/lib/env';
import { isPermittedSourceLink } from '@/lib/agrico/source-links';
import { AgricoPublicationContent, PublicationCards } from './publication-body';
export { PublicationCards } from './publication-body';
import { HtmlSection, type HtmlSectionBlock } from '@/components/cms/html-section';
import './detail.css';
import './publication.css';

export function AgricoPublicationPage({ doc, htmlBlock }: { doc: PublicationDocument; htmlBlock?: HtmlSectionBlock | null }) {
  const isUniversity = doc.kind === 'University' || doc.kind === 'UniversityTab';
  const institutionName = doc.name || doc.title;
  const logo = doc.hero_media?.find(image => image.role === 'card_logo') || doc.hero_media?.find(image => image.role === 'logo');
  const photo = doc.hero_media?.find(image => image.role === 'campus_primary');
  const nav = doc.tabs || doc.toc.map(item => ({ id: item.id, label: item.title, href: '#' + item.id }));
  const parent = isUniversity || doc.kind === 'State' ? { title: 'Universities & colleges', path: '/agriculture-colleges' } : { title: doc.kind === 'Articles' ? 'Agriculture guides' : doc.kind === 'News' ? 'Agriculture news' : 'Student planning', path: doc.kind === 'Articles' ? '/articles' : doc.kind === 'News' ? '/news' : '/blogs' };
  const canonical = SITE_URL + doc.path;
  const extraReading = htmlBlock ? doc.related_posts.filter(post => !htmlBlock.code?.html?.includes(post.path || post.href || '')) : [];
  const entityUrl = SITE_URL + (doc.parent_path || doc.path);
  const breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: 'Agrico', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: parent.title, item: SITE_URL + parent.path }, ...(doc.parent_path ? [{ '@type': 'ListItem', position: 3, name: institutionName, item: entityUrl }, { '@type': 'ListItem', position: 4, name: doc.tab_label, item: canonical }] : [{ '@type': 'ListItem', position: 3, name: doc.title, item: canonical }])];
  const schema = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems },
    { '@context': 'https://schema.org', '@type': doc.kind === 'State' ? 'CollectionPage' : 'WebPage', '@id': canonical + '#webpage', url: canonical, name: doc.title, description: doc.description, inLanguage: 'en-IN', isPartOf: { '@id': SITE_URL + '/#website' }, ...(isUniversity ? { about: { '@id': entityUrl + '#institution' } } : {}), ...(photo ? { primaryImageOfPage: { '@type': 'ImageObject', url: new URL(photo.src, SITE_URL).toString(), width: photo.width, height: photo.height, caption: photo.caption } } : {}) },
    isUniversity ? { '@context': 'https://schema.org', '@type': 'CollegeOrUniversity', '@id': entityUrl + '#institution', name: institutionName, url: entityUrl, sameAs: doc.identity?.website && isPermittedSourceLink(doc.identity.website) ? doc.identity.website : undefined, logo: logo ? new URL(logo.src, SITE_URL).toString() : undefined, address: { '@type': 'PostalAddress', addressLocality: doc.identity?.city, addressRegion: doc.identity?.state, addressCountry: 'IN' } } : doc.kind !== 'State' ? { '@context': 'https://schema.org', '@type': doc.kind === 'News' ? 'NewsArticle' : 'Article', headline: doc.title, description: doc.description, mainEntityOfPage: canonical + '#webpage', ...(photo ? { image: [new URL(photo.src, SITE_URL).toString()] } : {}), ...(doc.published_on ? { datePublished: doc.published_on } : {}), dateModified: doc.reviewed_on, author: { '@type': 'Organization', name: doc.byline, url: SITE_URL + '/editorial-policy' }, publisher: { '@id': SITE_URL + '/#organization' } } : null,
  ].filter(Boolean);
  return <DetailProvider context={isUniversity ? { universityName: institutionName } : {}} kind={isUniversity ? 'university' : 'editorial'}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className={'ag-detail-hero ag-publication-hero ' + (isUniversity ? 'ag-detail-hero--university' : '')}><div className="ag-container">
      <nav className="ag-detail-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={12} /><Link href={parent.path}>{parent.title}</Link><ChevronRight size={12} />{doc.parent_path && <><Link href={doc.parent_path}>{institutionName}</Link><ChevronRight size={12} /></>}<span aria-current="page">{doc.tab_label && doc.parent_path ? doc.tab_label : doc.title}</span></nav>
      <div className={photo ? 'ag-detail-university-hero-grid' : 'ag-publication-editorial-intro'}><div>
        <p className="ag-eyebrow">{doc.eyebrow || (doc.kind === 'Articles' ? 'Agriculture study guide' : doc.kind === 'News' ? 'Verified agriculture update' : doc.kind === 'State' ? 'Explore your state options' : 'Plan your education')}</p>
        <div className="ag-detail-university-identity">{logo && <span className={logo.background === 'dark' ? 'ag-publication-logo-dark' : ''}><Image src={logo.src} width={80} height={80} alt={logo.alt} unoptimized={logo.src.endsWith('.svg')} /></span>}<h1>{doc.title}</h1></div>
        {doc.identity && <div className="ag-detail-location"><span><MapPin size={16} />{[doc.identity.city, doc.identity.state].filter(Boolean).join(', ')}</span><span>{doc.identity.ownership}</span></div>}
        <p className="ag-detail-hero__description">{doc.summary}</p><p className="ag-publication-byline"><Link href="/editorial-policy">{doc.byline}</Link> · Reviewed <time dateTime={doc.reviewed_on}>{doc.reviewed_on}</time>{doc.notice_published_on && <> · Official notice: <time dateTime={doc.notice_published_on}>{doc.notice_published_on}</time></>}</p>
        <div className="ag-detail-hero__actions"><DetailAskButton>{isUniversity ? 'Get admission guidance' : 'Discuss your study options'}</DetailAskButton><a className="ag-text-link" href={'#' + doc.toc[0]?.id}>Start reading<ArrowRight size={16} /></a></div>
      </div>{photo && <div className="ag-detail-university-visual"><Image src={photo.src} alt={photo.alt} fill preload sizes="(max-width:760px) 100vw, 38vw" unoptimized={photo.src.endsWith('.svg')} /></div>}</div>
      {!isUniversity && photo && <p className="ag-publication-image-caption">{photo.caption}</p>}
    </div></section>
    <DetailNavigation links={nav} current={doc.tab_slug} label={isUniversity ? 'University pages' : 'Article sections'} />
    <div className="ag-container ag-publication-layout">{htmlBlock ? <div className="ag-publication-body"><HtmlSection block={htmlBlock} />{!!extraReading.length && <section className="ag-publication-section"><h2>More related guides and updates</h2><PublicationCards cards={extraReading} /></section>}</div> : <AgricoPublicationContent doc={doc} />}<aside className="ag-publication-sidebar"><div className="ag-detail-enquiry-card"><p className="ag-eyebrow">Personal guidance</p><h2>Plan your next step.</h2><p>{isUniversity ? doc.title : 'Discuss programmes, eligibility and your university shortlist.'}</p><DetailLeadForm /></div><div className="ag-detail-shortlist-tip"><BookOpen size={28} /><h3>Choose with clear information.</h3><p>Compare the programme, current admission route and full costs before applying.</p><Link className="ag-text-link" href="/agriculture-colleges">Explore institutions<ArrowRight size={15} /></Link></div></aside></div>
    <div className="ag-detail-mobile-bar"><span>{isUniversity ? doc.title : 'Plan your agriculture studies'}</span><DetailAskButton>Get guidance</DetailAskButton></div>
  </DetailProvider>;
}
