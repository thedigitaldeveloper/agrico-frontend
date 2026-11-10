import { CMS_PUBLIC_URL } from '@/lib/env';
import type { Media } from './types';

/**
 * Media URLs.
 *
 * Strapi returns upload paths relative to its own origin ("/uploads/x.jpg"), so
 * they have to be absolutised against the origin the *browser* can reach — which
 * is not necessarily the one the server fetched data from.
 *
 * These deliberately do not route images through the Next server. The previous
 * build rewrote /uploads/* to the CMS, so every image cost an extra proxy hop
 * and gave up on CDN caching.
 */

export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/images/') || url.startsWith('/icons/') || url.startsWith('/fonts/')) {
    return url;
  }
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export interface ResolvedImage {
  src: string;
  alt: string;
  width: number | undefined;
  height: number | undefined;
}

/** A replacement can keep its upload URL; give the image cache a new key. */
function versionedImageUrl(media: Media, url: string): string | null {
  const src = mediaUrl(url);
  if (!src || !media.updatedAt || src.startsWith('/')) return src;
  const parsed = new URL(src);
  // Leave external (potentially signed) provider URLs untouched.
  if (parsed.origin !== CMS_PUBLIC_URL || !parsed.pathname.startsWith('/uploads/')) return src;
  parsed.searchParams.set('v', media.updatedAt);
  return parsed.toString();
}

/**
 * Turns a Strapi media object into next/image props. Alt text falls back to the
 * caller's label rather than the filename, which is what Strapi puts in
 * `alternativeText` by default and which reads as noise to a screen reader.
 */
export function resolveImage(
  media: Media | null | undefined,
  fallbackAlt = ''
): ResolvedImage | null {
  const src = media?.url ? versionedImageUrl(media, media.url) : null;
  if (!src || !media) return null;

  return {
    src,
    alt: media.alternativeText?.trim() || fallbackAlt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  };
}

/**
 * Picks the smallest generated format at or above `minWidth`, falling back to
 * the original. Useful for logos and thumbnails, where shipping the full-size
 * upload is pure waste.
 */
export function resolveThumbnail(
  media: Media | null | undefined,
  minWidth: number,
  fallbackAlt = ''
): ResolvedImage | null {
  if (!media) return null;

  const candidates = Object.values(media.formats ?? {})
    .filter((format): format is NonNullable<typeof format> => Boolean(format))
    .filter((format) => format.width >= minWidth)
    .sort((a, b) => a.width - b.width);

  const chosen = candidates[0];
  if (!chosen) return resolveImage(media, fallbackAlt);

  const src = versionedImageUrl(media, chosen.url);
  if (!src) return null;

  return {
    src,
    alt: media.alternativeText?.trim() || fallbackAlt,
    width: chosen.width,
    height: chosen.height,
  };
}

/**
 * Resolves a single Media or array of Media objects from Strapi CMS into ResolvedImage list.
 */
export function resolveMediaList(
  media: Media | Media[] | null | undefined,
  fallbackAlt = ''
): ResolvedImage[] {
  if (!media) return [];
  const list = Array.isArray(media) ? media : [media];
  return list
    .map((m) => resolveImage(m, fallbackAlt))
    .filter((img): img is ResolvedImage => img !== null);
}
