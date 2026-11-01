import type { BlocksContent } from '../blocks';
import { cmsCollection, cmsFetchOptional, cmsFirst, cmsSingle } from '../client';
import { GLOBAL_TAG, collectionTag, entryTag } from '../tags';
import type { DynamicZoneComponent, Media, Seo, StrapiEntry } from '../types';

/**
 * Standalone content pages.
 *
 * Two content types back the site's non-catalogue pages: `legal` (privacy,
 * terms, disclaimer) and `master` (marketing pages such as careers or placement
 * support). Both resolve from the same `/[slug]` route, so an editor can add a
 * page in the CMS without a deploy.
 */

export interface LegalPage extends StrapiEntry {
  name: string;
  slug: string;
  description: BlocksContent | null;
  seo: Seo | null;
}

export interface MasterPage extends StrapiEntry {
  name: string;
  slug: string;
  description: string | null;
  long_description: BlocksContent | null;
  image: Media | null;
  seo: Seo | null;
}

export type StandalonePage =
  | ({ kind: 'legal' } & LegalPage)
  | ({ kind: 'master' } & MasterPage);

export async function getStandalonePage(slug: string): Promise<StandalonePage | null> {
  return cmsFetchOptional(async () => {
    const legal = await cmsFirst<LegalPage>(
      '/legals',
      { filters: { slug: { $eqi: slug } } },
      { tags: [collectionTag('legal'), entryTag('legal', slug)] }
    );
    if (legal) return { kind: 'legal', ...legal };

    const master = await cmsFirst<MasterPage>(
      '/masters',
      { filters: { slug: { $eqi: slug } } },
      { tags: [collectionTag('master'), entryTag('master', slug)] }
    );
    if (master) return { kind: 'master', ...master };

    return null;
  }, null);
}

export async function getStandaloneSlugs(): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const [legals, masters] = await Promise.all([
      cmsCollection<{ slug: string }>(
        '/legals',
        { fields: ['slug'], pagination: { pageSize: 50 } },
        { tags: [collectionTag('legal')] }
      ),
      cmsCollection<{ slug: string }>(
        '/masters',
        { fields: ['slug'], pagination: { pageSize: 50 } },
        { tags: [collectionTag('master')] }
      ),
    ]);
    return [...legals.data, ...masters.data].map((entry) => entry.slug).filter(Boolean);
  }, []);
}

// --- single types ----------------------------------------------------------

export interface SingleTypePage {
  name: string | null;
  seo: Seo | null;
  content: DynamicZoneComponent[];
}

export async function getAboutPage(): Promise<SingleTypePage | null> {
  return cmsFetchOptional(
    () =>
      cmsSingle<SingleTypePage>('/about-us', undefined, {
        tags: [collectionTag('about-us'), GLOBAL_TAG],
      }),
    null
  );
}

export async function getContactPage(): Promise<SingleTypePage | null> {
  return cmsFetchOptional(
    () =>
      cmsSingle<SingleTypePage>('/contact-us', undefined, {
        tags: [collectionTag('contact-us'), GLOBAL_TAG],
      }),
    null
  );
}
