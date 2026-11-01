import { cmsFetch, cmsFetchOptional } from '../client';

/**
 * Site search, served by strapi-plugin-fuzzy-search.
 *
 * Ranking and field weighting are configured once in the CMS
 * (config/plugins.ts), so the frontend just asks a question and renders the
 * answer. The old build hand-rolled a search route in Next that could only do
 * substring matching, one content type at a time.
 */

interface SearchHit {
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  full_name?: string | null;
}

/** The plugin keys results by plural name; each maps to a site route prefix. */
const GROUPS = [
  { key: 'universities', label: 'Universities', href: '/university' },
  { key: 'programs', label: 'Programs', href: '/program' },
  { key: 'examinations', label: 'Entrance exams', href: '/exams' },
  { key: 'schemes', label: 'Scholarships', href: '/scholarship' },
  { key: 'courses', label: 'Courses', href: '/programs?course=' },
  { key: 'blogs', label: 'Blogs & news', href: '/blogs' },
] as const;

export interface SearchGroup {
  label: string;
  results: { title: string; subtitle: string | null; href: string }[];
}

export async function search(query: string): Promise<{ groups: SearchGroup[]; total: number }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { groups: [], total: 0 };

  const response = await cmsFetchOptional(
    () =>
      cmsFetch<Record<string, SearchHit[]>>(
        '/fuzzy-search/search',
        { query: trimmed },
        // Searches are one-off and unbounded in variety; caching them would fill
        // the data cache with single-use entries. 0 is what prevents that —
        // `false` means the opposite, cache the resource indefinitely.
        { revalidate: 0 }
      ),
    {} as Record<string, SearchHit[]>
  );

  let total = 0;
  const groups: SearchGroup[] = [];

  for (const group of GROUPS) {
    const hits = response[group.key] ?? [];
    if (hits.length === 0) continue;

    total += hits.length;
    groups.push({
      label: group.label,
      results: hits.map((hit) => ({
        title: hit.name,
        // Entries often repeat the name in full_name or description; showing it
        // twice under the title is just noise.
        subtitle:
          [hit.full_name, hit.description].find(
            (text) => text && text.trim() !== hit.name.trim()
          ) ?? null,
        href: group.href.endsWith('=')
          ? `${group.href}${hit.slug}`
          : `${group.href}/${hit.slug}`,
      })),
    });
  }

  return { groups, total };
}
