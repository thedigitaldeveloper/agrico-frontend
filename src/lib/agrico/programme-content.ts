import 'server-only';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
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

let offeredCache: Map<string, { slug: string; summary: string | null }[]> | null = null;
function offeredIndex() {
  if (offeredCache) return offeredCache;
  const index = new Map<string, { slug: string; summary: string | null }[]>();
  if (existsSync(universityDirectory)) {
    for (const batch of readdirSync(universityDirectory).filter(name => name.startsWith('batch-'))) {
      for (const file of readdirSync(path.join(universityDirectory, batch)).filter(name => name.endsWith('.json'))) {
        try {
          const doc = JSON.parse(readFileSync(path.join(universityDirectory, batch, file), 'utf8')) as { slug: string; programmes?: { name: string; summary?: string | null }[] };
          for (const programme of doc.programmes || []) {
            const name = normalise(programme.name);
            for (const [slug, matcher] of Object.entries(MATCHERS)) {
              if (!matcher.test(name)) continue;
              const list = index.get(slug) || [];
              if (!list.some(item => item.slug === doc.slug)) list.push({ slug: doc.slug, summary: programme.summary || null });
              index.set(slug, list);
            }
          }
        } catch { /* skip unreadable research file */ }
      }
    }
  }
  return (offeredCache = index);
}

/** Researched institutions that list this programme, with verified local logos. */
export function programmeUniversities(slug: string): ProgrammeUniversity[] {
  return (offeredIndex().get(slug) || []).flatMap(({ slug: universitySlug, summary }) => {
    const doc = publicationUniversities.find(item => item.slug === universitySlug);
    if (!doc) return [];
    const logo = doc.hero_media?.find(m => m.role === 'card_logo')?.src || doc.hero_media?.find(m => m.role === 'logo')?.src || null;
    return [{ slug: universitySlug, name: doc.name || doc.title, city: doc.identity?.city || '', state: doc.identity?.state || '', logo, summary }];
  });
}

