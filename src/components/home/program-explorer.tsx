'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ProgramItem {
  id: string;
  /** Read from the program's course, which is where the CMS records the level. */
  levelSlug: string | null;
  levelName: string | null;
  streamSlug: string | null;
  streamName: string | null;
  /** Rendered on the server and passed through; the cards are not client code. */
  node: ReactNode;
}

/** More than this stops being a sample of the catalogue and becomes a listing. */
const LIMIT = 6;

/**
 * Builds a filter row's options from the items themselves.
 *
 * Nothing is offered that would return an empty grid the moment it is clicked,
 * and the order is the catalogue's own — the CMS sorts programs by an editorial
 * position, so first appearance is the order an editor chose.
 */
function optionsFrom(
  items: ProgramItem[],
  slug: (item: ProgramItem) => string | null,
  name: (item: ProgramItem) => string | null
): [string, string][] {
  const options = new Map<string, string>();
  for (const item of items) {
    const key = slug(item);
    const label = name(item);
    if (key && label) options.set(key, label);
  }
  return [...options];
}

export function ProgramExplorer({ items }: { items: ProgramItem[] }) {
  const [level, setLevel] = useState<string | null>(null);
  const [stream, setStream] = useState<string | null>(null);

  const sliderRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);



  const levels = optionsFrom(
    items,
    (item) => item.levelSlug,
    (item) => item.levelName
  );

  const byLevel = items.filter((item) => !level || item.levelSlug === level);
  // Streams come from what is on the chosen level, so the second row never
  // offers a combination that has nothing in it.
  const streams = optionsFrom(
    byLevel,
    (item) => item.streamSlug,
    (item) => item.streamName
  );

  const matched = byLevel.filter((item) => !stream || item.streamSlug === stream);
  const visible = matched.slice(0, LIMIT);

  // Auto-slide on mobile for program cards
  useEffect(() => {
    if (visible.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      if (el.scrollWidth > el.clientWidth) {
        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % visible.length;
          const card = el.children[nextIndex] as HTMLElement;
          if (card) {
            el.scrollTo({
              left: card.offsetLeft - el.offsetLeft,
              behavior: 'smooth',
            });
          }
          return nextIndex;
        });
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [visible.length, isPaused]);

  if (items.length === 0) return null;

  // Sync activeIndex on manual scroll
  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el || el.children.length === 0) return;
    const scrollLeft = el.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    Array.from(el.children).forEach((child, idx) => {
      const card = child as HTMLElement;
      const diff = Math.abs(card.offsetLeft - el.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveIndex(closestIndex);
  };

  // Both facets exist on /programs, so the link carries whatever is selected
  // and the listing opens already narrowed.
  const query = new URLSearchParams();
  if (level) query.set('level', level);
  if (stream) query.set('stream', stream);
  const listingHref = query.size > 0 ? `/programs?${query}` : '/programs';

  return (
    <section className="py-6 sm:py-8 lg:py-12">
      <div className="container-page">
        {/* Centered Section Header */}
        <div className="mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            Programs by level and stream
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
            Narrow to what you are actually eligible for, then compare fees, duration and mode
            across the ones that are left.
          </p>
        </div>

        {/* Level Filters - Horizontally Scrollable on Mobile */}
        {levels.length > 0 ? (
          <div className="scrollbar-none -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Level">
            <LevelButton pressed={level === null} onClick={() => setLevel(null)}>
              All levels
            </LevelButton>
            {levels.map(([slug, name]) => (
              <LevelButton
                key={slug}
                pressed={level === slug}
                onClick={() => {
                  setLevel(slug);
                  setStream(null);
                }}
              >
                {name}
              </LevelButton>
            ))}
          </div>
        ) : null}

        {/* Stream Filters - Horizontally Scrollable on Mobile */}
        {streams.length > 0 ? (
          <div
            className="scrollbar-none -mx-4 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-3 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0"
            role="group"
            aria-label="Stream"
          >
            <StreamChip pressed={stream === null} onClick={() => setStream(null)}>
              All streams
            </StreamChip>
            {streams.map(([slug, name]) => (
              <StreamChip
                key={slug}
                pressed={stream === slug}
                onClick={() => setStream(slug)}
              >
                {name}
              </StreamChip>
            ))}
          </div>
        ) : null}

        {/* Results Count */}
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500 sm:mt-4">
          <p aria-live="polite">
            {matched.length === 0
              ? 'No programs match this combination.'
              : `Showing ${visible.length} of ${matched.length} programs`}
          </p>
          <span className="text-[11px] text-ink-400 sm:hidden">👈 Swipe cards 👉</span>
        </div>

        {visible.length > 0 ? (
          <div
            className="relative mt-3 sm:mt-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <ul
              ref={sliderRef}
              onScroll={handleScroll}
              aria-label="Programs"
              className="scrollbar-none -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((item) => (
                <li
                  key={item.id}
                  className="w-[82vw] max-w-[300px] shrink-0 snap-center sm:w-auto sm:max-w-none h-full"
                >
                  {item.node}
                </li>
              ))}
            </ul>

            {/* Mobile Auto-Slide Dots Indicator */}
            {visible.length > 1 ? (
              <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:hidden">
                {visible.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to program ${idx + 1}`}
                    onClick={() => {
                      const el = sliderRef.current;
                      if (!el) return;
                      const card = el.children[idx] as HTMLElement;
                      if (card) {
                        el.scrollTo({
                          left: card.offsetLeft - el.offsetLeft,
                          behavior: 'smooth',
                        });
                      }
                      setActiveIndex(idx);
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      activeIndex === idx
                        ? 'w-6 bg-brand-700'
                        : 'w-1.5 bg-ink-200 hover:bg-ink-400'
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-card border border-dashed border-ink-300 p-8 text-center">
            <p className="text-xs sm:text-sm text-ink-600">Nothing here yet.</p>
            <button
              type="button"
              onClick={() => {
                setLevel(null);
                setStream(null);
              }}
              className="mt-2.5 text-xs sm:text-sm font-semibold text-brand-800 hover:text-brand-600"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Bottom Centered Action Link */}
        <div className="mt-8 flex justify-center lg:mt-10">
          <Link
            href={listingHref}
            className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-200/90 bg-white px-6 py-2.5 text-xs font-semibold text-ink-800 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm"
          >
            <span>All Programs</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LevelButton({
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
      className="shrink-0 rounded-pill border border-ink-300 bg-white px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-ink-700 shadow-2xs transition-colors hover:border-brand-300 hover:text-brand-800 aria-pressed:border-brand-800 aria-pressed:bg-brand-800 aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

function StreamChip({
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
      className="shrink-0 rounded-pill px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 aria-pressed:bg-brand-50 aria-pressed:font-semibold aria-pressed:text-brand-800"
    >
      {children}
    </button>
  );
}
