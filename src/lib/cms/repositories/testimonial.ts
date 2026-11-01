import { cmsCollection, cmsFetchOptional } from '../client';
import { collectionTag } from '../tags';
import type { Media, StrapiEntry } from '../types';

/**
 * Student quotes.
 *
 * Read-only, and there is no by-slug route: a quote is never a page of its own,
 * only a card on one. Staff enter these from what a student actually said —
 * nothing here is submitted through the site.
 */

export interface TestimonialCard extends StrapiEntry {
  name: string;
  slug: string;
  quote: string;
  role: string | null;
  rating: number | null;
  photo: Media | null;
  university: { documentId: string; name: string; slug: string } | null;
  position: number | null;
}

export async function listTestimonials(limit = 9): Promise<TestimonialCard[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<TestimonialCard>(
      '/testimonials',
      {
        sort: 'position:asc',
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag('testimonial')] }
    );
    return data;
  }, []);
}
