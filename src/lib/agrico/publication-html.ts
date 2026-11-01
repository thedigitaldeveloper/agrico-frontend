import type { PublicationDocument } from './publication';
import type { ContentSection } from '../cms/repositories/content';
import type { ContentSectionRef } from '../cms/repositories/university';
import type { HtmlSectionBlock } from '../../components/cms/html-section';

/** Older imported bodies must follow the same no-image-credit-link policy. */
export function stripPublicationImageCreditLinks(html: string) {
  const unlink = (block: string) => block.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  return html.replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/gi, unlink)
    .replace(/<p\b[^>]*class=["'][^"']*\bag-publication-image-(?:credit|caption)\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, unlink);
}

/** Only the marked body for this exact document can replace its authored body. */
export function publicationHtmlState(doc: PublicationDocument, section: Pick<ContentSection, 'content' | 'seo' | 'heading' | 'display_name'> | null, references: ContentSectionRef[] = []) {
  const block = section?.content.find(item => {
    if (item.__component !== 'common.html-section') return false;
    const html = (item as HtmlSectionBlock).code?.html || '';
    return html.match(/\bdata-agrico-document\s*=\s*["']([^"']+)["']/)?.[1] === doc.path;
  }) as HtmlSectionBlock | undefined;
  if (!block) return { doc, htmlBlock: null };
  const ordered = doc.tabs?.map((tab, index) => {
    const reference = references.find(item => (item.secondary_slug || item.slug) === tab.id);
    return { ...tab, label: reference?.display_name || tab.label, position: reference?.position ?? index };
  }).sort((a, b) => a.position - b.position);
  const noindex = doc.indexing?.index === false || !!section?.seo?.metaRobots?.toLowerCase().includes('noindex');
  return { htmlBlock: { ...block, code: { ...block.code, html: stripPublicationImageCreditLinks(block.code?.html || '') } }, doc: { ...doc, title: section?.heading || doc.title, tab_label: section?.display_name || doc.tab_label, meta_title: section?.seo?.metaTitle || doc.meta_title, description: section?.seo?.metaDescription || doc.description, tabs: ordered || doc.tabs, indexing: { index: !noindex, reviewed_on: doc.indexing?.reviewed_on || doc.reviewed_on, reasons: doc.indexing?.reasons || [] } } };
}
