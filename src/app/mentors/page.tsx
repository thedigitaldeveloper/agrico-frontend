import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Award, ArrowRight } from 'lucide-react';

import { MentorCard } from '@/components/mentor/mentor-card';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSearch } from '@/components/ui/list-search';
import {
  Pagination,
  buildListHref,
  one,
  type SearchParams,
} from '@/components/ui/pagination';
import { listMentors } from '@/lib/cms/repositories/mentor';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/mentors';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Academic Mentors', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Admission Mentors & Programme Guidance — Agrico',
  description:
    'Explore mentor profiles for guidance on programmes, universities and admissions. View session details and request a booking with Agrico.',
  path: BASE,
});

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const stream = one(params.stream);

  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const [{ mentors, pagination }, streams] = await Promise.all([
    listMentors({ page, stream, search: query, pageSize: 12 }),
    listTaxonomy('streams', 20),
  ]);

  const streamLabel = stream
    ? (streams.find((term) => term.slug === stream)?.name ?? stream)
    : undefined;

  return (
    <div className="bg-ink-50/50 pb-20">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      {/* ===================================================================== */}
      {/* 1. MENTOR DIRECTORY HERO */}
      {/* ===================================================================== */}
      <section className="rs-resource-hero">
        <div className="container-page">
          <nav aria-label="Breadcrumbs" className="rs-resource-crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Admission mentors</span></nav>
          <div className="rs-resource-heading"><p className="rs-eyebrow">Admission guidance</p><h1>Find a mentor<br />for your next step.</h1><p>Explore mentor profiles, discuss your programme choices and request a guidance session. Session details and booking availability are listed on each profile.</p></div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SEARCH & STREAM FILTER BAR */}
      {/* ===================================================================== */}
      <div className="container-page -mt-7 relative z-20">
        <div className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <ListSearch
                basePath={BASE}
                current={params}
                label="Search Mentors"
                placeholder="Search mentors by name or area of study"
                className="my-0"
              />
            </div>
            <div className="shrink-0">
              <ButtonLink
                href="/common-application-form"
                variant="accent"
                size="md"
                className="w-full md:w-auto rounded-xl shadow-md font-bold px-5"
              >
                <span>Direct Application Form</span>
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>

          {/* Stream Filter Pills */}
          {streams.length > 0 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-ink-150">
              <Link
                href={buildListHref(BASE, params, { stream: null, page: null })}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                  !stream
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                )}
              >
                All Mentors
              </Link>
              {streams.map((s) => {
                const isActive = stream === s.slug;
                return (
                  <Link
                    key={s.slug}
                    href={buildListHref(BASE, params, { stream: s.slug, page: null })}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    )}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MENTORS GRID */}
      {/* ===================================================================== */}
      <div className="container-page mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-ink-900">
            {streamLabel ? `${streamLabel} Specialists` : 'Explore Admission Mentors'}
          </h2>
          {query || stream || page > 1 ? <span className="text-xs font-semibold text-ink-500">Showing {mentors.length} of {pagination.total} mentors</span> : null}
        </div>

        {mentors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.documentId} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-card">
            <EmptyState
              title={query ? `No mentors match “${query}”` : 'No advisors found for this filter'}
              description="Try a broader search term, or fill our general guidance application form."
              action={
                <ButtonLink href={buildListHref(BASE, params, { q: null, stream: null })} variant="outline">
                  Reset Filters
                </ButtonLink>
              }
              secondaryAction={<ButtonLink href="/common-application-form">General Application Form</ButtonLink>}
            />
          </div>
        )}

        <Pagination
          basePath={BASE}
          page={pagination.page}
          pageCount={pagination.pageCount}
          current={params}
        />
      </div>

      {/* ===================================================================== */}
      {/* 4. WHY TALK TO A RS EDUCATION MENTOR (TRUST SECTION) */}
      {/* ===================================================================== */}
      <section className="container-page mt-16">
        <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-10 shadow-card">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-2xs font-bold text-brand-800 uppercase tracking-wider mb-2">
              <ShieldCheck className="size-3.5 text-brand-700" />
              Plan your conversation
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950">
              Make the most of your guidance session.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
              Discuss programme options, eligibility and the application process with an Agrico counsellor.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-bold mb-3">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 mb-1.5">Compare programme options</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Discuss course content, study modes, duration and published fees for the programmes you are considering.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-bold mb-3">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 mb-1.5">Understand admission requirements</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Review published eligibility and application steps, and prepare the questions you want to ask.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-bold mb-3">
                <Award className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 mb-1.5">Explore fees and funding</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Ask about published fees, payment schedules and scholarship options for your chosen programme.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
