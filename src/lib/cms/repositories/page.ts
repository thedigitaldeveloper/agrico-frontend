import type { BlocksContent } from '../blocks';
import { cmsCollection, cmsFetchOptional, cmsFirst, cmsSingle } from '../client';
import { GLOBAL_TAG, collectionTag, entryTag } from '../tags';
import type { DynamicZoneComponent, Media, Seo, StrapiEntry } from '../types';

/**
 * Standalone content pages.
 *
 * Two content types back the site's non-catalogue pages: `legal` (privacy,
 * terms, disclaimer) and `master` (marketing pages such as careers or placement
 * support). Both resolve from the same `/[slug]` route, so an editor can add a
 * page in the CMS without a deploy.
 */

export interface LegalPage extends StrapiEntry {
  name: string;
  slug: string;
  description: BlocksContent | null;
  seo: Seo | null;
}

export interface MasterPage extends StrapiEntry {
  name: string;
  slug: string;
  description: string | null;
  long_description: BlocksContent | null;
  image: Media | null;
  seo: Seo | null;
}

export type StandalonePage =
  | ({ kind: 'legal' } & LegalPage)
  | ({ kind: 'master' } & MasterPage);

function h2(text: string): BlocksContent[number] {
  return { type: 'heading', level: 2, children: [{ type: 'text', text }] };
}

function p(text: string): BlocksContent[number] {
  return { type: 'paragraph', children: [{ type: 'text', text }] };
}

function ul(items: string[]): BlocksContent[number] {
  return {
    type: 'list',
    format: 'unordered',
    children: items.map((item) => ({
      type: 'list-item' as const,
      children: [{ type: 'text' as const, text: item }],
    })),
  };
}

const TS = '2026-10-30T00:00:00.000Z';

const FALLBACK_LEGAL_PAGES: Record<string, LegalPage> = {
  'privacy-policy': {
    id: 9901,
    documentId: 'agr-legal-privacy-policy',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: 'Privacy Policy',
    slug: 'privacy-policy',
    seo: null,
    description: [
      p(
        'Agrico ("we", "our", or "us") operates an independent academic discovery and admission guidance platform focused on on-campus agriculture and allied sciences education in India. This Privacy Policy explains what information we collect when you browse programme guides, university profiles, entrance exam calendars, or submit an admission counselling enquiry.'
      ),
      h2('1. Information We Collect'),
      ul([
        'Enquiry & Application Details: Name, mobile number, email address, state/city, preferred agricultural degree programme, and shortlisted universities when you submit our enquiry, callback, or mentor booking forms.',
        'Academic Context (Optional): Qualifying examination stream (PCB / PCM / PCA), CUET (ICAR-UG) or State CET status, and scholarship interest shared during 1-on-1 counselling sessions.',
        'Technical & Usage Data: Standard browser metadata, pages visited, and search queries used to improve site speed, navigation, and editorial accuracy.',
      ]),
      h2('2. How We Use Your Information'),
      ul([
        'To connect you with a verified Agrico academic mentor or admission counsellor for the agricultural programmes and campuses you requested.',
        'To share published admission schedules, ICAR / State CET counselling alerts, and official brochure links relevant to your shortlisted degrees.',
        'To maintain internal quality assurance and prevent duplicate or automated spam submissions.',
      ]),
      h2('3. Data Sharing & University Independence'),
      p(
        'We do not sell or rent your personal contact information to unauthorized third-party telemarketers. Information is shared only with our internal academic advising desk or, at your explicit request, with the official admissions office of the university you choose to apply to.'
      ),
      h2('4. Data Retention & Your Rights'),
      p(
        'You may request access to, correction of, or deletion of your enquiry records at any time by contacting our privacy desk through the Contact Us page. Upon verification, we remove active counselling records within 7 working days.'
      ),
    ],
  },
  'terms-and-conditions': {
    id: 9902,
    documentId: 'agr-legal-terms-and-conditions',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    seo: null,
    description: [
      p(
        'Welcome to Agrico. By accessing or using this website, our university comparison tools, programme guides, or 1-on-1 mentor booking services, you agree to be bound by these Terms & Conditions.'
      ),
      h2('1. Scope of Platform Services'),
      p(
        'Agrico provides structured editorial information, syllabus summaries, accreditation checks, and admission counselling for on-campus agricultural and allied science programmes in India (including B.Sc. (Hons.) Agriculture, B.Tech. Agricultural Engineering, B.Sc. Horticulture, M.Sc. Agronomy, MBA Agribusiness, and related diplomas).'
      ),
      h2('2. Official University Authority'),
      ul([
        'Final admission eligibility, seat allotment, reservation quotas, tuition fees, hostel charges, and scholarship disbursements are governed exclusively by the respective State Agricultural University (SAU), Central Agricultural University, ICAR Deemed University, private university, or statutory counselling authority (NTA / ICAR / State CET Cell).',
        'Submitting an enquiry or common application form on Agrico initiates an advisory conversation and does not constitute formal seat allotment or fee payment to any university.',
      ]),
      h2('3. User Responsibilities'),
      ul([
        'You agree to provide accurate contact and academic details when requesting counselling or booking a mentor slot.',
        'You must verify final fee demand letters, ICAR NAEAB accreditation validity for your specific admission batch, and reporting deadlines directly on the official university website before remitting any admission fee.',
      ]),
      h2('4. Intellectual Property'),
      p(
        'All editorial compilations, comparison tables, campus research notes, and layout designs on Agrico are protected by applicable copyright laws. University names, emblems, and seals remain the property of their respective institutions and are used strictly for informational identification.'
      ),
    ],
  },
  disclaimer: {
    id: 9903,
    documentId: 'agr-legal-disclaimer',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: 'Editorial & Affiliation Disclaimer',
    slug: 'disclaimer',
    seo: null,
    description: [
      p(
        'Agrico is an independent higher-education information and admission guidance portal dedicated to agriculture and allied sciences in India.'
      ),
      h2('1. Non-Affiliation Notice'),
      p(
        'Unless explicitly stated in writing, Agrico is not an official website of the Indian Council of Agricultural Research (ICAR), the National Testing Agency (NTA), any State Common Entrance Test Cell, or the individual State Agricultural Universities (SAUs), Central Universities, or private institutions profiled on this platform.'
      ),
      h2('2. Source-Verified Editorial Policy'),
      ul([
        'Our editorial team compiles programme structures, intake figures, fee ranges, and accreditation statuses from official university prospectuses, public ICAR NAEAB registers, and statutory notifications.',
        'Because agricultural universities and state counselling authorities revise fees, seat matrices, and accreditation renewals periodically, published figures on Agrico should be treated as research guidance rather than a legally binding offer.',
      ]),
      h2('3. Zero Capitation / Fee Collection Warning'),
      p(
        'Agrico does not charge students for 1-on-1 mentor consultations and never collects cash or unofficial capitation fees for seat allotment in any State Agricultural University or ICAR-counselled programme. All statutory tuition fees must always be paid directly through the official university portal or authorised counselling bank challan.'
      ),
    ],
  },
};

export async function getStandalonePage(slug: string): Promise<StandalonePage | null> {
  const cmsPage = await cmsFetchOptional(async () => {
    const legal = await cmsFirst<LegalPage>(
      '/legals',
      { filters: { slug: { $eqi: slug } } },
      { tags: [collectionTag('legal'), entryTag('legal', slug)] }
    );
    if (legal) return { kind: 'legal' as const, ...legal };

    const master = await cmsFirst<MasterPage>(
      '/masters',
      { filters: { slug: { $eqi: slug } } },
      { tags: [collectionTag('master'), entryTag('master', slug)] }
    );
    if (master) return { kind: 'master' as const, ...master };

    return null;
  }, null);

  if (cmsPage) return cmsPage;

  const fallbackLegal = FALLBACK_LEGAL_PAGES[slug.toLowerCase()];
  if (fallbackLegal) {
    return { kind: 'legal', ...fallbackLegal };
  }

  return null;
}

export async function getStandaloneSlugs(): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const [legals, masters] = await Promise.all([
      cmsCollection<{ slug: string }>(
        '/legals',
        { fields: ['slug'], pagination: { pageSize: 50 } },
        { tags: [collectionTag('legal')] }
      ),
      cmsCollection<{ slug: string }>(
        '/masters',
        { fields: ['slug'], pagination: { pageSize: 50 } },
        { tags: [collectionTag('master')] }
      ),
    ]);
    return [...legals.data, ...masters.data].map((entry) => entry.slug).filter(Boolean);
  }, []);

  const merged = new Set<string>([...cmsSlugs, ...Object.keys(FALLBACK_LEGAL_PAGES)]);
  return [...merged];
}

// --- single types ----------------------------------------------------------

export interface SingleTypePage {
  name: string | null;
  seo: Seo | null;
  content: DynamicZoneComponent[];
}

export async function getAboutPage(): Promise<SingleTypePage | null> {
  return cmsFetchOptional(
    () =>
      cmsSingle<SingleTypePage>('/about-us', undefined, {
        tags: [collectionTag('about-us'), GLOBAL_TAG],
      }),
    null
  );
}

export async function getContactPage(): Promise<SingleTypePage | null> {
  return cmsFetchOptional(
    () =>
      cmsSingle<SingleTypePage>('/contact-us', undefined, {
        tags: [collectionTag('contact-us'), GLOBAL_TAG],
      }),
    null
  );
}
