import { htmlSectionScopeId, sanitizeSectionMarkup, scopeSectionCss } from './html-section-code';

import type { DynamicZoneComponent } from '@/lib/cms/types';

import './html-section.css';

export interface HtmlSectionBlock extends DynamicZoneComponent {
  __component: 'common.html-section';
  name?: string | null;
  code?: { html?: string; css?: string } | null;
}

export function isHtmlSection(block: DynamicZoneComponent): block is HtmlSectionBlock {
  return block.__component === 'common.html-section';
}

export function HtmlSection({ block }: { block: HtmlSectionBlock }) {
  const html = typeof block.code?.html === 'string' ? block.code.html : '';
  const css = typeof block.code?.css === 'string' ? block.code.css : '';
  if (!html.trim()) return null;
  const scopeId = htmlSectionScopeId(block.id, html, css);

  return <section className="rs-html-section" data-rs-html-section={scopeId}
    aria-label={block.name?.trim() || 'Custom content section'}>
    <style>{scopeSectionCss(css, scopeId)}</style>
    <div className="rs-html-section__content" dangerouslySetInnerHTML={{ __html: sanitizeSectionMarkup(html) }} />
  </section>;
}
