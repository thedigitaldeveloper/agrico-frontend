import type { Metadata } from 'next';

import { SITE_NAME, SITE_URL } from '@/lib/env';
import { mediaUrl } from '@/lib/cms/media';
import type { Seo } from '@/lib/cms/types';

/**
 * One place that turns CMS SEO components into Next metadata, so no page has to
 * remember to set canonical URLs, OG images or robots directives by hand.
 */

const DEFAULT_DESCRIPTION =
  'Compare ICAR-aligned agriculture degrees, State Agricultural Universities, private farm campuses, entrance exams and fees in India.';

interface BuildMetadataInput {
  seo?: Seo | null;
  /** Used when the CMS entry has no SEO component filled in. */
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/university/iit-delhi". */
  path: string;
  image?: string | null;
  icon?: string | null;
  noindex?: boolean;
}

export function buildMetadata({
  seo,
  title,
  description,
  path,
  image,
  icon,
  noindex: deferredIndexing = false,
}: BuildMetadataInput): Metadata {
  const resolvedTitle = seo?.metaTitle?.trim() || title || SITE_NAME;
  const resolvedDescription =
    seo?.metaDescription?.trim() || description || DEFAULT_DESCRIPTION;

  const canonical = seo?.canonicalURL?.trim() || `${SITE_URL}${path}`;
  const ogImage = mediaUrl(seo?.metaImage?.url) ?? image ?? '/branding/agrico-social.png';

  // Strapi's SEO plugin writes metaRobots as a comma-separated string
  // ("noindex, nofollow"); anything containing noindex should stay out of the
  // index even if the rest of the directive is unrecognised.
  const robots = seo?.metaRobots?.toLowerCase() ?? '';
  const noindex = deferredIndexing || robots.includes('noindex');

  return {
    metadataBase: new URL(SITE_URL),
    ...(icon ? { icons: { icon: mediaUrl(icon) ?? icon } } : {}),
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: seo?.keywords
      ? seo.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : undefined,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: !robots.includes('nofollow') }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
