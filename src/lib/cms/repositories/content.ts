import type { BlocksContent } from '../blocks';
import type { CustomSectionBlock } from '@/components/cms/custom-section';
import type { HtmlSectionBlock } from '@/components/cms/html-section';

import { cmsCollection, cmsFirst } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { DynamicZoneComponent, Seo, StrapiEntry } from '../types';

/**
 * Dynamic Zone Component Types for University Contents
 */

export interface RichTextBlock extends DynamicZoneComponent {
  __component: 'common.rich-text';
  heading?: string | null;
  body: BlocksContent | null;
}

export interface HighlightItem {
  id: number;
  key: string | null;
  value: string | null;
  icon: string | null;
}

export interface HighlightListBlock extends DynamicZoneComponent {
  __component: 'common.highlight-list';
  name: string | null;
  items: HighlightItem[] | null;
}

export interface StepItem {
  id: number;
  position?: number | null;
  title: string | null;
  description: string | null;
}

export interface StepsSectionBlock extends DynamicZoneComponent {
  __component: 'college.steps-section';
  name: string | null;
  steps: StepItem[] | null;
}

export interface BulletItem {
  id: number;
  text: string | null;
  icon: string | null;
}

export interface BulletListBlock extends DynamicZoneComponent {
  __component: 'common.bullet-list';
  name: string | null;
  items: BulletItem[] | null;
}

export interface NotificationBlock extends DynamicZoneComponent {
  __component: 'common.notification';
  heading: string | null;
  description: BlocksContent | null;
}

export interface FeeStructureBlock extends DynamicZoneComponent {
  __component: 'college.fee-structure';
  name: string | null;
  description: BlocksContent | null;
  show_program_table: boolean;
}

export interface FeaturedCard {
  id: number;
  name: string | null;
  description: string | null;
  link: string | null;
}

export interface FeaturedBlock extends DynamicZoneComponent {
  __component: 'college.featured';
  name: string | null;
  description: BlocksContent | null;
  cards: FeaturedCard[] | null;
}

export interface FaqItem {
  id: number;
  title: string | null;
  description: BlocksContent | null;
}

export interface FaqSectionBlock extends DynamicZoneComponent {
  __component: 'college.faq-section';
  faqs: FaqItem[] | null;
}

export type AnyContentBlock =
  | HtmlSectionBlock
  | CustomSectionBlock
  | RichTextBlock
  | HighlightListBlock
  | StepsSectionBlock
  | BulletListBlock
  | NotificationBlock
  | FeeStructureBlock
  | FeaturedBlock
  | FaqSectionBlock
  | DynamicZoneComponent;

export interface ContentSection extends StrapiEntry {
  name: string | null;
  slug: string;
  secondary_slug: string | null;
  display_name: string | null;
  heading: string | null;
  seo: Seo | null;
  content: AnyContentBlock[];
}

type Owner = 'university' | 'program' | 'examination' | 'scheme';

const CONTENT_POPULATE = {
  seo: { populate: '*' },
  content: {
    on: {
      'common.rich-text': { populate: '*' },
      'common.custom-section': { populate: { image: true } },
      'common.html-section': { populate: '*' },
      'college.faq-section': { populate: { faqs: { populate: '*' } } },
      'college.steps-section': { populate: { steps: { populate: '*' } } },
      'common.highlight-list': { populate: { items: { populate: '*' } } },
      'common.bullet-list': { populate: { items: { populate: '*' } } },
      'common.notification': { populate: '*' },
      'college.fee-structure': { populate: '*' },
      'college.featured': { populate: { cards: { populate: '*' } } },
      'college.images': { populate: { images: { populate: '*' } } },
    },
  },
};

export async function listContentSectionRefs(
  owner: Owner,
  ownerSlug: string
): Promise<StrapiEntry[]> {
  const { data } = await cmsCollection<StrapiEntry>(
    '/university-contents',
    {
      filters: {
        [owner]: { slug: { $eqi: ownerSlug } },
      },
      sort: 'position:asc',
      pagination: { pageSize: 20 },
    },
    {
      tags: [collectionTag('university-content'), entryTag(owner, ownerSlug)],
    }
  );
  return data;
}

/**
 * Resolves one section by its owner's slug plus the section slug with full component population.
 */
export async function getContentSection(
  owner: Owner,
  ownerSlug: string,
  sectionSlug: string
): Promise<ContentSection | null> {
  return cmsFirst<ContentSection>(
    '/university-contents',
    {
      filters: {
        [owner]: { slug: { $eqi: ownerSlug } },
        $or: [
          { secondary_slug: { $eqi: sectionSlug } },
          { slug: { $eqi: sectionSlug } },
        ],
      },
      populate: CONTENT_POPULATE,
    },
    {
      tags: [
        collectionTag('university-content'),
        entryTag(owner, ownerSlug),
      ],
    }
  );
}

/** The first section of an entity — what the bare detail route shows (Prioritizes Overview). */
export async function getFirstContentSection(
  owner: Owner,
  ownerSlug: string
): Promise<ContentSection | null> {
  // 1. Attempt to fetch Overview section first
  const overview = await cmsFirst<ContentSection>(
    '/university-contents',
    {
      filters: {
        [owner]: { slug: { $eqi: ownerSlug } },
        $or: [
          { secondary_slug: { $in: ['overview', 'about'] } },
          { slug: { $in: ['overview', 'about'] } },
          { name: { $containsi: 'overview' } },
        ],
      },
      populate: CONTENT_POPULATE,
    },
    { tags: [collectionTag('university-content'), entryTag(owner, ownerSlug)] }
  );

  if (overview) return overview;

  // 2. Fallback to id:asc
  return cmsFirst<ContentSection>(
    '/university-contents',
    {
      filters: { [owner]: { slug: { $eqi: ownerSlug } } },
      sort: 'id:asc',
      populate: CONTENT_POPULATE,
    },
    { tags: [collectionTag('university-content'), entryTag(owner, ownerSlug)] }
  );
}

export function isRichText(block: DynamicZoneComponent): block is RichTextBlock {
  return block.__component === 'common.rich-text';
}

export function isHighlightList(block: DynamicZoneComponent): block is HighlightListBlock {
  return block.__component === 'common.highlight-list';
}

export function isStepsSection(block: DynamicZoneComponent): block is StepsSectionBlock {
  return block.__component === 'college.steps-section';
}

export function isBulletList(block: DynamicZoneComponent): block is BulletListBlock {
  return block.__component === 'common.bullet-list';
}

export function isNotification(block: DynamicZoneComponent): block is NotificationBlock {
  return block.__component === 'common.notification';
}

export function isFeeStructure(block: DynamicZoneComponent): block is FeeStructureBlock {
  return block.__component === 'college.fee-structure';
}

export function isFeatured(block: DynamicZoneComponent): block is FeaturedBlock {
  return block.__component === 'college.featured';
}

export type AnsweredFaq = FaqItem & { title: string; description: BlocksContent };

export function isFaqSection(block: DynamicZoneComponent): block is FaqSectionBlock {
  return block.__component === 'college.faq-section';
}

export function answeredFaqs(block: FaqSectionBlock): AnsweredFaq[] {
  return (block.faqs ?? []).filter(
    (faq): faq is AnsweredFaq =>
      Boolean(faq?.title?.trim()) && Boolean(faq?.description?.length)
  );
}

export function sectionFaqs(section: ContentSection | null): AnsweredFaq[] {
  return (section?.content ?? []).filter(isFaqSection).flatMap(answeredFaqs);
}
