import { cmsFetch, cmsFetchOptional } from '../client';
import { publicationPosts, publicationUniversities } from '@/lib/agrico/publication';
import { listProgrammeContent } from '@/lib/agrico/programme-content';
import { UNIVERSITY_GUIDES } from '@/components/agrico/detail-catalogue';

/**
 * Site search, served by strapi-plugin-fuzzy-search and enriched with Agrico's
 * researched local catalogues (58+4 agriculture universities, 18 agriculture
 * programmes, and editorial guides/news).
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

function normaliseText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchesSearchQuery(haystack: string, query: string): boolean {
  const normHaystack = normaliseText(haystack);
  const normQuery = normaliseText(query);
  if (!normQuery) return false;
  if (normHaystack.includes(normQuery)) return true;
  const tokens = normQuery.split(/\s+/).filter((t) => t.length >= 2);
  return tokens.length > 0 && tokens.every((token) => normHaystack.includes(token));
}

function dedupeResults(
  items: { title: string; subtitle: string | null; href: string }[]
): { title: string; subtitle: string | null; href: string }[] {
  const seen = new Set<string>();
  const out: { title: string; subtitle: string | null; href: string }[] = [];
  for (const item of items) {
    const key = item.href.replace(/^\/program\//, '/');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export async function search(query: string): Promise<{ groups: SearchGroup[]; total: number }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { groups: [], total: 0 };

  const response = await cmsFetchOptional(
    () =>
      cmsFetch<Record<string, SearchHit[]>>(
        '/fuzzy-search/search',
        { query: trimmed },
        { revalidate: 0 }
      ),
    {} as Record<string, SearchHit[]>
  );

  const localUniversityMatches = [
    ...publicationUniversities
      .filter((u) =>
        matchesSearchQuery(
          [u.name, u.title, u.identity?.city, u.identity?.state, u.identity?.ownership, u.summary]
            .filter(Boolean)
            .join(' '),
          trimmed
        )
      )
      .map((u) => ({
        title: u.name || u.title,
        subtitle:
          [u.identity?.city, u.identity?.state, u.identity?.ownership].filter(Boolean).join(' · ') ||
          u.summary,
        href: `/university/${u.slug}`,
      })),
    ...UNIVERSITY_GUIDES.filter((g) =>
      matchesSearchQuery([g.name, g.mark, g.city, g.state, g.ownership, g.description].join(' '), trimmed)
    ).map((g) => ({
      title: g.name,
      subtitle: `${g.city}, ${g.state} · ${g.ownership}`,
      href: `/university/${g.slug}`,
    })),
  ];

  const localProgrammeMatches = listProgrammeContent()
    .filter((p) =>
      matchesSearchQuery(
        [p.name, p.short_name, p.level, p.discipline, p.hero?.summary].filter(Boolean).join(' '),
        trimmed
      )
    )
    .map((p) => ({
      title: p.name,
      subtitle: [p.level, p.duration, p.discipline].filter(Boolean).join(' · '),
      href: `/${p.slug}`,
    }));

  const localPostMatches = publicationPosts
    .filter((post) =>
      matchesSearchQuery([post.title, post.summary, post.kind, post.eyebrow].filter(Boolean).join(' '), trimmed)
    )
    .map((post) => ({
      title: post.title,
      subtitle: post.summary || null,
      href: post.path,
    }));

  let total = 0;
  const groups: SearchGroup[] = [];

  for (const group of GROUPS) {
    const hits = response[group.key] ?? [];
    const cmsResults = hits.map((hit) => ({
      title: hit.name,
      subtitle:
        [hit.full_name, hit.description].find(
          (text) => text && text.trim() !== hit.name.trim()
        ) ?? null,
      href: group.href.endsWith('=')
        ? `${group.href}${hit.slug}`
        : `${group.href}/${hit.slug}`,
    }));

    const extraResults =
      group.key === 'universities'
        ? localUniversityMatches
        : group.key === 'programs'
          ? localProgrammeMatches
          : group.key === 'blogs'
            ? localPostMatches
            : [];

    const merged = dedupeResults([...cmsResults, ...extraResults]);
    if (merged.length === 0) continue;

    total += merged.length;
    groups.push({
      label: group.label,
      results: merged,
    });
  }

  return { groups, total };
}
