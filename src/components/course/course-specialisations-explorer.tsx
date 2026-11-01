'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

import type { ProgramCard as ProgramCardType } from '@/lib/cms/repositories/program';
import { durationLabel } from '@/components/program/program-facts';
import { formatFee } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  courseName: string;
  courseSlug: string;
  programs: ProgramCardType[];
}

const CATEGORY_TAGS = [
  { id: 'all', label: 'All Specialisations' },
  { id: 'finance', label: 'Finance & Banking', keywords: ['finance', 'banking', 'fintech', 'accounting', 'acca', 'wealth', 'investment', 'tax'] },
  { id: 'marketing', label: 'Marketing & Digital', keywords: ['marketing', 'digital', 'sales', 'retail', 'e-commerce', 'brand', 'media'] },
  { id: 'analytics', label: 'Data & AI / Analytics', keywords: ['analytics', 'data', 'ai', 'machine learning', 'cloud', 'cyber', 'software', 'technology', 'it', 'artificial intelligence'] },
  { id: 'hr', label: 'HR & Leadership', keywords: ['hr', 'human resource', 'leadership', 'strategy', 'personnel', 'talent', 'management'] },
  { id: 'operations', label: 'Operations & Logistics', keywords: ['operation', 'logistics', 'supply chain', 'project', 'infrastructure', 'quality', 'production'] },
  { id: 'dual', label: 'Dual Specialisations', keywords: ['dual', 'and', '&'] },
];

function publishedFee(fee: unknown): number | null {
  if (typeof fee !== 'number' && typeof fee !== 'string') return null;
  if (typeof fee === 'string' && !fee.trim()) return null;
  const amount = Number(fee);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function matchesCategory(program: ProgramCardType, keywords: string[]): boolean {
  const words = `${program.name} ${program.full_name || ''}`.toLowerCase().split(/[^a-z0-9]+/).join(' ');
  return keywords.some((keyword) => {
    if (keyword === '&') return `${program.name} ${program.full_name || ''}`.includes('&');
    const normalized = keyword.replace(/[^a-z0-9]+/g, ' ').trim();
    return normalized.length <= 3
      ? ` ${words} `.includes(` ${normalized} `)
      : words.includes(normalized);
  });
}

export function CourseSpecialisationsExplorer({ courseName, programs }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'fee-asc' | 'fee-desc'>('default');
  const categories = CATEGORY_TAGS.filter((category) => {
    const keywords = category.keywords;
    return !keywords || programs.some((program) => matchesCategory(program, keywords));
  });
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('default');
  };

  const filtered = useMemo(() => {
    let result = [...programs];

    // 1. Text Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.full_name && p.full_name.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      const cat = CATEGORY_TAGS.find((c) => c.id === selectedCategory);
      if (cat && cat.keywords) {
        result = result.filter((program) => matchesCategory(program, cat.keywords));
      }
    }

    // 3. Sorting
    if (sortBy !== 'default') {
      result.sort((a, b) => {
        const first = publishedFee(a.fee);
        const second = publishedFee(b.fee);
        if (first === null) return second === null ? 0 : 1;
        if (second === null) return -1;
        return sortBy === 'fee-asc' ? first - second : second - first;
      });
    }

    return result;
  }, [programs, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Control Bar: Search Input + Category Chips + Sort */}
      <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <input
              type="search"
              aria-label={`Search ${courseName} specialisations`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${courseName} specialisations`}
              className="h-11 w-full rounded-xl border border-ink-200/90 bg-ink-50/50 pl-10 pr-4 text-base text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Sort:</span>
            <select
              aria-label="Sort programmes by published programme fee"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'fee-asc' | 'fee-desc')}
              className="h-11 max-w-full rounded-xl border border-ink-200/90 bg-white px-3 text-base text-ink-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none sm:text-sm"
            >
              <option value="default">Most Relevant</option>
              <option value="fee-asc">Fees: Low to High</option>
              <option value="fee-desc">Fees: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'min-h-11 shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                  isSelected
                    ? 'bg-brand-900 text-white shadow-xs'
                    : 'bg-ink-100/70 text-ink-700 hover:bg-ink-200/80 hover:text-ink-950'
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Result Counter & Active Filter Tags */}
        <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
          <p aria-live="polite">
            Showing <strong className="text-ink-900">{filtered.length}</strong> of{' '}
            <strong className="text-ink-900">{programs.length}</strong> specialisations
          </p>
          {(search || selectedCategory !== 'all' || sortBy !== 'default') && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-11 shrink-0 px-2 font-semibold text-brand-800 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Specialisations */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((prog) => {
            const fee = publishedFee(prog.fee);
            const duration = prog.duration_text?.trim()
              || (prog.duration !== null && Number.isFinite(Number(prog.duration)) && Number(prog.duration) > 0 ? durationLabel(prog) : '');
            const fullTitle =
              prog.full_name || (courseName ? `${courseName} in ${prog.name}` : prog.name);

            return (
              <div
                key={prog.documentId}
                className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-5 transition-colors hover:border-brand-400"
              >
                <div>
                  {/* Top Pill / Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-2xs font-extrabold text-brand-900 border border-brand-200/60">
                      {prog.stream?.name || courseName}
                    </span>
                    {prog.tag ? <span className="text-xs font-semibold text-brand-800">{prog.tag.name}</span> : null}
                  </div>

                  {/* Full Program Name with Degree */}
                  <h3 className="mt-3 font-display text-xl font-medium text-brand-800 leading-snug break-words transition-colors group-hover:text-brand-900">
                    <Link href={`/${prog.slug}`} className="before:absolute before:inset-0">
                      {fullTitle}
                    </Link>
                  </h3>
                  {prog.name && fullTitle !== prog.name ? (
                    <p className="mt-1 text-2xs font-medium text-ink-500">
                      Specialisation: <strong className="text-ink-700 font-semibold">{prog.name}</strong>
                    </p>
                  ) : null}

                  {/* Quick Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs text-ink-600 font-medium">
                    {duration ? <span className="inline-flex items-center gap-1 rounded-md bg-ink-100/70 px-2 py-1">
                      <Clock className="size-3 text-ink-500" />
                      {duration}
                    </span> : null}
                    {prog.course_mode ? <span className="inline-flex items-center gap-1 rounded-md bg-ink-100/70 px-2 py-1">
                      <GraduationCap className="size-3 text-ink-500" />
                      {prog.course_mode.name}
                    </span> : null}
                  </div>
                </div>

                {/* Fee & Action Footer */}
                <div className="mt-4 border-t border-ink-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xs font-bold text-ink-400 uppercase tracking-wider block">
                        Published programme fee
                      </span>
                      <span className="font-display text-sm font-black text-ink-950">
                        {fee !== null ? formatFee(fee) : 'On request'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-600">See programme details for university-specific fees and eligibility.</p>

                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-brand-800 group-hover:text-brand-950">
                    <span>{prog.view_button_text || 'View programme details'}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-ink-800">No specialisations match your filters.</p>
          <p className="mt-1 text-sm text-ink-600">Try another search or reset the filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
