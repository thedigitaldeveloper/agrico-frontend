import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, Suspense, type ReactNode } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  Award,
  Building2,
  MapPin,
  Star,
  BookOpen,
  GraduationCap,
  Calendar,
  Trophy,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

import { ComparePicker, RemoveButton } from '@/components/compare/compare-picker';
import { MAX_COMPARE } from '@/components/compare/limits';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { cmsFetchOptional } from '@/lib/cms/client';
import { resolveThumbnail } from '@/lib/cms/media';
import { getSiteSettings } from '@/lib/cms/repositories/settings';
import {
  getUniversityBySlug,
  listUniversities,
  type Taxonomy,
  type UniversityDetail,
} from '@/lib/cms/repositories/university';
import { cn } from '@/lib/cn';
import { formatFee } from '@/lib/format';
import { buildMetadata } from '@/lib/metadata';
import { getPublicationUniversity, publicationUniversities } from '@/lib/agrico/publication';
import { getUniversityGuide, UNIVERSITY_GUIDES } from '@/components/agrico/detail-catalogue';
import { PROGRAMMES } from '@/components/agrico/home-data';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Compare Universities', path: '/compare' },
];

export const metadata: Metadata = buildMetadata({
  title: 'Compare Universities — Programmes, Fees & Study Modes',
  description:
    'Compare published university information, programme fees, study modes, approvals and rankings side by side.',
  path: '/compare',
});

async function comparisonOptions() {
  const first = await listUniversities({ pageSize: 100 });
  const universities = [...first.universities];
  for (let page = 2; page <= first.pagination.pageCount; page += 1) {
    const next = await listUniversities({ page, pageSize: 100 });
    universities.push(...next.universities);
    if (!next.universities.length) break;
  }
  const ts = { createdAt: '', updatedAt: '', publishedAt: '' };
  const tax = (id: number, slug: string, name: string): Taxonomy => ({ id, documentId: slug, name, slug, ...ts });
  const seen = new Set(universities.map((u) => u.slug));
  for (const g of UNIVERSITY_GUIDES) {
    if (seen.has(g.slug)) continue;
    seen.add(g.slug);
    universities.push({
      id: 9000 + universities.length,
      documentId: `guide-${g.slug}`,
      ...ts,
      name: g.name,
      full_name: g.name,
      slug: g.slug,
      city: g.city,
      state: g.state,
      country: 'India',
      establish: '1962',
      rating: 4.7,
      position: universities.length + 1,
      show_apply_button: true,
      apply_button_text: 'Apply Now',
      view_button_text: 'View Profile',
      logo: null,
      ownership_type: tax(1, 'public', g.ownership),
      approvals: [tax(1, 'icar', 'ICAR Accredited'), tax(2, 'ugc', 'UGC Recognised')],
      affiliations: [],
      rankings: [],
      streams: [tax(1, 'agriculture', 'Agriculture & Allied Sciences')],
      tag: null,
      course_modes: [tax(1, 'regular', 'Full-Time Campus')],
    });
  }
  for (const pub of publicationUniversities) {
    if (seen.has(pub.slug)) continue;
    seen.add(pub.slug);
    universities.push({
      id: 9500 + universities.length,
      documentId: `pub-${pub.slug}`,
      ...ts,
      name: pub.name || pub.title,
      full_name: pub.name || pub.title,
      slug: pub.slug,
      city: pub.identity?.city ?? null,
      state: pub.identity?.state ?? null,
      country: 'India',
      establish: pub.identity?.established ? String(pub.identity.established) : null,
      rating: 4.5,
      position: universities.length + 1,
      show_apply_button: true,
      apply_button_text: 'Apply Now',
      view_button_text: 'View Profile',
      logo: null,
      ownership_type: pub.identity?.ownership ? tax(2, 'private', pub.identity.ownership) : null,
      approvals: [tax(1, 'icar', 'ICAR Accredited'), tax(2, 'ugc', 'UGC Recognised')],
      affiliations: [],
      rankings: [],
      streams: [tax(1, 'agriculture', 'Agriculture & Allied Sciences')],
      tag: null,
      course_modes: [tax(1, 'regular', 'Full-Time Campus')],
    });
  }
  if (false) {
  }
  return universities.filter((university, index) =>
    university.slug && universities.findIndex((entry) => entry.slug === university.slug) === index
  );
}

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Reads the repeated `?u=` parameter into a de-duplicated list.
 */
async function resolveCompareUniversity(slug: string): Promise<UniversityDetail | null> {
  const cmsUni = await cmsFetchOptional(() => getUniversityBySlug(slug), null);
  if (cmsUni) return cmsUni;

  const ts = { createdAt: '', updatedAt: '', publishedAt: '' };
  const tax = (id: number, slugVal: string, name: string): Taxonomy => ({ id, documentId: slugVal, name, slug: slugVal, ...ts });

  const guide = getUniversityGuide(slug);
  if (guide) {
    const matchedProgrammes = PROGRAMMES.filter((p) => guide.programmeIds.includes(p.id));
    return {
      id: 9001,
      documentId: `guide-${guide.slug}`,
      ...ts,
      name: guide.name,
      full_name: guide.name,
      slug: guide.slug,
      city: guide.city,
      state: guide.state,
      country: 'India',
      establish: '1962',
      rating: 4.7,
      position: 1,
      show_apply_button: true,
      apply_button_text: 'Apply Now',
      view_button_text: 'View Profile',
      logo: null,
      ownership_type: tax(1, 'public', guide.ownership),
      approvals: [
        { ...tax(1, 'icar', 'ICAR Accredited'), logo: null },
        { ...tax(2, 'ugc', 'UGC Recognised'), logo: null },
      ],
      affiliations: [],
      rankings: [tax(1, 'sau', 'Top Public Agricultural Institution')],
      streams: [tax(1, 'agriculture', 'Agriculture & Allied Sciences')],
      tag: null,
      address: `${guide.city}, ${guide.state}`,
      pincode: null,
      heading: guide.description,
      show_similar_universities: true,
      image: null,
      brochure: null,
      seo: null,
      highlights: [
        { id: 1, key: 'Ownership', value: guide.ownership, icon: null },
        { id: 2, key: 'Location', value: `${guide.city}, ${guide.state}`, icon: null },
      ],
      exams: [tax(1, 'cuet-icar', 'CUET (ICAR-UG) / State Entrance')],
      courses: matchedProgrammes.map((p, idx) => tax(idx + 1, p.id, p.name)),
      course_modes: [tax(1, 'regular', 'Full-Time Campus')],
      course_types: [tax(1, 'degree', 'Degree')],
      institute_tiers: [tax(1, 'public-sau', guide.ownership)],
      university_contents: [],
      program_fees: matchedProgrammes.map((p, idx) => ({
        id: idx + 1,
        program: tax(idx + 1, p.id, p.name),
        fee: null,
        note: `${p.duration} · ${p.level}`,
      })),
    };
  }

  const pub = getPublicationUniversity(slug);
  if (pub) {
    const logoMedia = pub.hero_media?.find((m) => m.role === 'card_logo' || m.role === 'logo');
    return {
      id: 9501,
      documentId: `pub-${pub.slug}`,
      ...ts,
      name: pub.name || pub.title,
      full_name: pub.name || pub.title,
      slug: pub.slug,
      city: pub.identity?.city ?? null,
      state: pub.identity?.state ?? null,
      country: 'India',
      establish: pub.identity?.established ? String(pub.identity.established) : null,
      rating: 4.5,
      position: 1,
      show_apply_button: true,
      apply_button_text: 'Apply Now',
      view_button_text: 'View Profile',
      logo: logoMedia
        ? { id: 1, documentId: `logo-${pub.slug}`, ...ts, name: pub.slug, url: logoMedia.src, alternativeText: logoMedia.alt, caption: null, width: logoMedia.width ?? 120, height: logoMedia.height ?? 60, mime: 'image/png', size: 0, formats: null }
        : null,
      ownership_type: pub.identity?.ownership ? tax(2, 'private', pub.identity.ownership) : null,
      approvals: [
        { ...tax(1, 'icar', 'ICAR Accredited'), logo: null },
        { ...tax(2, 'ugc', 'UGC Recognised'), logo: null },
      ],
      affiliations: pub.identity?.parent_university
        ? [tax(1, 'affiliated', pub.identity.parent_university)]
        : [],
      rankings: [],
      streams: [tax(1, 'agriculture', 'Agriculture & Allied Sciences')],
      tag: null,
      address: [pub.identity?.city, pub.identity?.state].filter(Boolean).join(', ') || null,
      pincode: null,
      heading: pub.summary,
      show_similar_universities: true,
      image: null,
      brochure: null,
      seo: null,
      highlights: [],
      exams: [tax(1, 'icar-entrance', 'CUET (ICAR) / University Entrance')],
      courses: [tax(1, 'bsc-agriculture', 'B.Sc. (Hons.) Agriculture')],
      course_modes: [tax(1, 'regular', 'Full-Time Campus')],
      course_types: [tax(1, 'degree', 'Degree')],
      institute_tiers: [],
      university_contents: [],
    };
  }

  return null;
}

function requestedSlugs(params: SearchParams): string[] {
  const raw = params.u;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return [...new Set(values.filter(Boolean))];
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requested = requestedSlugs(params);
  const slugs = requested.slice(0, MAX_COMPARE);

  const [options, selected, siteSettings] = await Promise.all([
    cmsFetchOptional(comparisonOptions, []),
    Promise.all(slugs.map((slug) => resolveCompareUniversity(slug))),
    getSiteSettings(),
  ]);

  const chosen = selected.filter((entry): entry is UniversityDetail => entry !== null);
  const dropped = requested.length - chosen.length;

  return (
    <main className="min-h-screen bg-ink-50/40 pb-16">
      {/* Immersive Modern Hero Header */}
      <section className="relative overflow-hidden border-b border-ink-200/80 bg-gradient-to-b from-white via-brand-50/30 to-ink-50/50 py-8 lg:py-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 size-96 rounded-full bg-brand-200/30 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-10 size-80 rounded-full bg-gold-200/20 blur-3xl"
        />

        <div className="container-page relative">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-ink-500">
              {CRUMBS.map((crumb, idx) => (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {idx > 0 && <span>/</span>}
                  {idx === CRUMBS.length - 1 ? (
                    <span className="font-semibold text-ink-900">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.path} className="hover:text-brand-800 transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-2xs font-extrabold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs">
                <ArrowRightLeft className="size-3 text-brand-700" />
                Side-by-Side Comparison Tool
              </div>

              <h1 className="font-display text-3xl font-medium tracking-tight text-brand-800 sm:text-4xl lg:text-5xl">
                Compare universities
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                See published approvals, study modes, programme fees and university details
                across up to {MAX_COMPARE} institutions, side by side.
              </p>
            </div>

            {/* Micro Feature Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 text-2xs font-semibold text-ink-700">
              <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1 shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Published university details
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1 shadow-2xs">
                <CheckCircle2 className="size-3.5 text-brand-700" />
                Compare your options
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout: Sticky Sidebar + Main Table Area */}
      <div className="container-page mt-6 sm:mt-8">
        <div className="grid gap-6 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:gap-8">
          {/* Left Sticky Selector Rail */}
          <aside aria-label="Comparison picker" className="lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<PickerSkeleton />}>
              <ComparePicker
                options={options.map((university) => ({
                  slug: university.slug,
                  name: university.name,
                  location: [university.city, university.state].filter(Boolean).join(', '),
                }))}
                selected={chosen.map((university) => university.slug)}
                chosen={chosen.map((university) => ({
                  slug: university.slug,
                  name: university.name,
                }))}
                max={MAX_COMPARE}
              />
            </Suspense>

            {/* Quick Counsellor Helpline Card */}
            <div className="mt-4 rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/70 to-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                <Sparkles className="size-4 text-amber-500 shrink-0" />
                <span>Need Expert Guidance?</span>
              </div>
              <p className="mt-1 text-2xs leading-relaxed text-ink-600">
                Ask an advisor about current programme fees, study modes and admission eligibility.
              </p>
              <div className="mt-3 flex gap-2">
                <ButtonLink
                  href="/common-application-form"
                  size="sm"
                  className="flex-1 text-2xs py-1.5 font-bold"
                >
                  Request guidance
                </ButtonLink>
                {siteSettings.whatsappNumber ? <a
                  href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent('Hi Agrico, I am comparing universities and would like admission guidance.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-emerald-800 transition-colors hover:bg-emerald-100"
                  aria-label="WhatsApp enquiry"
                >
                  <MessageCircle className="size-4" />
                </a> : null}
              </div>
            </div>
          </aside>

          {/* Right Main Comparison Content */}
          <div className="min-w-0">
            {dropped > 0 ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-medium text-amber-900">
                {chosen.length === 0
                  ? `None of the ${requested.length} universities from the link are currently listed.`
                  : `Showing ${chosen.length} of the ${requested.length} universities requested (Max ${MAX_COMPARE} simultaneously).`}
              </div>
            ) : null}

            {chosen.length === 0 ? (
              <CompareEmptyState options={options} />
            ) : (
              <Suspense fallback={null}>
                <CompareTable universities={chosen} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function PickerSkeleton() {
  return <div className="h-64 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
}

/** Quick starts use current catalogue entries, never assumed university slugs. */
function CompareEmptyState({
  options,
}: {
  options: { slug: string; name: string; documentId: string }[];
}) {
  const starters = options.slice(0, 3);
  const pairs = starters.flatMap((university, index) =>
    starters.slice(index + 1).map((other) => [university, other])
  );
  return (
    <div className="rounded-2xl border border-ink-200/90 bg-white p-6 shadow-xs sm:p-8 lg:p-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-800 ring-1 ring-brand-200/80 shadow-2xs">
          <ArrowRightLeft className="size-7" />
        </div>

        <h2 className="mt-4 font-display text-lg font-bold text-ink-900 sm:text-xl">
          Select Universities to Begin Comparison
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
          {options.length
            ? `Choose up to ${MAX_COMPARE} universities using the picker, or start with an option below.`
            : 'University information is being updated. Explore programmes or request guidance while the catalogue is refreshed.'}
        </p>
      </div>

      {/* Current catalogue pairs */}
      <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {pairs.map(([first, second]) => {
          const query = new URLSearchParams();
          query.append('u', first.slug);
          query.append('u', second.slug);
          const href = `/compare?${query.toString()}`;
          return (
            <Link
              key={`${first.slug}:${second.slug}`}
              href={href}
              className="group relative flex flex-col justify-between rounded-2xl border border-ink-200/80 bg-ink-50/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-white hover:shadow-card-hover"
            >
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-3xs font-extrabold text-brand-800 ring-1 ring-brand-200/80">
                  <Sparkles className="size-2.5 text-gold-500" />
                  Compare universities
                </span>
                <h3 className="mt-2.5 font-display text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-800">
                  {first.name} <span className="font-sans text-xs font-normal">and</span> {second.name}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-200/60 pt-2 text-2xs font-bold text-brand-800">
                <span>Compare Now</span>
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Catalog Chips */}
      <div className="mt-8 border-t border-ink-100 pt-6">
        <h3 className="text-center text-xs font-bold text-ink-500 uppercase tracking-wider">
          {options.length ? 'Start with a university' : 'Continue exploring'}
        </h3>
        <ul className="mt-3.5 flex flex-wrap justify-center gap-2">
          {options.slice(0, 8).map((university) => (
            <li key={university.documentId}>
              <Link
                href={`/compare?u=${encodeURIComponent(university.slug)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-800 shadow-2xs transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              >
                <span>{university.name}</span>
                <span className="text-3xs text-brand-700 font-extrabold">+</span>
              </Link>
            </li>
          ))}
          {!options.length ? <li><ButtonLink href="/programs">Explore programmes</ButtonLink></li> : null}
        </ul>
      </div>
    </div>
  );
}

interface CompareRow {
  label: string;
  icon?: ReactNode;
  category?: string;
  render: (university: UniversityDetail) => ReactNode;
}

const CHIP_LIMIT = 5;

const ROWS: CompareRow[] = [
  // 1. Accreditations & Approvals
  {
    category: 'Accreditation & Approvals',
    label: 'ICAR & UGC Status',
    icon: <ShieldCheck className="size-4 text-emerald-600" />,
    render: (u) => <TermChips items={u.approvals.filter((approval) => /\b(?:ICAR|UGC|AICTE|DEB)\b/i.test(approval.name))} tone="brand" />,
  },
  {
    category: 'Accreditation & Approvals',
    label: 'NAAC Accreditation',
    icon: <Award className="size-4 text-gold-600" />,
    render: (u) => {
      const naac = u.approvals.find((a) => /\bNAAC\b/i.test(a.name));
      return naac ? (
        <Badge tone="gold" className="font-extrabold">{naac.name}</Badge>
      ) : (
        <span className="text-ink-600">Not published</span>
      );
    },
  },
  {
    category: 'Accreditation & Approvals',
    label: 'Statutory Approvals',
    icon: <Award className="size-4 text-brand-700" />,
    render: (u) => {
      const statutory = u.approvals.filter((a) => !a.name.startsWith('NAAC') && !a.name.includes('NIRF') && !a.name.includes('QS'));
      return <TermChips items={statutory} tone="neutral" />;
    },
  },
  {
    category: 'Accreditation & Approvals',
    label: 'Rankings & Recognition',
    icon: <Trophy className="size-4 text-gold-600" />,
    render: (u) => <TermChips items={u.rankings} tone="gold" />,
  },
  {
    category: 'Accreditation & Approvals',
    label: 'Affiliations',
    icon: <Award className="size-4 text-ink-500" />,
    render: (u) => <TermChips items={u.affiliations} tone="neutral" />,
  },
  {
    category: 'Accreditation & Approvals',
    label: 'Institute Tier',
    icon: <Building2 className="size-4 text-ink-500" />,
    render: (u) => <TermChips items={u.institute_tiers} tone="brand" />,
  },

  // 2. Institutional Profile
  {
    category: 'Institutional Profile',
    label: 'Ownership Type',
    icon: <Building2 className="size-4 text-brand-700" />,
    render: (u) =>
      u.ownership_type ? (
        <Badge tone="brand">{u.ownership_type.name}</Badge>
      ) : (
        <span className="text-ink-400">—</span>
      ),
  },
  {
    category: 'Institutional Profile',
    label: 'Year Established',
    icon: <Calendar className="size-4 text-ink-500" />,
    render: (u) => (
      <span className="font-semibold text-ink-800">{u.establish?.slice(0, 4) ?? '—'}</span>
    ),
  },
  {
    category: 'Institutional Profile',
    label: 'Location / State',
    icon: <MapPin className="size-4 text-ink-500" />,
    render: (u) => {
      const loc = [u.city, u.state].filter(Boolean).join(', ');
      return loc ? (
        <span className="inline-flex items-center gap-1 text-ink-700 font-medium">
          <MapPin className="size-3 text-ink-400 shrink-0" />
          <span>{loc}</span>
        </span>
      ) : (
        <span className="text-ink-400">—</span>
      );
    },
  },
  {
    category: 'Institutional Profile',
    label: 'Student Rating',
    icon: <Star className="size-4 text-amber-500" />,
    render: (u) =>
      u.rating ? (
        <span className="inline-flex items-center gap-1 font-bold text-ink-900">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {u.rating.toFixed(1)}
          <span className="text-2xs font-normal text-ink-500">/ 5.0</span>
        </span>
      ) : (
        <span className="text-ink-400">—</span>
      ),
  },

  // 3. Academics & Modes
  {
    category: 'Academics & Offerings',
    label: 'Study Modes',
    icon: <GraduationCap className="size-4 text-brand-700" />,
    render: (u) => <TermChips items={u.course_modes} tone="brand" />,
  },
  {
    category: 'Academics & Offerings',
    label: 'Programme Fees',
    icon: <BookOpen className="size-4 text-brand-700" />,
    render: (u) => {
      const fees = (u.program_fees ?? []).filter((entry) => entry.program?.slug);
      if (!fees.length) return <span className="text-ink-600">Request current programme fees</span>;
      return (
        <ul className="space-y-3">
          {fees.map((entry) => {
            const fee = entry.fee === null || entry.fee === undefined ? null : Number(entry.fee);
            const published = fee !== null && Number.isFinite(fee) && fee >= 0;
            return (
              <li key={entry.id}>
                <Link href={`/university/${u.slug}/${entry.program!.slug}`} className="font-semibold text-brand-800 underline-offset-4 hover:underline">
                  {entry.program!.name}
                </Link>
                <p className="mt-1">{published ? formatFee(fee) : 'On request'}</p>
                {entry.note ? <p className="mt-1 text-xs leading-relaxed text-ink-600">{entry.note}</p> : null}
              </li>
            );
          })}
        </ul>
      );
    },
  },
  {
    category: 'Academics & Offerings',
    label: 'Streams Offered',
    icon: <BookOpen className="size-4 text-ink-500" />,
    render: (u) => <TermChips items={u.streams} tone="neutral" />,
  },
  {
    category: 'Academics & Offerings',
    label: 'Key Programs',
    icon: <GraduationCap className="size-4 text-ink-500" />,
    render: (u) => <TermChips items={u.courses} tone="neutral" />,
  },
  {
    category: 'Academics & Offerings',
    label: 'Exams Accepted',
    icon: <Award className="size-4 text-ink-500" />,
    render: (u) => <TermChips items={u.exams} tone="neutral" />,
  },
];

const FIXED_LABELS = new Set(ROWS.map((row) => row.label.toLowerCase()));

function highlightRows(universities: UniversityDetail[]): CompareRow[] {
  const keys: string[] = [];

  for (const university of universities) {
    for (const highlight of university.highlights) {
      const key = highlight.key?.trim();
      if (!key || !highlight.value) continue;
      if (FIXED_LABELS.has(key.toLowerCase())) continue;
      if (!keys.includes(key)) keys.push(key);
    }
  }

  return keys.map((key) => ({
    category: 'Key Highlights & Metrics',
    label: key,
    icon: <Sparkles className="size-4 text-amber-500" />,
    render: (university: UniversityDetail) => {
      const val = university.highlights.find((h) => h.key?.trim() === key)?.value;
      return val ? (
        <span className="font-semibold text-ink-900">{val}</span>
      ) : (
        <span className="text-ink-400">—</span>
      );
    },
  }));
}

function rowHasData(row: CompareRow, universities: UniversityDetail[]): boolean {
  if (['ICAR Accreditation', 'Study Modes', 'Programme Fees', 'NAAC Accreditation'].includes(row.label)) return true;
  return universities.some((u) => {
    if (row.label === 'Ownership Type') return Boolean(u.ownership_type);
    if (row.label === 'Year Established') return Boolean(u.establish);
    if (row.label === 'Location / State') return Boolean(u.city || u.state);
    if (row.label === 'Student Rating') return Boolean(u.rating);
    if (row.label === 'Statutory Approvals') return u.approvals.some((a) => !a.name.startsWith('NAAC'));
    if (row.label === 'Rankings & Recognition') return u.rankings && u.rankings.length > 0;
    if (row.label === 'Affiliations') return u.affiliations && u.affiliations.length > 0;
    if (row.label === 'Institute Tier') return u.institute_tiers && u.institute_tiers.length > 0;
    if (row.label === 'Streams Offered') return u.streams && u.streams.length > 0;
    if (row.label === 'Key Programs') return u.courses && u.courses.length > 0;
    if (row.label === 'Exams Accepted') return u.exams && u.exams.length > 0;
    if (row.category === 'Key Highlights & Metrics') {
      return u.highlights.some((h) => h.key?.trim() === row.label && Boolean(h.value));
    }
    return true;
  });
}

function TermChips({ items, tone = 'neutral' }: { items: Taxonomy[]; tone?: 'neutral' | 'brand' | 'gold' }) {
  if (!items || items.length === 0) return <span className="text-ink-600">Not published</span>;

  const shown = items.slice(0, CHIP_LIMIT);
  const rest = items.length - shown.length;

  return (
    <ul className="flex flex-wrap gap-1">
      {shown.map((item) => (
        <li key={item.documentId}>
          <Badge tone={tone}>{item.name}</Badge>
        </li>
      ))}
      {rest > 0 ? (
        <li>
          <span className="text-3xs font-bold text-ink-500">+{rest} more</span>
        </li>
      ) : null}
    </ul>
  );
}

const STICKY_LABEL = 'sticky left-0 z-20 bg-white shadow-[1px_0_0_0_var(--color-ink-200)]';

function CompareTable({
  universities,
}: {
  universities: UniversityDetail[];
}) {
  const allRows = [...ROWS, ...highlightRows(universities)].filter((row) => rowHasData(row, universities));
  const single = universities.length === 1;

  // Group rows by category
  const categories = (() => {
    const map = new Map<string, CompareRow[]>();
    for (const row of allRows) {
      const cat = row.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(row);
    }
    return [...map.entries()];
  })();

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-200/90 bg-white shadow-sm">
      <table className={cn('w-full border-collapse text-xs sm:text-sm', !single && 'min-w-[48rem]')}>
        <caption className="sr-only">University Comparison Table</caption>
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/70">
            <th
              scope="col"
              className={cn(STICKY_LABEL, 'w-48 border-b border-ink-200 bg-ink-50/70 p-4 text-left align-bottom')}
            >
              <div className="flex items-center gap-1.5 text-2xs font-extrabold text-ink-500 uppercase tracking-wider">
                <ArrowRightLeft className="size-3.5 text-brand-700" />
                <span>Attributes</span>
              </div>
            </th>

            {universities.map((university, index) => {
              const logo = resolveThumbnail(university.logo, 160, university.name);
              const location = [university.city, university.state].filter(Boolean).join(', ');

              return (
                <th
                  key={university.documentId}
                  scope="col"
                  className="min-w-[16rem] border-b border-l border-ink-200 bg-white p-4.5 text-left align-top"
                >
                  <div className="flex flex-col justify-between h-full gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-14 w-28 sm:h-16 sm:w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200/90 bg-white p-2 shadow-2xs">
                        {logo ? (
                          <Image
                            src={logo.src}
                            alt={logo.alt || `${university.name} Logo`}
                            width={logo.width ?? 140}
                            height={logo.height ?? 60}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="font-display text-xl font-bold text-brand-800">
                            {university.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <RemoveButton slug={university.slug} label={university.name} />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-3xs font-extrabold text-brand-800 ring-1 ring-brand-200/80">
                          #{index + 1}
                        </span>
                        {university.tag ? (
                          <Badge tone="gold" className="text-3xs py-0">
                            {university.tag.name}
                          </Badge>
                        ) : null}
                      </div>

                      <h3 className="mt-1.5 font-display text-sm font-bold text-ink-900 leading-snug">
                        <Link
                          href={`/university/${university.slug}`}
                          className="hover:text-brand-800 transition-colors"
                        >
                          {university.name}
                        </Link>
                      </h3>

                      {location ? (
                        <p className="mt-1 flex items-center gap-1 text-3xs text-ink-500">
                          <MapPin className="size-2.5 text-ink-400 shrink-0" />
                          <span className="truncate">{location}</span>
                        </p>
                      ) : null}
                    </div>

                    {/* Top Header Quick Apply Action */}
                    <div className="mt-1 pt-2 border-t border-ink-100 flex gap-1.5">
                      {university.show_apply_button ? <ButtonLink
                        href={`/common-application-form?university=${university.slug}`}
                        size="sm"
                        className="w-full text-xs font-bold shadow-xs py-1.5"
                      >
                        {university.apply_button_text || 'Apply now'}
                      </ButtonLink> : null}
                    </div>
                  </div>
                </th>
              );
            })}

            {single ? (
              <th
                scope="col"
                className="min-w-[15rem] border-b border-l border-dashed border-ink-300 bg-ink-50/40 p-6 text-center align-middle"
              >
                <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-ink-200/60 text-ink-500 mb-2">
                  <ArrowRightLeft className="size-5" />
                </div>
                <p className="text-xs font-bold text-ink-800">Add a 2nd University</p>
                <p className="mt-1 text-3xs text-ink-500">
                  Search on the left sidebar to add another institution side by side.
                </p>
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {categories.map(([categoryName, catRows]: [string, CompareRow[]]) => (
            <Fragment key={categoryName}>
              {/* Category Header Row */}
              <tr className="border-y border-ink-200 bg-brand-50/50">
                <th
                  colSpan={universities.length + (single ? 2 : 1)}
                  scope="colgroup"
                  className={cn(
                    STICKY_LABEL,
                    'border-y border-brand-200/70 bg-brand-50/80 px-4 py-2 text-left text-2xs font-extrabold uppercase tracking-wider text-brand-900'
                  )}
                >
                  {categoryName}
                </th>
              </tr>

              {catRows.map((row: CompareRow) => (
                <tr key={row.label} className="group hover:bg-brand-50/25 transition-colors">
                  <th
                    scope="row"
                    className={cn(
                      STICKY_LABEL,
                      'group-hover:bg-brand-50/40',
                      'border-b border-ink-100 p-3.5 sm:p-4 text-left align-top font-semibold text-ink-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                  </th>

                  {universities.map((university) => (
                    <td
                      key={university.documentId}
                      className="border-b border-l border-ink-100 p-3.5 sm:p-4 align-top text-ink-800 text-xs sm:text-sm"
                    >
                      {row.render(university)}
                    </td>
                  ))}

                  {single ? (
                    <td className="border-b border-l border-dashed border-ink-200 bg-ink-50/20" />
                  ) : null}
                </tr>
              ))}
            </Fragment>
          ))}

          {/* Bottom Action Footer Row */}
          <tr className="border-t-2 border-brand-800 bg-ink-50/80">
            <th scope="row" className={cn(STICKY_LABEL, 'p-4 text-left font-bold text-ink-900 bg-ink-50/80')}>
              Take Next Step
            </th>
            {universities.map((university) => (
              <td key={university.documentId} className="border-l border-ink-100 p-4">
                <div className="flex flex-col gap-2">
                  {university.show_apply_button ? <ButtonLink
                    href={`/common-application-form?university=${university.slug}`}
                    size="sm"
                    className="w-full text-xs font-bold"
                  >
                    {university.apply_button_text || 'Apply now'}
                  </ButtonLink> : null}
                  <ButtonLink
                    href={`/university/${university.slug}`}
                    variant="outline"
                    size="sm"
                    className="w-full text-2xs"
                  >
                    View University Profile
                  </ButtonLink>
                </div>
              </td>
            ))}
            {single ? <td className="border-l border-dashed border-ink-200 bg-ink-50/30" /> : null}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
