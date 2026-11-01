import Link from 'next/link';
import { PublicationCards } from './publication-page';
import type { PublicationCard } from '@/lib/agrico/publication';
import { publicationPosts, publicationStates, publicationUniversities } from '@/lib/agrico/publication';
import type { BlogSection } from '@/lib/cms/repositories/blog';
import { canonicalPostPath, listBlogs } from '@/lib/cms/repositories/blog';
import { one, type SearchParams } from '@/components/ui/pagination';
import { cmsFetchOptional } from '@/lib/cms/client';

export async function AgricoPublicationIndex({ kind, searchParams }: { kind: BlogSection | 'universities'; searchParams: SearchParams }) {
  const query = (one(searchParams.q) || '').trim();
  const base = kind === 'universities' ? '/agriculture-colleges' : '/' + kind;
  const titles = { articles: 'Agriculture guides, with the details that matter.', blogs: 'Make your next study decision with confidence.', news: 'Agriculture admission news & official updates.', universities: 'Find your agriculture college or university.' };
  const descriptions = { articles: 'Understand eligibility, ICAR accreditation, fee categories, practical learning and the different admission routes.', blogs: 'Practical checklists for comparing campuses, reading fee letters and planning applications.', news: 'Dated, sourced updates. Historical notices are identified by their event dates; confirm the current position with the official authority.', universities: 'Explore 58 sourced private university and college profiles covering agriculture and allied study. Compare the exact programme and campus.' };
  let cards: PublicationCard[];
  if (kind === 'universities') cards = publicationUniversities.map(doc => ({ name: doc.title, href: doc.path, description: [doc.identity?.city, doc.identity?.state].filter(Boolean).join(', '), media: doc.hero_media }));
  else {
    cards = publicationPosts.filter(doc => doc.path.startsWith('/' + kind + '/')).map(doc => ({ title: doc.title, path: doc.path, description: doc.description, kind: doc.kind }));
    const result = await cmsFetchOptional(() => listBlogs({ section: kind, pageSize: 50 }), null);
    const seen = new Set(cards.map(card => card.path));
    for (const post of result?.posts || []) {
      const path = canonicalPostPath(post);
      if (!seen.has(path)) { cards.push({ title: post.name, path, description: post.description || '', kind: post.type || kind }); seen.add(path); }
    }
  }
  const matching = query ? cards.filter(card => [card.name, card.title, card.description].join(' ').toLowerCase().includes(query.toLowerCase())) : cards;
  return <div className="ag-detail"><div className="ag-container ag-publication-index"><div className="ag-publication-index-intro"><p className="ag-eyebrow">Agrico · Agriculture education</p><h1>{titles[kind]}</h1><p>{descriptions[kind]}</p></div>
    <nav className="ag-publication-categories" aria-label="Explore Agrico content">{[['universities', 'Institutions'], ['articles', 'Guides'], ['blogs', 'Student planning'], ['news', 'News']].map(([path, label]) => <Link key={path} href={path === 'universities' ? '/agriculture-colleges' : '/' + path} aria-current={path === kind ? 'page' : undefined}>{label}</Link>)}</nav>
    {kind === 'universities' && <div className="ag-publication-state-links">{publicationStates.map(state => <Link key={state.path} href={state.path}>{state.title.replace('Private agriculture colleges and universities in ', '')}</Link>)}</div>}
    <form action={base} className="ag-publication-filter"><label htmlFor="publication-search" className="sr-only">Search {kind}</label><input id="publication-search" name="q" type="search" placeholder={'Search ' + kind} defaultValue={query} /><button type="submit">Search</button>{query && <Link href={base}>Clear search</Link>}</form>
    <p>{matching.length} {kind === 'universities' ? 'institutions' : 'results'}</p>{matching.length ? <PublicationCards cards={matching} /> : <p>No matching content. Try another programme, place or topic.</p>}
  </div></div>;
}
