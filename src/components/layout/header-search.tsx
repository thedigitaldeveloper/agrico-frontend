'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Sparkles, TrendingUp, ArrowRight, Building2, GraduationCap } from 'lucide-react';

interface HeaderSearchProps {
  quickLinks?: Array<{ label: string; href: string }>;
}

const TRENDING_SEARCHES = [
  { label: 'Online MBA in Business Analytics', href: '/programs?course=mba&search=business-analytics' },
  { label: 'Online MCA in AI & Cloud', href: '/programs?course=mca&search=ai' },
  { label: 'Manipal University Online', href: '/university/manipal-university-online' },
  { label: 'Amity University Online', href: '/university/amity-university-online' },
  { label: 'UGC-DEB Govt Job Validity', href: '/articles/is-online-degree-valid-for-govt-jobs-wes-foreign-visas' },
  { label: 'Compare Online Universities', href: '/compare' },
];

export function HeaderSearch({ quickLinks }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuery('');
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* Mobile Icon Button (< sm) */}
      <button
        type="button"
        onClick={() => { setQuery(''); setOpen(true); }}
        aria-label="Search universities and programs"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink-200/90 bg-ink-50/80 text-ink-600 shadow-2xs transition-colors hover:border-brand-300 hover:bg-white hover:text-brand-900 sm:hidden"
      >
        <Search className="size-4" />
      </button>

      {/* Tablet & Desktop Search Trigger Pill (>= sm) */}
      <button
        type="button"
        onClick={() => { setQuery(''); setOpen(true); }}
        aria-label="Search universities and programs"
        className="group hidden h-9 shrink-0 items-center gap-2 rounded-full border border-ink-200/90 bg-ink-50/70 px-3 text-xs font-medium text-ink-500 shadow-2xs transition-all duration-200 hover:border-brand-300 hover:bg-white hover:text-ink-800 hover:shadow-xs sm:flex sm:w-36 lg:w-40 xl:h-10 xl:w-52 2xl:w-60"
      >
        <Search className="size-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-700" />
        <span className="truncate text-left">Search colleges, MBA...</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-ink-200 bg-white px-1.5 py-0.5 text-3xs font-semibold text-ink-400 shadow-3xs xl:inline-block">
          ⌘K
        </kbd>
      </button>

      {/* Full-Featured Search Dropdown Palette Modal */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-ink-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={() => setOpen(false)}
            />

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-ink-200/90 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Search Form Header */}
              <form onSubmit={handleSubmit} className="flex items-center border-b border-ink-100 px-5 py-4">
                <Search className="size-5 text-brand-700 shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 100+ colleges, Online MBA, MCA, AI Specializations..."
                  className="ml-3 h-9 w-full text-sm font-semibold text-ink-900 placeholder:text-ink-400 focus:outline-hidden"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mr-2 text-ink-400 hover:text-ink-700"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-ink-100 px-2 py-1 text-2xs font-bold text-ink-600 hover:bg-ink-200"
                >
                  ESC
                </button>
              </form>

              {/* Suggestions & Trending Queries */}
              <div className="max-h-[22rem] overflow-y-auto p-5 space-y-4 scrollbar-thin">
                <div>
                  <div className="flex items-center gap-1.5 text-2xs font-extrabold tracking-wider text-ink-400 uppercase">
                    <TrendingUp className="size-3 text-gold-500" />
                    <span>Trending Higher Education Searches</span>
                  </div>

                  <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {TRENDING_SEARCHES.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 p-2.5 text-xs font-semibold text-ink-800 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900"
                        >
                          <span className="truncate pr-1">{item.label}</span>
                          <ArrowRight className="size-3 text-ink-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Shortcuts */}
                <div className="border-t border-ink-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-2xs text-ink-500">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/universities"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1 font-bold text-brand-800 hover:underline"
                    >
                      <Building2 className="size-3" />
                      <span>All Universities</span>
                    </Link>
                    <Link
                      href="/programs"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1 font-bold text-brand-800 hover:underline"
                    >
                      <GraduationCap className="size-3" />
                      <span>All Programs</span>
                    </Link>
                    <Link
                      href="/compare"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1 font-bold text-brand-800 hover:underline"
                    >
                      <Sparkles className="size-3 text-gold-500" />
                      <span>Compare Colleges</span>
                    </Link>
                  </div>

                  <span>Press <strong>Enter</strong> to search</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
