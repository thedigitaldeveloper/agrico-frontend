'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  Clock,
  Laptop,
  GraduationCap,
  Sparkles,
  CreditCard,
  Building2,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { formatFee } from '@/lib/format';

import type { CourseFinderData, FinderCourse, FinderProgram } from './course-finder-data';

const BUDGET_CAPS = [50_000, 100_000, 200_000, 500_000, 1_000_000];
const VISIBLE = 12;

const tabId = (id: string) => `course-finder-tab-${id}`;
const panelId = (id: string) => `course-finder-panel-${id}`;

function durationLabel(value: number, unit: string): string {
  return value === 1 ? `${value} ${unit.replace(/s$/i, '')}` : `${value} ${unit}`;
}

function capLabel(cap: number): string {
  return formatFee(cap)?.replace('.0', '') ?? '';
}

function numbers(values: (number | null)[]): number[] {
  return values.filter((value): value is number => value !== null);
}

function typicalDuration(programs: FinderProgram[]): string | null {
  const counts = new Map<string, number>();
  for (const program of programs) {
    if (program.duration === null) continue;
    const label = durationLabel(program.duration, program.durationUnit);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  let winner: string | null = null;
  let best = 0;
  for (const [label, count] of counts) {
    if (count > best) {
      winner = label;
      best = count;
    }
  }
  return winner;
}

function lowestFee(programs: FinderProgram[]): number | null {
  const fees = numbers(programs.map((program) => program.fee));
  return fees.length > 0 ? Math.min(...fees) : null;
}

export function CourseFinder({ intents, courses, config }: CourseFinderData) {
  const [intentId, setIntentId] = useState(intents[0]?.id ?? '');
  const [budget, setBudget] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const tabs = useRef(new Map<string, HTMLButtonElement>());

  const active = intents.find((intent) => intent.id === intentId) ?? intents[0];
  const activeId = active?.id ?? '';

  const inIntent = useMemo(
    () =>
      courses
        .map((course) => ({
          ...course,
          programs: course.programs.filter((program) => program.intents.includes(activeId)),
        }))
        .filter((course) => course.programs.length > 0),
    [courses, activeId]
  );

  const railCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const intent of intents) {
      counts.set(
        intent.id,
        courses.filter((course) =>
          course.programs.some((program) => program.intents.includes(intent.id))
        ).length
      );
    }
    return counts;
  }, [courses, intents]);

  const activeBudgetCaps = useMemo(() => {
    if (config?.budgetCaps && config.budgetCaps.length > 0) {
      return config.budgetCaps;
    }
    return BUDGET_CAPS;
  }, [config]);

  const options = useMemo(() => {
    const rows = inIntent.flatMap((course) => course.programs);

    const units = new Map<number, string>();
    for (const row of rows) {
      if (row.duration !== null && !units.has(row.duration)) {
        units.set(row.duration, row.durationUnit);
      }
    }
    const durations = [...units.keys()]
      .sort((a, b) => a - b)
      .slice(0, 4)
      .map((value) => ({ value, label: durationLabel(value, units.get(value) ?? '') }));

    const modes = new Map<string, string>();
    for (const row of rows) {
      if (row.modeSlug && row.modeName) modes.set(row.modeSlug, row.modeName);
    }

    const fees = numbers(rows.map((row) => row.fee));
    const budgets = activeBudgetCaps.filter(
      (cap) => fees.some((fee) => fee <= cap) && fees.some((fee) => fee > cap)
    );

    return {
      durations: durations.length > 1 ? durations : [],
      modes: modes.size > 1 ? [...modes] : [],
      budgets,
    };
  }, [inIntent, activeBudgetCaps]);

  const matched = useMemo(() => {
    const keep = (program: FinderProgram) =>
      (budget === null || (program.fee !== null && program.fee <= budget)) &&
      (duration === null || program.duration === duration) &&
      (mode === null || program.modeSlug === mode);

    return inIntent
      .map((course) => ({ ...course, programs: course.programs.filter(keep) }))
      .filter((course) => course.programs.length > 0);
  }, [inIntent, budget, duration, mode]);

  const superlatives = useMemo(() => {
    const flags: Record<string, string> = {};
    if (matched.length < 3) return flags;

    const counts = matched.map((course) => course.programs.length);
    const mostPrograms = Math.max(...counts);
    if (counts.filter((count) => count === mostPrograms).length === 1 && mostPrograms > 1) {
      const widest = matched.find((course) => course.programs.length === mostPrograms);
      if (widest) flags[widest.slug] = 'Most Specializations';
    }

    const lows = matched
      .map((course) => ({ slug: course.slug, fee: lowestFee(course.programs) }))
      .filter((entry): entry is { slug: string; fee: number } => entry.fee !== null);
    if (lows.length > 1) {
      const cheapest = Math.min(...lows.map((entry) => entry.fee));
      const winners = lows.filter((entry) => entry.fee === cheapest);
      if (winners.length === 1 && !flags[winners[0].slug]) {
        flags[winners[0].slug] = 'Best Value';
      }
    }

    return flags;
  }, [matched]);

  const uniformTag = useMemo(() => {
    if (matched.length < 3) return false;
    const first = matched[0].tag;
    return first !== null && matched.every((course) => course.tag === first);
  }, [matched]);

  if (intents.length === 0 || courses.length === 0 || !active) return null;

  const filtered = budget !== null || duration !== null || mode !== null;
  const hasRefiners =
    options.budgets.length > 0 || options.durations.length > 0 || options.modes.length > 0;
  const visible = expanded ? matched : matched.slice(0, VISIBLE);
  const programCount = matched.reduce((total, course) => total + course.programs.length, 0);

  const clear = () => {
    setBudget(null);
    setDuration(null);
    setMode(null);
  };

  const select = (id: string) => {
    setIntentId(id);
    clear();
    setExpanded(false);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;

    let next: number | null = null;
    if (step !== 0) next = (index + step + intents.length) % intents.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = intents.length - 1;
    if (next === null) return;

    event.preventDefault();
    const target = intents[next];
    select(target.id);
    tabs.current.get(target.id)?.focus();
  };

  const sectionEyebrow = config?.eyebrow ?? '';
  const sectionHeading = config?.heading ?? '';
  const sectionDescription = config?.description;
  const featureBadges = config?.featureBadges || [];

  return (
    <section id="course-finder" className="relative py-6 sm:py-8 lg:py-12">
      <div className="container-page">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          {/* Subtle Ambient Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-brand-50/70 blur-2xl -z-10"
          />

          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <Sparkles className="size-2.5 text-gold-500 sm:size-3" />
              {sectionEyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-brand-300 to-brand-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            {sectionHeading}
          </h2>
          {sectionDescription ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
              {sectionDescription}
            </p>
          ) : null}

          {/* Micro Feature Highlights (Horizontal Compact Chips) */}
          {featureBadges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-ink-600 sm:mt-3 sm:gap-2 sm:text-2xs">
              {featureBadges.map((badge, idx) => {
                const dotColor =
                  idx % 3 === 0
                    ? 'bg-brand-600'
                    : idx % 3 === 1
                      ? 'bg-emerald-600'
                      : 'bg-gold-600';
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white px-2 py-0.5 shadow-2xs sm:px-2.5 sm:py-1"
                  >
                    <span className={`size-1.5 rounded-full ${dotColor}`} />
                    {badge}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* 2-Column Layout: Sticky Tab Rail + Dynamic Course Cards */}
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
          {/* Tab Strip */}
          <div
            role="tablist"
            aria-label="Career stage & intent"
            className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:sticky lg:top-4 lg:flex-col lg:gap-2 lg:self-start lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {intents.map((intent, index) => {
              const selected = intent.id === activeId;
              const count = railCounts.get(intent.id) ?? 0;

              return (
                <button
                  key={intent.id}
                  ref={(node) => {
                    if (node) tabs.current.set(intent.id, node);
                    else tabs.current.delete(intent.id);
                  }}
                  type="button"
                  role="tab"
                  id={tabId(intent.id)}
                  aria-selected={selected}
                  aria-controls={panelId(intent.id)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(intent.id)}
                  onKeyDown={(event) => onTabKey(event, index)}
                  className={cn(
                    'group relative shrink-0 w-[13.5rem] sm:w-[15rem] rounded-2xl border p-3.5 text-left transition-all duration-200',
                    'lg:w-full',
                    selected
                      ? 'border-brand-800 bg-brand-800 text-white shadow-md shadow-brand-900/10'
                      : 'border-ink-200/80 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-bold sm:text-sm">{intent.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-2xs font-bold tabular-nums',
                        selected ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-600'
                      )}
                    >
                      {count}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'mt-1 text-2xs font-medium leading-normal',
                      selected ? 'text-white/80' : 'text-ink-500'
                    )}
                  >
                    {intent.note}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Dynamic Panel */}
          <div
            role="tabpanel"
            id={panelId(activeId)}
            aria-labelledby={tabId(activeId)}
            className="min-w-0"
          >
            {/* Filter Refiners Bar */}
            {hasRefiners ? (
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-ink-200/80 bg-white p-3.5 shadow-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-2xs font-bold tracking-wider text-ink-400 uppercase">
                    <SlidersHorizontal className="size-3.5" />
                    <span>Filters:</span>
                  </div>

                  {options.budgets.length > 0 ? (
                    <Refiner label="Budget">
                      <Chip pressed={budget === null} onClick={() => setBudget(null)}>
                        All
                      </Chip>
                      {options.budgets.map((cap) => (
                        <Chip
                          key={cap}
                          pressed={budget === cap}
                          onClick={() => setBudget(budget === cap ? null : cap)}
                        >
                          &lt; {capLabel(cap)}
                        </Chip>
                      ))}
                    </Refiner>
                  ) : null}

                  {options.durations.length > 0 ? (
                    <Refiner label="Duration">
                      <Chip pressed={duration === null} onClick={() => setDuration(null)}>
                        All
                      </Chip>
                      {options.durations.map((option) => (
                        <Chip
                          key={option.value}
                          pressed={duration === option.value}
                          onClick={() =>
                            setDuration(duration === option.value ? null : option.value)
                          }
                        >
                          {option.label}
                        </Chip>
                      ))}
                    </Refiner>
                  ) : null}

                  {options.modes.length > 0 ? (
                    <Refiner label="Mode">
                      <Chip pressed={mode === null} onClick={() => setMode(null)}>
                        All
                      </Chip>
                      {options.modes.map(([slug, name]) => (
                        <Chip
                          key={slug}
                          pressed={mode === slug}
                          onClick={() => setMode(mode === slug ? null : slug)}
                        >
                          {name}
                        </Chip>
                      ))}
                    </Refiner>
                  ) : null}
                </div>

                {filtered ? (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-xs font-bold text-brand-800 underline transition-colors hover:text-brand-600"
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Results count status */}
            <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
              <p aria-live="polite">
                {matched.length === 0 ? (
                  'No courses match these filters.'
                ) : (
                  <>
                    Showing <strong className="text-ink-900">{matched.length}</strong> course families
                    ({programCount} specializations)
                  </>
                )}
              </p>
              <span className="hidden items-center gap-1 text-2xs text-ink-500 sm:inline-flex">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>ICAR &amp; SAU Verified</span>
              </span>
            </div>

            {/* Cards Grid */}
            {visible.length > 0 ? (
              <ul aria-label="Courses" className="mt-3.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((course) => (
                  <li key={course.slug}>
                    <CourseCard
                      course={course}
                      derived={superlatives[course.slug] ?? null}
                      showTag={!uniformTag}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
                <p className="text-sm font-medium text-ink-600">
                  No courses match your selected budget or duration.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {matched.length > VISIBLE && !expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-5 w-full rounded-2xl border border-ink-200/80 bg-white py-3 text-xs font-bold text-brand-800 shadow-xs transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                Show all {matched.length} courses ({active.label})
              </button>
            ) : null}
          </div>
        </div>

        {/* Bottom Centered Action Link */}
        <div className="mt-8 flex justify-center lg:mt-10">
          <Link
            href="/programs"
            className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-200/90 bg-white px-6 py-2.5 text-xs font-semibold text-ink-800 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm"
          >
            <span>Explore All Programs</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Refiner({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="text-2xs font-bold text-ink-500">{label}:</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1">
        {children}
      </div>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'rounded-pill px-2.5 py-0.5 text-2xs font-semibold transition-all duration-150',
        pressed
          ? 'bg-brand-800 text-white shadow-xs'
          : 'bg-ink-100/80 text-ink-700 hover:bg-ink-200/80 hover:text-ink-900'
      )}
    >
      {children}
    </button>
  );
}

/**
 * High-converting CollegeVidya-Grade Course Card.
 */
function CourseCard({
  course,
  derived,
  showTag,
}: {
  course: FinderCourse;
  derived: string | null;
  showTag: boolean;
}) {
  const count = course.programs.length;
  const rawFee = lowestFee(course.programs);
  const from = formatFee(rawFee);
  const duration = typicalDuration(course.programs);
  const tag = showTag ? course.tag : null;
  const badge = tag ?? derived;

  // Use the published program fee without inventing an instalment plan.
  const displayFee = rawFee && rawFee > 0 ? rawFee : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover">
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Card Header: Icon + Category + Superlative Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-100 bg-brand-50/70 p-1.5 shadow-inner">
            {course.icon ? (
              <Image
                src={course.icon.src}
                alt=""
                width={course.icon.width ?? 40}
                height={course.icon.height ?? 40}
                className="size-full object-contain"
              />
            ) : (
              <GraduationCap className="size-6 text-brand-700" />
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-1">
            {badge ? (
              <Badge tone={tag ? 'gold' : 'brand'} className="shrink-0 text-2xs font-bold">
                {badge}
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-bold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                <CheckCircle2 className="size-2.5" />
                UGC Approved
              </span>
            )}
          </div>
        </div>

        {/* Stream & Level */}
        <div className="mt-3 flex items-center gap-1.5 text-2xs font-semibold text-brand-800 uppercase tracking-wide">
          <span>{course.streamName ?? ''}</span>
          {course.levelName ? (
            <>
              <span className="text-ink-300">•</span>
              <span className="text-ink-600">{course.levelName}</span>
            </>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mt-1 font-display text-base font-bold text-ink-900 transition-colors group-hover:text-brand-800 line-clamp-2">
          <Link href={`/${course.slug}`} className="before:absolute before:inset-0">
            {course.name}
          </Link>
        </h3>

        {/* Feature Specs: Duration, Mode, Offerings */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-y border-ink-100 py-2.5 text-2xs text-ink-600">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-ink-400" />
            <span>{duration ?? ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Laptop className="size-3.5 shrink-0 text-ink-400" />
            <span>{[...new Set(course.programs.map(program => program.modeName).filter(Boolean))].join(', ')}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 font-medium text-ink-700">
            <Building2 className="size-3.5 shrink-0 text-brand-700" />
            <span>
              <strong>{course.universityCount}</strong> Top Universities Offering
            </span>
          </div>
        </div>

        {/* Pricing & Semester Instalment Highlight */}
        <div className="mt-3 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xs font-medium text-ink-500">Starting Fee:</span>
            <span className="font-display text-sm font-extrabold text-ink-900">
              {from ? `from ${from}` : 'Check options'}
            </span>
          </div>
          {displayFee ? (
            <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-emerald-50/80 px-2.5 py-1 text-2xs font-bold text-emerald-900 ring-1 ring-emerald-400/30 ring-inset">
              <CreditCard className="size-3 shrink-0 text-emerald-700" />
              <span>Fee from ₹{displayFee.toLocaleString('en-IN')}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-xs font-semibold text-brand-800 transition-colors group-hover:bg-brand-50/70 sm:px-5">
        <span className="flex items-center gap-1 text-2xs font-bold text-ink-600">
          {count} Specialization{count > 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-brand-800">
          Explore
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
