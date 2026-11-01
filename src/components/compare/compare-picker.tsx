'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Plus,
  ArrowRightLeft,
  Building2,
  MapPin,
  Sparkles,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface PickerOption {
  slug: string;
  name: string;
  location: string;
}

/** Long enough to browse, short enough that the card never becomes the page. */
const VISIBLE = 8;

const POPULAR_SLUGS = [
  'manipal-university-jaipur-online',
  'amity-university-online',
  'chandigarh-university-online',
  'dr-dy-patil-vidyapeeth-online',
  'sikkim-manipal-university-online',
];

/**
 * Adds and removes universities from the comparison with rich search,
 * quick-add chips, and interactive slot management.
 */
export function ComparePicker({
  options,
  selected,
  chosen,
  max,
}: {
  options: PickerOption[];
  selected: string[];
  /** Resolved names for the current selection — the page has them already. */
  chosen: { slug: string; name: string }[];
  max: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const search = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const picked = new Set(selected);
    const needle = query.trim().toLowerCase();
    return options
      .filter((option) => !picked.has(option.slug))
      .filter(
        (option) =>
          !needle ||
          option.name.toLowerCase().includes(needle) ||
          option.location.toLowerCase().includes(needle)
      );
  }, [options, selected, query]);

  const quickPicks = useMemo(() => {
    const picked = new Set(selected);
    return options.filter(
      (opt) =>
        !picked.has(opt.slug) &&
        POPULAR_SLUGS.some((p) => opt.slug.includes(p) || p.includes(opt.slug))
    );
  }, [options, selected]);

  const visible = matches.slice(0, VISIBLE);
  const isFull = selected.length >= max;

  const add = (slug: string) => {
    if (isFull) return;
    const next = new URLSearchParams(searchParams);
    next.append('u', slug);
    setQuery('');
    router.push(`/compare?${next.toString()}`, { scroll: false });
    search.current?.focus();
  };

  const removeAll = () => {
    router.push('/compare', { scroll: false });
  };

  return (
    <div className="rounded-2xl border border-ink-200/90 bg-white p-4.5 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-200/80">
            <ArrowRightLeft className="size-4" />
          </div>
          <div>
            <h2 className="font-display text-sm font-extrabold tracking-tight text-ink-900 uppercase">
              Compare List
            </h2>
            <p className="text-3xs font-medium text-ink-500">Side-by-side evaluation</p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-extrabold',
            isFull
              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-300'
              : 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80'
          )}
        >
          {selected.length} / {max} Picked
        </span>
      </div>

      {/* Selected Slots List */}
      <div className="mt-3.5 space-y-2">
        {Array.from({ length: max }).map((_, index) => {
          const item = chosen[index];
          if (item) {
            return (
              <div
                key={item.slug}
                className="group relative flex items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50/40 p-2.5 transition-colors hover:border-brand-300 hover:bg-brand-50/70"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-3xs font-black text-white">
                    #{index + 1}
                  </span>
                  <span className="truncate text-xs font-bold text-ink-900">
                    {item.name}
                  </span>
                </div>
                <RemoveButton slug={item.slug} label={item.name} />
              </div>
            );
          }

          return (
            <button
              key={`empty-${index}`}
              type="button"
              onClick={() => search.current?.focus()}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-ink-300/80 bg-ink-50/40 px-3 py-2.5 text-left text-xs font-medium text-ink-500 transition-colors hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-800"
            >
              <span className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg border border-dashed border-ink-300 bg-white text-3xs font-bold text-ink-400">
                  {index + 1}
                </span>
                <span>+ Add University {index + 1}</span>
              </span>
              <Plus className="size-3.5 text-ink-400" />
            </button>
          );
        })}
      </div>

      {chosen.length > 0 ? (
        <div className="mt-2.5 flex items-center justify-between px-1 text-2xs">
          <span className="text-ink-500">
            {isFull ? 'Limit reached (3 max)' : `${max - selected.length} slots remaining`}
          </span>
          <button
            type="button"
            onClick={removeAll}
            className="inline-flex items-center gap-1 font-bold text-danger-700 hover:text-danger-800 transition-colors"
          >
            <Trash2 className="size-3" />
            <span>Clear All</span>
          </button>
        </div>
      ) : null}

      {/* Search Input Box */}
      <div className="mt-4 border-t border-ink-100 pt-3.5">
        <label
          htmlFor="compare-search"
          className="mb-1.5 flex items-center justify-between text-2xs font-bold text-ink-700 uppercase tracking-wide"
        >
          <span>Find University</span>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-3xs font-semibold text-ink-400 hover:text-ink-700"
            >
              Clear search
            </button>
          ) : null}
        </label>

        <div className="relative">
          <input
            id="compare-search"
            ref={search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            aria-describedby={isFull ? 'compare-limit' : undefined}
            placeholder="Type university name or city…"
            disabled={isFull}
            className="w-full rounded-xl border border-ink-300 bg-white py-2 pr-8 pl-8 text-xs font-medium text-ink-900 transition-colors placeholder:text-ink-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:opacity-60"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 size-3.5 text-ink-400" />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        {isFull ? (
          <p id="compare-limit" className="mt-1.5 text-3xs font-semibold text-amber-700">
            3 universities chosen. Remove one above to select another.
          </p>
        ) : null}

        {/* Quick Picks / Suggestions */}
        {!query && quickPicks.length > 0 && !isFull ? (
          <div className="mt-3">
            <div className="flex items-center gap-1 text-3xs font-bold text-ink-400 uppercase tracking-wider">
              <Sparkles className="size-2.5 text-gold-500" />
              <span>Popular Picks:</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quickPicks.slice(0, 4).map((pick) => (
                <button
                  key={pick.slug}
                  type="button"
                  onClick={() => add(pick.slug)}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200/90 bg-ink-50/70 px-2 py-0.5 text-3xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  <Plus className="size-2.5 text-ink-400" />
                  <span className="truncate max-w-[120px]">{pick.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Search Results List */}
        <div aria-live="polite">
          <p className="sr-only">
            {matches.length === 1 ? '1 university matches' : `${matches.length} universities match`}
          </p>

          {query && visible.length > 0 ? (
            <ul className="mt-2.5 max-h-56 overflow-y-auto space-y-1 rounded-xl border border-ink-100 bg-ink-50/50 p-1.5 scrollbar-none">
              {visible.map((option) => (
                <li key={option.slug}>
                  <button
                    type="button"
                    onClick={() => add(option.slug)}
                    disabled={isFull}
                    className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-left text-xs font-semibold text-ink-800 shadow-2xs transition-colors hover:bg-brand-50 hover:text-brand-900 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{option.name}</p>
                      {option.location ? (
                        <p className="flex items-center gap-1 text-3xs font-normal text-ink-500">
                          <MapPin className="size-2.5 shrink-0 text-ink-400" />
                          <span className="truncate">{option.location}</span>
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-3xs font-extrabold text-brand-800 ring-1 ring-brand-200/80">
                      <Plus className="size-2.5" />
                      Add
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {query && matches.length > visible.length ? (
            <p className="mt-1.5 px-1 text-3xs text-ink-500">
              Showing {visible.length} of {matches.length} matches — keep typing to narrow.
            </p>
          ) : null}

          {query && matches.length === 0 ? (
            <p className="mt-2.5 rounded-lg bg-ink-50 p-2.5 text-center text-xs text-ink-500">
              No matching universities found for “{query}”.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Removes one university, keeping the rest of the query intact. */
export function RemoveButton({ slug, label }: { slug: string; label: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const remove = () => {
    const kept = searchParams.getAll('u').filter((value) => value !== slug);
    const next = new URLSearchParams();
    for (const value of kept) next.append('u', value);
    const query = next.toString();
    router.push(query ? `/compare?${query}` : '/compare', { scroll: false });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={remove}
      aria-label={`Remove ${label} from comparison`}
      className="size-6 shrink-0 rounded-full text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-700"
    >
      <X className="size-3.5" />
    </Button>
  );
}
