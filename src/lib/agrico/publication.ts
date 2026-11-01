import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface PublicationImage {
  role: string; src: string; alt: string; caption?: string; source_page?: string;
  background?: string; width?: number; height?: number;
}
export interface PublicationSource { id: string; title: string; url: string; kind?: string; note?: string; notes?: string; access?: string; checked_on?: string; link_status?: string; }
export interface PublicationCard {
  id?: number; slug?: string; name?: string; title?: string; href?: string; path?: string;
  description: string; kind?: string; media?: PublicationImage[];
}
export interface PublicationSection {
  id: string; heading: string; paragraphs: string[]; bullets?: string[]; source_ids?: string[];
  table?: { columns: string[]; rows: string[][] };
  subsections?: { heading: string; paragraphs: string[]; bullets?: string[]; source_ids?: string[] }[];
  images?: PublicationImage[]; official_link?: { label: string; href: string };
  university_cards?: PublicationCard[]; post_cards?: PublicationCard[];
}
export interface PublicationDocument {
  id: string; institution_id?: number; kind: 'University' | 'UniversityTab' | 'Articles' | 'Blog' | 'News' | 'State';
  slug: string; path: string; title: string; name?: string; meta_title: string; description: string;
  summary: string; byline: string; reviewed_on: string; published_on?: string; event_date?: string;
  notice_published_on?: string;
  indexing?: { index: boolean; reviewed_on: string; reasons: string[] };
  tab_slug?: string; tab_label?: string; parent_path?: string; parent_title?: string;
  tabs?: { id: string; label: string; href: string }[]; tab_pages?: PublicationDocument[];
  eyebrow?: string; identity?: { kind: string; short_name?: string; city: string; state: string; ownership: string; established?: number | string | null; parent_university?: string | null; website: string; admissions_url?: string };
  hero_media?: PublicationImage[]; sections: PublicationSection[]; toc: { id: string; title: string }[];
  faqs: { question: string; answer: string; source_ids?: string[] }[]; sources: PublicationSource[];
  related_universities: PublicationCard[]; related_posts: PublicationCard[];
}
// The complete tab library is a server-side data asset. Reading its JSON avoids
// embedding a very large object literal into every compiled route bundle.
type TabReference = Pick<PublicationDocument, 'institution_id' | 'slug' | 'tab_slug' | 'path' | 'reviewed_on' | 'indexing'>;
const contentDirectory = path.join(process.cwd(), 'docs/content/universities-2026-10-30');
const data = JSON.parse(readFileSync(path.join(contentDirectory, 'publication-runtime.json'), 'utf8')) as { institutions: PublicationDocument[]; university_tabs: TabReference[]; posts: PublicationDocument[]; states: PublicationDocument[] };
export const publicationUniversities = data.institutions;
export const publicationUniversityTabs = data.university_tabs || [];
export const publicationPosts = data.posts;
export const publicationStates = data.states;
export const getPublicationUniversity = (slug: string) => publicationUniversities.find(doc => doc.slug === slug);
const tabCache = new Map<string, PublicationDocument[]>();
export function getPublicationUniversityTab(slug: string, section: string) {
  if (!publicationUniversityTabs.some(doc => doc.slug === slug && doc.tab_slug === section)) return undefined;
  let tabs = tabCache.get(slug);
  if (!tabs) {
    tabs = JSON.parse(readFileSync(path.join(contentDirectory, 'tab-pages', slug + '.json'), 'utf8')) as PublicationDocument[];
    if (tabCache.size >= 6) tabCache.delete(tabCache.keys().next().value!);
    tabCache.set(slug, tabs);
  }
  return tabs.find(doc => doc.tab_slug === section);
}
export const getPublicationPost = (slug: string) => publicationPosts.find(doc => doc.slug === slug);
export const getPublicationState = (slug: string) => publicationStates.find(doc => doc.slug === slug);
export function isPublicationDocument(value: unknown, slug: string): value is PublicationDocument {
  if (!value || typeof value !== 'object') return false;
  const doc = value as Partial<PublicationDocument>;
  const prefixes = { University: '/university/', UniversityTab: '/university/', Articles: '/articles/', Blog: '/blogs/', News: '/news/', State: '/agriculture-colleges/' };
  const prefix = doc.kind && prefixes[doc.kind];
  const allowedTabs = ['admission-process', 'course-fee', 'scholarship', 'training-and-placements', 'cut-off', 'infrastructure', 'campus-life', 'gallery', 'news-and-notifications', 'faqs'];
  const expected = doc.kind === 'UniversityTab' && doc.tab_slug && allowedTabs.includes(doc.tab_slug) ? '/university/' + slug + '/' + doc.tab_slug : prefix + slug;
  return !!prefix && doc.slug === slug && doc.path === expected && typeof doc.title === 'string' && typeof doc.summary === 'string' && typeof doc.byline === 'string' && typeof doc.reviewed_on === 'string' && Array.isArray(doc.sections) && doc.sections.every(section => typeof section.id === 'string' && typeof section.heading === 'string' && Array.isArray(section.paragraphs)) && Array.isArray(doc.toc) && Array.isArray(doc.sources) && Array.isArray(doc.faqs) && Array.isArray(doc.related_universities) && Array.isArray(doc.related_posts);
}

export function withRelatedEditorial(doc: PublicationDocument, posts: { title: string; path: string; description: string; kind: string }[]): PublicationDocument {
  if (!posts.length) return doc;
  const merged = [...doc.related_posts];
  for (const post of posts) if (!merged.some(item => item.path === post.path)) merged.push(post);
  return { ...doc, related_posts: merged, sections: doc.sections.map(section => section.id === 'updates-guides' ? { ...section, post_cards: merged } : section) };
}
