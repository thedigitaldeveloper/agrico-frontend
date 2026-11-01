/**
 * Strapi 5 response shapes.
 *
 * v5 flattened the v4 envelope: an entry's fields sit directly on the object
 * instead of under `attributes`, and relations/media are plain nested objects
 * rather than `{ data: { attributes } }`. The old frontend carried 657
 * `.attributes` accesses to work around that; none of them are needed here.
 */

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CollectionResponse<T> {
  data: T[];
  meta: { pagination: Pagination };
}

export interface SingleResponse<T> {
  data: T | null;
  meta: Record<string, unknown>;
}

/** Fields Strapi adds to every entry. */
export interface StrapiEntry {
  id: number;
  /** v5's stable public identifier — prefer this over `id` in URLs and keys. */
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale?: string | null;
}

export interface MediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
}

export interface Media extends StrapiEntry {
  url: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime: string;
  size: number;
  formats: Partial<Record<'thumbnail' | 'small' | 'medium' | 'large', MediaFormat>> | null;
}

/** A node of Strapi's native blocks (rich text) field. */
export interface BlocksNode {
  type: string;
  children?: BlocksNode[];
  text?: string;
  [key: string]: unknown;
}

export type Blocks = BlocksNode[];

/** Shape written by @strapi/plugin-seo — field names are that plugin's contract. */
export interface Seo {
  metaTitle: string;
  metaDescription: string;
  metaImage: Media | null;
  metaSocial?: Array<{
    socialNetwork: 'Facebook' | 'Twitter';
    title: string;
    description: string;
    image: Media | null;
  }> | null;
  keywords: string | null;
  metaRobots: string | null;
  structuredData: Record<string, unknown> | null;
  metaViewport: string | null;
  canonicalURL: string | null;
}

/** A dynamic-zone entry; `__component` discriminates the union. */
export interface DynamicZoneComponent {
  id: number;
  __component: string;
  [key: string]: unknown;
}
