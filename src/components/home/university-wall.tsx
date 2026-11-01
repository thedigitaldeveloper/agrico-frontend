'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { UniversityTile } from '@/components/university/university-tile';
import { cn } from '@/lib/cn';
import type { UniversityCard as University } from '@/lib/cms/repositories/university';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';

/**
 * The universities showcase wall — high visual recognition of top accredited institutions.
 */
export function UniversityWall({
  universities,
  config,
}: {
  universities: University[];
  config?: SectionHeaderConfig | null;
}) {
  const displayUniversities = universities ?? [];
  const sliderRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll & overflow state
  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 8;
    setHasOverflow(overflow);
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [displayUniversities.length]);

  // Auto-slide on mobile and desktop when overflowing
  useEffect(() => {
    if (displayUniversities.length <= 1 || isPaused || !hasOverflow) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      if (el.scrollWidth > el.clientWidth + 8) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 12) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
          setActiveIndex(0);
        } else {
          el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' });
        }
      }
    }, 3600);

    return () => clearInterval(timer);
  }, [displayUniversities.length, isPaused, hasOverflow]);

  // Sync activeIndex on manual scroll
  const handleScroll = () => {
    updateScrollState();
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

  const scrollPrev = () => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: -(el.clientWidth * 0.75), behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' });
  };

  if (displayUniversities.length === 0) return null;

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description =
    config?.description ?? '';
  const badges = config?.badges || [];
  const ctaLabel = config?.ctaLabel ?? '';
  const ctaLink = config?.ctaLink ?? '';

  return (
    <section className="relative border-y border-ink-200/60 bg-gradient-to-b from-white via-ink-50/30 to-white py-6 sm:py-8 lg:py-12">
      <div className="container-page">
        {/* Compact Centered Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          {/* Subtle Ambient Radial Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-brand-50/70 blur-2xl -z-10"
          />

          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <Building2 className="size-2.5 text-brand-700 sm:size-3" />
              {eyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-brand-300 to-brand-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}

          {/* Micro-Trust Highlights (Horizontal Compact Chips) */}
          {badges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-ink-600 sm:mt-3 sm:gap-2 sm:text-2xs">
              {badges.map((badge, idx) => {
                const dotColor =
                  idx % 3 === 0
                    ? 'bg-emerald-500 text-emerald-800'
                    : idx % 3 === 1
                      ? 'bg-brand-600 text-brand-800'
                      : 'bg-gold-500 text-gold-800';
                return (
                  <span
                    key={badge}
                    className={`inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white px-2 py-0.5 shadow-2xs sm:px-2.5 sm:py-1 ${dotColor.split(' ')[1]}`}
                  >
                    <span className={`size-1.5 rounded-full ${dotColor.split(' ')[0]}`} />
                    {badge}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* University Wall Carousel Track with Auto-Slide & Desktop Arrows */}
        <div
          className="relative mt-4 sm:mt-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Desktop Left / Right Navigation Arrows (Visible only when slides overflow) */}
          {hasOverflow ? (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                aria-label="Previous universities"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex size-10 items-center justify-center rounded-full border border-ink-200/90 bg-white/95 text-ink-800 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 hover:border-brand-400 hover:text-brand-800 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollRight}
                aria-label="Next universities"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex size-10 items-center justify-center rounded-full border border-ink-200/90 bg-white/95 text-ink-800 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 hover:border-brand-400 hover:text-brand-800 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}

          <ul
            ref={sliderRef}
            onScroll={handleScroll}
            aria-label="Universities"
            className="scrollbar-none -mx-4 flex items-stretch gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:gap-4 sm:px-0 sm:pb-0"
          >
            {displayUniversities.map((university) => (
              <li
                key={university.documentId}
                className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] xl:w-[calc(25%-0.75rem)] sm:max-w-none h-full flex"
              >
                <UniversityTile university={university} />
              </li>
            ))}
          </ul>

          {/* Slide Dots Indicator */}
          {hasOverflow && displayUniversities.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {displayUniversities.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to university ${idx + 1}`}
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

        {/* Centered Bottom Action Link */}
        <div className="mt-8 flex justify-center lg:mt-10">
          {ctaLink && ctaLabel ? <Link
            href={ctaLink}
            className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-200/90 bg-white px-6 py-2.5 text-xs font-semibold text-ink-800 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link> : null}
        </div>
      </div>
    </section>
  );
}

