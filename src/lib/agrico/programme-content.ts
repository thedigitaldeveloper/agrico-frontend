import 'server-only';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ContentSectionRef } from '@/lib/cms/repositories/university';
import { toCleanSectionSuffix } from '@/lib/cms/paths';
import { publicationUniversities } from './publication';

/**
 * Researched, original programme content (docs/content/programmes-2026-11-01).
 * Shape follows that folder's content-contract.json, which adapts the university
 * content contract. Read at build/request time on the server only.
 */
export interface ProgrammeSource { id: string; url: string; title: string; kind?: string; access?: string; checked_on?: string; notes?: string | null }
export interface ProgrammeContent {
  slug: string; name: string; short_name?: string; level: string; discipline?: string;
  duration?: string | null; duration_note?: string | null; mode?: string | null; regulator?: string | null;
  hero?: { eyebrow?: string; summary?: string };
  overview?: { heading?: string; paragraphs?: string[]; highlights?: { label: string; value: string }[] };
  who_should_apply?: string[];
  curriculum?: {
    heading?: string; intro?: string;
    structure?: { stage: string; focus?: string; courses?: string[] }[];
    specialisations?: string[];
    practical_learning?: { name: string; description: string }[];
  };
  eligibility?: { points?: string[] };
  admission?: {
    routes?: { name: string; description: string }[];
    exams?: { name: string; conducting_body?: string | null; url?: string | null; note?: string | null }[];
    steps?: { title: string; text: string }[];
    documents?: string[];
  };
  fees?: { summary?: string; observed_examples?: { institution: string; amount_inr: number | null; period?: string | null; academic_year?: string | null }[]; verification?: string };
  careers?: { heading?: string; intro?: string; roles?: { title: string; description: string }[]; sectors?: string[]; public_sector_routes?: string[]; higher_study?: string[] };
  skills?: string[];
  faqs?: { question: string; answer: string }[];
  seo?: { title?: string; description?: string; keywords?: string[] };
  related?: string[];
  sources?: ProgrammeSource[];
  editorial_status?: string;
}
export interface ProgrammeUniversity { slug: string; name: string; city: string; state: string; logo: string | null; summary: string | null }

const directory = path.join(process.cwd(), 'docs/content/programmes-2026-11-01');
const universityDirectory = path.join(process.cwd(), 'docs/content/universities-2026-10-30');

function loadAll(): Map<string, ProgrammeContent> {
  const map = new Map<string, ProgrammeContent>();
  if (!existsSync(directory)) return map;
  for (const file of readdirSync(directory)) {
    if (!file.endsWith('.json') || file === 'content-contract.json') continue;
    try {
      const doc = JSON.parse(readFileSync(path.join(directory, file), 'utf8')) as ProgrammeContent;
      if (doc?.slug && doc.name && doc.level) map.set(doc.slug, doc);
    } catch { /* an incomplete research draft is skipped rather than breaking the route */ }
  }
  return map;
}

let cache: Map<string, ProgrammeContent> | null = null;
const all = () => (process.env.NODE_ENV === 'production' && cache) ? cache : (cache = loadAll());

export const getProgrammeContent = (slug: string) => all().get(slug);
export const programmeContentSlugs = () => [...all().keys()];
export const listProgrammeContent = () => [...all().values()];

/** Programme-name matchers against the researched institution records (normalised: lowercase, letters/digits only). */
const MATCHERS: Record<string, RegExp> = {
  'bsc-agriculture': /^bsc( hons)? agriculture$/,
  'bsc-horticulture': /^bsc( hons)? horticulture$/,
  'btech-agricultural-engineering': /btech agricultural engineering/,
  'bsc-agribusiness': /^bsc( hons)? agribusiness/,
  'bvsc-animal-husbandry': /^bvsc/,
  'bfsc-fisheries-science': /fisheries science|^bfsc/,
  'diploma-agriculture': /diploma.*agricultur/,
  'mba-agribusiness': /^mba agribusiness/,
  'msc-agronomy': /^msc.*agronomy$/,
  'phd-agronomy': /^phd agronomy/,
  'msc-genetics-plant-breeding': /^msc.*genetics and plant breeding/,
  'msc-entomology': /^msc.*entomology/,
  'msc-plant-pathology': /^msc.*plant pathology/,
  'msc-soil-science': /^msc.*soil science/,
  'msc-agricultural-economics': /^msc.*agricultural economics/,
  'msc-agricultural-extension': /^msc.*extension education/,
  'msc-fruit-science': /^msc.*fruit science/,
  'msc-vegetable-science': /^msc.*vegetable science/,
  'msc-floriculture-landscaping': /^msc.*floriculture/,
};
const normalise = (value: string) => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\b(agri|ag)\b/g, 'agriculture').replace(/\bhort\b/g, 'horticulture').replace(/\s+/g, ' ').trim()
  .replace(/^b sc/, 'bsc').replace(/^m sc/, 'msc').replace(/^b tech/, 'btech').replace(/^ph d/, 'phd').replace(/^b v sc/, 'bvsc').replace(/^b f sc/, 'bfsc');

const FLAGSHIP_GUIDES: Array<{
  slug: string;
  name: string;
  city: string;
  state: string;
  programmes: string[];
}> = [
  {
    slug: 'punjab-agricultural-university',
    name: 'Punjab Agricultural University (PAU)',
    city: 'Ludhiana',
    state: 'Punjab',
    programmes: [
      'bsc-agriculture',
      'btech-agricultural-engineering',
      'bsc-horticulture',
      'mba-agribusiness',
      'msc-agronomy',
      'phd-agronomy',
      'msc-genetics-plant-breeding',
      'msc-soil-science',
    ],
  },
  {
    slug: 'tamil-nadu-agricultural-university',
    name: 'Tamil Nadu Agricultural University (TNAU)',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    programmes: [
      'bsc-agriculture',
      'btech-agricultural-engineering',
      'bsc-horticulture',
      'bsc-agribusiness',
      'mba-agribusiness',
      'msc-agronomy',
      'phd-agronomy',
      'msc-entomology',
      'msc-plant-pathology',
      'diploma-agriculture',
    ],
  },
  {
    slug: 'indian-agricultural-research-institute',
    name: 'ICAR–Indian Agricultural Research Institute (IARI)',
    city: 'New Delhi',
    state: 'Delhi',
    programmes: [
      'bsc-agriculture',
      'msc-agronomy',
      'phd-agronomy',
      'msc-genetics-plant-breeding',
      'msc-entomology',
      'msc-plant-pathology',
      'msc-soil-science',
      'msc-agricultural-economics',
      'msc-agricultural-extension',
      'msc-fruit-science',
      'msc-vegetable-science',
      'msc-floriculture-landscaping',
    ],
  },
  {
    slug: 'lovely-professional-university',
    name: 'Lovely Professional University (LPU)',
    city: 'Phagwara',
    state: 'Punjab',
    programmes: [
      'bsc-agriculture',
      'bsc-horticulture',
      'mba-agribusiness',
      'msc-agronomy',
      'msc-genetics-plant-breeding',
    ],
  },
];

let offeredCache: Map<string, { slug: string; summary: string | null }[]> | null = null;
function offeredIndex() {
  if (offeredCache) return offeredCache;
  const index = new Map<string, { slug: string; summary: string | null }[]>();
  for (const guide of FLAGSHIP_GUIDES) {
    for (const progSlug of guide.programmes) {
      const list = index.get(progSlug) || [];
      if (!list.some((item) => item.slug === guide.slug)) {
        list.push({
          slug: guide.slug,
          summary: `ICAR-aligned on-campus programme at ${guide.name}, ${guide.city}.`,
        });
      }
      index.set(progSlug, list);
    }
  }
  const institutionsFile = path.join(universityDirectory, 'institutions.json');
  if (existsSync(institutionsFile)) {
    try {
      const pack = JSON.parse(readFileSync(institutionsFile, 'utf8')) as {
        institutions?: { slug: string; programmes?: { name: string; summary?: string | null }[] }[];
      };
      for (const doc of pack.institutions || []) {
        for (const programme of doc.programmes || []) {
          const name = normalise(programme.name);
          for (const [slug, matcher] of Object.entries(MATCHERS)) {
            if (!matcher.test(name)) continue;
            const list = index.get(slug) || [];
            if (!list.some(item => item.slug === doc.slug)) list.push({ slug: doc.slug, summary: programme.summary || null });
            index.set(slug, list);
          }
        }
      }
    } catch { /* skip unreadable research file */ }
  }
  return (offeredCache = index);
}

/** Researched institutions that list this programme, with verified local logos. */
export function programmeUniversities(slug: string): ProgrammeUniversity[] {
  const matched = (offeredIndex().get(slug) || []).flatMap(({ slug: universitySlug, summary }) => {
    const doc = publicationUniversities.find(item => item.slug === universitySlug);
    if (doc) {
      const logo = doc.hero_media?.find(m => m.role === 'card_logo')?.src || doc.hero_media?.find(m => m.role === 'logo')?.src || null;
      return [{ slug: universitySlug, name: doc.name || doc.title, city: doc.identity?.city || '', state: doc.identity?.state || '', logo, summary }];
    }
    const flagship = FLAGSHIP_GUIDES.find(item => item.slug === universitySlug);
    if (flagship) {
      return [{ slug: flagship.slug, name: flagship.name, city: flagship.city, state: flagship.state, logo: null, summary }];
    }
    return [];
  });
  if (matched.length > 0) return matched;
  return publicationUniversities.slice(0, 8).map(doc => ({
    slug: doc.slug,
    name: doc.name || doc.title,
    city: doc.identity?.city || '',
    state: doc.identity?.state || '',
    logo: doc.hero_media?.find(m => m.role === 'card_logo')?.src || doc.hero_media?.find(m => m.role === 'logo')?.src || null,
    summary: doc.summary || null,
  }));
}

export function programmesForUniversitySlug(universitySlug: string): string[] {
  const idx = offeredIndex();
  const slugs: string[] = [];
  for (const [progSlug, entries] of idx.entries()) {
    if (entries.some((e) => e.slug === universitySlug)) {
      slugs.push(progSlug);
    }
  }
  return slugs.length > 0 ? slugs : ['bsc-agriculture'];
}

interface StoredTabItem {
  key: string;
  display: string;
  sectionKey: string;
  heading: string;
  titleSuffix: string;
  metaDesc: string;
  html: string;
}

interface StoredTabBundle {
  css: string;
  tabs: StoredTabItem[];
}

const tabBundleCache = new Map<string, StoredTabBundle | null>();

function loadProgrammeTabBundle(slug: string): StoredTabBundle | null {
  if (tabBundleCache.has(slug)) return tabBundleCache.get(slug) ?? null;
  const filePath = path.join(directory, 'tab-pages', `${slug}.json`);
  if (!existsSync(filePath)) {
    tabBundleCache.set(slug, null);
    return null;
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as StoredTabBundle;
    tabBundleCache.set(slug, parsed);
    return parsed;
  } catch {
    tabBundleCache.set(slug, null);
    return null;
  }
}

export function getProgrammeSectionRefs(slug: string): ContentSectionRef[] {
  const bundle = loadProgrammeTabBundle(slug);
  if (!bundle?.tabs?.length) return [];
  return bundle.tabs.map((tab, idx) => ({
    id: 95000 + idx,
    documentId: `prog-tab-${slug}-${tab.key}`,
    name: tab.display,
    slug: `${slug}--${tab.key}`,
    secondary_slug: tab.key,
    display_name: tab.display,
    heading: tab.heading,
    position: idx + 1,
  }));
}

export function getProgrammeAuthoredSection(
  slug: string,
  sectionSlug = 'overview'
): ContentSection | null {
  const bundle = loadProgrammeTabBundle(slug);
  if (!bundle?.tabs?.length) return null;
  const cleanKey = toCleanSectionSuffix(sectionSlug);
  const tab =
    bundle.tabs.find(
      (t) =>
        t.key === cleanKey ||
        t.key === sectionSlug ||
        `${slug}--${t.key}` === sectionSlug
    ) ?? (sectionSlug === 'overview' ? bundle.tabs[0] : null);

  if (!tab) return null;
  const idx = bundle.tabs.indexOf(tab);
  const TS = '2026-11-01T00:00:00.000Z';
  const canonicalPath = tab.key === 'overview' ? `/${slug}` : `/${slug}-${tab.key}`;

  return {
    id: 95000 + idx,
    documentId: `prog-tab-${slug}-${tab.key}`,
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: `${slug} · ${tab.display}`,
    slug: `${slug}--${tab.key}`,
    secondary_slug: tab.key,
    display_name: tab.display,
    heading: tab.heading,
    seo: {
      metaTitle: `${tab.heading} — ${tab.titleSuffix} | Agrico`,
      metaDescription: tab.metaDesc,
      keywords: `${slug}, ${tab.display}, agriculture education`,
      metaRobots: 'index,follow',
      metaViewport: null,
      canonicalURL: `https://agrico.in${canonicalPath}`,
      structuredData: null,
      metaImage: null,
    },
    content: [
      {
        id: 97000 + idx,
        __component: 'common.html-section',
        name: `${slug} · ${tab.display}`,
        code: {
          html: tab.html,
          css: bundle.css,
        },
      },
    ],
  };
}

