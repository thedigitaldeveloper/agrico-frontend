'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { toCleanSectionSuffix } from '@/lib/cms/paths';
import type { ContentSectionRef } from '@/lib/cms/repositories/university';
import { cn } from '@/lib/cn';

/**
 * Tabs across a detail page. Each is a real route, so a section is linkable,
 * indexable and server-rendered rather than a client-side tab that search
 * engines never see.
 */
function getSectionOrderWeight(slug?: string | null, name?: string | null): number {
  const s = (slug || name || '').toLowerCase();
  if (s.includes('overview') || s.includes('about')) return 1;
  if (s.includes('course') || s.includes('fee')) return 2;
  if (s.includes('admission') || s.includes('eligib')) return 3;
  if (s.includes('curriculum') || s.includes('syllabus') || s.includes('subject')) return 4;
  if (s.includes('placement') || s.includes('career') || s.includes('salary')) return 5;
  if (s.includes('support') || s.includes('facil') || s.includes('infra')) return 6;
  if (s.includes('faq')) return 7;
  return 10;
}

function getDefaultBadge(): string | null {
  return null;
}

export function SectionNav({
  basePath,
  sections,
  activeSlug,
  counts,
  slugMode = 'path',
}: {
  /** e.g. "/university/punjab-agricultural-university" or "/bsc-agriculture" */
  basePath: string;
  sections: ContentSectionRef[];
  activeSlug: string | null;
  counts?: Record<string, string | number>;
  /**
   * 'path':   `${basePath}/${rawSlug}` (default, used for university sections)
   * 'hyphen': `${basePath}-${cleanSuffix}` (Shiksha-style, used for program & offering sections)
   */
  slugMode?: 'path' | 'hyphen';
}) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const ordered = [...sections].sort((a, b) => {
    const weightA = getSectionOrderWeight(a.secondary_slug || a.slug, a.display_name || a.name);
    const weightB = getSectionOrderWeight(b.secondary_slug || b.slug, b.display_name || b.name);
    if (weightA !== weightB) return weightA - weightB;
    return a.id - b.id;
  });

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [activeSlug]);

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (sections.length <= 1) return null;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-40 border-b border-ink-200/90 bg-white/95 shadow-2xs backdrop-blur-md lg:top-[4.5rem]"
    >
      <div className="container-page relative">
        {canScrollLeft ? (
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 flex w-12 items-center justify-start bg-gradient-to-r from-white via-white/90 to-transparent pl-1">
            <button
              type="button"
              onClick={() => scrollBy(-180)}
              aria-label="Scroll tabs left"
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-white text-ink-700 shadow-md ring-1 ring-ink-200 hover:bg-ink-50"
            >
              <ChevronLeft className="size-3.5 sm:size-4" />
            </button>
          </div>
        ) : null}

        <ul
          ref={scrollRef}
          className="-mb-px flex items-center gap-1 overflow-x-auto scrollbar-none scroll-smooth py-1"
        >
          {ordered.map((section, index) => {
            const rawSlug = section.secondary_slug || section.slug;
            const cleanSuffix = toCleanSectionSuffix(rawSlug);
            const isFirst = index === 0;
            const href = isFirst
              ? basePath
              : slugMode === 'hyphen'
                ? cleanSuffix === 'overview'
                  ? basePath
                  : `${basePath}-${cleanSuffix}`
                : `${basePath}/${rawSlug}`;
            const isActive =
              activeSlug === null
                ? isFirst
                : activeSlug === rawSlug ||
                  toCleanSectionSuffix(activeSlug) === cleanSuffix ||
                  (isFirst && (activeSlug === 'overview' || activeSlug === 'about'));

            const normalizedKey = (rawSlug || section.slug || section.name || '').toLowerCase();
            const badgeValue =
              counts?.[rawSlug] ??
              counts?.[section.slug] ??
              (counts
                ? Object.entries(counts).find(([k]) => normalizedKey.includes(k.toLowerCase()))?.[1]
                : null) ??
              getDefaultBadge();

            return (
              <li
                key={section.documentId}
                ref={isActive ? activeItemRef : null}
                className="shrink-0"
              >
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-all sm:px-4 sm:py-3 sm:text-sm',
                    isActive
                      ? 'border-brand-800 text-brand-900 font-semibold'
                      : 'border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-950'
                  )}
                >
                  <span className="whitespace-nowrap">
                    {section.display_name || section.name || rawSlug}
                  </span>

                  {badgeValue ? (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide transition-colors',
                        isActive
                          ? 'bg-brand-100 text-brand-900 ring-1 ring-brand-300'
                          : 'bg-ink-100/90 text-ink-600 group-hover:bg-ink-200 group-hover:text-ink-900'
                      )}
                    >
                      {badgeValue}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {canScrollRight ? (
          <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-10 flex w-12 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent pr-1">
            <button
              type="button"
              onClick={() => scrollBy(180)}
              aria-label="Scroll tabs right"
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-white text-ink-700 shadow-md ring-1 ring-ink-200 hover:bg-ink-50"
            >
              <ChevronRight className="size-3.5 sm:size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
