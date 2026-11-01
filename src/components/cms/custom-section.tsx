import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { RichText } from '@/components/cms/rich-text';
import type { BlocksContent } from '@/lib/cms/blocks';
import { resolveImage } from '@/lib/cms/media';
import type { DynamicZoneComponent, Media } from '@/lib/cms/types';
import { resolveLink } from '@/lib/links';

import './custom-section.css';

export interface CustomSectionBlock extends DynamicZoneComponent {
  __component: 'common.custom-section';
  eyebrow?: string | null;
  heading?: string | null;
  body?: BlocksContent | null;
  image?: Media | null;
  image_alt?: string | null;
  button_label?: string | null;
  button_link?: string | null;
  layout?: 'image_right' | 'image_left' | 'text_only' | null;
  background?: 'ivory' | 'white' | 'ruby_tint' | null;
}

export function isCustomSection(block: DynamicZoneComponent): block is CustomSectionBlock {
  return block.__component === 'common.custom-section';
}

export function CustomSection({ block }: { block: CustomSectionBlock }) {
  if (!block.heading?.trim()) return null;

  const layout = block.layout === 'image_left' || block.layout === 'text_only' ? block.layout : 'image_right';
  const background = block.background === 'white' || block.background === 'ruby_tint' ? block.background : 'ivory';
  const image = layout !== 'text_only' ? resolveImage(block.image, block.image_alt?.trim() || '') : null;
  const link = block.button_label?.trim() ? resolveLink(block.button_link) : null;

  return (
    <section className={`rs-custom-section rs-custom-section--${layout} rs-custom-section--${background}`}>
      <div className="rs-custom-section__copy">
        {block.eyebrow?.trim() ? <span className="rs-custom-section__eyebrow">{block.eyebrow.trim()}</span> : null}
        <h2>{block.heading.trim()}</h2>
        {block.body?.length ? <div className="rs-custom-section__body"><RichText content={block.body} /></div> : null}
        {link ? link.external ? (
          <a className="rs-custom-section__button" href={link.href} rel="noopener noreferrer" target="_blank">
            {block.button_label!.trim()} <ArrowRight size={17} aria-hidden="true" />
          </a>
        ) : (
          <Link className="rs-custom-section__button" href={link.href}>
            {block.button_label!.trim()} <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {image ? <div className="rs-custom-section__media">
        <Image src={image.src} alt={image.alt} width={image.width ?? 900} height={image.height ?? 700}
          sizes="(max-width: 760px) 100vw, 50vw" />
      </div> : null}
    </section>
  );
}
