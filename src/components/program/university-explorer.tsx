'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';

import { MAX_COMPARE } from '@/components/compare/limits';
import { offeringFee, offeringsByUniversity } from '@/components/program/program-facts';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { resolveThumbnail } from '@/lib/cms/media';
import type { ProgramOffering } from '@/lib/cms/repositories/program';
import { formatFee } from '@/lib/format';
import type { UniversityCard as University } from '@/lib/cms/repositories/university';
import { cn } from '@/lib/cn';

type Sort = 'recommended' | 'fee' | 'rating' | 'name';
type View = 'cards' | 'table';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'fee', label: 'Lowest fee' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'A to Z' },
];

/**
 * The universities that offer a program, as something you can actually decide
 * between.
 *
 * The aggregators this replaces put a "Compare" button on every card that
 * navigates away, so picking three universities costs three page loads and a
 * lot of back-button. Selection happens here instead: tick up to three, and a
 * tray at the bottom carries them to /compare in one go.
 *
 * Sorting and the table view are client state and stay client state — they
 * reorder a list the server already sent whole, so putting them in the URL
 * would cost a round trip to change a column order.
 */
export function UniversityExplorer({
  universities,
  offerings,
  programName,
  programSlug,
}: {
  universities: University[];
  /**
   * What each university charges. Separate from the list on purpose: a
   * university that an editor has linked but not yet priced still belongs on
   * the page, without a fee, rather than disappearing from it.
   */
  offerings: ProgramOffering[];
  programName: string;
  programSlug: string;
}) {
  const [sort, setSort] = useState<Sort>('recommended');
  const [view, setView] = useState<View>('cards');
  const [selected, setSelected] = useState<string[]>([]);

  const byUniversity = useMemo(() => offeringsByUniversity(offerings), [offerings]);
  const hasFees = byUniversity.size > 0;

  const ordered = useMemo(
    () => sortUniversities(universities, sort, byUniversity),
    [universities, sort, byUniversity]
  );
  const isFull = selected.length >= MAX_COMPARE;

  const toggle = (slug: string) => {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length >= MAX_COMPARE
          ? current
          : [...current, slug]
    );
  };

  return (
    // The tray is fixed over the foot of the page, so the list has to give it
    // room — otherwise the last university is the one you can never read.
    <div className={cn('rs-pd-explorer', selected.length > 0 && 'pb-24')}>
      <div className="rs-pd-explorer-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{universities.length}</span>{' '}
          {universities.length === 1 ? 'university offers' : 'universities offer'} {programName}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <span className="sr-only sm:not-sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="h-9 rounded-lg border border-ink-300 bg-white px-2.5 text-sm font-semibold text-ink-900"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div
            role="group"
            aria-label="Layout"
            className="flex rounded-lg border border-ink-300 bg-white p-0.5"
          >
            {(['cards', 'table'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors',
                  view === option
                    ? 'bg-brand-800 text-white'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'cards' ? (
        <ul aria-label={`Universities offering ${programName}`} className="rs-pd-university-grid grid gap-4 lg:gap-5">
          {ordered.map((university) => (
            <li key={university.documentId}>
              <UniversityRow
                university={university}
                offering={byUniversity.get(university.slug)}
                programSlug={programSlug}
                checked={selected.includes(university.slug)}
                disabled={isFull && !selected.includes(university.slug)}
                onToggle={() => toggle(university.slug)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <UniversityTable
          universities={ordered}
          byUniversity={byUniversity}
          hasFees={hasFees}
          programName={programName}
          programSlug={programSlug}
          selected={selected}
          isFull={isFull}
          onToggle={toggle}
        />
      )}

      <CompareTray
        selected={selected}
        universities={universities}
        onRemove={toggle}
        onClear={() => setSelected([])}
      />
    </div>
  );
}

/** Nulls sort last in every mode — an unrated university is not a zero-star one. */
function sortUniversities(
  universities: University[],
  sort: Sort,
  byUniversity: Map<string, ProgramOffering>
): University[] {
  const copy = [...universities];

  if (sort === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));

  if (sort === 'fee') {
    // Unpriced last rather than free: a university an editor has not got to yet
    // must not be the cheapest thing on the page.
    const fee = (university: University) =>
      offeringFee(byUniversity.get(university.slug)) ?? Number.MAX_SAFE_INTEGER;
    return copy.sort((a, b) => fee(a) - fee(b) || a.name.localeCompare(b.name));
  }

  if (sort === 'rating') {
    return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name));
  }

  return copy.sort(
    (a, b) =>
      (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name)
  );
}

/**
 * One university, as a wide row rather than a grid tile.
 *
 * A grid of three narrow cards asks the reader to compare across columns and
 * down rows at once; a stack of rows puts every rating and every approval list
 * in one vertical line, which is the comparison they are actually making.
 */
function UniversityRow({
  university,
  offering,
  programSlug,
  checked,
  disabled,
  onToggle,
}: {
  university: University;
  offering: ProgramOffering | undefined;
  programSlug: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const href = `/university/${university.slug}`;
  const offeringHref = `/offering/${encodeURIComponent(university.slug)}/${encodeURIComponent(programSlug)}`;
  const applyHref = `/common-application-form?${new URLSearchParams({ university: university.slug, program: programSlug })}`;
  const rawFee = offeringFee(offering);
  const netLabel = formatFee(rawFee);
  // Only when a waiver actually moves the number: struck-through text that
  // matches the price beside it reads as a rendering bug, not a discount.
  const grossLabel =
    offering?.subsidy_amount && offering.subsidy_amount > 0 ? formatFee(offering.fee) : null;
  const logo = resolveThumbnail(university.logo, 96, university.name);
  const location = [university.city, university.state].filter(Boolean).join(', ');

  return (
    <article
      className={cn(
        'rs-pd-university-row group relative flex flex-col gap-4 rounded-2xl border bg-white p-4.5 transition-all duration-200 lg:flex-row lg:items-center lg:gap-6 lg:p-5',
        checked
          ? 'border-brand-400 shadow-card-hover ring-1 ring-brand-200'
          : 'border-ink-200/90 shadow-xs hover:border-brand-300 hover:shadow-card-hover'
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4.5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-2 shadow-2xs transition-transform duration-200 group-hover:scale-102 sm:size-18">
          {logo ? (
            <Image
              src={logo.src}
              alt={logo.alt || `${university.name} Logo`}
              width={logo.width ?? 72}
              height={logo.height ?? 72}
              className="size-full object-contain"
            />
          ) : (
            <span className="font-display text-2xl font-bold text-brand-800">
              {university.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base leading-snug font-bold text-ink-900 lg:text-lg">
              <Link href={href} className="hover:text-brand-800 transition-colors">
                {university.name}
              </Link>
            </h3>
            {university.tag ? <Badge tone="gold">{university.tag.name}</Badge> : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs sm:text-sm text-ink-500">
            {location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-ink-400 shrink-0" />
                <span>{location}</span>
              </span>
            ) : null}
            {university.establish ? <span>Est. {university.establish.slice(0, 4)}</span> : null}
            {university.rating ? <RatingStars value={university.rating} /> : null}
          </div>

          {university.approvals.length > 0 || university.ownership_type ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {university.ownership_type ? (
                <Badge tone="brand">{university.ownership_type.name}</Badge>
              ) : null}
              {university.approvals.slice(0, 4).map((approval) => (
                <Badge key={approval.documentId}>{approval.name}</Badge>
              ))}
              {university.rankings.slice(0, 1).map((ranking) => (
                <Badge key={ranking.documentId} tone="info">
                  {ranking.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rs-pd-university-actions flex shrink-0 flex-col gap-2.5 border-t border-ink-100 pt-3.5 lg:w-44 lg:border-t-0 lg:pt-0">
        {netLabel ? (
          <div className="lg:text-right">
            <p className="text-2xs font-semibold tracking-[0.08em] text-ink-500 uppercase">
              Published programme fee
            </p>
            <p className="mt-0.5 font-display text-lg sm:text-xl leading-none font-extrabold text-ink-900">
              {netLabel}
            </p>
            {grossLabel ? (
              <p className="mt-1 text-xs text-ink-500">
                <s>{grossLabel}</s>{' '}
                <span className="font-semibold text-success-700">waiver applied</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {university.show_apply_button ? (
          <ButtonLink
            href={applyHref}
            size="sm"
            className="relative z-10 w-full"
          >
            {university.apply_button_text || 'Apply Now'}
          </ButtonLink>
        ) : null}
        <ButtonLink href={offeringHref} variant="outline" size="sm" className="relative z-10 w-full">
          View programme details
        </ButtonLink>
        <CompareCheckbox
          checked={checked}
          disabled={disabled}
          onToggle={onToggle}
          name={university.name}
        />
      </div>
    </article>
  );
}

function CompareCheckbox({
  checked,
  disabled,
  onToggle,
  name,
  className,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  name: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'relative z-10 inline-flex items-center gap-2 text-sm font-semibold select-none',
        disabled ? 'cursor-not-allowed text-ink-400' : 'cursor-pointer text-ink-700',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="size-4 rounded border-ink-300 accent-brand-800"
      />
      <span>
        Compare
        <span className="sr-only"> {name}</span>
      </span>
    </label>
  );
}

/** The same rows as a table, for reading one attribute straight down a column. */
function UniversityTable({
  universities,
  byUniversity,
  hasFees,
  programName,
  programSlug,
  selected,
  isFull,
  onToggle,
}: {
  universities: University[];
  byUniversity: Map<string, ProgramOffering>;
  /** Drops the column entirely rather than printing a dash down every row. */
  hasFees: boolean;
  programName: string;
  programSlug: string;
  selected: string[];
  isFull: boolean;
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
      <table
        className={cn('w-full border-collapse text-sm', hasFees ? 'min-w-[54rem]' : 'min-w-[46rem]')}
      >
        <caption className="sr-only">Universities offering {programName}</caption>
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 text-left">
            <Th className="w-[28%]">University</Th>
            {hasFees ? <Th>Programme fee</Th> : null}
            <Th>Rating</Th>
            <Th>Approvals</Th>
            <Th>Established</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {universities.map((university) => {
            const checked = selected.includes(university.slug);
            const location = [university.city, university.state].filter(Boolean).join(', ');

            return (
              <tr
                key={university.documentId}
                className={cn('border-b border-ink-100 last:border-0', checked && 'bg-brand-50/60')}
              >
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/university/${university.slug}`}
                    className="font-semibold text-ink-900 hover:text-brand-800"
                  >
                    {university.name}
                  </Link>
                  {location ? <p className="mt-0.5 text-xs text-ink-500">{location}</p> : null}
                  <CompareCheckbox
                    checked={checked}
                    disabled={isFull && !checked}
                    onToggle={() => onToggle(university.slug)}
                    name={university.name}
                    className="mt-2 text-xs"
                  />
                </td>
                {hasFees ? (
                  <td className="px-4 py-4 align-top">
                    <FeeCell offering={byUniversity.get(university.slug)} />
                  </td>
                ) : null}
                <td className="px-4 py-4 align-top">
                  {university.rating ? (
                    <RatingStars value={university.rating} />
                  ) : (
                    <span className="text-ink-400">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-1">
                    {university.approvals.length > 0 ? (
                      university.approvals.map((approval) => (
                        <Badge key={approval.documentId}>{approval.name}</Badge>
                      ))
                    ) : (
                      <span className="text-ink-400">&mdash;</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-ink-700">
                  {university.establish?.slice(0, 4) ?? '—'}
                </td>
                <td className="px-4 py-4 text-right align-top">
                  <ButtonLink
                    href={
                      university.show_apply_button
                        ? `/common-application-form?${new URLSearchParams({ university: university.slug, program: programSlug })}`
                        : `/offering/${encodeURIComponent(university.slug)}/${encodeURIComponent(programSlug)}`
                    }
                    size="sm"
                    variant={university.show_apply_button ? 'primary' : 'outline'}
                  >
                    {university.show_apply_button
                      ? university.apply_button_text || 'Apply'
                      : 'View'}
                  </ButtonLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** One fee, tabular so the column reads as a column. */
function FeeCell({ offering }: { offering: ProgramOffering | undefined }) {
  const netLabel = formatFee(offeringFee(offering));
  if (!netLabel) return <span className="text-ink-400">&mdash;</span>;

  const grossLabel =
    offering?.subsidy_amount && offering.subsidy_amount > 0 ? formatFee(offering.fee) : null;

  return (
    <div className="tabular-nums">
      <span className="font-display font-bold text-ink-900">{netLabel}</span>
      {grossLabel ? <s className="ml-1.5 text-xs text-ink-500">{grossLabel}</s> : null}
    </div>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-2xs font-bold tracking-[0.08em] text-ink-500 uppercase',
        className
      )}
    >
      {children}
    </th>
  );
}

/**
 * The selection tray.
 *
 * Fixed to the viewport rather than sticky inside the section: the point at
 * which you have forgotten which two you already ticked is exactly the point at
 * which a tray anchored to the list has scrolled away.
 *
 * Mounted only while something is selected, rather than parked off screen under
 * a transform. An always-mounted tray has to be pulled out of the tab order and
 * hidden from assistive tech by hand, and it strands itself off screen for good
 * anywhere the transition does not run — which is most headless renderers, and
 * any browser that decides to throttle the tab.
 *
 * The count lives in a separate live region that is always in the DOM, because
 * a live region inserted at the same moment as its own text is announced
 * inconsistently across screen readers.
 */
function CompareTray({
  selected,
  universities,
  onRemove,
  onClear,
}: {
  selected: string[];
  universities: University[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  const chosen = selected
    .map((slug) => universities.find((university) => university.slug === slug))
    .filter((university): university is University => Boolean(university));

  const href = useMemo(() => {
    const params = new URLSearchParams();
    for (const university of chosen) params.append('u', university.slug);
    return `/compare?${params.toString()}`;
  }, [chosen]);

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {chosen.length === 0
          ? 'No universities selected for comparison.'
          : `${chosen.length} of ${MAX_COMPARE} universities selected for comparison.`}
      </p>

      {chosen.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40">
          <div className="border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgb(43_12_19/0.12)] backdrop-blur">
            <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink-900">
                  {chosen.length} of {MAX_COMPARE} selected
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {chosen.map((university) => (
                    <li key={university.documentId}>
                      <button
                        type="button"
                        onClick={() => onRemove(university.slug)}
                        className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-pill bg-ink-100 py-1 pr-2 pl-3 text-xs font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                      >
                        <span className="truncate">{university.name}</span>
                        <span aria-hidden="true" className="text-base leading-none">
                          &times;
                        </span>
                        <span className="sr-only">Remove from comparison</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  className="px-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
                >
                  Clear
                </button>
                <ButtonLink href={href}>
                  Compare {chosen.length > 1 ? `${chosen.length} universities` : 'university'}
                  <span aria-hidden="true">&rarr;</span>
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
