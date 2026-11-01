import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CreditCard,
  Clock,
  ArrowRight,
  Scale,
  Award,
} from 'lucide-react';

import { blocksToText } from '@/lib/cms/blocks';
import { ButtonLink } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { resolveThumbnail } from '@/lib/cms/media';
import type { CourseDetail } from '@/lib/cms/repositories/course';
import { CourseSpecialisationsExplorer } from './course-specialisations-explorer';

/** Rupees, in Indian digit grouping, with no trailing decimals. */
function formatFee(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function CourseDetailView({ course }: { course: CourseDetail }) {
  const icon = resolveThumbnail(course.icon, 96, course.name);
  const lede = blocksToText(course.short_description).trim();

  const fees = course.programs
    .map((program) => program.fee)
    .filter((fee): fee is number => typeof fee === 'number' && fee > 0)
    .sort((a, b) => a - b);
  const low = fees.length ? formatFee(fees[0]) : null;
  const high = fees.length ? formatFee(fees[fees.length - 1]) : null;
  const band = low && high ? (low === high ? low : `${low} – ${high}`) : null;


  return (
    <div className="min-h-screen bg-ink-50/50 pb-16">
      {/* 1. HERO SECTION: High-Impact Visual Branding */}
      <section className="relative isolate overflow-hidden surface-inverse bg-brand-800 text-white pb-12 pt-6 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
        {/* Subtle Ambient Radial Lighting */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 size-[36rem] rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-48 -left-24 size-[32rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="container-page">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Programs', path: '/programs' },
              { name: course.name },
            ]}
            tone="hero"
            className="mb-6"
          />

          {/* Main Hero Header Block */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              {/* Trust Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                <ShieldCheck className="size-4 text-white" />
                <span>Explore programmes. Compare your options.</span>
              </div>

              {/* Title & Icon Header */}
              <div className="flex items-start gap-4 sm:gap-5">
                {icon ? (
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-2.5 shadow-xl shadow-brand-950/40 ring-1 ring-white/20 sm:size-20">
                    <Image
                      src={icon.src}
                      alt={course.name}
                      width={icon.width ?? 80}
                      height={icon.height ?? 80}
                      className="size-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2.5 shadow-inner ring-1 ring-white/20 sm:size-20">
                    <GraduationCap className="size-9 text-white" />
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {course.name}
                  </h1>
                  {course.full_name && course.full_name !== course.name ? (
                    <p className="mt-1 text-sm font-medium text-white/75 sm:text-base">
                      {course.full_name}
                    </p>
                  ) : null}

                  {/* Level & Stream Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.level ? (
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-xs ring-1 ring-white/20">
                        {course.level.name}
                      </span>
                    ) : null}
                    {course.stream ? (
                      <span className="inline-flex items-center rounded-full bg-gold-500/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-xs ring-1 ring-gold-400/30">
                        {course.stream.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Description */}
              {lede ? (
                <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
                  {lede}
                </p>
              ) : null}

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                <ButtonLink
                  href="/common-application-form"
                  variant="outline"
                  className="max-w-full whitespace-normal rounded-xl px-5 py-3 text-sm font-medium shadow-lg shadow-gold-500/20 hover:scale-[1.02] sm:text-sm"
                >
                  <Sparkles className="size-4" />
                  Get admission guidance
                </ButtonLink>
                <ButtonLink
                  href="/compare"
                  variant="inverse"
                  className="max-w-full whitespace-normal rounded-xl px-5 py-3 text-sm font-bold ring-1 ring-white/30 hover:bg-white/10 sm:text-sm"
                >
                  <Scale className="size-4 text-white" />
                  Compare universities
                </ButtonLink>
              </div>
            </div>

            {/* Quick Summary Floating Glass Card */}
            <div className="w-full lg:max-w-xs">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-2xl">
                <div className="border-b border-white/15 pb-3">
                  <span className="text-3xs font-medium uppercase tracking-widest text-white">
                    Key Highlights
                  </span>
                  <p className="mt-0.5 font-display text-lg font-bold text-white">
                    {course.name} Snapshot
                  </p>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-sm">
                    <span className="text-white/70">Listed programmes:</span>
                    <strong className="text-sm text-white font-bold">{course.programs.length} Options</strong>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-sm">
                    <span className="text-white/70">Listed programme fees:</span>
                    <strong className="text-sm text-white font-bold">{band ?? 'Ask for current fees'}</strong>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-sm">
                    <span className="text-white/70">Eligibility:</span>
                    <strong className="text-xs text-white font-semibold">Check programme details</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15">
                  <Link
                    href="#specialisations-grid"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/20 py-2 text-xs font-bold text-white transition-colors hover:bg-white/30"
                  >
                    <span>Browse All Specialisations</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST VALUE PROPOSITIONS BAR */}
      <section className="border-y border-ink-200/80 bg-white py-4 shadow-2xs">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">University details</p>
                <p className="text-[11px] text-ink-500">Review available information</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">Study mode</p>
                <p className="text-[11px] text-ink-500">Check each programme</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">Fee guidance</p>
                <p className="text-[11px] text-ink-500">Understand current costs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">Admission guidance</p>
                <p className="text-[11px] text-ink-500">Discuss your next steps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN INTERACTIVE SPECIALISATIONS EXPLORER */}
      <main id="specialisations-grid" className="container-page py-12 sm:py-16">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-3xs font-medium uppercase tracking-wider text-brand-800">
              Curated Specialisations
            </span>
            <span className="text-xs text-ink-400">•</span>
            <span className="text-xs font-semibold text-ink-600">Choose your career track</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-800 sm:text-4xl">
            Explore All {course.name} Specialisations
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            Browse the available programmes and review their universities, study modes and admission details.
          </p>
        </div>

        {/* Dynamic Explorer Component */}
        <CourseSpecialisationsExplorer
          courseName={course.name}
          courseSlug={course.slug}
          programs={course.programs}
        />
      </main>

      {/* 4. ADMISSION STEPS BANNER */}
      <section className="container-page pb-10">
        <div className="rounded-3xl border border-brand-200/80 bg-brand-800 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="rounded-full bg-gold-500/20 px-3 py-1 text-3xs font-medium uppercase tracking-wider text-white border border-gold-400/30">
                Simple 3-Step Process
              </span>
              <h3 className="mt-3 font-display text-xl font-medium sm:text-2xl lg:text-3xl">
                Ready to Enrol in {course.name}?
              </h3>
              <p className="mt-1 max-w-xl text-xs text-white/80 sm:text-sm">
                Share your programme interests and get help understanding your options and application requirements.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ButtonLink
                href="/common-application-form"
                variant="inverse"
                className="max-w-full whitespace-normal rounded-xl px-5 py-3 text-sm font-medium shadow-lg shadow-gold-400/20 hover:scale-105 sm:text-sm"
              >
                Start an enquiry →
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
