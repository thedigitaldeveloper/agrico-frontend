import { permanentRedirect } from 'next/navigation';
import { toCleanSectionSuffix } from '@/lib/cms/paths';

/**
 * Legacy `/[slug]/[section]` program section route.
 * Permanently redirects to the clean Shiksha-style hyphenated URL:
 * `/[slug]-[cleanSection]` (or `/[slug]` for overview).
 */
export default async function LegacyProgramSectionRedirectPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  const clean = toCleanSectionSuffix(section);
  if (!clean || clean === 'overview') {
    permanentRedirect(`/${slug}`);
  }
  permanentRedirect(`/${slug}-${clean}`);
}
